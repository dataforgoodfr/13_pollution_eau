import { NextResponse } from "next/server";
import { mockData } from "@/app/lib/mock-data";

export async function GET() {
  return NextResponse.json(mockData["UDI12345"], { status: 200 });
}
