//import Image from "next/image";
import { ResizableWrapper } from "@/components/ResizableWrapper";
import PollutionMap from "@/components/PollutionMap";

export default function Home() {
  return (
    <div className="flex flex-col h-screen w-screen">
      <header className="p-4 bg-blue-700 text-white">
        <h1 className="text-2xl font-bold">
          Pollution de l&apos;Eau Potable en France
        </h1>
      </header>

      <main className="relative flex-1 w-full">
        <ResizableWrapper>
          <PollutionMap />
        </ResizableWrapper>
      </main>
    </div>
  );
}
