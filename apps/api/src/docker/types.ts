export interface Container {
	Id: string;
	Names: string[];
	Image: string;
	ImageID: string;
	Command: string;
	Created: number;
	State: string;
	Status: string;
	Ports: Port[];
	Labels: Record<string, string>;
}

export interface Port {
	IP?: string;
	PrivatePort: number;
	PublicPort?: number;
	Type: string;
}

export interface ContainerInspect {
	Id: string;
	Name: string;
	Config: {
		Image: string;
		Env?: string[];
		Cmd?: string[];
		Labels: Record<string, string>;
	};
	State: {
		Status: string;
		Running: boolean;
		StartedAt: string;
	};
	HostConfig: {
		Memory: number;
		CpuShares: number;
	};
	NetworkSettings: {
		IPAddress: string;
		Gateway: string;
	};
}

export interface CreateContainerConfig {
	Image: string;
	Cmd?: string[];
	Env?: string[];
	Labels?: Record<string, string>;
	HostConfig?: {
		Memory?: number;
		CpuShares?: number;
		PortBindings?: Record<string, Array<{ HostPort: string }>>;
	};
	ExposedPorts?: Record<string, object>;
}

export interface Image {
	Id: string;
	RepoTags?: string[];
	Created: number;
	Size: number;
}

export interface Volume {
	Name: string;
	Mountpoint: string;
	CreatedAt: string;
}

export interface SystemInfo {
	Containers: number;
	ContainersRunning: number;
	Images: number;
	ServerVersion: string;
	MemTotal: number;
	NCPU: number;
	OperatingSystem: string;
}
