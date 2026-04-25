import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { theme } from '../../styles/theme';
import { AIChatMessage } from '../../store/slices/chatSlice';
import ChatConfirmButtons from './ChatConfirmButtons';

interface Props {
  message: AIChatMessage;
  onConfirm: (toolName: string, params: Record<string, unknown>) => void;
  onCancel: () => void;
  confirmDone: boolean;
}

const blink = keyframes`
  0%, 80%, 100% { opacity: 0; }
  40% { opacity: 1; }
`;

const Wrapper = styled.div<{ isUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ isUser }) => (isUser ? 'flex-end' : 'flex-start')};
  margin-bottom: 8px;
`;

const Bubble = styled.div<{ isUser: boolean; isError: boolean }>`
  max-width: 80%;
  padding: 10px 14px;
  border-radius: ${({ isUser }) =>
    isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px'};
  background: ${({ isUser, isError }) =>
    isError ? '#fdecea' : isUser ? theme.primary : theme.secondary};
  color: ${({ isUser, isError }) =>
    isError ? theme.error : isUser ? '#fff' : theme.text};
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 4px;
  padding: 10px 14px;
  background: ${theme.secondary};
  border-radius: 16px 16px 16px 4px;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${theme.textMuted};
    animation: ${blink} 1.4s infinite;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
`;

const ChatMessage: React.FC<Props> = ({ message, onConfirm, onCancel, confirmDone }) => {
  if (message.role === 'loading') {
    return (
      <Wrapper isUser={false}>
        <LoadingDots>
          <span /><span /><span />
        </LoadingDots>
      </Wrapper>
    );
  }

  const isUser = message.role === 'user';
  const isError = message.responseType === 'error';
  const isConfirm = message.responseType === 'confirm';

  return (
    <Wrapper isUser={isUser}>
      <Bubble isUser={isUser} isError={isError}>
        {message.text}
      </Bubble>
      {isConfirm && message.confirmPayload && (
        <ChatConfirmButtons
          onConfirm={() =>
            onConfirm(
              message.confirmPayload!.toolName,
              message.confirmPayload!.params
            )
          }
          onCancel={onCancel}
          disabled={confirmDone}
        />
      )}
    </Wrapper>
  );
};

export default ChatMessage;
