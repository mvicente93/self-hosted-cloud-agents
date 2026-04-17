import { sleep } from "bun";
import { getDatabaseClient } from "db/client";
import { jobs } from "db/schema";
import { eq, sql } from "drizzle-orm";
import { START_SESSION_JOB, startSession } from "./start-session/start-session.job";

export class JobsService {
	private dbClient!: ReturnType<typeof getDatabaseClient>;
	private jobsRegister: Record<string, (payload: unknown) => Promise<boolean>>;

	constructor() {
		this.dbClient = getDatabaseClient();
		this.jobsRegister = {};
		this.registerJobs();
	}

	private registerJobs() {
		this.jobsRegister = {
			[START_SESSION_JOB]: startSession,
		};
	}

	private async claim() {
		return await this.dbClient.db
			.update(jobs)
			.set({
				status: "started",
				updated: sql`(CAST(unixepoch('now', 'subsec') * 1000 AS INTEGER))`,
			})
			.where(sql`${jobs.id} = (
				SELECT id FROM ${jobs}
				WHERE ${jobs.status} = 'pending'
				ORDER BY ${jobs.created}
				LIMIT 1
				)`)
			.returning({ id: jobs.id, payload: jobs.payload });
	}

	private async process(job: { id: number; payload: unknown }) {
		const payload = job.payload as { type: string };
		const handler = this.jobsRegister[payload.type];
		if (!handler) {
			console.error("No handler for job type:", payload.type);
			return false;
		}
		console.log("Processing job:", job.id, "type:", payload.type);
		return await handler(job.payload);
	}

	private async finish(jobId: number) {
		console.log("Finished job:", jobId);
		await this.dbClient.db.update(jobs).set({ status: "finished" }).where(eq(jobs.id, jobId));
	}

	private async fail(jobId: number) {
		console.log("Failed job:", jobId);
		await this.dbClient.db.update(jobs).set({ status: "failed" }).where(eq(jobs.id, jobId));
	}

	async run() {
		console.log("Service is running!");
		while (true) {
			const [newJob] = await this.claim();
			if (newJob !== undefined) {
				console.log("Claimed job:", newJob.id);
			}

			if (!newJob) {
				sleep(1000);
				continue;
			}

			const ok = await this.process(newJob);

			if (!ok) {
				this.fail(newJob.id);
				break;
			}
			this.finish(newJob.id);
		}
	}
}
