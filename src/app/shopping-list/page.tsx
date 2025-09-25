'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

interface ShoppingListItem {
  name: string;
  totalAmount: number;
  unit: string;
  category: string;
  isPurchased: boolean;
}

interface ShoppingListData {
  id: string | null;
  userId: string;
  weekStartDate: string;
  items: ShoppingListItem[];
  createdAt: string | null;
  updatedAt: string | null;
}

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

// Group items by category
function groupItemsByCategory(items: ShoppingListItem[]): Record<string, ShoppingListItem[]> {
  return items.reduce((groups, item) => {
    const category = item.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, ShoppingListItem[]>);
}

// Category icons
const categoryIcons: Record<string, string> = {
  'Produce': '🥬',
  'Dairy': '🥛',
  'Meat': '🥩',
  'Pantry': '🏪',
  'Spices': '🧂',
  'Other': '📦',
};

export default function ShoppingListPage() {
  const { user, isLoaded } = useUser();
  const [shoppingList, setShoppingList] = useState<ShoppingListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));

  // Fetch shopping list
  const fetchShoppingList = async () => {
    try {
      setLoading(true);
      const weekString = currentWeekStart.toISOString().split('T')[0];
      const response = await fetch(`/api/shopping-list?week=${weekString}`);

      if (!response.ok) throw new Error('Failed to fetch shopping list');

      const data = await response.json();
      setShoppingList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shopping list');
    } finally {
      setLoading(false);
    }
  };

  // Toggle item purchased status
  const toggleItemPurchased = async (itemName: string, unit: string, isPurchased: boolean) => {
    if (!shoppingList) return;

    try {
      // Update local state immediately for better UX
      const updatedItems = shoppingList.items.map(item =>
        item.name === itemName && item.unit === unit
          ? { ...item, isPurchased: !isPurchased }
          : item
      );

      setShoppingList({
        ...shoppingList,
        items: updatedItems,
      });

      // Update on server
      const response = await fetch('/api/shopping-list', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStartDate: shoppingList.weekStartDate,
          items: updatedItems,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update shopping list');
      }
    } catch (err) {
      // Revert on error
      fetchShoppingList();
      console.error('Error updating item:', err);
    }
  };

  // Get date for a specific day of the week
  function getDateForDay(offset: number): Date {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + offset);
    return date;
  }

  // Navigation
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newWeekStart);
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchShoppingList();
    }
  }, [isLoaded, user, currentWeekStart]);

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
          <p className="text-gray-600">Please sign in to access your shopping list.</p>
          <Link href="/sign-in" className="mt-4 inline-block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const groupedItems = shoppingList ? groupItemsByCategory(shoppingList.items) : {};
  const totalItems = shoppingList?.items.length || 0;
  const completedItems = shoppingList?.items.filter(item => item.isPurchased).length || 0;
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shopping List</h1>
              <p className="text-gray-600 mt-1">Organized by your weekly meal plan</p>
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

          {/* Progress Bar */}
          {totalItems > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Shopping Progress</span>
                <span className="text-sm text-gray-500">{completedItems}/{totalItems} items</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="text-center mt-2">
                <span className="text-lg font-semibold text-green-600">{progressPercentage}% Complete</span>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <svg className="animate-spin w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Generating shopping list...
            </div>
          </div>
        ) : totalItems === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🛒</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Shopping List Yet</h3>
            <p className="text-gray-600 mb-6">
              Create a meal plan first to generate your shopping list automatically.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/meal-planner"
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Plan Your Meals
              </Link>
              <button
                onClick={fetchShoppingList}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Refresh List
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-2xl">{categoryIcons[category] || categoryIcons['Other']}</span>
                    {category}
                    <span className="text-sm font-normal text-gray-500 ml-auto">
                      {items.filter(item => item.isPurchased).length}/{items.length} completed
                    </span>
                  </h3>
                </div>

                <div className="divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <div
                      key={`${item.name}-${item.unit}`}
                      className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${
                        item.isPurchased ? 'opacity-60' : ''
                      }`}
                    >
                      <button
                        onClick={() => toggleItemPurchased(item.name, item.unit, item.isPurchased)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          item.isPurchased
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {item.isPurchased && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>

                      <div className="flex-1">
                        <div className={`font-medium ${item.isPurchased ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {item.totalAmount} {item.unit} {item.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Link
                href="/meal-planner"
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                Edit Meal Plan
              </Link>

              <button
                onClick={fetchShoppingList}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Refresh List
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}