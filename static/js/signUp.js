// signup

document.getElementById("signupForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form from refreshing the page
    
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let confirm_password = document.getElementById("confirm_password").value;
    let termsChecked = document.getElementById("terms").checked;
    let newsletter = document.getElementById("newsletter").checked;
    let messageElement = document.getElementById("signMessage");

    // Clear previous messages
    messageElement.textContent = "";

    // Validate terms checkbox
    if (!termsChecked) {
        messageElement.style.color = "red";  
        messageElement.textContent = "You must agree to the Terms of Use and Privacy Policy!";
        return;  // Stop form submission
    }

    // Proceed with form submission if checkbox is checked
    fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirm_password, newsletter})
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            messageElement.style.color = "red";
            messageElement.textContent = data.error;
        } else {
            messageElement.style.color = "green";
            messageElement.textContent = data.message;
        }
    })
    .catch(error => console.error("Error:", error));
});
