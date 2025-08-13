document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.querySelector('.search-bar button');
    const searchInput = document.querySelector('.search-bar input');
    const recipeGrid = document.querySelector('.recipe-grid');
    const suggestionContainer = document.createElement('div');
    suggestionContainer.id = 'suggestion-container';
    recipeGrid.parentNode.insertBefore(suggestionContainer, recipeGrid);

    // Modal elements
    const saveRecipeModal = document.getElementById('saveRecipeModal');
    const closeButton = document.querySelector('.close-button');
    const saveRecipeForm = document.getElementById('saveRecipeForm');
    const modalRecipeTitle = document.getElementById('modalRecipeTitle');
    const modalRecipeCategory = document.getElementById('modalRecipeCategory');
    const modalRecipeInstructions = document.getElementById('modalRecipeInstructions');
    const modalDateOfMeal = document.getElementById('modalDateOfMeal');
    const modalRecipeImage = document.getElementById('modalRecipeImage');
    const modalRecipeIngredients = document.getElementById('modalRecipeIngredients');

    // Open modal
    recipeGrid.addEventListener('click', (event) => {
        if (event.target.closest('.save-recipe-btn')) {
            const button = event.target.closest('.save-recipe-btn');
            modalRecipeTitle.value = button.dataset.title;
            modalRecipeInstructions.value = button.dataset.instructions;
            modalRecipeImage.value = button.dataset.image;
            modalRecipeIngredients.value = button.dataset.ingredients;

            // Check if recipe has allergens and show warning
            if (button.dataset.containsAllergens === 'true') {
                const confirmSave = confirm('Warning: This recipe contains allergens you specified. Are you sure you want to save it?');
                if (!confirmSave) {
                    return;
                }
            }

            // Set min and max dates for date_of_meal input
            const today = new Date();
            const oneWeekLater = new Date();
            oneWeekLater.setDate(today.getDate() + 7);

            const formatDate = (date) => {
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                return `${yyyy}-${mm}-${dd}`;
            };

            modalDateOfMeal.min = formatDate(today);
            modalDateOfMeal.max = formatDate(oneWeekLater);
            modalDateOfMeal.value = formatDate(today);

            // Set the category dropdown
            const categoryValue = button.dataset.category;
            for (let i = 0; i < modalRecipeCategory.options.length; i++) {
                if (modalRecipeCategory.options[i].value === categoryValue) {
                    modalRecipeCategory.selectedIndex = i;
                    break;
                }
            }
            saveRecipeModal.style.display = 'block';
        }
    });

    // Close modal
    closeButton.addEventListener('click', () => {
        saveRecipeModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == saveRecipeModal) {
            saveRecipeModal.style.display = 'none';
        }
    });

    // Handle form submission
    saveRecipeForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const recipeData = {
            title: modalRecipeTitle.value,
            category: modalRecipeCategory.value,
            instructions: modalRecipeInstructions.value,
            date_of_meal: modalDateOfMeal.value,
            image: modalRecipeImage.value,
            ingredients: modalRecipeIngredients.value,
        };

        try {
            const response = await fetch('/save_recipe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recipeData),
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                saveRecipeModal.style.display = 'none';
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Error saving recipe:', error);
            alert('An error occurred while saving the recipe.');
        }
    });

    const fetchRecipes = async (query = '') => {
        try {
            const response = await fetch(`/api/recipes?search=${query}`);
            const data = await response.json();
            const recipes = data.recipes;
            const suggestion = data.suggestion;

            recipeGrid.innerHTML = '';
            suggestionContainer.innerHTML = '';

            if (recipes.length > 0) {
                recipes.forEach(recipe => {
                    const recipeCard = document.createElement('div');
                    recipeCard.classList.add('recipe-card');
                    
                    // Add allergy warning class if recipe contains allergens
                    if (recipe.contains_allergens) {
                        recipeCard.classList.add('allergy-warning');
                    }

                    recipeCard.innerHTML = `
                        <img src="${recipe.image || '../static/images/placeholder.jpg'}" alt="${recipe.title}" class="recipe-image">
                        <h3 class="recipe-title"><a href="/recipe_detail?url=${encodeURIComponent(recipe.url)}">${recipe.title}</a></h3>
                        <div class="recipe-details">
                            <p><strong>Category:</strong> ${recipe.category}</p>
                            <p><strong>Total Time:</strong> ${recipe.total_time}</p>
                            <p><strong>Calories:</strong> ${recipe.calories}</p>
                        </div>
                        ${recipe.contains_allergens ? 
                            `<div class="allergy-alert">
                                <i class="fa-solid fa-triangle-exclamation"></i>
                                ${recipe.allergen_warnings.join(', ')}
                            </div>` : ''
                        }
                        <button class="save-recipe-btn" 
                                data-title="${recipe.title}" 
                                data-instructions="${recipe.instructions.join('\n')}" 
                                data-category="${recipe.category}" 
                                data-image="${recipe.image}" 
                                data-ingredients="${JSON.stringify(recipe.ingredients)}"
                                data-contains-allergens="${recipe.contains_allergens}">
                            <i class="fa-solid fa-bookmark"></i> Save Recipe
                        </button>
                    `;

                    recipeGrid.appendChild(recipeCard);
                });
            } else if (suggestion) {
                suggestionContainer.innerHTML = `No recipes found. Did you mean: <strong>${suggestion}</strong>? <button id="yes-suggestion">Yes</button>`;
                suggestionContainer.style.display = 'flex';

                document.getElementById('yes-suggestion').addEventListener('click', () => {
                    searchInput.value = suggestion;
                    fetchRecipes(suggestion);
                });
            } else {
                recipeGrid.innerHTML = '<p>No recipes found.</p>';
            }
        } catch (error) {
            console.error('Error fetching recipes:', error);
            recipeGrid.innerHTML = '<p>Error loading recipes. Please try again later.</p>';
        }
    };

    searchButton.addEventListener('click', () => {
        fetchRecipes(searchInput.value.trim());
    });

    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            fetchRecipes(searchInput.value.trim());
        }
    });

    fetchRecipes();
});