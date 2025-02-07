from flask import Flask, request, jsonify, render_template
import mysql.connector # Connects to the MySQL database.
from flask_mail import Mail, Message
import re  # Regular expression for email validation
from auth import auth  # Import the new auth module 
import os  # For environment variables

app = Flask(__name__) # Creates a Flask web application instance.
# Configure Flask Secret Key for Sessions (Change this to a secure key)
app.secret_key = "1e9ac1d030f2c0b496c6dd6aeb30424b"

# Configure Flask-Mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'  # Use your SMTP provider. Its specifies the mail server (Gmail in this case)
app.config['MAIL_PORT'] = 587 # Uses port 587 (TLS) for secure communication.
app.config['MAIL_USE_TLS'] = True # Enables TLS (Transport Layer Security) for encryption.
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME') #'bababablackship1999@gmail.com'  # Your email
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD') #'zden vlhw inos vbbx'  # App password (not your main password)
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')  # Use environment variables for security

mail = Mail(app) # Initializes Flask-Mail with the Flask app.

# Connect to MySQL
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="1234",
    database="mealPlanner"
)
cursor = db.cursor() # Creates a cursor object to execute SQL queries

# Register Blueprint
app.register_blueprint(auth)

# Define Routes

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/signup")
def signup_page():
    return render_template("signUp.html")  # Ensure this file exists in 'templates/'

@app.route("/login")
def login_page():
    return render_template("Login.html")  # Ensure this file exists in 'templates/'

@app.route("/subscribe", methods=["POST"])
def subscribe():
    data = request.json # Retrieves the JSON data from the front-end form.
    email = data.get("email") # Extracts the email address.

# If no email is provided, Flask returns an error response.
    if not email:
        return jsonify({"error": "Email is required"}), 400

# Validate the email format using regular expression
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if not re.match(email_regex, email):
        return jsonify({"error": "Invalid email format. Please enter a valid email address."}), 400
    
    try:
# Check if the email already exists in the database
        cursor.execute("SELECT * FROM NewsletterSubscribers WHERE email = %s", (email,))
        existing_email = cursor.fetchone()
        if existing_email:
            return jsonify({"error": "This email is already subscribed."}), 400
        
        cursor.execute("INSERT INTO NewsletterSubscribers (email) VALUES (%s)", (email,)) # Inserts the email into the database.
        db.commit() # Saves the changes permanently.

        # Send confirmation email
        msg = Message("Subscription Confirmed",
                      recipients=[email])
        msg.body = f"Hello,\n\nThank you for subscribing to our newsletter! You'll receive the latest updates from us.\n\nLove from,\nNutri-Assist Team"
        mail.send(msg)

        return jsonify({"message": "Subscribed successfully! Confirmation email sent."}), 200 # Returns a JSON response with a success message

    except mysql.connector.Error as err:
        return jsonify({"error": "Database error, please try again later."}), 500 # Catches any errors (e.g., duplicate email) and returns an error response.
    

if __name__ == "__main__":
    app.run(debug=True)
