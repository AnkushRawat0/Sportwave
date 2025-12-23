'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/api';
import Spinner from '@/app/components/Spinner';

export default function FindPlayer() {
  const router = useRouter();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const response = await api.get('/api/utils/viewAllUsers');
      return response.data.users || [];
    },
  });

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
        <p className="text-red-500">Error loading players: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Find Players</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users && users.length > 0 ? (
          users.map((user) => (
            <div
              key={user._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => router.push(`/services/findplayer/id?userId=${user._id}`)}
            >
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={user.profile_image || '/default-avatar.png'}
                    alt={user.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {user.name}
                    </h2>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>
                
                {user.phone && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Phone:</span> {user.phone}
                    </p>
                  </div>
                )}
                
                {user.location && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Location:</span> {user.location}
                    </p>
                  </div>
                )}
                
                <div className="mt-4">
                  <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No players found</p>
          </div>
        )}
      </div>
    </div>
  );
}
