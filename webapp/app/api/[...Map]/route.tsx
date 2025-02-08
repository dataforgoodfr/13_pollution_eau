
import path from "path";
import fs from 'fs';
import { headers } from "next/headers";
import { Buffer } from 'node:buffer';
import { NextResponse } from "next/server";

let buf:Buffer<ArrayBuffer>=null

 export async function GET() {

  const filePath = path.join(process.cwd(), 'public', 'communes-full.pmtiles');
  
  const H = await( headers())
  const Range:string=H.get('range')||''
  let ReadRange=[0,-1]
  /*H.forEach((v,k,p)=>
  {
    if (k==='range')
    {
      Range=v
    }
    
  })*/
  console.log("Read range",Range)

  if (Range.startsWith("bytes="))
  {
    ReadRange=Range.replace('bytes=','').split('-').map(parseFloat)
    
  }
  else
  {
    console.log("Unexpected range",Range)

  }

  if (!buf)
  {const data= fs.readFileSync(filePath)
  
   buf = Buffer.from(data);
  }

  const copiedBuf = Uint8Array.prototype.slice.call(buf).slice(ReadRange[0],ReadRange[1]+1);
  const contentType =      "application/octet-stream";
  
  const Ret =new NextResponse(copiedBuf)

  Ret.headers.set("Content-Type", contentType)
  Ret.headers.set("Content-Length", copiedBuf.length.toString())
  
  return Ret

 }