import { authAPI } from './axiosConfig';
import { AIChatMessage } from '../store/slices/chatSlice';

export interface TableColumn {
  key: string;
  label: string;
  type: string;
}

export interface AIChatResponse {
  type: 'text' | 'table' | 'action' | 'confirm' | 'error';
  text: string;
  columns?: TableColumn[];
  rows?: unknown[][];
  toolName?: string;
  params?: Record<string, unknown>;
}

interface HistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export const sendChatMessage = async (
  message: string,
  history: AIChatMessage[]
): Promise<AIChatResponse> => {
  const historyItems: HistoryItem[] = history
    .filter((m) => m.role === 'user' || m.role === 'ai')
    .slice(-10)
    .map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

  const response = await authAPI.post<AIChatResponse>('/ai/chat', {
    message,
    history: historyItems,
  });
  return response.data;
};

export const confirmChatAction = async (
  toolName: string,
  params: Record<string, unknown>
): Promise<AIChatResponse> => {
  const response = await authAPI.post<AIChatResponse>('/ai/chat', {
    action: 'confirm',
    toolName,
    params,
  });
  return response.data;
};
