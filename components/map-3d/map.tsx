import React, { useCallback, useState } from "react";

import { APIProvider, MapMouseEvent } from "@vis.gl/react-google-maps";

import { Map3D, Map3DCameraProps } from "./map-3d";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const INITIAL_VIEW_PROPS = {
  center: { lat: 37.72809, lng: -119.64473, altitude: 1300 },
  range: 5000,
  heading: 61,
  tilt: 69,
  roll: 0,
};

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

  const [viewProps, setViewProps] = useState(INITIAL_VIEW_PROPS);

  const handleCameraChange = useCallback((props: Map3DCameraProps) => {
    setViewProps((oldProps) => ({ ...oldProps, ...props }));
  }, []);

  const handleMapClick = useCallback((ev: MapMouseEvent) => {
    if (!ev.detail.latLng) return;

    const { lat, lng } = ev.detail.latLng;
    setViewProps((p) => ({ ...p, center: { lat, lng, altitude: 0 } }));
  }, []);

  return (
    <APIProvider apiKey={API_KEY} version={"alpha"}>
      <div style={{ width: "100vw", height: "100vh" }}>
        <Map3D
          {...viewProps}
          onCameraChange={handleCameraChange}
          defaultLabelsDisabled
        />
      </div>
    </APIProvider>
  );
}
