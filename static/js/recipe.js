document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.querySelector('.search-bar button');
    const searchInput = document.querySelector('.search-bar input');
    const recipeGrid = document.querySelector('.recipe-grid');
    const suggestionContainer = document.createElement('div');
    suggestionContainer.id = 'suggestion-container';
    recipeGrid.parentNode.insertBefore(suggestionContainer, recipeGrid);

    const fetchRecipes = async (query = '') => {
        try {
            const response = await fetch(`/api/recipes?search=${query}`);
            const data = await response.json();
            const recipes = data.recipes;
            const suggestion = data.suggestion;

            recipeGrid.innerHTML = ''; // Clear existing recipes
            suggestionContainer.innerHTML = ''; // Clear previous suggestion

            if (recipes.length > 0) {
                recipes.forEach(recipe => {
                    const recipeCard = document.createElement('div');
                    recipeCard.classList.add('recipe-card');

                    recipeCard.innerHTML = `
                        <h3 class="recipe-title">${recipe.title}</h3>
                        <div class="recipe-details">
                            <h4>Ingredients:</h4>
                            <ul>
                                ${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}
                            </ul>
                            <h4>Instructions:</h4>
                            <ol>
                                ${recipe.instructions.map(i => `<li>${i}</li>`).join('')}
                            </ol>
                        </div>
                    `;

                    recipeGrid.appendChild(recipeCard);
                });
            } else if (suggestion) {
                suggestionContainer.innerHTML = `No recipes found. Did you mean: <strong>${suggestion}</strong>? <button id="yes-suggestion">Yes</button>`;
                suggestionContainer.style.display = 'flex'; // Show the container

                document.getElementById('yes-suggestion').addEventListener('click', () => {
                    searchInput.value = suggestion; // Set search input to suggestion
                    fetchRecipes(suggestion); // Re-run search with suggestion
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

    // Initial load of all recipes
    fetchRecipes();
});