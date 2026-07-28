import fs from "node:fs";
import os from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Worker } from "bullmq";

import { FILE_PROCESS_QUEUE_NAME } from "./file-process.types.js";
import connection from "../../config/queue.config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fileName = "./processors/file-process.processor";

const jsPath = path.resolve(__dirname, `${fileName}.js`);
const tsPath = path.resolve(__dirname, `${fileName}.ts`);

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
