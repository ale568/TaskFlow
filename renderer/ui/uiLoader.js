document.addEventListener("DOMContentLoaded", async () => {

    const content = document.getElementById("content");

    let isLoadingView = false;

    /**
     * Loads a view dynamically and injects it into the content area.
     * @param {string} viewName - The name of the view file (without .html extension).
     */
    async function loadView(viewName) {

        if (isLoadingView) {
            console.warn(`Caricamento di ${viewName} bloccato: un'altra vista è già in caricamento.`);
            return;
        }
        isLoadingView = true; // Blocca nuovi caricamenti    

        try {
            const response = await fetch(`views/${viewName}.html`);
            if (!response.ok) throw new Error(`Failed to load ${viewName}`);

            content.innerHTML = await response.text();

            // Inseriamo il contenitore per i toast nella vista caricata
            if (!content.querySelector(".wrapper.notifications")) {
                const toastWrapper = document.createElement("div");
                toastWrapper.className = "wrapper notifications";
                content.prepend(toastWrapper);
            }


            // Rimuove i CSS precedenti
            removeOldStyles();

            // Carica il CSS della vista attuale
            loadViewCSS(viewName);

            if (viewName === "home") {
                await loadHomeScript();

                const globalState = await window.electronAPI.getGlobalState();
                console.log("DEBUG: Stato Globale ricevuto:", globalState);

                await resetHomeUI();
                await initializeHomeFunctions();
            }

            if (viewName === "activity") {
                await loadActivityScript();
                await initializeActivityFunctions();
            }

            if (viewName === "tags") {
                await loadTagsScript();
                await initializeTagsFunctions(); 
            }

            if (viewName === "projects") {
                await loadProjectsScript();
                await initializeProjectsFunctions(); 
            }
            
            if (viewName === "timeSheet") {
                await loadTimeSheetScript();
                await initializeTimeSheetFunctions(); 
            }
            
            if (viewName === "reports") {
                await loadReportsScript();
                await initializeReportsFunctions(); 
            } 
            
            if (viewName === "alerts") {
                await loadAlertsScript();
                await initializeAlertsFunctions();
            }            

        } catch (error) {
            console.error("Error loading view:", error);
            content.innerHTML = "<p>Error loading view. Please try again.</p>";
        } finally {
            isLoadingView = false; // Sblocca nuovi caricamenti
        }
    }

    async function loadHomeScript() {
        return new Promise((resolve) => {
            const existingScript = document.querySelector("script[src='../renderer/ui/uiHome.js']");
            if (!existingScript) {
                const script = document.createElement("script");
                script.src = "../renderer/ui/uiHome.js";
                script.onload = () => {
                    console.log("uiHome.js caricato correttamente!");
                    resolve(); 
                };
                document.body.appendChild(script);
            } else {
                console.log("uiHome.js è già stato caricato, evitato doppio caricamento.");
                resolve();
            }
        });
    }    
    
    async function loadActivityScript() {
        return new Promise((resolve) => {
            const existingScript = document.querySelector("script[src='../renderer/ui/uiActivity.js']");
            if (!existingScript) {
                const script = document.createElement("script");
                script.src = "../renderer/ui/uiActivity.js";
                script.onload = () => {
                    console.log("uiActivity.js caricato correttamente!");
                    resolve();
                };
                document.body.appendChild(script);
            } else {
                console.log("uiActivity.js è già stato caricato, evitato doppio caricamento.");
                resolve();
            }
        });
    }

    async function loadTagsScript() {
        return new Promise((resolve) => {
            const existingScript = document.querySelector("script[src='../renderer/ui/uiTags.js']");
            if (!existingScript) {
                const script = document.createElement("script");
                script.src = "../renderer/ui/uiTags.js";
                script.onload = () => {
                    console.log("uiTags.js caricato correttamente!");
                    resolve();
                };
                document.body.appendChild(script);
            } else {
                console.log("uiTags.js è già stato caricato, evitato doppio caricamento.");
                resolve();
            }
        });
    }

    async function loadProjectsScript() {
        return new Promise((resolve) => {
            const existingScript = document.querySelector("script[src='../renderer/ui/uiProjects.js']");
            if (!existingScript) {
                const script = document.createElement("script");
                script.src = "../renderer/ui/uiProjects.js";
                script.onload = () => {
                    console.log("uiProjects.js caricato correttamente!");
                    resolve();
                };
                document.body.appendChild(script);
            } else {
                console.log("uiProjects.js è già stato caricato, evitato doppio caricamento.");
                resolve();
            }
        });
    }

    async function loadTimeSheetScript() {
        return new Promise((resolve) => {
          const existingScript = document.querySelector("script[src='../renderer/ui/uiTimeSheet.js']");
          if (!existingScript) {
            const script = document.createElement("script");
            script.src = "../renderer/ui/uiTimeSheet.js";
            script.onload = () => {
              console.log(" uiTimeSheet.js caricato correttamente!");
              resolve();
            };
            document.body.appendChild(script);
          } else {
            console.log("uiTimeSheet.js è già stato caricato. Evitato doppio caricamento.");
            resolve();
          }
        });
    }      
    
    async function loadReportsScript() {
        return new Promise((resolve) => {
            const existingScript = document.querySelector("script[src='../renderer/ui/uiReports.js']");
            if (!existingScript) {
                const script = document.createElement("script");
                script.src = "../renderer/ui/uiReports.js";
                script.onload = () => {
                    console.log("uiReports.js caricato correttamente!");
                    resolve();
                };
                document.body.appendChild(script);
            } else {
                console.log("uiReports.js è già stato caricato, evitato doppio caricamento.");
                resolve();
            }
        });
    }

    async function loadAlertsScript() {
        return new Promise((resolve) => {
            const existingScript = document.querySelector("script[src='../renderer/ui/uiAlerts.js']");
            if (!existingScript) {
                const script = document.createElement("script");
                script.src = "../renderer/ui/uiAlerts.js";
                script.onload = () => {
                    console.log("uiAlerts.js caricato correttamente!");
                    resolve();
                };
                document.body.appendChild(script);
            } else {
                console.log("uiAlerts.js è già stato caricato, evitato doppio caricamento.");
                resolve();
            }
        });
    }    

    async function initializeHomeFunctions() {
        console.log("🔄 Riassegnazione delle funzioni della Home...");

        await waitForFunctions([
            "updateFormattedDate",
            "initializeDatePicker",
            "populateProjectSelector",
            "initializeTimeTracking",
            "setupToggleTimerMode"
        ]);        

        if (typeof updateFormattedDate !== "undefined") updateFormattedDate();
        if (typeof initializeDatePicker !== "undefined") initializeDatePicker();
        if (typeof populateProjectSelector !== "undefined") await populateProjectSelector();

        // PASSIAMO IL TIMER ATTIVO A `initializeTimeTracking`
        if (typeof initializeTimeTracking !== "undefined") await initializeTimeTracking(window.id); 

        if (typeof setupToggleTimerMode !== "undefined") await setupToggleTimerMode();

        // Verifica se l'elemento esiste prima di chiamare la funzione
        if (document.getElementById("activity-container-main")) {
            const datePicker = document.getElementById("date-picker");
            const selectedDate = datePicker && datePicker.value ? datePicker.value : new Date().toISOString().split("T")[0];
            await loadTimeEntriesMain(selectedDate);
        }

        // Assicura che deleteSelectedEntriesMain venga eseguita SOLO al click del pulsante del blocco principale
        const deleteButtonMain = document.querySelector(".activity-list #delete-selected-btn-main");
        if (deleteButtonMain) {
            deleteButtonMain.addEventListener("click", (event) => deleteSelectedEntriesMain(event));
        }

        // Modifica per caricare SOLO i blocchi dei giorni precedenti
        const showPreviousDaysBtn = document.getElementById("show-previous-days");
        if (showPreviousDaysBtn) {
            showPreviousDaysBtn.addEventListener("click", async () => {
                await loadPreviousDaysEntriesPrevious();
            });
        } else {
            console.error("❌ Errore: pulsante 'Display Previous Days' non trovato!");
        }

        // Aggiunge il reset dei giorni precedenti quando si cambia data
        if (typeof clearPreviousDaysEntriesPrevious !== "undefined") clearPreviousDaysEntriesPrevious();
    }

    async function initializeActivityFunctions() {

        console.log("🔄 Inizializzazione delle funzioni della Activity...");
        
        await waitForFunctions([
            "initializeActivityView",
            "loadActivityData"
        ]);  

        if (typeof initializeActivityView !== "undefined") initializeActivityView();
        if (typeof loadActivityData !== "undefined") loadActivityData();
    }

    async function initializeTagsFunctions() {
        console.log("Inizializzazione delle funzioni della vista Tags...");
    
        await waitForFunctions([
            "initializeTagsView",
            "loadTagsData"
        ]);
    
        if (typeof initializeTagsView !== "undefined") initializeTagsView();
        if (typeof loadTagsData !== "undefined") loadTagsData(pickrInstanceGlobal);
    }
    
    async function initializeProjectsFunctions() {
        console.log("🚀 Inizializzazione delle funzioni della vista Projects...");
    
        await waitForFunctions([
            "initializeProjectsView",
            "loadProjectsData"
        ]);
    
        if (typeof initializeProjectsView !== "undefined") initializeProjectsView();
        if (typeof loadProjectsData !== "undefined") loadProjectsData();
    }

    async function initializeTimeSheetFunctions() {
        console.log("🚀 Inizializzazione della vista TimeSheet...");
      
        await waitForFunctions([
          "initializeTimeSheetView",
        ]);
      
        if (typeof initializeTimeSheetView !== "undefined") initializeTimeSheetView();
    }
    
    async function initializeReportsFunctions() {
        console.log("🚀 Inizializzazione delle funzioni della vista Reports...");
    
        await waitForFunctions([
            "initializeReportsView",
        ]);
    
        if (typeof initializeReportsView !== "undefined") initializeReportsView();
    }

    async function initializeAlertsFunctions() {
        console.log("Inizializzazione delle funzioni della vista Alerts...");
    
        await waitForFunctions([
            "initializeAlertsView",
        ]);
    
        if (typeof initializeAlertsView !== "undefined") initializeAlertsView();
    }
    

    async function waitForFunctions(functionNames, timeout = 3000) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            if (functionNames.every(fn => typeof window[fn] === "function")) return;
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        console.error(`❌ Timeout: alcune funzioni non sono state caricate correttamente: ${functionNames.join(", ")}`);
    }

    // Attach click event to sidebar links
    document.querySelectorAll(".sidebar a").forEach(link => {
        link.addEventListener("click", async (event) => {
            event.preventDefault();
            const viewName = event.target.closest("a").dataset.page;
            await loadView(viewName); // 🚀 Aspettiamo il caricamento della nuova vista
        });
    });


    // Load the default view on startup
    await loadView("home"); // Aspettiamo che la home sia completamente caricata
});


// Carica dinamicamente il CSS della vista corrente.
function loadViewCSS(viewName) {
    const cssMap = {
        home: ["styles/home.css", "styles/airDatepicker-custom.css"], // Home usa il datepicker normale
        activity: ["styles/activity.css"], // Activity non usa il datepicker
        timeSheet: ["styles/timeSheet.css"], // TimeSheet usa il datepicker con solo mesi
        reports: ["styles/reports.css"],
        projects: ["styles/projects.css"],
        tags: ["styles/tags.css"],
        alerts: ["styles/alerts.css"],
    };

    const cssPaths = cssMap[viewName];

    if (cssPaths) {
        cssPaths.forEach(cssPath => {
            const existingLink = document.querySelector(`link[href="${cssPath}"]`);
            if (!existingLink) {
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = cssPath;
                document.head.appendChild(link);
                console.log(`✅ ${cssPath} caricato correttamente!`);
            }
        });
    }
}


// Rimuove i file CSS delle viste precedenti per evitare conflitti.
function removeOldStyles() {
    const allowedStyles = ["main.css", "sidebar.css", "header.css", "button.css", "airDatepicker-custom.css", "toast.css"];

    document.querySelectorAll("link[href^='styles/']").forEach((style) => {
        if (!allowedStyles.some(allowed => style.href.includes(allowed))) {
            console.log(`❌ Rimosso ${style.href}`);
            style.remove();
        }
    });
}