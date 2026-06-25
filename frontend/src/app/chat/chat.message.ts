export interface ChatMessage {
  id: number;
  text: string;
  fromMe: boolean;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}
