"use strict";

const agents = [
  { id: "titan-architect", name: "TITAN ARCHITECT", domain: "architecture", purpose: "Translate product goals into a coherent technical architecture.", permissions: ["read_requirements", "propose_architecture"] },
  { id: "titan-coder", name: "TITAN CODER", domain: "implementation", purpose: "Produce implementation changes inside an explicitly authorized workspace.", permissions: ["read_plan", "propose_code"] },
  { id: "titan-reasoner", name: "TITAN REASONER", domain: "reasoning", purpose: "Decompose complex goals, identify assumptions and compare approaches.", permissions: ["read_requirements", "propose_decisions"] },
  { id: "titan-security", name: "TITAN SECURITY", domain: "security", purpose: "Identify threats, unsafe data flows and least-privilege requirements.", permissions: ["read_plan", "report_risks"] },
  { id: "titan-tester", name: "TITAN TESTER", domain: "quality", purpose: "Define and evaluate verifiable acceptance checks.", permissions: ["read_plan", "propose_tests", "report_results"] },
  { id: "titan-repair", name: "TITAN REPAIR", domain: "maintenance", purpose: "Propose bounded fixes for confirmed defects.", permissions: ["read_findings", "propose_fixes"] },
  { id: "titan-optimizer", name: "TITAN OPTIMIZER", domain: "performance", purpose: "Identify measurable performance and resource improvements.", permissions: ["read_plan", "propose_optimizations"] },
  { id: "titan-ui", name: "TITAN UI", domain: "experience", purpose: "Design accessible, consistent user experiences.", permissions: ["read_requirements", "propose_interfaces"] },
  { id: "titan-mobile", name: "TITAN MOBILE", domain: "mobile", purpose: "Plan mobile application structure and delivery requirements.", permissions: ["read_plan", "propose_mobile_design"] },
  { id: "titan-auditor", name: "TITAN AUDITOR", domain: "independent_review", purpose: "Challenge assumptions and verify evidence before a result is accepted.", permissions: ["read_workflow", "report_findings"] }
];

const registry = Object.freeze(agents.map(agent => Object.freeze({
  ...agent,
  permissions: Object.freeze([...agent.permissions])
})));

function getAgent(id) {
  return registry.find(agent => agent.id === id) || null;
}

module.exports = { registry, getAgent };
