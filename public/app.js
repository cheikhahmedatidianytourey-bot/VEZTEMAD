const $ = selector => document.querySelector(selector);
const statusNode = $("#service-status");
const authForm = $("#auth-form");
const authMessage = $("#auth-message");
const projectForm = $("#project-form");
const projectMessage = $("#form-message");
const projectList = $("#project-list");
const aiForm = $("#ai-form");
const countNode = $("#project-count");
let authMode = "register";
let currentUser = null;

async function request(url, options = {}) {
  const response = await fetch(url, { credentials: "same-origin", headers: { "Content-Type": "application/json", ...(options.headers || {}) }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Une erreur est survenue.");
  return data;
}
function setAuthMode(mode) {
  authMode = mode;
  $("#auth-name-wrap").hidden = mode !== "register";
  $("#auth-name").required = mode === "register";
  $("#auth-password").autocomplete = mode === "register" ? "new-password" : "current-password";
  $("#auth-title").textContent = mode === "register" ? "Créer votre compte" : "Heureux de vous revoir";
  $("#auth-submit").innerHTML = mode === "register" ? "Créer mon compte <span>↗</span>" : "Me connecter <span>↗</span>";
  document.querySelectorAll(".auth-tab").forEach(tab => tab.classList.toggle("active", tab.dataset.mode === mode));
  authMessage.textContent = "";
}
function renderProjects(projects) {
  countNode.textContent = projects.length + (projects.length > 1 ? " projets" : " projet");
  if (!projects.length) {
    projectList.innerHTML = '<p class="empty-state">Aucun projet pour le moment. Créez votre premier espace.</p>';
    return;
  }
  projectList.replaceChildren(...projects.map(project => {
    const article = document.createElement("article");
    article.className = "project-item";
    const title = document.createElement("strong");
    title.textContent = project.name;
    const description = document.createElement("p");
    description.textContent = project.description || "Aucune description fournie.";
    const status = document.createElement("small");
    status.textContent = "● " + (project.status || "draft") + " · " + new Date(project.createdAt).toLocaleString("fr-FR");
    article.append(title, description, status);
    return article;
  }));
}
async function loadProjects() {
  const data = await request("/api/projects");
  renderProjects(data.projects || []);
}
function showUser(user) {
  currentUser = user;
  $("#auth-forms").hidden = Boolean(user);
  $("#signed-in").hidden = !user;
  $("#auth-state").textContent = user ? "Connecté" : "Non connecté";
  projectForm.hidden = !user;
  $("#ai-panel").hidden = !user;
  if (user) {
    $("#welcome-message").textContent = "Bienvenue, " + user.name + ". Votre espace personnel est prêt.";
    loadProjects().catch(error => { projectMessage.textContent = error.message; });
  } else {
    projectList.innerHTML = '<p class="empty-state">Connectez-vous pour afficher vos projets.</p>';
    countNode.textContent = "Privé";
  }
}
async function initialize() {
  $("#year").textContent = new Date().getFullYear();
  try {
    const health = await request("/api/health");
    statusNode.textContent = health.status === "ok" ? "Service opérationnel · v" + health.version : "Service disponible · configuration requise";
  } catch (_error) {
    statusNode.textContent = "Service temporairement indisponible";
  }
  try {
    const data = await request("/api/auth/me");
    showUser(data.user);
  } catch (_error) {
    showUser(null);
  }
}
document.querySelectorAll(".auth-tab").forEach(tab => tab.addEventListener("click", () => setAuthMode(tab.dataset.mode)));
authForm.addEventListener("submit", async event => {
  event.preventDefault();
  const button = $("#auth-submit");
  button.disabled = true;
  authMessage.textContent = authMode === "register" ? "Création du compte…" : "Connexion…";
  try {
    const body = { email: $("#auth-email").value, password: $("#auth-password").value };
    if (authMode === "register") body.name = $("#auth-name").value;
    const data = await request("/api/auth/" + authMode, { method: "POST", body: JSON.stringify(body) });
    authForm.reset();
    authMessage.textContent = "Connexion réussie.";
    showUser(data.user);
  } catch (error) {
    authMessage.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
$("#logout-button").addEventListener("click", async () => {
  try { await request("/api/auth/logout", { method: "POST" }); showUser(null); }
  catch (error) { authMessage.textContent = error.message; }
});
projectForm.addEventListener("submit", async event => {
  event.preventDefault();
  const button = projectForm.querySelector("button");
  button.disabled = true;
  projectMessage.textContent = "Création de votre espace…";
  try {
    await request("/api/projects", { method: "POST", body: JSON.stringify({ name: $("#project-name").value, description: $("#project-description").value }) });
    projectForm.reset();
    projectMessage.textContent = "Votre projet a été enregistré.";
    await loadProjects();
  } catch (error) {
    projectMessage.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
initialize();

aiForm.addEventListener("submit", async event => {
  event.preventDefault();
  const button = $("#ai-submit");
  const output = $("#ai-result");
  button.disabled = true;
  $("#ai-message").textContent = "Analyse de votre idée en cours…";
  output.hidden = true;
  try {
    const data = await request("/api/ai/generate", { method: "POST", body: JSON.stringify({ prompt: $("#ai-prompt").value }) });
    output.textContent = JSON.stringify(data.blueprint, null, 2);
    output.hidden = false;
    $("#ai-message").textContent = "Blueprint VEZTEMAD généré et contrôlé. Il s'agit d'une spécification structurée, pas encore du code de l'application.";
  } catch (error) {
    $("#ai-message").textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
