'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ImportedRecipe {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  yield?: string;
  totalTimeMinutes?: number;
  instructions: string[];
  nutrition?: Record<string, string | number>;
  tags: string[];
  author?: string;
  sourceUrl: string;
  canonicalUrl?: string;
  createdAt: string;
  ingredients: Array<{
    id: string;
    raw: string;
    qty?: number;
    unit?: string;
    item?: string;
  }>;
}

interface ImportedRecipeCardProps {
  recipe: ImportedRecipe;
  viewMode: 'grid' | 'list';
  onUpdate?: () => void;
}

export default function ImportedRecipeCard({ recipe, viewMode, onUpdate }: ImportedRecipeCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this imported recipe?')) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/imported-recipes/${recipe.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }

      onUpdate?.();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete recipe. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
        <div className="flex items-center gap-4">
          {/* Image */}
          <div className="relative w-20 h-20 flex-shrink-0">
            {recipe.imageUrl && recipe.imageUrl.startsWith('http') ? (
              <Image
                src={recipe.imageUrl}
                alt={recipe.title}
                fill
                className="object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white mb-1 truncate">{recipe.title}</h3>
                {recipe.description && (
                  <p className="text-sm text-gray-400 line-clamp-2">{recipe.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="text-purple-400">🔗</span>
                    Imported
                  </span>
                  {recipe.author && (
                    <>
                      <span>•</span>
                      <span>By {recipe.author}</span>
                    </>
                  )}
                  {recipe.totalTimeMinutes && (
                    <>
                      <span>•</span>
                      <span>{recipe.totalTimeMinutes} min</span>
                    </>
                  )}
                </div>
              </div>

              {/* Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>

                {isMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-1 bg-gray-700 rounded-lg shadow-xl z-20 min-w-[160px]">
                      <Link
                        href={`/recipes/imported/${recipe.id}`}
                        className="block px-4 py-2 hover:bg-gray-600 rounded-t-lg text-sm text-white"
                      >
                        View Details
                      </Link>
                      <a
                        href={recipe.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2 hover:bg-gray-600 text-sm text-white"
                      >
                        View Source
                      </a>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-full text-left px-4 py-2 hover:bg-gray-600 rounded-b-lg text-sm text-red-400 disabled:opacity-50"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="nav-card rounded-xl overflow-hidden hover:scale-[1.02] transition-all duration-200 group">
      {/* Image */}
      <div className="relative h-48 bg-gray-800 overflow-hidden">
        {recipe.imageUrl && recipe.imageUrl.startsWith('http') ? (
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-purple-600/90 px-2 py-1 rounded-lg text-xs font-bold text-white">
          🔗 IMPORTED
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-white text-lg line-clamp-2 flex-1">{recipe.title}</h3>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1 bg-gray-700 rounded-lg shadow-xl z-20 min-w-[160px]">
                  <Link
                    href={`/recipes/imported/${recipe.id}`}
                    className="block px-4 py-2 hover:bg-gray-600 rounded-t-lg text-sm text-white"
                  >
                    View Details
                  </Link>
                  <a
                    href={recipe.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 hover:bg-gray-600 text-sm text-white"
                  >
                    View Source
                  </a>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full text-left px-4 py-2 hover:bg-gray-600 rounded-b-lg text-sm text-red-400 disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {recipe.description && (
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">{recipe.description}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
          {recipe.totalTimeMinutes && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-accent-orange" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="font-bold text-accent-orange">{recipe.totalTimeMinutes}m</span>
            </div>
          )}
          {recipe.yield && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-accent-green" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span className="font-bold text-accent-green">{recipe.yield}</span>
            </div>
          )}
        </div>

        {/* Author */}
        {recipe.author && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <span>By</span>
            <span className="text-gray-300">{recipe.author}</span>
          </div>
        )}

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {recipe.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {recipe.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-700/50 text-gray-400 rounded text-xs">
                +{recipe.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* View Details Button */}
        <Link
          href={`/recipes/imported/${recipe.id}`}
          className="block w-full text-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold text-sm
                   hover:scale-105 transition-all duration-200"
        >
          VIEW DETAILS
        </Link>
      </div>
    </div>
  );
}
