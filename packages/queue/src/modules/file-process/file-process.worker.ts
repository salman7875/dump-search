import { Job, Worker } from "bullmq";
import {
  FILE_PROCESS_QUEUE_NAME,
  FileProcessJobName,
} from "./file-process.types.js";
import connection from "../../config/queue.config.js";
import { fileProcess } from "./processors/index.js";

export const createFileProcessWorker = (): Worker => {
  return new Worker(
    FILE_PROCESS_QUEUE_NAME,
    async (job: Job) => {
      switch (job.name) {
        case FileProcessJobName.PROCESS_FILE:
          fileProcess(job.data);
      }
    },
    { connection, concurrency: 5 },
  );
};
