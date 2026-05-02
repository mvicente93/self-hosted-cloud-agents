import { Hono } from "hono";
import { 
	AuthStorage, 
	createAgentSession, 
	ModelRegistry, 
	SessionManager 
} from "@mariozechner/pi-coding-agent";

const app = new Hono();

// Store active sessions
const sessions = new Map<string, any>();

// SSE clients for each session
const sseClients = new Map<string, Set<(data: string) => void>>();

app.get("/", (c) => {
	return c.text("Pi Agent API");
});

// Create a new session and start prompting
app.post("/session", async (c) => {
	const body = await c.req.json();
	const { prompt, workingDirectory = "/tmp" } = body;
	
	const authStorage = AuthStorage.create();
	const modelRegistry = ModelRegistry.create(authStorage);
	
	const { session } = await createAgentSession({
		sessionManager: SessionManager.inMemory(),
		authStorage,
		modelRegistry,
		cwd: workingDirectory,
	});

	const sessionId = crypto.randomUUID();
	sessions.set(sessionId, session);
	sseClients.set(sessionId, new Set());

	// Subscribe to events and stream to SSE clients
	session.subscribe((event) => {
		const clients = sseClients.get(sessionId);
		if (!clients) return;

		switch (event.type) {
			case "message_update":
				if (event.assistantMessageEvent.type === "text_delta") {
					const data = JSON.stringify({ type: "text", delta: event.assistantMessageEvent.delta });
					clients.forEach(client => client(data));
				}
				if (event.assistantMessageEvent.type === "thinking_delta") {
					const data = JSON.stringify({ type: "thinking", delta: event.assistantMessageEvent.delta });
					clients.forEach(client => client(data));
				}
				break;
			
			case "tool_execution_start":
				const startData = JSON.stringify({ type: "tool_start", tool: event.toolName });
				clients.forEach(client => client(startData));
				break;
			
			case "tool_execution_update":
				if (event.output !== undefined) {
					const updateData = JSON.stringify({ type: "tool_output", output: event.output });
					clients.forEach(client => client(updateData));
				}
				break;
			
			case "tool_execution_end":
				const endData = JSON.stringify({ 
					type: "tool_end", 
					tool: event.toolName,
					error: event.isError 
				});
				clients.forEach(client => client(endData));
				break;
			
			case "message_start":
				const msgStartData = JSON.stringify({ type: "message_start" });
				clients.forEach(client => client(msgStartData));
				break;
			
			case "message_end":
				const msgEndData = JSON.stringify({ type: "message_end" });
				clients.forEach(client => client(msgEndData));
				break;
			
			case "agent_start":
				const agentStartData = JSON.stringify({ type: "agent_start" });
				clients.forEach(client => client(agentStartData));
				break;
			
			case "agent_end":
				const agentEndData = JSON.stringify({ 
					type: "agent_end",
					message: event.messages[event.messages.length - 1]
				});
				clients.forEach(client => client(agentEndData));
				break;
		}
	});

	// Start the prompt (non-blocking)
	session.prompt(prompt).catch(console.error);
	
	return c.json({ sessionId });
});

// Continue a session with a new prompt
app.post("/session/:id/prompt", async (c) => {
	const sessionId = c.req.param("id");
	const body = await c.req.json();
	const { prompt } = body;
	
	const session = sessions.get(sessionId);
	if (!session) {
		return c.json({ error: "Session not found" }, 404);
	}

	await session.prompt(prompt);
	return c.json({ success: true });
});

// SSE endpoint for streaming events
app.get("/session/:id/stream", async (c) => {
	const sessionId = c.req.param("id");
	const session = sessions.get(sessionId);
	
	if (!session) {
		return c.json({ error: "Session not found" }, 404);
	}

	const clients = sseClients.get(sessionId);
	if (!clients) {
		return c.json({ error: "No SSE clients" }, 404);
	}

	// Set up SSE response
	c.header("Content-Type", "text/event-stream");
	c.header("Cache-Control", "no-cache");
	c.header("Connection", "keep-alive");

	let client: (data: string) => void;
	
	const promise = new Promise<void>((resolve) => {
		client = (data: string) => {
			c.res.send(`data: ${data}\n\n`);
		};
		clients.add(client!);
		
		// Clean up on disconnect
		c.req.raw.signal.addEventListener("abort", () => {
			clients.delete(client!);
			resolve();
		});
	});

	await promise;
});

// Abort a running prompt
app.post("/session/:id/abort", async (c) => {
	const sessionId = c.req.param("id");
	const session = sessions.get(sessionId);
	
	if (!session) {
		return c.json({ error: "Session not found" }, 404);
	}

	await session.abort();
	return c.json({ success: true });
});

// Delete a session
app.delete("/session/:id", async (c) => {
	const sessionId = c.req.param("id");
	const session = sessions.get(sessionId);
	
	if (!session) {
		return c.json({ error: "Session not found" }, 404);
	}

	session.dispose();
	sessions.delete(sessionId);
	sseClients.delete(sessionId);
	
	return c.json({ success: true });
});

// List sessions
app.get("/sessions", (c) => {
	const list = Array.from(sessions.keys()).map(id => ({
		id,
		sessionId: sessions.get(id)?.sessionId,
	}));
	return c.json({ sessions: list });
});

const port = parseInt(process.env.PORT || "3000", 10);

export default {
	port,
	fetch: app.fetch,
};