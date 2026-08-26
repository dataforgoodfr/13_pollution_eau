import { availableCategories, getCategoryById } from "@/lib/polluants";
import { getPropertyName } from "@/lib/property";
import { cn } from "@/lib/utils";
import { getStatistic as getStat } from "@/lib/stats";
import { Info, ExternalLink } from "lucide-react";
import React from "react";
import type { PollutionStats } from "@/app/lib/data";
import type { ZoneResult } from "@/lib/colorMapping";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";

interface PollutionMapLegendProps {
  period: string;
  category: string;
  pollutionStats: PollutionStats;
  colorblindMode: boolean;
  setColorblindMode: (value: boolean) => void;
  displayMode: "communes" | "udis";
  variant?: "compact" | "full";
  hoveredResult?: ZoneResult | null;
}

// Ancres textuelles des extrémités de l'échelle compacte (mode "dernières
// analyses") : résument en deux mots le sens de la première et de la dernière
// couleur, les libellés complets restant accessibles en tooltip.
const COMPACT_ANCHORS: Record<string, { debut: string; fin: string }> = {
  tous: { debut: "Non quantifié", fin: "Eau déconseillée" },
  pfas: { debut: "Non quantifié", fin: "Limite sanitaire dépassée" },
  pesticide: { debut: "Non quantifié", fin: "Eau déconseillée" },
  sub_active: { debut: "Non quantifié", fin: "Eau déconseillée" },
  metabolite_p: { debut: "Non quantifié", fin: "Eau déconseillée" },
  metabolite_np: { debut: "Non quantifié", fin: "> 0,9 µg/L" },
  metabolite_esa_metolachlore: { debut: "Non quantifié", fin: "> 3 µg/L" },
  metabolite_chlorothalonil_r471811: {
    debut: "Non quantifié",
    fin: "> 3 µg/L",
  },
  metabolite_chloridazone_desphenyl: {
    debut: "Non quantifié",
    fin: "Eau déconseillée",
  },
  metabolite_chloridazone_methyl_desphenyl: {
    debut: "Non quantifié",
    fin: "Eau déconseillée",
  },
  metabolite_atrazine_desethyl: {
    debut: "Non quantifié",
    fin: "Eau déconseillée",
  },
  pes_total_reg: { debut: "≤ 0,5 µg/L", fin: "> 5 µg/L" },
  pes_total_ts: { debut: "≤ 0,5 µg/L", fin: "> 5 µg/L" },
  nitrate: { debut: "≤ 10 mg/L", fin: "> 50 mg/L" },
  cvm: { debut: "Non quantifié", fin: "> 0,5 µg/L" },
  sub_indus_perchlorate: { debut: "Non quantifié", fin: "> 15 µg/L" },
};

function LegendItem({
  color,
  label,
  count,
  percentage,
  population,
}: {
  color?: string;
  label: string;
  count?: number | null;
  percentage?: number | null;
  population?: number | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-6 h-4 flex-shrink-0"
        style={{
          backgroundColor: color || undefined,
        }}
      ></div>
      <div className="flex-1">
        <span className="text-gray-900">{label}</span>
      </div>
      {count !== null && count !== undefined && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {count}{" "}
              {count < 2
                ? "réseau de distribution (UDI) est"
                : "réseaux de distribution (UDI) sont"}{" "}
              dans cette situation
              {percentage !== null &&
                percentage !== undefined &&
                ` (~${percentage.toFixed(1)}%)`}
              {population !== null && population !== undefined && (
                <>, alimentant {population.toLocaleString("fr-FR")} personnes</>
              )}
              .
            </p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

export default function PollutionMapLegend({
  period,
  category,
  pollutionStats,
  colorblindMode,
  setColorblindMode,
  displayMode,
  variant = "compact",
  hoveredResult = null,
}: PollutionMapLegendProps) {
  const categoryDetails = getCategoryById(category);
  if (!categoryDetails) {
    return null; // Handle the case where category details are not found
  }

  // Compact : pastille de synthèse posée sur la carte. Une phrase décrit la
  // sélection courante, une échelle de couleurs segmentée résume la légende
  // (libellés complets en tooltip), et le survol d'une zone sur la carte
  // surligne le segment correspondant avec son libellé en dessous.
  if (variant === "compact") {
    const topLevel = availableCategories.find(
      (item) =>
        item.id === category ||
        item.enfants?.some((child) => child.id === category),
    );
    const selectionLabel =
      topLevel && topLevel.id !== category
        ? `${topLevel.nomAffichage} · ${categoryDetails.nomAffichage}`
        : categoryDetails.nomAffichage;
    const isBilan = period.startsWith("bilan_annuel");
    const periodLabel = isBilan
      ? `bilan annuel ${period.replace("bilan_annuel_", "")}`
      : "dernières analyses";

    // Construit l'échelle : la pastille grise "non recherché" à part, puis les
    // segments colorés dans l'ordre croissant de gravité. Les couples
    // libellé/couleur sont construits comme dans getZoneResult, ce qui permet
    // de retrouver le segment correspondant au résultat survolé par égalité.
    let graySegment: ZoneResult | null = null;
    let segments: ZoneResult[] = [];
    let anchors: { debut: string; fin: string } | null = null;
    let caption: string | null = null;

    if (isBilan) {
      const annuels = categoryDetails.resultatsAnnuels;
      if (!annuels) {
        return null;
      }
      graySegment = {
        label: annuels.nonRechercheLabel,
        color: colorblindMode
          ? annuels.nonRechercheCouleurAlt
          : annuels.nonRechercheCouleur,
      };
      segments = annuels.ratioLimites.map((l) => ({
        label: `${l.label} des ${annuels.ratioLabelPlural}`,
        color: colorblindMode ? l.couleurAlt : l.couleur,
      }));
      anchors = { debut: "0 %", fin: "100 %" };
      caption = `Part des ${annuels.ratioLabelPlural}`;
    } else {
      Object.entries(categoryDetails.resultats).forEach(([key, detail]) => {
        const segment = {
          label: detail.label,
          color: colorblindMode ? detail.couleurAlt : detail.couleur,
        };
        if (key === "non_recherche") {
          graySegment = segment;
        } else {
          segments.push(segment);
        }
      });
      anchors = COMPACT_ANCHORS[category] ?? null;
    }

    const hoveredIndex = hoveredResult
      ? segments.findIndex(
          (s) =>
            s.label === hoveredResult.label && s.color === hoveredResult.color,
        )
      : -1;
    const grayHovered =
      hoveredResult !== null &&
      graySegment !== null &&
      graySegment.label === hoveredResult.label &&
      graySegment.color === hoveredResult.color;
    const hasHover = hoveredIndex >= 0 || grayHovered;

    return (
      <TooltipProvider>
        <div className="w-72 bg-white/95 rounded-xl border border-gray-300 shadow-lg px-3 py-2 text-xs">
          <p className="text-gray-900">
            <span className="font-medium">{selectionLabel}</span>
            <span className="text-gray-500"> — {periodLabel}</span>
          </p>

          <div className="mt-2 flex items-center gap-2">
            {graySegment && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={cn(
                      "h-3 w-4 rounded-sm flex-shrink-0 transition-all",
                      grayHovered && "ring-2 ring-gray-900 ring-offset-1",
                      hasHover && !grayHovered && "opacity-30",
                    )}
                    style={{ backgroundColor: graySegment.color }}
                  />
                </TooltipTrigger>
                <TooltipContent className="max-w-56">
                  <p>{graySegment.label}</p>
                </TooltipContent>
              </Tooltip>
            )}
            <div className="flex flex-1 gap-px">
              {segments.map((segment, index) => (
                <Tooltip key={segment.color + segment.label}>
                  <TooltipTrigger asChild>
                    <span
                      className={cn(
                        "h-3 flex-1 transition-all",
                        index === 0 && "rounded-l-sm",
                        index === segments.length - 1 && "rounded-r-sm",
                        hoveredIndex === index &&
                          "ring-2 ring-gray-900 ring-offset-1 relative z-10 rounded-sm",
                        hasHover && hoveredIndex !== index && "opacity-30",
                      )}
                      style={{ backgroundColor: segment.color }}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-56">
                    <p>{segment.label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {anchors && (
            <div
              className={cn(
                "mt-1 flex justify-between text-[10px] text-gray-500 leading-tight",
                graySegment && "ml-6",
              )}
            >
              <span>{anchors.debut}</span>
              <span>{anchors.fin}</span>
            </div>
          )}

          <p className="mt-1 min-h-4 text-[11px] leading-snug">
            {hoveredResult && hasHover ? (
              <span className="text-gray-900">{hoveredResult.label}</span>
            ) : caption ? (
              <span className="text-gray-400">{caption}</span>
            ) : null}
          </p>
        </div>
      </TooltipProvider>
    );
  }

  const getStatistic = (propertyName: string): number | null =>
    getStat(pollutionStats, propertyName);

  // Get total UDIs for percentage calculation
  const totalUdis = getStatistic("total_udis");

  const legendItems = Object.entries(categoryDetails.resultats).map(
    ([resultKey, value]) => {
      // Calculate count, percentage, and population for this legend item
      let count = null;
      let percentage = null;
      let population = null;

      if (period === "dernier_prel") {
        const statName = getPropertyName(period, category, resultKey);
        count = getStatistic(statName);
        if (count !== null && totalUdis) {
          percentage = (count / totalUdis) * 100;
        }
        // Get population statistic
        const populationStatName = `${statName}_population`;
        population = getStatistic(populationStatName);
      }

      return {
        label: value.label,
        color: colorblindMode ? value.couleurAlt : value.couleur,
        count,
        percentage,
        population,
      };
    },
  );

  let legendContent = null;

  if (period === "dernier_prel") {
    // dernier_prel
    legendContent = (
      <>
        <div className="space-y-3 text-xs">
          {legendItems.map((item) => (
            <LegendItem
              key={item.color + item.label}
              color={item.color}
              label={item.label}
              count={item.count}
              percentage={item.percentage}
              population={item.population}
            />
          ))}
        </div>
        {categoryDetails.resultatsDetails && (
          <p className="text-gray-500 mt-4 text-xs">
            {categoryDetails.resultatsDetails
              ?.split("\n")
              .map((line, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <br />}
                  {line}
                </React.Fragment>
              ))}
          </p>
        )}
      </>
    );
  } else {
    // bilan_annuel
    if (!categoryDetails.resultatsAnnuels) {
      return null;
    }

    // For annual reports, get stats for ratio intervals and other items
    const getAnnualStats = (ratioKey: string) => {
      const statName = `${period}_${category}_ratio_${ratioKey}`;
      const count = getStatistic(statName);
      const population = getStatistic(`${statName}_population`);
      if (count !== null && totalUdis) {
        const percentage = (count / totalUdis) * 100;
        return { count, percentage, population };
      }
      return { count: null, percentage: null, population };
    };

    const nonRechercheStats = (() => {
      const statName = `${period}_${category}_non_recherche`;
      const count = getStatistic(statName);
      const population = getStatistic(`${statName}_population`);
      if (count !== null && totalUdis) {
        const percentage = (count / totalUdis) * 100;
        return { count, percentage, population };
      }
      return { count: null, percentage: null, population };
    })();

    legendContent = (
      <>
        <div className="space-y-3 text-xs">
          <LegendItem
            color={
              colorblindMode
                ? categoryDetails.resultatsAnnuels.nonRechercheCouleurAlt
                : categoryDetails.resultatsAnnuels.nonRechercheCouleur || ""
            }
            label={categoryDetails.resultatsAnnuels.nonRechercheLabel || ""}
            count={nonRechercheStats.count}
            percentage={nonRechercheStats.percentage}
            population={nonRechercheStats.population}
          />
          {categoryDetails.resultatsAnnuels.ratioLimites.map((item) => {
            // Map the ratio limits to the corresponding database keys based on actual limit values
            let ratioKey: string;
            if (item.limite === 0) ratioKey = "0";
            else if (item.limite === 0.25) ratioKey = "0.25";
            else if (item.limite === 0.5) ratioKey = "0.5";
            else if (item.limite === 0.75) ratioKey = "0.75";
            else if (item.limite === 1) ratioKey = "1";
            else ratioKey = "erreur"; // for unexpected values

            const stats = getAnnualStats(ratioKey);

            return (
              <LegendItem
                key={item.couleur + item.label}
                color={colorblindMode ? item.couleurAlt : item.couleur}
                label={`${item.label} des ${categoryDetails.resultatsAnnuels?.ratioLabelPlural}`}
                count={stats.count}
                percentage={stats.percentage}
                population={stats.population}
              />
            );
          })}
        </div>
        {categoryDetails.resultatsAnnuels?.details && (
          <p className="text-gray-500 mt-4 text-xs">
            {categoryDetails.resultatsAnnuels.details
              ?.split("\n")
              .map((line, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <br />}
                  {line}
                </React.Fragment>
              ))}
          </p>
        )}
      </>
    );
  }

  // Phrase d'introduction propre au type de carte affiché (dernière analyse ou
  // bilan annuel), à la suite de la description générale du polluant.
  const topSentence =
    period === "dernier_prel"
      ? categoryDetails.resultatsTopLegend
      : categoryDetails.resultatsAnnuels?.topLegend;

  const descriptionBlock = (categoryDetails.description ||
    topSentence ||
    categoryDetails.lienExterne) && (
    <div className="mb-3 text-xs text-gray-600 space-y-2">
      {categoryDetails.description && <p>{categoryDetails.description}</p>}
      {topSentence && <p>{topSentence}</p>}
      {categoryDetails.lienExterne && (
        <a
          href={categoryDetails.lienExterne}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-custom-drom hover:underline"
        >
          En savoir plus <ExternalLink size={12} />
        </a>
      )}
    </div>
  );

  const bodyContent = (
    <>
      {descriptionBlock}
      <div className="mb-2">{legendContent}</div>

      <div className="space-y-2">
        {displayMode === "communes" && (
          <p className="text-xs text-gray-500">
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
            className="text-xs text-gray-500 cursor-pointer select-none"
          >
            Couleurs adaptées aux daltoniens
          </label>
        </div>
      </div>
    </>
  );

  return (
    <TooltipProvider>
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Ce qu&apos;affiche la carte
        </h3>
        {bodyContent}
      </div>
    </TooltipProvider>
  );
}
