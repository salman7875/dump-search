export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

type DocData = {
  id: number;
  title: string;
  content: string;
  total_token: number;
};

export type RetrieveData = {
  doc_id: number;
  docs: DocData;
  totalScore: number;
  proximityScore: number;
  finalScore: number;
};
