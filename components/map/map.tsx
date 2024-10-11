// map.tsx
import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Map3D, Map3DCameraProps } from "./map-3d";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const LOADING_ALTITUDE = 20000000;

const LOADING_VIEW_PROPS = {
  center: { lat: 0, lng: 0, altitude: LOADING_ALTITUDE },
  range: LOADING_ALTITUDE,
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
  currentDestinationIndex,
}: {
  loading: boolean;
  trip: any;
  currentDestinationIndex: number;
}) {
  const nonAlphaVersionLoaded = Boolean(
    globalThis &&
      globalThis.google?.maps?.version &&
      !globalThis.google?.maps?.version.endsWith("-alpha")
  );

  if (nonAlphaVersionLoaded) {
    location.reload();
    return null; // Prevent rendering issues
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

  const INITIAL_VIEW_PROPS = {
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
      let currentMarker: google.maps.maps3d.Marker3DElement | null = null;

      const runAnimation = async () => {
        try {
          // @ts-ignore
          const { Marker3DElement } =
            await globalThis.google.maps.importLibrary("maps3d");

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
              // @ts-ignore
              map3dElement.flyCameraTo(options);
            });
          };

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
              // @ts-ignore
              map3dElement.flyCameraAround(options);
            });
          };

          if (loading) {
            // Fly to loading view
            await flyCameraToAsync({
              endCamera: LOADING_VIEW_PROPS,
              durationMillis: 2000,
            });

            // Rotate around the Earth while loading
            await flyCameraAroundAsync({
              camera: LOADING_VIEW_PROPS,
              durationMillis: 60000,
              rounds: 2,
            });
          } else if (trip && trip.length > 0) {
            // Trip mode
            const destination = trip[currentDestinationIndex];

            // Remove previous marker if any
            if (currentMarker) {
              map3dElement.removeChild(currentMarker);
              currentMarker = null;
            }

            // Create new marker with label
            currentMarker = new Marker3DElement({
              position: {
                lat: destination.destinationCoordinatesLatitude,
                lng: destination.destinationCoordinatesLongitude,
              },
              label: destination.destinationName,
            });
            map3dElement.appendChild(currentMarker);

            // Fly to the current trip destination
            await flyCameraToAsync({
              endCamera: {
                center: {
                  lat: destination.destinationCoordinatesLatitude,
                  lng: destination.destinationCoordinatesLongitude,
                  altitude: 0,
                },
                tilt: 55,
                range: 1500,
                heading: 0,
                roll: 0,
              },
              durationMillis: 2000,
            });

            // Rotate around the current destination point
            await flyCameraAroundAsync({
              camera: {
                center: {
                  lat: destination.destinationCoordinatesLatitude,
                  lng: destination.destinationCoordinatesLongitude,
                  altitude: 0,
                },
                tilt: 55,
                range: 1500,
                heading: 0,
                roll: 0,
              },
              durationMillis: 80000,
              rounds: 4,
            });
          } else {
            // Default mode: loop through coordinates infinitely
            let index = randomStartIndex;
            while (!isCancelled) {
              const coord = coordinates[index];

              // Fly to the current coordinate
              await flyCameraToAsync({
                endCamera: {
                  center: {
                    lat: coord.lat,
                    lng: coord.lng,
                    altitude: 0,
                  },
                  tilt: 55,
                  range: 1500,
                  heading: 0,
                  roll: 0,
                },
                durationMillis: 2000,
              });

              // Rotate around the current point
              await flyCameraAroundAsync({
                camera: {
                  center: { lat: coord.lat, lng: coord.lng, altitude: 0 },
                  tilt: 55,
                  range: 1500,
                  heading: 0,
                  roll: 0,
                },
                durationMillis: 10000,
                rounds: 0.5,
              });

              if (isCancelled || (trip && trip.length > 0)) break; // Break if trip starts

              // Move to the next index
              index = (index + 1) % coordinates.length;
            }
          }
        } catch (error) {
          console.error("Error during map animation:", error);
        }
      };

      runAnimation();

      return () => {
        isCancelled = true;
        if (currentMarker) {
          map3dElement.removeChild(currentMarker);
          currentMarker = null;
        }
      };
    }
  }, [mapLoaded, loading, trip, currentDestinationIndex, map3dRef.current]);

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
