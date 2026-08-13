import { fileURLToPath } from "node:url";
import afs from "node:fs/promises";
import path from "node:path";

import { calculateDocFrequency } from "./calculating/calc-doc-freq.js";
import { calculateIdfScore } from "./calculating/calc-idf-score.js";
import { calculateScore } from "./calculating/calc-score.js";
import { storeDoc } from "./storing/store-doc.js";
import { storeScores } from "./storing/store-score.js";
import { storeTokens } from "./storing/store-token.js";
import { SandboxedJob } from "bullmq";

const __filename = fileURLToPath(import.meta.url);
const __dirname = __filename.substring(0, __filename.lastIndexOf("/"));

export default function fileProcess(job: SandboxedJob) {
  return new Promise(async (resolve, reject) => {
    const url = "../../../../../../apps/server/data";
    const filePath = path.join(__dirname, url, job.data);

    const data = await afs.readFile(path.join(filePath), "utf-8");
    const parsedData = JSON.parse(data);

    const { docData, docIds } = storeDoc(parsedData);

    const {
      docFrequency,
      processedToken,
      processedTitleTokens,
      unProcessedTitleTokens,
      unProcessedToken,
    } = calculateDocFrequency(docData);

    const idfScore = calculateIdfScore(docData.length || 1, docFrequency);
    storeTokens(docData, unProcessedToken, unProcessedTitleTokens, idfScore);
    const scoreMap = calculateScore(
      docData,
      processedToken,
      docIds,
      processedTitleTokens,
    );
    storeScores(scoreMap);
    resolve("Success!");
  });
}
