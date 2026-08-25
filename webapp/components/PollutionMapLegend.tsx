import { getCategoryById } from "@/lib/polluants";
import { getPropertyName } from "@/lib/property";
import {
  getStatistic as getStat,
  getStatisticValue as getStatValue,
} from "@/lib/stats";
import { Info, ChevronUp, ChevronDown, ExternalLink } from "lucide-react";
import React, { useState } from "react";
import type { PollutionStats } from "@/app/lib/data";
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
  isMobile?: boolean;
  variant?: "compact" | "full";
}

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
  isMobile = false,
  variant = "compact",
}: PollutionMapLegendProps) {
  // `null` means "no explicit user choice yet": default to expanded unless
  // on mobile. Derived from the `isMobile` prop on every render (rather than
  // captured once via useState) so it stays correct if `isMobile` is only
  // known after mount, instead of getting stuck open on mobile.
  const [isExpandedOverride, setIsExpandedOverride] = useState<boolean | null>(
    null,
  );
  const isExpanded =
    isExpandedOverride === null ? !isMobile : isExpandedOverride;
  const setIsExpanded = setIsExpandedOverride;
  const categoryDetails = getCategoryById(category);
  if (!categoryDetails) {
    return null; // Handle the case where category details are not found
  }

  const getStatistic = (propertyName: string): number | null =>
    getStat(pollutionStats, propertyName);

  const getStatisticValue = (propertyName: string): string | number | null =>
    getStatValue(pollutionStats, propertyName);

  // Get total UDIs for percentage calculation
  const totalUdis = getStatistic("total_udis");

  // Get the last update date
  const getLastUpdateDate = (): string => {
    const dateValue = getStatisticValue("derniere_mise_a_jour");
    if (dateValue) {
      const date = new Date(dateValue);
      return `Dernière analyse disponible: ${date.toLocaleDateString("fr-FR")}`;
    }
    return "";
  };

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

  const descriptionBlock = (categoryDetails.description ||
    categoryDetails.lienExterne) && (
    <div className="mb-3 text-xs text-gray-600 space-y-1">
      {categoryDetails.description && <p>{categoryDetails.description}</p>}
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
        {getLastUpdateDate() && (
          <p className="text-xs text-gray-500">
            {getLastUpdateDate()}
            {displayMode === "communes" &&
              " - Les tracés de la carte affichent les communes"}
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

  if (variant === "full") {
    return (
      <TooltipProvider>
        <div>
          <h2 className="text-sm font-medium text-gray-900 mb-3">
            Légende - {categoryDetails.nomAffichage}
          </h2>
          {bodyContent}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="bg-white rounded-2xl border border-gray-500 shadow-lg max-w-md transform transition-all duration-300 ease-in-out overflow-hidden">
        {/* Always visible header bar */}
        <div
          className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex-1">
            <h2 className="text-sm font-medium text-gray-900">
              Légende - {categoryDetails.nomAffichage}
            </h2>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            aria-label={isExpanded ? "Collapse legend" : "Expand legend"}
          >
            {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>

        {/* Expandable content */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
          style={{
            overflow: isExpanded ? "visible" : "hidden",
          }}
        >
          <div className="px-5 pb-5">{bodyContent}</div>
        </div>
      </div>
    </TooltipProvider>
  );
}
