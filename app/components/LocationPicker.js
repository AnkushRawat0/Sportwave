'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useStore } from "@/zustand/store";

export default function LocationPicker() {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState(null);
  const [mounted, setMounted] = useState(false);
  const { location, pinCode, setLocation, setPinCode, setLat, setLng } = useStore();

  useEffect(() => {
    setMounted(true);
    // Try to get user's current location
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setPosition(coords);
          fetchAddress(coords);
        },
        (error) => {
          // If geolocation fails, default to a central location
          console.warn('Geolocation failed:', error);
          const defaultCoords = { lat: 20.5937, lng: 78.9629 }; // Center of India
          setPosition(defaultCoords);
          fetchAddress(defaultCoords);
        }
      );
    } else {
      // Fallback for browsers without geolocation support
      const defaultCoords = { lat: 20.5937, lng: 78.9629 };
      setPosition(defaultCoords);
      fetchAddress(defaultCoords);
    }
  }, []);

  const fetchAddress = async ({ lat, lng }) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      setAddress(data);
      const Location = `${data.address.county || data.address.city || 'Location'}, ${data.address.country}`;
      const PinCode = data.address.postcode || '';
      const lat1 = data.boundingbox[0];
      const lng1 = data.boundingbox[2];
      setLocation(Location);
      setPinCode(PinCode);
      setLat(lat1);
      setLng(lng1);
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const DraggableMarker = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        fetchAddress(e.latlng);
      },
    });

    return position ? (
      <Marker
        draggable={true}
        position={position}
        eventHandlers={{
          dragend: (e) => {
            const newPos = e.target.getLatLng();
            setPosition(newPos);
            fetchAddress(newPos);
          },
        }}
        icon={L.icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })}
      />
    ) : null;
  };

  // Don't render map until component is mounted (prevents SSR mismatch)
  if (!mounted || !position) {
    return (
      <div className="w-full h-[500px] mt-5 bg-gray-100 rounded-2xl flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] mt-5">
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={true}
        className="w-full h-full rounded-lg z-10"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        />
        <DraggableMarker />
      </MapContainer>
    </div>
  );
}
