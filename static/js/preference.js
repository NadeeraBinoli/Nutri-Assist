document.addEventListener("DOMContentLoaded", function() {
    fetch('/dashboard/get_user_preferences')
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            selectedDiet = data.dietPlan;
            selectedFoodTypes = data.foodTypes;
            selectedAllergies = data.allergies;
            selectedMedicalConditions = data.medicalConditions;
            selectedMeals = data.mealFrequency;

            // Highlight selected diet
            document.querySelectorAll('.diet-btn').forEach(btn => {
                if (btn.getAttribute('data-diet') === selectedDiet) {
                    btn.classList.add('selected', 'selected-green');
                }
            });

            // Highlight selected food types
            document.querySelectorAll('.food-btn').forEach(btn => {
                if (selectedFoodTypes.includes(btn.getAttribute('data-food'))) {
                    btn.classList.add('selected', 'selected-green');
                }
            });

            // Highlight selected allergies
            document.querySelectorAll('.exclusion-btn').forEach(btn => {
                if (selectedAllergies.includes(btn.getAttribute('data-allergy'))) {
                    btn.classList.add('selected', 'selected-red');
                }
            });

            // Highlight selected medical conditions
            document.querySelectorAll('.medical-btn').forEach(btn => {
                if (selectedMedicalConditions.includes(btn.getAttribute('data-condition'))) {
                    btn.classList.add('selected', 'selected-red');
                }
            });

            // Highlight selected meals
            document.querySelectorAll('.meal-btn').forEach(btn => {
                if (selectedMeals.includes(btn.getAttribute('data-meal'))) {
                    btn.classList.add('selected', 'selected-green');
                }
            });
        }
    })
    .catch(error => console.error('Error fetching preferences:', error));
});



// Track user selections
let selectedDiet = '';
let selectedFoodTypes = [];
let selectedAllergies = [];
let selectedMedicalConditions = [];
let selectedMeals = [];

// Select buttons and add event listeners
document.querySelectorAll('.diet-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        selectedDiet = this.getAttribute('data-diet');
        document.querySelectorAll('.diet-btn').forEach(button => button.classList.remove('selected', 'selected-green', 'selected-red'));
        this.classList.add('selected', 'selected-green');
    });
});

document.querySelectorAll('.food-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const food = this.getAttribute('data-food');
        if (selectedFoodTypes.includes(food)) {
            selectedFoodTypes = selectedFoodTypes.filter(item => item !== food);
            this.classList.remove('selected', 'selected-green');
        } else {
            selectedFoodTypes.push(food);
            this.classList.add('selected', 'selected-green');
        }
    });
});

document.querySelectorAll('.exclusion-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const allergy = this.getAttribute('data-allergy');
        if (selectedAllergies.includes(allergy)) {
            selectedAllergies = selectedAllergies.filter(item => item !== allergy);
            this.classList.remove('selected', 'selected-red');
        } else {
            selectedAllergies.push(allergy);
            this.classList.add('selected', 'selected-red');
        }
    });
});

document.querySelectorAll('.medical-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const condition = this.getAttribute('data-condition');
        if (selectedMedicalConditions.includes(condition)) {
            selectedMedicalConditions = selectedMedicalConditions.filter(item => item !== condition);
            this.classList.remove('selected', 'selected-red');
        } else {
            selectedMedicalConditions.push(condition);
            this.classList.add('selected', 'selected-red');
        }
    });
});

document.querySelectorAll('.meal-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const meal = this.getAttribute('data-meal');
        if (selectedMeals.includes(meal)) {
            selectedMeals = selectedMeals.filter(item => item !== meal);
            this.classList.remove('selected', 'selected-green');
        } else {
            selectedMeals.push(meal);
            this.classList.add('selected', 'selected-green');
        }
    });
});

// Collect user selections into an object
function getUserSelections() {
    return {
        dietPlan: selectedDiet,
        foodTypes: selectedFoodTypes.join(', '),
        allergies: selectedAllergies.join(', '),
        medicalConditions: selectedMedicalConditions.join(', '),
        mealFrequency: selectedMeals.join(', ')
    };
}

// Function to display messages on the page
function displayMessage(message, type) {
    const messageContainer = document.getElementById('message-container');
    messageContainer.textContent = message; 
    messageContainer.className = 'message-container'; 
    messageContainer.classList.add(type); 

    // Show the message container
    messageContainer.style.display = 'block';

    // Optionally, hide the message after 5 seconds
    setTimeout(function() {
        messageContainer.style.display = 'none';
    }, 5000);
}

// Save user preferences to the backend
document.getElementById('save-changes').addEventListener('click', function() {
    const userData = getUserSelections();

    fetch('/dashboard/save_user_preferences', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Preferences saved:', data);
        // Display success message
        displayMessage('Your preferences have been saved successfully!', 'success');
    })
    .catch(error => {
        console.error('Error:', error);
        // Display error message
        displayMessage('An error occurred while saving your preferences. Please try again.', 'error');
    });
});

// Reset selections
document.getElementById('reset-all').addEventListener('click', function() {
    location.reload();
});

// Clear all selections
document.getElementById('clear-all').addEventListener('click', function() {
    selectedDiet = '';
    selectedFoodTypes = [];
    selectedAllergies = [];
    selectedMedicalConditions = [];
    selectedMeals = [];
    document.querySelectorAll('.selected').forEach(btn => btn.classList.remove('selected', 'selected-green', 'selected-red'));
});


