"use client";

import { X } from "lucide-react";
import { getPropertyName } from "@/lib/property";
import { getCategoryById } from "@/lib/polluants";

type PollutionMapDetailPanelProps = {
  data: Record<string, string | number | null> | null;
  period: string;
  category: string;
  displayMode: "communes" | "udis";
  onClose: () => void;
};

export default function PollutionMapDetailPanel({
  data,
  period,
  category,
  displayMode,
  onClose,
}: PollutionMapDetailPanelProps) {
  if (!data) {
    return null;
  }

  const title =
    displayMode === "communes" ? data["commune_nom"] : data["nomreseaux"];

  const code =
    displayMode === "communes" ? data["commune_code_insee"] : data["cdreseau"];

  const property = getPropertyName(
    period,
    category,
    period === "dernier_prel" ? "resultat" : "ratio",
  );

  const value = data[property] || null;

  const categoryDetails = getCategoryById(category);
  const resultColor =
    categoryDetails?.resultats[value as string]?.couleur || "#dddddd";
  const resultLabel =
    categoryDetails?.resultats[value as string]?.label || "Aucune donnée";

  console.log(
    "PollutionMapDetailPanel",
    "code:",
    code,
    "property:",
    property,
    "value:",
    value,
    "resultColor:",
    resultColor,
  );

  return (
    <div className="absolute inset-0 flex justify-center items-center z-50 p-4 pointer-events-none">
      <div className="w-full max-w-md overflow-hidden bg-white p-4 rounded-lg shadow-lg overflow-y-auto max-h-96 pointer-events-auto">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            aria-label="Close panel"
          >
            <X />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          <span className="font-medium">Code:</span> {code}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: resultColor }}
          ></div>
          <span className="text-sm">{resultLabel}</span>
        </div>
      </div>
    </div>
  );
}
