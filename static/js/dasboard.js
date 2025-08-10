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

document.addEventListener('DOMContentLoaded', () => {
    const loadMeals = async () => {
        const response = await fetch('/dashboard/get_saved_meals');
        const mealsByDate = await response.json();

        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const todayStr = today.toISOString().split('T')[0];
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const options = { month: "short", day: "2-digit", weekday: "long" };
        const todayHeading = document.getElementById('today-date-heading');
        const tomorrowHeading = document.getElementById('tomorrow-date-heading');
        if(todayHeading) todayHeading.textContent = today.toLocaleDateString("en-US", options);
        if(tomorrowHeading) tomorrowHeading.textContent = tomorrow.toLocaleDateString("en-US", options);

        populateDay(mealsByDate[todayStr], 'today-meals');
        populateDay(mealsByDate[tomorrowStr], 'tomorrow-meals');
    };

    const populateDay = (meals, containerId) => {
        if (!meals) return;

        for (const category in meals) {
            const mealItems = meals[category];
            const container = document.querySelector(`#${containerId} [data-category="${category}"]`);
            
            if (container && mealItems.length > 0) {
                const addButton = container.querySelector('.add-more-btn'); 
                
                if (addButton) {
                    mealItems.forEach(meal => {
                        const mealInfoDiv = document.createElement('div');
                        mealInfoDiv.className = 'mealInfo';
                        mealInfoDiv.innerHTML = `
                            <img class="mealImage" src="${meal.image_url}" alt="${meal.name}">
                            <div class="mealDetail">
                                <h4 class="mealName">${meal.name}</h4>
                                <p class="mealSize">1 Serving</p>
                            </div>
                        `;
                        container.insertBefore(mealInfoDiv, addButton);
                    });
                }
            }
        }
    };

    const clearMeals = () => {
        document.querySelectorAll('.mealInfo').forEach(el => el.remove());
    };

    // Initial load
    loadMeals();

    // Handle back/forward cache
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            clearMeals();
            loadMeals();
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // --- MODAL LOGIC ---
    const modal = document.getElementById('recipeSearchModal');
    const closeModalBtn = modal.querySelector('.close-button');
    const searchInput = document.getElementById('modal-search-input');
    const searchButton = document.getElementById('modal-search-button');
    const searchResultsContainer = document.getElementById('modal-search-results');

    let currentAddButton = null; // To keep track of which "Add Food" button was clicked

    // Function to open the modal
    const openModal = (e) => {
        currentAddButton = e.target.closest('.add-more-btn');
        modal.style.display = 'block';
    };

    // Function to close the modal
    const closeModal = () => {
        modal.style.display = 'none';
        searchResultsContainer.innerHTML = ''; // Clear results
        searchInput.value = ''; // Clear search input
    };

    // Attach event listeners to all "Add Food" buttons
    document.querySelectorAll('.add-more-btn').forEach(btn => {
        btn.addEventListener('click', openModal);
    });

    // Listeners for closing the modal
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            closeModal();
        }
    });

    // --- MODAL SEARCH ---
    const performSearch = async () => {
        const query = searchInput.value.trim();
        if (query.length < 2) {
            searchResultsContainer.innerHTML = '<p>Please enter at least 2 characters to search.</p>';
            return;
        }

        try {
            const response = await fetch(`/api/recipes?search=${query}`);
            const data = await response.json();
            const recipes = data.recipes;

            searchResultsContainer.innerHTML = ''; // Clear previous results
            if (recipes && recipes.length > 0) {
                recipes.forEach(recipe => {
                    const card = document.createElement('div');
                    card.className = 'recipe-card';
                    card.innerHTML = `
                        <img src="${recipe.image || '../static/images/placeholder.jpg'}" alt="${recipe.title}" class="recipe-image">
                        <div class="recipe-details">
                            <h4 class="recipe-title">${recipe.title}</h4>
                            <p><strong>Calories:</strong> ${recipe.calories || 'N/A'}</p>
                        </div>
                        <button class="save-btn" 
                                data-title="${escape(recipe.title)}" 
                                data-instructions="${escape(recipe.instructions.join('\n'))}" 
                                data-image="${recipe.image}">
                            Save
                        </button>
                    `;
                    searchResultsContainer.appendChild(card);
                });
            } else {
                searchResultsContainer.innerHTML = '<p>No recipes found.</p>';
            }
        } catch (error) {
            console.error('Error searching recipes:', error);
            searchResultsContainer.innerHTML = '<p>Error loading recipes. Please try again.</p>';
        }
    };

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // --- MODAL SAVE ---
    searchResultsContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('save-btn')) {
            const saveButton = e.target;
            const mealItemContainer = currentAddButton.closest('.meal-item');
            const mealDayContainer = currentAddButton.closest('.mealDay');

            const category = mealItemContainer.dataset.category;
            const dateStr = mealDayContainer.id.includes('today') 
                ? new Date().toISOString().split('T')[0]
                : new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];

            const recipeData = {
                title: unescape(saveButton.dataset.title),
                instructions: unescape(saveButton.dataset.instructions),
                image: saveButton.dataset.image,
                category: category,
                date_of_meal: dateStr
            };

            try {
                const response = await fetch('/save_recipe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(recipeData)
                });

                const result = await response.json();
                if (response.ok) {
                    // --- INSTANT UI UPDATE ---
                    const mealInfoDiv = document.createElement('div');
                    mealInfoDiv.className = 'mealInfo';
                    mealInfoDiv.innerHTML = `
                        <img class="mealImage" src="${recipeData.image}" alt="${recipeData.title}">
                        <div class="mealDetail">
                            <h4 class="mealName">${recipeData.title}</h4>
                            <p class="mealSize">1 Serving</p>
                        </div>
                    `;
                    mealItemContainer.insertBefore(mealInfoDiv, currentAddButton);
                    
                    closeModal();
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                console.error('Error saving recipe:', error);
                alert('An unexpected error occurred while saving.');
            }
        }
    });
});