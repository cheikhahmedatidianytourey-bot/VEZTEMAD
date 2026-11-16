from fastapi import APIRouter, Depends, HTTPException, status
from httpx import HTTPError

from app.dependencies import get_current_user
from app.engine.orchestrator import EngineOrchestrator
from app.engine.provider import AIProviderNotConfigured
from app.engine.schemas import EngineRunRequest, EngineRunResponse
from app.models import User


router = APIRouter(prefix="/engine", tags=["VEZTEMAD AI Engine"])


@router.get("/status")
def engine_status(current_user: User = Depends(get_current_user)):
    return {
        "engine": "VEZTEMAD CORE",
        "status": "api_ready",
        "ai_provider": "configured" if __import__("os").getenv("OPENAI_API_KEY") else "not_configured",
        "agents": ["AI ARCHITECT", "AI DEVELOPER", "AI QA", "AI SECURITY"],
        "execution_policy": "proposal_only_no_external_side_effects",
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
