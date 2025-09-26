'use client';

import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">DormChef</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {user.firstName || user.emailAddresses[0]?.emailAddress}
              </span>
              <Link
                href="/profile"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100
                         rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2
                         focus:ring-offset-2 focus:ring-gray-500"
              >
                Profile
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8',
                    userButtonPopoverCard: 'bg-white shadow-lg border border-gray-200',
                    userButtonPopoverActionButton: 'text-gray-700 hover:bg-gray-100',
                  }
                }}
                afterSignOutUrl="/sign-in"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to DormChef! 👨‍🍳
          </h2>
          <p className="text-lg text-gray-600">
            Cook cheap. Cook healthy. Cook together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">My Recipes</h3>
            <p className="text-gray-600 mb-4">
              Create and organize your personal recipe collection
            </p>
            <Link
              href="/recipes"
              className="w-full inline-block text-center px-4 py-2 bg-blue-600 text-white rounded-md
                       hover:bg-blue-700 focus:outline-none focus:ring-2
                       focus:ring-offset-2 focus:ring-blue-500"
            >
              View Recipes
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Meal Planner</h3>
            <p className="text-gray-600 mb-4">
              Plan your weekly meals with drag and drop
            </p>
            <Link
              href="/meal-planner"
              className="w-full inline-block text-center px-4 py-2 bg-green-600 text-white rounded-md
                       hover:bg-green-700 focus:outline-none focus:ring-2
                       focus:ring-offset-2 focus:ring-green-500"
            >
              Plan Meals
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Friends Feed</h3>
            <p className="text-gray-600 mb-4">
              See what your friends are cooking this week
            </p>
            <Link
              href="/friends"
              className="w-full inline-block text-center px-4 py-2 bg-orange-600 text-white rounded-md
                       hover:bg-orange-700 focus:outline-none focus:ring-2
                       focus:ring-offset-2 focus:ring-orange-500"
            >
              Explore Feed
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Shopping List</h3>
            <p className="text-gray-600 mb-4">
              Auto-generated list from your meal plan
            </p>
            <Link
              href="/shopping-list"
              className="w-full inline-block text-center px-4 py-2 bg-purple-600 text-white rounded-md
                       hover:bg-purple-700 focus:outline-none focus:ring-2
                       focus:ring-offset-2 focus:ring-purple-500"
            >
              View List
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Quick Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Recipes:</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Meals planned:</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Friends:</span>
                <span className="font-semibold">0</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Started</h3>
            <p className="text-gray-600 mb-4">
              New to DormChef? Start with adding your first recipe!
            </p>
            <Link
              href="/recipes/add"
              className="w-full inline-block text-center px-4 py-2 bg-indigo-600 text-white rounded-md
                       hover:bg-indigo-700 focus:outline-none focus:ring-2
                       focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Recipe
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}