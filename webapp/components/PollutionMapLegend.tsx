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
          <div key={item.color + item.label} className="flex items-start gap-3">
            <div
              className="w-6 h-4 flex-shrink-0 mt-1"
              style={{
                backgroundColor: item.color || undefined,
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
