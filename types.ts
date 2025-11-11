
export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ImageAnalysis {
  text: string;
  urls: string[];
}
