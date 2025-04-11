import { getCategoryById } from "@/lib/polluants";
import { X } from "lucide-react";

interface PollutionMapLegendProps {
  onClose: () => void;
  category: string;
}

export default function PollutionMapLegend({
  onClose,
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md transform transition-all">
      <style jsx>{`
        .slashed-background {
          background-image: linear-gradient(
            135deg,
            transparent 46%,
            #9ca3af 46%,
            #9ca3af 54%,
            transparent 54%
          );
          background-size: 8px 8px;
          border: 1px solid #9ca3af;
        }
      `}</style>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
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

      <div className="space-y-3">
        {legendItems.map((item) => (
          <div key={item.color} className="flex items-start gap-3">
            <div
              className={`w-6 h-4 flex-shrink-0 mt-1 ${item.color === "hachuré" ? "slashed-background" : ""}`}
              style={{
                backgroundColor:
                  item.color === "hachuré"
                    ? undefined
                    : item.color || undefined,
              }}
            ></div>
            <span className="text-gray-900">{item.label}</span>
          </div>
        ))}
      </div>

      <p className="text-gray-500 mt-4">
        Lorem ipsum dolor sit amet consectetur. Eget porta mauris mattis
        venenatis.
      </p>
    </div>
  );
}
