import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Feature } from "maplibre-gl";

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q");
  const RebuildGeoJsonNeeded = new URL(req.url).searchParams.get("rebuild");

  if (RebuildGeoJsonNeeded)
  {
    RebuildGeoJson()
  }

  if (!q) {
    return NextResponse.json(null);
  } else {
    const IGNQuery =
      "https://data.geopf.fr/geocodage/search?autocomplete=1&index=address&limit=10&returntruegeometry=false&type=municipality";
    const URLIGN = new URL(IGNQuery);
    URLIGN.searchParams.set("q", q);
    const data = await fetch(URLIGN)
      .then((response) => {
        const data = response.clone();
        //console.log("body",response)
        return data.json();
      })
      .catch((err) => {
        console.log("fetch error :", err);
      });

    return NextResponse.json(data);
  }
}
function RebuildGeoJson() {
  const filePath = path.join(process.cwd(), "public", "georef-france-commune-prelevement.geojson.removeme");
  const outFilePath = path.join(process.cwd(), "public", "Polluants.geojson");

  const data = JSON.parse(fs.readFileSync(filePath));
  
  for (const i in data.features)
  {
    const F:Feature = data.features[i]

    if (F.properties?.resultat_cvm)
    {
      for (const j in F.properties.resultat_cvm)
      {
        F.properties["Res_Cat_1_"+j]=F.properties.resultat_cvm[j]
      }
    }
  }

  fs.writeFile(outFilePath,JSON.stringify(data),'utf-8',(e)=>{console.log("Write returned",e)})

  //console.log("geojson data",data)
  
}

