import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { CircleArrowRightIcon } from "lucide-react";

const activities = [
  {
    name: "Sightseeing & Landmarks",
    emoji: "🏰",
  },
  {
    name: "Cultural Experiences",
    emoji: "🎭",
  },
  {
    name: "Art & Museums",
    emoji: "🖼️",
  },
  {
    name: "Nightlife & Entertainment",
    emoji: "🎶",
  },
  {
    name: "Food & Culinary Tours",
    emoji: "🍽️",
  },
  {
    name: "Shopping & Markets",
    emoji: "🛍️",
  },
  {
    name: "Relaxation & Wellness",
    emoji: "🧘‍♀️",
  },
  {
    name: "Outdoor Adventures",
    emoji: "🚵‍♂️",
  },
];

export default function Form({
  onPlanTrip,
  menuOpen,
}: {
  onPlanTrip: any;
  menuOpen: boolean;
}) {
  const [destination, setDestination] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<any>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const onActivityClick = (activity: any) => {
    if (selectedActivities.includes(activity)) {
      setSelectedActivities(
        selectedActivities.filter((a: any) => a !== activity)
      );
    } else {
      setSelectedActivities([...selectedActivities, activity]);
    }
  };

  useEffect(() => {
    setDestination("");
    setSelectedActivities([]);
    if (menuOpen && inputRef.current) {
      inputRef.current.focus(); // Focus on the input when the menu is opened
    }
  }, [menuOpen]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full">
        <div className="font-bold mb-2 mt-10">
          where would you like to travel?
        </div>
        <Input
          ref={inputRef}
          className="w-full font-bold"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <div className="font-bold mt-4 mb-2">
          what activities are you interested in?
        </div>
        <div className="flex flex-wrap">
          {activities.map((activity) => (
            <Button
              key={activity.name}
              className={clsx(
                "mr-2 mb-2 text-white hover:bg-gray-200 font-bold text-lg select-none transition-opacity duration-500 ease-in-out h-9",
                {
                  "bg-white": selectedActivities.includes(activity),
                  "text-black": selectedActivities.includes(activity),
                }
              )}
              variant="outline"
              onClick={() => onActivityClick(activity)}
            >
              <div className="font-bold text-sm">
                {activity.emoji} {activity.name.toLowerCase()}
              </div>
            </Button>
          ))}
        </div>
        <Button
          className="w-full mt-3 bg-white text-black hover:bg-gray-200 font-bold text-sm select-none transition-opacity duration-500 ease-in-out"
          onClick={() =>
            onPlanTrip({ destination, activities: selectedActivities })
          }
        >
          show me around
          <CircleArrowRightIcon className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}