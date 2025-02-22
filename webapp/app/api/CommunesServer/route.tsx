import { CommuneType } from '@/components/Communes';
import fs from 'fs';
import { GeoJSONSourceSpecification } from 'maplibre-gl';
import { NextResponse } from 'next/server';
import path from 'path';


export interface PFASInfo{
		"inseecommuneprinc" : string,
		"DtePrel" : string,
		"nomcommuneprinc" : string,
		"referenceprel" : string,
		"cdparametresiseeaux" : string,
		"libmajparametre" : string,
		"libminparametre" : string,
		"valtraduite" : number,
		"cdunitereferencesiseeaux" : string
}

let CommuneList:CommuneType[]

export async function GET() 
{
  
  const filePath = path.join(process.cwd(), 'public', 'Communes.json');
  const CInsee:number[]=[]
  if (!CommuneList)
  {
    const TmpCommuneList = JSON.parse( fs.readFileSync(filePath, 'utf-8'));
    CommuneList=[]

    for (const CI in TmpCommuneList)
    {
      if (CI)
      {
        const C = TmpCommuneList[CI]
        if (C.G!=='')
        {
          if (C.I=="60694")
          {
            console.log(C)
          }

          if (!CInsee[C.I])
          {
            CommuneList.push(C)
            CInsee[C.I]=1
          }
        }
      }
    }

    console.log("Src ", TmpCommuneList.length, "Dst", CommuneList.length)
  }
  InitPMTiles(CommuneList)
  
  // Keep for later use
  //const {searchParams} = new URL(req.url);
  //const qparam = searchParams.get("q");
  return NextResponse.json( CommuneList)

}

async function InitPMTiles(Communes:CommuneType[]) 
{

  return 
  const PFASFile = path.join(process.cwd(), 'public', 'ExportPFAS_202502192236.json');
  const PFAS = JSON.parse(fs.readFileSync(PFASFile, 'utf-8'))
  const StartTick = new Date().getTime()
  console.log("read PFAS", PFAS?.length)

  for (let PIndex in PFAS)
  {
    if (PIndex)
    {
      let P = PFAS[PIndex]
      for (let C in Communes)
      {
        const Commune:CommuneType=Communes[C]
        if (Commune.I==P.inseecommuneprinc)
        {
          if (!Commune.PFAS)
          {
            Commune.PFAS=[]
          }
          Commune.PFAS.push(P)
          break
        }
      }
    }
  }


  GeoJsonSpecs.data.features=GetCommunesFeatures(CommuneList,"",0)

  const OutFile = path.join(process.cwd(), 'public', 'PFAS.geojson');
  fs.writeFileSync(OutFile,JSON.stringify (GeoJsonSpecs.data))
  const EndTick = new Date().getTime()
  
  console.log("done", EndTick-StartTick,CommuneList[0])
  
}

const GeoJsonSpecs:GeoJSONSourceSpecification={
  type: 'geojson',
  data: {type:'FeatureCollection',features:[]},
  cluster: false,    
} 

function GetCommunesFeatures(jsonData: CommuneType[],FilterString:string,RollIndex:number) 
{
  return jsonData.map((x,index)=>{return CommuneType2GeoJSON(x,index*RollIndex,FilterString)})
}

function CommuneType2GeoJSON(C:CommuneType, Index:number, FilterString:string)
{
  const Coords=C.G.split(",").map(parseFloat)
  
  const RetValue= {
    type:'Feature',
    properties:{
      id:C.I,
      nom:C.n,
      PFASAmount:GetPFASIndex(C.PFAS),
      radius:GetPFASRadius(C.PFAS),
      color:GetPFASColor(C.PFAS),
      PFAS:C.PFAS
    },
    geometry:{
      type:'Point',
      coordinates: [Coords[1],Coords[0]]
    }
  }
  return RetValue
  

}
function GetPFASIndex(PFAS: PFASInfo[]) {
  if (PFAS)
  {
    return PFAS.length
  }
  else
  {
    return 0
  }
}

const SEUIL_NC0=0.02
const SEUIL_NC1=0.04

function GetPFASColor(PFAS: PFASInfo[]) 
{
  const Colors = ['#00E800', '#ffa500','#ff0000']
  let Index = 0
  if (PFAS)
  {
    let Sum=0
    for (let i in PFAS)
    {
      if (i && PFAS[i])
      {
        const P = PFAS[i]
        Sum += P.valtraduite

        if (Sum > SEUIL_NC0)
        {
          Index=1
        }
        else if (Sum > SEUIL_NC1)
        {
          Index=2
          break
        }
      }
    }    
  }
  
  return Colors[Index]
}

function GetPFASRadius(PFAS: PFASInfo[]) {
  const Radiuses = [3, 6,9]
  let Index = 0
  if (PFAS)
  {
    let Sum=0
    for (let i in PFAS)
    {
      if (i && PFAS[i])
      {
        const P = PFAS[i]
        Sum += P.valtraduite

        if (Sum > SEUIL_NC0)
        {
          Index=1
        }
        else if (Sum > SEUIL_NC1)
        {
          Index=2
          break
        }
      }
    }    
  }
  
  return Radiuses[Index];
}

