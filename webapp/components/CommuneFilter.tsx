"use client"
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { ChangeEventHandler, useEffect, useState } from "react";

export default function CommuneFilter() 
{
  const [FilterString,SetFilterString]=useState('')
  const [DelayHandler, SetDelayHandler]=useState(null)
  const [CommunesList, SetCommunesList]=useState([])

  useEffect(()=>{
    function CallFilter()
    {
      const Data=fetch("/api/CommuneFilter?q="+FilterString)
      console.log("returned ",Data)
    }

    if (DelayHandler)
    {
      clearTimeout(DelayHandler)
    }

    //SetDelayHandler(setTimeout(CallFilter),100)
    console.log("Current FilterString",FilterString)
  },[FilterString, DelayHandler])



  async function  HandleFilterChange(e:React.ChangeEvent<HTMLInputElement>)
  {
    if (!e?.target?.value)
    {
      SetFilterString('')
      SetCommunesList([])
      return
    }
    const data=await fetch("api/CommuneFilter?q="+e.target.value)
                        .then((response)=>
                        {
                          return response.json()  
                        })
    console.log("changing",e.target.value, data)
    SetFilterString(e.target.value)
    if (data?.features)
    {
      SetCommunesList(data?.features)
    }
    else
    {
      SetCommunesList([])
    }
    
  }

  function SetSelected(event: ChangeEvent<HTMLInputElement>): void 
  {
    
  }

  return <div>
    <Combobox value={FilterString} onChange={HandleFilterChange} >
      <ComboboxInput
        aria-label="Communes"
        displayValue={(c) => c?.properties?.toponym}
        onChange={HandleFilterChange}
      />
      <ComboboxOptions anchor="bottom" className="border empty:invisible">
        {CommunesList.map((C) => (
          <ComboboxOption key={C.properties.extrafields.cleabs} value={C} className="data-[focus]:bg-blue-100">
            {C?.properties.toponym}
          </ComboboxOption>
        ))}
      </ComboboxOptions>
    </Combobox>
  </div>
}