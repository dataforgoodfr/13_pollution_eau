"use client";

import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";
import { Input } from "./ui/input";
import { useState } from "react";
import { Command, CommandGroup, CommandItem, CommandList } from "./ui/command";
import { CommandEmpty } from "cmdk";

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
export type CommuneFilterResult = {
  center: [number, number];
  zoom: number;
  communeInseeCode: string;
};

interface PollutionMapsSearchBoxProps {
  onCommuneFilter: (communeFilter: CommuneFilterResult) => void;
  communeInseeCode: string | null;
}

export default function PollutionMapSearchBox({
  onCommuneFilter,
  //communeInseeCode,
}: PollutionMapsSearchBoxProps) {
  const [filterString, setFilterString] = useState("");
  const [dropDownIsOpened, setDropDownOpen] = useState(false);
  const [communesList, setCommunesList] = useState<IGNQueryResult[]>([]);
  const [delayHandler, setDelayHandler] = useState<NodeJS.Timeout | null>(null);

  async function PerformSearch(filterString: string) {
    const IGNQuery =
      "https://data.geopf.fr/geocodage/search?autocomplete=1&limit=10&returntruegeometry=false&type=municipality&category=commune";
    const URLIGN = new URL(IGNQuery);
    URLIGN.searchParams.set("q", filterString);

    try {
      const response = await fetch(URLIGN);
      const data: IGNQueryResponse = await response.json();

      if (data.features) {
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

  function handleCommuneSelect(feature: IGNQueryResult) {
    setDropDownOpen(false);
    setFilterString(
      feature.properties.name + " (" + feature.properties.postcode + ")",
    );
    onCommuneFilter({
      center: feature.geometry.coordinates,
      zoom: 10,
      communeInseeCode: feature.properties.id,
    });
  }

  return (
    <div className="flex items-center space-x-6">
      <div>
        <label
          htmlFor="commune-select"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Commune
        </label>
        <Popover open={dropDownIsOpened} onOpenChange={setDropDownOpen}>
          <PopoverAnchor asChild>
            <Input
              className="float max-w-fit rounded-sm outline-1 outline-blue-500"
              key="TextInputCommune"
              value={filterString}
              placeholder="Saisir le nom de votre commune"
              onChange={HandleFilterChange}
            />
          </PopoverAnchor>
          <PopoverContent
            asChild={true}
            onOpenAutoFocus={(e) => e.preventDefault()}
            align="start"
            sideOffset={5}
          >
            <Command>
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                Aucune commune trouvée.
              </CommandEmpty>
              <CommandList>
                <CommandGroup key="CommuneList">
                  {communesList.map((CommuneFeature) => (
                    <CommandItem
                      key={CommuneFeature.properties.id}
                      onSelect={() => handleCommuneSelect(CommuneFeature)}
                    >
                      <HilightLabel
                        originalText={
                          CommuneFeature.properties.name +
                          " (" +
                          CommuneFeature.properties.postcode +
                          ")"
                        }
                        textToHilight={filterString}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
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
