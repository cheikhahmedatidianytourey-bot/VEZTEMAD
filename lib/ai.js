const { randomUUID } = require("crypto");
const db = require("./database");

async function generateApplicationPlan({ userId, projectId, prompt }) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    const error = new Error("Le moteur IA n'est pas encore configuré. Ajoutez AI_API_KEY dans les variables secrètes de l'hébergement.");
    error.code = "AI_NOT_CONFIGURED";
    throw error;
  }
  const endpoint = process.env.AI_API_URL || "https://api.openai.com/v1/chat/completions";
  const model = process.env.AI_MODEL || "gpt-4o-mini";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Authorization": "Bearer " + apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are VEZTEMAD, a senior software product architect. Return valid JSON only with keys: project_summary, target_users, features (array), screens (array), data_model (array), architecture, security (array), implementation_steps (array), risks (array). Do not claim code has been built. Be precise and realistic." },
        { role: "user", content: prompt }
      ]
    }),
    signal: AbortSignal.timeout(45000)
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    const error = new Error("Le fournisseur IA a refusé la demande (" + response.status + ").");
    error.code = "AI_PROVIDER_ERROR";
    error.status = response.status >= 500 ? 502 : 400;
    error.detail = detail;
    throw error;
  }
  const payload = await response.json();
  const raw = payload.choices && payload.choices[0] && payload.choices[0].message && payload.choices[0].message.content;
  if (!raw) throw new Error("Réponse IA vide ou incompatible.");
  let result;
  try { result = JSON.parse(raw); } catch (_error) { throw new Error("Le fournisseur IA a renvoyé un format non JSON."); }
  await db.query(
    "INSERT INTO ai_generations (id, user_id, project_id, prompt, result, provider) VALUES ($1,$2,$3,$4,$5,$6)",
    [randomUUID(), userId, projectId || null, prompt, JSON.stringify(result), process.env.AI_PROVIDER || "openai-compatible"]
  );
  return result;
}
module.exports = { generateApplicationPlan };
