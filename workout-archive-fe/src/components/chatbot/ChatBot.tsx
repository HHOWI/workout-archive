import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { RootState, AppDispatch } from '../../store/store';
import { addMessage, clearMessages, setOpen, markConfirmed, AIChatMessage } from '../../store/slices/chatSlice';
import { sendChatMessage, confirmChatAction } from '../../api/ai';
import { theme, media } from '../../styles/theme';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const FAB = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: ${theme.primary};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1500;
  box-shadow: 0 4px 16px rgba(74, 144, 226, 0.4);
  transition: background 0.2s, transform 0.2s;

  &:hover {
    background: ${theme.primaryDark};
    transform: scale(1.05);
  }
`;

const Window = styled(motion.div)`
  position: fixed;
  bottom: 88px;
  right: 24px;
  width: 360px;
  height: 520px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.14);
  z-index: 1499;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  ${media.xs} {
    width: calc(100vw - 32px);
    height: 70vh;
    right: 16px;
    bottom: 80px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid ${theme.border};
  background: ${theme.primary};
  color: #fff;
  border-radius: 16px 16px 0 0;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
`;

const ClearBtn = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 6px;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
  }
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 2px; }
`;

const CONFIRM_KEYWORDS = ['네', '예', 'ㅇ', 'ok', 'yes', '응', 'ㅇㅇ'];
const CANCEL_KEYWORDS = ['아니오', '아니', 'ㄴ', 'no', '아니요', 'nope'];

const INITIAL_MESSAGE: AIChatMessage = {
  id: 'initial',
  role: 'ai',
  text: '안녕하세요! 운동 기록, 통계, 팔로우 등 무엇이든 물어보세요 😊',
  timestamp: Date.now(),
};

const ChatBot: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { messages, isOpen } = useSelector((state: RootState) => state.chat);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const confirmedIds = useSelector((state: RootState) => state.chat.confirmedMessageIds);

  const allMessages = messages.length === 0 ? [INITIAL_MESSAGE] : messages;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, isLoading]);

  const handleSend = async (text: string) => {
    const lower = text.trim().toLowerCase();

    const lastConfirmMsg = [...messages].reverse().find((m) => m.responseType === 'confirm');
    if (lastConfirmMsg && lastConfirmMsg.confirmPayload && !confirmedIds.includes(lastConfirmMsg.id)) {
      if (CONFIRM_KEYWORDS.includes(lower)) {
        await handleConfirm(lastConfirmMsg.confirmPayload.toolName, lastConfirmMsg.confirmPayload.params, lastConfirmMsg.id);
        return;
      }
      if (CANCEL_KEYWORDS.includes(lower)) {
        handleCancel(lastConfirmMsg.id);
        return;
      }
    }

    const historyBeforeSend = messages;
    const userMsg: AIChatMessage = {
      id: uuidv4(),
      role: 'user',
      text,
      timestamp: Date.now(),
    };
    dispatch(addMessage(userMsg));
    setIsLoading(true);

    try {
      const res = await sendChatMessage(text, historyBeforeSend);
      const aiMsg: AIChatMessage = {
        id: uuidv4(),
        role: 'ai',
        text: res.text,
        responseType: res.type,
        confirmPayload:
          res.type === 'confirm' && res.toolName && res.params
            ? { toolName: res.toolName, params: res.params }
            : undefined,
        timestamp: Date.now(),
      };
      dispatch(addMessage(aiMsg));
    } catch {
      dispatch(
        addMessage({
          id: uuidv4(),
          role: 'ai',
          text: '요청 처리 중 오류가 발생했습니다.',
          responseType: 'error',
          timestamp: Date.now(),
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (
    toolName: string,
    params: Record<string, unknown>,
    msgId: string
  ) => {
    dispatch(markConfirmed(msgId));
    setIsLoading(true);
    try {
      const res = await confirmChatAction(toolName, params);
      dispatch(
        addMessage({
          id: uuidv4(),
          role: 'ai',
          text: res.text,
          responseType: res.type,
          timestamp: Date.now(),
        })
      );
    } catch {
      dispatch(
        addMessage({
          id: uuidv4(),
          role: 'ai',
          text: '실행 중 오류가 발생했습니다.',
          responseType: 'error',
          timestamp: Date.now(),
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (msgId: string) => {
    dispatch(markConfirmed(msgId));
    dispatch(
      addMessage({
        id: uuidv4(),
        role: 'ai',
        text: '취소되었습니다.',
        timestamp: Date.now(),
      })
    );
  };

  return (
    <>
      <FAB onClick={() => dispatch(setOpen(!isOpen))}>
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <CloseIcon />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChatBubbleOutlineIcon />
            </motion.span>
          )}
        </AnimatePresence>
      </FAB>

      <AnimatePresence>
        {isOpen && (
          <Window
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            <Header>
              <HeaderTitle>
                <span>🤖</span>
                <span>AI 어시스턴트</span>
              </HeaderTitle>
              <ClearBtn onClick={() => dispatch(clearMessages())} title="대화 초기화">
                <RestartAltIcon sx={{ fontSize: 20 }} />
              </ClearBtn>
            </Header>

            <MessageList>
              {allMessages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onConfirm={(toolName, params) =>
                    handleConfirm(toolName, params, msg.id)
                  }
                  onCancel={() => handleCancel(msg.id)}
                  confirmDone={confirmedIds.includes(msg.id)}
                />
              ))}
              {isLoading && (
                <ChatMessage
                  message={{ id: 'loading', role: 'loading', text: '', timestamp: Date.now() }}
                  onConfirm={() => {}}
                  onCancel={() => {}}
                  confirmDone={false}
                />
              )}
              <div ref={bottomRef} />
            </MessageList>

            <ChatInput onSend={handleSend} disabled={isLoading} />
          </Window>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
