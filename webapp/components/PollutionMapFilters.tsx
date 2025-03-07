"use client";

import { useState } from "react";
import { availableCategories } from "@/lib/polluants";

type PollutionMapFiltersProps = {
  year: string;
  setYear: (year: string) => void;
  categoryType: string;
  setCategoryType: (type: string) => void;
};

export default function PollutionMapFilters({
  year,
  setYear,
  categoryType,
  setCategoryType,
}: PollutionMapFiltersProps) {
  const availableYears = ["2024", "2023", "2022", "2021", "2020"];

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
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="block w-32 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          {availableYears.map((y) => (
            <option key={y} value={y}>
              {y}
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
