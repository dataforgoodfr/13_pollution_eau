import path from "path";
import fs from "fs";
import { headers } from "next/headers";
import { Buffer } from "node:buffer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const Url = new URL(req.url);

  let filePath = "";
  let buf=[];
  let BufIndex 
  switch (Url.pathname) {
    case "/api/Map/Contours":
      filePath = path.join(process.cwd(), "public", "communes-full.pmtiles");
      BufIndex=0;
      break;
      case "/api/Map/PFAS":
        filePath = path.join(process.cwd(), "public", "PFAS.pmtiles");
        BufIndex=1;
        break;
      case "/api/Map/CVM":
        filePath = path.join(process.cwd(), "public", "CVM.pmtiles");
        BufIndex=2
        break;
      
    default:
      console.log("Unknown Tile Call");
      return null;
  }

  const H = await headers();
  const Range: string = H.get("range") || "";
  let ReadRange = [0, -1];
  /*H.forEach((v,k,p)=>
  {
    if (k==='range')
    {
      Range=v
    }
    
  })*/
  console.log("Read range", Range);

  if (Range.startsWith("bytes=")) {
    ReadRange = Range.replace("bytes=", "").split("-").map(parseFloat);
  } else {
    console.log("Unexpected range", Range);
  }

  if (!buf[BufIndex])
  {
    const data = fs.readFileSync(filePath);

    buf[BufIndex] = Buffer.from(data);
  }

  const copiedBuf = Uint8Array.prototype.slice
    .call(buf[BufIndex])
    .slice(ReadRange[0], ReadRange[1] + 1);
  const contentType = "application/octet-stream";

  const Ret = new NextResponse(copiedBuf);

  Ret.headers.set("Content-Type", contentType);
  Ret.headers.set("Content-Length", copiedBuf.length.toString());

  return Ret;
}
