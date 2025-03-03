"use client";
import { Dispatch, Fragment, SetStateAction, useState } from "react";
import { Popover, PopoverContent } from "./ui/popover";
import { Command, CommandGroup, CommandItem, CommandList } from "./ui/command";
import { Feature } from "maplibre-gl";
import { Input } from "./ui/input";
import { PopoverAnchor, PopoverPortal } from "@radix-ui/react-popover";

export interface CommuneType {
  nom: string;
  CP: string;
  _geopoint: string;
  Centroid: Centroid;
  INSEE: string;
}

export interface Centroid {
  Lon: number;
  Lat: number;
}

export interface CommuneFilterParams {
  onCommuneSelected: (C: Feature) => void;
}
export default function CommuneFilter(props: CommuneFilterParams) {
  const [filterString, setFilterString] = useState("");
  const [delayHandler, setDelayHandler] = useState<NodeJS.Timeout | null>(null);
  const [communesList, setCommunesList] = useState([]);
  const [DropDownIsOpened, setDropDownOpen] = useState(false);
  const [selectedCommune, setSelectedCommune] = useState<Feature | null>(null);

  async function PerformSearch(
    FilterString: string,
    SetCommunesListCallback: Dispatch<SetStateAction<never[]>>,
  ) {
    const data = await fetch("api/CommuneFilter?q=" + FilterString).then(
      (response) => {
        return response.json();
      },
    );
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
    <Popover open={DropDownIsOpened} onOpenChange={setDropDownOpen}>
      <PopoverAnchor>
        <Input
          key="TextInputCommune"
          value={filterString}
          placeholder="Saisir le nom de votre commune"
          onChange={HandleFilterChange}
          className="w-[300px] justify-between bg-white"
        />
      </PopoverAnchor>
      <PopoverContent>
        <Command>
          <CommandList>
            <CommandGroup key="CommuneList">
              {communesList?.map((x: Feature) => (
                <CommandItem
                  key={x?.properties?.id}
                  onSelect={() => {
                    setDropDownOpen(false);
                    props?.onCommuneSelected(x);
                  }}
                >
                  <HilightLabel
                    value={
                      x?.properties?.name + " (" + x?.properties?.postcode + ")"
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
  );
}

function HilightLabel(props) {
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
      <p className=" inline-block p-0">{S1}</p>
      <p className=" inline-block bg-yellow-400 p-0">{S2}</p>
      {S3}
    </Fragment>
  );
}
