
export enum ChatMode {
  TEXT = 'TEXT',
  VOICE = 'VOICE'
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface VoiceState {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  lastError: string | null;
}
