import type { Request, Response } from 'express';
import { quicker } from '../../utils/quicker.js';
import { retrieveService } from './retrieve.services.js';
import { retrieveServiceJSON } from './retrieve-json.services.js';

const getAllDocs = async (req: Request, res: Response) => {
  const { query } = req.query as { query: string };

  try {
    const phoneticToken = quicker.processPhonetic(query);
    const processedTokens = phoneticToken.map((token) => token[0]) as string[];

    const { vocabMap, tokenIds } =
      retrieveServiceJSON.getVocabFromToken(processedTokens);

    const { scoresRes, docIds } = retrieveServiceJSON.getScores(tokenIds);

    const { docRes } = retrieveServiceJSON.getDocs(docIds);
    const result = retrieveServiceJSON.weightingAndMergingDocs(
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
