import db from '../../libs/schema/db.js';
import { quicker } from '../../utils/quicker.js';
import { ScorePayload, VocabPayload } from './upload.types.js';

const calculateDocFrequencyJSON = (
  data: { id: string; title: string; text: string }[],
) => {
  try {
    const docFrequency = new Map<string, number>();
    const processedTokensList: string[][] = [];
    const processedTitleTokensList: string[][] = [];

    for (const d of data) {
      const bodyPipeline = quicker.processTextPipeline(d.text);
      const titlePipeline = quicker.processTextPipeline(d.title);

      const titleTokens = titlePipeline.map((p) => `${p.literal}-title`);
      const bodyTokens = bodyPipeline.map((p) => p.literal);

      processedTitleTokensList.push(titlePipeline.map((p) => p.literal));

      const integratedTokens = [...titleTokens, ...bodyTokens];
      processedTokensList.push(integratedTokens);

      const uniqueTokensInDoc = new Set(integratedTokens);
      for (const token of uniqueTokensInDoc) {
        docFrequency.set(token, (docFrequency.get(token) || 0) + 1);
      }
    }

    return {
      docFrequency,
      processedToken: processedTokensList,
      processedTitleTokens: processedTitleTokensList,
    };
  } catch (error) {
    console.error(`Error in calculateDocFrequencyJSON:`, error);
    throw error;
  }
};

const calculateIdfScoreJSON = (
  data: { id: string; title: string; text: string }[],
  docFrequency: Map<string, number>,
): Map<string, number> => {
  try {
    const idfScore = new Map<string, number>();
    const docLen = data.length || 1;
    for (const [token, count] of docFrequency.entries()) {
      idfScore.set(token, +Number(Math.log(docLen / count)).toFixed(3));
    }
    return idfScore;
  } catch (error) {
    console.error(`Error in calculateIdfScoreJSON:`, error);
    throw error;
  }
};

const calculateScoreJSON = (
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
        currentStringPos += token.replace(/-title$/, '').length + 1;
      }

      for (const [token, meta] of tokenMetaData.entries()) {
        const vocabId = vocabMap.get(token);
        if (!vocabId) continue;

        const logTF = 1 + Math.log(meta.count);
        const docLength = token.endsWith('-title')
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

const storeDocDataJSON = (
  data: { id: string; title: string; text: string }[],
) => {
  try {
    const docIds: number[] = [];
    const insertDoc = db.prepare(`
      INSERT INTO docs (title, content, total_token) 
      VALUES (?, ?, ?) 
      ON CONFLICT(title) DO UPDATE SET content=excluded.content, total_token=excluded.total_token
      RETURNING id;
    `);

    const insertMany = db.transaction((docsList) => {
      for (const doc of docsList) {
        const tokensCount = doc.text ? doc.text.split(/\s+/).length : 0;
        const result = insertDoc.get(doc.title, doc.text, tokensCount) as {
          id: number;
        };
        docIds.push(result.id);
      }
    });

    insertMany(data);
    return { docData: data, docIds };
  } catch (error) {
    console.error(`Error in storeDocDataJSON:`, error);
    throw error;
  }
};

const storeTokensJSON = (
  data: { id: string; title: string; text: string }[],
  processedTokens: string[][],
  idfScore: Map<string, number>,
) => {
  try {
    const results: VocabPayload[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < data.length; i++) {
      const d = data[i]!;
      const titlePipeline = quicker.processTextPipeline(d.title);
      const bodyPipeline = quicker.processTextPipeline(d.text);

      // Store Title Tokens with their specific alignments
      titlePipeline.forEach((p) => {
        const tokenKey = `${p.literal}-title`;
        const uniqueKey = `${tokenKey}::${p.phonetic}::${p.altPhonetic}`;
        if (!seen.has(uniqueKey)) {
          seen.add(uniqueKey);
          results.push({
            token: tokenKey,
            phonetic_token: p.phonetic,
            alt_phonetic_token: p.altPhonetic,
          });
        }
      });

      // Store Standard Body Tokens with aligned structural maps
      bodyPipeline.forEach((p) => {
        const uniqueKey = `${p.literal}::${p.phonetic}::${p.altPhonetic}`;
        if (!seen.has(uniqueKey)) {
          seen.add(uniqueKey);
          results.push({
            token: p.literal,
            phonetic_token: p.phonetic,
            alt_phonetic_token: p.altPhonetic,
          });
        }
      });
    }

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
          item.phonetic_token || '',
          item.alt_phonetic_token || '',
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

const storeScores = (scoreMap: Map<string, ScorePayload>) => {
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

export const uploadServiceJSON = {
  storeScores,
  calculateDocFrequencyJSON,
  calculateIdfScoreJSON,
  calculateScoreJSON,
  storeDocDataJSON,
  storeTokensJSON,
};
