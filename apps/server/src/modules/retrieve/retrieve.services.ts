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

    const finalResults = Array.from(docRankingMap.values()).map((doc) => {
      const noOfTokenMatchedScore = doc.matchedPhoneticToken.size;
      let totalDistance = 0;
      let pairsCompared = 0;

      for (let i = 0; i < processedTokens.length - 1; i++) {
        const currentToken = processedTokens[i].toLowerCase();
        const nextToken = processedTokens[i + 1].toLowerCase();

        // avoid calculating massive backward facing distance penalties.
        if (currentToken === nextToken) continue;

        const hasBothToken =
          doc.tokenPosition.has(currentToken) &&
          doc.tokenPosition.has(nextToken);

        if (hasBothToken) {
          const position1 = doc.tokenPosition.get(currentToken);
          const position2 = doc.tokenPosition.get(nextToken);

          let minPairDistance = Infinity;

          for (const pos1 of position1) {
            for (const pos2 of position2) {
              const distance = pos2 - pos1;

              // Enforce tight proximity thresholds (e.g, words within 30 tokens of each other)
              if (distance > 0 && distance < minPairDistance && distance < 15) {
                minPairDistance = distance;
              }
            }
          }

          if (minPairDistance !== Infinity) {
            totalDistance += minPairDistance;
            pairsCompared++; // Only increment if an actual structural match was found
          }
        }
      }

      // Proximity Scoring
      let proximityBoost = 1.0;
      let proximityScore = 0;

      if (pairsCompared > 0 && totalDistance > 0) {
        proximityScore = Number((pairsCompared * 100) / totalDistance); // Calculate the pure proximity score for metrics output

        // An average distance of 5 words will now yield a ~3.0x multiplier boost! (Aggressive inverse scaling)
        const avgDistance = totalDistance / pairsCompared;
        proximityBoost += 10 / (2 + Math.log(avgDistance));
      }

      if (totalDistance >= 1500) {
        proximityBoost *= 0.3; // Slash score by 70% if tokens are backward (out of order penalty)
      }

      const tokenMatchWeight = noOfTokenMatchedScore * 5;

      // Compute final score by scaling the entire matched baseline
      const baseScore = tokenMatchWeight + Number(doc.totalScore);
      const finalScore = baseScore * proximityBoost;

      return {
        doc_id: doc.doc_id,
        docs: doc.docs,
        totalScore: doc.totalScore,
        proximityScore: Number(proximityScore.toFixed(3)),
        finalScore: Number(finalScore.toFixed(3)),
      };
    });

    console.log(processedTokens);
    return finalResults.sort((a, b) => b.finalScore - a.finalScore);
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
