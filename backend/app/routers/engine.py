import os

from fastapi import APIRouter, Depends, HTTPException, status
from httpx import HTTPError

from app.dependencies import get_current_user
from app.engine.orchestrator import EngineOrchestrator
from app.engine.policy import AGENTS
from app.engine.provider import AIProviderNotConfigured, OpenAIProvider
from app.engine.schemas import EngineRunRequest, EngineRunResponse
from app.models import User


router = APIRouter(prefix="/engine", tags=["VEZTEMAD AI Engine"])


@router.get("/status")
def engine_status(current_user: User = Depends(get_current_user)):
    provider = OpenAIProvider()
    return {
        "engine": "VEZTEMAD CORE",
        "status": "api_ready",
        "ai_provider": "configured" if provider.configured else "not_configured",
        "provider_mode": provider.auth_mode,
        "model": provider.model,
        "agents": [agent["name"] for agent in AGENTS],
        "agent_count": len(AGENTS),
        "execution_policy": "proposal_only_user_approval_required_for_external_actions",
        "capabilities": {
            "requirements_analysis": True,
            "architecture_and_code_proposals": True,
            "qa_and_security_review": True,
            "project_manifest_generation": True,
            "persistent_project_storage": True,
            "direct_file_writes": False,
            "isolated_code_execution": False,
            "automatic_testing_and_repair": False,
            "gpu_resource_provisioning": False,
            "automatic_deployment": False,
            "android_builds": False,
        },
    }


@router.post("/run", response_model=EngineRunResponse)
async def run_engine(
    request: EngineRunRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        return await EngineOrchestrator().run(request)
    except AIProviderNotConfigured as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Le fournisseur IA est momentanément indisponible.",
        ) from exc
    except (KeyError, IndexError, TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Réponse invalide reçue du fournisseur IA.",
        ) from exc
