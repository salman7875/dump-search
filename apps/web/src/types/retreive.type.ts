export interface RetreiveResult {
  id: string;
  title: string;
  url: string;
  displayUrl: string;
  snippet: string;
  updatedAt: string;
  category?: string;
  tags?: string[];
}

export interface AIOverview {
  summary: string;
  keyTakeaways: string[];
}