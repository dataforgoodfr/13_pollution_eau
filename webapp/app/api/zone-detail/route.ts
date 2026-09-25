import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/duckdb";

type ZoneType = "udis" | "communes";

/** Codes de paramètres quantifiés → valeur mesurée. */
export type ParametresDetectes = Record<string, number>;

export type DernierPrelEntry = {
  resultat: string | null;
  date: string | null;
  nbParametres: number | null;
  parametresDetectes: ParametresDetectes;
};

/** Présent uniquement pour les années avec au moins un prélèvement. */
export type AnnualEntry = {
  ratio: number;
  nbPrelevements: number;
  nbSupValeurSanitaire: number | null;
  parametresDetectes: ParametresDetectes;
};

/**
 * Données d'une zone renvoyées par /api/zone-detail. Les catégories (et les
 * années de bilan) sans donnée sont absentes.
 */
export type ZoneDetail = {
  zone: {
    code: string;
    nom: string | null;
    /** UDI uniquement. */
    population?: number | null;
    /** UDI uniquement. */
    communesDesservies?: string[];
  };
  dernierPrel: Partial<Record<string, DernierPrelEntry>>;
  /** Par catégorie, puis par année ("2024"). */
  bilans: Partial<Record<string, Partial<Record<string, AnnualEntry>>>>;
};

const BILAN_ANNUEL_PREFIX = "bilan_annuel_";

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

type Connection = Awaited<ReturnType<typeof db.connect>>;

function toStringOrNull(value: unknown): string | null {
  return value === null || value === undefined ? null : String(value);
}

function toNumberOrNull(value: unknown): number | null {
  return value === null || value === undefined ? null : Number(value);
}

function parseParametresDetectes(value: unknown): ParametresDetectes {
  if (value === null || value === undefined) return {};
  try {
    const parsed = JSON.parse(String(value)) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed).map(([code, v]) => [code, Number(v)]),
    );
  } catch (error) {
    console.error("Error parsing parametres_detectes:", error);
    return {};
  }
}

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
): Promise<ZoneDetail | null> {
  const table =
    type === "udis" ? "web__resultats_udi" : "web__resultats_communes";
  const codeColumn = type === "udis" ? "cdreseau" : "commune_code_insee";
  const nomColumn = type === "udis" ? "nomreseaux" : "commune_nom";

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

    const data: ZoneDetail = {
      zone: {
        code,
        nom: toStringOrNull(rows[0][nomColumn]) || null,
      },
      dernierPrel: {},
      bilans: {},
    };
    if (type === "udis") {
      data.zone.population = toNumberOrNull(rows[0].population) || null;
      data.zone.communesDesservies = await fetchCommunesDesservies(
        connection,
        code,
      );
    }

    // web__resultats_* contient toutes les combinaisons zone × période ×
    // catégorie, y compris vides : on n'en garde que les lignes renseignées.
    rows.forEach((row) => {
      const periode = toStringOrNull(row.periode);
      const categorie = toStringOrNull(row.categorie);
      if (!periode || !categorie) return;

      if (periode === "dernier_prel") {
        const entry: DernierPrelEntry = {
          resultat: toStringOrNull(row.resultat),
          date: toStringOrNull(row.date_dernier_prel),
          nbParametres: toNumberOrNull(row.nb_parametres),
          parametresDetectes: parseParametresDetectes(row.parametres_detectes),
        };
        if (entry.resultat !== null || entry.date !== null) {
          data.dernierPrel[categorie] = entry;
        }
      } else if (periode.startsWith(BILAN_ANNUEL_PREFIX)) {
        // ratio est null exactement quand il n'y a eu aucun prélèvement
        const ratio = toNumberOrNull(row.ratio);
        if (ratio === null) return;
        const annee = periode.slice(BILAN_ANNUEL_PREFIX.length);
        const entry: AnnualEntry = {
          ratio,
          nbPrelevements: Number(row.nb_prelevements),
          nbSupValeurSanitaire: toNumberOrNull(row.nb_sup_valeur_sanitaire),
          parametresDetectes: parseParametresDetectes(row.parametres_detectes),
        };
        data.bilans[categorie] = {
          ...data.bilans[categorie],
          [annee]: entry,
        };
      }
    });

    return data;
  } finally {
    await connection.close();
  }
}
