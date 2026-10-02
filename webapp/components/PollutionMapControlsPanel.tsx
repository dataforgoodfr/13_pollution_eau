"use client";

import { ExternalLink, Info, X } from "lucide-react";
import PollutionMapCategorySelector from "./PollutionMapCategorySelector";
import DonutChart from "./DonutChart";
import { getStatisticValue } from "@/lib/stats";
import { getLegendItems, type LegendStatItem } from "@/lib/legendStats";
import { getCategoryById } from "@/lib/polluants";
import type { PollutionStats } from "@/app/lib/data";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

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

function LegendItem({
  color,
  label,
  explication,
}: Pick<LegendStatItem, "color" | "label" | "explication">) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-6 h-3 rounded-sm flex-shrink-0"
        style={{
          backgroundColor: color || undefined,
        }}
      ></div>
      <div className="flex-1">
        <span>{label}</span>
        {explication && (
          <Popover>
            <PopoverTrigger
              aria-label="En savoir plus sur cette situation"
              className="ml-1 inline-flex align-middle text-gray-400 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 rounded-full"
            >
              <Info size={14} />
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="start"
              collisionPadding={8}
              className="z-[70] w-72 max-w-[calc(100vw-2rem)] p-3 text-sm leading-snug text-gray-700"
            >
              {explication.split("\n").map((line, index) => (
                <p key={index} className={index > 0 ? "mt-2" : undefined}>
                  {line}
                </p>
              ))}
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}

// Ex. "23 réseaux de distribution, desservant 450 000 habitants, ont distribué
// au moins une fois dans l'année une eau non conforme (PFAS)."
function getDepassementSentence(
  count: number,
  population: number,
  ratioLabelPlural: string,
  nomAffichage: string,
): string {
  // "analyses non conformes" -> "non conforme", "analyses > 0,5 µg/L" -> "> 0,5 µg/L"
  const qualificatif = ratioLabelPlural
    .replace(/^analyses /, "")
    .replace(/conformes/g, "conforme");
  const fin = `au moins une fois dans l'année une eau ${qualificatif} (${nomAffichage}).`;
  if (count === 0) {
    return `Aucun réseau de distribution n'a distribué ${fin}`;
  }
  const reseaux =
    count === 1
      ? "1 réseau de distribution"
      : `${count.toLocaleString("fr-FR")} réseaux de distribution`;
  const habitants =
    population > 0
      ? `, desservant ${formatPopulation(population)}${population >= 1_000_000 ? " d'habitants" : " habitants"},`
      : "";
  return `${reseaux}${habitants} ${count === 1 ? "a" : "ont"} distribué ${fin}`;
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
  const lastUpdateValue = getStatisticValue(
    pollutionStats,
    "derniere_mise_a_jour",
  );
  const lastUpdateDate = lastUpdateValue
    ? new Date(lastUpdateValue).toLocaleDateString("fr-FR")
    : null;

  const categoryDetails = getCategoryById(category);
  // Phrase d'introduction propre au type de carte affiché (dernière analyse ou
  // bilan annuel), à la suite de la description générale du polluant.
  const topSentence =
    period === "dernier_prel"
      ? categoryDetails?.derniereAnalyse.topLegend
      : categoryDetails?.bilanAnnuel?.topLegend;

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
  // Bilan annuel : réseaux / habitants ayant reçu au moins une fois dans
  // l'année une eau au-delà du seuil (somme des tranches > 0%)
  const depassementItems = legendItems.filter(
    (item) => item.depassementAnnuel && item.count !== null,
  );
  const depassementSentence =
    categoryDetails?.bilanAnnuel && depassementItems.length > 0
      ? getDepassementSentence(
          depassementItems.reduce((sum, item) => sum + item.count!, 0),
          depassementItems.reduce(
            (sum, item) => sum + (item.population ?? 0),
            0,
          ),
          categoryDetails.bilanAnnuel.ratioLabelPlural,
          categoryDetails.nomAffichage,
        )
      : null;

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

          {categoryDetails?.description && <p>{categoryDetails.description}</p>}
          {topSentence && <p className="whitespace-pre-line">{topSentence}</p>}
          {categoryDetails?.lienExterne && (
            <a
              href={categoryDetails.lienExterne}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-kaki hover:underline"
            >
              En savoir plus <ExternalLink size={12} />
            </a>
          )}

          <div className="space-y-3">
            {legendItems.map((item) => (
              <LegendItem key={item.color + item.label} {...item} />
            ))}
          </div>

          {displayMode === "communes" && (
            <p className="text-gray-500">
              Les tracés de la carte affichent les communes.
            </p>
          )}
          <div className="flex items-center gap-3">
            <Switch
              id="colorblind-switch"
              checked={colorblindMode}
              onCheckedChange={setColorblindMode}
            />
            <label
              htmlFor="colorblind-switch"
              className="text-gray-500 cursor-pointer select-none"
            >
              Couleurs plus contrastées
            </label>
          </div>
        </div>

        {totalUdisInChart > 0 && (
          <div className="border-t border-greylight pt-6">
            <h3 className="text-sm font-semibold text-greydark uppercase tracking-wide mb-3">
              Statistiques
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-xl border border-greylight p-3">
                <DonutChart
                  title="Nombre de réseaux de distribution concernés par chaque situation"
                  slices={udiSlices}
                  total={totalUdisInChart}
                  formatValue={(n) => n.toLocaleString("fr-FR")}
                />
              </div>
              {totalPopulation > 0 && (
                <div className="rounded-xl border border-greylight p-3">
                  <DonutChart
                    title="Nombre d’habitants concernés par chaque situation"
                    slices={populationSlices}
                    total={totalPopulation}
                    formatValue={formatPopulation}
                  />
                </div>
              )}
            </div>
            {depassementSentence && (
              <p className="mt-3 text-sm">{depassementSentence}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
