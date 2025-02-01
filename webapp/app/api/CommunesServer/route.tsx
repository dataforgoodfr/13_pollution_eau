import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';


export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'Communes.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  console.log(fileContent.length)
  return NextResponse.json(JSON.parse(fileContent))
}