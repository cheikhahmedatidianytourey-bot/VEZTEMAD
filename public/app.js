const $ = (selector) => document.querySelector(selector);
const statusNode = $("#service-status");
const form = $("#project-form");
const message = $("#form-message");
const projectList = $("#project-list");
const countNode = $("#project-count");

async function request(url, options = {}) {
  const response = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Une erreur est survenue.");
  return data;
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
    status.textContent = "● Brouillon · " + new Date(project.createdAt).toLocaleString("fr-FR");
    article.append(title, description, status);
    return article;
  }));
}
async function loadProjects() {
  const data = await request("/api/projects");
  renderProjects(data.projects || []);
}
async function initialize() {
  $("#year").textContent = new Date().getFullYear();
  try {
    const health = await request("/api/health");
    statusNode.textContent = "Service opérationnel · v" + health.version;
    await loadProjects();
  } catch (error) {
    statusNode.textContent = "Service temporairement indisponible";
    message.textContent = error.message;
  }
}
form.addEventListener("submit", async event => {
  event.preventDefault();
  const button = form.querySelector("button");
  button.disabled = true;
  message.textContent = "Création de votre espace…";
  try {
    await request("/api/projects", {
      method: "POST",
      body: JSON.stringify({
        name: $("#project-name").value,
        description: $("#project-description").value
      })
    });
    form.reset();
    message.textContent = "Votre espace de projet a été créé.";
    await loadProjects();
  } catch (error) {
    message.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
initialize();