// final working login
//  document.getElementById('loginForm').addEventListener('submit', async function(e) {
//     e.preventDefault();
    
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     const messageElement = document.getElementById('loginMessage'); // Fixed typo

//     try {
//         const response = await fetch('/login', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 email: email,
//                 password: password
//             })
//         });

//         const data = await response.json();

//         if (response.ok) {
//             // Store the token in localStorage
//             localStorage.setItem('token', data.token);
//             localStorage.setItem('user', JSON.stringify(data.user));
            
//             messageElement.style.color = 'green';
//             messageElement.textContent = data.message;
            
//             // Redirect to dashboard or home page after successful login
//             window.location.href = '/dashboard';  // Adjust the redirect URL as needed
//         } else {
//             messageElement.style.color = 'red';
//             messageElement.textContent = data.error;
//         }
//     } catch (error) {
//         messageElement.style.color = 'red';
//         messageElement.textContent = 'An error occurred. Please try again later.';
//         console.error('Error:', error);
//     }
// });



document.addEventListener("DOMContentLoaded", function () {
    // FORM ELEMENTS
    const loginForm = document.getElementById("loginForm");
    const forgotPasswordForm = document.getElementById("forgotPasswordForm");

    // MESSAGE ELEMENTS
    const loginMessage = document.getElementById("loginMessage");
    const forgotPasswordMessage = document.getElementById("forgotPasswordMessage");

    // LINK ELEMENTS
    const forgotPasswordLink = document.getElementById("forgotPasswordLink");


    // FUNCTION: SHOW SPECIFIC FORM
    function showForm(formToShow) {
        loginForm.style.display = formToShow === "login" ? "block" : "none";
        forgotPasswordForm.style.display = formToShow === "forgot" ? "block" : "none";
    }

    // EVENT LISTENERS FOR SWITCHING FORMS
    if (forgotPasswordLink) forgotPasswordLink.addEventListener("click", () => showForm("forgot"));

    // ✅ LOGIN FUNCTIONALITY
    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const response = await fetch("/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    // Store the token in localStorage
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));

                    loginMessage.style.color = "green";
                    loginMessage.textContent = data.message;

                    // Redirect to dashboard
                    window.location.href = "/dashboard";  
                } else {
                    loginMessage.style.color = "red";
                    loginMessage.textContent = data.error;
                }
            } catch (error) {
                loginMessage.style.color = "red";
                loginMessage.textContent = "An error occurred. Please try again later.";
                console.error("Error:", error);
            }
        });
    }

    // ✅ FORGOT PASSWORD FUNCTIONALITY
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const email = document.querySelector("#forgotPasswordForm input[name='email']").value;

            try {
                const response = await fetch("/forgot_password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                });

                const data = await response.json();

                if (response.ok) {
                    forgotPasswordMessage.style.color = "green";
                    forgotPasswordMessage.textContent = data.message;
                } else {
                    forgotPasswordMessage.style.color = "red";
                    forgotPasswordMessage.textContent = data.error;
                }
            } catch (error) {
                forgotPasswordMessage.style.color = "red";
                forgotPasswordMessage.textContent = "An error occurred. Please try again.";
                console.error("Error:", error);
            }
        });
    }

});