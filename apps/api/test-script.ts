import { Database } from "bun:sqlite";

const DB_PATH = "./src/db/test.db";

const sqlite = new Database(DB_PATH);
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS "jobs" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "payload" TEXT NOT NULL,
    "status" TEXT DEFAULT 'pending',
    "created" INTEGER DEFAULT (CAST(unixepoch('now', 'subsec') * 1000 AS INTEGER)),
    "updated" INTEGER DEFAULT (CAST(unixepoch('now', 'subsec') * 1000 AS INTEGER))
  );
`);

const result = sqlite
	.query("INSERT INTO jobs (payload, status) VALUES (?, 'pending')")
	.run(JSON.stringify({ message: "test job" }));

console.log("Inserted job:", result.lastInsertRowid);

process.env.DB_PATH = DB_PATH;

const { JobsService } = await import("./src/jobs/service");
const service = new JobsService();
await service.run();
