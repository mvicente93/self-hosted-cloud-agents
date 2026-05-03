import { fetch } from "bun";
import type {
	Container,
	ContainerInspect,
	CreateContainerConfig,
	Image,
	PortBinding,
	SystemInfo,
	Volume,
} from "./types";

export class DockerClient {
	private socketPath: string;

	constructor(socketPath = "/var/run/docker.sock") {
		this.socketPath = socketPath;
	}

	private async request<T>(
		method: string,
		path: string,
		body?: unknown,
	): Promise<T> {
		const url = `http://localhost${path}`;

		const response = await fetch(url, {
			method,
			headers: {
				"Content-Type": "application/json",
			},
			body: body ? JSON.stringify(body) : undefined,
			unix: this.socketPath,
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Docker API error: ${response.status} - ${error}`);
		}

		return response.json() as Promise<T>;
	}

	async listContainers(all = false): Promise<Container[]> {
		return this.request<Container[]>("GET", `/containers/json?all=${all}`);
	}

	async getContainer(id: string): Promise<ContainerInspect> {
		return this.request<ContainerInspect>("GET", `/containers/${id}/json`);
	}

	async getContainerIp(id: string): Promise<string> {
		const inspect = await this.getContainer(id);
		return inspect.NetworkSettings?.IPAddress || "";
	}

	async startContainer(id: string): Promise<void> {
		await this.request("POST", `/containers/${id}/start`);
	}

	async stopContainer(id: string, timeout = 10): Promise<void> {
		await this.request("POST", `/containers/${id}/stop?t=${timeout}`);
	}

	async restartContainer(id: string, timeout = 10): Promise<void> {
		await this.request("POST", `/containers/${id}/restart?t=${timeout}`);
	}

	async removeContainer(
		id: string,
		force = false,
		removeVolumes = false,
	): Promise<void> {
		await this.request(
			"DELETE",
			`/containers/${id}?force=${force}&v=${removeVolumes}`,
		);
	}

	async createContainer(config: CreateContainerConfig): Promise<{ Id: string }> {
		return this.request<{ Id: string }>("POST", "/containers/create", config);
	}

	async createContainerWithPorts({
		image,
		portBindings,
		env,
		labels,
		cmd,
	}: {
		image: string;
		portBindings?: PortBinding[];
		env?: string[];
		labels?: Record<string, string>;
		cmd?: string[];
	}): Promise<{ Id: string }> {
		const exposedPorts: Record<string, object> = {};
		const hostPortBindings: Record<string, Array<{ HostPort: string }>> = {};

		if (portBindings) {
			for (const binding of portBindings) {
				const protocol = binding.protocol || "tcp";
				const containerPortKey = `${binding.containerPort}/${protocol}`;
				exposedPorts[containerPortKey] = {};
				hostPortBindings[containerPortKey] = [{ HostPort: String(binding.hostPort) }];
			}
		}

		const config: CreateContainerConfig = {
			Image: image,
			Cmd: cmd,
			Env: env,
			Labels: labels,
			ExposedPorts: Object.keys(exposedPorts).length > 0 ? exposedPorts : undefined,
			HostConfig: {
				PortBindings: Object.keys(hostPortBindings).length > 0 ? hostPortBindings : undefined,
			},
		};

		return this.createContainer(config);
	}

	async execInContainer(
		containerId: string,
		cmd: string[],
		attachStdin = false,
	): Promise<{ Output: string }> {
		const execConfig = {
			AttachStdin: attachStdin,
			Cmd: cmd,
			Tty: false,
		};

		const { Id: execId } = await this.request<{ Id: string }>(
			"POST",
			`/containers/${containerId}/exec`,
			execConfig,
		);

		const { Output } = await this.request<{ Output: string }>(
			"POST",
			`/exec/${execId}/start`,
			{ Detach: true, Tty: false },
		);

		return { Output: Output || "" };
	}

	async listImages(): Promise<Image[]> {
		return this.request<Image[]>("GET", "/images/json");
	}

	async pullImage(name: string): Promise<void> {
		await this.request("POST", `/images/create?fromImage=${name}`);
	}

	async removeImage(id: string, force = false): Promise<void> {
		await this.request("DELETE", `/images/${id}?force=${force}`);
	}

	async listVolumes(): Promise<{ Volumes: Volume[] }> {
		return this.request("GET", "/volumes");
	}

	async systemInfo(): Promise<SystemInfo> {
		return this.request("GET", "/info");
	}

	async ping(): Promise<{ OK: boolean }> {
		return this.request("GET", "/_ping");
	}
}

export type {
	Container,
	ContainerInspect,
	CreateContainerConfig,
	Image,
	PortBinding,
	SystemInfo,
	Volume,
};
