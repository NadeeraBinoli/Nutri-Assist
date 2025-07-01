from flask import Flask, request, jsonify, render_template,redirect,session, url_for
import mysql.connector # Connects to the MySQL database.
from flask_mail import Mail, Message
import re  # Regular expression for email validation
from auth import auth  # Import the new auth module 
#import os   For environment variables
from dashboard import dashboard_bp  # Import the dashboard Blueprint
#from waitress import serve
from flask import Flask, render_template
from recipe import load_parsed_recipes
from fuzzywuzzy import fuzz



app = Flask(__name__) # Creates a Flask web application instance.
# Configure Flask Secret Key for Sessions (Change this to a secure key)
app.secret_key = "1e9ac1d030f2c0b496c6dd6aeb30424b"

# Configure Flask-Mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'  # Use your SMTP provider. Its specifies the mail server (Gmail in this case)
app.config['MAIL_PORT'] = 587 # Uses port 587 (TLS) for secure communication.
app.config['MAIL_USE_TLS'] = True # Enables TLS (Transport Layer Security) for encryption.
app.config['MAIL_USERNAME'] = 'bababablackship1999@gmail.com' # os.getenv('MAIL_USERNAME')  # Your email
app.config['MAIL_PASSWORD'] = 'zden vlhw inos vbbx' # os.getenv('MAIL_PASSWORD') # App password (not your main password)
app.config['MAIL_DEFAULT_SENDER'] = 'bababablackship1999@gmail.com'  # Use environment variables for security

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
app.register_blueprint(dashboard_bp, url_prefix='/dashboard')

# Define Routes

@app.route("/")
@app.route("/index")
def home():
    return render_template("index.html")

@app.route("/signup")
def signup_page():
    return render_template("signUp.html")  # Ensure this file exists in 'templates/'

@app.route("/login")
def login_page():
    return render_template("Login.html")  # Ensure this file exists in 'templates/'

@app.route("/dashboard")
def dashboard():
    if "user_id" not in session:
        return redirect(url_for("login_page"))  # Redirect if not logged in
    return render_template("dashboard.html", user_name=session.get("user_name"))

@app.route("/forgot_password", methods=["POST"])
def forgot_password():
    email = request.json.get("email")
    # Logic to handle the email and send a reset link
    return jsonify({"message": "Password reset link has been sent to your email."})

@app.route("/preference")
def preference():
    if "user_id" not in session:
        return redirect(url_for("login_page"))  # Redirect if not logged in
    return render_template("preference.html", user_name=session.get("user_name"))

@app.route("/healthTracker")
def healthTracker():
    if "user_id" not in session:
        return redirect(url_for("login_page"))  # Redirect if not logged in
    return render_template("healthTracker.html", user_name=session.get("user_name"))

@app.route('/grocery')
def grocery():
    return render_template('grocery.html')

##############################################
recipes = load_parsed_recipes(limit=200) # Reduced limit for faster loading

@app.route('/recipe')
def recipe():
    return render_template('recipe.html', recipes=recipes)

@app.route('/api/recipes')
def api_recipes():
    try:
        search_query = request.args.get('search', '').lower()
        if search_query:
            filtered_recipes = []
            best_match_title = None
            highest_score = 0

            for r in recipes:
                title_score = fuzz.partial_ratio(search_query, r['title'].lower())
                ingredients_score = max([fuzz.partial_ratio(search_query, i.lower()) for i in r['ingredients']]) if r['ingredients'] else 0
                
                if title_score > 70 or ingredients_score > 70:
                    filtered_recipes.append(r)
                
                current_best_score = max(title_score, ingredients_score)
                if current_best_score > highest_score:
                    highest_score = current_best_score
                    best_match_title = r['title']

            response_data = {'recipes': filtered_recipes}
            if not filtered_recipes and best_match_title and highest_score > 50:
                response_data['suggestion'] = best_match_title
            
            return jsonify(response_data)
        return jsonify({'recipes': recipes})
    except Exception as e:
        print(f"Error in /api/recipes: {e}")
        return jsonify({'error': 'Internal Server Error'}), 500

##############################################

@app.route("/account")
def account():
    if "user_id" not in session:
        return redirect(url_for("login_page"))  # Redirect if not logged in
    
    # Retrieve the values from the session, defaulting to an empty string or None if not found
    user_name = session.get("user_name", "Unknown User")
    user_email = session.get("user_email", "Not Available")

    return render_template("account.html", user_name=user_name, user_email=user_email)


@app.route("/reset_password/<token>", methods=["GET", "POST"])
def reset_password(token):
    if request.method == "POST":
        data = request.get_json()
        new_password = data.get("newPassword")
        confirm_password = data.get("confirmPassword")
        # Handle resetting password logic here
        return jsonify({"message": "Password reset successful."})
    elif request.method == "GET":
        # You can return the form or some confirmation message here if needed
        return render_template("reset_password.html")  # Show the reset password form


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
   # # serve(app, host="0.0.0.0", port = 5000)
    app.run(debug=True)
