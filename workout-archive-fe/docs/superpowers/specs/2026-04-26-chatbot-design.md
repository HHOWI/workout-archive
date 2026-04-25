# Chatbot UI Design

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan.

**Goal:** 플로팅 버튼 방식의 AI 챗봇 UI를 workout-archive 프론트엔드에 추가해 `/ai/chat` 엔드포인트를 자연어로 호출할 수 있게 한다.

---

## 1. Architecture

### Component Tree

```
Layout.tsx
  └─ ChatBot.tsx                  ← 플로팅 버튼 + 채팅창 컨테이너 (모든 페이지)
       ├─ ChatMessage.tsx          ← 개별 메시지 렌더링 (user / ai / loading)
       │    └─ ChatConfirmButtons.tsx  ← confirm 응답 시 확인/취소 버튼
       └─ ChatInput.tsx            ← 텍스트 입력 + 전송
```

### New Files

| 파일 | 역할 |
|------|------|
| `src/components/chatbot/ChatBot.tsx` | 플로팅 버튼, 채팅창 열기/닫기, 메시지 목록 렌더링, 스크롤 |
| `src/components/chatbot/ChatMessage.tsx` | 개별 메시지 (user/ai 구분 스타일, confirm 버튼 포함) |
| `src/components/chatbot/ChatInput.tsx` | 텍스트 입력 + 전송 버튼, Enter 키 처리 |
| `src/components/chatbot/ChatConfirmButtons.tsx` | "확인" / "취소" 버튼 쌍 |
| `src/store/slices/chatSlice.ts` | 메시지 히스토리 Redux slice |
| `src/api/ai.ts` | `POST /ai/chat` 호출 함수 |

### Modified Files

| 파일 | 변경 내용 |
|------|-----------|
| `src/components/Layout.tsx` | `<ChatBot />` 추가 |
| `src/store/store.ts` | chatReducer 등록 + redux-persist 연결 |
| `src/index.tsx` | `<PersistGate>` 래핑 |

---

## 2. State (chatSlice)

```ts
type MessageRole = 'user' | 'ai' | 'loading';

interface AIChatMessage {
  id: string;           // uuid v4 생성 (uuid 패키지 사용, 이미 설치됨)
  role: MessageRole;
  text: string;         // 표시 텍스트 (user 메시지 or AI text/table 요약)
  responseType?: 'text' | 'table' | 'action' | 'confirm' | 'error';
  confirmPayload?: {    // confirm 응답일 때만 존재
    toolName: string;
    params: Record<string, unknown>;
  };
  timestamp: number;
}

interface ChatState {
  messages: AIChatMessage[];
  isOpen: boolean;      // 채팅창 열림 여부 (persist 제외)
}
```

**Actions:**
- `addMessage(msg)` — 메시지 추가 (최대 50개 초과 시 앞부터 삭제)
- `clearMessages()` — 초기화
- `setOpen(boolean)` — 채팅창 열기/닫기

**Persist:** `messages`만 localStorage에 저장. `isOpen`은 persist 제외 (새로고침 시 닫힌 상태로 시작).

---

## 3. API (ai.ts)

```ts
// 일반 메시지 전송
interface ChatRequest {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

// confirm 승인
interface ConfirmRequest {
  action: 'confirm';
  toolName: string;
  params: Record<string, unknown>;
}

// 응답 (aiglue AIEResponse union 그대로)
type AIChatResponse =
  | { type: 'text'; text: string }
  | { type: 'table'; text: string; columns: string[]; rows: unknown[][] }
  | { type: 'action'; text: string }
  | { type: 'confirm'; text: string; toolName: string; params: Record<string, unknown> }
  | { type: 'error'; text: string };
```

`authAPI` 인스턴스 사용 (`withCredentials: true` — 쿠키 자동 전송).

history 변환: Redux `messages` 배열에서 최근 10개를 `{ role: 'user'|'assistant', content: string }` 형태로 변환해서 전달.

---

## 4. Confirm 흐름

1. AI 응답 `type: 'confirm'` → `confirmPayload` 포함해 Redux에 저장
2. `ChatMessage`가 confirm 메시지 감지 → `ChatConfirmButtons` 렌더링
3. **"확인" 버튼 클릭** → `POST /ai/chat` with `{ action: 'confirm', toolName, params }`
4. **"취소" 버튼 클릭** → API 없이 로컬에 "취소되었습니다" 메시지 추가
5. **텍스트로 "네"/"예"/"ㅇ"/"ok"** → 확인과 동일하게 처리
6. **텍스트로 "아니오"/"아니"/"ㄴ"/"no"** → 취소와 동일하게 처리
7. confirm 이후 버튼은 비활성화 처리 (중복 실행 방지)

---

## 5. UI/UX

### 플로팅 버튼

- `position: fixed`, `bottom: 24px`, `right: 24px`, `z-index: 1500`
- 크기: 56×56px, 원형, primary 색상 (`#4a90e2`)
- 닫힘 상태: `ChatBubbleOutlineIcon` (MUI)
- 열림 상태: `CloseIcon` (MUI)
- framer-motion `AnimatePresence`로 아이콘 전환 애니메이션

### 채팅창

- `position: fixed`, `bottom: 88px`, `right: 24px`
- 크기: `360px × 520px` (모바일 `sm` 이하: `calc(100vw - 32px) × 70vh`)
- framer-motion으로 열릴 때 `y: 20 → 0`, `opacity: 0 → 1` 애니메이션
- `border-radius: 16px`, `box-shadow` 사용

**헤더 (48px):**
- 좌: 로봇 아이콘 + "AI 어시스턴트" 텍스트
- 우: 초기화 버튼 (RestartAltIcon, 클릭 시 `clearMessages()` dispatch)

**메시지 목록:**
- 스크롤 영역, `flex: 1`, `overflow-y: auto`
- 새 메시지 추가 시 최하단 자동 스크롤 (`useRef` + `scrollIntoView`)
- 초기 메시지: "안녕하세요! 운동 기록, 통계, 팔로우 등 무엇이든 물어보세요 😊"

**메시지 스타일:**
- user: 우측 정렬, `background: #4a90e2`, 흰 텍스트, `border-radius: 16px 16px 4px 16px`
- ai: 좌측 정렬, `background: #f5f7fa`, 어두운 텍스트, `border-radius: 16px 16px 16px 4px`
- loading: 좌측, 점 3개 pulse 애니메이션
- error: 좌측, `background: #fdecea`, 빨간 텍스트
- table 응답: ai 메시지로 텍스트만 표시 (열 구조는 텍스트 정리해서 표시)

**ChatConfirmButtons:**
- ai 메시지 하단에 붙어 렌더링
- "확인" (primary 색) / "취소" (outlined) 버튼
- confirm 처리 후 버튼 비활성화

**입력창 (56px):**
- MUI `TextField` (multiline, maxRows: 3)
- Enter: 전송 / Shift+Enter: 줄바꿈
- AI 응답 대기 중(`isLoading`) 입력 비활성화
- 전송 버튼: `SendIcon` (MUI), 입력값 없으면 비활성화

---

## 6. redux-persist 연결

redux-persist가 `package.json`에 설치돼 있지만 `store.ts`에 연결되지 않았다. 이번에 연결한다.

- `persistConfig`: `key: 'root'`, `storage: localStorage`, `whitelist: ['chat']` (auth는 제외 — 이미 `verifyTokenAPI`로 복원)
- `store.ts`: `persistReducer` + `persistStore` 추가
- `src/index.tsx`: `<Provider>` 안에 `<PersistGate loading={null}>` 추가

---

## 7. Error Handling

- API 호출 실패 (네트워크 오류 등) → 에러 메시지를 AI 메시지로 표시: "요청 처리 중 오류가 발생했습니다."
- `type: 'error'` 응답 → error 스타일로 표시
- 비로그인 상태에서 인증 필요 API 요청 → AI가 에러 응답 반환하면 그대로 표시 (로그인 유도 별도 처리 없음)

---

## 8. Testing

- `chatSlice` unit test: `addMessage`, `clearMessages`, 50개 초과 slicing, `setOpen`
- `ChatBot` 통합 흐름: 버튼 클릭 → 채팅창 열림, 메시지 전송 → loading → 응답, confirm 흐름
- API `ai.ts` mock 테스트: history 변환 로직 검증
