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
const db = await DuckDBInstance.create(dbFilePath);

export default db;
