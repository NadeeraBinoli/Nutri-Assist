let eyeIcon = document.getElementById("eyeIcon");
let password = document.getElementById("password");

eyeIcon.onclick = function(){
 if(password.type =="password"){
      password.type = "text";
      eyeIcon.src = "/static/images/eye-open.png";
      }else{
            password.type = "password";
            eyeIcon.src = "/static/images/eye-close.png";
            }
            }

// Form elements
const signupForm = document.getElementById("signupForm");
const otpForm = document.getElementById("otpForm");
const messageElement = document.getElementById("signMessage");
const otpMessageElement = document.getElementById("otpMessage");
// const hideDisplay = document.getElementsByClassName("hideDisplay");

// Signup form submission
signupForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    console.log("Signup form submitted");
    
    const formData = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value,
        confirm_password: document.getElementById("confirm_password").value,
        newsletter: document.getElementById("newsletter").checked
    };

    // Check terms
    if (!document.getElementById("terms").checked) {
        messageElement.style.color = "red";
        messageElement.textContent = "You must agree to the Terms of Use and Privacy Policy!";
        return;
    }

    try {
        const response = await fetch("/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        console.log("Signup response:", data);
        
        if (data.error) {
            messageElement.style.color = "red";
            messageElement.textContent = data.error;
        } else {
            messageElement.style.color = "green";
            messageElement.textContent = data.message;
            signupForm.style.display = "none";
            // hideDisplay.style.display = "none";
            otpForm.style.display = "block";
        }
    } catch (error) {
        console.error("Signup error:", error);
        messageElement.style.color = "red";
        messageElement.textContent = "An error occurred. Please try again.";
    }
});

// Debug check for OTP form and button
console.log("OTP Form element:", otpForm);
console.log("OTP Button element:", document.querySelector("#otpForm button"));

document.querySelector("#otpForm button").addEventListener("click", async function(event) {
    event.preventDefault();
    console.log("OTP Submit clicked");
    
    const email = document.getElementById("email").value.trim();
    const otp = document.getElementById("otp").value.trim();
    
    console.log("Email value:", email);
    console.log("OTP value:", otp);
    
    if (!otp) {
        console.log("OTP is empty");
        otpMessageElement.style.color = "red";
        otpMessageElement.textContent = "Please enter the OTP";
        return;
    }

    console.log("Attempting to send OTP verification request");
    try {
        console.log("Sending data:", { email, otp });
        const response = await fetch("/verify_otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp })
        });

        const data = await response.json();
        console.log("Response data:", data);
        
        if (data.error) {
            otpMessageElement.style.color = "red";
            otpMessageElement.textContent = data.error;
            otpMessageElement.style.fontWeight = "bold";  // Make it more visible
            otpMessageElement.style.animation = "shake 0.3s"; // Add a shake effect (CSS needed)
        } else {
            otpMessageElement.style.color = "green";
            otpMessageElement.textContent = "Account verified successfully! Redirecting to login...";
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);
        }
    } catch (error) {
        console.error("OTP verification error:", error);
        otpMessageElement.style.color = "red";
        otpMessageElement.textContent = "An error occurred. Please try again.";
    }
});



document.getElementById("resendOtpButton").addEventListener("click", async function() {
    console.log("Resend OTP button clicked");

    const email = document.getElementById("email").value.trim();
    
    if (!email) {
        otpMessageElement.style.color = "red";
        otpMessageElement.textContent = "Email is required to resend OTP!";
        return;
    }

    try {
        const response = await fetch("/resend_otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        console.log("Resend OTP response:", data);

        if (data.error) {
            otpMessageElement.style.color = "red";
            otpMessageElement.textContent = data.error;
        } else {
            otpMessageElement.style.color = "green";
            otpMessageElement.textContent = data.message;
        }
    } catch (error) {
        console.error("Resend OTP error:", error);
        otpMessageElement.style.color = "red";
        otpMessageElement.textContent = "An error occurred. Please try again.";
    }
});
