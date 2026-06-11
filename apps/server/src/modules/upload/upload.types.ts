export type ScorePayload = {
  tokenId: number;
  docId: number;
  tfScore: number;
  position: number[];
};

export type VocabPayload = {
  token: string;
  phonetic_token: string;
  alt_phonetic_token: string;
};
