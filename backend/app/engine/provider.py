import json
import os
from urllib.parse import urlparse

import httpx

from app.engine.policy import SYSTEM_BOUNDARIES


class AIProviderNotConfigured(RuntimeError):
    pass


class OpenAIProvider:
    """Vendor-neutral adapter for OpenAI-compatible hosted or self-hosted inference."""

    def __init__(self) -> None:
        self.api_key = os.getenv("VEZTEMAD_AI_API_KEY", os.getenv("OPENAI_API_KEY", "")).strip()
        self.model = os.getenv("VEZTEMAD_AI_MODEL", os.getenv("AI_MODEL", "gpt-4.1-mini")).strip()
        self.base_url = os.getenv(
            "VEZTEMAD_AI_BASE_URL",
            os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
        ).strip().rstrip("/")
        self.auth_mode = os.getenv("VEZTEMAD_AI_AUTH_MODE", "bearer").strip().lower()
        self.allow_private_http = os.getenv("VEZTEMAD_AI_ALLOW_PRIVATE_HTTP", "false").lower() == "true"

        parsed = urlparse(self.base_url)
        valid_https = parsed.scheme == "https" and bool(parsed.netloc)
        valid_private_http = (
            parsed.scheme == "http"
            and bool(parsed.hostname)
            and (parsed.hostname.endswith(".internal") or parsed.hostname in {"localhost", "127.0.0.1"})
            and self.allow_private_http
        )
        if not (valid_https or valid_private_http) or parsed.username or parsed.password or parsed.fragment:
            raise ValueError("VEZTEMAD_AI_BASE_URL doit être HTTPS, ou HTTP explicitement autorisé sur un hôte privé.")
        if self.auth_mode not in {"bearer", "none"}:
            raise ValueError("VEZTEMAD_AI_AUTH_MODE doit être 'bearer' ou 'none'.")
        if not self.model:
            raise ValueError("VEZTEMAD_AI_MODEL ne peut pas être vide.")

    @property
    def configured(self) -> bool:
        return self.auth_mode == "none" or bool(self.api_key)

    def _headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.auth_mode == "bearer":
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    def _endpoint(self) -> str:
        return self.base_url if self.base_url.endswith("/chat/completions") else f"{self.base_url}/chat/completions"

    async def complete(self, *, role: str, objective: str, context: str) -> str:
        if not self.configured:
            raise AIProviderNotConfigured(
                "Le moteur IA n'est pas configuré : définissez VEZTEMAD_AI_API_KEY, "
                "ou configurez un endpoint privé avec VEZTEMAD_AI_AUTH_MODE=none."
            )

        payload = {
            "model": self.model,
            "temperature": 0.2,
            "messages": [
                {"role": "system", "content": SYSTEM_BOUNDARIES},
                {
                    "role": "user",
                    "content": (
                        f"Agent: {role}\nMission: {objective}\n"
                        f"Demande et contexte du projet:\n{context}\n"
                        "Réponds dans la langue demandée. Sois concret. "
                        "Distingue les faits, hypothèses, propositions et éléments non vérifiés."
                    ),
                },
            ],
        }
        async with httpx.AsyncClient(timeout=httpx.Timeout(90.0, connect=15.0)) as client:
            response = await client.post(self._endpoint(), json=payload, headers=self._headers())
            response.raise_for_status()
            data = response.json()

        content = data["choices"][0]["message"]["content"]
        if not isinstance(content, str) or not content.strip():
            raise ValueError("Réponse vide ou invalide du fournisseur IA.")
        return content.strip()

    async def generate_project(self, *, goal: str, language: str, detail_level: str) -> dict:
        """Generate a bounded project manifest. Files are stored as drafts, never executed here."""
        if not self.configured:
            raise AIProviderNotConfigured(
                "Le moteur IA n'est pas configuré : ajoutez VEZTEMAD_AI_API_KEY ou un endpoint privé."
            )

        system = (
            SYSTEM_BOUNDARIES
            + "\n\nTu es le générateur de projets logiciels de VEZTEMAD. "
            "Retourne uniquement un objet JSON valide avec les clés name, description, stack, files. "
            "files est une liste d'objets path/content. Génère une première version cohérente et exécutable "
            "pour le périmètre demandé, avec README et instructions. N'inclus aucun secret, jeton, mot de passe "
            "ou valeur d'environnement réelle. N'affirme pas que le projet a été exécuté ou testé. "
            "Limite la réponse à 25 fichiers utiles et à des fichiers de taille raisonnable."
        )
        user = (
            f"Langue: {language}\nNiveau de détail: {detail_level}\n"
            f"Demande de l'utilisateur: {goal}\n"
            "Conçois le périmètre minimum complet. Pour chaque fichier, donne son chemin relatif et son contenu intégral."
        )
        payload = {
            "model": self.model,
            "temperature": 0.15,
            "max_tokens": 8000,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        }
        async with httpx.AsyncClient(timeout=httpx.Timeout(120.0, connect=15.0)) as client:
            response = await client.post(self._endpoint(), json=payload, headers=self._headers())
            response.raise_for_status()
            data = response.json()

        raw = data["choices"][0]["message"]["content"]
        if not isinstance(raw, str) or not raw.strip():
            raise ValueError("Le fournisseur IA a retourné un manifeste vide.")
        try:
            result = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise ValueError("Le fournisseur IA n'a pas retourné un JSON valide.") from exc
        if not isinstance(result, dict):
            raise ValueError("Le manifeste du projet doit être un objet JSON.")
        return result
