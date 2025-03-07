document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("toggleSidebar");
    const sidebar = document.querySelector(".sidebar");
    const content = document.querySelector(".content");
    const header = document.querySelector(".app-header");

    toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
        content.classList.toggle("expanded");
        header.classList.toggle("header-collapsed"); 

        if (sidebar.classList.contains("collapsed")) {
            toggleIcon.src = "../assets/icons/collapse_sidebar2.png";
        } else {
            toggleIcon.src = "../assets/icons/collapse_sidebar1.png";
        }
    });
});