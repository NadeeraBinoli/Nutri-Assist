document.addEventListener("DOMContentLoaded", function () {
    const changeEmailBtn = document.getElementById("change-email");
    const emailChangeForm = document.querySelector(".emailChangeForm");
    const emailChangeMessage = document.getElementById("emailChangeMessage");

    const changePasswordBtn = document.getElementById("change-password");
    const passwordChangeForm = document.querySelector(".passwordChangeForm");
    const passwordChangeMessage = document.getElementById("passwordChangeMessage");

    // Hide form by default
    emailChangeForm.style.display = "none";
    passwordChangeForm.style.display = "none";

    // Show form when clicking the button
    changeEmailBtn.addEventListener("click", function () {
        emailChangeForm.style.display = "block";
    });

    changePasswordBtn.addEventListener("click", function () {
        passwordChangeForm.style.display = "block";
    });

    // Handle email update form submission
    document.querySelector(".emailChangeForm form").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent form refresh

        const newEmail = document.querySelector(".emailChangeForm input[name='email']").value;

        fetch("/update-email", {
            method: "POST",
            body: JSON.stringify({ email: newEmail }),
            headers: { "Content-Type": "application/json" }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                emailChangeMessage.style.color = "green";
                emailChangeMessage.textContent = "Email updated successfully!";
                document.getElementById("email").textContent = newEmail; // Update displayed email
                setTimeout(() => {
                    emailChangeForm.style.display = "none"; // Hide form after success
                    emailChangeMessage.textContent = ""; // Clear message
                }, 2000);
            } else {
                emailChangeMessage.style.color = "red";
                emailChangeMessage.textContent = data.message;
            }
        })
        .catch(error => {
            emailChangeMessage.style.color = "red";
            emailChangeMessage.textContent = "An error occurred. Please try again.";
            console.error("Error:", error);
        });
    });

       // Handle password change form submission
       document.querySelector(".passwordChangeForm form").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent form refresh

        const currentPassword = document.querySelector(".passwordChangeForm input[name='current_password']").value;
        const newPassword = document.querySelector(".passwordChangeForm input[name='new_password']").value;
        const confirmPassword = document.querySelector(".passwordChangeForm input[name='confirm_password']").value;

        if (newPassword.length < 8) {
            passwordChangeMessage.style.color = "red";
            passwordChangeMessage.textContent = "Password must be at least 8 characters.";
            return;
        }

        if (newPassword !== confirmPassword) {
            passwordChangeMessage.style.color = "red";
            passwordChangeMessage.textContent = "Passwords do not match.";
            return;
        }

        fetch("/update-password", {
            method: "POST",
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            }),
            headers: { "Content-Type": "application/json" }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                passwordChangeMessage.style.color = "green";
                passwordChangeMessage.textContent = "Password updated successfully!";
                setTimeout(() => {
                    passwordChangeForm.style.display = "none"; // Hide form after success
                    passwordChangeMessage.textContent = ""; // Clear message
                }, 2000);
            } else {
                passwordChangeMessage.style.color = "red";
                passwordChangeMessage.textContent = data.message;
            }
        })
        .catch(error => {
            passwordChangeMessage.style.color = "red";
            passwordChangeMessage.textContent = "An error occurred. Please try again.";
            console.error("Error:", error);
        });
    });
});


document.getElementById("delete-account").addEventListener("click", function() {
    const messageBox = document.getElementById("message-box");

    messageBox.style.display = "block";

    // Handle confirmation
    document.getElementById("confirm-delete").addEventListener("click", function() {
        fetch("/delete-account", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                messageBox.innerHTML = "<p>Account deleted successfully. Redirecting...</p>";
                setTimeout(() => {
                    window.location.href = data.redirect_url; // Redirect to home
                }, 2000);
            } else {
                messageBox.innerHTML = "<p>Error: " + data.message + "</p>";
            }
        })
        .catch(error => {
            messageBox.innerHTML = "<p>Something went wrong. Please try again later.</p>";
        });
    });

    // Handle cancel action
    document.getElementById("cancel-delete").addEventListener("click", function() {
        messageBox.style.display = "none";
    });
});