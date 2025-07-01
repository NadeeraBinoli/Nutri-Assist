from datasets import load_dataset
from fuzzywuzzy import fuzz
import ast # Import the ast module

def load_parsed_recipes(limit=10):
    raw_dataset = load_dataset("arya123321/recipes", split="train")
    parsed_recipes = []
    for i, item in enumerate(raw_dataset.select(range(min(limit, len(raw_dataset))))):
        try:
            title = item.get("title", "No Title")
            ingredients = item.get("ingredients", [])
            directions = item.get("instructions_list", [])
            if isinstance(ingredients, str):                                                                                  
                ingredients = [i.strip() for i in ingredients.split(';') if i.strip()] 
            if isinstance(directions, str):
                try:
                    directions = ast.literal_eval(directions)
                except (ValueError, SyntaxError):
                    # Fallback if it's not a valid list string, treat as single instruction
                    directions = [directions.strip()]
            # Ensure it's always a list, even if it was None or not a string initially
            if not isinstance(directions, list):
                directions = []

            parsed_recipes.append({
                "title": title,
                "ingredients": ingredients,
                "instructions": directions,
                "url": item.get("url", ""), # Add the URL here
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
                "dietary_fiber_g": item.get("dietary_fiber_g", "")
            })
        except Exception as e:
            pass
    return parsed_recipes