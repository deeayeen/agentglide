// index.tsx
import { useState } from "react";
import Header from "@/components/header";
import Map from "@/components/map/map";
import Menu from "@/components/menu";
import Trip from "@/components/trip";
import Loading from "@/components/loading";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentDestinationIndex, setCurrentDestinationIndex] = useState(0);

  console.log(trip);

  const onPlanTrip = async ({ destination, activities }: any) => {
    setLoading(true);
    setMenuOpen(false);
    const response = await fetch("/api/planTrip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ destination, activities }),
    });
    const data = await response.json();
    setTrip(data);
    setLoading(false);
    setCurrentDestinationIndex(0);
  };

  const resetTrip = () => {
    setTrip(null);
    setCurrentDestinationIndex(0);
  };

  return (
    <>
      <Map
        loading={loading}
        trip={trip}
        currentDestinationIndex={currentDestinationIndex}
      />
      <Header menuOpen={menuOpen} />
      {loading ? (
        <Loading />
      ) : !trip ? (
        <Menu
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          onPlanTrip={onPlanTrip}
        />
      ) : (
        <Trip
          trip={trip}
          currentDestinationIndex={currentDestinationIndex}
          setCurrentDestinationIndex={setCurrentDestinationIndex}
          resetTrip={resetTrip}
        />
      )}
    </>
  );
}
