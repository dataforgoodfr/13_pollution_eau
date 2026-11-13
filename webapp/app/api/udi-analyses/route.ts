import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/duckdb";
import { BASE_CTE } from "@/app/lib/udiAnalyses";

const SORTABLE_COLUMNS: Record<string, string> = {
  datetimeprel: "datetimeprel",
  web_label: "web_label",
  categorie: "categorie",
  valtraduite: "valtraduite",
};

const PAGE_SIZE = 100;

// Aucune colonne triable n'est unique (une même UDI a des centaines de résultats
// partageant la même date, le même paramètre ou la même catégorie). Sans clé de
// départage, l'ordre des lignes ex aequo n'est pas garanti d'une requête à
// l'autre : le scroll infini (LIMIT/OFFSET) afficherait alors des doublons et
// sauterait d'autres lignes. On ajoute la clé unique de la table à chaque tri.
const TIE_BREAKER = "referenceprel, cdparametresiseeaux, referenceanl";

type Connection = Awaited<ReturnType<typeof db.connect>>;
type Prepared = Awaited<ReturnType<Connection["prepare"]>>;

type Binder = (prepared: Prepared, index: number) => void;

function toStringOrNull(value: unknown): string | null {
  return value ? String(value) : null;
}

function toNumberOrNull(value: unknown): number | null {
  return value === null || value === undefined ? null : Number(value);
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function buildFilters(searchParams: URLSearchParams, cdreseau: string) {
  const categorie = searchParams.get("categorie");
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
      datetimeprel: row.datetimeprel ? row.datetimeprel.toString() : null,
      cdparametresiseeaux: String(row.cdparametresiseeaux),
      web_label: toStringOrNull(row.web_label),
      categorie: toStringOrNull(row.categorie),
      categorie_3: toStringOrNull(row.categorie_3),
      valtraduite: toNumberOrNull(row.valtraduite),
      limite_qualite: toNumberOrNull(row.limite_qualite),
      limite_indicative: toNumberOrNull(row.limite_indicative),
      valeur_sanitaire_1: toNumberOrNull(row.valeur_sanitaire_1),
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
