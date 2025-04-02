"use client";

import { formatCategoryName } from "@/lib/polluants";

type PollutionMapDetailPanelProps = {
  data: Record<string, string | number | null> | null;
  onClose: () => void;
  className?: string;
};

export default function PollutionMapDetailPanel({
  data,
  onClose,
  className = "",
}: PollutionMapDetailPanelProps) {
  if (!data) {
    return null;
  }

  const communeName = data.commune_nom || "Commune inconnue";
  const codeInsee = data.commune_code_insee || "N/A";

  // Filter out null/empty properties
  const nonEmptyProperties = Object.entries(data).filter(([_, value]) => {
    return value !== null && value !== "" && value !== 0;
  });

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
          Données disponibles
        </h4>

        {nonEmptyProperties.length > 0 ? (
          <div className="space-y-2">
            {nonEmptyProperties.map(([key, value], index) => (
              <div key={index} className="text-sm">
                <span className="font-medium">{key}:</span> {value.toString()}
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
