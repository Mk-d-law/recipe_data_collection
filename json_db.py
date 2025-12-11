import json
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import os

load_dotenv()

def create_connection():
    """Create a database connection to MySQL"""
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME')
        )
        if connection.is_connected():
            print("Successfully connected to MySQL database")
            return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def create_tables(connection):
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS recipes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            recipe_key VARCHAR(10),
            continent VARCHAR(100),
            country_state VARCHAR(100),
            cuisine VARCHAR(100),
            title VARCHAR(255),
            url TEXT,
            rating DECIMAL(3,2),
            total_time INT,
            prep_time INT,
            cook_time INT,
            description TEXT,
            serves VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_recipe (recipe_key)
        )
    """)

    connection.commit()
    print("Tables created successfully")

def insert_recipe_data(connection, json_file_path):
    """Insert recipe data from JSON file into database"""
    cursor = connection.cursor()
    
    # Load JSON data
    with open(json_file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    recipes_inserted = 0
    recipes_skipped = 0
    
    for key, recipe in data.items():
        try:
            recipe_query = """
                INSERT INTO recipes 
                (recipe_key, continent, country_state, cuisine, title, url, rating, 
                total_time, prep_time, cook_time, description, serves)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            recipe_values = (
                key,
                recipe.get('Contient'),
                recipe.get('Country_State'),
                recipe.get('cuisine'),
                recipe.get('title'),
                recipe.get('URL'),
                recipe.get('rating'),
                recipe.get('total_time'),
                recipe.get('prep_time'),
                recipe.get('cook_time'),
                recipe.get('description'),
                recipe.get('serves')
            )
            
            cursor.execute(recipe_query, recipe_values)
            recipes_inserted += 1
            print(f"Inserted recipe: {recipe.get('title')} (Key: {key})")
            
        except mysql.connector.IntegrityError as e:
            recipes_skipped += 1
            print(f"Skipped duplicate recipe (Key: {key}): {recipe.get('title')}")
        except Error as e:
            print(f"Error inserting recipe {key}: {e}")
            connection.rollback()
            continue
    
    connection.commit()
    print(f"\n{'='*60}")
    print(f"Import Summary:")
    print(f"Total recipes processed: {len(data)}")
    print(f"Recipes inserted: {recipes_inserted}")
    print(f"Recipes skipped (duplicates): {recipes_skipped}")

def main():
    json_file = 'US_recipes_null.json'
    
    if not os.path.exists(json_file):
        print(f"Error: {json_file} not found!")
        return
    
    connection = create_connection()
    if not connection:
        return
    
    try:
        create_tables(connection)
        
        print("\nStarting data import...")
        insert_recipe_data(connection, json_file)
        
    except Error as e:
        print(f"Error during import: {e}")
    finally:
        if connection.is_connected():
            connection.close()
            print("\nMySQL connection closed")

if __name__ == "__main__":
    main()