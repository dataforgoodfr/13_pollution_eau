//import Image from "next/image";
import { ResizableWrapper } from "@/components/ResizableWrapper";
import PollutionMap from "@/components/PollutionMap";
import { fetchPollutionStats } from "./lib/data";

// Mise en cache de la page pour 24 heures
export const revalidate = 86400;

export default async function Home() {
  const stats = await fetchPollutionStats();

  return (
    <div className="flex flex-col h-screen w-screen">
      <header className="p-4 bg-blue-700 text-white">
        <h1 className="text-2xl font-bold">
          Pollution de l&apos;Eau Potable en France
        </h1>
      </header>

      <main className="relative flex-1 w-full">
        <ResizableWrapper>
          <PollutionMap pollutionStats={stats} />
        </ResizableWrapper>
      </main>
    </div>
  );
}
