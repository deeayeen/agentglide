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

  return (
    <div className="trip-info fixed bottom-0 left-0 right-0 bg-white bg-opacity-70 backdrop-blur-lg p-4">
      <h2 className="text-2xl font-bold">{destination.destinationName}</h2>
      <p className="mt-2">{destination.destinationDescription}</p>
      <div className="mt-4 flex justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentDestinationIndex === 0}
        >
          Previous
        </Button>
        {currentDestinationIndex < trip.length - 1 ? (
          <Button onClick={handleNext}>Next</Button>
        ) : (
          <Button onClick={resetTrip}>New Trip</Button>
        )}
      </div>
    </div>
  );
}
