"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { AnalyseDate } from "@/app/api/udi-analyses/dates/route";

type AnalysesDatePickerProps = {
  cdreseau: string;
  /** Date sélectionnée (YYYY-MM-DD), "" pour toutes les dates. */
  value: string;
  onChange: (date: string) => void;
  formatCategorie: (categorie: string) => string;
};

const ALL_DATES = "__all__";

function formatDateFr(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function monthLabel(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

// Recherche par sous-chaîne plutôt que le filtre flou par défaut de cmdk, qui
// ferait correspondre "2024" à presque toutes les dates.
function filterDates(value: string, search: string, keywords?: string[]) {
  const haystack = [value, ...(keywords ?? [])].join(" ").toLowerCase();
  return haystack.includes(search.trim().toLowerCase()) ? 1 : 0;
}

/**
 * Filtre de date de la modale d'analyses : liste les seules dates ayant des
 * résultats, groupées par année, avec une recherche ("2024", "03/2024",
 * "mars 2024"…). Les dates sont chargées à part (/api/udi-analyses/dates)
 * pour ne pas alourdir la requête paginée de la liste.
 */
export default function AnalysesDatePicker({
  cdreseau,
  value,
  onChange,
  formatCategorie,
}: AnalysesDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [dates, setDates] = useState<AnalyseDate[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setDates(null);
    setError(false);
    fetch(`/api/udi-analyses/dates?cdreseau=${encodeURIComponent(cdreseau)}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => setDates(data.dates))
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error("Failed to fetch analyses dates:", err);
        setError(true);
      });

    return () => controller.abort();
  }, [cdreseau]);

  const datesByYear = useMemo(() => {
    const groups = new Map<string, AnalyseDate[]>();
    for (const item of dates ?? []) {
      const year = item.date.slice(0, 4);
      groups.set(year, [...(groups.get(year) ?? []), item]);
    }
    return [...groups.entries()];
  }, [dates]);

  const select = (date: string) => {
    onChange(date);
    setOpen(false);
  };

  return (
    // `modal` : sans lui, le verrou de scroll de la modale parente empêche de
    // faire défiler la liste à la molette.
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger
        className={cn(
          "flex h-9 w-[180px] items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring",
          !value && "text-muted-foreground",
        )}
      >
        {value ? formatDateFr(value) : "Toutes les dates"}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </PopoverTrigger>
      <PopoverContent align="start" className="z-[80] w-[300px] p-0">
        <Command filter={filterDates}>
          <CommandInput placeholder="Rechercher (2024, 03/2024…)" />
          <CommandList>
            <CommandEmpty>
              {dates === null && !error ? "Chargement…" : "Aucune date."}
            </CommandEmpty>
            {(dates !== null || error) && (
              <CommandGroup>
                <CommandItem
                  value={ALL_DATES}
                  keywords={["toutes les dates"]}
                  onSelect={() => select("")}
                >
                  <Check className={cn("opacity-0", !value && "opacity-100")} />
                  Toutes les dates
                </CommandItem>
              </CommandGroup>
            )}
            {/* CommandEmpty est masqué dès qu'un item existe : on affiche
                l'erreur ici pour qu'elle reste visible à côté de la
                réinitialisation. */}
            {error && (
              <p className="px-2 py-3 text-center text-sm text-gray-500">
                Impossible de charger les dates.
              </p>
            )}
            {datesByYear.map(([year, items]) => (
              <CommandGroup key={year} heading={year}>
                {items.map((item) => (
                  <CommandItem
                    key={item.date}
                    value={item.date}
                    keywords={[formatDateFr(item.date), monthLabel(item.date)]}
                    onSelect={() => select(item.date)}
                  >
                    <Check
                      className={cn(
                        "opacity-0",
                        value === item.date && "opacity-100",
                      )}
                    />
                    <div className="min-w-0">
                      <div>
                        {formatDateFr(item.date)}
                        <span className="ml-1.5 text-xs text-gray-500">
                          {item.nbResultats.toLocaleString("fr-FR")} résultat
                          {item.nbResultats > 1 ? "s" : ""}
                        </span>
                      </div>
                      {item.categories.length > 0 && (
                        <div className="truncate text-xs text-gray-500">
                          {item.categories.map(formatCategorie).join(", ")}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
