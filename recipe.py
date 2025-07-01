from datasets import load_dataset
from fuzzywuzzy import fuzz

def load_parsed_recipes(limit=10):
    raw_dataset = load_dataset("arya123321/recipes", split="train")
    parsed_recipes = []
    for i, item in enumerate(raw_dataset.select(range(min(limit, len(raw_dataset))))):
        try:
            # Directly extract data from the dataset item
            title = item.get("title", "No Title")
            ingredients = item.get("ingredients", [])
            directions = item.get("directions", []) # Dataset uses 'directions'

            # Ensure ingredients and directions are lists of strings
            if isinstance(ingredients, str):
                ingredients = [i.strip() for i in ingredients.split('\n') if i.strip()]
            if isinstance(directions, str):
                directions = [d.strip() for d in directions.split('\n') if d.strip()]

            parsed_recipes.append({
                "title": title,
                "ingredients": ingredients,
                "instructions": directions, # Map 'directions' to 'instructions' for HTML
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
            pass # Silently skip errors during recipe processing
            # print(f"  Skipping a recipe due to error processing item: {e}")
    # print(f"Finished loading recipes. Total parsed recipes: {len(parsed_recipes)}")
    return parsed_recipes

