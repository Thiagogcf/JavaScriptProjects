function listProjects() {
  const projects = ["Arrows.html", "particles.html"];

  const projectList = document.getElementById("project-list");

  projects.forEach((project) => {
    const projectDiv = document.createElement("div");
    projectDiv.className = "project";

    const projectTitle = document.createElement("h2");
    projectTitle.textContent = project.replace(".html", "");

    const link = document.createElement("a");
    link.href = project;
    link.textContent = "Ver Projeto";

    projectDiv.appendChild(projectTitle);
    projectDiv.appendChild(link);
    projectList.appendChild(projectDiv);
  });
}

listProjects();
