document.addEventListener('DOMContentLoaded', () => {
    const groceryListContainer = document.querySelector('.card .category');
    const kitchenStockListContainer = document.getElementById('kitchen-stock-list');

    // Modal elements
    const addStockBtn = document.getElementById('add-stock-btn');
    const addStockModal = document.getElementById('add-stock-modal');
    const closeModalBtn = addStockModal.querySelector('.close-button');
    const addStockForm = document.getElementById('add-stock-form');
    const itemNameInput = document.getElementById('item-name');
    const itemAmountInput = document.getElementById('item-amount');

    // --- Grocery List Functions ---
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
                    <input type="checkbox" data-ingredient="${item.ingredient}" data-amount="${item.amount}">
                `;
                groceryListContainer.appendChild(itemDiv);
            });
            // Add a button to process the list
            const processButton = document.createElement('button');
            processButton.id = 'process-grocery-list-btn';
            processButton.textContent = 'Process Grocery List';
            groceryListContainer.appendChild(processButton);

            processButton.addEventListener('click', processGroceryList);

        } else {
            groceryListContainer.innerHTML = '<p>No grocery items found for the selected period.</p>';
        }
    };

    const processGroceryList = async () => {
        const allItemsElements = document.querySelectorAll('.card .category .item');
        const allItems = [];
        const tickedItems = [];

        allItemsElements.forEach(itemDiv => {
            const checkbox = itemDiv.querySelector('input[type="checkbox"]');
            const ingredient = checkbox.dataset.ingredient;
            const amount = checkbox.dataset.amount;

            allItems.push({ ingredient, amount });

            if (checkbox.checked) {
                tickedItems.push(ingredient);
            }
        });

        try {
            const response = await fetch('/api/process_grocery_list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ all_items: allItems, ticked_items: tickedItems })
            });
            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                fetchAndRenderGroceryList(); // Refresh grocery list
                fetchAndRenderKitchenStock(); // Refresh kitchen stock
            } else {
                alert('Error processing grocery list: ' + data.error);
            }
        } catch (error) {
            console.error('Network error processing grocery list:', error);
            alert('Network error. Please try again.');
        }
    };

    // --- Kitchen Stock Functions ---

    // Open modal
    addStockBtn.addEventListener('click', () => {
        addStockModal.style.display = 'block';
    });

    // Close modal
    closeModalBtn.addEventListener('click', () => {
        addStockModal.style.display = 'none';
        addStockForm.reset(); // Clear form fields
    });

    // Close modal if clicked outside
    window.addEventListener('click', (event) => {
        if (event.target == addStockModal) {
            addStockModal.style.display = 'none';
            addStockForm.reset();
        }
    });

    // Fetch and render kitchen stock items
    const fetchAndRenderKitchenStock = async () => {
        try {
            const response = await fetch('/api/kitchen_stock');
            const data = await response.json();

            if (response.ok) {
                renderKitchenStock(data.kitchen_stock);
            } else {
                console.error('Error fetching kitchen stock:', data.error);
            }
        } catch (error) {
            console.error('Network error fetching kitchen stock:', error);
        }
    };

    const renderKitchenStock = (items) => {
        kitchenStockListContainer.innerHTML = ''; // Clear existing items

        if (items && items.length > 0) {
            items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'kitchen-stock-item';
                itemDiv.innerHTML = `
                    <div class="item-info">
                        <span class="name">${item.itemName}</span>
                        <span class="qty">${item.amount}</span>
                    </div>
                    <div class="actions">
                        <button class="delete-stock-btn" data-id="${item.kitchenStockListID}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                kitchenStockListContainer.appendChild(itemDiv);
            });
            // Add event listeners to new delete buttons
            document.querySelectorAll('.delete-stock-btn').forEach(button => {
                button.addEventListener('click', handleDeleteStockItem);
            });
        } else {
            kitchenStockListContainer.innerHTML = '<p>No items in your kitchen stock.</p>';
        }
    };

    // Handle adding new kitchen stock item
    addStockForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const itemName = itemNameInput.value.trim();
        const amount = itemAmountInput.value.trim();

        if (!itemName) {
            alert('Item Name cannot be empty.');
            return;
        }

        try {
            const response = await fetch('/api/kitchen_stock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ itemName, amount })
            });
            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                addStockModal.style.display = 'none';
                addStockForm.reset();
                fetchAndRenderKitchenStock(); // Refresh the list
            } else {
                alert('Error adding item: ' + data.error);
            }
        } catch (error) {
            console.error('Network error adding item:', error);
            alert('Network error. Please try again.');
        }
    });

    // Handle deleting kitchen stock item
    const handleDeleteStockItem = async (event) => {
        const itemId = event.currentTarget.dataset.id;
        if (!confirm('Are you sure you want to delete this item?')) {
            return;
        }

        try {
            const response = await fetch(`/api/kitchen_stock/${itemId}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                fetchAndRenderKitchenStock(); // Refresh the list
            } else {
                alert('Error deleting item: ' + data.error);
            }
        } catch (error) {
            console.error('Network error deleting item:', error);
            alert('Network error. Please try again.');
        }
    };

    // Initial loads
    fetchAndRenderGroceryList();
    fetchAndRenderKitchenStock();
});