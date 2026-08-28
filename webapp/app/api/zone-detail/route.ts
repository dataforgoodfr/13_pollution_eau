import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/duckdb";
import { getPropertyName } from "@/lib/property";

type ZoneType = "udis" | "communes";

const NUMERIC_FIELDS = [
  "ratio",
  "nb_parametres",
  "nb_prelevements",
  "nb_sup_valeur_sanitaire",
];
const STRING_FIELDS = ["resultat", "date_dernier_prel", "parametres_detectes"];
const VALUE_FIELDS = [...NUMERIC_FIELDS, ...STRING_FIELDS];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const code = searchParams.get("code");

  if ((type !== "udis" && type !== "communes") || !code) {
    return NextResponse.json(
      { error: "Paramètres 'type' (udis|communes) et 'code' requis" },
      { status: 400 },
    );
  }

  try {
    const data = await fetchZoneDetail(type, code);

    if (!data) {
      return NextResponse.json({ error: "Zone non trouvée" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 },
    );
  }
}

type ZoneDetailData = Record<string, string | number | string[] | null>;

type Connection = Awaited<ReturnType<typeof db.connect>>;

/**
 * Communes alimentées par une UDI. Le lien commune ↔ réseau est historisé par
 * `de_partition` (année de récupération) : on ne garde que la partition la plus
 * récente du réseau, sinon d'anciennes communes ressortent en double.
 */
async function fetchCommunesDesservies(
  connection: Connection,
  cdreseau: string,
): Promise<string[]> {
  const prepared = await connection.prepare(
    `SELECT DISTINCT nomcommune
     FROM int__lien_commune_cdreseau
     WHERE cdreseau = $1
       AND de_partition = (
         SELECT max(de_partition)
         FROM int__lien_commune_cdreseau
         WHERE cdreseau = $1
       )
     ORDER BY nomcommune`,
  );
  prepared.bindVarchar(1, cdreseau);
  const result = await prepared.runAndReadAll();

  return result
    .getRowObjects()
    .map((row) => (row.nomcommune ? String(row.nomcommune) : ""))
    .filter((name) => name !== "");
}

async function fetchZoneDetail(
  type: ZoneType,
  code: string,
): Promise<ZoneDetailData | null> {
  const table =
    type === "udis" ? "web__resultats_udi" : "web__resultats_communes";
  const codeColumn = type === "udis" ? "cdreseau" : "commune_code_insee";

  const connection = await db.connect();
  try {
    const prepared = await connection.prepare(
      `SELECT * FROM ${table} WHERE ${codeColumn} = $1`,
    );
    prepared.bindVarchar(1, code);
    const result = await prepared.runAndReadAll();
    const rows = result.getRowObjects();

    if (rows.length === 0) {
      return null;
    }

    const data: ZoneDetailData = {
      [codeColumn]: code,
    };
    if (type === "udis") {
      data["nomreseaux"] = rows[0].nomreseaux
        ? String(rows[0].nomreseaux)
        : null;
      data["population"] = rows[0].population
        ? Number(rows[0].population)
        : null;
      data["communes_desservies"] = await fetchCommunesDesservies(
        connection,
        code,
      );
    } else {
      data["commune_nom"] = rows[0].commune_nom
        ? String(rows[0].commune_nom)
        : null;
    }

    rows.forEach((row) => {
      const periode = row.periode ? String(row.periode) : null;
      const categorie = row.categorie ? String(row.categorie) : null;
      if (!periode || !categorie) return;

      VALUE_FIELDS.forEach((field) => {
        const value = row[field];
        const propertyName = getPropertyName(periode, categorie, field);
        if (value === null || value === undefined) {
          data[propertyName] = null;
        } else if (NUMERIC_FIELDS.includes(field)) {
          data[propertyName] = Number(value);
        } else {
          data[propertyName] = value.toString();
        }
      });
    });

    return data;
  } finally {
    await connection.close();
  }
}
