# 🍳 Recipe Management System

A full-stack web application for browsing and managing recipes with a FastAPI backend and modern vanilla JavaScript frontend. Features include pagination, search, detailed recipe views, and automatic API documentation.

![Recipe Browser](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Configuration](#database-configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [API Endpoints](#api-endpoints)
- [Frontend Features](#frontend-features)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Backend (FastAPI)
- ✅ RESTful API with automatic OpenAPI documentation
- ✅ MySQL database integration
- ✅ Pagination support (configurable items per page)
- ✅ Sorting by rating in descending order
- ✅ Optional detailed data fetching (ingredients, instructions, nutrients)
- ✅ CORS enabled for cross-origin requests
- ✅ Error handling and validation

### Frontend
- ✅ Modern, responsive UI with gradient design
- ✅ Recipe browsing with card-based layout
- ✅ Client-side search functionality
- ✅ Detailed recipe modal view
- ✅ Toggle for full recipe details
- ✅ Adjustable items per page (10/20/50)
- ✅ Smooth animations and hover effects
- ✅ Mobile-responsive design

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **MySQL 5.7+** or **MariaDB 10.2+** - [Download MySQL](https://dev.mysql.com/downloads/)
- **pip** - Python package manager (usually comes with Python)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/recipe-management-system.git
cd recipe-management-system
```

### 2. Install Python Dependencies

```bash
pip install -r requirements.txt
```

**Required packages:**
- `fastapi` - Modern web framework for building APIs
- `uvicorn[standard]` - ASGI server for running FastAPI
- `mysql-connector-python` - MySQL database connector
- `python-dotenv` - Environment variable management

## 🗄️ Database Configuration

### 1. Create MySQL Database

Open your MySQL client and run:

```sql
CREATE DATABASE securin CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

### 2. Configure Environment Variables

Create a `.env` file in the project root directory:

```bash
touch .env
```

Add the following configuration (replace with your actual credentials):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=securin
```

**Important:** Never commit your `.env` file to version control. It's already included in `.gitignore`.

### 3. Import Recipe Data

The database import script will create the necessary tables and import all recipe data:

```bash
python json_db.py
```

**What this script does:**
- Creates the `recipes` table with all required columns
- Imports recipe data from `US_recipes_null.json`
- Handles JSON data for ingredients, instructions, and nutrients
- Provides progress feedback and import summary

**Expected Output:**
```
Successfully connected to MySQL database
Tables created successfully

Starting data import...
Inserted recipe: Sweet Potato Pie (Key: 0)
Inserted recipe: Fresh Southern Peach Cobbler (Key: 1)
...
============================================================
Import Summary:
Total recipes processed: 39
Recipes inserted: 39
Recipes skipped (duplicates): 0
============================================================
```

## 🏃 Running the Application

### Start the FastAPI Server

```bash
python api.py
```

**Or with auto-reload (for development):**

```bash
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

The server will start on `http://localhost:8000`

You should see output like:
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

## 📚 API Documentation

FastAPI provides **automatic interactive API documentation**:

### Swagger UI (Interactive)
Access at: **http://localhost:8000/docs**

Features:
- Interactive API testing
- Request/response examples
- Try out endpoints directly from your browser
- View all available parameters and responses

### ReDoc (Alternative Documentation)
Access at: **http://localhost:8000/redoc**

Features:
- Clean, three-panel documentation
- Better for reading and understanding API structure
- Downloadable OpenAPI specification

## 🔌 API Endpoints

### 1. Get All Recipes (Paginated)

**Endpoint:** `GET /api/recipes`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (minimum: 1) |
| `per_page` | integer | 10 | Items per page (max: 100) |
| `include_details` | boolean | false | Include ingredients, instructions, nutrients |

**Example Requests:**

```bash
# Get first page with default settings (10 recipes)
curl http://localhost:8000/api/recipes

# Get page 2 with 20 recipes per page
curl http://localhost:8000/api/recipes?page=2&per_page=20

# Get recipes with full details
curl http://localhost:8000/api/recipes?include_details=true

# Combine parameters
curl http://localhost:8000/api/recipes?page=1&per_page=5&include_details=true
```

**Response Format:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "continent": "North America",
      "country_state": "US",
      "cuisine": "Southern Recipes",
      "title": "Sweet Potato Pie",
      "url": "https://www.allrecipes.com/recipe/...",
      "rating": 4.8,
      "total_time": 115,
      "prep_time": 15,
      "cook_time": 100,
      "description": "Shared from a Southern recipe...",
      "serves": "8 servings",
      "ingredients": [...],  // Only if include_details=true
      "instructions": [...], // Only if include_details=true
      "nutrients": {...}     // Only if include_details=true
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total_recipes": 39,
    "total_pages": 4,
    "has_next": true,
    "has_prev": false
  }
}
```

### 2. Get Recipe by ID

**Endpoint:** `GET /api/recipes/{recipe_id}`

**Example:**

```bash
curl http://localhost:8000/api/recipes/1
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Sweet Potato Pie",
    "rating": 4.8,
    "ingredients": ["1 (1 pound) sweet potato", "..."],
    "instructions": ["Place whole sweet potato...", "..."],
    "nutrients": {
      "calories": "389 kcal",
      "carbohydrateContent": "48 g",
      "proteinContent": "5 g",
      ...
    },
    ...
  }
}
```

### 3. Frontend Home

**Endpoint:** `GET /`

Serves the web application interface.

## 🎨 Frontend Features

### Access the Web Interface

Open your browser and navigate to: **http://localhost:8000**

### Available Features:

1. **Browse Recipes**
   - View recipes in an attractive card layout
   - Automatically sorted by rating (highest first)
   - See title, rating, times, description, and cuisine

2. **Search Recipes**
   - Type in the search box to filter recipes
   - Searches through title, description, and cuisine
   - Real-time client-side filtering

3. **Pagination Controls**
   - Navigate with First, Previous, Next, Last buttons
   - Choose items per page: 10, 20, or 50
   - Shows current page and total count

4. **View Details**
   - Toggle "Show Full Details" checkbox
   - See ingredients in recipe cards
   - Click any card for full modal view

5. **Recipe Modal**
   - Complete recipe information
   - Step-by-step instructions
   - Full ingredients list
   - Nutritional information
   - Source URL link

## 📁 Project Structure

```
recipe-management-system/
│
├── static/                    # Frontend files
│   ├── index.html            # Main HTML page
│   ├── styles.css            # Styling and animations
│   └── script.js             # Frontend JavaScript logic
│
├── .env                      # Environment variables (not in git)
├── .gitignore               # Git ignore rules
├── api.py                   # FastAPI application
├── json_db.py              # Database import script
├── requirements.txt        # Python dependencies
├── US_recipes_null.json   # Recipe data source
└── README.md              # This file
```

## 🛠️ Technologies Used

### Backend
- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern Python web framework
- **[Uvicorn](https://www.uvicorn.org/)** - ASGI server
- **[MySQL Connector/Python](https://dev.mysql.com/doc/connector-python/en/)** - MySQL database driver
- **[python-dotenv](https://pypi.org/project/python-dotenv/)** - Environment management

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling with gradients and animations
- **Vanilla JavaScript** - No frameworks, pure JS
- **Fetch API** - HTTP requests

### Database
- **MySQL 5.7+** or **MariaDB 10.2+**

## 🧪 Testing the API

### Using the Interactive Docs

1. Navigate to http://localhost:8000/docs
2. Click on any endpoint to expand it
3. Click "Try it out"
4. Enter parameters
5. Click "Execute"
6. View the response

### Using curl

```bash
# Test basic endpoint
curl -X GET "http://localhost:8000/api/recipes?page=1&per_page=10" -H "accept: application/json"

# Test with details
curl -X GET "http://localhost:8000/api/recipes?include_details=true" -H "accept: application/json"

# Get specific recipe
curl -X GET "http://localhost:8000/api/recipes/1" -H "accept: application/json"
```

### Using Python

```python
import requests

# Get recipes
response = requests.get('http://localhost:8000/api/recipes', 
                       params={'page': 1, 'per_page': 5})
data = response.json()
print(data)

# Get specific recipe
response = requests.get('http://localhost:8000/api/recipes/1')
recipe = response.json()
print(recipe['data']['title'])
```

### Using Postman

1. Create a new GET request
2. Enter URL: `http://localhost:8000/api/recipes`
3. Add query parameters in the Params tab
4. Send request and view formatted JSON response

## 🔧 Development

### Running with Auto-Reload

```bash
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

The `--reload` flag automatically restarts the server when you make code changes.

### Environment Variables

All sensitive configuration is stored in `.env`:

```env
DB_HOST=localhost          # Database host
DB_USER=root              # Database username
DB_PASSWORD=yourpass      # Database password
DB_NAME=securin           # Database name
```


