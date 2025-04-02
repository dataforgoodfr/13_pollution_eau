"use client";

import { availableCategories } from "@/lib/polluants";

type PollutionMapFiltersProps = {
  period: string;
  setPeriod: (year: string) => void;
  categoryType: string;
  setCategoryType: (type: string) => void;
};

export default function PollutionMapFilters({
  period,
  setPeriod,
  categoryType,
  setCategoryType,
}: PollutionMapFiltersProps) {
  const availablePeriods = [
    { value: "dernier_prel", label: "Dernier relevé" },
    { value: "bilan_annuel_2024", label: "Bilan 2024" },
    { value: "bilan_annuel_2023", label: "Bilan 2023" },
    { value: "bilan_annuel_2022", label: "Bilan 2022" },
    { value: "bilan_annuel_2021", label: "Bilan 2021" },
    { value: "bilan_annuel_2020", label: "Bilan 2020" },
  ];

  return (
    <div className="flex items-center space-x-6">
      <div>
        <label
          htmlFor="year-select"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Année
        </label>
        <select
          id="year-select"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="block w-32 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          {availablePeriods.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="category-select"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Type de polluant
        </label>
        <select
          id="category-select"
          value={categoryType}
          onChange={(e) => setCategoryType(e.target.value)}
          className="block w-64 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          {availableCategories.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
