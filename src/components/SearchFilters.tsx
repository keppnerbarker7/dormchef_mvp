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
    <div className="stats-hud rounded-xl p-6 mb-8">
      {/* Main Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search power recipes, ingredients, or champions..."
              value={filters.search}
              onChange={handleSearchChange}
              disabled={loading}
              className="w-full bg-black/40 text-white placeholder-gray-400 rounded-xl px-6 py-4 pl-12
                       border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-orange
                       focus:border-accent-orange disabled:opacity-50 font-medium"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-lg bg-accent-orange/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-accent-orange" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="md:hidden bg-black/40 text-white px-6 py-4 rounded-xl hover:bg-accent-orange/20
                   hover:border-accent-orange border border-gray-700 transition-all duration-200
                   flex items-center gap-3 font-bold uppercase tracking-wide"
        >
          <svg className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          FILTERS
        </button>
      </div>

      {/* Advanced Filters */}
      <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 ${isExpanded ? 'block' : 'hidden md:grid'}`}>
        {/* Difficulty Filter */}
        <div>
          <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
            Intensity Level
          </label>
          <select
            value={filters.difficulty}
            onChange={handleDifficultyChange}
            disabled={loading}
            className="w-full bg-black/40 text-white rounded-xl px-4 py-3 border border-gray-700
                     focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-accent-orange
                     disabled:opacity-50 font-medium"
          >
            <option value="">All Levels</option>
            <option value="Easy">Beginner</option>
            <option value="Medium">Intermediate</option>
            <option value="Hard">Advanced</option>
          </select>
        </div>

        {/* Prep Time Filter */}
        <div>
          <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
            Max Prep Time: <span className="text-accent-orange">{filters.maxPrepTime}min</span>
          </label>
          <input
            type="range"
            min="5"
            max="120"
            step="5"
            value={filters.maxPrepTime}
            onChange={handlePrepTimeChange}
            disabled={loading}
            className="w-full h-3 bg-black/40 rounded-xl appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--accent-orange) 0%, var(--accent-orange) ${(filters.maxPrepTime - 5) / 115 * 100}%, rgba(0,0,0,0.4) ${(filters.maxPrepTime - 5) / 115 * 100}%, rgba(0,0,0,0.4) 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
            <span>5min</span>
            <span>120min</span>
          </div>
        </div>

        {/* Visibility Filter */}
        <div>
          <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
            Recipe Source
          </label>
          <select
            value={filters.isPublic === null ? 'all' : filters.isPublic ? 'public' : 'private'}
            onChange={handleVisibilityChange}
            disabled={loading}
            className="w-full bg-black/40 text-white rounded-xl px-4 py-3 border border-gray-700
                     focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-accent-orange
                     disabled:opacity-50 font-medium"
          >
            <option value="all">All Arsenal</option>
            <option value="public">Squad Shared</option>
            <option value="private">Personal Only</option>
          </select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            disabled={loading}
            className="w-full bg-black/40 text-gray-300 px-4 py-3 rounded-xl border border-gray-700
                     hover:bg-accent-red/20 hover:border-accent-red hover:text-accent-red
                     transition-all duration-200 disabled:opacity-50 font-bold uppercase tracking-wide"
          >
            RESET FILTERS
          </button>
        </div>
      </div>
    </div>
  );
}
