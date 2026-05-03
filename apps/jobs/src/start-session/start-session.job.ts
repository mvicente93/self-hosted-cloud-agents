import { getDatabaseClient } from "db/client";
import { sessions } from "db/schema";
import { DockerClient } from "docker";
import { eq } from "drizzle-orm";

interface StartSessionPayload {
	type: string;
	sessionId: string;
	prompt?: string;
	agent: string;
}

const AGENT_IMAGES: Record<string, string> = {
	pi: "self-hosted-cloud-agents-pi-container:latest",
	opencode: "self-hosted-cloud-agents-cloud-container:latest",
};

const CONTAINER_PORT = 3000;

export async function startSession(payload: unknown): Promise<boolean> {
	const typedPayload = payload as StartSessionPayload;
	const dockerClient = new DockerClient();

	// First insert placeholder session to get database ID
	const dbClient = getDatabaseClient();
	const [sessionRecord] = await dbClient.db
		.insert(sessions)
		.values({
			agent: typedPayload.agent,
			status: "starting",
		})
		.returning({ id: sessions.id });

	// Create container with the database session ID as environment variable
	const container = await dockerClient.createContainer({
		Image: AGENT_IMAGES.pi,
		Env: [`SESSION_ID=${sessionRecord.id}`],
		Labels: {
			sessionId: typedPayload.sessionId,
			agent: typedPayload.agent,
		},
	});

	await dockerClient.startContainer(container.Id);

	// Get container IP
	const containerIp = await dockerClient.getContainerIp(container.Id);

	// Send initial prompt to container if provided
	if (typedPayload.prompt) {
		const containerUrl = `http://${containerIp}:${CONTAINER_PORT}`;
		try {
			await fetch(`${containerUrl}/session/${sessionRecord.id}/prompt`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ prompt: typedPayload.prompt }),
			});
		} catch (error) {
			console.error("Failed to send initial prompt:", error);
		}
	}

	// Update session with container info
	await dbClient.db
		.update(sessions)
		.set({
			containerId: container.Id,
			containerIp,
			status: "running",
		})
		.where(eq(sessions.id, sessionRecord.id));

	return true;
}

export const START_SESSION_JOB = "start-session";
