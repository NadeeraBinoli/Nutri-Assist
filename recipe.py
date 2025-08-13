from datasets import load_dataset
from fuzzywuzzy import fuzz
import ast
from database import get_connection  # Import for database connection

def load_parsed_recipes(limit=10):
    raw_dataset = load_dataset("arya123321/recipes", split="train")
    parsed_recipes = []
    for i, item in enumerate(raw_dataset.select(range(min(limit, len(raw_dataset))))):
        try:
            title = item.get("title", "No Title")
            ingredients = item.get("ingredients", [])
            directions = item.get("instructions_list", [])
            
            # Parse ingredients if they're in string format
            if isinstance(ingredients, str):
                ingredients = [i.strip() for i in ingredients.split(';') if i.strip()]
                
            # Parse directions if they're in string format
            if isinstance(directions, str):
                try:
                    directions = ast.literal_eval(directions)
                except (ValueError, SyntaxError):
                    directions = [directions.strip()]
                    
            if not isinstance(directions, list):
                directions = []
            
            # Create recipe dictionary with additional allergy fields
            recipe = {
                "title": title,
                "ingredients": ingredients,
                "instructions": directions,
                "url": item.get("url", ""),
                "image": item.get("image", ""),
                "category": item.get("category", ""),
                "prep_time": item.get("prep_time", ""),
                "cook_time": item.get("cook_time", ""),
                "total_time": item.get("total_time", ""),
                "servings": item.get("servings", ""),
                "calories": item.get("calories", ""),
                "carbohydrates_g": item.get("carbohydrates_g", ""),
                "sugars_g": item.get("sugars_g", ""),
                "fat_g": item.get("fat_g", ""),
                "saturated_fat_g": item.get("saturated_fat_g", ""),
                "cholesterol_mg": item.get("cholesterol_mg", ""),
                "protein_g": item.get("protein_g", ""),
                "dietary_fiber_g": item.get("dietary_fiber_g", ""),
                "contains_allergens": False,  # Will be set later when checking against user allergies
                "allergen_warnings": []      # List of specific allergen warnings
            }
            
            parsed_recipes.append(recipe)
        except Exception as e:
            print(f"Error parsing recipe {i}: {str(e)}")
            continue
    return parsed_recipes

def get_user_allergies(user_id):
    """Fetch user's allergies from the database"""
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = "SELECT allergies FROM Preference WHERE userID = %s"
        cursor.execute(query, (user_id,))
        result = cursor.fetchone()
        
        if result and result[0]:
            # Split comma-separated allergies and clean them up
            return [a.strip().lower() for a in result[0].split(',') if a.strip()]
        return []
    except Exception as e:
        print(f"Error fetching user allergies: {str(e)}")
        return []
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def check_allergens(recipe, user_allergies):
    """Check if recipe contains any of the user's allergens"""
    if not user_allergies:
        return recipe
        
    recipe['contains_allergens'] = False
    recipe['allergen_warnings'] = []
    
    for allergen in user_allergies:
        # Check if allergen is in any ingredient (case-insensitive)
        for ingredient in recipe['ingredients']:
            if allergen.lower() in ingredient.lower():
                recipe['contains_allergens'] = True
                warning = f"Contains {allergen.capitalize()}"
                if warning not in recipe['allergen_warnings']:
                    recipe['allergen_warnings'].append(warning)
                break
                
    return recipe