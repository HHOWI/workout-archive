import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type MessageRole = 'user' | 'ai' | 'loading';
export type ResponseType = 'text' | 'table' | 'action' | 'confirm' | 'error';

export interface AIChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  responseType?: ResponseType;
  confirmPayload?: {
    toolName: string;
    params: Record<string, unknown>;
  };
  timestamp: number;
}

interface ChatState {
  messages: AIChatMessage[];
  isOpen: boolean;
}

const MAX_MESSAGES = 50;

const initialState: ChatState = {
  messages: [],
  isOpen: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<AIChatMessage>) {
      state.messages.push(action.payload);
      if (state.messages.length > MAX_MESSAGES) {
        state.messages.shift();
      }
    },
    clearMessages(state) {
      state.messages = [];
    },
    setOpen(state, action: PayloadAction<boolean>) {
      state.isOpen = action.payload;
    },
  },
});

export const { addMessage, clearMessages, setOpen } = chatSlice.actions;
export default chatSlice.reducer;
