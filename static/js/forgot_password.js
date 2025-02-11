document.getElementById("forgotPasswordForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const messageElement = document.getElementById("forgotPasswordMessage");

    messageElement.textContent = "Sending reset link...";
    messageElement.style.color = "blue";

    try {
        const response = await fetch("/forgot_password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email })
        });

        const data = await response.json();
        
        if (response.ok) {
            messageElement.style.color = "green";
            messageElement.textContent = data.message;
        } else {
            messageElement.style.color = "red";
            messageElement.textContent = data.error;
        }
    } catch (error) {
        messageElement.style.color = "red";
        messageElement.textContent = "An error occurred. Please try again later.";
    }
});
