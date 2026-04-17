import { DockerClient } from "docker";

export async function startSession(payload: unknown): Promise<boolean> {
	const dockerClient = new DockerClient();

	const container = await dockerClient.createContainer({
		Image: "self-hosted-cloud-agents-cloud-container:latest",
	});

	dockerClient.startContainer(container.Id);
	return true;
}

export const START_SESSION_JOB = "start-session";
