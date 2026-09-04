import { getCategoryById } from "@/lib/polluants";
import { getPropertyName } from "@/lib/property";
import { getStatistic } from "@/lib/stats";
import type { PollutionStats } from "@/app/lib/data";

export type LegendStatItem = {
  label: string;
  color: string;
  count: number | null;
  population: number | null;
  explication?: string;
};

/**
 * Builds the legend rows (label, color, UDI count, population) for a given
 * period/category, reading the matching stats from `web__stats_udi`. Shared
 * between the legend and the "Quelques chiffres" donut charts so both stay
 * in sync.
 */
export function getLegendItems(
  period: string,
  category: string,
  pollutionStats: PollutionStats,
  colorblindMode: boolean,
): LegendStatItem[] {
  const categoryDetails = getCategoryById(category);
  if (!categoryDetails) {
    return [];
  }

  const stat = (propertyName: string) =>
    getStatistic(pollutionStats, propertyName);

  if (period === "dernier_prel") {
    return Object.entries(categoryDetails.derniereAnalyse.resultats).map(
      ([resultKey, value]) => {
        const statName = getPropertyName(period, category, resultKey);
        return {
          label: value.label,
          color: colorblindMode ? value.couleurAlt : value.couleur,
          count: stat(statName),
          population: stat(`${statName}_population`),
          explication: value.explication,
        };
      },
    );
  }

  const annuels = categoryDetails.bilanAnnuel;
  if (!annuels) {
    return [];
  }

  const nonRechercheStatName = `${period}_${category}_non_recherche`;
  const items: LegendStatItem[] = [
    {
      label: annuels.nonRechercheLabel,
      color: colorblindMode
        ? annuels.nonRechercheCouleurAlt
        : annuels.nonRechercheCouleur,
      count: stat(nonRechercheStatName),
      population: stat(`${nonRechercheStatName}_population`),
    },
  ];

  annuels.ratioLimites.forEach((item) => {
    const statName = `${period}_${category}_ratio_${item.limite}`;
    items.push({
      label: `${item.label} des ${annuels.ratioLabelPlural}`,
      color: colorblindMode ? item.couleurAlt : item.couleur,
      count: stat(statName),
      population: stat(`${statName}_population`),
    });
  });

  return items;
}
