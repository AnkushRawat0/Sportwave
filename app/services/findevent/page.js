'use client'
import React from 'react'
import FilterSearchPage from '@/app/components/FilterSearchPage'
import AutoLocationButton from '@/app/components/Geolocation';
import { useStore } from '@/zustand/store';
import { useQuery } from "@tanstack/react-query";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const page = () => {

  const { lat, lng, setLat, setLng } = useStore()
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [searchResults1, setSearchResults] = React.useState('');
  const [sport, setSport] = React.useState('');
  const [radius, setRadius] = React.useState(50); // Default radius is 50 km
  const [sortType, setSortType] = React.useState('date'); // Default sort type is date
  const [localLat, setLocalLat] = React.useState(lat);
  const [localLng, setLocalLng] = React.useState(lng);

  // Set default location on mount if geolocation fails
  useEffect(() => {
    setMounted(true);
    if (!lat || !lng) {
      // Default to center of India if no location found
      setLocalLat(20.5937);
      setLocalLng(78.9629);
      setLat(20.5937);
      setLng(78.9629);
    } else {
      setLocalLat(lat);
      setLocalLng(lng);
    }
  }, [lat, lng, setLat, setLng]);

  const { data: searchResults, isError, error, isLoading } = useQuery({
    queryKey: ['searchEvents', localLat, localLng, searchResults1, sport, radius],
    queryFn: async () => {
      if (!localLat || !localLng) {
        throw new Error('Location not available');
      }
      const response = await fetch(`/api/utils/getevents?lat=${localLat}&lng=${localLng}&search=${searchResults1}&sport=${sport}&radius=${radius}`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      return response.json();
    },
    enabled: !!localLat && !!localLng && mounted, // Only run when location is available and mounted
  });

  const handleSearch = (searchValue) => {
    setSearchResults(searchValue);
  }

  const handleFilterSearch = (sportValue, radiusValue) => {
    setSport(sportValue);
    setRadius(radiusValue);
  }

  if (!mounted) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Search Bar */}
      <div>
        <FilterSearchPage onSearch={handleSearch} onFilter={handleFilterSearch} />
      </div>

      {/* Event Results Section */}
      <div className="pt-32 px-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
            <p className="text-gray-500 text-lg">Loading events...</p>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
            <div className="text-center">
              <p className="text-red-500 text-lg mb-4">Error loading events: {error?.message}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          </div>
        ) : searchResults?.events && searchResults.events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.events
              .filter(event => event._id)
              .map((event) => (
                <div
                  key={event._id}
                  className="bg-white p-5 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                  onClick={() => {
                    if (event?._id) {
                      router.push(`/services/findevent/${event._id}`);
                    }
                  }}
                >
                  {/* Event Image */}
                  <img
                    src={event.image_urls?.[0] || '/default-event.png'}
                    alt={event.name}
                    className="w-full h-52 object-cover rounded-xl mb-4 group-hover:scale-[1.02] transition-transform duration-300"
                  />

                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-800 mb-1 truncate">{event.name}</h2>

                  {/* Location */}
                  <p className="text-sm text-gray-600 mb-1">
                    📍 <span className="font-medium">{event.detailedLocation || event.location}</span>
                  </p>

                  {/* Sport */}
                  <p className="text-sm text-gray-600 mb-1">
                    🏅 <span className="font-medium">Sport:</span> {event.sport}
                  </p>

                  {/* Seats */}
                  {event?.NoOfSeats && (
                    <p className="text-sm text-gray-600">
                      🎟️ <span className="font-medium">Seats:</span> {event.NoOfSeats}
                    </p>
                  )}
                </div>

              ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
            <p className="text-gray-500 text-lg">No events found</p>
          </div>
        )}
      </div>
    </div>

  )
}

export default page