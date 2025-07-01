from recipe import load_parsed_recipes

if __name__ == '__main__':
    print("Loading and parsing recipes...")
    recipes = load_parsed_recipes(limit=1)
    print("Finished loading recipes.")