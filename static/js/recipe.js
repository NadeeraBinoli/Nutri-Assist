// document.addEventListener('DOMContentLoaded', () => {
//     const searchButton = document.querySelector('.search-bar button');
//     const searchInput = document.querySelector('.search-bar input');
//     const recipeGrid = document.querySelector('.recipe-grid');
//     const suggestionContainer = document.createElement('div');
//     suggestionContainer.id = 'suggestion-container';
//     recipeGrid.parentNode.insertBefore(suggestionContainer, recipeGrid);

//     const fetchRecipes = async (query = '') => {
//         try {
//             const response = await fetch(`/api/recipes?search=${query}`);
//             const data = await response.json();
//             const recipes = data.recipes;
//             const suggestion = data.suggestion;

//             recipeGrid.innerHTML = ''; // Clear existing recipes
//             suggestionContainer.innerHTML = ''; // Clear previous suggestion

//             if (recipes.length > 0) {
//                 recipes.forEach(recipe => {
//                     const recipeCard = document.createElement('div');
//                     recipeCard.classList.add('recipe-card');

//                     recipeCard.innerHTML = `
//                         <h3 class="recipe-title">${recipe.title}</h3>
//                         <div class="recipe-details">
//                             <h4>Ingredients:</h4>
//                             <ul>
//                                 ${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}
//                             </ul>
//                             <h4>Instructions:</h4>
//                             <ol>
//                                 ${recipe.instructions.map(i => `<li>${i}</li>`).join('')}
//                             </ol>
//                         </div>
//                     `;

//                     recipeGrid.appendChild(recipeCard);
//                 });
//             } else if (suggestion) {
//                 suggestionContainer.innerHTML = `No recipes found. Did you mean: <strong>${suggestion}</strong>? <button id="yes-suggestion">Yes</button>`;
//                 suggestionContainer.style.display = 'flex'; // Show the container

//                 document.getElementById('yes-suggestion').addEventListener('click', () => {
//                     searchInput.value = suggestion; // Set search input to suggestion
//                     fetchRecipes(suggestion); // Re-run search with suggestion
//                 });
//             } else {
//                 recipeGrid.innerHTML = '<p>No recipes found.</p>';
//             }
//         } catch (error) {
//             console.error('Error fetching recipes:', error);
//             recipeGrid.innerHTML = '<p>Error loading recipes. Please try again later.</p>';
//         }
//     };

//     searchButton.addEventListener('click', () => {
//         fetchRecipes(searchInput.value.trim());
//     });

//     searchInput.addEventListener('keyup', (event) => {
//         if (event.key === 'Enter') {
//             fetchRecipes(searchInput.value.trim());
//         }
//     });

//     // Initial load of all recipes
//     fetchRecipes();
// });


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
                        <img src="${recipe.image || '../static/images/placeholder.jpg'}" alt="${recipe.title}" class="recipe-image">
                        <h3 class="recipe-title">${recipe.title}</h3>
                        <div class="recipe-details">
                            <p><strong>Category:</strong> ${recipe.category}</p>
                            <p><strong>Prep Time:</strong> ${recipe.prep_time}</p>
                            <p><strong>Cook Time:</strong> ${recipe.cook_time}</p>
                            <p><strong>Total Time:</strong> ${recipe.total_time}</p>
                            <p><strong>Servings:</strong> ${recipe.servings}</p>

                            <h4>Nutritional Information:</h4>
                            <ul>
                                <li><strong>Calories:</strong> ${recipe.calories}</li>
                                <li><strong>Carbohydrates:</strong> ${recipe.carbohydrates_g}g</li>
                                <li><strong>Sugars:</strong> ${recipe.sugars_g}g</li>
                                <li><strong>Fat:</strong> ${recipe.fat_g}g</li>
                                <li><strong>Saturated Fat:</strong> ${recipe.saturated_fat_g}g</li>
                                <li><strong>Cholesterol:</strong> ${recipe.cholesterol_mg}mg</li>
                                <li><strong>Protein:</strong> ${recipe.protein_g}g</li>
                                <li><strong>Dietary Fiber:</strong> ${recipe.dietary_fiber_g}g</li>
                            </ul>

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

    // Initial load of all recipes
    fetchRecipes();
});
