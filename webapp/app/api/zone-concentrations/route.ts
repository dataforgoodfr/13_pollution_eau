import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/duckdb";

// Paramètres pour lesquels une courbe d'évolution est proposée dans le panel
// (cf. CONCENTRATION_PARAM_BY_CATEGORY côté composant). Whitelist explicite :
// sans elle, la route exposerait un scan libre de int__resultats_udi.
const ALLOWED_PARAMETRES = new Set(["SPFAS", "PESTOT"]);

// Au-delà, la courbe n'est plus lisible dans le panel : on garde les points
// les plus récents. Seules quelques zones très suivies (PESTOT) dépassent
// cette limite.
const MAX_POINTS = 500;

// Un point = un prélèvement. Un même prélèvement peut porter plusieurs
// résultats pour un paramètre (plusieurs analyses, ce qui arrive pour
// PESTOT) : on garde la valeur max, comme les bilans annuels. On prend les
// MAX_POINTS plus récents, remis ensuite dans l'ordre chronologique.
const UDI_QUERY = `
  SELECT * FROM (
    SELECT referenceprel, MAX(datetimeprel) AS datetimeprel,
      MAX(valtraduite) AS valtraduite
    FROM int__resultats_udi
    WHERE cdreseau = $1
      AND cdparametresiseeaux = $2
    GROUP BY referenceprel
    ORDER BY datetimeprel DESC
    LIMIT ${MAX_POINTS}
  )
  ORDER BY datetimeprel
`;

// Série d'une commune : on passe par le lien commune → UDI plutôt que par
// int__resultats_communes, qui n'est pas embarquée dans la base de production
// (cf. DEFAULT_WEBSITE_TABLES dans pipelines/tasks/trim_database_for_website.py).
// - le lien est historisé par de_partition : sans filtre sur la partition la
//   plus récente, d'anciens réseaux ressortent (même logique que
//   fetchCommunesDesservies dans /api/zone-detail) ;
// - GROUP BY referenceprel : un prélèvement fait sur une installation amont
//   est dupliqué sur chaque UDI avale, donc vu plusieurs fois quand la
//   commune en est desservie par plusieurs (c'est ce que fait
//   int__resultats_communes).
const COMMUNE_QUERY = `
  SELECT * FROM (
    SELECT r.referenceprel, MAX(r.datetimeprel) AS datetimeprel,
      MAX(r.valtraduite) AS valtraduite
    FROM int__resultats_udi AS r
    WHERE r.cdparametresiseeaux = $2
      AND r.cdreseau IN (
        SELECT cdreseau
        FROM int__lien_commune_cdreseau
        WHERE inseecommune = $1
          AND de_partition = (
            SELECT max(de_partition)
            FROM int__lien_commune_cdreseau
            WHERE inseecommune = $1
          )
      )
    GROUP BY r.referenceprel
    ORDER BY datetimeprel DESC
    LIMIT ${MAX_POINTS}
  )
  ORDER BY datetimeprel
`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const code = searchParams.get("code");
  const parametre = searchParams.get("parametre");

  if ((type !== "udis" && type !== "communes") || !code) {
    return NextResponse.json(
      { error: "Paramètres 'type' (udis|communes) et 'code' requis" },
      { status: 400 },
    );
  }

  if (!parametre || !ALLOWED_PARAMETRES.has(parametre)) {
    return NextResponse.json(
      { error: "Paramètre 'parametre' inconnu" },
      { status: 400 },
    );
  }

  const connection = await db.connect();
  try {
    // Bug de @duckdb/node-api 1.2.0-alpha.15 : l'optimiseur top_n désaligne les
    // colonnes quand ORDER BY + LIMIT sont combinés à un WHERE paramétré (les
    // valeurs d'une autre ligne/UDI se retrouvent dans le résultat). À retirer
    // si la dépendance est mise à jour vers une version qui corrige ce bug.
    await connection.run("SET disabled_optimizers='top_n'");

    const prepared = await connection.prepare(
      type === "udis" ? UDI_QUERY : COMMUNE_QUERY,
    );
    prepared.bindVarchar(1, code);
    prepared.bindVarchar(2, parametre);
    const result = await prepared.runAndReadAll();

    const points = result.getRowObjects().map((row) => ({
      referenceprel: String(row.referenceprel),
      date: row.datetimeprel ? row.datetimeprel.toString() : null,
      valeur: row.valtraduite !== null ? Number(row.valtraduite) : null,
    }));

    // Limite atteinte : les prélèvements plus anciens ont été écartés.
    const tronque = points.length === MAX_POINTS;

    return NextResponse.json({ parametre, points, tronque });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des concentrations" },
      { status: 500 },
    );
  } finally {
    await connection.close();
  }
}
