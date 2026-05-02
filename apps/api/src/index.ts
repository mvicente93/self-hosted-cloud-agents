import { getDatabaseClient } from "db/client";
import { jobs } from "db/schema";

import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

app.post("/start-session", async (c) => {
	const client = getDatabaseClient();

	const port = Math.floor(Math.random() * (65536 - 1024)) + 1024;

	const [job] = await client.db
		.insert(jobs)
		.values({ payload: { type: "start-session", sessionId: crypto.randomUUID(), port: port }, status: "pending" })
		.returning();

	return c.json({ sessionId: job.id, port: port });
});

export default {
	port: 3000,
	fetch: app.fetch,
};
