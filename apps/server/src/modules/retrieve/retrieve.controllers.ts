import type { Request, Response } from 'express';
import { quicker } from '@repo/utils';

import { retrieveService } from './retrieve.services.js';

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

    const queryPipeline = quicker.processTextPipeline(query);

    const phoneticTokens = queryPipeline.map((p) => p.phonetic);
    const literalTokens = queryPipeline.map((p) => p.literal);

    const { vocabMap, tokenIds } =
      retrieveService.getVocabFromToken(phoneticTokens);

    if (!tokenIds || tokenIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No matching results found.',
        data: [],
      });
    }

    const { scoresRes, docIds } = retrieveService.getScores(tokenIds);
    if (!docIds || docIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No documents match the search criteria.',
        data: [],
      });
    }

    const { docRes } = retrieveService.getDocs(docIds);

    const result = retrieveService.weightingAndMergingDocs(
      literalTokens,
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
