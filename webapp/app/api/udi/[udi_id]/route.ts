import { NextRequest, NextResponse } from "next/server";
import { mockData } from "@/app/lib/mock-data";

export async function GET(
  request: NextRequest,
  { params }: { params: { udi_id: string } },
) {
  // Attendre les propriétés de params
  const { udi_id } = await params;

  if (udi_id && mockData[udi_id]) {
    return NextResponse.json(mockData[udi_id], { status: 200 });
  } else {
    return NextResponse.json({ error: "UDI non trouvée" }, { status: 404 });
  }
}
