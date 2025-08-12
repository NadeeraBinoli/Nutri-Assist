


document.addEventListener("DOMContentLoaded", function () {
    getHealthProfile();

    const calculateBtn = document.querySelector(".calculate-btn");
    if(calculateBtn) {
        calculateBtn.addEventListener("click", calculateAndSaveHealthMetrics);
    }
});

function changeAge(amount) {
    const ageInput = document.getElementById('age');
    let currentAge = parseInt(ageInput.value);
    currentAge += amount;
    if (currentAge >= 1) {
        ageInput.value = currentAge;
    }
}

function calculateAndSaveHealthMetrics() {
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const activity = document.getElementById('activity').value;

    if (isNaN(age) || isNaN(height) || isNaN(weight) || age <= 0 || height <= 0 || weight <= 0) {
        alert("Please enter valid age, height, and weight values.");
        return;
    }

    // Calculate BMI
    const bmi = weight / ((height / 100) ** 2);

    // Calculate BMR (Basal Metabolic Rate)
    let bmr;
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Calculate TDEE (Total Daily Energy Expenditure)
    let activityMultiplier;
    switch (activity) {
        case 'sedentary': activityMultiplier = 1.2; break;
        case 'light': activityMultiplier = 1.375; break;
        case 'moderate': activityMultiplier = 1.55; break;
        case 'active': activityMultiplier = 1.725; break;
        default: activityMultiplier = 1.2;
    }
    const calories = Math.round(bmr * activityMultiplier);

    // Calculate Macronutrients
    const carbs = Math.round((calories * 0.4) / 4);
    const fats = Math.round((calories * 0.3) / 9);
    const proteins = Math.round((calories * 0.3) / 4);

    // Calculate Water Intake
    let waterTarget = weight * 0.033; // 33ml per kg
    if (gender === "male") waterTarget += 0.5;
    switch (activity) {
        case "light": waterTarget += 0.2; break;
        case "moderate": waterTarget += 0.5; break;
        case "active": waterTarget += 0.8; break;
    }
    waterTarget = Math.max(waterTarget, 1.5);

    const healthData = {
        height: height,
        weight: weight,
        age: age,
        gender: gender,
        activity: activity,
        bmi: bmi.toFixed(1),
        calorieIntakeLimit: calories,
        carbs_g: carbs,
        fats_g: fats,
        proteins_g: proteins,
        water_target: waterTarget.toFixed(1)
    };

    // Save data to backend and update UI
    fetch('/dashboard/update_health_metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(healthData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            updateHealthUI(data.data);
        } else {
            alert('Error saving health data: ' + data.message);
        }
    })
    .catch(error => console.error("Error:", error));
}

function updateHealthUI(data) {
    // BMI Display
    document.getElementById("bmi-result").textContent = data.bmi;
    const bmiStatus = document.getElementById("bmi-status");
    if (data.bmi < 18.5) {
        bmiStatus.textContent = "Underweight";
        bmiStatus.style.color = "blue";
    } else if (data.bmi >= 18.5 && data.bmi < 24.9) {
        bmiStatus.textContent = "You're Healthy";
        bmiStatus.style.color = "green";
    } else if (data.bmi >= 25 && data.bmi < 29.9) {
        bmiStatus.textContent = "Overweight";
        bmiStatus.style.color = "orange";
    } else {
        bmiStatus.textContent = "Obese";
        bmiStatus.style.color = "red";
    }
    document.getElementById("bmi-slider").value = data.bmi;

    // Nutrition Targets
    document.getElementById('nutrition-calories').textContent = `${data.calorieIntakeLimit} Calories`;
    document.getElementById('nutrition-carbs').textContent = `${data.carbs_g}g Carbs`;
    document.getElementById('nutrition-fats').textContent = `${data.fats_g}g Fats`;
    document.getElementById('nutrition-proteins').textContent = `${data.proteins_g}g Proteins`;

    // Water Intake
    document.querySelector(".waterTarget").textContent = `${data.water_target}L`;
    // Note: Water drinking progress is handled separately to not reset it on every calculation.
}

function getHealthProfile() {
    fetch('/dashboard/get_health_profile')
        .then(response => {
            if (!response.ok) {
                throw new Error('No health profile found');
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                document.getElementById('height').value = data.height;
                document.getElementById('weight').value = data.weight;
                document.getElementById('age').value = data.age;
                document.getElementById('gender').value = data.gender;
                document.getElementById('activity').value = data.activity;
                updateHealthUI(data);
            }
        })
        .catch(error => {
            console.log(error.message);
        });
}

// This part handles the water drinking log, keeping it separate from the profile calculation
document.addEventListener("DOMContentLoaded", function () {
    const drinkedWaterEl = document.querySelector(".drinkedWater");
    const waterTargetEl = document.querySelector(".waterTarget");
    const waterIntakeBar = document.querySelector(".waterIntakeBar");
    const logContainer = document.querySelector(".drink-log");
    const plusIcon = document.querySelector(".fa-circle-plus");
    const minusIcon = document.querySelector(".fa-circle-minus");

    let drinkedWater = parseFloat(localStorage.getItem("drinkedWater")) || 0;
    let drinkLog = JSON.parse(localStorage.getItem("drinkLog")) || [];

    function updateWaterTracker() {
        let waterTarget = parseFloat(waterTargetEl.textContent) || 2.5;
        drinkedWaterEl.textContent = drinkedWater.toFixed(1) + "L";
        
        const progressPercentage = (drinkedWater / waterTarget) * 100;
        waterIntakeBar.style.height = progressPercentage + "%";

        logContainer.innerHTML = "";
        drinkLog.forEach((entry) => {
            const logEntry = document.createElement("div");
            logEntry.classList.add("log-entry");
            logEntry.innerHTML = `<span>${entry.amount} ml</span> <span>${entry.time}</span>`;
            logContainer.appendChild(logEntry);
        });

        localStorage.setItem("drinkedWater", drinkedWater);
        localStorage.setItem("drinkLog", JSON.stringify(drinkLog));
    }

    if(plusIcon) {
        plusIcon.addEventListener("click", function () {
            let waterTarget = parseFloat(waterTargetEl.textContent) || 2.5;
            if (drinkedWater < waterTarget) {
                drinkedWater += 0.5;
                const now = new Date();
                const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                drinkLog.push({ amount: "500", time });
                updateWaterTracker();
            }
        });
    }

    if(minusIcon){
        minusIcon.addEventListener("click", function () {
            if (drinkedWater > 0) {
                drinkedWater -= 0.5;
                drinkLog.pop();
                updateWaterTracker();
            }
        });
    }
    
    updateWaterTracker();
});

