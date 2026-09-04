"use client";

import { X } from "lucide-react";
import PollutionMapCategorySelector from "./PollutionMapCategorySelector";
import PollutionMapLegend from "./PollutionMapLegend";
import DonutChart from "./DonutChart";
import { getStatistic, getStatisticValue } from "@/lib/stats";
import { getLegendItems } from "@/lib/legendStats";
import type { PollutionStats } from "@/app/lib/data";

const millionsFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 1,
});

// Formatte les grands nombres en français : au-delà d'un million on abrège en
// "M", en dessous on garde le nombre complet avec les espaces comme séparateurs
// de milliers
function formatPopulation(value: number): string {
  if (value >= 1_000_000) {
    return `${millionsFormatter.format(value / 1_000_000)} M`;
  }
  return value.toLocaleString("fr-FR");
}

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

  const legendItems = getLegendItems(
    period,
    category,
    pollutionStats,
    colorblindMode,
  );
  const udiSlices = legendItems
    .filter((item) => item.count !== null)
    .map((item) => ({
      label: item.label,
      color: item.color,
      value: item.count as number,
    }));
  const populationSlices = legendItems
    .filter((item) => item.population !== null)
    .map((item) => ({
      label: item.label,
      color: item.color,
      value: item.population as number,
    }));
  const totalUdisInChart = udiSlices.reduce(
    (sum, slice) => sum + slice.value,
    0,
  );
  const totalPopulation = populationSlices.reduce(
    (sum, slice) => sum + slice.value,
    0,
  );

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
        <div className="text-xs font-thin">
          CARTE DE LA POLLUTION DE L&apos;EAU
        </div>
        <div className="text-2xl">Réglages de la carte</div>
      </div>

      <div className="bg-white p-4 py-8 flex flex-col gap-8 rounded-t-lg flex-1 overflow-y-auto">
        <PollutionMapCategorySelector
          period={period}
          setPeriod={setPeriod}
          category={category}
          setCategory={setCategory}
          lastUpdateDate={lastUpdateDate}
        />

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Ce qu&apos;affiche la carte
          </h3>

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

        {(totalUdis !== null || lastUpdateDate || totalUdisInChart > 0) && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Quelques chiffres
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {totalUdis !== null && (
                <div className="rounded-xl border border-gray-200 p-3">
                  <div className="text-xl font-semibold text-gray-900">
                    {totalUdis.toLocaleString("fr-FR")}
                  </div>
                  <div className="text-xs text-gray-500">
                    réseaux de distribution suivis
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
            {totalUdisInChart > 0 && (
              <div className="grid grid-cols-1 gap-3 mt-3">
                <div className="rounded-xl border border-gray-200 p-3">
                  <DonutChart
                    title="réseaux de distribution"
                    slices={udiSlices}
                    total={totalUdisInChart}
                    formatTotal={(n) => `${n.toLocaleString("fr-FR")}`}
                    formatValue={(n) => n.toLocaleString("fr-FR")}
                  />
                </div>
                {totalPopulation > 0 && (
                  <div className="rounded-xl border border-gray-200 p-3">
                    <DonutChart
                      title="nombre d'habitants"
                      slices={populationSlices}
                      total={totalPopulation}
                      formatTotal={(n) => `${formatPopulation(n)}`}
                      formatValue={formatPopulation}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
