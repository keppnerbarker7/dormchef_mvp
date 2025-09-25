'use client';

import { useState } from 'react';

interface FilterState {
  search: string;
  difficulty: string;
  maxPrepTime: number;
  tags: string[];
  authorId: string;
  isPublic: boolean | null;
}

interface SearchFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  loading: boolean;
}

export default function SearchFilters({ filters, onFilterChange, loading }: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ search: e.target.value });
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ difficulty: e.target.value });
  };

  const handlePrepTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ maxPrepTime: parseInt(e.target.value) });
  };

  const handleVisibilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({ 
      isPublic: value === 'all' ? null : value === 'public' ? true : false 
    });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      difficulty: '',
      maxPrepTime: 120,
      tags: [],
      authorId: '',
      isPublic: null,
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      {/* Main Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search recipes, ingredients, or authors..."
              value={filters.search}
              onChange={handleSearchChange}
              disabled={loading}
              className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="md:hidden bg-gray-700 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <svg className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Filters
        </button>
      </div>

      {/* Advanced Filters */}
      <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${isExpanded ? 'block' : 'hidden md:grid'}`}>
        {/* Difficulty Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Difficulty
          </label>
          <select
            value={filters.difficulty}
            onChange={handleDifficultyChange}
            disabled={loading}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
          >
            <option value="">All Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Prep Time Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max Prep Time: {filters.maxPrepTime}min
          </label>
          <input
            type="range"
            min="5"
            max="120"
            step="5"
            value={filters.maxPrepTime}
            onChange={handlePrepTimeChange}
            disabled={loading}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>5min</span>
            <span>120min</span>
          </div>
        </div>

        {/* Visibility Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Visibility
          </label>
          <select
            value={filters.isPublic === null ? 'all' : filters.isPublic ? 'public' : 'private'}
            onChange={handleVisibilityChange}
            disabled={loading}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
          >
            <option value="all">All Recipes</option>
            <option value="public">Public Only</option>
            <option value="private">My Private</option>
          </select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            disabled={loading}
            className="w-full bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600 hover:text-white transition-colors disabled:opacity-50"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}
