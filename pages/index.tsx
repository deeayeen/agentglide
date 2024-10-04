import React, { useCallback, useState } from "react";

import { APIProvider, MapMouseEvent } from "@vis.gl/react-google-maps";
import Map from "@/components/map-3d/map";

export default function Home() {
  return (
    <div>
      <Map />
    </div>
  );
}
