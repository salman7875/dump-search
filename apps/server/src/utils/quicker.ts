import natural from 'natural';
import { eng } from './stopwords/stopword_eng.js';

const removeStopWords = (tokens: string[]): string[] => {
  const engSet = new Set(eng);
  return tokens.filter((t) => !engSet.has(t.toLowerCase()));
};

const stemTokens = (tokens: string[]): string[] => {
  return tokens.map((t) => natural.PorterStemmer.stem(t));
};

const processText = (text: string): string[] => {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text);
  const cleanedTokens = removeStopWords(tokens);
  const stemmedTokens = stemTokens(cleanedTokens);
  return stemmedTokens;
};

const processPhonetic = (text: string): string[][] => {
  try {
    const tokenizer = new natural.WordTokenizer();
    const dm = new natural.DoubleMetaphone();
    const tokens = tokenizer.tokenize(text);
    const cleanedTokens = removeStopWords(tokens);
    const stemmedTokens = stemTokens(cleanedTokens);

    return stemmedTokens.map((token) => dm.process(token, 3));
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const quicker = {
  removeStopWords,
  stemTokens,
  processText,
  processPhonetic,
};
