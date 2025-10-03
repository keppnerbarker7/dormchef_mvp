'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import RecipeCard from '@/components/RecipeCard';
import SearchFilters from '@/components/SearchFilters';

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
  isPublic: boolean;
  author: {
    id: string;
    username: string;
    displayName: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface RecipesResponse {
  recipes: Recipe[];
  total: number;
  page: number;
  totalPages: number;
}

interface FilterState {
  search: string;
  difficulty: string;
  maxPrepTime: number;
  tags: string[];
  authorId: string;
  isPublic: boolean | null;
}

export default function RecipesPage() {
  const { user, isLoaded } = useUser();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    difficulty: '',
    maxPrepTime: 120,
    tags: [],
    authorId: '',
    isPublic: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchRecipes = async (page = 1) => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.maxPrepTime < 120) params.append('maxPrepTime', filters.maxPrepTime.toString());
      if (filters.tags.length > 0) params.append('tags', filters.tags.join(','));
      if (filters.authorId) params.append('authorId', filters.authorId);
      if (filters.isPublic !== null) params.append('isPublic', filters.isPublic.toString());

      const response = await fetch(`/api/recipes?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }

      const data: RecipesResponse = await response.json();
      setRecipes(data.recipes);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes(1);
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handlePageChange = (page: number) => {
    fetchRecipes(page);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">Please sign in to view recipes.</p>
          <Link href="/sign-in" className="mt-4 inline-block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation Header */}
      <div className="bg-black border-b border-gray-800 shadow-2xl">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 text-gray-300 hover:text-accent-orange transition-colors font-medium"
            >
              <div className="w-8 h-8 rounded-lg bg-accent-orange/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-accent-orange" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </div>
              COMMAND CENTER
            </Link>
            <h2 className="text-2xl font-bold text-accent-orange font-display tracking-tight">FUEL ARSENAL</h2>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="hero-command-center rounded-2xl p-8 mb-8 relative">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-5xl font-bold mb-4 font-display tracking-tight text-gray-100">
                  POWER
                  <span className="text-accent-orange block">RECIPES</span>
                </h1>
                <p className="text-xl text-gray-300 font-medium">
                  Your arsenal of high-performance nutrition.
                  <span className="text-accent-orange font-bold"> Fuel your gains.</span>
                </p>
              </div>

              <div className="flex items-center gap-4 mt-6 md:mt-0">
                {/* Add Recipe Button */}
                <Link
                  href="/recipes/add"
                  className="px-6 py-3 gradient-orange text-white rounded-xl font-bold uppercase tracking-wide
                           hover:scale-105 transition-all duration-200 flex items-center gap-2 shadow-lg"
                >
                  <span className="text-xl">⚡</span>
                  ADD POWER RECIPE
                </Link>
                {/* View Mode Toggle */}
                <div className="flex stats-hud rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-3 rounded-lg transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-accent-orange text-white shadow-lg'
                        : 'text-gray-400 hover:text-accent-orange hover:bg-accent-orange/10'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm6 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM3 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm6 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-3 rounded-lg transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-accent-orange text-white shadow-lg'
                        : 'text-gray-400 hover:text-accent-orange hover:bg-accent-orange/10'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recipe Count HUD */}
          <div className="absolute top-6 right-6 stats-hud rounded-xl p-4 hidden lg:block">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-orange mb-1">{recipes.length}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Power Recipes</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <SearchFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          loading={loading}
        />

        {/* Results Info */}
        <div className="flex items-center justify-between mb-8">
          <div className="stats-hud rounded-xl px-6 py-3">
            <p className="text-gray-300 font-medium">
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-orange rounded-full animate-pulse"></div>
                  Scanning arsenal...
                </span>
              ) : (
                <span>
                  <span className="text-accent-orange font-bold">{recipes.length}</span> power recipes ready
                </span>
              )}
            </p>
          </div>

          {totalPages > 1 && (
            <div className="stats-hud rounded-xl px-4 py-2">
              <div className="text-sm text-gray-300 font-medium">
                Page <span className="text-accent-orange font-bold">{currentPage}</span> of <span className="text-accent-green font-bold">{totalPages}</span>
              </div>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="stats-hud border border-accent-red rounded-xl p-6 mb-8">
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

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="nav-card rounded-xl p-6 animate-pulse">
                <div className="bg-gray-700 h-48 rounded-xl mb-4"></div>
                <div className="bg-gray-700 h-4 rounded mb-2"></div>
                <div className="bg-gray-700 h-3 rounded w-3/4 mb-4"></div>
                <div className="flex justify-between">
                  <div className="bg-gray-700 h-3 rounded w-16"></div>
                  <div className="bg-gray-700 h-3 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recipes Grid/List */}
        {!loading && recipes.length > 0 && (
          <div className={
            viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
              : "space-y-4 mb-8"
          }>
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                viewMode={viewMode}
                onUpdate={() => fetchRecipes(currentPage)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && recipes.length === 0 && !error && (
          <div className="hero-command-center rounded-2xl p-12 text-center relative">
            <div className="relative z-10">
              <div className="text-8xl mb-6">💪</div>
              <h3 className="text-3xl font-bold text-gray-100 mb-4 font-display tracking-tight">
                ARSENAL EMPTY
              </h3>
              <p className="text-xl text-gray-300 mb-8 font-medium">
                Time to build your <span className="text-accent-orange font-bold">power recipe collection</span>.
                <span className="block mt-2">Your gains are waiting.</span>
              </p>
              <Link
                href="/recipes/add"
                className="gradient-orange text-white px-8 py-4 rounded-xl text-lg font-bold
                         hover:scale-105 transition-all duration-200 uppercase tracking-wide shadow-2xl inline-flex items-center gap-3"
              >
                <span className="text-2xl">⚡</span>
                CREATE FIRST POWER RECIPE
              </Link>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-3 rounded-xl stats-hud text-gray-300 hover:text-accent-orange hover:bg-accent-orange/10
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = currentPage <= 3
                ? i + 1
                : currentPage >= totalPages - 2
                  ? totalPages - 4 + i
                  : currentPage - 2 + i;

              if (page < 1 || page > totalPages) return null;

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-3 rounded-xl transition-all duration-200 font-bold ${
                    page === currentPage
                      ? 'gradient-orange text-white shadow-lg transform scale-105'
                      : 'stats-hud text-gray-300 hover:text-accent-orange hover:bg-accent-orange/10'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-3 rounded-xl stats-hud text-gray-300 hover:text-accent-orange hover:bg-accent-orange/10
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}