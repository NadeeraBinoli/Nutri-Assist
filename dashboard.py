from flask import Blueprint, request, jsonify, session
import mysql.connector

# Create a Blueprint for the dashboard-related routes
dashboard_bp = Blueprint('dashboard', __name__)

# Connect to MySQL database
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="1234",
    database="mealPlanner"
)
cursor = db.cursor()

# Route for saving user preferences
from flask import Blueprint, request, jsonify, session
import mysql.connector

# Create a Blueprint for the dashboard-related routes
dashboard_bp = Blueprint('dashboard', __name__)

# Connect to MySQL database
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="1234",
    database="mealPlanner"
)
cursor = db.cursor()

# Route for saving user preferences
@dashboard_bp.route('/save_user_preferences', methods=['POST'])
def save_user_preferences():
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
        db.commit()

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
    db.commit()

    # Return success message
    return jsonify({'status': 'success', 'message': 'Preferences saved successfully!'})



@dashboard_bp.route('/get_user_preferences', methods=['GET'])
def get_user_preferences():
    """ Fetches the user's saved preferences """
    if "user_id" not in session:
        return jsonify({'status': 'error', 'message': 'User not logged in'})

    user_id = session["user_id"]

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
    

@dashboard_bp.route('/calculate_bmi', methods=['POST'])
def calculate_bmi():
    try:
        data = request.json
        height = float(data['height'])
        weight = float(data['weight'])
        bmi = float(data['bmi'])
        user_id = 1  # Replace with actual user ID from session/auth system

        # Store BMI data in the database
        query = """
            INSERT INTO HealthProfile (userID, weight, height, bmi) 
            VALUES (%s, %s, %s, %s)
        """
        values = (user_id, weight, height, bmi)
        cursor.execute(query, values)
        db.commit()

        return jsonify({"message": "BMI stored successfully", "bmi": bmi}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

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