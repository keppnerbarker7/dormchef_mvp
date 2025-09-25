'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';

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

interface RecipeCardProps {
  recipe: Recipe;
  viewMode: 'grid' | 'list';
  onUpdate?: () => void;
}

export default function RecipeCard({ recipe, viewMode, onUpdate }: RecipeCardProps) {
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user?.id === recipe.author.id;
  const totalTime = recipe.prepTime + recipe.cookTime;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-900/30 text-green-400 border-green-700';
      case 'Medium':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-700';
      case 'Hard':
        return 'bg-red-900/30 text-red-400 border-red-700';
      default:
        return 'bg-gray-900/30 text-gray-400 border-gray-700';
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/recipes/${recipe.id}`, {
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
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <Link href={`/recipes/${recipe.id}`} className="text-lg font-semibold hover:text-orange-400 transition-colors">
                  {recipe.title}
                </Link>
                {recipe.description && (
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                    {recipe.description}
                  </p>
                )}
              </div>

              {/* Actions Menu */}
              {isOwner && (
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 top-8 bg-gray-700 rounded-lg shadow-lg py-2 z-10">
                      <Link
                        href={`/recipes/${recipe.id}/edit`}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleDelete();
                        }}
                        disabled={isDeleting}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600 hover:text-red-300 disabled:opacity-50"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-4 mt-2">
              <span className={`px-2 py-1 rounded text-xs border ${getDifficultyColor(recipe.difficulty)}`}>
                {recipe.difficulty}
              </span>
              <span className="text-gray-400 text-sm flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {totalTime}m
              </span>
              <span className="text-gray-400 text-sm flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {recipe.servings} servings
              </span>
              <span className="text-gray-400 text-sm">
                by {recipe.author.displayName || recipe.author.username}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-orange-500 transition-all group">
      <div className="relative">
        {/* Image */}
        <div className="relative h-48 bg-gray-700">
          {recipe.imageUrl && recipe.imageUrl.startsWith('http') ? (
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Actions Menu - Only for owner */}
        {isOwner && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-12 bg-gray-700 rounded-lg shadow-lg py-2 z-10">
                  <Link
                    href={`/recipes/${recipe.id}/edit`}
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white whitespace-nowrap"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Edit Recipe
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleDelete();
                    }}
                    disabled={isDeleting}
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600 hover:text-red-300 disabled:opacity-50 whitespace-nowrap"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Recipe'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Difficulty Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded text-xs border ${getDifficultyColor(recipe.difficulty)}`}>
            {recipe.difficulty}
          </span>
        </div>

        {/* Privacy Indicator */}
        {!recipe.isPublic && (
          <div className="absolute bottom-2 left-2">
            <span className="px-2 py-1 bg-black/50 text-white rounded text-xs flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Private
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <Link href={`/recipes/${recipe.id}`} className="block group-hover:text-orange-400 transition-colors">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{recipe.title}</h3>
        </Link>

        {recipe.description && (
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {recipe.description}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {totalTime}m
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {recipe.servings}
            </span>
          </div>
        </div>

        {/* Author */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
            {recipe.author.image && recipe.author.image.startsWith('http') ? (
              <Image
                src={recipe.author.image}
                alt={recipe.author.displayName || recipe.author.username}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <span className="text-xs font-medium">
                {(recipe.author.displayName || recipe.author.username).charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <span className="text-sm text-gray-400 truncate">
            {recipe.author.displayName || recipe.author.username}
          </span>
        </div>

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {recipe.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                +{recipe.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}