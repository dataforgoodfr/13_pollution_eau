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
