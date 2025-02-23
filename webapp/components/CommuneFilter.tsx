"use client";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { Feature } from "maplibre-gl";
import { Dispatch, SetStateAction, useState } from "react";

export default function CommuneFilter() {
  const [filterString, setFilterString] = useState("");
  const [delayHandler, setDelayHandler] = useState<NodeJS.Timeout | null>(null);
  const [communesList, setCommunesList] = useState([]);

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

    setDelayHandler(
      setTimeout(() => {
        PerformSearch(e.target.value, setCommunesList);
      }, 200)
    );
  }

  function SelectCommuneChanged(value: string | null): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div>
      <Combobox value={filterString} onChange={SelectCommuneChanged}>
        <ComboboxInput
          className="bg-white-500 border-blue-500"
          aria-label="Communes"
          displayValue={(c: Feature) => c?.properties?.toponym}
          onChange={HandleFilterChange}
        />
        <ComboboxOptions anchor="bottom" className="border empty:invisible">
          {communesList.map((C: Feature) => (
            <ComboboxOption
              key={C.properties.extrafields.cleabs}
              value={C}
              className="data-[focus]:bg-blue-100 bg-white"
            >
              {C?.properties.toponym}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
}

async function PerformSearch(
  FilterString: string,
  SetCommunesListCallback: Dispatch<SetStateAction<never[]>>
) {
  const data = await fetch("api/CommuneFilter?q=" + FilterString).then(
    (response) => {
      return response.json();
    }
  );
  if (data?.features) {
    SetCommunesListCallback(data?.features);
  } else {
    SetCommunesListCallback([]);
  }
}
