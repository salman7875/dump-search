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
import db from "@repo/db";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function firstProcess(job: SandboxedJob) {
  await phase1(job.data);
  await phase2(job.data);
}

const phase1 = async (data: any) => {
  const url = `../../../../../../apps/server/data/${data}`;
  const filePath = path.join(__dirname, url);

  const pipeline = chain([
    fs.createReadStream(filePath),
    parser(),
    streamArray(),
  ]);

  let corpusLength = 0;
  let multi = redisClient.multi();
  let sinceFlush = 0;
  let result: any[][] = [];

  for await (const data of pipeline) {
    const doc: DocObj = data.value as unknown as DocObj;
    corpusLength += 1;
    await calculateDocFrequency(doc, multi);
    const tokenCount = doc.text
      ? doc.title
        ? doc.text.split(/\s+./).length + doc.title.split(/\s+./).length
        : doc.text.split(/\s+./).length
      : 0;
    result.push([doc.title, doc.text, tokenCount]);

    if (++sinceFlush >= 200) {
      await multi.exec();
      multi = redisClient.multi();
      sinceFlush = 0;
      storeDoc(result);
      result = [];
    }
  }
  if (sinceFlush > 0) {
    await multi.exec();
    storeDoc(result);
  }

  await redisClient.hSet("upload:corpus", "length", corpusLength);
  await calculateIdfScore();
};

const phase2 = async (data: any) => {
  const url = `../../../../../../apps/server/data/${data}`;
  const filePath = path.join(__dirname, url);

  const pipeline = chain([
    fs.createReadStream(filePath),
    parser(),
    streamArray(),
  ]);
  for await (const data of pipeline) {
    const doc: DocObj = data.value as unknown as DocObj;
    await storeTokens();
  }
};

const storeDoc = (data: any[][]) => {
  const insertDoc = db.prepare(`
      INSERT INTO docs (title, content, total_token) 
      VALUES (?, ?, ?) 
      ON CONFLICT(title) DO UPDATE SET content=excluded.content, total_token=excluded.total_token
      RETURNING id;
    `);

  const insertMany = db.transaction((values) => {
    for (const value of values) {
      insertDoc.run(value);
    }
  });

  insertMany(data);
};

const storeTokens = async () => {
  try {
    const uniqueTokens = await redisClient.SMEMBERS("unique:tokens");
    let result: any[][] = [];

    for (const token of uniqueTokens) {
      const info = await redisClient.hmGet(`token:${token}`, [
        "phoneticToken",
        "altPhoneticToken",
      ]);
      const idfScore = await redisClient.HGET("idf", token);
      result.push([token, ...info, idfScore]);
    }
    const query = db.prepare(`
      INSERT INTO vocabulary (token, phonetic_token, alt_phonetic_token, idf_score) 
      VALUES (?, ?, ?, ?)
      ON CONFLICT(token) DO UPDATE SET
        phonetic_token = excluded.phonetic_token,
        alt_phonetic_token = excluded.alt_phonetic_token,
        idf_score = excluded.idf_score
    `);

    const insertMany = db.transaction((data: string[][]) => {
      for (const d of data) {
        query.run(d);
      }
    });

    insertMany(result);
  } catch (error) {
    console.log(`Error in storing tokens: ${error}`);
  }
};

const calculateScore = async () => {
  const uniqueTokens = await redisClient.SMEMBERS("unique:tokens");
  const docIds = db.prepare(`SELECT id from docs`).all();
  const vocab = db.prepare(`SELECT id, token FROM vocabulary`).all() as {
    id: number;
    token: string;
  }[];
  const vocabMap = new Map(vocab.map((v) => [v.token, v.id]));
};
