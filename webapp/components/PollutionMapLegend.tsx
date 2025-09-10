import { getCategoryById } from "@/lib/polluants";
import { getPropertyName } from "@/lib/property";
import { X, Info } from "lucide-react";
import React from "react";
import type { PollutionStats } from "@/app/lib/data";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PollutionMapLegendProps {
  onClose: () => void;
  period: string;
  category: string;
  pollutionStats: PollutionStats;
  colorblindMode: boolean;
  setColorblindMode: (value: boolean) => void;
}

function LegendItem({
  color,
  label,
  count,
  percentage,
}: {
  color?: string;
  label: string;
  count?: number | null;
  percentage?: number | null;
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
              dans cette situation en France, soit environ{" "}
              {percentage !== null &&
                percentage !== undefined &&
                `${percentage.toFixed(1)}%`}
            </p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

export default function PollutionMapLegend({
  onClose,
  period,
  category,
  pollutionStats,
  colorblindMode,
  setColorblindMode,
}: PollutionMapLegendProps) {
  const categoryDetails = getCategoryById(category);
  if (!categoryDetails) {
    return null; // Handle the case where category details are not found
  }

  // Helper function to get statistic value
  const getStatistic = (propertyName: string): number | null => {
    const stat = pollutionStats.find((s) => s.stat_nom === propertyName);
    if (stat?.stat_chiffre !== null && stat?.stat_chiffre !== undefined) {
      return Number(stat.stat_chiffre);
    }
    return null;
  };

  // Helper function to get statistic value
  const getStatisticValue = (propertyName: string): string | number | null => {
    const stat = pollutionStats.find((s) => s.stat_nom === propertyName);
    return stat ? (stat.stat_chiffre ?? stat.stat_texte) : null;
  };

  // Get total UDIs for percentage calculation
  const totalUdis = getStatistic("total_udis");

  // Get the last update date
  const getLastUpdateDate = (): string => {
    const dateValue = getStatisticValue("derniere_mise_a_jour");
    if (dateValue) {
      const date = new Date(dateValue);
      return `Dernière mise à jour le ${date.toLocaleDateString("fr-FR")}`;
    }
    return "";
  };

  const legendItems = Object.entries(categoryDetails.resultats).map(
    ([resultKey, value]) => {
      // Calculate count and percentage for this legend item
      let count = null;
      let percentage = null;

      if (period === "dernier_prel") {
        const statName = getPropertyName(period, category, resultKey);
        count = getStatistic(statName);
        if (count !== null && totalUdis) {
          percentage = (count / totalUdis) * 100;
        }
      }

      return {
        label: value.label,
        color: colorblindMode ? value.couleurAlt : value.couleur,
        count,
        percentage,
      };
    },
  );

  let legendContent = null;

  if (period === "dernier_prel") {
    // dernier_prel
    legendContent = (
      <>
        <div className="space-y-3 text-sm">
          {legendItems.map((item) => (
            <LegendItem
              key={item.color + item.label}
              color={item.color}
              label={item.label}
              count={item.count}
              percentage={item.percentage}
            />
          ))}
        </div>
        {categoryDetails.detailsLegende && (
          <p className="text-gray-500 mt-4 text-sm">
            {categoryDetails.detailsLegende?.split("\n").map((line, index) => (
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
      if (count !== null && totalUdis) {
        const percentage = (count / totalUdis) * 100;
        return { count, percentage };
      }
      return { count: null, percentage: null };
    };

    const nonRechercheStats = (() => {
      const statName = `${period}_${category}_non_recherche`;
      const count = getStatistic(statName);
      if (count !== null && totalUdis) {
        const percentage = (count / totalUdis) * 100;
        return { count, percentage };
      }
      return { count: null, percentage: null };
    })();

    legendContent = (
      <>
        <div className="space-y-3 text-sm">
          <LegendItem
            color={
              colorblindMode
                ? categoryDetails.resultatsAnnuels.nonRechercheCouleurAlt
                : categoryDetails.resultatsAnnuels.nonRechercheCouleur || ""
            }
            label={categoryDetails.resultatsAnnuels.nonRechercheLabel || ""}
            count={nonRechercheStats.count}
            percentage={nonRechercheStats.percentage}
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
              />
            );
          })}
        </div>
      </>
    );
  }

  return (
    <TooltipProvider>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md transform transition-all">
        <div className="flex justify-between items-center mb-2">
          <div className="flex-1">
            <h2 className="text font-semibold text-gray-900">
              {categoryDetails.nomAffichage}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            aria-label="Close legend"
          >
            <X />
          </button>
        </div>
        <div className="mb-2">
          {getLastUpdateDate() && (
            <p className="text-xs text-gray-500 mt-1">{getLastUpdateDate()}</p>
          )}
          <button
            onClick={() => setColorblindMode(!colorblindMode)}
            className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
          >
            {colorblindMode
              ? "Désactiver les couleurs adaptées aux daltoniens"
              : "Activer les couleurs adaptées aux daltoniens"}
          </button>
        </div>

        <div>{legendContent}</div>
      </div>
    </TooltipProvider>
  );
}
