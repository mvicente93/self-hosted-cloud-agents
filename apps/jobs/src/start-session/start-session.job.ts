import { getDatabaseClient } from "db/client";
import { sessions } from "db/schema";
import { DockerClient, type PortBinding } from "docker";

interface StartSessionPayload {
	type: string;
	sessionId: string;
	port: number;
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

	const agentImage = AGENT_IMAGES[typedPayload.agent] || AGENT_IMAGES.pi;

	const portBindings: PortBinding[] = [
		{
			containerPort: CONTAINER_PORT,
			hostPort: typedPayload.port,
			protocol: "tcp",
		},
	];

	const container = await dockerClient.createContainerWithPorts({
		image: agentImage,
		portBindings,
		env: [`PORT=${CONTAINER_PORT}`],
		labels: {
			sessionId: typedPayload.sessionId,
			agent: typedPayload.agent,
		},
	});

	dockerClient.startContainer(container.Id);

	// Write to sessions table
	const dbClient = getDatabaseClient();
	await dbClient.db.insert(sessions).values({
		port: typedPayload.port,
		agent: typedPayload.agent,
		status: "running",
	});

	return true;
}

export const START_SESSION_JOB = "start-session";
