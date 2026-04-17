import { Database } from "bun:sqlite";
import { existsSync, unlinkSync } from "fs";
import { JobsService } from "./src/service";

const DB_PATH = "../db/sqlite/test.db";

if (existsSync(DB_PATH)) {
	unlinkSync(DB_PATH);
}

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
	.run(JSON.stringify({ type: "start-session", sessionId: "test-123" }));

console.log("Inserted job:", result.lastInsertRowid);

process.env.DB_PATH = DB_PATH;

const service = new JobsService();
await service.run();
