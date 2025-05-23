import { getCategoryById } from "@/lib/polluants";
import { X } from "lucide-react";
import React from "react";

interface PollutionMapLegendProps {
  onClose: () => void;
  period: string;
  category: string;
}

function LegendItem({ color, label }: { color?: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-6 h-4 flex-shrink-0"
        style={{
          backgroundColor: color || undefined,
        }}
      ></div>
      <span className="text-gray-900">{label}</span>
    </div>
  );
}

export default function PollutionMapLegend({
  onClose,
  period,
  category,
}: PollutionMapLegendProps) {
  const categoryDetails = getCategoryById(category);
  if (!categoryDetails) {
    return null; // Handle the case where category details are not found
  }
  const legendItems = Object.entries(categoryDetails.resultats).map(
    ([, value]) => ({
      label: value.label,
      color: value.couleur || value.couleurFond,
    }),
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
    legendContent = (
      <>
        <div className="space-y-3 text-sm">
          <LegendItem
            color={categoryDetails.resultatsAnnuels.nonRechercheCouleur || ""}
            label={categoryDetails.resultatsAnnuels.nonRechercheLabel || ""}
          />
          <div className="flex items-center gap-3 text-gray-900">
            {categoryDetails.resultatsAnnuels.ratioLabel}:
          </div>
          {categoryDetails.resultatsAnnuels.ratioLimites?.map((item) => (
            <LegendItem
              key={item.couleur + item.label}
              color={item.couleur}
              label={item.label}
            />
          ))}
          {categoryDetails.resultatsAnnuels.valeurSanitaireLabel && (
            <LegendItem
              color={
                categoryDetails.resultatsAnnuels.valeurSanitaireCouleur || ""
              }
              label={
                categoryDetails.resultatsAnnuels.valeurSanitaireLabel || ""
              }
            />
          )}
        </div>
      </>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md transform transition-all">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text font-semibold text-gray-900">
          {categoryDetails.nomAffichage}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          aria-label="Close legend"
        >
          <X />
        </button>
      </div>

      {legendContent}
    </div>
  );
}
