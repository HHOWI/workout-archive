import React from 'react';
import styled from '@emotion/styled';
import { theme } from '../../styles/theme';

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
  disabled: boolean;
}

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const ConfirmBtn = styled.button<{ disabled: boolean }>`
  flex: 1;
  padding: 8px 0;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  background: ${({ disabled }) => (disabled ? '#ccc' : theme.primary)};
  color: #fff;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: ${theme.primaryDark};
  }
`;

const CancelBtn = styled.button<{ disabled: boolean }>`
  flex: 1;
  padding: 8px 0;
  border: 1.5px solid ${theme.border};
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  background: #fff;
  color: ${theme.textLight};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  transition: border-color 0.2s;

  &:hover:not(:disabled) {
    border-color: ${theme.textLight};
  }
`;

const ChatConfirmButtons: React.FC<Props> = ({ onConfirm, onCancel, disabled }) => (
  <ButtonRow>
    <ConfirmBtn onClick={onConfirm} disabled={disabled}>
      확인
    </ConfirmBtn>
    <CancelBtn onClick={onCancel} disabled={disabled}>
      취소
    </CancelBtn>
  </ButtonRow>
);

export default ChatConfirmButtons;
