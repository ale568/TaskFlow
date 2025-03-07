document.addEventListener("DOMContentLoaded", () => {
    const sidebarLinks = document.querySelectorAll(".sidebar ul li a");

    function removeActiveClasses() {
        document.querySelectorAll(".sidebar ul li").forEach((li) => {
            li.classList.remove("active");
        });
    }

    function setActiveSection(link) {
        removeActiveClasses();
        link.parentElement.classList.add("active");
    }

    // Controlla se esiste già un elemento attivo, altrimenti imposta "Timer" come attivo
    const activeElement = document.querySelector(".sidebar ul li.active");
    if (!activeElement) {
        const defaultPage = document.querySelector("[data-page='timer']");
        if (defaultPage) {
            setActiveSection(defaultPage);
        }
    }

    // Gestisce il cambio di sezione quando l'utente clicca
    sidebarLinks.forEach((link) => {
        link.addEventListener("click", function () {
            setActiveSection(this);
        });
    });
});