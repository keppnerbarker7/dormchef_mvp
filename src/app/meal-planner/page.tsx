'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';

interface Recipe {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  author: {
    id: string;
    username: string;
    displayName: string;
    image?: string;
  };
}

interface MealPlanEntry {
  id?: string;
  recipeId: string;
  recipe: Recipe;
  day: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
}

interface WeeklyMealPlan {
  [key: string]: {
    breakfast?: MealPlanEntry;
    lunch?: MealPlanEntry;
    dinner?: MealPlanEntry;
  };
}

const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'] as const;

export default function MealPlannerPage() {
  const { user, isLoaded } = useUser();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draggedRecipe, setDraggedRecipe] = useState<Recipe | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));

  // Get the start of the week (Monday)
  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    return new Date(d.setDate(diff));
  }

  // Format date for display
  function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  // Get date for a specific day of the week
  function getDateForDay(dayIndex: number): Date {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + dayIndex);
    return date;
  }

  // Fetch recipes (both user-created and imported)
  const fetchRecipes = async () => {
    try {
      // Fetch both user-created and imported recipes in parallel
      const [userRecipesRes, importedRecipesRes] = await Promise.all([
        fetch('/api/recipes?limit=100'),
        fetch('/api/imported-recipes?limit=100'),
      ]);

      if (!userRecipesRes.ok || !importedRecipesRes.ok) {
        throw new Error('Failed to fetch recipes');
      }

      const userRecipesData = await userRecipesRes.json();
      const importedRecipesData = await importedRecipesRes.json();

      // Combine both types of recipes
      const allRecipes = [
        ...(userRecipesData.recipes || []),
        ...(importedRecipesData.recipes || []).map((r: any) => ({
          ...r,
          isImported: true,
        })),
      ];

      setRecipes(allRecipes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes');
    }
  };

  // Fetch meal plan for current week
  const fetchMealPlan = async () => {
    try {
      const weekString = currentWeekStart.toISOString().split('T')[0];
      const response = await fetch(`/api/meal-plans?week=${weekString}`);

      if (!response.ok) throw new Error('Failed to fetch meal plan');

      const data = await response.json();
      const mealPlans = data.mealPlans || [];

      // Convert array to organized structure
      const organized: WeeklyMealPlan = {};

      // Days array to convert number to day name (0-6 for Monday-Sunday as used in API)
      const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

      mealPlans.forEach((entry: any) => {
        const day = dayNames[entry.day];
        if (!organized[day]) organized[day] = {};
        organized[day][entry.mealType as keyof typeof organized[typeof day]] = {
          id: entry.id,
          recipeId: entry.recipeId,
          recipe: entry.recipe,
          day: entry.day,
          mealType: entry.mealType,
        };
      });

      setMealPlan(organized);
    } catch (err) {
      console.error('Error fetching meal plan:', err);
      setMealPlan({});
    }
  };

  // Add recipe to meal plan
  const addToMealPlan = async (recipe: Recipe, day: string, mealType: string) => {
    try {
      const response = await fetch('/api/meal-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId: recipe.id,
          day: day.charAt(0).toUpperCase() + day.slice(1),
          mealType,
          weekStart: currentWeekStart.toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to add to meal plan');

      // Update local state
      const newEntry: MealPlanEntry = {
        recipeId: recipe.id,
        recipe,
        day,
        mealType: mealType as any,
      };

      setMealPlan(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          [mealType]: newEntry,
        },
      }));
    } catch (err) {
      console.error('Error adding to meal plan:', err);
      alert('Failed to add recipe to meal plan. Please try again.');
    }
  };

  // Remove from meal plan
  const removeFromMealPlan = async (day: string, mealType: string) => {
    const entry = mealPlan[day]?.[mealType as keyof typeof mealPlan[typeof day]];
    if (!entry?.id) return;

    try {
      const response = await fetch(`/api/meal-plans/${entry.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove from meal plan');

      // Update local state
      setMealPlan(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          [mealType]: undefined,
        },
      }));
    } catch (err) {
      console.error('Error removing from meal plan:', err);
      alert('Failed to remove recipe from meal plan. Please try again.');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, recipe: Recipe) => {
    console.log('Drag started:', recipe.title);
    setDraggedRecipe(recipe);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', recipe.id); // Add this for better browser compatibility
  };

  const handleDragOver = (e: React.DragEvent, day?: string, mealType?: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (day && mealType) {
      setDragOverSlot(`${day}-${mealType}`);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only clear if we're leaving the drop zone completely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverSlot(null);
    }
  };

  const handleDrop = (e: React.DragEvent, day: string, mealType: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Drop occurred:', day, mealType, draggedRecipe?.title);

    if (draggedRecipe) {
      addToMealPlan(draggedRecipe, day, mealType);
      setDraggedRecipe(null);
    }
    setDragOverSlot(null);
  };

  const handleDragEnd = () => {
    console.log('Drag ended');
    setDraggedRecipe(null);
    setDragOverSlot(null);
  };

  // Navigation
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newWeekStart);
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        await Promise.all([fetchRecipes(), fetchMealPlan()]);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
      loadData();
    }
  }, [user, isLoaded, currentWeekStart]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please sign in to access the meal planner.</p>
          <Link href="/sign-in" className="mt-4 inline-block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </Link>
            <h2 className="text-xl font-semibold text-gray-900">DormChef</h2>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Recipe Library Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recipe Library</h3>
              <p className="text-sm text-gray-600 mb-4">Drag recipes to add them to your meal plan</p>

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, recipe)}
                      onDragEnd={handleDragEnd}
                      className={`p-3 border border-gray-200 rounded-lg cursor-grab hover:shadow-md transition-all bg-white hover:border-orange-300 ${
                        draggedRecipe?.id === recipe.id ? 'opacity-50 scale-95' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center">
                          {recipe.imageUrl && recipe.imageUrl.startsWith('http') ? (
                            <Image
                              src={recipe.imageUrl}
                              alt={recipe.title}
                              width={48}
                              height={48}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate text-sm">{recipe.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{recipe.prepTime + recipe.cookTime}m</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                              recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {recipe.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Meal Plan Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Weekly Meal Planner</h1>
                  <p className="text-gray-600 mt-1">Plan your meals for the week ahead</p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigateWeek('prev')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>

                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      {formatDate(currentWeekStart)} - {formatDate(getDateForDay(6))}
                    </div>
                    <div className="text-sm text-gray-500">
                      {currentWeekStart.getFullYear()}
                    </div>
                  </div>

                  <button
                    onClick={() => navigateWeek('next')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Meal Plan Calendar */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="grid grid-cols-8 bg-gray-50">
                <div className="p-4 font-medium text-gray-900 border-r border-gray-200">
                  Time
                </div>
                {DAYS_OF_WEEK.map((day, index) => (
                  <div key={day} className="p-4 text-center border-r border-gray-200 last:border-r-0">
                    <div className="font-medium text-gray-900 capitalize">
                      {day.slice(0, 3)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatDate(getDateForDay(index))}
                    </div>
                  </div>
                ))}
              </div>

              {MEAL_TYPES.map((mealType) => (
                <div key={mealType} className="grid grid-cols-8 border-t border-gray-200">
                  <div className="p-4 bg-gray-50 border-r border-gray-200">
                    <div className="font-medium text-gray-900 capitalize">{mealType}</div>
                  </div>
                  {DAYS_OF_WEEK.map((day) => {
                    const meal = mealPlan[day]?.[mealType];
                    return (
                      <div
                        key={`${day}-${mealType}`}
                        className={`p-3 border-r border-gray-200 last:border-r-0 min-h-[120px] relative group transition-colors ${
                          dragOverSlot === `${day}-${mealType}` ? 'bg-orange-50' : ''
                        }`}
                        onDragOver={(e) => handleDragOver(e, day, mealType)}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, day, mealType)}
                      >
                        {meal ? (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 h-full relative group-hover:shadow-md transition-shadow">
                            <button
                              onClick={() => removeFromMealPlan(day, mealType)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              ×
                            </button>
                            <div className="font-medium text-gray-900 text-sm mb-1 pr-2">
                              {meal.recipe.title}
                            </div>
                            <div className="text-xs text-gray-600">
                              {meal.recipe.prepTime + meal.recipe.cookTime}m • {meal.recipe.difficulty}
                            </div>
                            {meal.recipe.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {meal.recipe.tags.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-full border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm text-center hover:border-orange-300 hover:text-orange-600 transition-colors">
                            Drop a recipe here
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
              <Link
                href="/shopping-list"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                Generate Shopping List
              </Link>

              <button
                onClick={fetchMealPlan}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}