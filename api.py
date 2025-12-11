from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import os
import json

load_dotenv()

app = FastAPI(
    title="Recipes API",
    description="API to access recipe data with pagination and filtering",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.mount("/static", StaticFiles(directory="static"), name="static")

def create_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME')
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def parse_json_field(field_value):
    if field_value is None:
        return None
    try:
        return json.loads(field_value)
    except (json.JSONDecodeError, TypeError):
        return None

@app.get("/")
async def root():
    """Serve the frontend"""
    return FileResponse("static/index.html")

@app.get("/api/recipes")
async def get_recipes(
    page: int = Query(1, ge=1, description="Page number (starts from 1)"),
    per_page: int = Query(10, ge=1, le=100, description="Number of recipes per page (max 100)"),
    include_details: bool = Query(False, description="Include ingredients, instructions, and nutrients")
):

    connection = create_connection()
    if not connection:
        return JSONResponse(
            status_code=500,
            content={"error": "Database connection failed"}
        )
    
    try:
        cursor = connection.cursor(dictionary=True)

        offset = (page - 1) * per_page

        cursor.execute("SELECT COUNT(*) as total FROM recipes")
        total_recipes = cursor.fetchone()['total']

        if include_details:
            query = """
                SELECT id, Contient, Country_State, cuisine, title, URL, 
                       rating, total_time, prep_time, cook_time, description, 
                       serves, ingredients, instructions, nutrients
                FROM recipes
                ORDER BY rating DESC, id ASC
                LIMIT %s OFFSET %s
            """
        else:
            query = """
                SELECT id, Contient, Country_State, cuisine, title, URL, 
                       rating, total_time, prep_time, cook_time, description, serves
                FROM recipes
                ORDER BY rating DESC, id ASC
                LIMIT %s OFFSET %s
            """
        
        cursor.execute(query, (per_page, offset))
        recipes = cursor.fetchall()

        if include_details:
            for recipe in recipes:
                recipe['ingredients'] = parse_json_field(recipe.get('ingredients'))
                recipe['instructions'] = parse_json_field(recipe.get('instructions'))
                recipe['nutrients'] = parse_json_field(recipe.get('nutrients'))

        for recipe in recipes:
            recipe['continent'] = recipe.pop('Contient', None)
            recipe['country_state'] = recipe.pop('Country_State', None)
            recipe['url'] = recipe.pop('URL', None)

        total_pages = (total_recipes + per_page - 1) // per_page
        
        response = {
            "success": True,
            "data": recipes,
            "pagination": {
                "current_page": page,
                "per_page": per_page,
                "total_recipes": total_recipes,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1
            }
        }
        
        return response
        
    except Error as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Database error: {str(e)}"}
        )
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.get("/api/recipes/{recipe_id}")
async def get_recipe_by_id(recipe_id: int):

    connection = create_connection()
    if not connection:
        return JSONResponse(
            status_code=500,
            content={"error": "Database connection failed"}
        )
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        query = """
            SELECT id, Contient, Country_State, cuisine, title, URL, 
                   rating, total_time, prep_time, cook_time, description, 
                   serves, ingredients, instructions, nutrients
            FROM recipes
            WHERE id = %s
        """
        cursor.execute(query, (recipe_id,))
        recipe = cursor.fetchone()
        
        if not recipe:
            return JSONResponse(
                status_code=404,
                content={"error": "Recipe not found"}
            )
        
        # Parse JSON fields
        recipe['ingredients'] = parse_json_field(recipe.get('ingredients'))
        recipe['instructions'] = parse_json_field(recipe.get('instructions'))
        recipe['nutrients'] = parse_json_field(recipe.get('nutrients'))
        
        #match frontend
        recipe['continent'] = recipe.pop('Contient', None)
        recipe['country_state'] = recipe.pop('Country_State', None)
        recipe['url'] = recipe.pop('URL', None)
        
        return {
            "success": True,
            "data": recipe
        }
        
    except Error as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Database error: {str(e)}"}
        )
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)