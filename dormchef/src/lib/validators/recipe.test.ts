import { validateRecipe, validateIngredient } from './recipe';

describe('Recipe Validators', () => {
  describe('validateIngredient', () => {
    it('should validate valid ingredient', () => {
      const validIngredient = {
        name: 'Chicken breast',
        amount: 2,
        unit: 'pieces',
        category: 'Protein'
      };

      const result = validateIngredient(validIngredient);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject ingredient without name', () => {
      const invalidIngredient = {
        name: '',
        amount: 2,
        unit: 'pieces',
        category: 'Protein'
      };

      const result = validateIngredient(invalidIngredient);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Ingredient name is required');
    });

    it('should reject ingredient with negative amount', () => {
      const invalidIngredient = {
        name: 'Salt',
        amount: -1,
        unit: 'teaspoon',
        category: 'Spices'
      };

      const result = validateIngredient(invalidIngredient);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Amount must be greater than 0');
    });

    it('should reject ingredient without unit', () => {
      const invalidIngredient = {
        name: 'Flour',
        amount: 2,
        unit: '',
        category: 'Pantry'
      };

      const result = validateIngredient(invalidIngredient);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unit is required');
    });
  });

  describe('validateRecipe', () => {
    it('should validate complete valid recipe', () => {
      const validRecipe = {
        title: 'Test Recipe',
        description: 'A test recipe',
        ingredients: [
          {
            name: 'Chicken',
            amount: 1,
            unit: 'pound',
            category: 'Protein'
          }
        ],
        instructions: ['Cook the chicken'],
        prepTime: 10,
        cookTime: 20,
        servings: 4,
        difficulty: 'Easy' as const,
        tags: ['Quick', 'Easy'],
        isPublic: true
      };

      const result = validateRecipe(validRecipe);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject recipe without title', () => {
      const invalidRecipe = {
        title: '',
        description: 'A test recipe',
        ingredients: [{ name: 'Test', amount: 1, unit: 'cup', category: 'Test' }],
        instructions: ['Test instruction'],
        prepTime: 10,
        cookTime: 20,
        servings: 4,
        difficulty: 'Easy' as const,
        tags: [],
        isPublic: true
      };

      const result = validateRecipe(invalidRecipe);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is required');
    });

    it('should reject recipe with empty ingredients', () => {
      const invalidRecipe = {
        title: 'Test Recipe',
        description: 'A test recipe',
        ingredients: [],
        instructions: ['Test instruction'],
        prepTime: 10,
        cookTime: 20,
        servings: 4,
        difficulty: 'Easy' as const,
        tags: [],
        isPublic: true
      };

      const result = validateRecipe(invalidRecipe);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one ingredient is required');
    });

    it('should reject recipe with empty instructions', () => {
      const invalidRecipe = {
        title: 'Test Recipe',
        description: 'A test recipe',
        ingredients: [{ name: 'Test', amount: 1, unit: 'cup', category: 'Test' }],
        instructions: [],
        prepTime: 10,
        cookTime: 20,
        servings: 4,
        difficulty: 'Easy' as const,
        tags: [],
        isPublic: true
      };

      const result = validateRecipe(invalidRecipe);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one instruction is required');
    });

    it('should reject recipe with invalid difficulty', () => {
      const invalidRecipe = {
        title: 'Test Recipe',
        description: 'A test recipe',
        ingredients: [{ name: 'Test', amount: 1, unit: 'cup', category: 'Test' }],
        instructions: ['Test instruction'],
        prepTime: 10,
        cookTime: 20,
        servings: 4,
        difficulty: 'Invalid' as any,
        tags: [],
        isPublic: true
      };

      const result = validateRecipe(invalidRecipe);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Difficulty must be Easy, Medium, or Hard');
    });

    it('should reject recipe with negative prep time', () => {
      const invalidRecipe = {
        title: 'Test Recipe',
        description: 'A test recipe',
        ingredients: [{ name: 'Test', amount: 1, unit: 'cup', category: 'Test' }],
        instructions: ['Test instruction'],
        prepTime: -5,
        cookTime: 20,
        servings: 4,
        difficulty: 'Easy' as const,
        tags: [],
        isPublic: true
      };

      const result = validateRecipe(invalidRecipe);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Prep time must be 0 or greater');
    });

    it('should reject recipe with zero servings', () => {
      const invalidRecipe = {
        title: 'Test Recipe',
        description: 'A test recipe',
        ingredients: [{ name: 'Test', amount: 1, unit: 'cup', category: 'Test' }],
        instructions: ['Test instruction'],
        prepTime: 10,
        cookTime: 20,
        servings: 0,
        difficulty: 'Easy' as const,
        tags: [],
        isPublic: true
      };

      const result = validateRecipe(invalidRecipe);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Servings must be at least 1');
    });
  });
});