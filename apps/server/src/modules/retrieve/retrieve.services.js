import db from '../../libs/schema/db.js';
import fs from 'fs';
import util from 'util';

const getVocabs = (phoneticTokens) => {
  try {
    const data = db
      .prepare(
        `SELECT id, token, phonetic_token, alt_phonetic_token, idf_score FROM vocabulary WHERE phonetic_token IN (${phoneticTokens.map((t) => '?').join(', ')})`,
      )
      .all(phoneticTokens);

    return data;
  } catch (error) {
    console.error(`Error in (getVocabs): ${error.message}`);
    return error;
  }
};

const getVocabMap = (vocabs) => {
  return new Map(vocabs.map((v) => [v.id, v]));
};

const getVocabTokenId = (vocabs) => {
  return vocabs.map((v) => v.id);
};

const getVocabFromToken = (tokens) => {
  try {
    const vocabs = getVocabs(tokens);
    const vocabMap = getVocabMap(vocabs);
    const tokenIds = getVocabTokenId(vocabs);

    if (tokenIds.length < 1) {
      return { success: true, message: 'No Token Ids', data: [] };
    }

    return { vocabs, vocabMap, tokenIds };
  } catch (error) {
    console.error(`Error in (getVocabFromToken): ${error.message}`);
    return error;
  }
};

const getScores = (tokenIds) => {
  try {
    const scoresRes = db
      .prepare(
        `SELECT * FROM scores WHERE token_id IN (${tokenIds.map((t) => '?').join(', ')})`,
      )
      .all(tokenIds);

    const docIds = [...new Set(scoresRes.map((s) => s.doc_id))];

    return { scoresRes, docIds };
  } catch (error) {
    console.error(`Error in (getScores): ${error.message}`);
    return error;
  }
};

const getDocs = (docIds) => {
  try {
    const docRes = db
      .prepare(
        `SELECT id, content, total_token FROM docs WHERE id IN (${docIds.map((d) => '?').join(', ')})`,
      )
      .all(docIds);

    return { docRes };
  } catch (error) {
    console.error(`Error in (getDocs): ${error.message}`);
    return error;
  }
};

/**
 * const weightingAndMergingDocs = (
  processedTokens,
  documents,
  scores,
  vocabMap,
) => {
  try {
    const docMap = new Map(documents.map((d) => [d.id, d]));

    const docRankingMap = new Map();

    scores.forEach((row) => {
      const docId = row.doc_id;
      const vocab = vocabMap.get(row.token_id);
      const positions = row.position
        ? JSON.parse(row.position.toString('utf-8'))
        : [];
      const weight = row.tf_score * vocab.idf_score;

      if (!docRankingMap.has(docId)) {
        docRankingMap.set(docId, {
          doc_id: docId,
          docs: docMap.get(docId),
          totalScore: 0,
          matchedLiteralTokens: new Set(),
          matchedPhoneticTokens: new Set(),
          tokenPosition: new Map(),
        });
      }

      const docData = docRankingMap.get(docId);
      docData.totalScore += weight;

      docData.matchedLiteralTokens.add(vocab.token.toLowerCase());
      docData.matchedPhoneticTokens.add(vocab.phonetic_token.toLowerCase());
      docData.tokenPosition.set(vocab.phonetic_token, positions);
    });

    const vocabToken = Array.from(vocabMap.values()).map((v) => v.token);

    const finalResults = Array.from(docRankingMap.values()).map((doc) => {
      let phraseMatchBonus = 0;
      let exactSpelling = 0;

      for (const token of vocabToken) {
        if (doc.matchedLiteralTokens.has(token.toLowerCase())) {
          exactSpelling += 5.0;
        }
      }

      if (processedTokens.length > 1) {
        const hasAllToken = processedTokens.every((token) =>
          doc.tokenPosition.has(token),
        );

        if (hasAllToken) {
          const firstTokenPosition = doc.tokenPosition.get(processedTokens[0]);

          const hasExactPhrase = firstTokenPosition.some((startPos) => {
            return processedTokens.every((token, idx) => {
              if (idx === 0) return true;

              const targetPosition = doc.tokenPosition.get(token);
              return targetPosition.some((p) => p === startPos + idx);
            });
          });

          if (hasExactPhrase) {
            phraseMatchBonus = 15.0;
          }
        }
      }

      const finalCalculatedWeight =
        doc.totalScore + exactSpelling + phraseMatchBonus;

      return {
        doc_id: doc.doc_id,
        docs: doc.docs,
        finalWeight: Number(finalCalculatedWeight).toFixed(3),
        isMatched: true,
      };
    });

    const results = finalResults.sort((a, b) => b.finalWeight - a.finalWeight);
    return results;
  } catch (error) {
    console.error(`Error in (weightingAndMergingDocs): ${error.message}`);
    return error;
  }
};
 */

const weightingAndMergingDocs = (
  processedTokens,
  documents,
  scores,
  vocabMap,
) => {
  try {
    const docMap = new Map(documents.map((d) => [d.id, d]));
    const docRankingMap = new Map();

    for (let i = 0; i < scores.length; i++) {
      const vocab = vocabMap.get(scores[i].token_id);

      const docId = scores[i].doc_id;
      const doc = docMap.get(scores[i].doc_id);
      const position = scores[i].position
        ? JSON.parse(scores[i].position.toString('utf-8'))
        : [];

      const weight = scores[i].tf_score + vocab.idf_score;

      if (!docRankingMap.get(docId)) {
        docRankingMap.set(docId, {
          doc_id: docId,
          docs: doc,
          totalScore: 0,
          matchedLiteralToken: new Set(),
          matchedPhoneticToken: new Set(),
          tokenPosition: new Map(),
        });
      }

      const docRankData = docRankingMap.get(docId);
      docRankData.totalScore += weight;

      docRankData.matchedLiteralToken.add(vocab.token.toLowerCase());
      docRankData.matchedPhoneticToken.add(vocab.phonetic_token.toLowerCase());
      docRankData.tokenPosition.set(
        vocab.phonetic_token.toLowerCase(),
        position,
      );
    }

    const vocabTokens = Array.from(vocabMap.values()).map((v) => v.token);

    const finalResults = Array.from(docRankingMap.values()).filter((doc) => {
      let bonusLiteralToken = 0;

      for (const token of vocabTokens) {
        if (doc.matchedLiteralToken.has(token.toLowerCase())) {
          bonusLiteralToken += 3.0;
        }
      }

      doc.bonusLiteralToken = bonusLiteralToken;

      if (processedTokens.length) {
        const containAllTokens = processedTokens.every((token, idx, arr) => {
          return doc.tokenPosition.has(token.toLowerCase());
        });

        return containAllTokens;
      }

      return false;
    });

    return finalResults
      .map((result) => {
        return {
          ...result,
          finalScore: result.totalScore + result.bonusLiteralToken,
        };
      })
      .sort((a, b) => a.finalScore - b.finalScore);
  } catch (error) {
    console.error(`Error in (weightingAndMergingDocs): ${error.message}`);
    return error;
  }
};

export const retrieveService = {
  getVocabFromToken,
  getScores,
  getDocs,
  weightingAndMergingDocs,
};
