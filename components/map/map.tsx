import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Map3D, Map3DCameraProps } from "./map-3d";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const LOADING_ALTITUDE = 20000000;

const LOADING_VIEW_PROPS = {
  center: { lat: 0, lng: 0, altitude: LOADING_ALTITUDE }, // Very high altitude to view the Earth
  range: LOADING_ALTITUDE, // Large range to make the Earth visible
  tilt: 0,
  heading: 0,
  roll: 0,
};

const coordinates = [
  { lat: 40.748817, lng: -73.985428, name: "Empire State Building" },
  { lat: 40.689247, lng: -74.044502, name: "Statue of Liberty" },
  { lat: 40.706086, lng: -73.996864, name: "Brooklyn Bridge" },
  { lat: 40.758896, lng: -73.98513, name: "Times Square" },
  { lat: 40.761432, lng: -73.977621, name: "Central Park" },
  { lat: 37.774929, lng: -122.419416, name: "San Francisco City Hall" },
  { lat: 37.807999, lng: -122.417743, name: "Fisherman's Wharf" },
  { lat: 37.819929, lng: -122.478255, name: "Golden Gate Bridge" },
  { lat: 37.802139, lng: -122.448344, name: "Palace of Fine Arts" },
  { lat: 37.769421, lng: -122.486214, name: "Golden Gate Park" },
];

export default function Map({
  loading,
  trip,
}: {
  loading: boolean;
  trip: any;
}) {
  const nonAlphaVersionLoaded = Boolean(
    globalThis &&
      globalThis.google?.maps?.version &&
      !globalThis.google?.maps?.version.endsWith("-alpha")
  );

  if (nonAlphaVersionLoaded) {
    location.reload();
    return null; // Return null to prevent rendering issues
  }

  const [mapLoaded, setMapLoaded] = useState(false);

  const handleCameraChange = useCallback((props: Map3DCameraProps) => {
    setViewProps((oldProps) => ({ ...oldProps, ...props }));
  }, []);

  const map3dRef = useRef<google.maps.maps3d.Map3DElement | null>(null);

  const randomStartIndex = useMemo(
    () => Math.floor(Math.random() * coordinates.length),
    []
  );
  const startingCoordinate = coordinates[randomStartIndex];

  const INITIAL_VIEW_PROPS = loading
    ? LOADING_VIEW_PROPS
    : {
        center: {
          lat: startingCoordinate.lat,
          lng: startingCoordinate.lng,
          altitude: 0,
        },
        range: 1500,
        tilt: 55,
        heading: 0,
        roll: 0,
      };

  const [viewProps, setViewProps] = useState(INITIAL_VIEW_PROPS);

  useEffect(() => {
    if (mapLoaded && map3dRef.current && globalThis.google) {
      const map3dElement = map3dRef.current;
      let isCancelled = false;

      (async () => {
        try {
          //@ts-ignore
          const { Marker3DElement } =
            await globalThis.google.maps.importLibrary("maps3d");

          //@ts-ignore
          let currentMarker: google.maps.Marker3DElement | null = null;

          const flyCameraAroundAsync = (options: any) => {
            return new Promise<void>((resolve) => {
              const onAnimationEnd = () => {
                map3dElement.removeEventListener(
                  "gmp-animationend",
                  onAnimationEnd
                );
                resolve();
              };
              map3dElement.addEventListener("gmp-animationend", onAnimationEnd);
              //@ts-ignore
              map3dElement.flyCameraAround(options);
            });
          };

          const flyCameraToAsync = (options: any) => {
            return new Promise<void>((resolve) => {
              const onAnimationEnd = () => {
                map3dElement.removeEventListener(
                  "gmp-animationend",
                  onAnimationEnd
                );
                resolve();
              };
              map3dElement.addEventListener("gmp-animationend", onAnimationEnd);
              //@ts-ignore
              map3dElement.flyCameraTo(options);
            });
          };

          // Extract trip coordinates if trip is provided
          const tripCoordinates = trip
            ? trip.map((dest: any) => ({
                lat: dest.destinationCoordinatesLatitude,
                lng: dest.destinationCoordinatesLongitude,
                name: dest.destinationName,
              }))
            : [];

          const isUsingTrip = trip && tripCoordinates.length > 0;
          const coordinatesToUse = isUsingTrip ? tripCoordinates : coordinates;
          const startIndex = isUsingTrip ? 0 : randomStartIndex;

          const animateLoop = async (startIndex: number) => {
            let index = startIndex % coordinatesToUse.length;
            let hasFlownToFirstTripDestination = false;

            while (!isCancelled) {
              if (loading) {
                // Fly to the starting location before rotating
                await flyCameraToAsync({
                  endCamera: {
                    center: { lat: 0, lng: 0, altitude: LOADING_ALTITUDE },
                    tilt: 0,
                    range: LOADING_ALTITUDE,
                    heading: 0,
                    roll: 0,
                  },
                  durationMillis: 2000, // Adjust this to control the speed of the flight
                });

                // Rotate the view around the Earth while loading
                await flyCameraAroundAsync({
                  camera: {
                    center: { lat: 0, lng: 0, altitude: LOADING_ALTITUDE },
                    tilt: 0,
                    range: LOADING_ALTITUDE,
                    heading: 0,
                    roll: 0,
                  },
                  durationMillis: 60000, // Longer duration for a smooth rotation
                  rounds: 2,
                });
              } else {
                if (!hasFlownToFirstTripDestination && isUsingTrip) {
                  // Fly from loading view to the first trip destination
                  const firstCoord = coordinatesToUse[0];

                  await flyCameraToAsync({
                    endCamera: {
                      center: {
                        lat: firstCoord.lat,
                        lng: firstCoord.lng,
                        altitude: 0,
                      },
                      tilt: 55,
                      range: 1500,
                      heading: 0,
                      roll: 0,
                    },
                    durationMillis: 5000, // Adjust as needed
                  });

                  hasFlownToFirstTripDestination = true;
                }

                const coord = coordinatesToUse[index];

                if (isUsingTrip) {
                  // Remove previous marker if any
                  if (currentMarker) {
                    map3dElement.removeChild(currentMarker);
                    currentMarker = null;
                  }

                  // Create new marker with label
                  const marker = new Marker3DElement({
                    position: { lat: coord.lat, lng: coord.lng },
                    label: coord.name,
                  });

                  map3dElement.appendChild(marker);
                  currentMarker = marker;
                }

                // Rotate around the current point
                await flyCameraAroundAsync({
                  camera: {
                    center: { lat: coord.lat, lng: coord.lng, altitude: 0 },
                    tilt: 55,
                    range: 1500,
                    heading: 0,
                    roll: 0,
                  },
                  durationMillis: 10000, // 10 seconds
                  rounds: 0.5,
                });

                if (isCancelled) break;

                if (isUsingTrip && currentMarker) {
                  // Remove marker at current coordinate
                  map3dElement.removeChild(currentMarker);
                  currentMarker = null;
                }

                // Move to the next index
                index = (index + 1) % coordinatesToUse.length;
                const nextCoord = coordinatesToUse[index];

                // Fly to the next point with doubled duration if using trip
                await flyCameraToAsync({
                  endCamera: {
                    center: {
                      lat: nextCoord.lat,
                      lng: nextCoord.lng,
                      altitude: 0,
                    },
                    tilt: 55,
                    range: 1500,
                    heading: 0,
                    roll: 0,
                  },
                  durationMillis: isUsingTrip ? 7000 : 5000, // Double duration if using trip
                });
              }
            }
          };

          animateLoop(startIndex);
        } catch (error) {
          console.error("Error during map animation:", error);
        }

        return () => {
          isCancelled = true;
        };
      })();
    }
  }, [mapLoaded, loading, trip, randomStartIndex, map3dRef.current]);

  return (
    <APIProvider apiKey={API_KEY} version={"alpha"}>
      <div style={{ width: "100vw", height: "100vh" }}>
        <Map3D
          ref={map3dRef}
          {...viewProps}
          onCameraChange={handleCameraChange}
          defaultLabelsDisabled
          onLoad={() => setMapLoaded(true)}
        />
      </div>
    </APIProvider>
  );
}
