import { useState, useEffect } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

export default function Loading() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div
      className={clsx(
        "fixed flex justify-center w-screen bottom-0 transition-transform duration-500 delay-2000 ease-in-out",
        {
          "transform translate-y-0 opacity-100": visible,
          "transform translate-y-20 opacity-0": !visible,
        }
      )}
    >
      <div
        className={clsx(
          "bg-white bg-opacity-20 backdrop-blur-lg px-6 py-4 relative rounded-t-lg",
          "transition-opacity duration-500 ease-in-out overflow-hidden",
          {
            "opacity-100": visible,
            "opacity-0": !visible,
          }
        )}
      >
        <div className="text-xl sm:text-2xl font-black select-none text-center text-shadow-lg flex items-center justify-center">
          <Loader2 className="animate-spin w-7 h-7" />
        </div>
      </div>
    </div>
  );
}
