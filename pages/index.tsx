import { useState } from "react";
import Header from "@/components/header";
import Map from "@/components/map/map";
import Menu from "@/components/menu";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

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
  };

  return (
    <>
      <Map loading={loading} trip={trip} />
      <Header menuOpen={menuOpen} />
      <Menu
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onPlanTrip={onPlanTrip}
      />
    </>
  );
}
