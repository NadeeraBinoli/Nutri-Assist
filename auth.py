from flask import Blueprint, request, jsonify, session
import mysql.connector
from flask_mail import Mail, Message
import re
import random
from werkzeug.security import generate_password_hash

auth = Blueprint("auth", __name__)

# Database Connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="1234",
    database="mealPlanner"
)
cursor = db.cursor()

# Configure Flask-Mail
mail = Mail()

@auth.route("/signup", methods=["POST"])
def signup():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    confirm_password = data.get("confirm_password")
    newsletter = data.get("newsletter")

    # Validate input fields
    if not name or not email or not password or not confirm_password:
        return jsonify({"error": "All fields are required!"}), 400

    # Validate email format
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if not re.match(email_regex, email):
        return jsonify({"error": "Invalid email format!"}), 400

    # Validate password strength
    if len(password) < 8 or not re.search(r"\d", password) or not re.search(r"[A-Za-z]", password) or not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return jsonify({"error": "Password must be at least 8 characters long and include letters, numbers, and symbols!"}), 400

    # Ensure passwords match
    if password != confirm_password:
        return jsonify({"error": "Passwords do not match!"}), 400

    try:
        # Check if email already exists
        cursor.execute("SELECT * FROM User WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"error": "Email is already registered!"}), 400

        # Generate OTP
        otp = str(random.randint(100000, 999999))  # 6-digit OTP
        session[email] = {"otp": otp, "name": name, "password": password, "newsletter": newsletter}  

        # Send OTP Email
        msg = Message("Your OTP for Meal Planner", recipients=[email])
        msg.body = f"Hello {name},\n\nYour OTP for account verification is: {otp}\n\nEnter this code on the website to complete your registration.\n\nBest Regards,\nMeal Planner Team"
        mail.send(msg)

        return jsonify({"message": "OTP sent to your email. Please enter it to verify your account."}), 200

    except mysql.connector.Error:
        return jsonify({"error": "Database error, please try again later!"}), 500


@auth.route("/verify_otp", methods=["POST"])
def verify_otp():
    data = request.json
    email = data.get("email")
    entered_otp = data.get("otp")

    if email not in session or "otp" not in session[email]:
        return jsonify({"error": "OTP expired or not requested!"}), 400

    if session[email]["otp"] != entered_otp:
        return jsonify({"error": "Invalid OTP!"}), 400

    try:
        # OTP verified, now save user in DB
        name = session[email]["name"]
        password = session[email]["password"]
        newsletter = session[email]["newsletter"]

        # Hash the password before saving
        hashed_password = generate_password_hash(password)

        cursor.execute("INSERT INTO User (name, email, password) VALUES (%s, %s, %s)", (name, email, hashed_password))
        db.commit()

        # If the user opted for the newsletter, add their email
        if newsletter:
            cursor.execute("INSERT IGNORE INTO NewsletterSubscribers (email) VALUES (%s)", (email,))
            db.commit()

        # Send Welcome Email
        msg = Message("Welcome to Meal Planner!", recipients=[email])
        msg.body = f"Hello {name},\n\nThank you for signing up for Meal Planner! Get ready to plan your meals effortlessly.\n\nBest Regards,\nMeal Planner Team"
        mail.send(msg)

        # Remove session data after successful verification
        session.pop(email, None)

        return jsonify({"message": "Account verified and created successfully!"}), 200

    except mysql.connector.Error:
        return jsonify({"error": "Database error, please try again later!"}), 500
