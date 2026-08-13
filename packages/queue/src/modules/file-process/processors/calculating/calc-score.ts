import db from "@repo/db";
import { type ScorePayload } from "../../file-process.types.js";

export const calculateScore = (
  data: { id: string; title: string; text: string }[],
  processedTokens: string[][],
  docIds: number[],
  processedTitleTokens: string[][],
): Map<string, ScorePayload> => {
  try {
    const scoreMap = new Map<string, ScorePayload>();
    const vocabs = db.prepare(`SELECT id, token FROM vocabulary`).all() as {
      id: number;
      token: string;
    }[];
    const vocabMap = new Map<string, number>(
      vocabs.map((v) => [v.token, v.id]),
    );

    for (let i = 0; i < data.length; i++) {
      const docId = docIds[i]!;
      const processedToken = processedTokens[i] || [];
      const processedTitleToken = processedTitleTokens[i] || [];

      const tokenMetaData = new Map<
        string,
        { count: number; position: number[] }
      >();
      let currentStringPos = 0;

      for (const token of processedToken) {
        if (!tokenMetaData.has(token)) {
          tokenMetaData.set(token, { count: 0, position: [] });
        }
        const meta = tokenMetaData.get(token)!;
        meta.count += 1;
        meta.position.push(currentStringPos);
        currentStringPos += token.replace(/-title$/, "").length + 1;
      }

      for (const [token, meta] of tokenMetaData.entries()) {
        const vocabId = vocabMap.get(token);
        if (!vocabId) continue;

        const logTF = 1 + Math.log(meta.count);
        const docLength = token.endsWith("-title")
          ? processedTitleToken.length
          : processedToken.length;

        const denominator = Math.sqrt(docLength || 1);
        const tfScore = +Number(logTF / denominator).toFixed(3);

        scoreMap.set(`${token}::${docId}`, {
          tokenId: vocabId,
          docId: docId,
          tfScore,
          position: meta.position,
        });
      }
    }
    return scoreMap;
  } catch (error) {
    console.error(`Error in calculateScoreJSON:`, error);
    throw error;
  }
};
