document.addEventListener('DOMContentLoaded', () => {
    const groceryListContainer = document.querySelector('.card .category');

    const fetchAndRenderGroceryList = async () => {
        try {
            const response = await fetch('/api/generate_grocery_list');
            const data = await response.json();

            if (response.ok) {
                renderGroceryList(data.grocery_list);
            } else {
                console.error('Error fetching grocery list:', data.error);
                // Optionally display an error message to the user
            }
        } catch (error) {
            console.error('Network error fetching grocery list:', error);
            // Optionally display a network error message
        }
    };

    const renderGroceryList = (items) => {
        groceryListContainer.innerHTML = ''; // Clear existing static items

        if (items && items.length > 0) {
            items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'item';
                itemDiv.innerHTML = `
                    <img src="../static/images/pancake.png" alt="${item.ingredient}"> <!-- Placeholder image -->
                    <span class="name">${item.ingredient}</span>
                    <span class="qty">${item.amount}</span>
                    <input type="checkbox">
                `;
                groceryListContainer.appendChild(itemDiv);
            });
        } else {
            groceryListContainer.innerHTML = '<p>No grocery items found for the selected period.</p>';
        }
    };

    // Initial load of the grocery list
    fetchAndRenderGroceryList();
});

// Dark mode toggle (from dashboard.js, assuming it's needed here too)
document.getElementById('dark-mode-toggle').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    // Save preference to localStorage if needed
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('dark-mode', 'enabled');
    } else {
        localStorage.setItem('dark-mode', 'disabled');
    }
});

// Apply dark mode on load
if (localStorage.getItem('dark-mode') === 'enabled') {
    document.body.classList.add('dark-mode');
}
