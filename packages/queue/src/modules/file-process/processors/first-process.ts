import { parser } from "stream-json";
import { streamValues } from "stream-json/streamers/stream-values.js";
import chain from "stream-chain";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SandboxedJob } from "bullmq";
import db from "@repo/db";
import { quicker } from "@repo/utils";
import redisClient from "../../../config/redis.config.js";
import streamArray from "stream-json/streamers/stream-array.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type DocObj = { id: string; title: string; text: string };
type VocabObj = { literal: string; phonetic: string; altPhonetic: string };

export default async function firstProcess(job: SandboxedJob) {
  const filePath = path.join(
    __dirname,
    `../../../../../../apps/server/data/${job.data}`,
  );

  const pipeline = chain([
    fs.createReadStream(filePath),
    parser(),
    streamArray(),
  ]);

  for await (const data of pipeline) {
    const doc: DocObj = data.value as unknown as DocObj;
    await redisClient.HINCRBY("upload:corpus", "length", 1);
    const {
      processedToken,
      processedTitleTokens,
      unProcessedToken,
      unProcessedTitleTokens,
    } = await calculateDocFrequency(doc);
    await calculateIdfScore();
  }
}

const storeDoc = (data: DocObj) => {
  const query = db.prepare(`
      INSERT INTO docs (title, content, total_token)
      VALUES (?, ?, ?)
      ON CONFLICT(title) DO UPDATE SET content=excluded.content, total_token=excluded.total_token
    `);
  const tokenCount = data.text ? data.text.split(/\s+/).length : 0;
  query.run(data.title, data.text, tokenCount);
};

const calculateDocFrequency = async (data: DocObj) => {
  const processedTitleTokensList: string[][] = [];
  const processedTokensList: string[][] = [];

  const unProcessedTitleTokensList: VocabObj[][] = [];
  const unProcessedTokensList: VocabObj[][] = [];

  const titlePipeline = quicker.processTextPipeline(data.title);
  const bodyPipeline = quicker.processTextPipeline(data.text);

  const titleTokens = titlePipeline.map((p) => `${p.literal}-title`);
  const bodyTokens = bodyPipeline.map((p) => p.literal);

  unProcessedTitleTokensList.push(titlePipeline);
  unProcessedTokensList.push(bodyPipeline);

  processedTitleTokensList.push(titlePipeline.map((p) => p.literal));
  const integratedTokens = [...titleTokens, ...bodyTokens];

  processedTokensList.push(integratedTokens);
  const uniqueTokensInDoc = new Set(integratedTokens);

  for (const token of uniqueTokensInDoc) {
    await redisClient.HINCRBY("upload:docfreq", token, 1);
  }

  return {
    processedToken: processedTokensList,
    processedTitleTokens: processedTitleTokensList,
    unProcessedToken: unProcessedTokensList,
    unProcessedTitleTokens: unProcessedTitleTokensList,
  };
};

const calculateIdfScore = async () => {
  await getAllHashEntries();
};

const getAllHashEntries = async () => {
  const corpusLen = await redisClient.hGet("upload:corpus", "length");

  if (!corpusLen) {
    throw new Error("No Corpus length is present");
  }

  const docFreq = new Map<string, number>();
  let cursor = "0";

  do {
    const reply = await redisClient.hScan("upload:docfreq", cursor, {
      COUNT: 5000,
    });
    cursor = reply.cursor;

    const pipeline = redisClient.multi();

    for (let i = 0; i < reply.entries.length; i++) {
      const entry = reply.entries[i] as any;

      docFreq.set(entry.field, Number(entry.value));
    }
    for (const entry of reply.entries) {
      const token = entry.field;
      const count = Number(entry.value);

      const idf = Number(Math.log(Number(corpusLen) / count)).toFixed(3);
      pipeline.hSet("upload:idf", token, idf);
    }

    await pipeline.exec();
  } while (cursor !== "0");
};
