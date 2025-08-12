from flask import Flask, request, jsonify, render_template, redirect, session, url_for
import mysql.connector
from flask_mail import Mail, Message
import re
from auth import auth
from dashboard import dashboard_bp, _get_health_profile_data
from recipe import load_parsed_recipes
from fuzzywuzzy import fuzz
from database import get_connection 

app = Flask(__name__)
app.secret_key = "1e9ac1d030f2c0b496c6dd6aeb30424b"

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'bababablackship1999@gmail.com'
app.config['MAIL_PASSWORD'] = 'zden vlhw inos vbbx'
app.config['MAIL_DEFAULT_SENDER'] = 'bababablackship1999@gmail.com'

mail = Mail(app)

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
    
    health_profile_data = _get_health_profile_data(session["user_id"])

    return render_template("dashboard.html", user_name=session.get("user_name"), health_profile=health_profile_data)

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
    
    health_profile_data = _get_health_profile_data(session["user_id"])

    return render_template("healthTracker.html", user_name=session.get("user_name"), health_profile=health_profile_data)

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
    
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM NewsletterSubscribers WHERE email = %s", (email,))
        existing_email = cursor.fetchone()
        if existing_email:
            return jsonify({"error": "This email is already subscribed."}), 400
        
        cursor.execute("INSERT INTO NewsletterSubscribers (email) VALUES (%s)", (email,))
        connection.commit()

        msg = Message("Subscription Confirmed",
                      recipients=[email])
        msg.body = f"Hello,\n\nThank you for subscribing to our newsletter! You'll receive the latest updates from us.\n\nLove from,\nNutri-Assist Team"
        mail.send(msg)

        return jsonify({"message": "Subscribed successfully! Confirmation email sent."}), 200
    except Exception as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

    
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
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized. Please log in to save recipes."}), 401
        
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor()
        user_id = session["user_id"]
        data = request.get_json()
        title = data.get('title')
        instructions = data.get('instructions')
        category = data.get('category')
        date_of_meal = data.get('date_of_meal')
        image = data.get('image')

        # Extract nutritional info
        calories = data.get('calories')
        protein = data.get('protein')
        fat = data.get('fat')
        carbs = data.get('carbs')

        if not title or not instructions or not category or not date_of_meal:
            return jsonify({"error": "Missing recipe data"}), 400

        # Insert into recipe table
        sql = "INSERT INTO recipe (name, instructions, category, date_of_meal, userID, image_url) VALUES (%s, %s, %s, %s, %s, %s)"
        cursor.execute(sql, (title, instructions, category, date_of_meal, user_id, image))
        connection.commit()

        recipe_id = cursor.lastrowid # Get the ID of the newly inserted recipe

        # Insert into nutritionalinfo table
        if recipe_id:
            nutritional_sql = "INSERT INTO nutritionalinfo (recipeID, calories, protein, fats, carbs) VALUES (%s, %s, %s, %s, %s)"
            cursor.execute(nutritional_sql, (recipe_id, calories, protein, fat, carbs))
            connection.commit()

        # Extract and save ingredients with parsed amounts and units
        ingredients_list = data.get('ingredients', [])
        if ingredients_list and isinstance(ingredients_list, list):
            ingredient_sql = "INSERT INTO recipeingredients (recipeID, ingredient, amount, unit, userID) VALUES (%s, %s, %s, %s, %s)"
            grocery_list_sql = "INSERT INTO grocerylistitems (userID, itemName, amount) VALUES (%s, %s, %s)"

            for item in ingredients_list:
                ingredient_name = item.strip()
                amount = None
                unit = None
                amount_display = "N/A"

                # Attempt to parse "amount unit ingredient" or "amount ingredient"
                # Example: "1.5 kg flour", "2 cups sugar", "3 eggs"
                match = re.match(r'(\d+\.?\d*)\s*([a-zA-Z]+)?\s*(.*)', ingredient_name)
                if match:
                    numeric_part = float(match.group(1))
                    unit_part = match.group(2)
                    remaining_part = match.group(3).strip()

                    # Standardize units
                    if unit_part:
                        unit_part = unit_part.lower()
                        if unit_part in ["kg", "kilogram", "kilograms"]:
                            unit = "kg"
                        elif unit_part in ["g", "gram", "grams"]:
                            unit = "g"
                        elif unit_part in ["ml", "milliliter", "milliliters"]:
                            unit = "ml"
                        elif unit_part in ["l", "liter", "liters"]:
                            unit = "l"
                        elif unit_part in ["cup", "cups"]:
                            unit = "cup"
                        elif unit_part in ["tbsp", "tablespoon", "tablespoons"]:
                            unit = "tbsp"
                        elif unit_part in ["tsp", "teaspoon", "teaspoons"]:
                            unit = "tsp"
                        elif unit_part in ["pc", "pcs", "piece", "pieces"]:
                            unit = "pc"
                        else:
                            # If unit is not recognized, treat the whole numeric part + unit as part of the ingredient name
                            remaining_part = f"{numeric_part} {unit_part} {remaining_part}".strip()
                            numeric_part = None
                            unit = None
                    
                    if numeric_part is not None:
                        amount = numeric_part
                        ingredient_name = remaining_part
                        amount_display = f"{amount} {unit or ''}".strip()
                    else:
                        # If no numeric part or unit, or unit not recognized, keep original item as ingredient name
                        ingredient_name = item.strip()
                        amount = None
                        unit = None
                        amount_display = "N/A"
                else:
                    # If no match, keep original item as ingredient name
                    ingredient_name = item.strip()
                    amount = None
                    unit = None
                    amount_display = "N/A"
                
                try:
                    cursor.execute(ingredient_sql, (recipe_id, ingredient_name, amount, unit, user_id))
                    # Also insert into grocerylistitems
                    cursor.execute(grocery_list_sql, (user_id, ingredient_name, amount_display))
                except mysql.connector.Error as err:
                    print(f"MySQL Error inserting ingredient or grocery item: {err}")
            connection.commit()

        return jsonify({"message": "Recipe saved successfully!"}), 200

    except mysql.connector.Error as err:
        print(f"MySQL Error saving recipe: {err}") # Print the detailed MySQL error
        return jsonify({"error": "Database error, please try again later."}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


import datetime
from collections import defaultdict
import re

@app.route("/api/generate_grocery_list", methods=["GET"])
def generate_grocery_list():
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized. Please log in to generate a grocery list."}), 401

    user_id = session["user_id"]
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        # Fetch items directly from grocerylistitems table
        query = "SELECT itemName AS ingredient, amount FROM grocerylistitems WHERE userID = %s"
        cursor.execute(query, (user_id,))
        grocery_list = cursor.fetchall()

        return jsonify({"grocery_list": grocery_list}), 200

    except mysql.connector.Error as err:
        print(f"MySQL Error generating grocery list: {err}")
        return jsonify({"error": "Database error, please try again later."}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@app.route("/api/kitchen_stock", methods=["POST"])
def add_kitchen_stock():
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized. Please log in to add kitchen stock."}), 401

    user_id = session["user_id"]
    data = request.json
    item_name = data.get("itemName")
    amount = data.get("amount")

    if not item_name:
        return jsonify({"error": "Item name is required."}), 400

    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor()
        sql = "INSERT INTO kitchenstocklist (userID, itemName, amount) VALUES (%s, %s, %s)"
        cursor.execute(sql, (user_id, item_name, amount))
        connection.commit()
        return jsonify({"message": "Item added to kitchen stock successfully!"}), 200
    except mysql.connector.Error as err:
        print(f"MySQL Error adding kitchen stock: {err}")
        return jsonify({"error": "Database error, please try again later."}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.route("/api/kitchen_stock", methods=["GET"])
def get_kitchen_stock():
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized. Please log in to view kitchen stock."}), 401

    user_id = session["user_id"]
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True) # Return rows as dictionaries
        sql = "SELECT kitchenStockListID, itemName, amount FROM kitchenstocklist WHERE userID = %s"
        cursor.execute(sql, (user_id,))
        kitchen_stock_items = cursor.fetchall()
        return jsonify({"kitchen_stock": kitchen_stock_items}), 200
    except mysql.connector.Error as err:
        print(f"MySQL Error fetching kitchen stock: {err}")
        return jsonify({"error": "Database error, please try again later."}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.route("/api/kitchen_stock/<int:item_id>", methods=["DELETE"])
def delete_kitchen_stock(item_id):
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized. Please log in to delete kitchen stock."}), 401

    user_id = session["user_id"]
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor()
        sql = "DELETE FROM kitchenstocklist WHERE kitchenStockListID = %s AND userID = %s"
        cursor.execute(sql, (item_id, user_id))
        connection.commit()
        if cursor.rowcount > 0:
            return jsonify({"message": "Item deleted from kitchen stock successfully!"}), 200
        else:
            return jsonify({"error": "Item not found or you don't have permission to delete it."}), 404
    except mysql.connector.Error as err:
        print(f"MySQL Error deleting kitchen stock: {err}")
        return jsonify({"error": "Database error, please try again later."}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.route("/api/process_grocery_list", methods=["POST"])
def process_grocery_list():
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized. Please log in."}), 401

    user_id = session["user_id"]
    data = request.json
    all_items = data.get("all_items", []) # All items currently displayed on the grocery list
    ticked_items = data.get("ticked_items", []) # Items that were ticked

    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor()

        for item in all_items:
            item_name = item.get("ingredient")
            item_amount = item.get("amount")

            if item_name in ticked_items:
                # If ticked, remove from grocerylistitems and add to kitchenstocklist
                delete_sql = "DELETE FROM grocerylistitems WHERE userID = %s AND itemName = %s"
                cursor.execute(delete_sql, (user_id, item_name))

                insert_kitchen_sql = "INSERT INTO kitchenstocklist (userID, itemName, amount) VALUES (%s, %s, %s)"
                cursor.execute(insert_kitchen_sql, (user_id, item_name, item_amount))
            # Unticked items remain in grocerylistitems, no action needed here
        
        connection.commit()
        return jsonify({"message": "Grocery list processed successfully!"}), 200

    except mysql.connector.Error as err:
        print(f"MySQL Error processing grocery list: {err}")
        return jsonify({"error": "Database error, please try again later."}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

if __name__ == "__main__":
    app.run(debug=True)