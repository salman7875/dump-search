export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface RetrieveData {
  documents: Array<{ id: string; content: string }>;
}
