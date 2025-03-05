"use client";

import { formatCategoryName } from "@/lib/polluants";

type PollutionMapDetailPanelProps = {
  feature: any;
  onClose: () => void;
  className?: string;
};

export default function PollutionMapDetailPanel({
  feature,
  onClose,
  className = "",
}: PollutionMapDetailPanelProps) {
  if (!feature || !feature.properties) {
    return null;
  }

  const properties = feature.properties;

  const communeName = properties.commune_nom || "Commune inconnue";
  const codeInsee = properties.commune_code_insee || "N/A";

  const categoryResults = Object.keys(properties)
    .filter((key) => key.startsWith("resultat_"))
    .map((key) => {
      // Extraire le type de polluant et l'année du nom de la propriété
      const [, category, year] = key.split("_");
      return {
        category,
        year,
        result: properties[key],
      };
    })
    .sort((a, b) => b.year.localeCompare(a.year)); // Trier par année décroissante

  return (
    <div className={`${className} overflow-y-auto max-h-96`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{communeName}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Code INSEE:</span> {codeInsee}
        </p>
      </div>

      <div className="border-t border-gray-200 pt-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Résultats des analyses
        </h4>

        {categoryResults.length > 0 ? (
          <div className="space-y-2">
            {categoryResults.map((item, index) => (
              <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                <div className="flex justify-between space-x-2">
                  <span className="font-medium capitalize">
                    {formatCategoryName(item.category)}
                  </span>
                  <span className="text-gray-500">{item.year}</span>
                </div>
                <div className="mt-1 flex items-center">
                  <StatusIndicator status={item.result} />
                  <span className="ml-2 capitalize">
                    {item.result || "non disponible"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">
            Aucune donnée disponible
          </p>
        )}
      </div>
    </div>
  );
}

function StatusIndicator({ status }: { status: string }) {
  let bgColor = "bg-gray-400";

  if (status === "conforme") {
    bgColor = "bg-green-500";
  } else if (status === "non conforme") {
    bgColor = "bg-red-500";
  } else if (status === "non analysé") {
    bgColor = "bg-gray-400";
  }

  return (
    <span className={`inline-block w-3 h-3 ${bgColor} rounded-full`}></span>
  );
}
