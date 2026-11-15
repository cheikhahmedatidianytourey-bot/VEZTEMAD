# VEZTEMAD Intelligence Core

## The product thesis

VEZTEMAD must become more than a chat interface connected to a third-party model. Its long-term defensible value should come from a proprietary engineering system: structured project memory, a compiler for software blueprints, dependency-aware execution, adversarial review, reproducible quality gates, and accumulated evaluation data.

## Implemented first kernel (0.1.0)

The current code introduces a two-pass AI workflow:
1. **Requirements analyst** turns the user's idea into a structured product specification.
2. **Adversarial architect** critiques and improves the draft for contradictions, security gaps and missing acceptance criteria.
3. **Blueprint compiler** converts the reviewed result into a canonical, versioned structure with features, screens, data entities, ordered implementation tasks, risks and quality warnings.
4. **Deterministic quality gate** scores specification completeness and reports blockers and warnings before the blueprint is stored. This is a planning-readiness check, not proof of working software.
5. **Persistence** stores the resulting blueprint in the user's AI generation history.

The compiler is deterministic code owned by VEZTEMAD; the language model remains a configurable external provider. This is an initial kernel, not a claim that VEZTEMAD has trained its own foundation model.

## Why this can become defensible

- **Canonical engineering representation:** every app idea becomes a versioned blueprint rather than an ephemeral chat transcript.
- **Execution graph:** requirements become ordered tasks with explicit dependencies and acceptance criteria.
- **Adversarial quality loop:** a separate review pass searches for missing requirements and design weaknesses.
- **Evaluation flywheel:** future build/test outcomes can be compared against blueprint predictions and used to improve planning.
- **Portable provider layer:** models can be replaced or combined without losing VEZTEMAD's project intelligence and structured history.

## Strategic moat roadmap

1. Build isolated code-generation and build workers that execute one task at a time from the graph.
2. Capture test results, build failures, fixes and user acceptance as structured feedback.
3. Develop a private benchmark suite of realistic app-building challenges and score completeness, correctness, security, cost and time.
4. Use model routing and specialist agents only where measured improvements justify their cost.
5. Create reusable, permissioned project memory and domain-specific engineering playbooks.
6. Protect original compiler logic, evaluation methods, orchestration software and brand through appropriate IP, contracts and security practices.

## Non-negotiable trust rules

Generated output is untrusted. Never execute it in the web server process. Future build agents must run in short-lived isolated workers with resource limits, no production secrets, restricted network access and auditable permissions. Deployment, publication, billing and destructive operations require explicit user approval.

## Honest capability boundary

The current Intelligence Core generates and reviews structured specifications and applies deterministic completeness gates. It does not yet generate a complete application, run code, repair builds or deploy projects. The external model provider still performs language reasoning. The proprietary compiler and workflow are a foundation for a future defensible product, not proof of an uncopyable AI.
