export const calculateIdfScore = (
  corpusLength = 1,
  docFrequency: Map<string, number>,
): Map<string, number> => {
  try {
    const idfScore = new Map<string, number>();
    for (const [token, count] of docFrequency.entries()) {
      idfScore.set(token, +Number(Math.log(corpusLength / count)).toFixed(3));
    }
    return idfScore;
  } catch (error) {
    console.error(`Error in calculateIdfScoreJSON:`, error);
    throw error;
  }
};
