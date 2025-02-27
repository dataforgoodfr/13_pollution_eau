"use client"
import { Dispatch, SetStateAction, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { Feature } from "maplibre-gl";
import { Check, ChevronsUpDown } from "lucide-react";


export default function CommuneFilter() 
{
  const [filterString,setFilterString]=useState('')
  const [delayHandler, setDelayHandler]=useState<NodeJS.Timeout|null>(null )
  const [communesList, setCommunesList]=useState([])
  const [DropDownIsOpened, setDropDownOpen]=useState(false)
  const [selectedCommune, setSelectedCommune]=useState<Feature>(null)

  async function  HandleFilterChange(e:React.ChangeEvent<HTMLInputElement>)
  {
    console.log("HandleFilter",e)
    if (!e?.target?.value)
    {
      setFilterString('')
      setCommunesList([])
      return
    }

    if (delayHandler)
    {
      clearTimeout(delayHandler)
    }

    setFilterString(e.target.value);
  
    setDelayHandler(setTimeout(()=>{
        PerformSearch(e.target.value, setCommunesList)
      },200))
    
    }

  /*return <div>
    <Combobox value={filterString} onChange={SelectCommuneChanged} >
      <ComboboxInput className="bg-white-500 border-blue-500"
        aria-label="Communes"
        displayValue={(c:Feature) => c?.properties?.toponym}
        onChange={HandleFilterChange}
      />
      <ComboboxOptions  anchor="bottom" className="border empty:invisible">
        {communesList.map((C:Feature) => (
          <ComboboxOption key={C.properties.extrafields.cleabs} value={C} className="data-[focus]:bg-blue-100 bg-white">
            {C?.properties.toponym}
          </ComboboxOption>
        ))}
      </ComboboxOptions>
    </Combobox>
  </div>*/
  return <div>
      <Popover open={DropDownIsOpened} onOpenChange={setDropDownOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {filterString
              ? communesList?.find((x:Feature) => x?.properties?.toponym === filterString)?.properties?.toponym
              : "Saisir le nom de la commune à rechercher"}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search framework..." />
            <CommandList>
              <CommandGroup>
                {communesList.map((x:Feature) => (
                  <CommandInput
                    key={x?.properties?.extrafields.cleabs}
                    value={x?.properties?.toponym}
                    onValueChange={setFilterString}
                  >
                    {selectedCommune.properties.toponym}
                    <Check
                      className={cn(
                        "ml-auto",
                        //communesList.prop === framework.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
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
