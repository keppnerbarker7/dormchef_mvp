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
        <div className="text-lg text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-black shadow-2xl border-b border-gray-800 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-3xl font-bold text-accent-orange font-display tracking-tight">DORMCHEF</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/sign-in"
                className="text-gray-300 hover:text-accent-orange px-4 py-2 rounded font-medium uppercase tracking-wide transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="gradient-orange text-white px-6 py-2 rounded font-bold uppercase tracking-wide
                         hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Start Training
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <div className="hero-command-center relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 relative z-10">
            <div className="text-center">
              <h1 className="text-6xl md:text-8xl font-bold text-gray-100 mb-8 font-display tracking-tight leading-none">
                FUEL YOUR
                <br />
                <span className="text-accent-orange">GRIND.</span>
                <br />
                <span className="text-accent-green">FEED YOUR</span>
                <br />
                <span className="text-accent-red">GAINS.</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto font-medium leading-relaxed">
                The nutrition command center built for college athletes.
                <span className="text-accent-orange font-bold"> Plan your fuel.</span>
                <span className="text-accent-green font-bold"> Track your macros.</span>
                <span className="text-accent-steel font-bold"> Dominate your goals.</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  href="/sign-up"
                  className="gradient-orange text-white px-12 py-6 rounded-lg text-xl font-bold shadow-2xl
                           hover:scale-105 transition-all duration-200 uppercase tracking-wide"
                >
                  START TRAINING
                </Link>
                <Link
                  href="/sign-in"
                  className="border-2 border-accent-steel hover:border-accent-orange text-white px-12 py-6 rounded-lg
                           text-xl font-bold hover:bg-accent-steel/20 transition-all duration-200 uppercase tracking-wide"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>

          {/* Performance Stats Overlay */}
          <div className="absolute top-8 right-8 stats-hud rounded-xl p-4 hidden lg:block">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-orange mb-1">2,847</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Athletes Training</div>
            </div>
          </div>

          <div className="absolute bottom-8 left-8 stats-hud rounded-xl p-4 hidden lg:block">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-green mb-1">47K+</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Recipes Shared</div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-black/60 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-gray-100 mb-6 font-display tracking-tight">
                BUILT FOR
                <span className="text-accent-orange block">CHAMPIONS</span>
              </h2>
              <p className="text-gray-300 text-xl font-medium max-w-3xl mx-auto">
                Every tool you need to dominate your nutrition game.
                <span className="text-accent-orange font-bold"> No compromises.</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Link
                href="/sign-in"
                className="nav-card text-center group p-8 rounded-xl cursor-pointer relative overflow-hidden"
              >
                <div className="gradient-orange w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-3xl">💪</span>
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-3 group-hover:text-accent-orange transition-colors font-display uppercase tracking-wide">
                  POWER RECIPES
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                  High-protein, muscle-building recipes designed for serious athletes
                </p>
                <div className="absolute inset-0 bg-gradient-to-t from-accent-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>

              <Link
                href="/sign-in"
                className="nav-card text-center group p-8 rounded-xl cursor-pointer relative overflow-hidden"
              >
                <div className="gradient-green w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-3 group-hover:text-accent-green transition-colors font-display uppercase tracking-wide">
                  MEAL STRATEGY
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                  Strategic meal timing for peak performance and recovery
                </p>
                <div className="absolute inset-0 bg-gradient-to-t from-accent-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>

              <Link
                href="/sign-in"
                className="nav-card text-center group p-8 rounded-xl cursor-pointer relative overflow-hidden"
              >
                <div className="gradient-red w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-3 group-hover:text-accent-red transition-colors font-display uppercase tracking-wide">
                  MACRO TRACKING
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                  Smart shopping lists that hit your macro targets every time
                </p>
                <div className="absolute inset-0 bg-gradient-to-t from-accent-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>

              <Link
                href="/sign-in"
                className="nav-card text-center group p-8 rounded-xl cursor-pointer relative overflow-hidden"
              >
                <div className="gradient-steel w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-3xl">🔥</span>
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-3 group-hover:text-accent-steel transition-colors font-display uppercase tracking-wide">
                  SQUAD GAINS
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                  Train with your crew. Share wins, recipes, and motivation
                </p>
                <div className="absolute inset-0 bg-gradient-to-t from-accent-steel/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="hero-command-center py-20 relative">
          <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
            <h2 className="text-5xl font-bold text-gray-100 mb-6 font-display tracking-tight">
              READY TO
              <span className="text-accent-orange block">DOMINATE?</span>
            </h2>
            <p className="text-gray-300 text-xl mb-12 font-medium leading-relaxed">
              Join <span className="text-accent-orange font-bold">2,847+ college athletes</span> who are already crushing their nutrition goals.
              <span className="text-accent-green font-bold block mt-2">Your gains are waiting.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/sign-up"
                className="gradient-orange text-white px-12 py-6 rounded-xl text-xl font-bold shadow-2xl
                         hover:scale-105 transition-all duration-200 uppercase tracking-wide pulse-orange"
              >
                START TRAINING FREE
              </Link>
              <div className="flex items-center justify-center space-x-2 text-gray-400">
                <span className="text-sm">💳</span>
                <span className="text-sm font-medium">No credit card required</span>
              </div>
            </div>
          </div>

          {/* Achievement badges */}
          <div className="absolute top-8 left-8 stats-hud rounded-xl p-3 hidden lg:block">
            <div className="flex items-center space-x-2">
              <span className="text-accent-green">🏆</span>
              <div>
                <div className="text-sm font-bold text-gray-100">Elite Tier</div>
                <div className="text-xs text-gray-400">Nutrition Platform</div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 right-8 stats-hud rounded-xl p-3 hidden lg:block">
            <div className="flex items-center space-x-2">
              <span className="text-accent-orange">⚡</span>
              <div>
                <div className="text-sm font-bold text-gray-100">100% Free</div>
                <div className="text-xs text-gray-400">Always</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400 font-medium">
              © 2024 <span className="text-accent-orange font-bold">DORMCHEF</span>.
              Built for champions, by champions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
