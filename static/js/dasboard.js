// JavaScript to toggle between Day/Week buttons
document.getElementById('day-btn').addEventListener('click', function() {
    document.getElementById('day-btn').classList.add('active');
    document.getElementById('week-btn').classList.remove('active');
});

document.getElementById('week-btn').addEventListener('click', function() {
    document.getElementById('week-btn').classList.add('active');
    document.getElementById('day-btn').classList.remove('active');
});

// JavaScript to handle dropdown menu
document.addEventListener("DOMContentLoaded", function () {
    const optionsBtns = document.querySelectorAll(".options-btn");

    optionsBtns.forEach((btn) => {
        btn.addEventListener("click", function (event) {
            event.stopPropagation();
            const dropdownMenu = this.nextElementSibling;

            document.querySelectorAll(".dropdown-menu").forEach((menu) => {
                if (menu !== dropdownMenu) {
                    menu.style.display = "none";
                }
            });

            dropdownMenu.style.display =
                dropdownMenu.style.display === "block" ? "none" : "block";
        });
    });

    document.addEventListener("click", function (event) {
        document.querySelectorAll(".dropdown-menu").forEach((menu) => {
            menu.style.display = "none";
        });
    });

    document.querySelectorAll(".dropdown-menu").forEach((menu) => {
        menu.addEventListener("click", function (event) {
            event.stopPropagation();
        });
    });
});




// load more button


document.addEventListener("DOMContentLoaded", function () {
    const loadButton = document.querySelector(".loadButton");
    const mealOptions = document.querySelector(".meal-options-hidden");

    loadButton.addEventListener("click", function () {
        if (mealOptions.style.display === "none" || mealOptions.style.display === "") {
            mealOptions.style.display = "block"; // Show the div
            loadButton.innerHTML = 'Show Less <i class="fa-solid fa-angle-up"></i>'; // Change text
        } else {
            mealOptions.style.display = "none"; // Hide the div
            loadButton.innerHTML = 'Load More <i class="fa-solid fa-angle-down"></i>'; // Revert text
        }
    });
});


// Current date
document.addEventListener("DOMContentLoaded", function () {
    function formatDate(offset) {
        const date = new Date();
        date.setDate(date.getDate() + offset); 
        const options = { month: "short", day: "2-digit", weekday: "long" };
        return date.toLocaleDateString("en-US", options);
    }

    document.querySelectorAll(".date-info").forEach((dateInfo) => {
        const heading = dateInfo.querySelector("h3");
        const paragraph = dateInfo.querySelector("p");

        if (paragraph.textContent.includes("Tomorrow")) {
            heading.textContent = formatDate(1); // Tomorrow's date
        } else {
            heading.textContent = formatDate(0); // Today's date
        }
    });
});



