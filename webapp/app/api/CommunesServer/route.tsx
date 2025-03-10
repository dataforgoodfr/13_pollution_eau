import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';


let CommuneList = ""
export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'Communes.json');
  
  if (CommuneList==="")
  {
    CommuneList = JSON.parse( fs.readFileSync(filePath, 'utf-8'));
  }

  // Keep for later use
  //const {searchParams} = new URL(req.url);
  //const qparam = searchParams.get("q");
  return NextResponse.json( CommuneList)

}

