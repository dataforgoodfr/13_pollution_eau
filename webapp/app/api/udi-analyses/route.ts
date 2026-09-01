import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/duckdb";

const SEVERITE_VALUES = [
  "non_quantifie",
  "quantifie",
  "vigilance",
  "non_conforme",
  "deconseille",
];

const SORTABLE_COLUMNS: Record<string, string> = {
  datetimeprel: "datetimeprel",
  web_label: "web_label",
  categorie: "categorie",
  valtraduite: "valtraduite",
  severite: "severite",
};

const PAGE_SIZE = 100;

// Aucune colonne triable n'est unique (une même UDI a des centaines de résultats
// partageant la même date, le même paramètre ou la même sévérité). Sans clé de
// départage, l'ordre des lignes ex aequo n'est pas garanti d'une requête à
// l'autre : le scroll infini (LIMIT/OFFSET) afficherait alors des doublons et
// sauterait d'autres lignes. On ajoute la clé unique de la table à chaque tri.
const TIE_BREAKER = "referenceprel, cdparametresiseeaux, referenceanl";

const BASE_CTE = `
  WITH base AS (
    SELECT
      r.referenceprel,
      r.referenceanl,
      r.datetimeprel,
      r.de_partition,
      r.cdparametresiseeaux,
      v.web_label,
      r.categorie,
      r.categorie_2,
      r.categorie_3,
      r.valtraduite,
      r.limite_qualite,
      r.limite_indicative,
      r.valeur_sanitaire_1,
      r.valeur_sanitaire_2,
      CASE
        -- valtraduite absente dans la donnée source : la substance a été
        -- recherchée sans résultat chiffré, on la traite comme non quantifiée
        -- (sinon elle tomberait dans le ELSE 'quantifie').
        WHEN r.valtraduite IS NULL OR r.valtraduite = 0 THEN 'non_quantifie'
        WHEN
          r.valeur_sanitaire_1 IS NOT NULL AND r.valtraduite > r.valeur_sanitaire_1
          THEN 'deconseille'
        WHEN
          r.limite_qualite IS NOT NULL AND r.valtraduite > r.limite_qualite
          THEN 'non_conforme'
        WHEN
          r.limite_indicative IS NOT NULL AND r.valtraduite > r.limite_indicative
          THEN 'vigilance'
        ELSE 'quantifie'
      END AS severite
    FROM int__resultats_udi AS r
    LEFT JOIN int__valeurs_de_reference AS v
      ON r.cdparametresiseeaux = v.cdparametresiseeaux
    WHERE
      r.cdreseau = $1
      -- PESTOT est un total de pesticides recalculé par le labo, pas un
      -- paramètre individuellement recherché : exclu partout ailleurs dans
      -- les modèles pesticide (cf. int__resultats_pesticide_udi_dernier.sql),
      -- on l'exclut ici aussi pour ne pas le lister parmi les analyses.
      AND r.cdparametresiseeaux != 'PESTOT'
  )
`;

type Connection = Awaited<ReturnType<typeof db.connect>>;
type Prepared = Awaited<ReturnType<Connection["prepare"]>>;

type Binder = (prepared: Prepared, index: number) => void;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function buildFilters(searchParams: URLSearchParams, cdreseau: string) {
  const categorie = searchParams.get("categorie");
  const severite = searchParams.get("severite");
  const parametre = searchParams.get("parametre");
  const date = searchParams.get("date");

  // $1 est réservé au cdreseau de BASE_CTE.
  const conditions: string[] = [];
  const binders: Binder[] = [(p, i) => p.bindVarchar(i, cdreseau)];

  if (categorie) {
    conditions.push(`categorie = $${binders.length + 1}`);
    binders.push((p, i) => p.bindVarchar(i, categorie));
  }

  if (date && DATE_PATTERN.test(date)) {
    conditions.push(
      `strftime(datetimeprel, '%Y-%m-%d') = $${binders.length + 1}`,
    );
    binders.push((p, i) => p.bindVarchar(i, date));
  }

  if (severite && SEVERITE_VALUES.includes(severite)) {
    conditions.push(`severite = $${binders.length + 1}`);
    binders.push((p, i) => p.bindVarchar(i, severite));
  }

  if (parametre) {
    const like = `%${parametre}%`;
    conditions.push(
      `(web_label ILIKE $${binders.length + 1} OR cdparametresiseeaux ILIKE $${binders.length + 2})`,
    );
    binders.push((p, i) => p.bindVarchar(i, like));
    binders.push((p, i) => p.bindVarchar(i, like));
  }

  return { conditions, binders };
}

function bindAll(prepared: Prepared, binders: Binder[]) {
  binders.forEach((bind, index) => bind(prepared, index + 1));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cdreseau = searchParams.get("cdreseau");

  if (!cdreseau) {
    return NextResponse.json(
      { error: "Paramètre 'cdreseau' requis" },
      { status: 400 },
    );
  }

  const sortBy =
    SORTABLE_COLUMNS[searchParams.get("sortBy") ?? ""] ?? "datetimeprel";
  const sortDir = searchParams.get("sortDir") === "asc" ? "ASC" : "DESC";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const { conditions, binders } = buildFilters(searchParams, cdreseau);
  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const connection = await db.connect();
  try {
    // Bug de @duckdb/node-api 1.2.0-alpha.15 : l'optimiseur top_n désaligne les
    // colonnes quand ORDER BY + LIMIT sont combinés à un WHERE paramétré (les
    // valeurs d'une autre ligne/UDI se retrouvent dans le résultat). À retirer
    // si la dépendance est mise à jour vers une version qui corrige ce bug.
    await connection.run("SET disabled_optimizers='top_n'");

    const countPrepared = await connection.prepare(
      `${BASE_CTE} SELECT count(*) AS total FROM base ${whereClause}`,
    );
    bindAll(countPrepared, binders);
    const countResult = await countPrepared.runAndReadAll();
    const total = Number(countResult.getRowObjects()[0]?.total ?? 0);

    const dataPrepared = await connection.prepare(
      `${BASE_CTE}
      SELECT * FROM base
      ${whereClause}
      ORDER BY ${sortBy} ${sortDir}, ${TIE_BREAKER}
      LIMIT ${PAGE_SIZE} OFFSET ${offset}`,
    );
    bindAll(dataPrepared, binders);
    const dataResult = await dataPrepared.runAndReadAll();

    const rows = dataResult.getRowObjects().map((row) => ({
      referenceprel: String(row.referenceprel),
      referenceanl: row.referenceanl ? String(row.referenceanl) : null,
      datetimeprel: row.datetimeprel ? row.datetimeprel.toString() : null,
      de_partition: Number(row.de_partition),
      cdparametresiseeaux: String(row.cdparametresiseeaux),
      web_label: row.web_label ? String(row.web_label) : null,
      categorie: row.categorie ? String(row.categorie) : null,
      categorie_2: row.categorie_2 ? String(row.categorie_2) : null,
      categorie_3: row.categorie_3 ? String(row.categorie_3) : null,
      valtraduite: row.valtraduite !== null ? Number(row.valtraduite) : null,
      limite_qualite:
        row.limite_qualite !== null ? Number(row.limite_qualite) : null,
      limite_indicative:
        row.limite_indicative !== null ? Number(row.limite_indicative) : null,
      valeur_sanitaire_1:
        row.valeur_sanitaire_1 !== null ? Number(row.valeur_sanitaire_1) : null,
      valeur_sanitaire_2:
        row.valeur_sanitaire_2 !== null ? Number(row.valeur_sanitaire_2) : null,
      severite: String(row.severite),
    }));

    return NextResponse.json({ rows, total });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des analyses" },
      { status: 500 },
    );
  } finally {
    await connection.close();
  }
}
