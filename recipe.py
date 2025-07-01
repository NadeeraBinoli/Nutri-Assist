from datasets import load_dataset
from fuzzywuzzy import fuzz

def parse_recipe(input_text):
    sections = input_text.strip().split("\n\n")
    title = sections[0].strip()

    ingredients = []
    instructions = []

    for section in sections[1:]:
        if section.startswith("Ingredients:"):
            ingredients = section.replace("Ingredients:\n", "").split("\n")
        elif section.startswith("Directions:"):
            instructions = section.replace("Directions:\n", "").split("\n")
    
    return {
        "title": title,
        "ingredients": [i.strip("- ").strip() for i in ingredients if i.strip()],
        "instructions": [i.strip("- ").strip() for i in instructions if i.strip()]
    }

def load_parsed_recipes(limit=10):
    raw_dataset = load_dataset("corbt/all-recipes", split="train")
    parsed_recipes = []
    for item in raw_dataset.select(range(limit)):
        try:
            parsed = parse_recipe(item["input"])
            parsed_recipes.append(parsed)
        except Exception as e:
            print("Skipping a recipe due to error:", e)
    return parsed_recipes

