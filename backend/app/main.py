

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app import models
from app.routers.auth import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="VEZTEMAD API",
    description=(
        "Plateforme intelligente de WEMAD "
        "pour la création et le développement d'applications."
    ),
    version=settings.VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)


@app.get("/")
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "company": settings.COMPANY_NAME,
        "status": "online",
        "version": settings.VERSION,
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "VEZTEMAD API",
    }
