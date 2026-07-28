import { Job, Worker } from "bullmq";
import {
  FILE_PROCESS_QUEUE_NAME,
  FileProcessJobName,
} from "./file-process.types.js";
import connection from "../../config/queue.config.js";
import { fileProcess } from "./processors/index.js";

export const createFileProcessWorker = (): Worker => {
  const worker = new Worker(
    FILE_PROCESS_QUEUE_NAME,
    async (job: Job) => {
      switch (job.name) {
        case FileProcessJobName.PROCESS_FILE:
          return await fileProcess(job.data);
        default:
          throw new Error(`Unhandled job type: ${job.name}`);
      }
    },
    { connection, concurrency: 5, lockDuration: 60000, lockRenewTime: 30000 },
  );

  worker.on("failed", (job, err) => {
    console.error(`Job with ${job?.id} failed: ${err}`);
  });

  return worker;
};
