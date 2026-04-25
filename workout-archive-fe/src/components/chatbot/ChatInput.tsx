import React, { useState, KeyboardEvent } from 'react';
import styled from '@emotion/styled';
import { theme } from '../../styles/theme';
import SendIcon from '@mui/icons-material/Send';

interface Props {
  onSend: (text: string) => void;
  disabled: boolean;
}

const Row = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid ${theme.border};
`;

const TextArea = styled.textarea`
  flex: 1;
  resize: none;
  border: 1.5px solid ${theme.border};
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.4;
  max-height: 80px;
  overflow-y: auto;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${theme.primary};
  }

  &:disabled {
    background: ${theme.secondary};
    cursor: not-allowed;
  }
`;

const SendBtn = styled.button<{ canSend: boolean }>`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ canSend }) => (canSend ? 'pointer' : 'not-allowed')};
  background: ${({ canSend }) => (canSend ? theme.primary : theme.border)};
  color: #fff;
  transition: background 0.2s;
  flex-shrink: 0;

  &:hover {
    background: ${({ canSend }) => (canSend ? theme.primaryDark : theme.border)};
  }
`;

const ChatInput: React.FC<Props> = ({ onSend, disabled }) => {
  const [value, setValue] = useState('');
  const canSend = value.trim().length > 0 && !disabled;

  const handleSend = () => {
    if (!canSend) return;
    onSend(value.trim());
    setValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Row>
      <TextArea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="메시지를 입력하세요..."
        rows={1}
        disabled={disabled}
      />
      <SendBtn canSend={canSend} onClick={handleSend} disabled={!canSend}>
        <SendIcon sx={{ fontSize: 18 }} />
      </SendBtn>
    </Row>
  );
};

export default ChatInput;
