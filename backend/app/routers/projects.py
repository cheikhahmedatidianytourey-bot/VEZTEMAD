from pathlib import PurePosixPath
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.engine.provider import AIProviderNotConfigured, OpenAIProvider
from app.models import Project, User


router = APIRouter(prefix="/projects", tags=["Project Generation"])


class ProjectGenerateRequest(BaseModel):
    goal: str = Field(min_length=10, max_length=12000)
    language: str = Field(default="fr", min_length=2, max_length=20)
    detail_level: Literal["standard", "advanced", "expert"] = "advanced"


class GeneratedFile(BaseModel):
    path: str
    content: str


class ProjectRead(BaseModel):
    id: int
    name: str
    description: str
    stack: list[str]
    files: list[GeneratedFile]
    status: str
    created_at: str


def _validate_manifest(data: dict) -> dict:
    name = data.get("name")
    description = data.get("description")
    stack = data.get("stack", [])
    files = data.get("files")

    if not isinstance(name, str) or not name.strip() or len(name) > 160:
        raise ValueError("Nom de projet absent ou invalide.")
    if not isinstance(description, str) or len(description) > 12000:
        raise ValueError("Description du projet absente ou trop longue.")
    if not isinstance(stack, list) or len(stack) > 20 or not all(isinstance(x, str) for x in stack):
        raise ValueError("Stack technique invalide.")
    if not isinstance(files, list) or not 1 <= len(files) <= 25:
        raise ValueError("Le manifeste doit contenir entre 1 et 25 fichiers.")

    clean_files = []
    total_bytes = 0
    seen_paths = set()
    for item in files:
        if not isinstance(item, dict):
            raise ValueError("Entrée de fichier invalide.")
        path, content = item.get("path"), item.get("content")
        if not isinstance(path, str) or not isinstance(content, str):
            raise ValueError("Chaque fichier doit avoir un chemin et un contenu texte.")
        parsed = PurePosixPath(path)
        if parsed.is_absolute() or not parsed.parts or any(part in {"", ".", ".."} for part in parsed.parts):
            raise ValueError("Chemin de fichier non autorisé.")
        if "\\" in path or len(path) > 240 or path in seen_paths:
            raise ValueError("Chemin de fichier invalide ou dupliqué.")
        if len(content.encode("utf-8")) > 60000:
            raise ValueError("Un fichier dépasse la taille maximale autorisée.")
        total_bytes += len(content.encode("utf-8"))
        if total_bytes > 300000:
            raise ValueError("Le projet dépasse la taille maximale autorisée.")
        seen_paths.add(path)
        clean_files.append({"path": path, "content": content})

    return {
        "name": name.strip(),
        "description": description.strip(),
        "stack": stack,
        "files": clean_files,
    }


def _serialize(project: Project) -> dict:
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "stack": project.stack,
        "files": project.files,
        "status": project.status,
        "created_at": project.created_at.isoformat(),
    }


@router.post("/generate", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
async def generate_project(
    request: ProjectGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        manifest = await OpenAIProvider().generate_project(
            goal=request.goal,
            language=request.language,
            detail_level=request.detail_level,
        )
        clean = _validate_manifest(manifest)
    except AIProviderNotConfigured as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    project = Project(owner_id=current_user.id, **clean, status="draft_generated")
    db.add(project)
    db.commit()
    db.refresh(project)
    return _serialize(project)


@router.get("", response_model=list[ProjectRead])
def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    projects = db.scalars(
        select(Project).where(Project.owner_id == current_user.id).order_by(Project.created_at.desc())
    ).all()
    return [_serialize(project) for project in projects]


@router.get("/{project_id}", response_model=ProjectRead)
def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.scalar(
        select(Project).where(Project.id == project_id, Project.owner_id == current_user.id)
    )
    if project is None:
        raise HTTPException(status_code=404, detail="Projet introuvable.")
    return _serialize(project)
