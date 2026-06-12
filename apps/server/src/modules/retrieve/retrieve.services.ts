import db from '../../libs/schema/db.js';
import {
  DocumentRecord,
  ScoreRecord,
  VocabularyRecord,
} from './retreive.types.js';

const getVocabs = (phoneticTokens: string[]): VocabularyRecord[] => {
  try {
    const data = db
      .prepare(
        `SELECT id, token, phonetic_token, alt_phonetic_token, idf_score FROM vocabulary WHERE phonetic_token IN (${phoneticTokens.map((t) => '?').join(', ')})`,
      )
      .all(phoneticTokens) as VocabularyRecord[];

    if (!data) {
      throw new Error('No vocab found!');
    }

    return data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error in (getVocabs): ${error.message}`);
    } else {
      console.error(error);
    }
    throw error;
  }
};

const getVocabMap = (
  vocabs: VocabularyRecord[],
): Map<number, VocabularyRecord> => {
  return new Map(vocabs.map((v) => [v.id, v]));
};

const getVocabTokenId = (vocabs: VocabularyRecord[]): number[] => {
  return vocabs.map((v) => v.id);
};

const getVocabFromToken = (
  tokens: string[],
): {
  vocabs: VocabularyRecord[];
  vocabMap: Map<number, VocabularyRecord>;
  tokenIds: number[];
} => {
  try {
    const vocabs = getVocabs(tokens);
    const vocabMap = getVocabMap(vocabs);
    const tokenIds = getVocabTokenId(vocabs);

    if (tokenIds.length < 1) {
      // return { success: true, message: 'No Token Ids', data: [] };
      throw new Error('No Token Ids!');
    }

    return { vocabs, vocabMap, tokenIds };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error in (getVocabFromToken): ${error.message}`);
    } else {
      console.error(error);
    }
    throw error;
  }
};

const getScores = (
  tokenIds: number[],
): {
  scoresRes: ScoreRecord[];
  docIds: number[];
} => {
  try {
    const scoresRes = db
      .prepare(
        `SELECT * FROM scores WHERE token_id IN (${tokenIds.map((t) => '?').join(', ')})`,
      )
      .all(tokenIds) as ScoreRecord[];

    if (!scoresRes) {
      throw new Error('No Score Found!');
    }

    const docIds = [...new Set(scoresRes.map((s) => s.doc_id))];

    return { scoresRes, docIds };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error in (getScores): ${error.message}`);
    } else {
      console.error(error);
    }
    throw error;
  }
};

const getDocs = (docIds: number[]): { docRes: DocumentRecord[] } => {
  try {
    const docRes = db
      .prepare(
        `SELECT id, content, total_token FROM docs WHERE id IN (${docIds.map((d) => '?').join(', ')})`,
      )
      .all(docIds) as DocumentRecord[];

    if (!docRes) {
      throw new Error('No Docs Found!');
    }

    return { docRes };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error in (getDocs): ${error.message}`);
    } else {
      console.error(error);
    }
    throw error;
  }
};

const weightingAndMergingDocs = (
  processedTokens: string[],
  documents: DocumentRecord[],
  scores: ScoreRecord[],
  vocabMap: Map<number, VocabularyRecord>,
) => {
  try {
    const docMap = new Map(
      documents.map((d) => [d.id, { ...d, title: d.content.substring(0, 10) }]),
    );
    const docRankingMap = new Map<
      number,
      {
        doc_id: number;
        docs: any;
        totalScore: number;
        matchedLiteralToken: Set<string>;
        matchedPhoneticToken: Set<string>;
        tokenPosition: Map<string, number[]>;
      }
    >();
    for (let i = 0; i < scores.length; i++) {
      const score = scores[i]!;
      const vocab = vocabMap.get(score.token_id);

      if (!vocab) continue;

      const docId = score.doc_id;
      const doc = docMap.get(score.doc_id);
      const position = score.position
        ? JSON.parse(score.position.toString('utf-8'))
        : [];

      const weight = score.tf_score + vocab.idf_score;

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

      const docRankData = docRankingMap.get(docId)!;
      docRankData.totalScore += weight;

      docRankData.matchedLiteralToken.add(vocab.token.toLowerCase());
      docRankData.matchedPhoneticToken.add(vocab.phonetic_token.toLowerCase());
      docRankData.tokenPosition.set(
        vocab.phonetic_token.toLowerCase(),
        position,
      );
    }

    const finalResults = Array.from(docRankingMap.values()).map((doc) => {
      const noOfTokenMatchedScore = doc.matchedPhoneticToken.size;
      let totalDistance = 0;
      let pairsCompared = 0;

      for (let i = 0; i < processedTokens.length - 1; i++) {
        const currentToken = processedTokens[i]!.toLowerCase();
        const nextToken = processedTokens[i + 1]!.toLowerCase();

        // avoid calculating massive backward facing distance penalties.
        if (currentToken === nextToken) continue;

        const hasBothToken =
          doc.tokenPosition.has(currentToken) &&
          doc.tokenPosition.has(nextToken);

        if (hasBothToken) {
          const position1 = doc.tokenPosition.get(currentToken) as number[];
          const position2 = doc.tokenPosition.get(nextToken) as number[];

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

    return finalResults.sort((a, b) => b.finalScore - a.finalScore);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error in (weightingAndMergingDocs): ${error.message}`);
    } else {
      console.error(error);
    }
    throw error;
  }
};

export const retrieveService = {
  getVocabFromToken,
  getScores,
  getDocs,
  weightingAndMergingDocs,
};
