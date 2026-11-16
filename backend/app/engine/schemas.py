from typing import Literal

from pydantic import BaseModel, Field


class EngineRunRequest(BaseModel):
    goal: str = Field(min_length=10, max_length=12000)
    language: str = Field(default="fr", min_length=2, max_length=20)
    detail_level: Literal["standard", "advanced", "expert"] = "advanced"


class AgentStage(BaseModel):
    agent: str
    objective: str
    output: str


class EngineRunResponse(BaseModel):
    engine: str = "VEZTEMAD CORE"
    status: Literal["completed"]
    stages: list[AgentStage]
    final_result: str
