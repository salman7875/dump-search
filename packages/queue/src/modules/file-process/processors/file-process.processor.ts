import { calculateDocFrequency } from "./calc-doc-freq.js";
import { calculateIdfScore } from "./calc-idf-score.js";
import { calculateScore } from "./calc-score.js";
import { storeDoc } from "./store-doc.js";
import { storeScores } from "./store-score.js";
import { storeTokens } from "./store-token.js";
import { SandboxedJob } from "bullmq";

export default function fileProcess(job: SandboxedJob) {
  return new Promise((resolve, reject) => {
    const { docData, docIds } = storeDoc(job.data);

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
