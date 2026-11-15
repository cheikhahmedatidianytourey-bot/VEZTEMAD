
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="VEZTEMAD API",
    description=(
        "Plateforme intelligente de WEMAD "
        "pour la création et le développement d'applications."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "name": "VEZTEMAD",
        "company": "WEMAD",
        "status": "online",
        "message": "Bienvenue sur l'API VEZTEMAD.",
        "version": "1.0.0",
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "VEZTEMAD API",
    }
