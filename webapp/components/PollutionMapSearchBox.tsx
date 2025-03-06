"use client";

import { Feature } from "maplibre-gl";
import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";
import { Input } from "./ui/input";
import { Dispatch, Fragment, SetStateAction, useState } from "react";
import { Command, CommandGroup, CommandItem, CommandList } from "./ui/command";

interface PollutionMapsSearchBoxProps {
  onSelect: (SelectedCommuneInfo: Feature) => void;
  selectedCommune: Feature | null;
}

export default function PollutionMapSearchBox(
  props: PollutionMapsSearchBoxProps,
) {
  const [filterString, setFilterString] = useState("");
  const [dropDownIsOpened, setDropDownOpen] = useState(false);
  const [communesList, setCommunesList] = useState([]);
  const [delayHandler, setDelayHandler] = useState<NodeJS.Timeout | null>(null);

  async function PerformSearch(
    FilterString: string,
    SetCommunesListCallback: Dispatch<SetStateAction<never[]>>,
  ) {
    const IGNQuery =
      "https://data.geopf.fr/geocodage/search?autocomplete=1&limit=10&returntruegeometry=false&type=municipality&category=commune";
    const URLIGN = new URL(IGNQuery);
    URLIGN.searchParams.set("q", filterString);
    const data = await fetch(URLIGN)
      .then((response) => {
        const data = response.clone();
        //console.log("body",response)
        return data.json();
      })
      .catch((err) => {
        console.log("fetch error :", err);
      });

    if (data?.features) {
      SetCommunesListCallback(data?.features);
      setDropDownOpen(true);
    } else {
      SetCommunesListCallback([]);
      setDropDownOpen(false);
    }
  }

  async function HandleFilterChange(e: React.ChangeEvent<HTMLInputElement>) {
    console.log("HandleFilter", e);
    if (!e?.target?.value) {
      setFilterString("");
      setCommunesList([]);
      return;
    }

    if (delayHandler) {
      clearTimeout(delayHandler);
    }

    setFilterString(e.target.value);

    setDelayHandler(
      setTimeout(() => {
        PerformSearch(e.target.value, setCommunesList);
      }, 200),
    );
  }

  //console.log("Commuunes ", communesList, DropDownIsOpened);

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
          <PopoverAnchor>
            <Input
              className="float max-w-fit rounded-sm outline-1 outline-blue-500"
              key="TextInputCommune"
              value={filterString}
              placeholder="Saisir le nom de votre commune"
              onChange={HandleFilterChange}
              autoFocus={true}
            />
          </PopoverAnchor>
          <PopoverContent className="" asChild={true}>
            <Command>
              <CommandList>
                <CommandGroup key="CommuneList">
                  {communesList?.map((x: Feature) => (
                    <CommandItem
                      key={x?.properties?.id}
                      onSelect={() => {
                        setDropDownOpen(false);
                        props?.onSelect(x);
                      }}
                    >
                      <HilightLabel
                        value={
                          x?.properties?.name +
                          " (" +
                          x?.properties?.postcode +
                          ")"
                        }
                        HilightText={filterString}
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

function HilightLabel(props:{HilightText:string, value:string}) {
  if (!props?.value || !props?.HilightText) {
    return <span>props?.value</span>;
  }
  const text: string = props.value;
  const subString = props?.HilightText
    ? props.HilightText?.toLowerCase().substring(0, text.length)
    : "";
  const startIdx = text.toLowerCase().indexOf(subString);
  if (startIdx == -1) {
    return <Fragment>{text}</Fragment>;
  }

  // TODO take care of -
  const S1 = text.substring(0, startIdx);
  const S2 = text.substring(startIdx, startIdx + subString?.length);
  const S3 =
    S2?.length < text.length
      ? text.substring(startIdx + subString?.length, text.length)
      : "";

  return (
    <Fragment>
      <p>
        {S1}
        <em className=" font-normal bg-yellow-400">{S2}</em>
        {S3}
      </p>
    </Fragment>
  );
}
