import PollutionMap from "@/components/PollutionMap";
import { fetchPollutionStats } from "../lib/data";

// Mise en cache de la page pour 24 heures
export const revalidate = 86400;

export default async function Embed() {
  const stats = await fetchPollutionStats();

  return (
    <div className="flex flex-col min-h-screen w-screen h-screen">
      <main className="flex-1 w-full h-full">
        <PollutionMap pollutionStats={stats} />
      </main>
    </div>
  );
}
