import fs from "node:fs";
import path from "node:path";
import chain from "stream-chain";
import { fileURLToPath } from "node:url";
import { parser } from "stream-json";
import { SandboxedJob } from "bullmq";

import redisClient from "../../../config/redis.config.js";
import streamArray from "stream-json/streamers/stream-array.js";
import { DocObj } from "./types/index.js";
import { calculateDocFrequency } from "./phase-1/doc-frequency.js";
import { calculateIdfScore } from "./phase-1/idf-score.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function firstProcess(job: SandboxedJob) {
  const url = `../../../../../../apps/server/data/${job.data}`;
  const filePath = path.join(__dirname, url);

  const pipeline = chain([
    fs.createReadStream(filePath),
    parser(),
    streamArray(),
  ]);

  let corpusLength = 0;
  let multi = redisClient.multi();
  let sinceFlush = 0;

  for await (const data of pipeline) {
    const doc: DocObj = data.value as unknown as DocObj;
    corpusLength += 1;
    await calculateDocFrequency(doc, multi);
    if (++sinceFlush >= 200) {
      await multi.exec();
      multi = redisClient.multi();
      sinceFlush = 0;
    }
  }
  if (sinceFlush > 0) await multi.exec();

  await redisClient.hSet("upload:corpus", "length", corpusLength);
  await calculateIdfScore();
}
