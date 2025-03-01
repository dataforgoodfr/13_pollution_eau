"use client";
import {
  Dispatch,
  Fragment,
  SetStateAction,
  use,
  useEffect,
  useRef,
  useState,
} from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Feature } from "maplibre-gl";
import { Check, ChevronsUpDown } from "lucide-react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { PopoverAnchor, PopoverPortal } from "@radix-ui/react-popover";
import { Container } from "postcss";
import Container_, { ContainerWithChildren } from "postcss/lib/container";
import { start } from "node:repl";

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

export default function CommuneFilter() {
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
                <CommandItem key={x?.properties?.extrafields.cleabs}>
                  <HilightLabel
                    value={
                      x?.properties?.toponym +
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
