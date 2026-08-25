"use client";

import { X } from "lucide-react";
import PollutionMapCategorySelector from "./PollutionMapCategorySelector";
import PollutionMapLegend from "./PollutionMapLegend";
import { getStatistic, getStatisticValue } from "@/lib/stats";
import type { PollutionStats } from "@/app/lib/data";

type PollutionMapControlsPanelProps = {
  period: string;
  setPeriod: (period: string) => void;
  category: string;
  setCategory: (category: string) => void;
  pollutionStats: PollutionStats;
  colorblindMode: boolean;
  setColorblindMode: (value: boolean) => void;
  displayMode: "communes" | "udis";
  onClose?: () => void;
};

export default function PollutionMapControlsPanel({
  period,
  setPeriod,
  category,
  setCategory,
  pollutionStats,
  colorblindMode,
  setColorblindMode,
  displayMode,
  onClose,
}: PollutionMapControlsPanelProps) {
  const totalUdis = getStatistic(pollutionStats, "total_udis");
  const lastUpdateValue = getStatisticValue(
    pollutionStats,
    "derniere_mise_a_jour",
  );
  const lastUpdateDate = lastUpdateValue
    ? new Date(lastUpdateValue).toLocaleDateString("fr-FR")
    : null;

  return (
    <div className="h-full flex flex-col relative">
      <button
        className="absolute top-5 right-5 text-black bg-white rounded-full p-2 shadow-md hover:text-gray-800 hover:bg-gray-100 transition duration-300 z-10"
        onClick={() => onClose?.()}
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="text-black p-4 pr-16">
        <div className="text-xs font-thin">CARTE DE LA POLLUTION DE L&apos;EAU</div>
        <div className="text-2xl">Paramètres</div>
      </div>

      <div className="bg-white p-4 py-8 flex flex-col gap-8 rounded-t-lg flex-1 overflow-y-auto">
        <PollutionMapCategorySelector
          period={period}
          setPeriod={setPeriod}
          category={category}
          setCategory={setCategory}
        />

        <div className="border-t border-gray-200 pt-6">
          <PollutionMapLegend
            variant="full"
            period={period}
            category={category}
            pollutionStats={pollutionStats}
            colorblindMode={colorblindMode}
            setColorblindMode={setColorblindMode}
            displayMode={displayMode}
          />
        </div>

        {(totalUdis !== null || lastUpdateDate) && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              À propos des données
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {totalUdis !== null && (
                <div className="rounded-xl border border-gray-200 p-3">
                  <div className="text-xl font-semibold text-gray-900">
                    {totalUdis.toLocaleString("fr-FR")}
                  </div>
                  <div className="text-xs text-gray-500">
                    {displayMode === "communes"
                      ? "communes suivies"
                      : "réseaux de distribution (UDI) suivis"}
                  </div>
                </div>
              )}
              {lastUpdateDate && (
                <div className="rounded-xl border border-gray-200 p-3">
                  <div className="text-xl font-semibold text-gray-900">
                    {lastUpdateDate}
                  </div>
                  <div className="text-xs text-gray-500">
                    dernière analyse disponible
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
