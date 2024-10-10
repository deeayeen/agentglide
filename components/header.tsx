import Image from "next/image";
import React from "react";

export default function Header() {
  return (
    <div className="fixed top-0 left-0 flex justify-center w-screen">
      <div className="flex items-center bg-white bg-opacity-20 backdrop-blur-lg rounded-b-lg px-4 py-2">
        <Image
          src={"/agentglide.png"}
          alt="agentglide"
          width={30}
          height={30}
          className="mr-2"
        />
        <div className="text-xl font-black select-none drop-shadow-2xl">
          agentglide
        </div>
      </div>
    </div>
  );
}
