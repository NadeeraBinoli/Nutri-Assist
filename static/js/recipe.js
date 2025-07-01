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

            recipeGrid.innerHTML = '';
            suggestionContainer.innerHTML = '';

            if (recipes.length > 0) {
                recipes.forEach(recipe => {
                    const recipeCard = document.createElement('div');
                    recipeCard.classList.add('recipe-card');

                    recipeCard.innerHTML = `
                        <img src="${recipe.image || '../static/images/placeholder.jpg'}" alt="${recipe.title}" class="recipe-image">
                        <h3 class="recipe-title"><a href="/recipe_detail?url=${encodeURIComponent(recipe.url)}">${recipe.title}</a></h3>
                        <div class="recipe-details">
                            <p><strong>Category:</strong> ${recipe.category}</p>
                            <p><strong>Total Time:</strong> ${recipe.total_time}</p>
                            <p><strong>Calories:</strong> ${recipe.calories}</p>
                        </div>
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
