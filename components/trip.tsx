// trip.tsx
import React from "react";
import { Button } from "@/components/ui/button";

export default function Trip({
  trip,
  currentDestinationIndex,
  setCurrentDestinationIndex,
  resetTrip,
}: {
  trip: any;
  currentDestinationIndex: number;
  setCurrentDestinationIndex: (index: number) => void;
  resetTrip: () => void;
}) {
  if (!trip || trip.length === 0) {
    return null;
  }

  const destination = trip[currentDestinationIndex];

  const handleNext = () => {
    if (currentDestinationIndex < trip.length - 1) {
      setCurrentDestinationIndex(currentDestinationIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentDestinationIndex > 0) {
      setCurrentDestinationIndex(currentDestinationIndex - 1);
    }
  };

  // Get photo URL if available
  const photoUrl =
    destination.photos && destination.photos.length > 0
      ? getPhotoUrl(destination.photos[0].photo_reference)
      : null;

  return (
    <div className="trip-info fixed bottom-0 left-0 w-full flex justify-center">
      <div className="bg-white bg-opacity-30 backdrop-blur-lg p-4 rounded-t-lg">
        <div className="flex">
          <div className="max-w-md">
            <div className="text-3xl font-black">
              {destination.destinationName}
            </div>
            <div className="mt-2 text-sm font-bold">
              {destination.destinationDescription}
            </div>
          </div>
          {photoUrl && (
            <img
              src={photoUrl}
              alt={destination.destinationName}
              className="ml-8 h-40"
            />
          )}
        </div>
        {/* Add more fields as needed */}
        <div className="absolute flex justify-between top-[-50px] left-0 w-full">
          {currentDestinationIndex !== 0 ? (
            <Button
              onClick={handlePrevious}
              className="bg-white text-black hover:bg-gray-200 font-bold select-none"
            >
              previous
            </Button>
          ) : (
            <div />
          )}
          {currentDestinationIndex < trip.length - 1 ? (
            <Button
              onClick={handleNext}
              className="bg-white text-black hover:bg-gray-200 font-bold select-none"
            >
              next
            </Button>
          ) : (
            <Button
              onClick={resetTrip}
              className="bg-white text-black hover:bg-gray-200 font-bold select-none"
            >
              new trip
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Function to get photo URL
function getPhotoUrl(photoReference: string, maxWidth: number = 400) {
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
}
