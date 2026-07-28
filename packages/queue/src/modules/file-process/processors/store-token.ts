import db from "@repo/db";
import { VocabPayload } from "../file-process.types.js";

export const storeTokens = (
  data: { id: string; title: string; text: string }[],
  tokens: {
    literal: string;
    phonetic: string;
    altPhonetic: string;
  }[][],
  titleToken: {
    literal: string;
    phonetic: string;
    altPhonetic: string;
  }[][],
  idfScore: Map<string, number>,
) => {
  try {
    const results: VocabPayload[] = [];
    const seen = new Set<string>();

    titleToken.forEach((tokens) => {
      tokens.forEach((token) => {
        const key = `${token.literal}-title`;
        const uniqueKey = `${key}::${token.phonetic}::${token.altPhonetic}`;
        if (seen.has(uniqueKey)) return;
        seen.add(uniqueKey);

        results.push({
          token: token.literal,
          phonetic_token: token.phonetic,
          alt_phonetic_token: token.altPhonetic,
        });
      });
    });

    tokens.forEach((btokens) => {
      btokens.forEach((token) => {
        const uniqueKey = `${token.literal}::${token.phonetic}::${token.altPhonetic}`;
        if (seen.has(uniqueKey)) return;
        seen.add(uniqueKey);
        results.push({
          token: token.literal,
          phonetic_token: token.phonetic,
          alt_phonetic_token: token.altPhonetic,
        });
      });
    });

    const insertVocab = db.prepare(`
      INSERT INTO vocabulary (token, phonetic_token, alt_phonetic_token, idf_score) 
      VALUES (?, ?, ?, ?)
      ON CONFLICT(token) DO UPDATE SET
        phonetic_token = excluded.phonetic_token,
        alt_phonetic_token = excluded.alt_phonetic_token,
        idf_score = excluded.idf_score
    `);

    const insertMany = db.transaction((vocabList: VocabPayload[]) => {
      for (const item of vocabList) {
        insertVocab.run([
          item.token,
          item.phonetic_token || "",
          item.alt_phonetic_token || "",
          idfScore.get(item.token) || 0,
        ]);
      }
    });

    insertMany(results);
  } catch (error) {
    console.error(`Error in storeTokensJSON:`, error);
    throw error;
  }
};
