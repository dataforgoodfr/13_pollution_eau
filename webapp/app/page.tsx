//import Image from "next/image";
import PollutionMap from "@/components/PollutionMap";

export default function Home() {
  return (
    <>
      <header className="p-4 bg-blue-700 text-white">
        <h1 className="text-2xl font-bold">
          Pollution de l&apos;Eau Potable en France
        </h1>
      </header>

      <main className="flex flex-col h-full w-full">
        <PollutionMap />
      </main>
    </>
  );
}
