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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-lg text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-black shadow-2xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-3xl font-bold text-accent-orange font-display tracking-tight">
              DORMCHEF
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 font-medium">
                What's up, {user.firstName || user.emailAddresses[0]?.emailAddress}
              </span>
              <Link
                href="/profile"
                className="px-4 py-2 text-sm font-bold text-gray-200 bg-gray-800 border border-gray-700
                         rounded hover:bg-gray-700 hover:border-accent-orange transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-accent-orange"
              >
                PROFILE
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10 border-2 border-accent-orange',
                    userButtonPopoverCard: 'bg-gray-800 shadow-2xl border border-gray-700',
                    userButtonPopoverActionButton: 'text-gray-300 hover:bg-gray-700 hover:text-accent-orange',
                  }
                }}
                afterSignOutUrl="/sign-in"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Immersive Hero Command Center */}
        <div className="hero-command-center rounded-2xl p-8 mb-12 relative">
          <div className="relative z-10">
            <div className="mb-8">
              <h2 className="text-5xl font-bold text-gray-100 mb-4 font-display tracking-tight">
                Your Nutrition.
                <span className="text-accent-orange block">Simplified.</span>
              </h2>
              <p className="text-xl text-gray-300 font-medium">
                Your personal performance nutrition dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Stats HUD */}
              <div className="stats-hud rounded-xl p-6 pulse-orange">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-100 font-display">Weekly Progress</h3>
                  <div className="w-3 h-3 bg-accent-orange rounded-full animate-pulse"></div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300 font-medium">Weekly Protein Goal</span>
                      <span className="text-accent-orange font-bold">847g / 1050g</span>
                    </div>
                    <div className="progress-bar h-2 rounded-full" style={{"--progress": "80.7%"}}>
                      <div className="absolute inset-0 bg-gradient-to-r from-accent-orange to-accent-red rounded-full"
                           style={{width: "80.7%"}}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300 font-medium">Meal Prep Streak</span>
                      <span className="text-accent-green font-bold">12 days</span>
                    </div>
                    <div className="progress-bar h-2 rounded-full">
                      <div className="absolute inset-0 bg-gradient-to-r from-accent-green to-accent-steel rounded-full"
                           style={{width: "85%"}}></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent-orange">23</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Recipes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent-green">7</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Planned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent-steel">5</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Friends</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Meal Preview */}
              <div className="meal-preview rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-100 font-display">Next Meal</h3>
                  <div className="text-accent-green text-sm font-medium bg-accent-green/20 px-3 py-1 rounded-full">
                    TODAY 6:30 PM
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-accent-orange/20 to-accent-red/20 rounded-xl flex items-center justify-center">
                    <span className="text-3xl">🥩</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-100 mb-1">Power Beef Bowl</h4>
                    <p className="text-gray-400 text-sm mb-2">High-protein post-workout fuel</p>
                    <div className="flex space-x-4 text-xs">
                      <span className="text-accent-orange">45g protein</span>
                      <span className="text-accent-green">650 calories</span>
                      <span className="text-accent-steel">15 min prep</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-700">
                  <Link href="/meal-planner" className="text-accent-orange hover:text-accent-red transition-colors text-sm font-medium">
                    View full meal plan →
                  </Link>
                </div>
              </div>

              {/* Squad Feed */}
              <div className="meal-preview rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-100 font-display">Friend Activity</h3>
                  <div className="text-accent-steel text-sm font-medium">@mike_lifts</div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-accent-green/20 to-accent-steel/20 rounded-xl flex items-center justify-center">
                    <span className="text-3xl">🥗</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-100 mb-1">Macro Salad Stack</h4>
                    <p className="text-gray-400 text-sm mb-2">"Perfect cutting season fuel 💪"</p>
                    <div className="flex space-x-4 text-xs">
                      <span className="text-accent-orange">38g protein</span>
                      <span className="text-accent-green">420 calories</span>
                      <span className="text-red-400">❤️ 12</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-700">
                  <Link href="/friends" className="text-accent-steel hover:text-accent-green transition-colors text-sm font-medium">
                    See what friends are cooking →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="nav-card p-6 rounded-lg">
            <div className="flex items-center mb-3">
              <div className="w-2 h-6 gradient-orange rounded-full mr-3"></div>
              <h3 className="text-lg font-bold text-gray-100 font-display">Recipes</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">Browse recipes</p>
            <Link
              href="/recipes"
              className="w-full inline-block text-center px-4 py-2 gradient-orange text-white font-bold text-sm
                       rounded hover:scale-105 transition-all duration-200 uppercase tracking-wide"
            >
              Browse
            </Link>
          </div>

          <div className="nav-card p-6 rounded-lg">
            <div className="flex items-center mb-3">
              <div className="w-2 h-6 gradient-green rounded-full mr-3"></div>
              <h3 className="text-lg font-bold text-gray-100 font-display">Meal Planner</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">Plan your week</p>
            <Link
              href="/meal-planner"
              className="w-full inline-block text-center px-4 py-2 gradient-green text-white font-bold text-sm
                       rounded hover:scale-105 transition-all duration-200 uppercase tracking-wide"
            >
              Plan
            </Link>
          </div>

          <div className="nav-card p-6 rounded-lg">
            <div className="flex items-center mb-3">
              <div className="w-2 h-6 gradient-red rounded-full mr-3"></div>
              <h3 className="text-lg font-bold text-gray-100 font-display">Shopping List</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">Your grocery list</p>
            <Link
              href="/shopping-list"
              className="w-full inline-block text-center px-4 py-2 gradient-red text-white font-bold text-sm
                       rounded hover:scale-105 transition-all duration-200 uppercase tracking-wide"
            >
              Shop
            </Link>
          </div>

          <div className="nav-card p-6 rounded-lg">
            <div className="flex items-center mb-3">
              <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-full mr-3"></div>
              <h3 className="text-lg font-bold text-gray-100 font-display">Add Recipe</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">Create new recipe</p>
            <Link
              href="/recipes/add"
              className="w-full inline-block text-center px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600
                       text-white font-bold text-sm rounded hover:scale-105 transition-all duration-200 uppercase tracking-wide"
            >
              Create
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}