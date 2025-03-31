import { NextRequest, NextResponse } from "next/server";
import { mockData } from "@/app/lib/mock-data";

export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);
  const udi_id = pathname.split("/").pop();

  if (!udi_id) {
    return NextResponse.json(
      { error: "Paramètre UDI manquant" },
      { status: 400 },
    );
  }

  if (udi_id && mockData[udi_id]) {
    return NextResponse.json(mockData[udi_id], { status: 200 });
  } else {
    return NextResponse.json({ error: "UDI non trouvée" }, { status: 404 });
  }
}
