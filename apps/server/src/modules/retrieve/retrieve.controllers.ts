import type { Request, Response } from 'express';
import { quicker } from '../../utils/quicker.js';
import { retrieveService } from './retrieve.services.js';

const getAllDocs = async (req: Request, res: Response) => {
  const { query } = req.query as { query: string };

  try {
    const phoneticToken = quicker.processPhonetic(query);
    const processedTokens = phoneticToken.map((token) => token[0]) as string[];

    const { vocabMap, tokenIds } =
      retrieveService.getVocabFromToken(processedTokens);

    const { scoresRes, docIds } = retrieveService.getScores(tokenIds);

    const { docRes } = retrieveService.getDocs(docIds);
    const result = retrieveService.weightingAndMergingDocs(
      processedTokens,
      docRes,
      scoresRes,
      vocabMap,
    );

    res.status(200).json({
      success: true,
      message: 'Results are here!',
      data: result,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Something went wrong!', err: error });
  }
};

export const retrieveController = {
  getAllDocs,
};
