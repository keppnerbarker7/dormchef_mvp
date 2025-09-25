'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-white">DormChef</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/sign-in"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Cook cheap.
              <br />
              Cook healthy.
              <br />
              <span className="text-orange-500">Cook together.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The lightweight web app that helps college students cook affordable,
              healthy meals in small kitchens. Plan meals, share recipes, and connect with friends.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg"
              >
                Start Cooking
              </Link>
              <Link
                href="/sign-in"
                className="border-2 border-gray-600 hover:border-gray-500 text-white px-8 py-4 rounded-lg text-lg font-semibold"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-slate-800/50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Everything you need to eat better
              </h2>
              <p className="text-gray-400 text-lg">
                Built specifically for college students living in dorms and small apartments
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Link
                href="/sign-in"
                className="text-center group hover:bg-slate-700/30 p-6 rounded-lg transition-all cursor-pointer"
              >
                <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500 transition-colors">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-orange-400 transition-colors">Recipe Catalog</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  Create and organize your personal collection of dorm-friendly recipes
                </p>
              </Link>

              <Link
                href="/sign-in"
                className="text-center group hover:bg-slate-700/30 p-6 rounded-lg transition-all cursor-pointer"
              >
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500 transition-colors">
                  <span className="text-2xl">📅</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-orange-400 transition-colors">Meal Planning</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  Drag and drop recipes into a weekly calendar to plan ahead
                </p>
              </Link>

              <Link
                href="/sign-in"
                className="text-center group hover:bg-slate-700/30 p-6 rounded-lg transition-all cursor-pointer"
              >
                <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500 transition-colors">
                  <span className="text-2xl">🛒</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-orange-400 transition-colors">Shopping Lists</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  Auto-generated grocery lists based on your weekly meal plan
                </p>
              </Link>

              <Link
                href="/sign-in"
                className="text-center group hover:bg-slate-700/30 p-6 rounded-lg transition-all cursor-pointer"
              >
                <div className="bg-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-500 transition-colors">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-orange-400 transition-colors">Social Cooking</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  See what friends are cooking and share your favorite recipes
                </p>
              </Link>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to start cooking better?
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Join thousands of college students who are already cooking healthier,
              cheaper meals with DormChef.
            </p>
            <Link
              href="/sign-up"
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg inline-block"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2024 DormChef. Built for college students, by college students.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
