"use client";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { FlaskConical, CalendarDays } from "lucide-react";
import { availableCategories } from "@/lib/polluants";
import clsx from "clsx";

type PollutionMapFiltersProps = {
  period: string;
  setPeriod: (year: string) => void;
  category: string;
  setCategory: (type: string) => void;
};

export default function PollutionMapFilters({
  period,
  setPeriod,
  category,
  setCategory,
}: PollutionMapFiltersProps) {
  const availablePeriods = [
    { value: "dernier_prel", label: "Dernier relevé" },
    { value: "bilan_annuel_2024", label: "Bilan 2024" },
    { value: "bilan_annuel_2023", label: "Bilan 2023" },
    { value: "bilan_annuel_2022", label: "Bilan 2022" },
    { value: "bilan_annuel_2021", label: "Bilan 2021" },
    { value: "bilan_annuel_2020", label: "Bilan 2020" },
  ];

  const renderTreeItems = (
    items: typeof availableCategories,
    hierarchie = 1,
    parentName = "",
  ) => {
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
        ? parentName + "_" + item.nom_affichage
        : item.nom_affichage;

      return (
        <div key={key}>
          <SelectItem
            key={key}
            value={item.nom_affichage.toLowerCase()}
            disabled={item.disable}
            className={cln}
          >
            {item.nom_affichage}
          </SelectItem>
          {item.enfants && renderTreeItems(item.enfants, hierarchie + 1, key)}
        </div>
      );
    });
  };
  const onValueChange = (v: string) => {
    setCategory(v);
  };

  return (
    <div className="flex space-x-6 p-2">
      <div className="shadow-sm">
        <Select value={period} onValueChange={(y) => setPeriod(y)}>
          <SelectTrigger
            className="SelectTrigger bg-white rounded-2xl"
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
      </div>

      <div className="shadow-sm">
        <Select value={category} onValueChange={onValueChange}>
          <SelectTrigger
            className={clsx("bg-white rounded-2xl")}
            aria-label="category-select"
          >
            <FlaskConical size={16} className="text-gray-400" />
            <div className="block mx-1">
              <SelectValue placeholder="Polluant" className="mx-1" />
            </div>
          </SelectTrigger>
          <SelectContent>{renderTreeItems(availableCategories)}</SelectContent>
        </Select>
      </div>
    </div>
  );
}
