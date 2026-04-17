import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";

class DatabaseClient {
	private dbPath: string;
	public db;

	constructor(dbPath: string) {
		this.dbPath = dbPath;
		this.db = this.init();
	}

	private init() {
		const sqlite = new Database(this.dbPath);
		const db = drizzle({ client: sqlite });
		db.run("PRAGMA journal_mode = WAL;");
		return db;
	}
}

export function getDatabaseClient() {
	if (!process.env.DB_PATH) {
		return new DatabaseClient(":memory:");
	}
	return new DatabaseClient(process.env.DB_PATH);
}
