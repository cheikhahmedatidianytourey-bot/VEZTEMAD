from app.engine.policy import AGENTS
from app.engine.provider import OpenAIProvider
from app.engine.schemas import AgentStage, EngineRunRequest, EngineRunResponse


class EngineOrchestrator:
    """Coordinates specialist agents in a controlled, sequential pipeline."""

    def __init__(self, provider: OpenAIProvider | None = None) -> None:
        self.provider = provider or OpenAIProvider()

    async def run(self, request: EngineRunRequest) -> EngineRunResponse:
        context = (
            f"Language: {request.language}\n"
            f"Detail level: {request.detail_level}\n"
            f"User goal: {request.goal}"
        )
        stages: list[AgentStage] = []

        for agent in AGENTS:
            output = await self.provider.complete(
                role=agent["name"],
                objective=agent["objective"],
                context=context,
            )
            stages.append(
                AgentStage(
                    agent=agent["name"],
                    objective=agent["objective"],
                    output=output,
                )
            )
            context += f"\n\n{agent['name']} output:\n{output}"

        return EngineRunResponse(
            status="completed",
            stages=stages,
            final_result=stages[-1].output,
        )
