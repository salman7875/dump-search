import db from '../../libs/schema/db.js';
import { quicker } from '../../utils/quicker.js';

const calculateDocFrequency = (data) => {
  try {
    const docFrequency = new Map();
    const processedToken = [];

    for (const d of data) {
      const tokens = quicker.processText(d);
      processedToken.push(tokens);

      const uniqueTokensInDoc = new Set(tokens);

      for (const token of uniqueTokensInDoc) {
        docFrequency.set(token, (docFrequency.get(token) || 0) + 1);
      }
    }

    return { docFrequency, processedToken };
  } catch (error) {
    console.error(`Error in (calculateDocFrequency): ${error.message}`);
    return error;
  }
};

/**
 *
 * @param {*} data
 * @returns { idfScore }
 */
const calculateIdfScore = (data, docFrequency) => {
  try {
    const idfScore = new Map();
    const docLen = data.length;
    for (const [token, count] of docFrequency.entries()) {
      idfScore.set(token, Number(Math.log(docLen / count)).toFixed(3));
    }

    return idfScore;
  } catch (error) {
    console.error(`Error in (calculteIdfScore): ${error.message}`);
    return error;
  }
};

/**
 *
 * @param {*} data
 * @param {*} docIds
 * @returns { scoreMap }
 */
const calculateScore = (data, processedTokens, docIds) => {
  try {
    const scoreMap = new Map();

    const vocabs = db.prepare(`SELECT id, token FROM vocabulary`).all();
    const vocabMap = new Map(vocabs.map((vocab) => [vocab.token, vocab.id]));

    for (let i = 0; i < data.length; i++) {
      const docId = docIds[i];
      const localTF = new Map();
      const processedToken = processedTokens[i];

      let count = 0;

      for (const token of processedToken) {
        if (localTF.has(token)) {
          localTF.set(token, localTF.get(token) + 1)
        } else {
          localTF.set(token, 0)
        }
      }

      for (const token of processedToken) {
        if (scoreMap.has(`${token}::${docId}`)) {
          scoreMap.get(`${token}::${docId}`).position.push(count);
        } else {
          scoreMap.set(`${token}::${docId}`, {
            tokenId: vocabMap.get(token),
            docId,
            tfScore: Number(localTF.get(token) / processedToken.length).toFixed(
              3,
            ),
            position: [count],
          });
        }
        count += token.length + 1;
      }
    }

    return scoreMap;
  } catch (error) {
    console.error(`Error in (calculateScore): ${error.message}`);
    return error;
  }
};

/**
 *
 * @param {*} data
 * @returns { docData: data[], docIds: number[] }
 */
const storeDocData = (data) => {
  try {
    const docData = data.split('\n\n');
    const docIds = [];

    const insertDoc = db.prepare(
      `INSERT INTO docs (title, content, total_token) 
         VALUES (?, ?, ?) 
         ON CONFLICT(title) DO UPDATE SET content=excluded.content 
         RETURNING id;`,
    );

    const insertMany = db.transaction((docData) => {
      for (let i = 0; i < docData.length; i++) {
        const title = `Document ${i + 1}`;
        const result = insertDoc.get(title, docData[i], docData[i].length);
        docIds.push(result.id);
      }
    });

    insertMany(docData);

    return { docData, docIds };
  } catch (error) {
    console.error(`Error in (StoreDocData): ${error.message}`);
    return error;
  }
};

/**
 *
 * @param {*} data
 * @param {*} idfScore
 * @returns { null }
 */
const storeTokens = (data, processedTokens, idfScore) => {
  try {
    const results = [];
    const seen = new Set();

    for (const [i, d] of data.entries()) {
      const proccesedToken = processedTokens[i];

      const phoneticToken = quicker.processPhonetic(d);

      const minLen = Math.min(proccesedToken.length, phoneticToken.length);
      for (let i = 0; i < minLen; i++) {
        const token = proccesedToken[i];
        const phonetic_token = phoneticToken[i][0];
        const alt_phonetic_token = phoneticToken[i][1];

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

    const insertMany = db.transaction((results) => {
      for (const result of results) {
        const { token, phonetic_token, alt_phonetic_token } = result;
        insertVocab.run([
          token,
          phonetic_token,
          alt_phonetic_token,
          idfScore.get(token),
        ]);
      }
    });

    insertMany(results);
  } catch (error) {
    console.error(`Error in (storeTokens): ${error.message}`);
    return error;
  }
};

/**
 *
 * @param {*} scoreMap
 * @returns {null}
 */
const storeScores = (scoreMap) => {
  try {
    const instace = db.prepare(
      `INSERT INTO scores (token_id, doc_id, tf_score, position) VALUES (?, ?, ?, ?)`,
    );

    const insertMany = db.transaction((scores) => {
      for (const [key, value] of scores) {
        const payload = [
          value.tokenId,
          value.docId,
          value.tfScore,
          Buffer.from(JSON.stringify(value.position)),
        ];

        instace.run(payload);
      }
    });

    insertMany(scoreMap.entries());
  } catch (error) {
    console.error(`Error in (storeScores): ${error.message}`);
    return error;
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
