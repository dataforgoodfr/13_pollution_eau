
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { useEffect, useState } from "react";

export interface CommuneType{
  n:string,
  C:string,
  G:string,
  Centroid:Centroid,
  I:string,
}

export interface Centroid{
  Lon:number,
  Lat:number

}

interface CommunesProps{
  DisplayedCommunesListChanged:(CommuneList:CommuneType[],Fstring:string)=>void,
  CommunesData: CommuneType[]
}

export default function Communes(Props:CommunesProps) 
{
  const [SearchString,SetSearchString]=useState("")
  const [CommunesNames, SetCommunesNames]=useState<string[]>([])
  const [CommunesData,SetCommunesData]=useState<CommuneType[]>(Props.CommunesData)
  const [SearchCommunes,SetSearchedCommunes]=useState<CommuneType[]>([])
  
  useEffect(()=>{
  if (CommunesData?.length!==Props.CommunesData?.length)
  {
    SetCommunesData(Props.CommunesData)
    SetCommunesNames(LoadCommunesList(CommunesData))
  }
  }, [CommunesData,CommunesNames, Props.CommunesData])

  useEffect(()=>
    {      
      const NewList = GetCommunesSubSet(CommunesData, SearchString)
      if (Props.DisplayedCommunesListChanged)
      {
        Props.DisplayedCommunesListChanged(NewList,SearchString)
      }

      if (NewList?.length<=42)
      {
        SetSearchedCommunes(NewList)
      }
      else
      {
        SetSearchedCommunes([])
      }
    }
    ,[SearchString, CommunesData,Props]
  )
   
  return <div>
    <Combobox  value={SearchString} onChange={(x:string)=>{ SetSearchString(x)}} >
      <ComboboxInput
        aria-label="Assignee"
        displayValue={(C:CommuneType) => C?.n}
        onChange={(event) => SetSearchString(event.target.value)}
      />
      <ComboboxOptions anchor="bottom" className="border empty:invisible">
        {SearchCommunes.map((C:CommuneType) => (
          <ComboboxOption key={C.I} value={C} className="data-[focus]:bg-blue-100">
            {C.n}
          </ComboboxOption>
        ))}
      </ComboboxOptions>
    </Combobox>
    <span>{CommunesNames.length} Nom de communes en mémoire</span>
  </div>
}


function LoadCommunesList(CommunesList:Array<CommuneType>):string[]
{
  if (!CommunesList)
  {
    return []
  }
  const Communes=CommunesList?.map((x)=>{
    return x.n
  }) 
  return Communes
}

function GetCommunesSubSet(CommunesList:CommuneType[], SearchString: string):CommuneType[]
{
  if (!CommunesList || !CommunesList.length)
  {
    return [] as CommuneType[]
  }
  const RetArray:CommuneType[]=[]
  CommunesList.map((x:CommuneType)=>
  {
    if (x?.n.includes(SearchString.toUpperCase())|| x.C==SearchString)
    {
      if (x.G && !x.Centroid)
      {
        const coords = x.G.split(',').map(num => parseFloat(num));
        x.Centroid={Lon:coords[1],Lat:coords[0]}
      }
      RetArray.push(x)
    }
    
  })

  return RetArray
}

