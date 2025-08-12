// JavaScript to toggle between Day/Week buttons
document.getElementById('day-btn').addEventListener('click', function(){
    document.getElementById('day-btn').classList.add('active');
    document.getElementById('week-btn').classList.remove('active');

    const mealDayDivs = document.querySelectorAll('.mealDay');
    mealDayDivs.forEach((div, index) => {
        if (index === 0) {
            div.style.display = 'block';
        } else {
            div.style.display = 'none';
        }
    });
});

document.getElementById('week-btn').addEventListener('click', function(){
    document.getElementById('week-btn').classList.add('active');
    document.getElementById('day-btn').classList.remove('active');

    const mealDayDivs = document.querySelectorAll('.mealDay');
    mealDayDivs.forEach(div => {
        div.style.display = 'block';
    });
});

// JavaScript to handle dropdown menu (using event delegation)
document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("click", function (event) {
        const clickedBtn = event.target.closest(".options-btn");

        if (clickedBtn) {
            event.stopPropagation();
            const dropdownMenu = clickedBtn.nextElementSibling;

            document.querySelectorAll(".dropdown-menu").forEach((menu) => {
                if (menu !== dropdownMenu) {
                    menu.style.display = "none";
                }
            });

            dropdownMenu.style.display =
                dropdownMenu.style.display === "block" ? "none" : "block";
        } else {
            document.querySelectorAll(".dropdown-menu").forEach((menu) => {
                menu.style.display = "none";
            });
        }
    });

    document.querySelectorAll(".dropdown-menu").forEach((menu) => {
        menu.addEventListener("click", function (event) {
            event.stopPropagation();
        });
    });
});



document.addEventListener('DOMContentLoaded', () => {
    const mealWeekContainer = document.getElementById('meal-week-container');

    const renderWeek = () => {
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString("en-US", { weekday: 'long' });

            const mealDayDiv = document.createElement('div');
            mealDayDiv.className = 'mealDay';
            mealDayDiv.id = `meal-day-${dateStr}`;
            mealDayDiv.innerHTML = `
                <div class="date-info">
                    <h3>${date.toLocaleDateString("en-US", { month: "short", day: "2-digit", weekday: "long" })}</h3>
                    <p>${dayName} <span class="dailyCalorie">0 kcl </span> <i class="fa-solid fa-fire"></i></p>
                </div>
                <div class="meal-options" id="meals-${dateStr}">
                    <div class="meal-item" data-category="Breakfast">
                        <div class="meal-item-head">
                            <h4>Breakfast</h4>
                            <i class="fa-solid fa-arrow-rotate-right"></i>
                            <i class=" options-btn fa-solid fa-ellipsis-vertical"></i>
                            <div class="dropdown-menu">
                                <ul>
                                    <li><a href="#" onclick="clearFoods(this)"><i class="fa-regular fa-circle-xmark"></i> Clear Foods</a></li>
                                    <li><a href="#" onclick="openCopyFoodsModal(this)"><i class="fa-regular fa-copy"></i> Copy Foods</a></li>
                                    <li><a href="${preferenceUrl}"><i class="fa-regular fa-pen-to-square"></i> Edit Preferences</a></li>
                                </ul>
                            </div>
                        </div>
                        <button class="add-more-btn"><i class="fa-solid fa-plus"></i> Add Food</button>
                    </div>
                    <div class="meal-item" data-category="Lunch">
                        <div class="meal-item-head">
                            <h4>Lunch</h4>
                            <i class="fa-solid fa-arrow-rotate-right"></i>
                            <i class=" options-btn fa-solid fa-ellipsis-vertical"></i>
                            <div class="dropdown-menu">
                                <ul>
                                    <li><a href="#" onclick="clearFoods(this)"><i class="fa-regular fa-circle-xmark"></i> Clear Foods</a></li>
                                    <li><a href="#" onclick="openCopyFoodsModal(this)"><i class="fa-regular fa-copy"></i> Copy Foods</a></li>
                                    <li><a href="${preferenceUrl}"><i class="fa-regular fa-pen-to-square"></i> Edit Preferences</a></li>
                                </ul>
                            </div>
                        </div>
                        <button class="add-more-btn"><i class="fa-solid fa-plus"></i> Add Food</button>
                    </div>
                    <div class="meal-item" data-category="Dinner">
                        <div class="meal-item-head">
                            <h4>Dinner</h4>
                            <i class="fa-solid fa-arrow-rotate-right"></i>
                            <i class=" options-btn fa-solid fa-ellipsis-vertical"></i>
                            <div class="dropdown-menu">
                                <ul>
                                    <li><a href="#" onclick="clearFoods(this)"><i class="fa-regular fa-circle-xmark"></i> Clear Foods</a></li>
                                    <li><a href="#" onclick="openCopyFoodsModal(this)"><i class="fa-regular fa-copy"></i> Copy Foods</a></li>
                                    <li><a href="${preferenceUrl}"><i class="fa-regular fa-pen-to-square"></i> Edit Preferences</a></li>
                                </ul>
                            </div>
                        </div>
                        <button class="add-more-btn"><i class="fa-solid fa-plus"></i> Add Food</button>
                    </div>
                    <div class="meal-item" data-category="Snack">
                        <div class="meal-item-head">
                            <h4>Snack</h4>
                            <i class="fa-solid fa-arrow-rotate-right"></i>
                            <i class=" options-btn fa-solid fa-ellipsis-vertical"></i>
                            <div class="dropdown-menu">
                                <ul>
                                    <li><a href="#" onclick="clearFoods(this)"><i class="fa-regular fa-circle-xmark"></i> Clear Foods</a></li>
                                    <li><a href="#" onclick="openCopyFoodsModal(this)"><i class="fa-regular fa-copy"></i> Copy Foods</a></li>
                                    <li><a href="${preferenceUrl}"><i class="fa-regular fa-pen-to-square"></i> Edit Preferences</a></li>
                                </ul>
                            </div>
                        </div>
                        <button class="add-more-btn"><i class="fa-solid fa-plus"></i> Add Food</button>
                    </div>
                </div>
            `;
            mealWeekContainer.appendChild(mealDayDiv);
        }
    };

    const loadMeals = async () => {
        renderWeek();
        const response = await fetch('/dashboard/get_saved_meals');
        const mealsByDate = await response.json();

        for (const dateStr in mealsByDate) {
            populateDay(mealsByDate[dateStr], dateStr);
        }
    };

    const populateDay = (dayData, dateStr) => {
        if (!dayData || !dayData.meals) return;

        // Update daily calorie display
        const dailyCalorieSpan = document.querySelector(`#meal-day-${dateStr} .dailyCalorie`);
        if (dailyCalorieSpan) {
            dailyCalorieSpan.textContent = `${dayData.total_calories.toFixed(0)} kcl`;
        }

        for (const category in dayData.meals) {
            const mealItems = dayData.meals[category];
            const container = document.querySelector(`#meals-${dateStr} [data-category="${category}"]`);

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
                                <p class="mealCalories">${meal.calories.toFixed(0)} kcl</p>
                            </div>
                            <i class="fa-solid fa-trash delete-meal-btn" data-recipe-id="${meal.id}"></i>
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

    // Ensure initial view is 'Week'
    document.getElementById('week-btn').click();

    // Handle back/forward cache
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            clearMeals();
            loadMeals();
        }
    });

    // Event delegation for delete buttons
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-meal-btn')) {
            deleteMeal(e.target);
        }
    });

    // Event delegation for add food buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-more-btn')) {
            openModal(e);
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
    window.openModal = (e) => {
        currentAddButton = e.target.closest('.add-more-btn');
        modal.style.display = 'block';
    };

    // Function to close the modal
    const closeModal = () => {
        modal.style.display = 'none';
        searchResultsContainer.innerHTML = ''; // Clear results
        searchInput.value = ''; // Clear search input
    };

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
                        <img src="${recipe.image || '../static/images/placeholder.jpg'}" alt="${recipe.title}">
                        <div class="recipe-details">
                            <h4 class="recipe-title">${recipe.title}</h4>
                            <p><strong>Calories:</strong> ${recipe.calories || 'N/A'}</p>
                        </div>
                        <button class="save-btn"
                                data-title="${escape(recipe.title)}"
                                data-instructions="${escape(recipe.instructions.join('\n'))}"
                                data-image="${recipe.image}"
                                data-calories="${recipe.calories || ''}"
                                data-protein="${recipe.protein_g || ''}"
                                data-fat="${recipe.fat_g || ''}"
                                data-carbs="${recipe.carbohydrates_g || ''}"
                                data-ingredients="${escape(JSON.stringify(recipe.ingredients))}">
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
            const dateStr = mealDayContainer.id.replace('meal-day-', '');

            const recipeData = {
                title: unescape(saveButton.dataset.title),
                instructions: unescape(saveButton.dataset.instructions),
                image: saveButton.dataset.image,
                category: category,
                date_of_meal: dateStr,
                calories: saveButton.dataset.calories,
                protein: saveButton.dataset.protein,
                fat: saveButton.dataset.fat,
                carbs: saveButton.dataset.carbs,
                ingredients: JSON.parse(unescape(saveButton.dataset.ingredients)) // Add ingredients
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
                    showCustomAlert('Error: ' + result.error);
                }
            } catch (error) {
                console.error('Error saving recipe:', error);
                showCustomAlert('An unexpected error occurred while saving.');
            }
        }
    });
});

async function clearFoods(element) {
    const mealItem = element.closest('.meal-item');
    const mealDay = element.closest('.mealDay');

    const category = mealItem.dataset.category;
    const dateToClear = mealDay.id.replace('meal-day-', '');

    const userConfirmed = await showCustomConfirm(`Are you sure you want to clear all foods for ${category} on ${dateToClear}?`);
    if (!userConfirmed) {
        return; // User cancelled
    }

    try {
                const response = await fetch('/dashboard/clear_foods', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ date: dateToClear, category: category }),
        });

        const result = await response.json();

        if (response.ok) {
            showCustomAlert(result.message);
            // Remove the mealInfo divs for the cleared category
            const mealInfoDivs = mealItem.querySelectorAll('.mealInfo');
            mealInfoDivs.forEach(div => div.remove());
        } else {
            showCustomAlert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error clearing foods:', error);
        showCustomAlert('An unexpected error occurred while clearing foods.');
    }
}

function showCustomConfirm(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('customConfirmModal');
        const confirmMessage = document.getElementById('confirmMessage');
        const confirmYesBtn = document.getElementById('confirmYesBtn');
        const confirmNoBtn = document.getElementById('confirmNoBtn');
        const closeButton = modal.querySelector('.close-button');

        confirmMessage.textContent = message;
        modal.style.display = 'block';

        const onYesClick = () => {
            modal.style.display = 'none';
            confirmYesBtn.removeEventListener('click', onYesClick);
            confirmNoBtn.removeEventListener('click', onNoClick);
            closeButton.removeEventListener('click', onNoClick);
            resolve(true);
        };

        const onNoClick = () => {
            modal.style.display = 'none';
            confirmYesBtn.removeEventListener('click', onYesClick);
            confirmNoBtn.removeEventListener('click', onNoClick);
            closeButton.removeEventListener('click', onNoClick);
            resolve(false);
        };

        confirmYesBtn.addEventListener('click', onYesClick);
        confirmNoBtn.addEventListener('click', onNoClick);
        closeButton.addEventListener('click', onNoClick); // Allow closing with X button

        // Close if clicked outside the modal content
        window.addEventListener('click', function(event) {
            if (event.target == modal) {
                onNoClick(); // Treat outside click as "No"
            }
        });
    });
}

function showCustomAlert(message) {
    const modal = document.getElementById('customAlertDialog');
    const alertDialogMessage = document.getElementById('alertDialogMessage');
    const alertDialogOkBtn = document.getElementById('alertDialogOkBtn');
    const closeButton = modal.querySelector('.close-button');

    alertDialogMessage.textContent = message;
    modal.style.display = 'block';

    const closeAlert = () => {
        modal.style.display = 'none';
        alertDialogOkBtn.removeEventListener('click', closeAlert);
        closeButton.removeEventListener('click', closeAlert);
        window.removeEventListener('click', outsideClickListener);
    };

    const outsideClickListener = (event) => {
        if (event.target == modal) {
            closeAlert();
        }
    };

    alertDialogOkBtn.addEventListener('click', closeAlert);
    closeButton.addEventListener('click', closeAlert);
    window.addEventListener('click', outsideClickListener);
}

async function deleteMeal(element) {
    const recipeId = element.dataset.recipeId;
    const mealInfoDiv = element.closest('.mealInfo');

    const userConfirmed = await showCustomConfirm('Are you sure you want to delete this meal?');
    if (!userConfirmed) {
        return; // User cancelled
    }

    try {
        const response = await fetch('/dashboard/delete_meal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ recipe_id: recipeId }),
        });

        const result = await response.json();

        if (response.ok) {
            showCustomAlert(result.message);
            mealInfoDiv.remove(); // Remove the meal from the UI
        } else {
            showCustomAlert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error deleting meal:', error);
        showCustomAlert('An unexpected error occurred while deleting the meal.');
    }
}

// --- COPY FOODS MODAL ---
let currentCopyElement = null;

function openCopyFoodsModal(element) {
    currentCopyElement = element;
    const modal = document.getElementById('copyFoodsModal');
    const daysContainer = document.getElementById('next-week-days');
    daysContainer.innerHTML = ''; // Clear previous days

    const today = new Date();
    for (let i = 1; i <= 7; i++) {
        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + i);
        const dayOption = document.createElement('div');
        dayOption.classList.add('day-option');
        dayOption.dataset.date = nextDay.toISOString().split('T')[0];
        dayOption.textContent = nextDay.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        daysContainer.appendChild(dayOption);
    }

    modal.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('copyFoodsModal');
    if (!modal) return;

    const closeModalBtn = modal.querySelector('.close-button');
    const cancelBtn = document.getElementById('cancelCopyBtn');
    const form = document.getElementById('copyFoodsForm');
    const daysContainer = document.getElementById('next-week-days');

    const closeModal = () => {
        modal.style.display = 'none';
    };

    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            closeModal();
        }
    });

    daysContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('day-option')) {
            // Allow multiple selections if needed, for now single selection
            const selected = daysContainer.querySelector('.selected');
            if (selected) {
                selected.classList.remove('selected');
            }
            e.target.classList.add('selected');
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const selectedDay = daysContainer.querySelector('.selected');
        if (!selectedDay) {
            showCustomAlert('Please select a day to copy the meals to.');
            return;
        }

        const mealItem = currentCopyElement.closest('.meal-item');
        const mealDay = currentCopyElement.closest('.mealDay');
        const category = mealItem.dataset.category;
        const fromDate = mealDay.id.replace('meal-day-', '');

        const toDate = selectedDay.dataset.date;

        try {
            const response = await fetch('/dashboard/copy_foods', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fromDate, toDate, category })
            });
            const result = await response.json();
            if (response.ok) {
                showCustomAlert(result.message);
                closeModal();
            } else {
                showCustomAlert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Error copying foods:', error);
            showCustomAlert('An unexpected error occurred.');
        }


        closeModal();
    });
});