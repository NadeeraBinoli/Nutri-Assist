from flask import Blueprint, request, jsonify, session
from database import get_connection 
import mysql.connector

# Create a Blueprint for the dashboard-related routes
dashboard_bp = Blueprint('dashboard', __name__)

# Route for saving user preferences
@dashboard_bp.route('/save_user_preferences', methods=['POST'])
def save_user_preferences():
    conn = get_connection()
    cursor = conn.cursor()
    # Check if the user is logged in by verifying session
    if "user_id" not in session:
        return jsonify({'status': 'error', 'message': 'User not logged in'})

    # Get the user_id from the session
    user_id = session["user_id"]

    # Get the user preferences from the request
    data = request.json

    # Check if user already has a row in Preference table
    cursor.execute("SELECT COUNT(*) FROM Preference WHERE userID = %s", (user_id,))
    result = cursor.fetchone()

    if result[0] == 0:
        # If no record exists, insert an empty row for the user
        insert_query = """
            INSERT INTO Preference (userID, dietPlan, foodTypes, allergies, medicalConditions, mealFrequency)
            VALUES (%s, '', '', '', '', '')
        """
        cursor.execute(insert_query, (user_id,))
        conn.commit()

    # Now update the record with actual user preferences
    update_query = """
        UPDATE Preference 
        SET dietPlan = %s, foodTypes = %s, allergies = %s, 
            medicalConditions = %s, mealFrequency = %s
        WHERE userID = %s
    """
    values = (data['dietPlan'], data['foodTypes'], data['allergies'], 
            data['medicalConditions'], data['mealFrequency'], user_id)

    cursor.execute(update_query, values)
    conn.commit()

    # Return success message
    return jsonify({'status': 'success', 'message': 'Preferences saved successfully!'})
    cursor.close()
    conn.close()


@dashboard_bp.route('/get_user_preferences', methods=['GET'])
def get_user_preferences():
    """ Fetches the user's saved preferences """
    if "user_id" not in session:
        return jsonify({'status': 'error', 'message': 'User not logged in'})

    user_id = session["user_id"]
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT dietPlan, foodTypes, allergies, medicalConditions, mealFrequency 
        FROM Preference WHERE userID = %s
    """
    cursor.execute(query, (user_id,))
    result = cursor.fetchone()

    if result:
        return jsonify({
            'status': 'success',
            'dietPlan': result[0],
            'foodTypes': result[1].split(', '),
            'allergies': result[2].split(', '),
            'medicalConditions': result[3].split(', '),
            'mealFrequency': result[4].split(', ')
        })
    else:
        return jsonify({'status': 'error', 'message': 'No preferences found'})
    cursor.close()
    conn.close()
    

@dashboard_bp.route('/calculate_bmi', methods=['POST'])
def calculate_bmi():
    try:
        data = request.json
        height = float(data['height'])
        weight = float(data['weight'])
        bmi = float(data['bmi'])
        user_id = session.get("user_id", 1) 
        
        conn = get_connection()
        cursor = conn.cursor()

        # Store BMI data in the database
        query = """
            INSERT INTO HealthProfile (userID, weight, height, bmi) 
            VALUES (%s, %s, %s, %s)
        """
        values = (user_id, weight, height, bmi)
        cursor.execute(query, values)
        conn.commit()

        return jsonify({"message": "BMI stored successfully", "bmi": bmi}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    cursor.close()
    conn.close()

@dashboard_bp.route('/get_saved_meals', methods=['GET'])
def get_saved_meals():
    if "user_id" not in session:
        return jsonify({'status': 'error', 'message': 'User not logged in'}), 401

    user_id = session["user_id"]
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        query = "SELECT recipeID, name, instructions, category, date_of_meal, image_url FROM recipe WHERE userID = %s ORDER BY date_of_meal, category"
        cursor.execute(query, (user_id,))
        saved_meals_raw = cursor.fetchall()

        meals_by_date = {}
        for meal in saved_meals_raw:
            recipe_id, name, instructions, category, date_of_meal, image_url = meal
            date_str = date_of_meal.strftime('%Y-%m-%d') # Format date to YYYY-MM-DD

            if date_str not in meals_by_date:
                meals_by_date[date_str] = {}
            if category not in meals_by_date[date_str]:
                meals_by_date[date_str][category] = []
            
            meals_by_date[date_str][category].append({
                'id': recipe_id,
                'name': name,
                'instructions': instructions,
                'category': category,
                'image_url': image_url
            })
        
        return jsonify(meals_by_date), 200

    except mysql.connector.Error as err:
        print(f"MySQL Error fetching saved meals: {err}")
        return jsonify({"error": "Database error, please try again later."}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# updating with the old one 

# @dashboard_bp.route('/save_user_preferences', methods=['POST'])
# def save_user_preferences():
#     data = request.get_json()  # Receive data from the frontend
#     user_id = 4  # Replace with the logged-in user's ID

#     # Fetch current preferences from the database for the given user
#     cursor.execute("SELECT dietPlan, foodTypes, allergies, medicalConditions, mealFrequency FROM Preference WHERE userID = %s", (user_id,))
#     current_preferences = cursor.fetchone()

#     # If no record exists, initialize the values with empty strings
#     if current_preferences is None:
#         current_preferences = ["", "", "", "", ""]

#     # Append new data to existing data without duplicates
#     new_dietPlan = data['dietPlan'] if data['dietPlan'] else current_preferences[0]
#     new_foodTypes = combine_with_existing(current_preferences[1], data['foodTypes'])
#     new_allergies = combine_with_existing(current_preferences[2], data['allergies'])
#     new_medicalConditions = combine_with_existing(current_preferences[3], data['medicalConditions'])
#     new_mealFrequency = combine_with_existing(current_preferences[4], data['mealFrequency'])

#     # Prepare SQL query to update preferences
#     query = """
#         UPDATE Preference 
#         SET dietPlan = %s, foodTypes = %s, allergies = %s, 
#             medicalConditions = %s, mealFrequency = %s
#         WHERE userID = %s
#     """
#     values = (new_dietPlan, new_foodTypes, new_allergies, new_medicalConditions, new_mealFrequency, user_id)

#     cursor.execute(query, values)
#     db.commit()

#     return jsonify({'status': 'success', 'message': 'Preferences updated successfully!'})

# # Helper function to combine new values with existing values, avoiding duplicates
# def combine_with_existing(existing_data, new_data):
#     # Split the existing data into a list
#     existing_list = existing_data.split(', ') if existing_data else []
#     new_list = new_data.split(', ') if new_data else []

#     # Combine the lists, ensuring no duplicates
#     combined_list = list(set(existing_list + new_list))
    
#     # Return the combined data as a comma-separated string
#     return ', '.join(combined_list)

@dashboard_bp.route('/clear_foods', methods=['POST'])
def clear_foods():
    if "user_id" not in session:
        return jsonify({'status': 'error', 'message': 'User not logged in'}), 401

    user_id = session["user_id"]
    data = request.json
    date_to_clear = data.get('date')
    category_to_clear = data.get('category')

    if not date_to_clear or not category_to_clear:
        return jsonify({'status': 'error', 'message': 'Date and category are required'}), 400

    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor()

        delete_query = "DELETE FROM recipe WHERE userID = %s AND date_of_meal = %s AND category = %s"
        cursor.execute(delete_query, (user_id, date_to_clear, category_to_clear))
        connection.commit()

        if cursor.rowcount > 0:
            return jsonify({'status': 'success', 'message': f'Foods cleared for {category_to_clear} on {date_to_clear}'}), 200
        else:
            return jsonify({'status': 'info', 'message': 'No foods found to clear for this category and date.'}), 200

    except mysql.connector.Error as err:
        print(f"MySQL Error clearing foods: {err}")
        return jsonify({"error": "Database error, please try again later."}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@dashboard_bp.route('/delete_meal', methods=['POST'])
def delete_meal():
    if "user_id" not in session:
        return jsonify({'status': 'error', 'message': 'User not logged in'}), 401

    user_id = session["user_id"]
    data = request.json
    recipe_id = data.get('recipe_id')

    if not recipe_id:
        return jsonify({'status': 'error', 'message': 'Recipe ID is required'}), 400

    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor()

        delete_query = "DELETE FROM recipe WHERE recipeID = %s AND userID = %s"
        cursor.execute(delete_query, (recipe_id, user_id))
        connection.commit()

        if cursor.rowcount > 0:
            return jsonify({'status': 'success', 'message': 'Meal deleted successfully!'}), 200
        else:
            return jsonify({'status': 'info', 'message': 'Meal not found or already deleted.'}), 200

    except mysql.connector.Error as err:
        print(f"MySQL Error deleting meal: {err}")
        return jsonify({"error": "Database error, please try again later."}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@dashboard_bp.route('/copy_foods', methods=['POST'])
def copy_foods():
    if "user_id" not in session:
        return jsonify({'status': 'error', 'message': 'User not logged in'}), 401

    user_id = session["user_id"]
    data = request.json
    from_date = data.get('fromDate')
    to_date = data.get('toDate')
    category = data.get('category')

    if not from_date or not to_date or not category:
        return jsonify({'status': 'error', 'message': 'Missing required data'}), 400

    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor()

        # Fetch meals from the source date
        fetch_query = "SELECT name, instructions, category, image_url FROM recipe WHERE userID = %s AND date_of_meal = %s AND category = %s"
        cursor.execute(fetch_query, (user_id, from_date, category))
        meals_to_copy = cursor.fetchall()

        if not meals_to_copy:
            return jsonify({'status': 'info', 'message': 'No meals found to copy.'}), 200

        # Insert meals into the destination date
        insert_query = "INSERT INTO recipe (name, instructions, category, date_of_meal, userID, image_url) VALUES (%s, %s, %s, %s, %s, %s)"
        for meal in meals_to_copy:
            name, instructions, category, image_url = meal
            cursor.execute(insert_query, (name, instructions, category, to_date, user_id, image_url))
        
        connection.commit()

        return jsonify({'status': 'success', 'message': f'Meals from {category} on {from_date} have been copied to {to_date}.'}), 200

    except mysql.connector.Error as err:
        print(f"MySQL Error copying foods: {err}")
        return jsonify({"error": "Database error, please try again later."}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
