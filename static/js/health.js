function changeAge(value) {
    let ageInput = document.getElementById("age");
    let age = parseInt(ageInput.value);
    age = Math.max(1, age + value);
    ageInput.value = age;
}

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
}