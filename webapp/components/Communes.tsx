
import { useEffect, useState } from "react";
import { Marker } from "maplibre-gl";

export interface CommuneType{
  nom:string,
  CP:string,
  _geopoint:string,
  Centroid:Centroid
  Marker:Marker
}

export interface Centroid{
  Lon:number,
  Lat:number

}

interface CommunesProps{
  DisplayedCommunesListChanged:(CommuneList:CommuneType[])=>void
}

export default function Communes(Props:CommunesProps) 
{
  const [SearchString,SetSearchString]=useState("")
  const [CommunesNames,SetCommuneNames]=useState<string[]>([])
  const [CommunesData,SetCommuneData]=useState<CommuneType[]>([])
  
  useEffect(()=>{
    const fetchData = async () => {
      const response = await fetch('/api/CommunesServer');
      const jsonData = await response.json();
      SetCommuneNames(LoadCommunesList(jsonData));
      SetCommuneData(jsonData);
    };

    fetchData();
  },[])

  useEffect(()=>
    {
      const NewList = GetCommunesSubSet(CommunesData, SearchString)
      if (Props.DisplayedCommunesListChanged)
      {
        Props.DisplayedCommunesListChanged(NewList)
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
  const Communes=CommunesList?.map((x)=>{
    return x.nom
  })
  return Communes
}

function GetCommunesSubSet(CommunesList:CommuneType[], SearchString: string):CommuneType[]
{
  if (!CommunesList)
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

