import { useCallback, useState, useRef, useEffect, useMemo } from "react";

import { APIProvider } from "@vis.gl/react-google-maps";

import { Map3D, Map3DCameraProps } from "./map-3d";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const INITIAL_VIEW_PROPS = {
  center: { lat: 40.748817, lng: -73.985428, altitude: 0 },
  range: 1500,
  tilt: 55,
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

export default function Map() {
  const nonAlphaVersionLoaded = Boolean(
    globalThis &&
      globalThis.google?.maps?.version &&
      !globalThis.google?.maps?.version.endsWith("-alpha")
  );

  if (nonAlphaVersionLoaded) {
    location.reload();
    return;
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

  // Set INITIAL_VIEW_PROPS based on the starting coordinate
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
    if (mapLoaded && map3dRef.current) {
      const map3dElement = map3dRef.current;

      let isCancelled = false;

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

      const animateLoop = async (startIndex: number) => {
        let index = startIndex;

        while (!isCancelled) {
          const coord = coordinates[index];

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

          if (isCancelled) break;

          // Move to next index
          index = (index + 1) % coordinates.length;
          const nextCoord = coordinates[index];

          // Fly to the next point
          await flyCameraToAsync({
            endCamera: {
              center: { lat: nextCoord.lat, lng: nextCoord.lng, altitude: 0 },
              tilt: 55,
              range: 1500,
              heading: 0,
              roll: 0,
            },
            durationMillis: 5000,
          });
        }
      };

      animateLoop(randomStartIndex);

      return () => {
        isCancelled = true;
      };
    }
  }, [map3dRef.current, mapLoaded]);
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
