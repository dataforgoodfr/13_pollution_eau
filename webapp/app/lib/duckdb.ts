import duckdb from '@duckdb/node-api';
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
// const db = await DuckDBInstance.create(dbFilePath, {
//   access_mode: "READ_ONLY",
//   max_memory: "512MB",
//   threads: "4",
// });

class Database{
  private static instance: Database
  private db: duckdb.DuckDBInstance
  private connection: duckdb.DuckDBConnection

  constructor(duckdb:duckdb.DuckDBInstance, connection:duckdb.DuckDBConnection ){
    this.db = duckdb
    this.connection = connection
  }
  // use singlon pattern to ensure the unique instance
  public static async getInstance():Promise<Database>{
    const db = await duckdb.DuckDBInstance.create(dbFilePath, {
        access_mode: "READ_ONLY",
        max_memory: "512MB",
        threads: "4",
    });
    const connection = await db.connect();
    return new Database(db, connection)
  }

  async run(sql:string){
    try{
      const results = await this.connection.run(sql)
      return results
    }catch(error){
      console.error('run error:', error);
      throw error;
    }
  }

  async runAndReadUntil(sql:string, rows:number){
    try{
      const reader = await this.connection.runAndReadUntil(sql,rows)
      const rows = reader.getRows();
      return rows
    }catch(error){
      console.error('runAndReadUntil error:', error);
      throw error;
    }
  }

  // const result = await connection.runAndReadUntil(
  //   "SELECT * from ana__resultats_communes limit 10",
  //   ROW_TARGET_COUNT,
  // );

}
export default db;
