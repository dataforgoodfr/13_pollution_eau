"use client";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Popover } from "./ui/popover";
import { Command, CommandList } from "./ui/command";
import { CommandGroup, CommandItem } from "cmdk";
import { Button } from "./ui/button";
import { useState } from "react";
import { Check, CheckCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface YearFilerInfo {
  value: number;
  label: string;
  
}

export interface FilterParamsType {
  value: YearFilerInfo;
  availableYears: YearFilerInfo[];
  onValueChange : (y:YearFilerInfo)=>void
}

export default function YearFilter(props: FilterParamsType) {
  const [isOpen, setOpen] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<YearFilerInfo>(
    props?.value,
  );

  function handleYearChange(e:YearFilerInfo) {
    if (props.onValueChange) {
      props.onValueChange(e);
    }
    setSelectedYear(e);
    setOpen(false);
  }

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-[300px] grid-cols-3 justify-between"
        >
          Année : {selectedYear?.label}
          <ChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Command>
          <CommandList>
            <CommandGroup key="YearFilterGroup">
              {props?.availableYears?.map((x: YearFilerInfo) => {
                return (
                  <CommandItem
                    key={x.value}
                    value={x.value}
                    onSelect={()=>{
                      setOpen(false)
                       handleYearChange(x)}}
                    className="w-1/12"
                  >
                    {x.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        x.value == selectedYear.value ? "opacity-100" : "opacity-0",
                      )}
                    />
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
