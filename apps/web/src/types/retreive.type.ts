export interface RetreiveResult {
  id: string;
  title: string;
  url?: string;
  content?: string;
  updatedAt: string;
  category?: string;
  tags?: string[];
}

export interface AIOverview {
  summary: string;
  keyTakeaways: string[];
}
