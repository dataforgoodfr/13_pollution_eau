"use client";

import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";
import { Input } from "./ui/input";
import { useState } from "react";
import { Command, CommandGroup, CommandItem, CommandList } from "./ui/command";
import { MapPin } from "lucide-react";

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
  zoom: number;
  communeInseeCode: string;
  address: string;
};

interface PollutionMapsSearchBoxProps {
  onAddressFilter: (communeFilter: FilterResult | null) => void;
  communeInseeCode: string | null;
}

export default function PollutionMapSearchBox({
  onAddressFilter,
  //communeInseeCode,
}: PollutionMapsSearchBoxProps) {
  const [filterString, setFilterString] = useState("");
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
    if (!e?.target?.value) {
      setFilterString("");
      setCommunesList([]);
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
      zoom: 10,
      communeInseeCode: feature.properties.citycode,
      address: displayText,
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
        <div className="flex items-center relative">
          <MapPin
            size={16}
            className="absolute left-3 text-gray-400 pointer-events-none"
          />
          <div className="">
            <Input
              className="max-w-fit min-w-[220px] outline-1 pl-8 pr-8 bg-white rounded-2xl text-sm border-gray-500"
              key="TextInputCommune"
              value={filterString}
              placeholder="Saisir adresse ou commune"
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
          </div>
          {filterString && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </PopoverAnchor>
      <PopoverContent
        asChild={true}
        onOpenAutoFocus={(e) => e.preventDefault()}
        align="start"
        sideOffset={5}
        className="p-0"
      >
        <Command className="rounded-lg border shadow-md">
          <CommandEmpty className="py-2 text-center text-sm text-muted-foreground">
            Aucune adresse trouvée.
          </CommandEmpty>
          <CommandList className="max-h-[300px] overflow-auto">
            <CommandGroup key="CommuneList">
              {communesList.map((feature) => {
                return (
                  <CommandItem
                    className="flex items-center py-2"
                    key={feature.properties.id}
                    value={feature.properties.id}
                    onSelect={() => handleAddressSelect(feature)}
                  >
                    <div className="flex items-center w-full">
                      <div className="flex-grow">
                        {feature.properties.type === "municipality" ? (
                          <HilightLabel
                            originalText={`${feature.properties.label}, ${feature.properties.postcode}`}
                            textToHilight={filterString}
                          />
                        ) : (
                          <HilightLabel
                            originalText={feature.properties.label}
                            textToHilight={filterString}
                          />
                        )}
                      </div>
                    </div>
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
    <p className="text-sm">
      {subStringBefore}
      <mark className="font-medium bg-yellow-200 px-0.5 rounded-sm">
        {higlightedSubString}
      </mark>
      {subStringAfter}
    </p>
  );
}
