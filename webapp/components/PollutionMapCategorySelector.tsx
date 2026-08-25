"use client";

import { cn } from "@/lib/utils";
import { availableCategories, ICategory } from "@/lib/polluants";
import {
  LayoutGrid,
  Droplets,
  Sprout,
  Leaf,
  Factory,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";

type PollutionMapCategorySelectorProps = {
  period: string;
  setPeriod: (period: string) => void;
  category: string;
  setCategory: (category: string) => void;
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  tous: LayoutGrid,
  pfas: Droplets,
  pesticide: Sprout,
  nitrate: Leaf,
  cvm: FlaskConical,
  sub_indus_perchlorate: Factory,
};

const availablePeriods = [
  { value: "dernier_prel", label: "Dernière analyse" },
  { value: "bilan_annuel_2026", label: "Bilan 2026" },
  { value: "bilan_annuel_2025", label: "Bilan 2025" },
  { value: "bilan_annuel_2024", label: "Bilan 2024" },
  { value: "bilan_annuel_2023", label: "Bilan 2023" },
  { value: "bilan_annuel_2022", label: "Bilan 2022" },
  { value: "bilan_annuel_2021", label: "Bilan 2021" },
  { value: "bilan_annuel_2020", label: "Bilan 2020" },
];

function findTopLevelCategory(
  selectedId: string,
  categories: ICategory[],
): ICategory | undefined {
  return categories.find(
    (item) =>
      item.id === selectedId ||
      item.enfants?.some((child) => child.id === selectedId),
  );
}

export default function PollutionMapCategorySelector({
  period,
  setPeriod,
  category,
  setCategory,
}: PollutionMapCategorySelectorProps) {
  const selectedTopLevel = findTopLevelCategory(category, availableCategories);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Polluant
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {availableCategories.map((item) => {
            const Icon = CATEGORY_ICONS[item.id] || FlaskConical;
            const isActive = selectedTopLevel?.id === item.id;
            return (
              <button
                key={item.id}
                disabled={item.disable}
                onClick={() => setCategory(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl border p-2 text-center transition-colors",
                  isActive
                    ? "bg-custom-drom text-white border-custom-drom"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400",
                  item.disable && "opacity-40 cursor-not-allowed",
                )}
              >
                <Icon size={20} />
                <span className="text-[11px] leading-tight">
                  {item.nomAffichage}
                </span>
              </button>
            );
          })}
        </div>

        {selectedTopLevel?.enfants && selectedTopLevel.enfants.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedTopLevel.enfants.map((child) => {
              const isActive = category === child.id;
              return (
                <button
                  key={child.id}
                  disabled={child.disable}
                  onClick={() => setCategory(child.id)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    isActive
                      ? "bg-custom-drom text-white border-custom-drom"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-400",
                    child.disable && "opacity-40 cursor-not-allowed",
                  )}
                >
                  {child.nomAffichage}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Période
        </h3>
        <div className="flex flex-wrap gap-2">
          {availablePeriods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                period === p.value
                  ? "bg-custom-drom text-white border-custom-drom"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
