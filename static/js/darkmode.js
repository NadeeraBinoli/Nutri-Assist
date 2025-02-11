document.addEventListener("DOMContentLoaded", function () {
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    const body = document.body;

    // Check Local Storage for Dark Mode Preference
    if (localStorage.getItem("darkMode") === "enabled") {
        body.classList.add("dark-mode");
        darkModeToggle.classList.replace("fa-moon", "fa-sun");
    }

    // Toggle Dark Mode on Click
    darkModeToggle.addEventListener("click", function () {
        body.classList.toggle("dark-mode");

        // Change Icon
        if (body.classList.contains("dark-mode")) {
            localStorage.setItem("darkMode", "enabled");
            darkModeToggle.classList.replace("fa-sun", "fa-moon");
        } else {
            localStorage.setItem("darkMode", "disabled");
            darkModeToggle.classList.replace("fa-moon", "fa-sun");
        }
    });
});



// Hide the loading screen when the page fully loads
window.onload = function() {
    setTimeout(() => {
        document.getElementById("loading-screen").style.display = "none";
    }, 1800);
};
