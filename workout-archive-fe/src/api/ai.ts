import { authAPI } from './axiosConfig'
import { AIChatMessage } from '../store/slices/chatSlice'

export interface ColumnDefinition {
  key: string
  label: string
  type?: 'string' | 'number' | 'date' | 'badge'
}

export type AIChatResponse =
  | { type: 'text';    content: string }
  | { type: 'table';   columns: ColumnDefinition[]; rows: Record<string, unknown>[]; total?: number; summary?: string }
  | { type: 'raw';     data: unknown }
  | { type: 'summary'; text: string; source?: unknown }
  | { type: 'action';  status: 'success' | 'failed'; message: string }
  | { type: 'confirm'; message: string; toolName: string; params: Record<string, unknown>; confirmToken?: string }
  | { type: 'clarify'; question: string; options?: string[] }
  | { type: 'error';   message: string; code: string }
  | { type: 'multi';   results: Exclude<AIChatResponse, { type: 'multi' }>[] }

interface HistoryItem {
  role: 'user' | 'assistant'
  content: string
}

export const sendChatMessage = async (
  message: string,
  history: AIChatMessage[]
): Promise<AIChatResponse> => {
  const historyItems: HistoryItem[] = history
    .filter((m) => m.role === 'user' || m.role === 'ai')
    .slice(-10)
    .map((m) => ({
      role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
      content: m.text,
    }))

  const response = await authAPI.post<AIChatResponse>('/ai/chat', {
    message,
    history: historyItems,
  })
  return response.data
}

export const confirmChatAction = async (
  toolName: string,
  params: Record<string, unknown>,
  confirmToken?: string,
): Promise<AIChatResponse> => {
  const response = await authAPI.post<AIChatResponse>('/ai/chat', {
    action: 'confirm',
    toolName,
    params,
    idempotencyKey: confirmToken,
  })
  return response.data
}
