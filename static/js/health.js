


// water intake calculator

document.addEventListener("DOMContentLoaded", function () {
    const drinkedWaterEl = document.querySelector(".drinkedWater");
    const waterTargetEl = document.querySelector(".waterTarget");
    const waterIntakeBar = document.querySelector(".waterIntakeBar");
    const logContainer = document.querySelector(".drink-log");
    const plusIcon = document.querySelector(".fa-circle-plus");
    const minusIcon = document.querySelector(".fa-circle-minus");

    let drinkedWater = parseFloat(localStorage.getItem("drinkedWater")) || 0;
    let waterTarget = parseFloat(localStorage.getItem("waterTarget")) || 2.5;
    let drinkLog = JSON.parse(localStorage.getItem("drinkLog")) || [];

    function updateWaterTracker() {
        // Ensure latest water target is fetched
        waterTarget = parseFloat(localStorage.getItem("waterTarget")) || 2.5;
        drinkedWaterEl.textContent = drinkedWater.toFixed(1) + "L";
        waterTargetEl.textContent = waterTarget.toFixed(1) + "L";

        // Update progress bar height percentage (VERTICAL FILL)
        const progressPercentage = (drinkedWater / waterTarget) * 100;
        waterIntakeBar.style.height = progressPercentage + "%";

        // Update drink log
        logContainer.innerHTML = "";
        drinkLog.forEach((entry) => {
            const logEntry = document.createElement("div");
            logEntry.classList.add("log-entry");
            logEntry.innerHTML = `<span>${entry.amount} ml</span> <span>${entry.time}</span>`;
            logContainer.appendChild(logEntry);
        });

        // Store updated data
        localStorage.setItem("drinkedWater", drinkedWater);
        localStorage.setItem("drinkLog", JSON.stringify(drinkLog));
    }

    // Event Listeners for Icons
    plusIcon.addEventListener("click", function () {
        if (drinkedWater < waterTarget) {
            drinkedWater += 0.5; // Increase by 500ml
            const now = new Date();
            const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            drinkLog.push({ amount: "500", time });
            updateWaterTracker();
        }
    });

    minusIcon.addEventListener("click", function () {
        if (drinkedWater > 0) {
            drinkedWater -= 0.5; // Decrease by 500ml
            drinkLog.pop(); // Remove last entry
            updateWaterTracker();
        }
    });

    // BMI-based water calculation
    function calculateWaterIntake() {
        let weight = parseFloat(document.getElementById("weight").value);
        let activity = document.getElementById("activity").value;
        let gender = document.getElementById("gender").value;

        if (isNaN(weight) || weight <= 0) {
            alert("Please enter a valid weight.");
            return;
        }

        // Base water intake calculation (in liters)
        let baseWaterIntake = weight * 0.033; // 33ml per kg rule

        // Adjust based on gender
        if (gender === "male") baseWaterIntake += 0.5;

        // Adjust based on activity level
        switch (activity) {
            case "light":
                baseWaterIntake += 0.2;
                break;
            case "moderate":
                baseWaterIntake += 0.5;
                break;
            case "active":
                baseWaterIntake += 0.8;
                break;
        }

        baseWaterIntake = Math.max(baseWaterIntake, 1.5);
        localStorage.setItem("waterTarget", baseWaterIntake.toFixed(1));
        updateWaterTracker();
    }

    // Call when BMI is calculated
    document.querySelector(".calculate-btn").addEventListener("click", function () {
        calculateBMI();
        calculateWaterIntake();
    });

    // Initialize UI on load
    updateWaterTracker();
});


function calculateBMI() {
    let height = parseFloat(document.getElementById("height").value);
    let weight = parseFloat(document.getElementById("weight").value);
    let bmiResult = document.getElementById("bmi-result");
    let bmiStatus = document.getElementById("bmi-status");
    let bmiSlider = document.getElementById("bmi-slider");

    if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
        alert("Please enter valid height and weight values.");
        return;
    }

    let bmi = weight / ((height / 100) ** 2);
    bmiResult.textContent = bmi.toFixed(1);
    bmiSlider.value = bmi.toFixed(1);

    if (bmi < 18.5) {
        bmiStatus.textContent = "Underweight";
        bmiStatus.style.color = "blue";
    } else if (bmi >= 18.5 && bmi < 24.9) {
        bmiStatus.textContent = "You're Healthy";
        bmiStatus.style.color = "green";
    } else if (bmi >= 25 && bmi < 29.9) {
        bmiStatus.textContent = "Overweight";
        bmiStatus.style.color = "orange";
    } else {
        bmiStatus.textContent = "Obese";
        bmiStatus.style.color = "red";
    }

    // Send the updated BMI and health profile data to the backend
    fetch('/dashboard/save_health_profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            bmi: bmi.toFixed(1),
            calorie_limit: 2000,  // You can calculate this based on the user’s data if needed
            daily_intake: 0,      // You can calculate or leave as 0
            activity_level: 'Medium'  // Example activity level, you can adjust this
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            console.log("Health profile updated successfully");
        } else {
            console.error("Failed to update health profile:", data.message);
        }
    })
    .catch(error => console.error("Error:", error));
}

function getHealthProfile() {
    // Fetch the user's health profile data from the backend
    fetch('/dashboard/get_health_profile', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            // If the data is successfully fetched, display it in the UI
            const bmi = data.bmi;
            const calorieLimit = data.calorie_limit;
            const dailyIntake = data.daily_intake;
            const activityLevel = data.activity_level;

            // Display the values in your HTML elements
            document.getElementById("bmi-result").textContent = bmi;
            document.getElementById("bmi-slider").value = bmi;

            // You can also display the calorie limit, daily intake, and activity level if you have corresponding elements
            document.getElementById("calorie-limit").textContent = calorieLimit;
            document.getElementById("daily-intake").textContent = dailyIntake;
            document.getElementById("activity-level").textContent = activityLevel;

            // Optionally, update the BMI status as well
            updateBMIStatus(bmi);
        } else {
            console.error("Failed to fetch health profile:", data.message);
        }
    })
    .catch(error => console.error("Error:", error));
}

// Function to update BMI status
function updateBMIStatus(bmi) {
    const bmiStatus = document.getElementById("bmi-status");

    if (bmi < 18.5) {
        bmiStatus.textContent = "Underweight";
        bmiStatus.style.color = "blue";
    } else if (bmi >= 18.5 && bmi < 24.9) {
        bmiStatus.textContent = "You're Healthy";
        bmiStatus.style.color = "green";
    } else if (bmi >= 25 && bmi < 29.9) {
        bmiStatus.textContent = "Overweight";
        bmiStatus.style.color = "orange";
    } else {
        bmiStatus.textContent = "Obese";
        bmiStatus.style.color = "red";
    }
}
