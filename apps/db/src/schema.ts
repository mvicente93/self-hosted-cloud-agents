import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const jobs = sqliteTable("jobs", {
	id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
	payload: text({ mode: "json" }).notNull(),
	status: text({
		enum: ["pending", "started", "finished", "failed"],
	}).default("pending"),
	created: integer({ mode: "timestamp_ms" }).default(
		sql`(CAST(unixepoch('now', 'subsec') * 1000 AS INTEGER))`,
	),
	updated: integer({ mode: "timestamp_ms" }).default(
		sql`(CAST(unixepoch('now', 'subsec') * 1000 AS INTEGER))`,
	),
});
