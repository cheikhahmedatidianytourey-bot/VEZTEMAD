import os
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.engine.policy import AGENTS, SYSTEM_BOUNDARIES
from app.engine.provider import OpenAIProvider


class AgentRegistryTests(unittest.TestCase):
    def test_all_specialist_roles_are_registered(self):
        names = {agent["name"] for agent in AGENTS}
        self.assertGreaterEqual(len(AGENTS), 10)
        for expected in (
            "AI PRODUCT STRATEGIST",
            "AI ARCHITECT",
            "AI UX/UI DESIGNER",
            "AI DEVELOPER",
            "AI DATA & AI ENGINEER",
            "AI QA & TEST ENGINEER",
            "AI SECURITY ENGINEER",
            "AI DEVOPS & CLOUD ENGINEER",
            "AI CUSTOMER SUCCESS",
            "AI FINANCE ANALYST",
            "AI GROWTH & MARKETING",
            "AI RELEASE MANAGER",
        ):
            self.assertIn(expected, names)

    def test_policy_blocks_unapproved_external_actions(self):
        self.assertIn("without a separate explicit user approval", SYSTEM_BOUNDARIES)
        self.assertIn("Finance and marketing agents provide analysis and drafts only", SYSTEM_BOUNDARIES)

    def test_provider_supports_keyless_private_endpoint(self):
        env = {
            "VEZTEMAD_AI_API_KEY": "",
            "OPENAI_API_KEY": "",
            "VEZTEMAD_AI_BASE_URL": "http://inference.internal:11434/v1",
            "VEZTEMAD_AI_AUTH_MODE": "none",
            "VEZTEMAD_AI_ALLOW_PRIVATE_HTTP": "true",
            "VEZTEMAD_AI_MODEL": "local-model",
        }
        with patch.dict(os.environ, env, clear=False):
            provider = OpenAIProvider()
            self.assertTrue(provider.configured)
            self.assertEqual(provider.auth_mode, "none")
            self.assertEqual(provider.model, "local-model")

    def test_provider_rejects_public_http_endpoint(self):
        env = {
            "VEZTEMAD_AI_API_KEY": "test",
            "OPENAI_API_KEY": "",
            "VEZTEMAD_AI_BASE_URL": "http://public.example/v1",
            "VEZTEMAD_AI_AUTH_MODE": "bearer",
            "VEZTEMAD_AI_ALLOW_PRIVATE_HTTP": "true",
        }
        with patch.dict(os.environ, env, clear=False):
            with self.assertRaises(ValueError):
                OpenAIProvider()


if __name__ == "__main__":
    unittest.main()
