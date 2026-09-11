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
    <div className="h-full flex flex-col relative bg-kaki">
      <div className=" text-white p-4 flex items-center justify-between gap-4">
        <div className="text-2xl">Réglages de la carte</div>
        <button
          className="shrink-0 text-kaki bg-white border border-greydark rounded-full p-2 hover:bg-greylight transition duration-300 z-10"
          onClick={() => onClose?.()}
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="bg-white p-4 flex flex-col space-y-6 rounded-t-xl flex-1 overflow-y-auto">
        <PollutionMapCategorySelector
          period={period}
          setPeriod={setPeriod}
          category={category}
          setCategory={setCategory}
          lastUpdateDate={lastUpdateDate}
        />

        <div className="border-t border-greylight pt-6 space-y-3 text-sm">
          <h3 className="text-sm font-semibold text-greydark uppercase tracking-wide mb-3">
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
          <div className="border-t border-greylight pt-6">
            <h3 className="text-sm font-semibold text-greydark uppercase tracking-wide mb-3">
              Quelques chiffres
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {totalUdis !== null && (
                <div className="rounded-xl border border-greylight p-3">
                  <div className="text-xl font-semibold text-dark">
                    {totalUdis.toLocaleString("fr-FR")}
                  </div>
                  <div className="text-sm text-greydark">
                    réseaux de distribution suivis
                  </div>
                </div>
              )}
              {lastUpdateDate && (
                <div className="rounded-xl border border-greylight p-3">
                  <div className="text-xl font-semibold text-dark">
                    {lastUpdateDate}
                  </div>
                  <div className="text-sm text-greydark">
                    dernière analyse disponible
                  </div>
                </div>
              )}
            </div>
            {totalUdisInChart > 0 && (
              <div className="grid grid-cols-1 gap-3 mt-3">
                <div className="rounded-xl border border-greylight p-3">
                  <DonutChart
                    title="réseaux de distribution"
                    slices={udiSlices}
                    total={totalUdisInChart}
                    formatTotal={(n) => `${n.toLocaleString("fr-FR")}`}
                    formatValue={(n) => n.toLocaleString("fr-FR")}
                  />
                </div>
                {totalPopulation > 0 && (
                  <div className="rounded-xl border border-greylight p-3">
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
