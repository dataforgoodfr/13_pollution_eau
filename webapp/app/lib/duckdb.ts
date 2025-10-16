import { DuckDBInstance } from "@duckdb/node-api";
import fs from "fs";
import path from "path";

// Get database path from environment variable or use default
const envDbPath = process.env.DUCKDB_PATH;
const defaultDbPath = path.join(process.cwd(), "../database/data.duckdb");
const dbFilePath = envDbPath || defaultDbPath;

console.log(`Using database path: ${dbFilePath}`);

// Check if the file exists
if (!fs.existsSync(dbFilePath)) {
  throw new Error(
    `Database file not found at ${dbFilePath}. Please check that your DUCKDB_PATH environment variable is correctly set or that the default database exists.`,
  );
}

// Create DB instance
const db = await DuckDBInstance.create(dbFilePath, {
  access_mode: "READ_ONLY",
  max_memory: "2GB",
  threads: "4",
});

// Load the geospatial extension
const connection = await db.connect();
await connection.run("INSTALL spatial;");
await connection.run("LOAD spatial;");

export default db;
