"use strict";

/**
 * Provider-agnostic adapter for OpenAI-compatible chat-completions APIs.
 * Secrets are read from the environment by default and are never included
 * in thrown error messages or returned metadata.
 */
function createProviderAdapter(options = {}) {
  const apiKey = options.apiKey === undefined ? process.env.AI_API_KEY : options.apiKey;
  const endpoint = options.endpoint || process.env.AI_API_URL || "https://api.openai.com/v1/chat/completions";
  const model = options.model || process.env.AI_MODEL || "gpt-4o-mini";
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const timeoutMs = options.timeoutMs === undefined ? 45000 : options.timeoutMs;
  const maxRetries = options.maxRetries === undefined ? 1 : options.maxRetries;
  const retryDelayMs = options.retryDelayMs === undefined ? 250 : options.retryDelayMs;

  if (typeof fetchImpl !== "function") throw new TypeError("A fetch implementation is required.");
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1) throw new TypeError("timeoutMs must be a positive integer.");
  if (!Number.isInteger(maxRetries) || maxRetries < 0 || maxRetries > 3) {
    throw new TypeError("maxRetries must be an integer between 0 and 3.");
  }

  async function complete({ messages, temperature = 0.2, responseFormat } = {}) {
    if (!apiKey || typeof apiKey !== "string") {
      const error = new Error("Le fournisseur IA n'est pas configuré. Définissez AI_API_KEY.");
      error.code = "AI_NOT_CONFIGURED";
      throw error;
    }
    if (typeof endpoint !== "string" || !/^https:\/\//i.test(endpoint)) {
      const error = new Error("L'adresse du fournisseur IA doit utiliser HTTPS.");
      error.code = "AI_INVALID_ENDPOINT";
      throw error;
    }
    if (!Array.isArray(messages) || messages.length === 0 ||
        messages.some(message => !message || !["system", "user", "assistant"].includes(message.role) ||
          typeof message.content !== "string" || message.content.length === 0)) {
      const error = new Error("Les messages transmis au fournisseur IA sont invalides.");
      error.code = "AI_INVALID_MESSAGES";
      throw error;
    }
    if (typeof temperature !== "number" || temperature < 0 || temperature > 2) {
      const error = new Error("La température doit être comprise entre 0 et 2.");
      error.code = "AI_INVALID_TEMPERATURE";
      throw error;
    }

    const body = { model, messages, temperature };
    if (responseFormat) body.response_format = responseFormat;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      let response;
      try {
        response = await fetchImpl(endpoint, {
          method: "POST",
          headers: {
            Authorization: "Bearer " + apiKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(timeoutMs)
        });
      } catch (cause) {
        const error = new Error(cause && cause.name === "TimeoutError"
          ? "Le fournisseur IA a dépassé le délai autorisé."
          : "Impossible de joindre le fournisseur IA.");
        error.code = cause && cause.name === "TimeoutError" ? "AI_TIMEOUT" : "AI_NETWORK_ERROR";
        error.retryable = true;
        lastError = error;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelayMs));
          continue;
        }
        throw error;
      }

      if (response.ok) {
        let payload;
        try {
          payload = await response.json();
        } catch (_error) {
          const error = new Error("Le fournisseur IA a renvoyé une réponse JSON invalide.");
          error.code = "AI_INVALID_RESPONSE";
          throw error;
        }
        const content = payload && payload.choices && payload.choices[0] &&
          payload.choices[0].message && payload.choices[0].message.content;
        if (typeof content !== "string" || content.trim().length === 0) {
          const error = new Error("Le fournisseur IA a renvoyé une réponse vide ou incompatible.");
          error.code = "AI_EMPTY_RESPONSE";
          throw error;
        }
        return { content, model: payload.model || model, usage: payload.usage || null };
      }

      const retryable = response.status === 429 || response.status >= 500;
      const error = new Error("Le fournisseur IA a répondu avec le statut " + response.status + ".");
      error.code = "AI_PROVIDER_ERROR";
      error.status = response.status;
      error.retryable = retryable;
      lastError = error;
      if (!retryable || attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, retryDelayMs));
    }

    throw lastError;
  }

  return Object.freeze({ complete });
}

module.exports = { createProviderAdapter };
