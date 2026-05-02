import chatReducer, {
  addMessage,
  clearMessages,
  setOpen,
  AIChatMessage,
} from './chatSlice';

const makeMsg = (override: Partial<AIChatMessage> = {}): AIChatMessage => ({
  id: 'test-id',
  role: 'user',
  text: '안녕',
  timestamp: 1000,
  ...override,
});

describe('chatSlice', () => {
  it('addMessage adds a message', () => {
    const state = chatReducer(undefined, addMessage(makeMsg()));
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].text).toBe('안녕');
  });

  it('clearMessages removes all messages', () => {
    let state = chatReducer(undefined, addMessage(makeMsg()));
    state = chatReducer(state, clearMessages());
    expect(state.messages).toHaveLength(0);
  });

  it('setOpen toggles isOpen', () => {
    const state = chatReducer(undefined, setOpen(true));
    expect(state.isOpen).toBe(true);
  });

  it('caps messages at 50', () => {
    let state = chatReducer(undefined, { type: '@@INIT' } as never);
    for (let i = 0; i < 51; i++) {
      state = chatReducer(state, addMessage(makeMsg({ id: String(i), text: String(i) })));
    }
    expect(state.messages).toHaveLength(50);
    expect(state.messages[0].text).toBe('1');
  });

  it('stores confirmToken in confirmPayload', () => {
    const state = chatReducer(
      undefined,
      addMessage(
        makeMsg({
          responseType: 'confirm',
          confirmPayload: {
            toolName: 'delete_workout_record',
            params: { workoutOfTheDaySeq: 1 },
            confirmToken: 'token-abc',
          },
        })
      )
    )
    expect(state.messages[0].confirmPayload?.confirmToken).toBe('token-abc')
  })
});
