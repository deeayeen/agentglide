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
  {
    name: "Mount Vesuvius and Pompeii",
    lat: 40.82238299999999,
    lng: 14.4289058,
    elevation: 1259.667358398438,
  },
  {
    name: "Dolomite Mountains",
    lat: 46.4102117,
    lng: 11.8440351,
    elevation: 2953.22607421875,
  },
  { lat: 40.758896, lng: -73.98513, name: "Times Square" },
  {
    lat: 37.819929,
    lng: -122.478255,
    name: "Golden Gate Bridge",
    elevation: 0,
  },
  {
    lat: 38.5753936,
    lng: -107.7415961,
    name: "Black Canyon Campgrounds",
    elevation: 1709.9677734375,
  },
  {
    lat: -25.3437797,
    lng: 131.0346514,
    name: "Uluru-Kata Tjuta National Park",
    elevation: 851.6676025390625,
  },
  {
    name: "Mount Fuji",
    lat: 35.3606255,
    lng: 138.7273634,
    elevation: 3729.94970703125,
  },
  {
    name: "Iceland's South Coast",
    lat: 64.2661426,
    lng: -18.8158138,
    elevation: 1200,
  },
  {
    name: "Annapurna Base Camp Trek",
    lat: 28.53041409999999,
    lng: 83.87806909999999,
    elevation: 4120.42333984375,
  },
  {
    name: "Mount Rainier National Park",
    lat: 46.8671484,
    lng: -121.6998559,
    elevation: 2213.164794921875,
  },
  {
    name: "London",
    lat: 51.5072178,
    lng: -0.1275862,
    elevation: 7.165058612823486,
  },
  {
    name: "Everest Base Camp",
    lat: 28.0022779,
    lng: 86.8528655,
    elevation: 5294.03955078125,
  },
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
    return null;
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
      //@ts-ignore
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

            // Use Places API coordinates if available
            let lat = destination.destinationCoordinatesLatitude;
            let lng = destination.destinationCoordinatesLongitude;

            if (
              destination.geometry &&
              destination.geometry.location &&
              destination.geometry.location.lat &&
              destination.geometry.location.lng
            ) {
              lat =
                typeof destination.geometry.location.lat === "function"
                  ? destination.geometry.location.lat()
                  : destination.geometry.location.lat;
              lng =
                typeof destination.geometry.location.lng === "function"
                  ? destination.geometry.location.lng()
                  : destination.geometry.location.lng;
            }

            // Use elevation as altitude if available
            const altitude = destination.elevation || 0;

            // Create new marker with label
            currentMarker = new Marker3DElement({
              position: {
                lat,
                lng,
              },
              label: destination.destinationName,
            });
            map3dElement.appendChild(currentMarker);

            // Fly to the current trip destination
            await flyCameraToAsync({
              endCamera: {
                center: {
                  lat,
                  lng,
                  altitude,
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
                  lat,
                  lng,
                  altitude,
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
                    altitude: coordinates[index].elevation || 0,
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
                  center: {
                    lat: coord.lat,
                    lng: coord.lng,
                    altitude: coordinates[index].elevation || 0,
                  },
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
