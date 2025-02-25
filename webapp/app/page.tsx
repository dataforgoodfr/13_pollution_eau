//import Image from "next/image";
import { MapExplorer } from "@/components/MapExplorer";
import { ResizableWrapper } from "@/components/ResizableWrapper";

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
          <MapExplorer />
        </ResizableWrapper>
      </main>

      <footer className="p-4 bg-gray-100 text-center text-sm">
        <p>Données ouvertes sur la qualité de l&apos;eau en France</p>
      </footer>
    </div>
  );
}
