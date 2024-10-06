import Map from "@/components/map-3d/map";
import { Button } from "@/components/ui/button";
import { CircleArrowRightIcon } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative">
      <Map />
      <div className="fixed top-0 left-0 flex justify-center w-screen">
        <div className="flex items-center bg-white bg-opacity-20 backdrop-blur-lg rounded-b-lg px-4 py-2">
          <Image
            src={"/agentglide.png"}
            alt="agentglide"
            width={30}
            height={30}
            className="mr-2"
          />
          <div className="text-xl font-black select-none">agentglide</div>
        </div>
      </div>
      <div className="fixed bottom-0 bottom-0 flex justify-center w-screen">
        <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-t-lg px-6 py-4">
          <div className="text-3xl font-black select-none">
            photo-realistic 3D AI travel agent
          </div>
          <Button className="mt-3 w-full bg-white text-black hover:bg-gray-200 hover:text-black font-bold text-lg">
            where would you like to travel?{" "}
            <CircleArrowRightIcon className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
