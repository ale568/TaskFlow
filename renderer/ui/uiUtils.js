const toastQueue = [];
const MAX_TOASTS = 3;

window.createToast = function(type, title, message) {
    const wrapper = document.querySelector("#content .wrapper.notifications");
    if (!wrapper) return console.error("⚠️ Toast container non trovato.");

    const existingToast = Array.from(wrapper.children).find(toast =>
        toast.classList.contains("toast") &&
        toast.classList.contains(type) &&
        toast.querySelector(".container-2 p:last-child")?.textContent === message
    );

    if (existingToast) {
        // Riattiva la visibilità e resetta il timer
        existingToast.classList.remove("visible");
        void existingToast.offsetWidth;
        existingToast.classList.add("visible");

        clearTimeout(existingToast._dismissTimeout);
        existingToast._dismissTimeout = setTimeout(() => {
            existingToast.remove();
            processToastQueue();
        }, 4000);
        return;
    }

    // Se troppi toast già visibili → mettiamo in coda
    if (wrapper.querySelectorAll(".toast").length >= MAX_TOASTS) {
        toastQueue.push({ type, title, message });
        return;
    }

    // Altrimenti crea e mostra subito
    const toast = document.createElement("div");
    toast.classList.add("toast", type, "slide-down");

    toast.innerHTML = `
        <div class="container-1">
            <i class="${getIconClass(type)}"></i>
        </div>
        <div class="container-2">
            <p>${title}</p>
            <p>${message}</p>
        </div>
        <button>&times;</button>
    `;

    toast.querySelector("button").addEventListener("click", () => {
        toast.classList.add("fade-out");
    
        toast.addEventListener("transitionend", () => {
            toast.remove();
            processToastQueue();
        }, { once: true }); // Si attiva solo una volta
    });    

    toast._dismissTimeout = setTimeout(() => {
        toast.remove();
        processToastQueue();
    }, 4000);

    wrapper.appendChild(toast);
};

function processToastQueue() {
    const wrapper = document.querySelector("#content .wrapper.notifications");
    if (!wrapper) return;

    // Se c'è spazio disponibile e la coda non è vuota
    if (wrapper.querySelectorAll(".toast").length < MAX_TOASTS && toastQueue.length > 0) {
        const nextToast = toastQueue.shift(); // Prende il primo in coda
        createToast(nextToast.type, nextToast.title, nextToast.message); // Chiama di nuovo
    }
}

function getIconClass(type) {
    const iconMap = {
        success: "fas fa-check-circle",
        error: "fas fa-times-circle",
        info: "fas fa-info-circle",
        warning: "fas fa-exclamation-circle"
    };
    return iconMap[type] || "fas fa-info-circle";
}