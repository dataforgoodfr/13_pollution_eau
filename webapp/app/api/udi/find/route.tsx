// an api route fetching data

import db from "@/app/lib/duckdb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Set CORS headers to allow requests from any origin
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Handle OPTIONS request for CORS preflight
  if (req.method === "OPTIONS") {
    return NextResponse.json({}, { headers: corsHeaders });
  }

  const { searchParams } = new URL(req.url);
  const lonParam = searchParams.get("lon");
  const latParam = searchParams.get("lat");

  if (lonParam == null || latParam == null) {
    return NextResponse.json(
      { message: "Paramètres manquants: lon et lat sont requis" },
      { status: 400, headers: corsHeaders },
    );
  }
  const lon = parseFloat(lonParam);
  const lat = parseFloat(latParam);

  if (
    isNaN(lon) ||
    isNaN(lat) ||
    lon < -180 ||
    lon > 180 ||
    lat < -90 ||
    lat > 90
  ) {
    return NextResponse.json(
      { message: "Paramètres invalides" },
      { status: 400, headers: corsHeaders },
    );
  }

  const connection = await db.connect();
  try {
    await connection.run("LOAD spatial;");

    const prepared = await connection.prepare(`
      SELECT code_udi
      FROM atlasante_udi
      WHERE ST_Contains(geom, ST_GeomFromText($1::VARCHAR))
      ORDER BY udi_pop DESC
      LIMIT 1
    `);

    const point = `POINT(${lon} ${lat})`;
    prepared.bindVarchar(1, point);

    const result = await prepared.runAndReadAll();

    if (result.currentRowCount > 0) {
      return NextResponse.json(
        { id: result.getRowObjectsJson()[0]["code_udi"] },
        { status: 200, headers: corsHeaders },
      );
    } else {
      return NextResponse.json(
        { message: "Aucune UDI ne correspond à ces coordonnées" },
        { status: 404, headers: corsHeaders },
      );
    }
  } catch (error) {
    console.error("Erreur de base de données:", error);
    return NextResponse.json(
      {
        message:
          "Une erreur interne s'est produite. Veuillez réessayer ultérieurement.",
      },
      { status: 500, headers: corsHeaders },
    );
  } finally {
    await connection.close();
  }
}
