import { DuckDBInstance } from "@duckdb/node-api";

import fs from "fs";
import path from "path";

// Access the database file one level above the current project directory
const dbFilePath = path.join(process.cwd(), "../database", "data.duckdb");
// Check if the file exists
if (!fs.existsSync(dbFilePath)) {
  throw new Error("Database file not found");
}

//TODO: need to handle hot reload in dev mode
console.log("Create DB instance...");
// next build needs access to the file and can't if not using read_only because the file gets locked - @see https://duckdb.org/docs/connect/concurrency
// it may be possible without it if we use the database differently or configure next (maybe ?), but as we are only reading in the db it should be better like this
const db = await DuckDBInstance.create(dbFilePath, {
  access_mode: "READ_ONLY",
});

export default db;
