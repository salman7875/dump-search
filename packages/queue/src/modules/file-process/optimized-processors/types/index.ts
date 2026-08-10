export type DocObj = { id: string; title: string; text: string };
export type VocabObj = {
  literal: string;
  phonetic: string;
  altPhonetic: string;
};
export type VocabPayload = {
  token: string;
  phonetic_token: string;
  alt_phonetic_token: string;
};
