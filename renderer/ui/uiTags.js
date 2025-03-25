let pickrInstanceGlobal = null;
let tagsDropdownListenerAttached = false;

/**
 * Inizializza la vista Tags: gestisce eventi e apertura modale
 */
function initializeTagsView() {
    console.log("Inizializzazione interfaccia Tags...");

    if (pickrInstanceGlobal) {
        pickrInstanceGlobal.destroyAndRemove();
        pickrInstanceGlobal = null;
    }    

    const addButton = document.getElementById("addTagBtn"); // ID del pulsante "Add tag"
    const modal = document.getElementById("tagModal");       // ID del modal
    const closeBtn = document.getElementById("closeModal");  // Bottone di chiusura modal

    if (!addButton) {
        console.warn("⚠️ Bottone Add Tag non trovato nel DOM.");
        return;
    }

    if (!modal || !closeBtn) {
        console.warn("⚠️ Elementi modale non trovati nel DOM.");
        return;
    }    

    // Apertura modale
    addButton.addEventListener("click", () => {
        // Modal in modalità "Create"
        document.getElementById("tagModalTitle").textContent = "Add tag";
    
        modal.classList.add("show");
        modal.classList.remove("hide");
    
        // Focus sull’input nome
        requestAnimationFrame(() => {
            document.getElementById("tagName").focus();
        });
    });        

    // Chiusura modale
    closeBtn.addEventListener("click", () => {
        modal.classList.remove("show");
        modal.classList.add("hide");
    });

    pickrInstanceGlobal = Pickr.create({
        el: '#colorPicker',
        theme: 'monolith', // puoi usare anche 'monolith' o 'nano'
        default: '#4e3de6',
        swatches: [
            '#4e3de6', '#7950f2', '#9775fa',
            '#f03e3e', '#d6336c', '#fd7e14',
            '#fab005', '#40c057', '#228be6'
        ],
        components: {
            preview: true,
            opacity: false,
            hue: true,
    
            interaction: {
                hex: true,
                rgba: true,
                input: true,
                save: true
            }
        }
    });
    
    pickrInstanceGlobal.on('save', (color, instance) => {
        const selectedColor = color.toHEXA().toString(); // Ottieni colore HEX
        document.getElementById("tagColor").value = selectedColor;
        pickrInstanceGlobal.hide(); // Chiude il color picker
    });
    
    // ESC per chiudere il madal
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            modal.classList.remove("show");
            modal.classList.add("hide");
            document.activeElement.blur();
        }
    });

    // Click fuori dal contenuto del modal
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.classList.remove("show");
            modal.classList.add("hide");
        }
    });

    if (!tagsDropdownListenerAttached) {
        document.addEventListener("click", (e) => {
          const isOptionButton = e.target.classList.contains("more-options");
          const isDropdown = e.target.closest(".dropdown-menu");
      
          if (isOptionButton) {
              const menu = e.target.nextElementSibling;
      
              // Chiudi eventuali altri menu aperti
              document.querySelectorAll(".dropdown-menu.show").forEach(openMenu => {
                  if (openMenu !== menu) toggleDropdown(openMenu);
              });
      
              toggleDropdown(menu);
              e.stopPropagation();
              return;
          }
      
          // Clic fuori dal menu e dal pulsante
          if (!isDropdown) {
              document.querySelectorAll(".dropdown-menu.show").forEach(openMenu => {
                  toggleDropdown(openMenu);
              });
          }
        });
      
        tagsDropdownListenerAttached = true;
      }
             
    
    function toggleDropdown(menu) {

        if (!menu) return;

        if (menu.classList.contains("show")) {
            menu.classList.remove("show");
            menu.classList.add("hide");
    
            const onAnimationEnd = () => {
                menu.style.display = "none";
                menu.classList.remove("hide");
                menu.removeEventListener("animationend", onAnimationEnd);
            };
    
            menu.addEventListener("animationend", onAnimationEnd);
        } else {
            // Rimuoviamo la classe hide (in caso fosse rimasta da prima)
            menu.classList.remove("hide");
            menu.style.display = "flex";
            menu.classList.add("show");
        }
    }
    
    // Gestione creazione tag
    const createTagBtn = document.getElementById("createTagBtn");

    // Rimuove eventuali listener precedenti e reimposta in modalità "Create"
    const freshCreateBtn = createTagBtn.cloneNode(true);
    freshCreateBtn.textContent = "Create";
    createTagBtn.parentNode.replaceChild(freshCreateBtn, createTagBtn);

    freshCreateBtn.addEventListener("click", handleCreateTag);
}

/**
 * Carica i dati dei tag dal database e li visualizza
 */
async function loadTagsData(pickrInstanceGlobal) {
    console.log("Caricamento dei dati dei tag...");

    // TODO: qui chiamerai l'API Electron per ottenere i tag
    const tags = await window.electronAPI.getAllTags();

    const tagTableBody = document.getElementById("tagsTableBody");

    tagTableBody.innerHTML = ""; // Svuota

    if (!tags || tags.length === 0) {
        // Mostra il messaggio di "No data"
        document.getElementById("noTagsMessage").style.display = "block";
        return;
    }

    document.getElementById("noTagsMessage").style.display = "none";

    // Popola la tabella
    tags.forEach(tag => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${tag.name}</td>
            <td><span class="tag-color-box" style="background-color: ${tag.color};"></span></td>
            <td class="options-cell">
            <div class="options-wrapper">
                <i class="more-options">⋮</i>
                    <div class="dropdown-menu hide">
                        <div class="dropdown-item edit" data-id="${tag.id}" data-name="${tag.name}" data-color="${tag.color}">
                        <span><i class="fa-regular fa-pen-to-square"></i></span> Edit tag
                    </div>
                    <div class="dropdown-item delete" data-id="${tag.id}">
                        <span><i class="fa-regular fa-trash-can"></i></span> Delete tag
                    </div>
                </div>
            </div>
        </td>
        `;
        tagTableBody.appendChild(row);
    });

    assignTagOptionListeners(pickrInstanceGlobal);
}

function assignTagOptionListeners(pickrInstanceGlobal) {
    const deleteButtons = document.querySelectorAll(".dropdown-item.delete");
    const editButtons = document.querySelectorAll(".dropdown-item.edit");

    deleteButtons.forEach(btn => {
        btn.addEventListener("click", async () => {
            const tagId = parseInt(btn.dataset.id);
            const inUse = await window.electronAPI.isTagInUse(tagId);

            if (inUse) {
                createToast("warning", "Warning", "Unable to delete a tag associated with projects or tasks.");
                return;
            }

            const confirm = window.confirm("Are you sure you want to delete this tag?");
            if (!confirm) return;

            try {
                await window.electronAPI.deleteTag(tagId);
                createToast("success", "Deleted", "Tag successfully deleted!");
                await loadTagsData(pickrInstanceGlobal);
            } catch (error) {
                console.error(error);
                createToast("error", "Error", "Error while deleting the tag.");
            }
        });
    });

    editButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const tagId = parseInt(btn.dataset.id);
            const currentName = btn.dataset.name;
            const currentColor = btn.dataset.color;

            openEditModal(tagId, currentName, currentColor, pickrInstanceGlobal);
        });
    });
}

function openEditModal(tagId, currentName, currentColor, pickrInstanceGlobal) {
    const modal = document.getElementById("tagModal");

    document.getElementById("tagModalTitle").textContent = "Edit tag";

    const nameInput = document.getElementById("tagName");
    const colorInput = document.getElementById("tagColor");

    nameInput.value = currentName;
    colorInput.value = currentColor;
    
    if (pickrInstanceGlobal && typeof pickrInstanceGlobal.setColor === "function") {
        pickrInstanceGlobal.setColor(currentColor);
    } else {
        console.warn("⚠️ pickrInstanceGlobal non inizializzato al momento dell'edit.");
    }    

    // Sostituisce il bottone per evitare listener multipli
    const oldBtn = document.getElementById("createTagBtn");
    const newBtn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);

    newBtn.textContent = "Save";

    modal.classList.add("show");
    modal.classList.remove("hide");

    const handleUpdate = async () => {
        const newName = nameInput.value.trim();
        const newColor = colorInput.value;
    
        if (!newName) {
            createToast("error", "Error", "The tag name is required.");
            return;
        }
    
        try {
            await window.electronAPI.updateTag(tagId, { name: newName, color: newColor });
            createToast("success", "Updated", "Tag successfully updated.");
            modal.classList.remove("show");
            modal.classList.add("hide");
            await loadTagsData(pickrInstanceGlobal);
        } catch (err) {
            createToast("error", "Error", "Unable to update the tag.");
            console.error(err);
        } finally {
            newBtn.textContent = "Create";
            newBtn.removeEventListener("click", handleUpdate);
            newBtn.addEventListener("click", handleCreateTag);
        }
    };
    
    // Listener corretto sul nuovo bottone
    newBtn.addEventListener("click", handleUpdate, { once: true });
}

async function handleCreateTag() {
    const tagName = document.getElementById("tagName").value.trim();
    const tagColor = pickrInstanceGlobal.getColor()?.toHEXA().toString();

    if (!tagName) {
        createToast("error", "Error", "Enter a name for the tag.");
        return;
    }

    if (!tagColor || tagColor.toLowerCase() === "#ffffff") {
        showToast("Please select a valid color (white is not allowed).", "error");
        return;
    }

    try {
        await window.electronAPI.createTag(tagName, tagColor);
        createToast("success", "Success", "Tag created!");

        await loadTagsData(pickrInstanceGlobal);

        document.getElementById("tagName").value = "";
        document.getElementById("tagColor").value = "";

        const modal = document.getElementById("tagModal");
        modal.classList.remove("show");
        modal.classList.add("hide");
    } catch (error) {
        createToast("error", "Error", "Failed to create tag. See console for details.");
        console.error("Errore durante la creazione del tag:", error);
    }
}