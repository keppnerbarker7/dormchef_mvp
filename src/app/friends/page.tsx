'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';

interface Friend {
  id: string;
  username: string;
  displayName: string;
  email: string;
  image?: string;
  bio?: string;
  createdAt: string;
  _count: {
    recipes: number;
    mealPlans: number;
  };
}

interface FriendRequest {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  requester: {
    id: string;
    username: string;
    displayName: string;
    image?: string;
  };
  addressee: {
    id: string;
    username: string;
    displayName: string;
    image?: string;
  };
}

interface FeedItem {
  id: string;
  type: 'recipe' | 'meal_plan';
  title: string;
  description?: string;
  imageUrl?: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    image?: string;
  };
  createdAt: string;
  // Recipe specific
  prepTime?: number;
  cookTime?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  // Meal plan specific
  weekStart?: string;
}

export default function FriendsPage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<'feed' | 'friends' | 'requests'>('feed');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch friends list
  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends/list');
      if (!response.ok) throw new Error('Failed to fetch friends');
      const data = await response.json();
      setFriends(data.friends);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load friends');
    }
  };

  // Fetch friend requests
  const fetchFriendRequests = async () => {
    try {
      const response = await fetch('/api/friends?type=pending');
      if (!response.ok) throw new Error('Failed to fetch friend requests');
      const data = await response.json();
      setFriendRequests(data.requests);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  // Fetch friends feed - show recent recipes from all users for demo
  const fetchFeed = async () => {
    try {
      // For demo purposes, fetch recent public recipes from all users
      const response = await fetch('/api/recipes?limit=6&isPublic=true');
      if (!response.ok) {
        throw new Error('Failed to fetch recipes for feed');
      }

      const data = await response.json();
      const recipes = data.recipes || [];

      // Convert recipes to feed items
      const feedItems: FeedItem[] = recipes.map((recipe: any) => ({
        id: `recipe-${recipe.id}`,
        type: 'recipe' as const,
        title: recipe.title,
        description: recipe.description,
        imageUrl: recipe.imageUrl,
        author: {
          id: recipe.author.id,
          username: recipe.author.username,
          displayName: recipe.author.displayName,
          image: recipe.author.image,
        },
        createdAt: recipe.createdAt,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        difficulty: recipe.difficulty,
      }));

      setFeed(feedItems);
    } catch (err) {
      console.error('Error fetching feed:', err);
      setFeed([]);
    }
  };

  // Handle friend request response
  const handleFriendRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch(`/api/friends/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action === 'accept' ? 'accepted' : 'rejected' }),
      });

      if (!response.ok) throw new Error(`Failed to ${action} friend request`);

      // Refresh data
      await Promise.all([fetchFriendRequests(), fetchFriends()]);
    } catch (err) {
      console.error(`Error ${action}ing friend request:`, err);
      alert(`Failed to ${action} friend request. Please try again.`);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        await Promise.all([
          fetchFriends(),
          fetchFriendRequests(),
          fetchFeed(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
      loadData();
    }
  }, [user, isLoaded]);

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
          <p className="text-gray-600">Please sign in to view your friends.</p>
          <Link href="/sign-in" className="mt-4 inline-block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { key: 'feed', label: 'Feed', count: feed?.length || 0 },
              { key: 'friends', label: 'Friends', count: friends?.length || 0 },
              { key: 'requests', label: 'Requests', count: friendRequests?.length || 0 },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gray-400 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Feed Tab */}
        {activeTab === 'feed' && (
          <div>
            {loading ? (
              <div className="text-center py-8">Loading feed...</div>
            ) : (feed?.length || 0) === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No activity yet</h3>
                <p className="text-gray-600 mb-4">
                  Add some friends to see their cooking activity here!
                </p>
                <button
                  onClick={() => setActiveTab('friends')}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Find Friends
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {(feed || []).map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-start gap-4">
                      {/* Author Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                        {item.author.image && item.author.image.startsWith('http') ? (
                          <Image
                            src={item.author.image}
                            alt={item.author.displayName}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-700">
                            {item.author.displayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">
                            {item.author.displayName}
                          </span>
                          <span className="text-gray-500">
                            {item.type === 'recipe' ? 'shared a recipe' : 'created a meal plan'}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>

                        {item.description && (
                          <p className="text-gray-600 mb-3">{item.description}</p>
                        )}

                        {/* Recipe specific info */}
                        {item.type === 'recipe' && (
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              {(item.prepTime || 0) + (item.cookTime || 0)}m total
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              item.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                              item.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.difficulty}
                            </span>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center gap-3 mt-4">
                          <button className="text-gray-500 hover:text-orange-600 transition-colors text-sm">
                            👍 Like
                          </button>
                          <button className="text-gray-500 hover:text-orange-600 transition-colors text-sm">
                            💬 Comment
                          </button>
                          <button className="text-gray-500 hover:text-orange-600 transition-colors text-sm">
                            📤 Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div>
            {loading ? (
              <div className="text-center py-8">Loading friends...</div>
            ) : (friends?.length || 0) === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No friends yet</h3>
                <p className="text-gray-600 mb-4">
                  Start connecting with other DormChef users to see their recipes and meal plans!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(friends || []).map((friend) => (
                  <div key={friend.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                        {friend.image && friend.image.startsWith('http') ? (
                          <Image
                            src={friend.image}
                            alt={friend.displayName}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                        ) : (
                          <span className="text-lg font-medium text-gray-700">
                            {friend.displayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{friend.displayName}</h3>
                        <p className="text-gray-500 text-sm">@{friend.username}</p>
                      </div>
                    </div>

                    {friend.bio && (
                      <p className="text-gray-600 text-sm mb-4">{friend.bio}</p>
                    )}

                    <div className="flex justify-between text-sm text-gray-500 mb-4">
                      <span>{friend._count.recipes} recipes</span>
                      <span>{friend._count.mealPlans} meal plans</span>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/users/${friend.id}`}
                        className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                      >
                        View Profile
                      </Link>
                      <button className="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm">
                        Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div>
            {loading ? (
              <div className="text-center py-8">Loading requests...</div>
            ) : (friendRequests?.length || 0) === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📨</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending requests</h3>
                <p className="text-gray-600">
                  Friend requests will appear here when other users want to connect with you.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {(friendRequests || []).map((request) => (
                  <div key={request.id} className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                          {request.requester.image && request.requester.image.startsWith('http') ? (
                            <Image
                              src={request.requester.image}
                              alt={request.requester.displayName}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-700">
                              {request.requester.displayName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{request.requester.displayName}</h4>
                          <p className="text-gray-500 text-sm">@{request.requester.username}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFriendRequest(request.id, 'accept')}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleFriendRequest(request.id, 'reject')}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors text-sm"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}