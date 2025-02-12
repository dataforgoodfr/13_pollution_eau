import db from "./duckdb";

/**
 * Rows are still read in chunks of 2048 elements.
 */
const ROW_TARGET_COUNT = 1000;

export async function fetchExample() {
  try {
    const connection = await db.connect();

    const result = await connection.runAndReadUntil(
      "SELECT * from sise_resultats",
      ROW_TARGET_COUNT
    );

    // Example of query with a group by :
    // const result = await connection.runAndReadUntil(
    //   "SELECT qualitparam, count(*) from sise_resultats group by qualitparam",
    //   ROW_TARGET_COUNT //(Rows are read in chunks of 2048.)
    // );

    // Example of a prepared statement :
    // const prepared = await connection.prepare(
    //   "SELECT qualitparam, count(*) from sise_resultats where qualitparam = $1 group by qualitparam"
    // );
    // prepared.bindVarchar(1, "O");
    // const result = await prepared.runAndReadUntil(ROW_TARGET_COUNT);
    return result;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch example rows.");
  }
}
