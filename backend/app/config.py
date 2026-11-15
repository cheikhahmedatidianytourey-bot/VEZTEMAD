
import os


class Settings:
    PROJECT_NAME: str = "VEZTEMAD"
    COMPANY_NAME: str = "WEMAD"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./veztemad.db",
    )

    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "CHANGE_THIS_SECRET_KEY_IN_PRODUCTION",
    )


settings = Settings()
