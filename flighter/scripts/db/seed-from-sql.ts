import "dotenv/config";
import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { Client } from "pg";

const SQL_FILE_PATTERN = /^\d{3}_.+\.sql$/;

const resolveSeedDirectory = () => {
  if (process.env.SEED_SQL_DIR) {
    return path.resolve(process.cwd(), process.env.SEED_SQL_DIR);
  }

  return path.resolve(process.cwd(), "../data-mining/sql_statements");
};

const resolveSqlFiles = async (seedDir: string) => {
  const files = await fs.readdir(seedDir);
  return files.filter((file) => SQL_FILE_PATTERN.test(file)).sort();
};

const main = async () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to run seed scripts");
  }

  const seedDir = resolveSeedDirectory();
  const sqlFiles = await resolveSqlFiles(seedDir);

  if (!sqlFiles.length) {
    throw new Error(`No SQL seed files found in ${seedDir}`);
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  let inTransaction = false;

  try {
    for (const fileName of sqlFiles) {
      const filePath = path.join(seedDir, fileName);
      const sql = await fs.readFile(filePath, "utf8");

      if (!sql.trim()) {
        continue;
      }

      console.log(`Seeding ${fileName}`);
      await client.query("BEGIN");
      inTransaction = true;
      await client.query(sql);
      await client.query("COMMIT");
      inTransaction = false;
    }
  } catch (error) {
    if (inTransaction) {
      await client.query("ROLLBACK");
    }
    throw error;
  } finally {
    await client.end();
  }
};

main().catch((error) => {
  console.error("Seed execution failed:", error);
  process.exit(1);
});
