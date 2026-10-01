"use client";

import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";
import { Input } from "./ui/input";
import { useState } from "react";
import { Command, CommandGroup, CommandItem, CommandList } from "./ui/command";
import { Building2, MapPin, Search } from "lucide-react";

import { CommandEmpty } from "cmdk";
import { X } from "lucide-react";
import { scrollIframeToFullscreen } from "@/lib/iframe-scroll";

interface IGNQueryResult {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    id: string;
    name: string;
    postcode: string;
    type: string;
    label: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

interface IGNQueryResponse {
  features: IGNQueryResult[];
}
export type FilterResult = {
  center: [number, number];
  communeInseeCode: string;
  address: string;
  postcode: string;
};

interface PollutionMapsSearchBoxProps {
  onAddressFilter: (communeFilter: FilterResult | null) => void;
  /**
   * Texte du champ, géré par le parent : il survit à l'ouverture du panneau
   * de zone (qui recouvre la barre) et est vidé au changement de territoire.
   */
  filterString: string;
  setFilterString: (value: string) => void;
}

export default function PollutionMapSearchBox({
  onAddressFilter,
  filterString,
  setFilterString,
}: PollutionMapsSearchBoxProps) {
  const [dropDownIsOpened, setDropDownOpen] = useState(false);
  const [communesList, setCommunesList] = useState<IGNQueryResult[]>([]);
  const [delayHandler, setDelayHandler] = useState<NodeJS.Timeout | null>(null);

  async function PerformSearch(filterString: string) {
    const IGNQuery =
      "https://data.geopf.fr/geocodage/search?autocomplete=1&limit=20&returntruegeometry=false";
    const URLIGN = new URL(IGNQuery);
    URLIGN.searchParams.set("q", filterString);

    try {
      const response = await fetch(URLIGN);
      const data: IGNQueryResponse = await response.json();

      if (data.features) {
        console.log("fetch data :", data.features);
        setCommunesList(data.features);
        setDropDownOpen(true);
      } else {
        setCommunesList([]);
        setDropDownOpen(false);
      }
    } catch (err) {
      console.log("fetch error :", err);
      setCommunesList([]);
      setDropDownOpen(false);
    }
  }

  async function HandleFilterChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Champ vidé à la main : comme la croix, on efface la recherche (et son
    // repère sur la carte).
    if (!e?.target?.value) {
      clearSearch();
      return;
    }

    if (delayHandler) {
      clearTimeout(delayHandler);
    }

    setFilterString(e.target.value);

    if (e.target.value?.length >= 3) {
      setDelayHandler(
        setTimeout(() => {
          PerformSearch(e.target.value);
        }, 200),
      );
    } else {
      setCommunesList([]);
    }
  }

  function handleAddressSelect(feature: IGNQueryResult) {
    setDropDownOpen(false);

    const displayText =
      feature.properties.type === "municipality"
        ? `${feature.properties.label}, ${feature.properties.postcode}`
        : feature.properties.label;

    setFilterString(displayText);
    onAddressFilter({
      center: feature.geometry.coordinates,
      communeInseeCode: feature.properties.citycode,
      address: displayText,
      postcode: feature.properties.postcode,
    });
  }

  function clearSearch() {
    setFilterString("");
    setCommunesList([]);
    setDropDownOpen(false);
    onAddressFilter(null);
  }

  return (
    <Popover open={dropDownIsOpened} onOpenChange={setDropDownOpen}>
      <PopoverAnchor asChild>
        <div className="rounded-xl bg-kaki p-1 shadow-sm md:p-2 md:pt-1.5">
          <div className="hidden px-1 pb-1.5 text-[10px] font-medium uppercase tracking-wide text-white md:block">
            Trouver la qualité de mon eau
          </div>
          <div className="relative flex items-center">
            <Search
              size={18}
              className="absolute left-3 text-kaki pointer-events-none"
            />
            <Input
              className="h-10 rounded-lg border-0 bg-white pl-10 pr-9 shadow-none focus-visible:ring-2 focus-visible:ring-white/60"
              key="TextInputCommune"
              value={filterString}
              placeholder="Votre adresse ou commune"
              onChange={HandleFilterChange}
              onFocus={() => {
                scrollIframeToFullscreen();
                if (filterString?.length >= 3) {
                  setDropDownOpen(true);
                }
              }}
              autoComplete="off"
              data-1p-ignore
            />
            {filterString && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Effacer la recherche"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </PopoverAnchor>
      <PopoverContent
        asChild={true}
        onOpenAutoFocus={(e) => e.preventDefault()}
        align="start"
        sideOffset={6}
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command className="rounded-xl border border-greylight shadow-md">
          <CommandEmpty className="px-3 py-4 text-center text-sm text-gray-500">
            Aucune adresse trouvée.
          </CommandEmpty>
          <CommandList className="max-h-[320px] overflow-auto">
            <CommandGroup key="CommuneList" className="p-1.5">
              {communesList.map((feature) => {
                const isCommune = feature.properties.type === "municipality";
                const Icon = isCommune ? Building2 : MapPin;
                // context : "92, Hauts-de-Seine, Île-de-France"
                const departement =
                  feature.properties.context?.split(", ")[1] ?? null;
                const details = [
                  isCommune
                    ? `Commune · ${feature.properties.postcode}`
                    : `${feature.properties.postcode} ${feature.properties.city}`,
                  departement,
                ]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <CommandItem
                    className="flex items-center gap-3 rounded-lg px-2 py-2 data-[selected=true]:bg-kaki/10"
                    key={feature.properties.id}
                    value={feature.properties.id}
                    onSelect={() => handleAddressSelect(feature)}
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-kaki/10 text-kaki">
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-gray-900">
                        <HilightLabel
                          originalText={feature.properties.name}
                          textToHilight={filterString}
                        />
                      </span>
                      <span className="block truncate text-xs text-gray-500">
                        {details}
                      </span>
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function HilightLabel(props: { textToHilight: string; originalText: string }) {
  if (!props?.originalText || !props?.textToHilight) {
    return <>{props?.originalText}</>;
  }
  const text: string = props.originalText;
  const subString = props?.textToHilight
    ? props.textToHilight?.toLowerCase()
    : "";
  const startIdx = text.toLowerCase().indexOf(subString);
  if (startIdx == -1) {
    return <>{text}</>;
  }

  const subStringBefore = text.substring(0, startIdx);
  const higlightedSubString = text.substring(
    startIdx,
    startIdx + subString?.length,
  );
  const subStringAfter =
    higlightedSubString?.length < text.length
      ? text.substring(startIdx + subString?.length, text.length)
      : "";

  return (
    <>
      {subStringBefore}
      <strong className="font-semibold">{higlightedSubString}</strong>
      {subStringAfter}
    </>
  );
}
