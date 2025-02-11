
// Hide the loading screen when the page fully loads
window.onload = function() {
    setTimeout(() => {
        document.getElementById("loading-screen").style.display = "none";
    }, 1800);
};

//news subscription

function subscribeNewsletter() {
    let email = document.getElementById("email").value;

    fetch("/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email })
    })
    .then(response => response.json())
    .then(data => {
        let messageElement = document.getElementById("message");

        if (data.error) {
            messageElement.style.color = "red";  // Display error in red
            messageElement.textContent = data.error;
        } else {
            messageElement.style.color = "green";  // Display success in green
            messageElement.textContent = data.message;
        }
    })
    .catch(error => console.error("Error:", error));
}
