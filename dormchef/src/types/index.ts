// Core data types for DormChef application

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  school?: string;
  dietaryRestrictions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  category: string;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  authorId: string;
  authorName?: string;
  isPublic: boolean;
  isFavorite?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlannedMeal {
  day: number; // 0-6 (Sunday-Saturday)
  mealType: 'breakfast' | 'lunch' | 'dinner';
  recipeId: string;
  recipe?: Recipe;
}

export interface MealPlan {
  id: string;
  userId: string;
  weekStartDate: Date;
  meals: PlannedMeal[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  updatedAt: Date;
}

export interface ShoppingListItem {
  name: string;
  amount: number;
  unit: string;
  category: string;
  isPurchased: boolean;
}

export interface ShoppingList {
  id: string;
  userId: string;
  weekStartDate: Date;
  items: ShoppingListItem[];
  createdAt: Date;
  updatedAt: Date;
}

// UI and form types
export interface ToastNotification {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  duration: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

export interface RecipeFormData {
  title: string;
  description?: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  imageFile?: File;
}