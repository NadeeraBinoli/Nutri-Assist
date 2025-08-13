document.addEventListener("DOMContentLoaded", function () {
    getHealthProfile();

    const calculateBtn = document.querySelector(".calculate-btn");
    if (calculateBtn) {
        calculateBtn.addEventListener("click", calculateAndSaveHealthMetrics);
    }

    const plusIcon = document.querySelector(".fa-circle-plus");
    const minusIcon = document.querySelector(".fa-circle-minus");

    if (plusIcon) {
        plusIcon.addEventListener("click", () => logWaterIntake(0.5)); // Add 500ml
    }

    if (minusIcon) {
        minusIcon.addEventListener("click", () => logWaterIntake(-0.5)); // Remove 500ml
    }
});

function changeAge(amount) {
    const ageInput = document.getElementById('age');
    let currentAge = parseInt(ageInput.value) || 0;
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

    const bmi = weight / ((height / 100) ** 2);

    let bmr;
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    let activityMultiplier;
    switch (activity) {
        case 'sedentary': activityMultiplier = 1.2; break;
        case 'light': activityMultiplier = 1.375; break;
        case 'moderate': activityMultiplier = 1.55; break;
        case 'active': activityMultiplier = 1.725; break;
        default: activityMultiplier = 1.2;
    }
    const calories = Math.round(bmr * activityMultiplier);

    const carbs = Math.round((calories * 0.4) / 4);
    const fats = Math.round((calories * 0.3) / 9);
    const proteins = Math.round((calories * 0.3) / 4);

    let waterTarget = weight * 0.033;
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

    document.getElementById('nutrition-calories').textContent = `${data.calorieIntakeLimit} Calories`;
    document.getElementById('nutrition-carbs').textContent = `${data.carbs_g}g Carbs`;
    document.getElementById('nutrition-fats').textContent = `${data.fats_g}g Fats`;
    document.getElementById('nutrition-proteins').textContent = `${data.proteins_g}g Proteins`;

    document.querySelector(".waterTarget").textContent = `${data.water_target}L`;
}

function getHealthProfile() {
    fetch('/dashboard/get_health_profile')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }
            return response.json();
        })
        .then(data => {
            if (data.has_profile) {
                document.getElementById('height').value = data.height || '';
                document.getElementById('weight').value = data.weight || '';
                document.getElementById('age').value = data.age || '';
                document.getElementById('gender').value = data.gender || 'female';
                document.getElementById('activity').value = data.activity || 'sedentary';
                updateHealthUI(data);

                const waterTargetEl = document.querySelector(".waterTarget");
                if (waterTargetEl) waterTargetEl.textContent = `${data.water_target || '2.5'}L`;
                updateWaterTracker(data.drank_amount || 0);
            } else {
                console.log(data.message || 'No profile found.');
                document.getElementById('height').value = '';
                document.getElementById('weight').value = '';
                document.getElementById('age').value = '';
                document.getElementById('gender').value = 'female';
                document.getElementById('activity').value = 'sedentary';
                document.querySelector(".waterTarget").textContent = '2.5L';
                updateWaterTracker(0);
            }
        })
        .catch(error => {
            console.error("Error fetching profile:", error.message);
        });
}

function logWaterIntake(amount) {
    fetch('/dashboard/log_water_intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amount })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            updateWaterTracker(data.new_drank_amount);
        } else {
            alert('Error logging water: ' + data.message);
        }
    })
    .catch(error => console.error("Error:", error));
}

function updateWaterTracker(drinkedWater) {
    const drinkedWaterEl = document.querySelector(".drinkedWater");
    const waterTargetEl = document.querySelector(".waterTarget");
    const waterIntakeBar = document.querySelector(".waterIntakeBar");

    let waterTarget = parseFloat(waterTargetEl.textContent) || 2.5;
    drinkedWaterEl.textContent = drinkedWater.toFixed(1) + "L";

    const progressPercentage = (drinkedWater / waterTarget) * 100;
    waterIntakeBar.style.height = progressPercentage + "%";
}
