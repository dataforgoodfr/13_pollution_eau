import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/duckdb";
import { BASE_CTE } from "@/app/lib/udiAnalyses";

/** Une date de prélèvement ayant au moins un résultat d'analyse. */
export type AnalyseDate = {
  /** YYYY-MM-DD */
  date: string;
  nbResultats: number;
  categories: string[];
};

/**
 * Dates de prélèvement disponibles pour une UDI, de la plus récente à la plus
 * ancienne, avec les catégories analysées ce jour-là. Indépendant des autres
 * filtres de la modale. Alimente le filtre de date
 * de la modale d'analyses ; volontairement séparé de /api/udi-analyses, qui
 * est rappelé à chaque page de scroll.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cdreseau = searchParams.get("cdreseau");

  if (!cdreseau) {
    return NextResponse.json(
      { error: "Paramètre 'cdreseau' requis" },
      { status: 400 },
    );
  }

  const connection = await db.connect();
  try {
    const prepared = await connection.prepare(
      `${BASE_CTE}
      SELECT
        strftime(datetimeprel, '%Y-%m-%d') AS date,
        count(*) AS nb_resultats,
        string_agg(DISTINCT categorie, ',' ORDER BY categorie) AS categories
      FROM base
      WHERE datetimeprel IS NOT NULL
      GROUP BY 1
      ORDER BY 1 DESC`,
    );
    prepared.bindVarchar(1, cdreseau);
    const result = await prepared.runAndReadAll();

    const dates: AnalyseDate[] = result.getRowObjects().map((row) => ({
      date: String(row.date),
      nbResultats: Number(row.nb_resultats),
      categories: row.categories ? String(row.categories).split(",") : [],
    }));

    return NextResponse.json({ dates });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des dates" },
      { status: 500 },
    );
  } finally {
    await connection.close();
  }
}
