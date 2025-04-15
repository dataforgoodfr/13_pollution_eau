"use client";

import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";
import { Input } from "./ui/input";
import { useState } from "react";
import { Command, CommandGroup, CommandItem, CommandList } from "./ui/command";
import { MapPin } from "lucide-react";

import { CommandEmpty } from "cmdk";
import { Building2, Home, X } from "lucide-react";

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
  onAddressFilter: onCommuneFilter,
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
    setFilterString(feature.properties.label);
    onCommuneFilter({
      center: feature.geometry.coordinates,
      zoom: 10,
      communeInseeCode: feature.properties.citycode,
      address: feature.properties.label,
    });
  }

  function clearSearch() {
    setFilterString("");
    setCommunesList([]);
    setDropDownOpen(false);
    onCommuneFilter(null);
  }

  return (
    <div className="flex items-center ml-6 p-2">
      <div>
        <div className="">
          <Popover open={dropDownIsOpened} onOpenChange={setDropDownOpen}>
            <PopoverAnchor asChild>
              <div className="flex items-center relative">
                <MapPin
                  size={16}
                  className="absolute left-3 text-gray-400 pointer-events-none"
                />
                <div className="mx-1 ">
                  <Input
                    className="max-w-fit min-w-[220px] outline-1 outline-blue-500 pl-7 bg-white rounded-2xl"
                    key="TextInputCommune"
                    value={filterString}
                    placeholder="Saisir votre adresse ou commune"
                    onChange={HandleFilterChange}
                    onFocus={() => {
                      if (filterString?.length >= 3) {
                        setDropDownOpen(true);
                      }
                    }}
                    autoComplete="off"
                  />
                </div>
              </div>
            </PopoverAnchor>
            <PopoverContent
              asChild={true}
              onOpenAutoFocus={(e) => e.preventDefault()}
              align="start"
              sideOffset={5}
            >
              <Command>
                <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                  Aucune adresse trouvée.
                </CommandEmpty>
                <CommandList>
                  <CommandGroup key="CommuneList">
                    {communesList.map((feature) => {
                      let featureType = <Home />;

                      switch (feature.properties.type) {
                        case "street":
                        case "housenumber":
                          featureType = <Home />;
                          break;
                        default:
                          featureType = <Building2 />;
                      }
                      return (
                        <CommandItem
                          className="flex grow"
                          key={feature.properties.id}
                          value={feature.properties.id}
                          onSelect={() => handleAddressSelect(feature)}
                        >
                          <div className="flex grow">
                            <div className="size-5">{featureType}</div>
                            <div className="grow gap-2 fit">
                              <HilightLabel
                                originalText={feature.properties.label}
                                textToHilight={filterString}
                              />
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
          {filterString && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
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
    <p>
      {subStringBefore}
      <mark className="font-normal bg-yellow-400">{higlightedSubString}</mark>
      {subStringAfter}
    </p>
  );
}
