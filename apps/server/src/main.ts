// @ts-nocheck

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import natural from 'natural';
import readline from 'readline';
import { eng } from './utils/stopwords/stopword_eng.js';
import db from './libs/schema/db.js';

// import { eng } from "./utils/stopwords/stopword_eng.js";
// import db from "./libs/schema/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = __filename.substring(0, __filename.lastIndexOf('/'));

function removeStopWords(tokens) {
  const engSet = new Set(eng);
  return tokens.filter((t) => !engSet.has(t.toLowerCase()));
}

function stemTokens(tokens) {
  return tokens.map((t) => natural.PorterStemmer.stem(t));
}

function processText(text) {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text);
  const cleanedTokens = removeStopWords(tokens);
  const stemmedTokens = stemTokens(cleanedTokens);
  return stemmedTokens;
}

async function storeData(data, filename) {
  const hash: Record<
    string,
    { filename: string; text: string; count: number }
  > = {};
  let count = 0;
  for (const d of data.split('\n\n')) {
    const payload = {
      filename: filename,
      text: d,
      count: count++,
    };

    hash[`para_${payload.count}`] = payload;
  }

  await fs.writeFile(
    path.join(__dirname, '../json', 'data.json'),
    JSON.stringify(hash, null, 2),
    'utf-8',
  );

  return hash;
}

async function storeDataInDB(data) {
  const docData = data.split('\n\n');
  const docIds = [];

  const insertStmt = db.prepare(
    `INSERT INTO docs (title, content, total_token) 
     VALUES (?, ?, ?) 
     ON CONFLICT(title) DO UPDATE SET content=excluded.content 
     RETURNING id;`,
  );

  for (let i = 0; i < docData.length; i++) {
    const title = `Document ${i + 1}`;
    const result = insertStmt.get(title, docData[i], docData[i].length);
    docIds.push(result.id);
  }

  return { docData, docIds };
}

async function uploadFile() {
  const filename = 'data.txt';
  const data = await fs.readFile(
    path.join(__dirname, '../data', filename),
    'utf-8',
  );

  // const file = await storeData(data, filename);
  const { docData, docIds } = await storeDataInDB(data);
  await storeIndexInDB(docData, docIds);
}

async function storeIndexInDB(data, docIds) {
  const docFrequency = new Map();
  const idfScore = new Map();

  for (const d of data) {
    const uniqueTokensInDoc = new Set(processText(d));

    for (const token of uniqueTokensInDoc) {
      docFrequency.set(token, (docFrequency.get(token) || 0) + 1);
    }
  }

  const docLen = data.length;
  for (const [token, count] of docFrequency.entries()) {
    idfScore.set(token, Number(Math.log(docLen / count)).toFixed(3));
  }

  const result = [];
  for (const d of data) {
    const proccesedToken = processText(d);
    result.push(...proccesedToken);
  }

  const unqiueTokens = [...new Set(result)];

  for (const token of unqiueTokens) {
    db.prepare(`INSERT INTO vocabulary (token, idf_score) VALUES (?, ?)`).run([
      token,
      idfScore.get(token),
    ]);
  }

  const vocabs = db.prepare(`SELECT id, token FROM vocabulary`).all();

  const vocabMap = new Map(vocabs.map((vocab) => [vocab.token, vocab.id]));

  const scoreMap = new Map();

  for (let i = 0; i < data.length; i++) {
    const docId = docIds[i];
    const localTF = new Map();
    const processedToken = processText(data[i]);

    let count = 0;

    for (const t of processedToken) {
      localTF.set(t, (localTF.get(t) || 0) + 1);
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

  for (const [key, value] of scoreMap.entries()) {
    const payload = [
      value.tokenId,
      value.docId,
      value.tfScore,
      Buffer.from(JSON.stringify(value.position)),
    ];
    db.prepare(
      `INSERT INTO scores (token_id, doc_id, tf_score, position) VALUES (?, ?, ?, ?)`,
    ).run(payload);
  }
}

async function buildIndex(data) {
  const index = new Map();
  const score = new Map();
  const idfScore = new Map();

  for (const [key, value] of Object.entries(data)) {
    const processedTokens = processText(value.text);

    for (const token of processedTokens) {
      if (score.has(token)) {
        score.set(token, score.get(token) + 1);
      } else {
        score.set(token, 1);
      }
    }
  }

  const totalTokens = Array.from(score.values()).reduce(
    (acc, cur) => acc + cur,
    0,
  );

  for (const [token, count] of score.entries()) {
    idfScore.set(token, Number(Math.log(totalTokens / count)).toFixed(3));
  }

  let x = 0;

  for (const [key, value] of Object.entries(data)) {
    const processedTokens = processText(value.text);

    if (x === 0) console.log('Processed Tokens:', processedTokens);
    let count = 0;

    for (const token of processedTokens) {
      const tfScrore = Number(
        score.get(token || 0) / processedTokens.length,
      ).toFixed(3);
      const _idfScore = Number(idfScore.get(token || 0)).toFixed(3);
      const totalScore = Number(tfScrore * idfScore).toFixed(3);

      const entry = {
        refNo: value.count,
        tfScore: tfScrore,
        idfScore: _idfScore,
        score: totalScore,
        position: count,
      };

      if (!index.has(token)) {
        index.set(token, []);
      }

      index.get(token).push(entry);

      count += token.length + 1;
    }
  }

  await fs.writeFile(
    path.join(__dirname, '../json', 'index.json'),
    JSON.stringify(Object.fromEntries(index), null, 2),
    'utf-8',
  );
}

async function queryIndex(query) {
  const data = await fs.readFile(
    path.join(__dirname, '../json', 'index.json'),
    'utf-8',
  );

  const index = new Map(Object.entries(JSON.parse(data)));
  const processedTokens = processText(query);

  const hashArr = [];

  for (const token of processedTokens) {
    hashArr.push(index.get(token) || []);
  }

  const xFactor = hashArr.reduce((acc, cur) => {
    if (acc.length === 0) return cur;
    return acc.filter((d) => cur.map((item) => item.refNo).includes(d.refNo));
  }, []);

  return xFactor;
}

async function queryIndexFromDB(query) {
  const processedTokens = processText(query);

  const q = `
    SELECT * FROM vocabulary
    WHERE token AS v
    JOIN scores AS s on v.id = s.token_id
    JOIN docs AS d ON s.doc_id = d.id
    WHERE v.token IN (${processedTokens.map((p) => '?').join(', ')})
  `;

  const allData = db.prepare(q).all(processedTokens);
  const vocabs = db
    .prepare(
      `SELECT id, token, idf_score FROM vocabulary WHERE token IN (${processedTokens.map((t) => '?').join(', ')})`,
    )
    .all(processedTokens);

  const vocabMap = new Map(vocabs.map((v) => [v.id, v]));
  const tokenIds = vocabs.map((v) => v.id);

  const scoresRes = db
    .prepare(
      `SELECT * FROM scores WHERE token_id IN (${tokenIds.map((t) => '?').join(', ')})`,
    )
    .all(tokenIds);

  const docIds = scoresRes.map((s) => s.doc_id);
  const docRes = db
    .prepare(
      `SELECT id, content, total_token FROM docs WHERE id IN (${docIds.map((d) => '?').join(', ')})`,
    )
    .all(docIds);

  const docsMap = new Map(docRes.map((d) => [d.id, d]));

  const result = scoresRes.map((s) => {
    return {
      ...s,
      vocab: vocabMap.get(s.token_id),
      docs: docsMap.get(s.doc_id),
      finalWeight: Number(
        s.tf_score * vocabMap.get(s.token_id).idf_score,
      ).toFixed(3),
    };
  });

  return result.sort((a, b) => b.finalWeight - a.finalWeight);
}

async function findRelevantParagraphs(idx) {
  const data = await fs.readFile(
    path.join(__dirname, '../json', 'data.json'),
    'utf-8',
  );

  const resData = JSON.parse(data);
  const searchResult = idx.map((id) => resData[`para_${id}`]);
  return searchResult;
}

async function main() {
  try {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Enter your query: ', async (query) => {
      const queryResult = await queryIndexFromDB(query);
      // const queryResult = await queryIndex(query);
      // const ids = [...new Set(queryResult.map((item) => item.refNo))];
      // const relevantParagraphs = await findRelevantParagraphs(ids);
      // console.log("Relevant Paragraphs:", relevantParagraphs);
      rl.close();
    });
  } catch (error) {
    console.error('Error reading file:', error);
  }
}

uploadFile()
  .then(() => console.log('Uploaded success!'))
  .catch((err) => console.log(err));

main();
