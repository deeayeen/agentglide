import Map from "@/components/map-3d/map";
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
    </div>
  );
}
