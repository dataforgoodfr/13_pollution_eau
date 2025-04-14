"use client";

import { getPropertyName } from "@/lib/property";
import { getCategoryById } from "@/lib/polluants";

type PollutionMapDetailPanelProps = {
  selectedZoneData: Record<string, string | number | null> | null;
  period?: string;
  category?: string;
  displayMode?: "communes" | "udis";
};

export default function PollutionMapDetailPanel({
  selectedZoneData,
  period = "dernier_prel",
  category = "tous-polluants",
  displayMode = "udis",
}: PollutionMapDetailPanelProps) {
  if (!selectedZoneData) {
    return null;
  }

  const title =
    displayMode === "communes"
      ? selectedZoneData["commune_nom"]
      : selectedZoneData["nomreseaux"];

  const code =
    displayMode === "communes"
      ? selectedZoneData["commune_code_insee"]
      : selectedZoneData["cdreseau"];

  const property = getPropertyName(
    period,
    category,
    period === "dernier_prel" ? "resultat" : "ratio",
  );

  const value = selectedZoneData[property] || null;

  const categoryDetails = getCategoryById(category);
  const resultColor =
    categoryDetails?.resultats[value as string]?.couleur || "#dddddd";
  const resultLabel =
    categoryDetails?.resultats[value as string]?.label || "Aucune donnée";

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: resultColor }}
        ></div>
        <span className="text-sm font-medium">{resultLabel}</span>
      </div>

      <p className="text-xs text-gray-600">
        <span className="font-medium">Code:</span> {code}
        {title && <span> - {title}</span>}
      </p>
    </div>
  );
}
