from flask import Blueprint, request, jsonify, session, url_for,redirect
import mysql.connector
from flask_mail import Mail, Message
import re
import random
from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash
import jwt
import datetime
import os
from flask import session

JWT_SECRET_KEY = 'e413e7954a58ec7b52980e80fd2925b3bcc1ac407cb1b968ea837897c4c5f397'
JWT_RESET_KEY = 'a18eda8b3df31bb67f50479a01797ec4846f663bd5287f61025e670b9a086e64'

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
        return jsonify({"error": "Invalid OTP! Please try again."}), 400

    try:
        # OTP verified, now save user in DB
        name = session[email]["name"]
        password = session[email]["password"]
        newsletter = session[email]["newsletter"]

        # Hash the password before saving
        hashed_password = generate_password_hash(password)

        # Insert user into the database
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



@auth.route("/resend_otp", methods=["POST"])
def resend_otp():
    cursor = db.cursor(buffered=True)
    data = request.json
    email = data.get("email")

    if email not in session:
        return jsonify({"error": "OTP session expired or not requested!"}), 400

    name = session[email]["name"]

    try:
        # Generate a new OTP
        new_otp = str(random.randint(100000, 999999))
        session[email]["otp"] = new_otp

        # Send OTP Email
        msg = Message("Your New OTP for Meal Planner", recipients=[email])
        msg.body = f"Hello {name},\n\nYour new OTP for account verification is: {new_otp}\n\nEnter this code on the website to complete your registration.\n\nBest Regards,\nMeal Planner Team"
        mail.send(msg)

        return jsonify({"message": "A new OTP has been sent to your email."}), 200

    except mysql.connector.Error:
        return jsonify({"error": "Database error, please try again later!"}), 500




@auth.route("/login", methods=["POST"])
def login():
    cursor = db.cursor(buffered=True)
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "All fields are required!"}), 400

        cursor.execute("SELECT * FROM User WHERE email = %s", (email,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "Invalid email or password!"}), 401

        # Fetch actual column names from the database
        columns = [column[0] for column in cursor.description]
        user_dict = {key.lower(): value for key, value in zip(columns, user)}

        if not check_password_hash(user_dict["password"], password):
            return jsonify({"error": "Invalid email or password!"}), 401

        # Store user info in session
        session["user_id"] = user_dict["userid"]  # Adjust based on actual column name
        session["user_name"] = user_dict["name"]
        session["user_email"] = user_dict["email"]

        # Generate JWT token
        token = jwt.encode({
            'user_id': user_dict['userid'],
            'email': user_dict['email'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
        }, JWT_SECRET_KEY, algorithm='HS256')

        return jsonify({
            "message": "Login successful!",
            "token": token,
            "user": {
                "id": user_dict['userid'],
                "name": user_dict['name'],
                "email": user_dict['email']
            },
            "redirect": url_for('dashboard')  # Redirect user after login
        }), 200

    except mysql.connector.Error:
        return jsonify({"error": "Database error, please try again later!"}), 500
    except Exception:
        return jsonify({"error": "An unexpected error occurred!"}), 500

@auth.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login_page"))

@auth.route("/forgot_password", methods=["POST"])
def forgot_password():
    cursor = db.cursor(buffered=True)
    data = request.json
    email = data.get("email")
    
    if not email:
        return jsonify({"error": "Email is required!"}), 400
    
    # Check if the email exists
    cursor.execute("SELECT * FROM User WHERE email = %s", (email,))
    user = cursor.fetchone()
    
    if not user:
        return jsonify({"error": "Email not found!"}), 404
    
    # Generate reset token
    reset_token = jwt.encode({
        'email': email,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # Expires in 1 hour
    }, JWT_RESET_KEY, algorithm='HS256')
    
    reset_link = url_for('auth.reset_password', token=reset_token, _external=True)
    
    # Send Reset Email
    msg = Message("Password Reset Request", recipients=[email])
    msg.body = f"""Hello,
    Click the link below to reset your password:
        {reset_link}

    If you did not request a password reset, please ignore this email.

    Best Regards,
    Meal Planner Team"""

    mail.send(msg)

    return jsonify({"message": "Password reset link has been sent to your email."}), 200

@auth.route("/update-email", methods=["POST"])
def update_email():
    cursor = db.cursor(buffered=True)
    if "user_id" not in session:
        return jsonify({"success": False, "message": "User not logged in."}), 401

    data = request.json
    new_email = data.get("email")

    if not new_email:
        return jsonify({"success": False, "message": "Email cannot be empty."})

    if "@" not in new_email or "." not in new_email:
        return jsonify({"success": False, "message": "Invalid email format."})

    user_id = session["user_id"]

    try:
        # Update email in the database
        cursor.execute("UPDATE user SET email = %s WHERE userId = %s", (new_email, user_id))
        db.commit()

        # Fetch the updated email from the database
        cursor.execute("SELECT email FROM user WHERE userId = %s", (user_id,))
        updated_email = cursor.fetchone()[0]

        # Update session with the new email
        session["user_email"]= updated_email
        session.modified = True  # 🔥 This forces Flask to recognize session changes

        return jsonify({"success": True, "new_email": updated_email})
    
    except mysql.connector.Error as e:
        return jsonify({"success": False, "message": f"Database error: {str(e)}"})
    
    except Exception as e:
        return jsonify({"success": False, "message": "An unexpected error occurred."})


@auth.route("/delete-account", methods=["POST"])
def delete_account():
    cursor = db.cursor(buffered=True)
    if "user_id" not in session:
        return jsonify({"success": False, "message": "User not logged in."}), 401

    user_id = session["user_id"]

    try:
        # Delete user from the database
        cursor.execute("DELETE FROM user WHERE userId = %s", (user_id,))
        db.commit()

        # Clear session to log the user out
        session.clear()

        return jsonify({"success": True, "message": "Account deleted successfully.", "redirect_url": url_for('main.home')})
    
    except mysql.connector.Error as e:
        return jsonify({"success": False, "message": f"Database error: {str(e)}"})
    
    except Exception as e:
        return jsonify({"success": False, "message": "An unexpected error occurred."})


# @auth.route("/reset_password/<token>", methods=["POST"])
# def reset_password(token):
#     cursor = db.cursor(buffered=True)
#     try:
#         # Decode JWT token to get email
#         data = jwt.decode(token, JWT_RESET_KEY, algorithms=["HS256"])
#         email = data.get("email")
#     except jwt.ExpiredSignatureError:
#         return jsonify({"error": "Reset link expired!"}), 400
#     except jwt.InvalidTokenError:
#         return jsonify({"error": "Invalid reset link!"}), 400
    
#     data = request.json
#     new_password = data.get("newPassword")
#     confirm_password = data.get("confirmPassword")
    
#     # Check if password and confirm password fields are provided
#     if not new_password or not confirm_password:
#         return jsonify({"error": "All fields are required!"}), 400
    
#     # Check if passwords match
#     if new_password != confirm_password:
#         return jsonify({"error": "Passwords do not match!"}), 400
    
#     # Check if password length is valid
#     if len(new_password) < 8:
#         return jsonify({"error": "Password must be at least 8 characters long!"}), 400
    
#     hashed_password = generate_password_hash(new_password)

#     # Update password in the database
#     try:
#         cursor = db.cursor()
#         cursor.execute("UPDATE User SET password = %s WHERE email = %s", (hashed_password, email))
#         db.commit()
#         return jsonify({"message": "Password has been reset successfully!"}), 200
#     except mysql.connector.Error:
#         return jsonify({"error": "Database error, please try again later!"}), 500
