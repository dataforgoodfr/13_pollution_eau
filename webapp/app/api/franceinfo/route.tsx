import db from "@/app/lib/duckdb";
import { NextRequest, NextResponse } from "next/server";

// Allowed domains for CORS
const ALLOWED_ORIGINS = ["https://www.franceinfo.fr", "https://franceinfo.fr"];

export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin");

  // Check if the origin is allowed
  // Allow same-origin requests (no origin header) or requests from allowed origins
  const isAllowedOrigin = !origin || ALLOWED_ORIGINS.includes(origin);

  // Set CORS headers based on origin
  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (isAllowedOrigin && origin) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
  }

  // Handle OPTIONS request for CORS preflight
  if (req.method === "OPTIONS") {
    return NextResponse.json({}, { headers: corsHeaders });
  }

  // Check if origin is allowed for data access
  if (!isAllowedOrigin) {
    return NextResponse.json(
      { message: "Origine non autorisée" },
      { status: 403, headers: corsHeaders },
    );
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
    // await connection.run("LOAD spatial;");

    // Find the UDI for the given coordinates
    const udiPrepared = await connection.prepare(`
      SELECT code_udi
      FROM atlasante_udi
      WHERE ST_Contains(geom, ST_GeomFromText($1::VARCHAR))
      ORDER BY udi_pop DESC
      LIMIT 1
    `);

    const point = `POINT(${lon} ${lat})`;
    udiPrepared.bindVarchar(1, point);

    const udiResult = await udiPrepared.runAndReadAll();

    if (udiResult.currentRowCount === 0) {
      return NextResponse.json(
        { message: "Aucune UDI ne correspond à ces coordonnées" },
        { status: 404, headers: corsHeaders },
      );
    }

    const codeUdi = udiResult.getRowObjectsJson()[0]["code_udi"];

    if (!codeUdi) {
      return NextResponse.json(
        { message: "Code UDI invalide" },
        { status: 500, headers: corsHeaders },
      );
    }

    // Fetch aggregated data for this UDI
    const dataPrepared = await connection.prepare(`
      SELECT result
      FROM web__franceinfo
      WHERE cdreseau = $1::VARCHAR
      LIMIT 1
    `);

    dataPrepared.bindVarchar(1, codeUdi.toString());
    const dataResult = await dataPrepared.runAndReadAll();

    if (dataResult.currentRowCount > 0) {
      const resultJson = dataResult.getRowObjectsJson()[0]["result"];
      // Parse the JSON string if needed
      const data =
        typeof resultJson === "string"
          ? JSON.parse(resultJson)
          : resultJson || {};

      return NextResponse.json(data, { status: 200, headers: corsHeaders });
    } else {
      return NextResponse.json(
        { message: "Aucune donnée disponible pour cette UDI" },
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
