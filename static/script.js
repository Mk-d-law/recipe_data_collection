// State management
let currentPage = 1;
let perPage = 10;
let totalPages = 1;
let showDetails = false;
let allRecipes = [];

// DOM elements
const recipeGrid = document.getElementById('recipeGrid');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const pagination = document.getElementById('pagination');
const pageInfo = document.getElementById('pageInfo');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const firstBtn = document.getElementById('firstBtn');
const lastBtn = document.getElementById('lastBtn');
const perPageSelect = document.getElementById('perPageSelect');
const showDetailsCheckbox = document.getElementById('showDetails');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const modal = document.getElementById('recipeModal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.querySelector('.close');

// API base URL
const API_URL = '/api/recipes';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadRecipes();
    setupEventListeners();
});

// Event listeners
function setupEventListeners() {
    prevBtn.addEventListener('click', () => changePage(currentPage - 1));
    nextBtn.addEventListener('click', () => changePage(currentPage + 1));
    firstBtn.addEventListener('click', () => changePage(1));
    lastBtn.addEventListener('click', () => changePage(totalPages));
    
    perPageSelect.addEventListener('change', (e) => {
        perPage = parseInt(e.target.value);
        currentPage = 1;
        loadRecipes();
    });
    
    showDetailsCheckbox.addEventListener('change', (e) => {
        showDetails = e.target.checked;
        loadRecipes();
    });
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Load recipes from API
async function loadRecipes() {
    try {
        showLoading(true);
        hideError();
        
        const url = `${API_URL}?page=${currentPage}&per_page=${perPage}&include_details=${showDetails}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            allRecipes = data.data;
            displayRecipes(data.data);
            updatePagination(data.pagination);
        } else {
            throw new Error('Failed to load recipes');
        }
    } catch (err) {
        showError(`Failed to load recipes: ${err.message}`);
    } finally {
        showLoading(false);
    }
}

// Display recipes
function displayRecipes(recipes) {
    if (recipes.length === 0) {
        recipeGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 40px; color: #666;">No recipes found.</p>';
        return;
    }
    
    recipeGrid.innerHTML = recipes.map(recipe => createRecipeCard(recipe)).join('');
    
    // Add click listeners to recipe cards
    document.querySelectorAll('.recipe-card').forEach((card, index) => {
        card.addEventListener('click', () => showRecipeModal(recipes[index]));
    });
}

// Create recipe card HTML
function createRecipeCard(recipe) {
    const totalTime = recipe.total_time ? `${recipe.total_time} min` : 'N/A';
    const prepTime = recipe.prep_time ? `${recipe.prep_time} min` : 'N/A';
    const cookTime = recipe.cook_time ? `${recipe.cook_time} min` : 'N/A';
    
    return `
        <div class="recipe-card" data-id="${recipe.id}">
            <div class="recipe-header">
                <h3 class="recipe-title">${recipe.title}</h3>
                <div class="rating">⭐ ${recipe.rating || 'N/A'}</div>
            </div>
            
            <div class="recipe-meta">
                <div class="meta-item">⏱️ Total: ${totalTime}</div>
                <div class="meta-item">🥄 Prep: ${prepTime}</div>
                <div class="meta-item">🔥 Cook: ${cookTime}</div>
            </div>
            
            <p class="recipe-description">${recipe.description || 'No description available.'}</p>
            
            ${showDetails && recipe.ingredients ? `
                <div class="recipe-details">
                    <h4>Ingredients (${recipe.ingredients.length}):</h4>
                    <ul class="ingredients-list">
                        ${recipe.ingredients.slice(0, 5).map(ing => `<li>${ing}</li>`).join('')}
                        ${recipe.ingredients.length > 5 ? `<li><em>...and ${recipe.ingredients.length - 5} more</em></li>` : ''}
                    </ul>
                </div>
            ` : ''}
            
            <div class="recipe-footer">
                <span class="cuisine-badge">${recipe.cuisine || 'Unknown'}</span>
                <span class="meta-item">🍽️ ${recipe.serves || 'N/A'}</span>
            </div>
        </div>
    `;
}

// Show recipe detail modal
async function showRecipeModal(recipe) {
    // If recipe doesn't have details, fetch them
    if (!recipe.ingredients || !recipe.instructions) {
        try {
            const response = await fetch(`/api/recipes/${recipe.id}`);
            const data = await response.json();
            if (data.success) {
                recipe = data.data;
            }
        } catch (err) {
            console.error('Error fetching recipe details:', err);
        }
    }
    
    modalBody.innerHTML = `
        <h2 class="modal-title">${recipe.title}</h2>
        
        <div style="display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap;">
            <div class="rating" style="font-size: 1.2em;">⭐ ${recipe.rating || 'N/A'}</div>
            <div class="meta-item" style="font-size: 1.1em;">⏱️ Total: ${recipe.total_time || 'N/A'} min</div>
            <div class="meta-item" style="font-size: 1.1em;">🍽️ ${recipe.serves || 'N/A'}</div>
            <div class="cuisine-badge" style="font-size: 1em;">${recipe.cuisine || 'Unknown'}</div>
        </div>
        
        <p style="line-height: 1.8; margin-bottom: 20px; color: #555;">${recipe.description || 'No description available.'}</p>
        
        <div style="margin-bottom: 20px;">
            <strong>Source:</strong> <a href="${recipe.url}" target="_blank" style="color: #667eea;">${recipe.url}</a>
        </div>
        
        ${recipe.ingredients ? `
            <div class="modal-section">
                <h3>📝 Ingredients (${recipe.ingredients.length})</h3>
                <ul class="ingredients-list">
                    ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
        
        ${recipe.instructions ? `
            <div class="modal-section">
                <h3>👨‍🍳 Instructions</h3>
                <ol class="instructions-list">
                    ${recipe.instructions.map(inst => `<li>${inst}</li>`).join('')}
                </ol>
            </div>
        ` : ''}
        
        ${recipe.nutrients ? `
            <div class="modal-section">
                <h3>🥗 Nutrition Information</h3>
                <div class="nutrients-grid">
                    ${Object.entries(recipe.nutrients)
                        .filter(([key, value]) => value)
                        .map(([key, value]) => `
                            <div class="nutrient-item">
                                <div style="font-weight: bold; color: #667eea;">${formatNutrientName(key)}</div>
                                <div>${value}</div>
                            </div>
                        `).join('')}
                </div>
            </div>
        ` : ''}
    `;
    
    modal.style.display = 'block';
}

// Format nutrient name
function formatNutrientName(name) {
    return name
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

// Update pagination
function updatePagination(paginationData) {
    currentPage = paginationData.current_page;
    totalPages = paginationData.total_pages;
    
    pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${paginationData.total_recipes} total recipes)`;
    
    prevBtn.disabled = !paginationData.has_prev;
    nextBtn.disabled = !paginationData.has_next;
    firstBtn.disabled = currentPage === 1;
    lastBtn.disabled = currentPage === totalPages;
    
    pagination.style.display = 'flex';
}

// Change page
function changePage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    loadRecipes();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Search functionality
function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        displayRecipes(allRecipes);
        return;
    }
    
    const filtered = allRecipes.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm) ||
        (recipe.description && recipe.description.toLowerCase().includes(searchTerm)) ||
        (recipe.cuisine && recipe.cuisine.toLowerCase().includes(searchTerm))
    );
    
    displayRecipes(filtered);
    
    if (filtered.length === 0) {
        recipeGrid.innerHTML = `
            <div style="text-align: center; grid-column: 1/-1; padding: 40px;">
                <p style="font-size: 1.2em; color: #666; margin-bottom: 10px;">No recipes found for "${searchTerm}"</p>
                <button onclick="searchInput.value=''; performSearch();" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 20px; cursor: pointer;">Clear Search</button>
            </div>
        `;
    }
}

// Loading state
function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
    recipeGrid.style.display = show ? 'none' : 'grid';
}

// Error handling
function showError(message) {
    error.textContent = message;
    error.style.display = 'block';
}

function hideError() {
    error.style.display = 'none';
}