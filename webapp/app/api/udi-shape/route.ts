import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/duckdb";

/** Géométrie GeoJSON (lon/lat) d'une UDI, simplifiée pour un dessin SVG. */
export type UdiShape = {
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
};

/**
 * Tracé d'une UDI, pour le visuel de partage sur les réseaux sociaux. La
 * tolérance de simplification est proportionnelle à l'emprise du réseau
 * (1/400e de sa plus grande dimension) : invisible sur une image de 1080 px,
 * mais elle ramène les plus gros polygones (26 000 points) à quelques
 * centaines de points.
 */
export async function GET(request: NextRequest) {
  const code = new URL(request.url).searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Paramètre 'code' requis" },
      { status: 400 },
    );
  }

  const connection = await db.connect();
  try {
    await connection.run("LOAD spatial;");
    const prepared = await connection.prepare(
      `SELECT ST_AsGeoJSON(
         ST_SimplifyPreserveTopology(
           geom_original,
           greatest(
             ST_XMax(geom_original) - ST_XMin(geom_original),
             ST_YMax(geom_original) - ST_YMin(geom_original)
           ) / 400
         )
       ) AS geom
       FROM int__udi_geom
       WHERE code_udi = $1
       LIMIT 1`,
    );
    prepared.bindVarchar(1, code);
    const result = await prepared.runAndReadAll();
    const rows = result.getRowObjects();

    if (rows.length === 0 || !rows[0].geom) {
      return NextResponse.json({ error: "Tracé non trouvé" }, { status: 404 });
    }

    const shape: UdiShape = { geometry: JSON.parse(String(rows[0].geom)) };
    return NextResponse.json(shape, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du tracé" },
      { status: 500 },
    );
  } finally {
    await connection.close();
  }
}
