
export interface DrawConfig {
  min: number;
  max: number;
  count: number;
}

export interface DrawResponse {
  results: number[];
  error?: string;
}

export interface HistoryItem extends DrawConfig {
  results: number[];
  timestamp: Date;
  id: string;
}
