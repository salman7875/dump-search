import { Job, Worker } from "bullmq";
import fs from "node:fs";
import os from "node:os";
import {
  FILE_PROCESS_QUEUE_NAME,
  FileProcessJobName,
} from "./file-process.types.js";
import connection from "../../config/queue.config.js";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const jsPath = path.resolve(
  __dirname,
  "./processors/file-process.processor.js",
);
const tsPath = path.resolve(
  __dirname,
  "./processors/file-process.processor.ts",
);

const processorFilePath = fs.existsSync(jsPath) ? jsPath : tsPath;

export const createFileProcessWorker = (): Worker => {
  const worker = new Worker(FILE_PROCESS_QUEUE_NAME, processorFilePath, {
    connection,
    concurrency: os.cpus().length - 1,
    useWorkerThreads: false,
    lockDuration: 60000,
    lockRenewTime: 30000,
    ...(processorFilePath.endsWith(".ts") && {
      workerForkOptions: {
        execArgv: ["--import", "tsx"],
      },
    }),
  });

  worker.on("failed", (job, err) => {
    console.error(`Job with ${job?.id} failed: ${err}`);
  });

  return worker;
};
