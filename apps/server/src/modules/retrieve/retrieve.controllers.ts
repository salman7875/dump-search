import type { Request, Response } from 'express';
import { quicker } from '../../utils/quicker.js';
import { retrieveServiceJSON } from './retrieve-json.services.js';

const getAllDocs = async (req: Request, res: Response) => {
  const { query } = req.query as { query: string };

  try {
    if (!query || query.trim() === '') {
      return res.status(200).json({
        success: true,
        message: 'Empty query provided',
        data: [],
      });
    }

    // 1. Process the search query using our synchronized text pipeline
    const queryPipeline = quicker.processTextPipeline(query);

    // 2. Separate phonetic keys for DB lookup and literal stemmed keys for proximity scoring
    const phoneticTokens = queryPipeline.map((p) => p.phonetic);
    const literalTokens = queryPipeline.map((p) => p.literal);

    // 3. Retrieve vocabulary IDs matching the phonetic signatures
    const { vocabMap, tokenIds } =
      retrieveServiceJSON.getVocabFromToken(phoneticTokens);

    // If no matching vocabulary items are found, short-circuit gracefully
    if (!tokenIds || tokenIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No matching results found.',
        data: [],
      });
    }

    // 4. Gather document scores and metadata metrics
    const { scoresRes, docIds } = retrieveServiceJSON.getScores(tokenIds);
    if (!docIds || docIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No documents match the search criteria.',
        data: [],
      });
    }

    const { docRes } = retrieveServiceJSON.getDocs(docIds);

    // 5. Compute structural rankings passing the matching LITERAL tokens for proximity logic
    const result = retrieveServiceJSON.weightingAndMergingDocs(
      literalTokens, // Fix: Must be literal stemmed terms, not phonetic hashes!
      docRes,
      scoresRes,
      vocabMap,
    );

    res.status(200).json({
      success: true,
      message: 'Results are here!',
      data: result,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong!',
      err: errorMessage,
    });
  }
};

export const retrieveController = {
  getAllDocs,
};
