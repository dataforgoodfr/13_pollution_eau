"use client";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { CalendarIcon, BlendingModeIcon } from "@radix-ui/react-icons";
import { availableCategories } from "@/lib/polluants";

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

  return (
    <div className="flex space-x-6">
      <div className="shadow-sm">
        <Select value={period} onValueChange={(y) => setPeriod(y)}>
          <SelectTrigger
            className="SelectTrigger bg-white rounded-2xl"
            aria-label="year-select"
          >
            <CalendarIcon />
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
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger
            className="SelectTrigger bg-white rounded-2xl"
            aria-label="category-select"
          >
            <BlendingModeIcon />
            <div className="block mx-1">
              <SelectValue placeholder="Polluant" className="mx-1" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {availableCategories.map((p) => (
              <SelectItem key={p.id} value={p.id} disabled={p.disabled}>
                {p.label.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
