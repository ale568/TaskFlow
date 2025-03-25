async function initializeProjectsView() {
    console.log("📁 Inizializzazione interfaccia Projects...");

    const addButton = document.getElementById("addProjectBtn");
    const modal = document.getElementById("projectModal");
    const closeBtn = document.getElementById("closeProjectModal");

    const closeActivityBtn = document.getElementById("closeActivityModal");
    const activityModal = document.getElementById("activityModal");

    // Listener apertura modale
    addButton.addEventListener("click", () => {
        resetProjectModal();
        openModal(modal)
    });

    // Listener chiusura modale
    closeBtn.addEventListener("click", () => closeModal(modal));

    // ESC e click fuori dal modal
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            modal.classList.remove("show");
            modal.classList.add("hide");
            document.activeElement.blur();
        }
    });

    // Pulsante salva progetto (modal)
    const saveBtn = document.getElementById("saveProjectBtn");
    saveBtn.replaceWith(saveBtn.cloneNode(true));
    document.getElementById("saveProjectBtn").addEventListener("click", handleCreateProject);

    closeActivityBtn.addEventListener("click", () => closeModal(activityModal));

    activityModal.addEventListener("click", (e) => {
        if (e.target === activityModal) closeModal(activityModal);
    });

}

function resetProjectModal() {
    document.getElementById("projectModalTitle").textContent = "Add Project";
    document.getElementById("projectName").value = "";
    document.getElementById("projectDescription").value = "";
    const saveBtn = document.getElementById("saveProjectBtn");
    saveBtn.textContent = "Create";
    saveBtn.dataset.mode = "create";
    delete saveBtn.dataset.projectId;
}

async function loadProjectsData() {
    console.log("📦 Caricamento dati riepilogo progetti...");

    const tableBody = document.getElementById("projectsTableBody");
    const noProjectsMessage = document.getElementById("noProjectsMessage");

    tableBody.innerHTML = "";

    try {
        const summaries = await window.electronAPI.getProjectSummaries();

        if (!summaries.length) {
            noProjectsMessage.classList.remove("hidden");
            return;
        }

        noProjectsMessage.classList.add("hidden");

        summaries.forEach((project) => {
            const { project_id, project_name, project_description, total_minutes, tag_color } = project;

            const formattedDuration = formatDuration(total_minutes);

            const row = document.createElement("tr");
            row.classList.add("fade-in");

            row.innerHTML = `
                <td><input type="checkbox" class="project-checkbox custom-checkbox" data-project-id="${project_id}" /></td>
                <td class="project-name-cell" data-project-id="${project_id}">
                    <span class="project-tag-color" style="background-color: ${tag_color};"></span>
                    ${project_name}
                </td>
                <td>${project_description || "-"}</td>
                <td>${formattedDuration}</td>
                <td>
                    <div class="action-icons">
                        <button class="edit-project-btn" data-id="${project_id}" title="Edit">
                            <i class="fa-regular fa-pen-to-square"></i>
                        </button>
                        <button class="delete-project-btn" data-id="${project_id}" title="Delete">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            `;

            tableBody.appendChild(row);
        });

        // Eventi dinamici
        document.querySelectorAll(".edit-project-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const button = e.target.closest(".edit-project-btn");
                const projectId = button?.dataset.id;
        
                if (projectId) {
                    handleEditProject(parseInt(projectId));
                } else {
                    console.warn("⚠️ projectId non trovato sul bottone edit");
                }
            });
        });        

        document.querySelectorAll(".delete-project-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const button = e.target.closest(".delete-project-btn");
                const projectId = parseInt(button?.dataset.id);
                if (projectId) handleDeleteProjects([projectId]);
            });
        });        

        document.querySelectorAll(".project-name-cell").forEach(cell => {
            cell.addEventListener("click", () => openActivityModal(parseInt(cell.dataset.projectId)));
        });        

        const selectAll = document.getElementById("selectAllProjects");
        const clonedSelectAll = selectAll.cloneNode(true);
        selectAll.parentNode.replaceChild(clonedSelectAll, selectAll);

        clonedSelectAll.addEventListener("change", (e) => {
            const checked = e.target.checked;
            document.querySelectorAll(".project-checkbox").forEach(cb => cb.checked = checked);
        });
        
        // Sincronizzazione inversa (entry ➝ master checkbox)
        document.querySelectorAll(".project-checkbox").forEach(cb => {
            cb.addEventListener("change", () => {
                const all = document.querySelectorAll(".project-checkbox");
                const checked = document.querySelectorAll(".project-checkbox:checked");
                const masterCheckbox = document.getElementById("selectAllProjects");
        
                if (checked.length === all.length) {
                    masterCheckbox.checked = true;
                } else {
                    masterCheckbox.checked = false;
                }
            });
        });        

    } catch (error) {
        console.error("❌ Errore nel caricamento dei riepiloghi progetto:", error);
        noProjectsMessage.classList.remove("hidden");
    }
}

function formatDuration(minutes) {
    if (minutes >= 60) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m === 0 ? `${h}h` : `${h}h ${m}m`;
    }
    return `${minutes}m`;
}

async function handleCreateProject() {
    const nameInput = document.getElementById("projectName");
    const descriptionInput = document.getElementById("projectDescription");
    const saveBtn = document.getElementById("saveProjectBtn");
    const modal = document.getElementById("projectModal");

    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    const projectId = saveBtn.dataset.projectId || null;

    if (!name) {
        createToast("warning", "Warning", "Project name is required.");
        return;
    }

    try {
        if (projectId) {
            // MODALITÀ UPDATE
            const success = await window.electronAPI.updateProject(parseInt(projectId), { name, description });
            if (!success) throw new Error("Project update failed.");

            createToast("success", "Success", "Project updated successfully.");
        } else {
            // MODALITÀ CREATE
            await window.electronAPI.createProject(name, description);
            createToast("success", "Success", "Project created successfully.");
        }

        closeProjectModal();          // Chiudi modale
        await loadProjectsData();     // Ricarica lista
    } catch (err) {
        console.error("❌ Errore nella creazione/modifica del progetto:", err);
        createToast("error", "Error", "An error occurred while saving the project.");
    }
}

function closeProjectModal() {
    const modal = document.getElementById("projectModal");
    modal.classList.remove("show");
    modal.classList.add("hide");

    // Reset form
    document.getElementById("projectName").value = "";
    document.getElementById("projectDescription").value = "";

    const saveBtn = document.getElementById("saveProjectBtn");
    saveBtn.textContent = "Create";
    saveBtn.removeAttribute("data-project-id");
}

async function handleEditProject(projectId) {
    try {
        const project = await window.electronAPI.getProjectById(projectId);

        if (!project) {
            createToast("error", "Error", "Project not found.");
            return;
        }

        // Compila i campi del form
        document.getElementById("projectName").value = project.name;
        document.getElementById("projectDescription").value = project.description || "";

        // Aggiorna il titolo e bottone
        document.getElementById("projectModalTitle").textContent = "Edit Project";
        const saveBtn = document.getElementById("saveProjectBtn");
        saveBtn.textContent = "Save changes";
        saveBtn.dataset.projectId = projectId;

        // Mostra il modale
        const modal = document.getElementById("projectModal");
        modal.classList.remove("hide");
        modal.classList.add("show");

        // Focus sul campo nome
        requestAnimationFrame(() => {
            document.getElementById("projectName").focus();
        });

    } catch (error) {
        console.error(`❌ Errore durante il recupero del progetto (ID ${projectId}):`, error);
        createToast("error", "Error", "Unable to load project for editing.");
    }
}

async function handleDeleteProjects(idsToDelete) {
    if (!idsToDelete || idsToDelete.length === 0) {
        createToast("info", "Info", "Select at least one project to delete.");
        return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete ${idsToDelete.length} project(s)?`);
    if (!confirmed) return;

    try {
        for (const id of idsToDelete) {
            await window.electronAPI.deleteProject(id);
        }

        createToast("success", "Deleted", "Projects deleted successfully.");
        await loadProjectsData();
    } catch (error) {
        console.error("❌ Errore durante la cancellazione dei progetti:", error);
        createToast("error", "Error", "Failed to delete selected projects.");
    }
}

function openModal(modal) {
    modal.classList.add("show");
    modal.classList.remove("hide");
}
function closeModal(modal) {
    modal.classList.remove("show");
    modal.classList.add("hide");
}

async function openActivityModal(projectId) {
    const modal = document.getElementById("activityModal");
    const title = document.getElementById("activityModalTitle");
    const list = document.getElementById("activityList");
    const noMessage = document.getElementById("noActivityMessage");
    const nameInput = document.getElementById("activityNameInput");
    const durationInput = document.getElementById("activityDurationInput");

    title.textContent = `Activities for Project #${projectId}`;
    list.innerHTML = "";
    nameInput.value = "";
    durationInput.value = "";
    nameInput.dataset.projectId = projectId;

    try {
        const activities = await window.electronAPI.getAllActivities();
        const projectActivities = activities.filter(a => a.project_id === projectId);

        if (projectActivities.length === 0) {
            noMessage.classList.remove("hidden");
        } else {
            noMessage.classList.add("hidden");

            projectActivities.forEach(activity => {
                const item = document.createElement("li");
                item.classList.add("activity-item");
                item.innerHTML = `
                    <div class="activity-content">
                        <strong>${activity.name}</strong>
                        <span class="duration">${formatDuration(activity.duration)}</span>
                    </div>
                    <div class="activity-actions">
                        <button class="edit-activity-btn" data-id="${activity.id}" data-name="${activity.name}" data-duration="${activity.duration}">
                            <i class="fa-regular fa-pen-to-square"></i>
                        </button>
                        <button class="delete-activity-btn" data-id="${activity.id}">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </div>
                `;

                list.appendChild(item);
            });

            setTimeout(() => {
                list.querySelectorAll(".edit-activity-btn").forEach(btn => {
                    btn.addEventListener("click", () => {
                        const { id, name, duration } = btn.dataset;
                        document.getElementById("activityNameInput").value = name;
                        document.getElementById("activityDurationInput").value = formatDuration(parseInt(duration));
                        const saveBtn = document.getElementById("addActivityBtn");
                        saveBtn.textContent = "Save Changes";
                        saveBtn.dataset.mode = "edit";
                        saveBtn.dataset.activityId = id;
                    });
                });
            
                list.querySelectorAll(".delete-activity-btn").forEach(btn => {
                    btn.addEventListener("click", async () => {
                        const id = parseInt(btn.dataset.id);
                        const confirmed = window.confirm("Are you sure you want to delete this activity?");
                        if (!confirmed) return;
            
                        try {
                            await window.electronAPI.deleteActivity(id);
                            createToast("success", "Deleted", "Activity deleted.");
                            openActivityModal(projectId); // Ricarica lista aggiornata
                        } catch (err) {
                            console.error("❌ Errore nella cancellazione attività:", err);
                            createToast("error", "Error", "Unable to delete activity.");
                        }
                    });
                });
            }, 0);
            
        }

        openModal(modal);

        // Forza repaint/reflow per evitare blocco input
        requestAnimationFrame(() => {
            nameInput.disabled = true;
            durationInput.disabled = true;

            nameInput.disabled = false;
            durationInput.disabled = false;

            nameInput.focus();
        });

    } catch (error) {
        console.error("❌ Errore nel caricamento attività:", error);
        createToast("error", "Error", "Failed to load project activities.");
    }
}

document.getElementById("addActivityBtn").addEventListener("click", async () => {
    const nameInput = document.getElementById("activityNameInput");
    const durationInput = document.getElementById("activityDurationInput");
    const saveBtn = document.getElementById("addActivityBtn");

    const name = nameInput.value.trim();
    const durationStr = durationInput.value.trim();
    const projectId = parseInt(nameInput.dataset.projectId);

    if (!name) {
        createToast("warning", "Warning", "Activity name is required.");
        return;
    }

    let minutes = 0;
    const hMatch = durationStr.match(/(\d+)\s*h/);
    const mMatch = durationStr.match(/(\d+)\s*m/);
    if (hMatch) minutes += parseInt(hMatch[1]) * 60;
    if (mMatch) minutes += parseInt(mMatch[1]);

    try {
        if (saveBtn.dataset.mode === "edit") {
            const activityId = parseInt(saveBtn.dataset.activityId);
            await window.electronAPI.updateActivity(activityId, { name, duration: minutes });
            createToast("success", "Updated", "Activity updated successfully!");
        } else {
            await window.electronAPI.createActivity(name, projectId, minutes);
            createToast("success", "Success", "Activity added successfully!");
        }

        // Reset modale e ricarica
        nameInput.value = "";
        durationInput.value = "";
        saveBtn.textContent = "Add Activity";
        delete saveBtn.dataset.mode;
        delete saveBtn.dataset.activityId;

        openActivityModal(projectId);

    } catch (error) {
        console.error("❌ Errore durante la creazione/modifica attività:", error);
        createToast("error", "Error", "Failed to save activity.");
    }
});