import type { PollutionStats } from "@/app/lib/data";

export function getStatistic(
  pollutionStats: PollutionStats,
  propertyName: string,
): number | null {
  const stat = pollutionStats.find((s) => s.stat_nom === propertyName);
  if (stat?.stat_chiffre !== null && stat?.stat_chiffre !== undefined) {
    return Number(stat.stat_chiffre);
  }
  return null;
}

export function getStatisticValue(
  pollutionStats: PollutionStats,
  propertyName: string,
): string | number | null {
  const stat = pollutionStats.find((s) => s.stat_nom === propertyName);
  return stat ? (stat.stat_chiffre ?? stat.stat_texte) : null;
}
