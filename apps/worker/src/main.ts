import { createFileProcessWorker } from "@repo/queue";

const worker = createFileProcessWorker();

console.log("File process worker started running!");

const shutdown = async () => {
  console.log("Closing worker connection");
  await worker.close();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
