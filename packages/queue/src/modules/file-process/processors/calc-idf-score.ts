export const calculateIdfScore = (
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
