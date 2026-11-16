import os

import httpx

from app.engine.policy import SYSTEM_BOUNDARIES


class AIProviderNotConfigured(RuntimeError):
    pass


class OpenAIProvider:
    """OpenAI Chat Completions adapter; secrets are read only from environment."""

    def __init__(self) -> None:
        self.api_key = os.getenv("OPENAI_API_KEY", "").strip()
        self.model = os.getenv("VEZTEMAD_AI_MODEL", "gpt-4.1-mini").strip()
        self.base_url = os.getenv(
            "VEZTEMAD_AI_BASE_URL", "https://api.openai.com/v1"
        ).rstrip("/")

    async def complete(self, *, role: str, objective: str, context: str) -> str:
        if not self.api_key:
            raise AIProviderNotConfigured(
                "Le moteur IA n'est pas encore connecté : OPENAI_API_KEY est absent."
            )

        payload = {
            "model": self.model,
            "temperature": 0.2,
            "messages": [
                {"role": "system", "content": SYSTEM_BOUNDARIES},
                {
                    "role": "user",
                    "content": (
                        f"Agent: {role}\\nMission: {objective}\\n"
                        f"Project request and previous context:\\n{context}\\n"
                        "Respond in the requested language. Be precise and label assumptions."
                    ),
                },
            ],
        }
        headers = {"Authorization": f"Bearer {self.api_key}"}
        async with httpx.AsyncClient(timeout=httpx.Timeout(90.0, connect=15.0)) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                json=payload,
                headers=headers,
            )
            response.raise_for_status()
            data = response.json()
        return data["choices"][0]["message"]["content"]
