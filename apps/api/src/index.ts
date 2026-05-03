import { getDatabaseClient } from "db/client";
import { jobs, sessions } from "db/schema";
import { DockerClient } from "docker";
import { eq } from "drizzle-orm";

import { Hono } from "hono";

const app = new Hono();

const CONTAINER_PORT = 3000;

const dockerClient = new DockerClient();

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

app.post("/start-session", async (c) => {
	const body = await c.req.json();
	const { prompt } = body;

	const client = getDatabaseClient();

	const sessionId = crypto.randomUUID();

	const [job] = await client.db
		.insert(jobs)
		.values({ payload: { type: "start-session", sessionId, prompt }, status: "pending" })
		.returning();

	return c.json({ jobId: job.id, sessionId });
});

// Get session by ID
app.get("/session/:id", async (c) => {
	const sessionId = parseInt(c.req.param("id"));
	const client = getDatabaseClient();

	const [session] = await client.db.select().from(sessions).where(eq(sessions.id, sessionId));

	if (!session) {
		return c.json({ error: "Session not found" }, 404);
	}

	return c.json({
		id: session.id,
		containerId: session.containerId,
		containerIp: session.containerIp,
		agent: session.agent,
		status: session.status,
	});
});

// List all sessions
app.get("/sessions", async (c) => {
	const client = getDatabaseClient();
	const allSessions = await client.db.select().from(sessions);

	return c.json({ sessions: allSessions });
});

// Proxy prompt to container
app.post("/session/:id/prompt", async (c) => {
	const sessionId = parseInt(c.req.param("id"));
	const body = await c.req.json();
	const { prompt } = body;

	const client = getDatabaseClient();
	const [session] = await client.db.select().from(sessions).where(eq(sessions.id, sessionId));

	if (!session) {
		return c.json({ error: "Session not found" }, 404);
	}

	if (!session.containerIp) {
		return c.json({ error: "Container IP not available" }, 500);
	}

	// Forward request to container - continue existing session
	const containerUrl = `http://${session.containerIp}:${CONTAINER_PORT}`;
	const response = await fetch(`${containerUrl}/session/${sessionId}/prompt`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ prompt }),
	});

	const result = await response.json();
	return c.json(result);
});

// Proxy streaming from container
app.get("/session/:id/stream", async (c) => {
	const sessionId = parseInt(c.req.param("id"));
	const client = getDatabaseClient();
	const [session] = await client.db.select().from(sessions).where(eq(sessions.id, sessionId));

	if (!session) {
		return c.json({ error: "Session not found" }, 404);
	}

	if (!session.containerIp) {
		return c.json({ error: "Container IP not available" }, 500);
	}

	// Forward SSE to container - use database session ID
	const containerUrl = `http://${session.containerIp}:${CONTAINER_PORT}`;
	const response = await fetch(`${containerUrl}/session/${sessionId}/stream`);

	// Copy the SSE response to the client
	if (response.body) {
		const reader = response.body.getReader();
		const stream = new ReadableStream({
			async start(controller) {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					controller.enqueue(value);
				}
				controller.close();
			},
		});

		return new Response(stream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	}

	return c.json({ error: "Failed to connect to container" }, 500);
});

// Proxy container logs
app.get("/session/:id/logs", async (c) => {
	const sessionId = parseInt(c.req.param("id"));
	const client = getDatabaseClient();

	const [session] = await client.db.select().from(sessions).where(eq(sessions.id, sessionId));

	if (!session) {
		return c.json({ error: "Session not found" }, 404);
	}

	if (!session.containerId) {
		return c.json({ error: "Container ID not available" }, 500);
	}

	// Get container logs
	const response = await dockerClient.getContainerLogs(session.containerId, {
		stdout: true,
		stderr: true,
		tail: 100,
		timestamps: true,
	});

	if (!response.ok) {
		return c.json({ error: "Failed to get container logs" }, 500);
	}

	const logs = await response.text();

	return c.text(logs);
});

export default {
	port: 3000,
	fetch: app.fetch,
};
