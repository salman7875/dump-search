import db from '../../libs/schema/db.js';
import { quicker } from '../../utils/quicker.js';

const calculateDocFrequency = (
  data: string[],
): { docFrequency: Map<string, number>; processedToken: string[][] } => {
  try {
    const docFrequency = new Map<string, number>();
    const processedToken: string[][] = [];

    for (const d of data) {
      const tokens: string[] = quicker.processText(d);
      processedToken.push(tokens);

      const uniqueTokensInDoc = new Set(tokens);

      for (const token of uniqueTokensInDoc) {
        docFrequency.set(token, (docFrequency.get(token) || 0) + 1);
      }
    }

    return { docFrequency, processedToken };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error in (calculateDocFrequency): ${error.message}`);
    } else {
      console.log(error);
    }
    throw error;
  }
};

const calculateIdfScore = (
  data: string[],
  docFrequency: Map<string, number>,
): Map<string, number> => {
  try {
    const idfScore = new Map<string, number>();
    const docLen = data.length;
    for (const [token, count] of docFrequency.entries()) {
      idfScore.set(token, +Number(Math.log(docLen / count)).toFixed(3));
    }

    return idfScore;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error in (calculteIdfScore): ${error.message}`);
    } else {
      console.error(error);
    }
    throw error;
  }
};

/**
 *
 * @param {*} data
 * @param {*} docIds
 * @returns { scoreMap }
 */
const calculateScore = (
  data: string[],
  processedTokens: string[][],
  docIds: number[],
): Map<
  string,
  { tokenId: number; docId: number; tfScore: number; position: number[] }
> => {
  try {
    const scoreMap = new Map<
      string,
      { tokenId: number; docId: number; tfScore: number; position: number[] }
    >();

    const vocabs: { id: number; token: string }[] = db
      .prepare(`SELECT id, token FROM vocabulary`)
      .all();
    const vocabMap = new Map<string, number>(
      vocabs.map((vocab) => [vocab.token, vocab.id]),
    );

    for (let i = 0; i < data.length; i++) {
      const docId = docIds[i];
      const localTF = new Map();
      const processedToken: string[] = processedTokens[i] as string[];

      let count = 0;

      for (const token of processedToken) {
        if (localTF.has(token)) {
          localTF.set(token, localTF.get(token) + 1);
        } else {
          localTF.set(token, 0);
        }
      }

      for (const token of processedToken) {
        if (scoreMap.has(`${token}::${docId}`)) {
          scoreMap.get(`${token}::${docId}`)?.position.push(count);
        } else {
          scoreMap.set(`${token}::${docId}`, {
            tokenId: vocabMap.get(token) as number,
            docId: docId as number,
            tfScore: +Number(
              localTF.get(token) / processedToken.length,
            ).toFixed(3),
            position: [count],
          });
        }
        count += token.length + 1;
      }
    }

    return scoreMap;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error in (calculateScore): ${error.message}`);
    } else {
      console.error(error);
    }
    throw error;
  }
};

/**
 *
 * @param {*} data
 * @returns { docData: data[], docIds: number[] }
 */
const storeDocData = (
  data: string,
): { docData: string[]; docIds: number[] } => {
  try {
    const docData: string[] = data.split('\n\n');
    const docIds: number[] = [];

    const insertDoc = db.prepare(
      `INSERT INTO docs (title, content, total_token) 
         VALUES (?, ?, ?) 
         ON CONFLICT(title) DO UPDATE SET content=excluded.content 
         RETURNING id;`,
    );

    const insertMany = db.transaction((docData: string[]) => {
      for (let i = 0; i < docData.length; i++) {
        const title = `Document ${i + 1}`;
        const result = insertDoc.get(title, docData[i], docData[i]?.length);
        docIds.push(result.id);
      }
    });

    insertMany(docData);

    return { docData, docIds };
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error in (StoreDocData): ${error.message}`);
    } else {
      console.error(error);
    }
    throw error;
  }
};

/**
 *
 * @param {*} data
 * @param {*} idfScore
 * @returns { null }
 */
const storeTokens = (
  data: string[],
  processedTokens: string[][],
  idfScore: Map<string, number>,
) => {
  try {
    const results: {
      token: string;
      phonetic_token: string;
      alt_phonetic_token: string;
    }[] = [];
    const seen = new Set<string>();

    for (const [i, d] of data.entries()) {
      const proccesedToken = processedTokens[i] as string[];

      const phoneticToken: string[][] = quicker.processPhonetic(
        d,
      ) as string[][];

      const minLen = Math.min(proccesedToken.length, phoneticToken.length);
      for (let i = 0; i < minLen; i++) {
        const token: string = proccesedToken[i] as string;
        const currentPhonetic = phoneticToken[i];

        if (!currentPhonetic) continue;
        const phonetic_token: string = currentPhonetic[0] as string;
        const alt_phonetic_token: string = currentPhonetic[1] as string;

        const uniqueKey = `${token}-${phonetic_token}-${alt_phonetic_token}`;

        if (!seen.has(uniqueKey)) {
          seen.add(uniqueKey);
          results.push({ token, phonetic_token, alt_phonetic_token });
        }
      }
    }

    const insertVocab = db.prepare(
      `INSERT INTO vocabulary (token, phonetic_token, alt_phonetic_token, idf_score) 
        VALUES (?, ?, ?, ?)
        ON CONFLICT(token) DO UPDATE SET
        phonetic_token = excluded.phonetic_token,
        alt_phonetic_token = excluded.alt_phonetic_token,
        idf_score = excluded.idf_score
      `,
    );

    const insertMany = db.transaction(
      (
        results: {
          token: string;
          phonetic_token: string;
          alt_phonetic_token: string;
        }[],
      ) => {
        for (const result of results) {
          const { token, phonetic_token, alt_phonetic_token } = result;
          insertVocab.run([
            token,
            phonetic_token,
            alt_phonetic_token,
            idfScore.get(token),
          ]);
        }
      },
    );

    insertMany(results);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error in (storeTokens): ${error.message}`);
    } else {
      console.log(error);
    }
    throw error;
  }
};

/**
 *
 * @param {*} scoreMap
 * @returns {null}
 */
const storeScores = (
  scoreMap: Map<
    string,
    {
      tokenId: number;
      docId: number;
      tfScore: number;
      position: number[];
    }
  >,
) => {
  try {
    const instace = db.prepare(
      `INSERT INTO scores (token_id, doc_id, tf_score, position) VALUES (?, ?, ?, ?)`,
    );

    const insertMany = db.transaction(
      (
        scores: Map<
          string,
          {
            tokenId: number;
            docId: number;
            tfScore: number;
            position: number[];
          }
        >,
      ) => {
        for (const [key, value] of scores) {
          const payload = [
            value.tokenId,
            value.docId,
            value.tfScore,
            Buffer.from(JSON.stringify(value.position)),
          ];

          instace.run(payload);
        }
      },
    );

    insertMany(scoreMap.entries());
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error in (storeScores): ${error.message}`);
    } else {
      console.error(error);
    }
    throw error;
  }
};

export const uploadService = {
  calculateDocFrequency,
  calculateIdfScore,
  calculateScore,

  storeDocData,
  storeTokens,
  storeScores,
};
