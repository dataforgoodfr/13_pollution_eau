import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q");

  if (!q) {
    return NextResponse.json(null);
  } else {
    const IGNQuery =
      "https://data.geopf.fr/geocodage/search?autocomplete=1&index=poi&limit=10&returntruegeometry=false&type=municipality&category=commune";
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
