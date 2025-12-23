'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import api from '@/api';
import Spinner from '@/app/components/Spinner';

export default function UserProfile() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await api.get(`/api/utils/viewUsersById?userId=${userId}`);
      return response.data.user;
    },
    enabled: !!userId,
  });

  if (!userId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">User ID is required</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">Error loading user: {error.message}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
          
          <div className="px-8 pb-8">
            <div className="flex flex-col items-center -mt-16">
              <img
                src={user.profile_image || '/default-avatar.png'}
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
              
              <h1 className="text-3xl font-bold mt-4 text-gray-800">{user.name}</h1>
              <p className="text-gray-600 mt-1">{user.email}</p>
            </div>
            
            <div className="mt-8 space-y-4">
              {user.phone && (
                <div className="flex items-center space-x-3">
                  <div className="text-blue-600 text-xl">📱</div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-800 font-medium">{user.phone}</p>
                  </div>
                </div>
              )}
              
              {user.location && (
                <div className="flex items-center space-x-3">
                  <div className="text-blue-600 text-xl">📍</div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-gray-800 font-medium">{user.location}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <div className="text-blue-600 text-xl">📅</div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="text-gray-800 font-medium">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-gray-600">
                {user.bio || 'This player hasn\'t added a bio yet.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
