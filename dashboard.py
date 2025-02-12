from flask import Blueprint, request, jsonify
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
    data = request.json
    user_id = 4  # Replace with the logged-in user's ID (or retrieve dynamically)

    # Update the Preference table with user selections
    query = """
        UPDATE Preference 
        SET dietPlan = %s, foodTypes = %s, allergies = %s, 
            medicalConditions = %s, mealFrequency = %s
        WHERE userID = %s
    """
    values = (data['dietPlan'], data['foodTypes'], data['allergies'], 
              data['medicalConditions'], data['mealFrequency'], user_id)
    
    # Execute query
    cursor.execute(query, values)
    db.commit()

    # Return success message
    return jsonify({'status': 'success', 'message': 'Preferences saved successfully!'})



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