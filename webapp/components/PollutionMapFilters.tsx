"use client";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { memo } from "react";
import { FlaskConical, CalendarDays, Diamond } from "lucide-react";
import { availableCategories, ICategory } from "@/lib/polluants";

type PollutionMapFiltersProps = {
  period: string;
  setPeriod: (year: string) => void;
  category: string;
  setCategory: (type: string) => void;
  displayMode: "communes" | "udis";
  setDisplayMode: (mode: "communes" | "udis") => void;
};

type CategoryItemsProps = {
  items: ICategory[];
  hierarchie?: number;
  parentName?: string;
};

const CategoryItems = memo(
  ({ items, hierarchie = 1, parentName = "" }: CategoryItemsProps) => {
    let cln = "";
    if (hierarchie == 1) {
      cln = "pl-6";
    } else if (hierarchie == 2) {
      cln = "pl-10";
    } else {
      cln = "pl-14";
    }
    return items.map((item) => {
      const key = parentName
        ? parentName + "_" + item.nomAffichage
        : item.nomAffichage;

      return (
        <div key={key}>
          <SelectItem
            key={key}
            value={item.id}
            disabled={item.disable}
            className={cln}
          >
            {item.nomAffichage}
          </SelectItem>
          {item.enfants && (
            <CategoryItems
              items={item.enfants}
              hierarchie={hierarchie + 1}
              parentName={key}
            />
          )}
        </div>
      );
    });
  },
);
CategoryItems.displayName = "CategoryItems";

export default function PollutionMapFilters({
  period,
  setPeriod,
  category,
  setCategory,
  displayMode,
  setDisplayMode,
}: PollutionMapFiltersProps) {
  const availablePeriods = [
    { value: "dernier_prel", label: "Dernière analyse" },
    { value: "bilan_annuel_2025", label: "Bilan 2025" },
    { value: "bilan_annuel_2024", label: "Bilan 2024" },
    { value: "bilan_annuel_2023", label: "Bilan 2023" },
    { value: "bilan_annuel_2022", label: "Bilan 2022" },
    { value: "bilan_annuel_2021", label: "Bilan 2021" },
    { value: "bilan_annuel_2020", label: "Bilan 2020" },
  ];

  const availableDisplayModes = [
    { value: "udis" as const, label: "Réseaux d'eau" },
    { value: "communes" as const, label: "Communes" },
  ];

  return (
    <>
      <Select value={period} onValueChange={(y) => setPeriod(y)}>
        <SelectTrigger
          className="SelectTrigger bg-white rounded-2xl border-gray-500"
          aria-label="year-select"
        >
          <CalendarDays size={16} className="text-gray-400" />
          <div className="block mx-1">
            <SelectValue placeholder="Année" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {availablePeriods.map((p) => (
            <SelectItem className="items-left" key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger
          className="bg-white rounded-2xl border-gray-500"
          aria-label="category-select"
        >
          <FlaskConical size={16} className="text-gray-400" />
          <div className="block mx-1">
            <SelectValue placeholder="Polluant" className="mx-1" />
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <CategoryItems items={availableCategories} />
        </SelectContent>
      </Select>

      <Select value={displayMode} onValueChange={setDisplayMode}>
        <SelectTrigger
          className="bg-white rounded-2xl border-gray-500"
          aria-label="display-mode-select"
        >
          <Diamond size={16} className="text-gray-400" />
          <div className="block mx-1">
            <SelectValue placeholder="Affichage" className="mx-1" />
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {availableDisplayModes.map((mode) => (
            <SelectItem key={mode.value} value={mode.value}>
              {mode.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
