/**
 * DormChef Recipe Import Module
 * Handles client-side recipe import from URLs
 */

/**
 * Render recipe preview card
 */
function renderRecipePreview(recipe, savedId = null) {
  const resultDiv = document.getElementById('import-result');
  if (!resultDiv) return;

  const totalTime = recipe.totalTimeMinutes
    ? `${Math.floor(recipe.totalTimeMinutes / 60)}h ${recipe.totalTimeMinutes % 60}m`
    : 'N/A';

  const ingredientsList = recipe.ingredients
    .map(ing => {
      const qtyText = ing.qty ? `${ing.qty} ` : '';
      const unitText = ing.unit ? `${ing.unit} ` : '';
      const itemText = ing.item || ing.raw;
      return `<li>${qtyText}${unitText}${itemText}</li>`;
    })
    .join('');

  const instructionsList = recipe.instructions
    .map((step, idx) => `<li><strong>Step ${idx + 1}:</strong> ${step}</li>`)
    .join('');

  const saveButton = savedId
    ? '<p class="saved-indicator">✓ Saved to your recipes!</p>'
    : '<button type="button" class="save-btn" id="save-recipe-btn">Save Recipe</button>';

  resultDiv.innerHTML = `
    <div class="recipe-card">
      <div class="recipe-header">
        ${recipe.imageUrl ? `<img src="${recipe.imageUrl}" alt="${recipe.title}" class="recipe-image" />` : ''}
        <div class="recipe-meta">
          <h2>${recipe.title}</h2>
          ${recipe.description ? `<p class="recipe-description">${recipe.description}</p>` : ''}
          ${recipe.author ? `<p class="recipe-author">By ${recipe.author}</p>` : ''}
          <div class="recipe-info">
            <span><strong>Yield:</strong> ${recipe.yield || 'N/A'}</span>
            <span><strong>Time:</strong> ${totalTime}</span>
          </div>
        </div>
      </div>

      <div class="recipe-body">
        <div class="recipe-section">
          <h3>Ingredients</h3>
          <ul class="ingredients-list">
            ${ingredientsList}
          </ul>
        </div>

        <div class="recipe-section">
          <h3>Instructions</h3>
          <ol class="instructions-list">
            ${instructionsList}
          </ol>
        </div>
      </div>

      <div class="recipe-footer">
        <p class="recipe-source"><em>Source: <a href="${recipe.sourceUrl}" target="_blank" rel="noopener">${recipe.sourceUrl}</a></em></p>
        ${saveButton}
      </div>
    </div>
  `;

  // Attach save handler if not already saved
  if (!savedId) {
    const saveBtn = document.getElementById('save-recipe-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => saveRecipe(recipe.sourceUrl));
    }
  }
}

/**
 * Show error message
 */
function showError(message) {
  const resultDiv = document.getElementById('import-result');
  if (!resultDiv) return;

  resultDiv.innerHTML = `
    <div class="error-message">
      <h3>Import Failed</h3>
      <p>${message}</p>
    </div>
  `;
}

/**
 * Show loading state
 */
function showLoading(message = 'Importing recipe...') {
  const resultDiv = document.getElementById('import-result');
  if (!resultDiv) return;

  resultDiv.innerHTML = `
    <div class="loading-message">
      <div class="spinner"></div>
      <p>${message}</p>
    </div>
  `;
}

/**
 * Preview recipe from URL
 */
async function previewRecipe(url) {
  showLoading('Extracting recipe data...');

  try {
    const response = await fetch(
      `/api/import-recipe?url=${encodeURIComponent(url)}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to import recipe');
    }

    renderRecipePreview(data.recipe);
  } catch (error) {
    showError(error.message || 'An unexpected error occurred');
  }
}

/**
 * Save recipe to Supabase
 */
async function saveRecipe(url) {
  showLoading('Saving recipe...');

  try {
    const response = await fetch(
      `/api/import-recipe?url=${encodeURIComponent(url)}&save=1`,
      {
        method: 'POST',
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to save recipe');
    }

    renderRecipePreview(data.recipe, data.id);
  } catch (error) {
    showError(error.message || 'An unexpected error occurred while saving');
  }
}

/**
 * Initialize recipe import functionality
 */
export function initRecipeImport() {
  const form = document.getElementById('import-recipe-form');
  const urlInput = document.getElementById('recipe-url-input');

  if (!form || !urlInput) {
    console.warn('Recipe import form elements not found');
    return;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();

    const url = urlInput.value.trim();
    if (!url) {
      showError('Please enter a valid URL');
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      showError('Please enter a valid URL (including http:// or https://)');
      return;
    }

    previewRecipe(url);
  });
}

// Auto-initialize on DOMContentLoaded if not already initialized
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRecipeImport);
} else {
  initRecipeImport();
}
