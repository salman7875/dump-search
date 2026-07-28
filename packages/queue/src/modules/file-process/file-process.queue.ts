import { Queue } from "bullmq";
import { FILE_PROCESS_QUEUE_NAME } from "./file-process.types.js";
import connection from "../../config/queue.config.js";

export const fileProcessQueue = new Queue(FILE_PROCESS_QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 24 * 60 * 60 },
  },
});
