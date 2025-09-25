import { Ingredient } from '@/types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface RecipeInput {
  title: string;
  description?: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  isPublic: boolean;
}

export function validateIngredient(ingredient: any): ValidationResult {
  const errors: string[] = [];

  if (!ingredient.name || typeof ingredient.name !== 'string' || ingredient.name.trim() === '') {
    errors.push('Ingredient name is required');
  }

  if (!ingredient.amount || typeof ingredient.amount !== 'number' || ingredient.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  if (!ingredient.unit || typeof ingredient.unit !== 'string' || ingredient.unit.trim() === '') {
    errors.push('Unit is required');
  }

  if (!ingredient.category || typeof ingredient.category !== 'string' || ingredient.category.trim() === '') {
    errors.push('Category is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateRecipe(recipe: RecipeInput): ValidationResult {
  const errors: string[] = [];

  // Title validation
  if (!recipe.title || recipe.title.trim() === '') {
    errors.push('Title is required');
  } else if (recipe.title.length > 100) {
    errors.push('Title must be 100 characters or less');
  }

  // Description validation
  if (recipe.description && recipe.description.length > 500) {
    errors.push('Description must be 500 characters or less');
  }

  // Ingredients validation
  if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
    errors.push('At least one ingredient is required');
  } else {
    recipe.ingredients.forEach((ingredient, index) => {
      const ingredientResult = validateIngredient(ingredient);
      if (!ingredientResult.isValid) {
        errors.push(`Ingredient ${index + 1}: ${ingredientResult.errors.join(', ')}`);
      }
    });
  }

  // Instructions validation
  if (!Array.isArray(recipe.instructions) || recipe.instructions.length === 0) {
    errors.push('At least one instruction is required');
  } else {
    recipe.instructions.forEach((instruction, index) => {
      if (!instruction || instruction.trim() === '') {
        errors.push(`Instruction ${index + 1} cannot be empty`);
      }
    });
  }

  // Time validation
  if (typeof recipe.prepTime !== 'number' || recipe.prepTime < 0) {
    errors.push('Prep time must be 0 or greater');
  }

  if (typeof recipe.cookTime !== 'number' || recipe.cookTime < 0) {
    errors.push('Cook time must be 0 or greater');
  }

  // Servings validation
  if (typeof recipe.servings !== 'number' || recipe.servings < 1) {
    errors.push('Servings must be at least 1');
  }

  // Difficulty validation
  if (!['Easy', 'Medium', 'Hard'].includes(recipe.difficulty)) {
    errors.push('Difficulty must be Easy, Medium, or Hard');
  }

  // Tags validation
  if (recipe.tags && !Array.isArray(recipe.tags)) {
    errors.push('Tags must be an array');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function sanitizeRecipe(recipe: RecipeInput): RecipeInput {
  return {
    title: recipe.title.trim(),
    description: recipe.description?.trim(),
    ingredients: recipe.ingredients.map(ingredient => ({
      ...ingredient,
      name: ingredient.name.trim(),
      unit: ingredient.unit.trim(),
      category: ingredient.category.trim(),
    })),
    instructions: recipe.instructions.map(instruction => instruction.trim()),
    prepTime: Math.max(0, Math.floor(recipe.prepTime)),
    cookTime: Math.max(0, Math.floor(recipe.cookTime)),
    servings: Math.max(1, Math.floor(recipe.servings)),
    difficulty: recipe.difficulty,
    tags: recipe.tags.map(tag => tag.trim()).filter(tag => tag.length > 0),
    isPublic: Boolean(recipe.isPublic),
  };
}