'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

interface RecipeFormData {
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  isPublic: boolean;
  imageUrl: string;
}

const POWER_TAGS = [
  'Pre-Workout', 'Post-Workout', 'Breakfast', 'Lunch', 'Dinner', 'Snack',
  'High-Protein', 'Mass Gainer', 'Cutting', 'Bulking', 'Low-Carb', 'Keto',
  'Quick Fuel', 'Meal Prep', 'One-Pot', 'Budget Beast', 'Vegan Power',
  'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Recovery Fuel', 'Energy Boost'
];

const UNITS = [
  'cups', 'tbsp', 'tsp', 'oz', 'lbs', 'g', 'kg',
  'ml', 'l', 'pieces', 'whole', 'slices', 'cloves'
];

export default function AddRecipePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [formData, setFormData] = useState<RecipeFormData>({
    title: '',
    description: '',
    ingredients: [{ name: '', amount: 0, unit: 'cups' }],
    instructions: [''],
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    difficulty: 'Easy',
    tags: [],
    isPublic: true,
    imageUrl: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: 0, unit: 'cups' }]
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) =>
        i === index ? value : inst
      )
    }));
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Recipe title is required');
      }

      const validIngredients = formData.ingredients.filter(ing =>
        ing.name.trim() && ing.amount > 0
      );

      if (validIngredients.length === 0) {
        throw new Error('At least one valid ingredient is required');
      }

      const validInstructions = formData.instructions.filter(inst => inst.trim());

      if (validInstructions.length === 0) {
        throw new Error('At least one instruction is required');
      }

      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ingredients: validIngredients,
          instructions: validInstructions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create recipe');
      }

      setSuccess('Recipe created successfully!');
      setTimeout(() => {
        router.push('/recipes');
      }, 1500);

    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-black shadow-2xl border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <Link
                href="/recipes"
                className="flex items-center gap-3 text-gray-300 hover:text-accent-orange transition-colors font-medium"
              >
                <div className="w-8 h-8 rounded-lg bg-accent-orange/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-accent-orange" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                BACK TO ARSENAL
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-accent-orange font-display tracking-tight">
              CREATE POWER RECIPE
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Messages */}
          {error && (
            <div className="stats-hud border border-accent-red rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-red/20 rounded-xl flex items-center justify-center">
                  <span className="text-accent-red text-xl">⚠️</span>
                </div>
                <div>
                  <h3 className="text-accent-red font-bold mb-1">SYSTEM ERROR</h3>
                  <p className="text-gray-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="stats-hud border border-accent-green rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-green/20 rounded-xl flex items-center justify-center">
                  <span className="text-accent-green text-xl">✅</span>
                </div>
                <div>
                  <h3 className="text-accent-green font-bold mb-1">RECIPE DEPLOYED</h3>
                  <p className="text-gray-300">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="hero-command-center rounded-2xl p-8">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-gray-100 mb-6 font-display tracking-tight flex items-center gap-3">
                <span className="text-accent-orange">💪</span>
                RECIPE INTEL
              </h2>

              <div className="grid grid-cols-1 gap-8">
                <div>
                  <label htmlFor="title" className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
                    Power Recipe Name *
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="block w-full px-6 py-4 bg-black/40 border border-gray-700 rounded-xl text-white
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-orange
                             focus:border-accent-orange font-medium text-lg"
                    placeholder="e.g. Beast Mode Protein Bowl"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
                    Recipe Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="block w-full px-6 py-4 bg-black/40 border border-gray-700 rounded-xl text-white
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-orange
                             focus:border-accent-orange font-medium resize-none"
                    placeholder="Describe your power recipe - what makes it special for athletes?"
                  />
                </div>

                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
                    Recipe Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="block w-full px-6 py-4 bg-black/40 border border-gray-700 rounded-xl text-white
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-orange
                             focus:border-accent-orange font-medium"
                    placeholder="https://example.com/beast-recipe.jpg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recipe Details */}
          <div className="stats-hud rounded-xl p-8">
            <h2 className="text-3xl font-bold text-gray-100 mb-6 font-display tracking-tight flex items-center gap-3">
              <span className="text-accent-green">⚡</span>
              PERFORMANCE SPECS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label htmlFor="prepTime" className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
                  Prep Time (min)
                </label>
                <input
                  type="number"
                  id="prepTime"
                  min="0"
                  value={formData.prepTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, prepTime: parseInt(e.target.value) || 0 }))}
                  className="block w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white
                           focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-accent-orange font-medium"
                />
              </div>

              <div>
                <label htmlFor="cookTime" className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
                  Cook Time (min)
                </label>
                <input
                  type="number"
                  id="cookTime"
                  min="0"
                  value={formData.cookTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, cookTime: parseInt(e.target.value) || 0 }))}
                  className="block w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white
                           focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-accent-orange font-medium"
                />
              </div>

              <div>
                <label htmlFor="servings" className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
                  Servings
                </label>
                <input
                  type="number"
                  id="servings"
                  min="1"
                  value={formData.servings}
                  onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                  className="block w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white
                           focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-accent-orange font-medium"
                />
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
                  Intensity Level
                </label>
                <select
                  id="difficulty"
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard' }))}
                  className="block w-full px-4 py-3 bg-black/40 border border-gray-700 rounded-xl text-white
                           focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-accent-orange font-medium"
                >
                  <option value="Easy">Beginner</option>
                  <option value="Medium">Intermediate</option>
                  <option value="Hard">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Ingredients</h2>
              <button
                type="button"
                onClick={addIngredient}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                Add Ingredient
              </button>
            </div>

            <div className="space-y-3">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Ingredient Name
                    </label>
                    <input
                      type="text"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. Flour"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-sm font-medium text-gray-700">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      value={ingredient.amount}
                      onChange={(e) => updateIngredient(index, 'amount', parseFloat(e.target.value) || 0)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-sm font-medium text-gray-700">
                      Unit
                    </label>
                    <select
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {UNITS.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  {formData.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="px-2 py-2 text-red-600 hover:text-red-800"
                      title="Remove ingredient"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Instructions</h2>
              <button
                type="button"
                onClick={addInstruction}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                Add Step
              </button>
            </div>

            <div className="space-y-3">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mt-1">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <textarea
                      rows={2}
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Step ${index + 1} instructions...`}
                    />
                  </div>
                  {formData.instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="px-2 py-1 text-red-600 hover:text-red-800 mt-1"
                      title="Remove step"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* FUEL CATEGORIES */}
          <div className="stats-hud rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-100 mb-6 font-display tracking-tight uppercase">
              FUEL CATEGORIES
            </h2>
            <div className="flex flex-wrap gap-3">
              {POWER_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 text-sm rounded-xl border-2 transition-all duration-200 font-medium uppercase tracking-wide ${
                    formData.tags.includes(tag)
                      ? 'bg-accent-orange text-white border-accent-orange shadow-lg transform scale-105'
                      : 'bg-black/40 border-gray-700 text-gray-300 hover:border-accent-orange hover:text-accent-orange hover:bg-accent-orange/10'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* DEPLOY RECIPE */}
          <div className="stats-hud rounded-xl p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center">
                <label className="flex items-center group cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 ${
                      formData.isPublic
                        ? 'bg-accent-orange border-accent-orange'
                        : 'border-gray-600 bg-black/40'
                    }`}>
                      {formData.isPublic && (
                        <svg className="w-4 h-4 text-white m-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="text-lg font-bold text-gray-100 font-display uppercase tracking-wide">
                      SHARE WITH SQUAD
                    </span>
                    <p className="text-sm text-gray-400 font-medium">
                      Make this power recipe available to other champions
                    </p>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 gradient-orange text-white rounded-xl font-bold text-lg uppercase tracking-wide
                         hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                         disabled:hover:scale-100 shadow-lg flex items-center gap-3"
              >
                <span className="text-2xl">⚡</span>
                {isSubmitting ? 'DEPLOYING RECIPE...' : 'DEPLOY POWER RECIPE'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}