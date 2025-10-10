import db from "./duckdb";

/**
 * Rows are still read in chunks of 2048 elements.
 */
const ROW_TARGET_COUNT = 1000;

export async function fetchExample() {
  try {
    const connection = await db.connect();

    const result = await connection.runAndReadUntil(
      "SELECT * from web__resultats_communes limit 10",
      ROW_TARGET_COUNT,
    );

    // Example of query with a group by :
    // const result = await connection.runAndReadUntil(
    //   "SELECT qualitparam, count(*) from edc_resultats group by qualitparam",
    //   ROW_TARGET_COUNT //(Rows are read in chunks of 2048.)
    // );

    // Example of a prepared statement :
    // const prepared = await connection.prepare(
    //   "SELECT qualitparam, count(*) from edc_resultats where qualitparam = $1 group by qualitparam"
    // );
    // prepared.bindVarchar(1, "O");
    // const result = await prepared.runAndReadUntil(ROW_TARGET_COUNT);
    return result;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch example rows.");
  }
}

interface PollutionStat {
  stat_nom: string;
  stat_chiffre: number | null;
  stat_texte: string | null;
}

export type PollutionStats = PollutionStat[];

export async function fetchPollutionStats(): Promise<PollutionStat[]> {
  try {
    const connection = await db.connect();

    const result = await connection.runAndReadUntil(
      "SELECT stat_nom, stat_chiffre, stat_texte FROM web__stats_udi ORDER BY stat_nom",
      ROW_TARGET_COUNT,
    );

    const stats: PollutionStat[] = [];
    const rows = result.getRowObjects();

    rows.forEach((row) => {
      stats.push({
        stat_nom: String(row.stat_nom),
        stat_chiffre: row.stat_chiffre ? Number(row.stat_chiffre) : null,
        stat_texte: row.stat_texte ? String(row.stat_texte) : null,
      });
    });

    console.log("Fetched pollution stats:", stats);

    return stats;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch pollution statistics.");
  }
}

interface ParameterValue {
  cdparametresiseeaux: string;
  categorie_2: string | null;
  categorie_3: string | null;
  limite_qualite: number | null;
  limite_indicative: number | null;
  valeur_sanitaire_1: number | null;
  web_label: string | null;
}

export type ParameterValues = Record<string, ParameterValue>;

export async function fetchParameterValues(): Promise<ParameterValues> {
  try {
    const connection = await db.connect();

    const result = await connection.runAndReadUntil(
      "SELECT cdparametresiseeaux, categorie_2, categorie_3, limite_qualite, limite_indicative, valeur_sanitaire_1, web_label FROM int__valeurs_de_reference",
      ROW_TARGET_COUNT,
    );

    const parameterValues: ParameterValues = {};
    const rows = result.getRowObjects();

    rows.forEach((row) => {
      const code = String(row.cdparametresiseeaux);
      parameterValues[code] = {
        cdparametresiseeaux: code,
        categorie_2: row.categorie_2 ? String(row.categorie_2) : null,
        categorie_3: row.categorie_3 ? String(row.categorie_3) : null,
        limite_qualite: row.limite_qualite ? Number(row.limite_qualite) : null,
        limite_indicative: row.limite_indicative
          ? Number(row.limite_indicative)
          : null,
        valeur_sanitaire_1: row.valeur_sanitaire_1
          ? Number(row.valeur_sanitaire_1)
          : null,
        web_label: row.web_label ? String(row.web_label) : null,
      };
    });

    console.log(
      "Fetched parameter values:",
      Object.keys(parameterValues).length,
      "parameters",
    );

    return parameterValues;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch parameter values.");
  }
}
