

import os


class Settings:
    PROJECT_NAME = "VEZTEMAD"
    COMPANY_NAME = "WEMAD"
    VERSION = "1.0.0"

    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "sqlite:///./veztemad.db",
    )

    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "development-only-secret-key-change-before-production",
    )

    JWT_ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30

    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://localhost:5173",
        ).split(",")
        if origin.strip()
    ]


settings = Settings()

if (
    settings.ENVIRONMENT == "production"
    and (
        len(settings.SECRET_KEY) < 32
        or settings.SECRET_KEY.startswith("development-only")
    )
):
    raise RuntimeError(
        "Configurez une SECRET_KEY sécurisée dans l'environnement."
    )
