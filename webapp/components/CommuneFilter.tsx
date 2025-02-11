"use client"
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { Feature } from "maplibre-gl";
import { Dispatch, SetStateAction, useState } from "react";

export default function CommuneFilter() 
{
  const [FilterString,SetFilterString]=useState('')
  const [DelayHandler, SetDelayHandler]=useState<NodeJS.Timeout|null>(null )
  const [CommunesList, SetCommunesList]=useState([])

  async function  HandleFilterChange(e:React.ChangeEvent<HTMLInputElement>)
  {
    if (!e?.target?.value)
    {
      SetFilterString('')
      SetCommunesList([])
      return
    }

    if (DelayHandler)
    {
      clearTimeout(DelayHandler)
    }

    SetFilterString(e.target.value);
  
    SetDelayHandler(setTimeout(()=>{
        PerformSearch(e.target.value, SetCommunesList)
      },200))
    
  }

  function SelectCommuneChanged(value: string | null): void {
    throw new Error("Function not implemented.");
  }

  return <div>
    <Combobox value={FilterString} onChange={SelectCommuneChanged} >
      <ComboboxInput className="bg-white-500 border-blue-500"
        aria-label="Communes"
        displayValue={(c:Feature) => c?.properties?.toponym}
        onChange={HandleFilterChange}
      />
      <ComboboxOptions  anchor="bottom" className="border empty:invisible">
        {CommunesList.map((C:Feature) => (
          <ComboboxOption key={C.properties.extrafields.cleabs} value={C} className="data-[focus]:bg-blue-100 bg-white">
            {C?.properties.toponym}
          </ComboboxOption>
        ))}
      </ComboboxOptions>
    </Combobox>
  </div>
}

async function PerformSearch(FilterString:string, SetCommunesListCallback:Dispatch<SetStateAction<never[]>>) 
{
  const data = await fetch("api/CommuneFilter?q=" + FilterString)
    .then((response) => {
      return response.json();
    });
  if (data?.features) {
    SetCommunesListCallback(data?.features);
  }

  else {
    SetCommunesListCallback([]);
  }
}
