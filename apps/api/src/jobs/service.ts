import { sleep } from "bun";
import { eq, sql } from "drizzle-orm";
import { getDatabaseClient } from "../db/client";
import { jobs } from "../db/schema";

export class JobsService {
	private dbClient;

	constructor() {
		this.dbClient = getDatabaseClient();
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

	private async process(job) {
		console.log("Processing job:", job.id);
		return true;
	}

	private async finish(jobId: number) {
		console.log("Finished job:", jobId);
		await this.dbClient.db
			.update(jobs)
			.set({ status: "finished" })
			.where(eq(jobs.id, jobId));
	}

	private async fail(jobId: number) {
		console.log("Failed job:", jobId);
		await this.dbClient.db
			.update(jobs)
			.set({ status: "failed" })
			.where(eq(jobs.id, jobId));
	}

	async run() {
		while (true) {
			const [newJob] = await this.claim();
			if (newJob !== undefined) {
				console.log("Claimed job:", newJob.id);
			}

			if (!newJob) {
				sleep(1000);
				continue;
			}

			const ok = this.process(newJob);

			if (!ok) {
				this.fail(newJob.id);
				break;
			}
			this.finish(newJob.id);
		}
	}
}
