export type VocabularyRecord = {
  id: number;
  token: string;
  phonetic_token: string;
  alt_phonetic_token: string;
  idf_score: number;
};

export type DocumentRecord = {
  id: number;
  content: string;
  total_token: number;
};

export type ScoreRecord = {
  token_id: number;
  doc_id: number;
  tf_score: number;
  position: Buffer<ArrayBufferLike>;
};
