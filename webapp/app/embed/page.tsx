import { MapExplorer } from "@/components/MapExplorer";

export default function Embed() {
  return (
    <div className="flex flex-col min-h-screen w-screen h-screen">
      <main className="flex-1 w-full h-full">
        <MapExplorer />
      </main>
    </div>
  );
}
