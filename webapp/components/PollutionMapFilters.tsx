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
    <div className="flex  space-x-6">
      <div className="shadow-sm">
        <Select>
          <SelectTrigger
            className="SelectTrigger bg-white rounded-2xl"
            aria-label="year-select"
          >
            <CalendarIcon />
            <div className="block mx-1">
              <SelectValue placeholder="Année" />
            </div>
            <SelectContent>
              {availableYears.map((y) => (
                <SelectItem className="items-left" key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectTrigger>
        </Select>
      </div>

      <div className="shadow-sm">
        <Select>
          <SelectTrigger
            className="SelectTrigger bg-white rounded-2xl"
            aria-label="category-select"
          >
            <BlendingModeIcon />
            <div className="block mx-1">
              <SelectValue placeholder="Polluant" className="mx-1" />
            </div>
            <SelectContent>
              {availableCategories.map((p) => (
                <SelectItem key={p.id} value={p.id} disabled={p.disabled}>
                  {p.label.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectTrigger>
        </Select>
      </div>
    </div>
  );
}
