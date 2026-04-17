import { getDatabaseClient } from "db/client";
import { jobs } from "db/schema";

import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

app.post("/start-session", async (c) => {
	const client = getDatabaseClient();

	const [job] = await client.db
		.insert(jobs)
		.values({ payload: { type: "start-session", sessionId: "test-123" }, status: "pending" })
		.returning();

	return c.json({ sessionId: job.id });
});

export default {
	port: 3000,
	fetch: app.fetch,
};
