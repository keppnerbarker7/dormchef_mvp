'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ProfileFormData {
  displayName: string;
  school: string;
  dietaryRestrictions: string[];
  bio: string;
  image: string;
}

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-free',
  'Dairy-free',
  'Nut-free',
  'Keto',
  'Paleo',
  'Halal',
  'Kosher',
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: '',
    school: '',
    dietaryRestrictions: [],
    bio: '',
    image: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const profile = await response.json();
        setFormData({
          displayName: profile.displayName || '',
          school: profile.school || '',
          dietaryRestrictions: profile.dietaryRestrictions || [],
          bio: profile.bio || '',
          image: profile.image || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('Profile updated successfully!');
        setMessageType('success');
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to update profile');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred while updating your profile');
      setMessageType('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDietaryChange = (option: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(option)
        ? prev.dietaryRestrictions.filter(item => item !== option)
        : [...prev.dietaryRestrictions, option]
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/profile-picture', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, image: data.imageUrl }));
        setMessage('Profile picture updated successfully!');
        setMessageType('success');
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to upload image');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred while uploading your image');
      setMessageType('error');
    } finally {
      setIsUploading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
            </div>
            <span className="text-sm text-gray-500">{session.user.email}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
            <p className="text-sm text-gray-600 mt-1">
              Update your personal information and cooking preferences
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {message && (
              <div className={`p-4 rounded-md ${
                messageType === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {message}
              </div>
            )}

            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Profile Picture
              </label>
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Profile"
                      className="h-20 w-20 rounded-full object-cover border-2 border-gray-300"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">No Image</span>
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="hidden"
                    id="profile-picture-upload"
                  />
                  <label
                    htmlFor="profile-picture-upload"
                    className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300
                             rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50
                             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                             ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isUploading ? 'Uploading...' : 'Change Picture'}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG up to 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                required
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-blue-500"
                placeholder="How should others see your name?"
              />
            </div>

            {/* School */}
            <div>
              <label htmlFor="school" className="block text-sm font-medium text-gray-700">
                School/University
              </label>
              <input
                type="text"
                id="school"
                value={formData.school}
                onChange={(e) => setFormData(prev => ({ ...prev, school: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-blue-500"
                placeholder="Your school or university"
              />
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                id="bio"
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-blue-500"
                placeholder="Tell others about your cooking journey..."
                maxLength={300}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.bio.length}/300 characters
              </p>
            </div>

            {/* Dietary Restrictions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Dietary Preferences & Restrictions
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {DIETARY_OPTIONS.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.dietaryRestrictions.includes(option)}
                      onChange={() => handleDietaryChange(option)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}