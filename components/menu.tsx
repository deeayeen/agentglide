import { Button } from "@/components/ui/button";
import { CircleArrowRightIcon, XIcon } from "lucide-react";
import clsx from "clsx";
import Form from "./form";
import Image from "next/image";

export default function Menu({
  menuOpen,
  setMenuOpen,
  onPlanTrip,
}: {
  menuOpen: boolean;
  setMenuOpen: (menuOpen: boolean) => void;
  onPlanTrip: any;
}) {
  const handleButtonClick = () => {
    setMenuOpen(true);
  };

  const handleClose = () => {
    setMenuOpen(false);
  };

  return (
    <div
      className={clsx(
        "fixed flex justify-center w-screen transition-all duration-500 ease-in-out",
        {
          "bottom-0": !menuOpen,
          "bottom-1/2 transform translate-y-1/2 items-center": menuOpen,
        }
      )}
    >
      <div
        className={clsx(
          "bg-white bg-opacity-20 backdrop-blur-lg px-6 py-4 relative w-[35rem]",
          "transition-all duration-500 ease-in-out overflow-hidden",
          {
            "rounded-t-lg": !menuOpen,
            "rounded-lg": menuOpen,
          }
        )}
      >
        {!menuOpen && (
          <div className="text-xl sm:text-3xl font-black select-none text-center text-shadow-lg">
            photo-realistic 3D AI travel agent
          </div>
        )}
        <div
          className={clsx(
            "w-full transition-all duration-500 ease-in-out overflow-hidden",
            {
              "h-[25rem] opacity-100": menuOpen,
              "h-0 opacity-0": !menuOpen,
            }
          )}
        >
          <Form onPlanTrip={onPlanTrip} menuOpen={menuOpen} />
        </div>
        {!menuOpen && (
          <Button
            className={clsx(
              "mt-3 w-full bg-white text-black hover:bg-gray-200 font-bold text-lg select-none transition-opacity duration-500 ease-in-out"
            )}
            onClick={handleButtonClick}
          >
            where would you like to travel?
            <CircleArrowRightIcon className="w-5 h-5 ml-2" />
          </Button>
        )}
        {menuOpen && (
          <Button
            className={clsx(
              "absolute top-3 right-3 bg-white text-black hover:bg-gray-200 font-bold text-lg select-none transition-opacity duration-500 ease-in-out"
            )}
            onClick={handleClose}
          >
            <XIcon className="w-5 h-5 rounded-full" />
          </Button>
        )}
      </div>

      {/* Penguin Image with Fade-Up Animation */}
      <div
        className={clsx(
          "absolute top-[-46px] left-[50%] transform -translate-x-1/2 transition-all",
          {
            "opacity-0 translate-y-5 duration-0": !menuOpen, // Immediate hide when menu closes
            "opacity-100 translate-y-0 duration-200 delay-400": menuOpen, // Fade up with delay when menu opens
          }
        )}
      >
        <div className="bg-white bg-opacity-30 backdrop-blur-md rounded-full p-4 flex items-center justify-center">
          <Image
            src="/agentglide.png"
            alt="agentglide"
            width={60}
            height={60}
            className="rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
