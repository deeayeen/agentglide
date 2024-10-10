import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CircleArrowRightIcon, XIcon } from "lucide-react";
import clsx from "clsx";
import { Input } from "@/components/ui/input";

export default function Menu() {
  const [menuOpen, setMenuOpen] = useState(false);

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
          <div className="text-xl sm:text-3xl font-black select-none text-center">
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
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-full">
              <div className="font-bold mb-2">
                where would you like to travel?
              </div>
              <Input className="w-full" />
              <div className="font-bold mt-8 mb-2">
                what activities are you interested in?
              </div>
              <Input className="w-full" />
            </div>
          </div>
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
        {/* Close Button */}
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
    </div>
  );
}
