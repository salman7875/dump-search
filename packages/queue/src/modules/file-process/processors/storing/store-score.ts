import db from "@repo/db";
import { type ScorePayload } from "../file-process.types.js";

export const storeScores = (scoreMap: Map<string, ScorePayload>) => {
  try {
    const insertInstance = db.prepare(`
      INSERT INTO scores (token_id, doc_id, tf_score, position) 
      VALUES (?, ?, ?, ?)
      ON CONFLICT(token_id, doc_id) DO UPDATE SET
        tf_score = excluded.tf_score,
        position = excluded.position
    `);

    const insertMany = db.transaction((entries) => {
      for (const [_, value] of entries) {
        insertInstance.run([
          value.tokenId,
          value.docId,
          value.tfScore,
          Buffer.from(JSON.stringify(value.position)),
        ]);
      }
    });

    insertMany(scoreMap.entries());
  } catch (error) {
    console.error(`Error in storeScores:`, error);
    throw error;
  }
};
