
import { useEffect, useState } from "react";

export interface CommuneType{
  nom:string,
  CP:string,
  _geopoint:string,
  Centroid:Centroid,
  INSEE:string,
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
    }
    ,[SearchString, CommunesData,Props]
  )
  
  function HandleSearchStringChange (event: React.ChangeEvent<HTMLInputElement>)
  {
    SetSearchString(event.target.value)
  }
  
  
  return <div>
    <input type="text" value={SearchString} onChange={HandleSearchStringChange} />
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
    return x.nom
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
    if (x?.nom.includes(SearchString.toUpperCase())|| x.CP==SearchString)
    {
      if (x._geopoint && !x.Centroid)
      {
        const coords = x._geopoint.split(',').map(num => parseFloat(num));
        x.Centroid={Lon:coords[1],Lat:coords[0]}
      }
      RetArray.push(x)
    }
    
  })

  return RetArray
}

