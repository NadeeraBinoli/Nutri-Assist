from flask import Flask, request, jsonify, render_template, redirect, session, url_for
import mysql.connector
from flask_mail import Mail, Message
import re
from auth import auth
from dashboard import dashboard_bp
from recipe import load_parsed_recipes
from fuzzywuzzy import fuzz

app = Flask(__name__)
app.secret_key = "1e9ac1d030f2c0b496c6dd6aeb30424b"

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'bababablackship1999@gmail.com'
app.config['MAIL_PASSWORD'] = 'zden vlhw inos vbbx'
app.config['MAIL_DEFAULT_SENDER'] = 'bababablackship1999@gmail.com'

mail = Mail(app)

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="1234",
    database="mealPlanner"
)
cursor = db.cursor()

app.register_blueprint(auth)
app.register_blueprint(dashboard_bp, url_prefix='/dashboard')

@app.route("/")
@app.route("/index")
def home():
    return render_template("index.html")

@app.route("/signup")
def signup_page():
    return render_template("signUp.html")

@app.route("/login")
def login_page():
    return render_template("Login.html")

@app.route("/dashboard")
def dashboard():
    if "user_id" not in session:
        return redirect(url_for("login_page"))
    return render_template("dashboard.html", user_name=session.get("user_name"))

@app.route("/forgot_password", methods=["POST"])
def forgot_password():
    email = request.json.get("email")
    return jsonify({"message": "Password reset link has been sent to your email."})

@app.route("/preference")
def preference():
    if "user_id" not in session:
        return redirect(url_for("login_page"))
    return render_template("preference.html", user_name=session.get("user_name"))

@app.route("/healthTracker")
def healthTracker():
    if "user_id" not in session:
        return redirect(url_for("login_page"))
    return render_template("healthTracker.html", user_name=session.get("user_name"))

@app.route('/grocery')
def grocery():
    return render_template('grocery.html')

recipes = load_parsed_recipes(limit=200)

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

@app.route("/account")
def account():
    if "user_id" not in session:
        return redirect(url_for("login_page"))
    
    user_name = session.get("user_name", "Unknown User")
    user_email = session.get("user_email", "Not Available")

    return render_template("account.html", user_name=user_name, user_email=user_email)

@app.route("/reset_password/<token>", methods=["GET", "POST"])
def reset_password(token):
    if request.method == "POST":
        data = request.get_json()
        new_password = data.get("newPassword")
        confirm_password = data.get("confirmPassword")
        return jsonify({"message": "Password reset successful."})
    elif request.method == "GET":
        return render_template("reset_password.html")

@app.route("/subscribe", methods=["POST"])
def subscribe():
    data = request.json
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if not re.match(email_regex, email):
        return jsonify({"error": "Invalid email format. Please enter a valid email address."}), 400
    
    try:
        cursor.execute("SELECT * FROM NewsletterSubscribers WHERE email = %s", (email,))
        existing_email = cursor.fetchone()
        if existing_email:
            return jsonify({"error": "This email is already subscribed."}), 400
        
        cursor.execute("INSERT INTO NewsletterSubscribers (email) VALUES (%s)", (email,))
        db.commit()

        msg = Message("Subscription Confirmed",
                      recipients=[email])
        msg.body = f"Hello,\n\nThank you for subscribing to our newsletter! You'll receive the latest updates from us.\n\nLove from,\nNutri-Assist Team"
        mail.send(msg)

        return jsonify({"message": "Subscribed successfully! Confirmation email sent."}), 200

    except mysql.connector.Error as err:
        return jsonify({"error": "Database error, please try again later."}), 500
    
@app.route("/recipe_detail")
def recipe_detail():
    recipe_url = request.args.get('url')
    if not recipe_url:
        return "Recipe URL not provided", 400

    found_recipe = None
    for recipe in recipes:
        if recipe.get('url') == recipe_url:
            found_recipe = recipe
            break

    if found_recipe:
        return render_template('recipe_detail.html', recipe=found_recipe)
    else:
        return "Recipe not found", 404


@app.route("/save_recipe", methods=["POST"])
def save_recipe():
    try:
        data = request.get_json()
        title = data.get('title')
        instructions = data.get('instructions')
        category = data.get('category')
        date_of_meal = data.get('date_of_meal')

        if not title or not instructions or not category or not date_of_meal:
            return jsonify({"error": "Missing recipe data"}), 400

        sql = "INSERT INTO recipe (name, instructions, category, date_of_meal) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (title, instructions, category, date_of_meal))
        db.commit()

        return jsonify({"message": "Recipe saved successfully!"}), 200

    except mysql.connector.Error as err:
        print(f"MySQL Error saving recipe: {err}") # Print the detailed MySQL error
        return jsonify({"error": "Database error, please try again later."}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500


if __name__ == "__main__":
    app.run(debug=True)