# aiglue v0.4 마이그레이션 설계

**날짜**: 2026-05-02  
**범위**: workout-archive-be + workout-archive-fe  
**트리거**: aiglue v0.4 BREAKING — `tools.yaml` 제거, `defineTool()` + zod 코드-퍼스트 방식으로 전환

---

## 배경

aiglue v0.4는 `tools.yaml` 기반 Tool 정의를 완전히 제거하고, TypeScript `defineTool()` + zod schema로 대체했다.  
`createAIEngine({ tools: 'path/to/tools.yaml' })` 형태가 더 이상 동작하지 않으며, `tools: ToolDefinition[]` 배열을 직접 전달해야 한다.

추가로 v0.4에서 confirm 흐름에 `confirmToken` / `idempotencyKey` 필드가 추가됐고, 응답 타입 union이 확장됐다(`multi`, `clarify`, `raw`, `summary`).

---

## 변경 범위

### 백엔드 (`workout-archive-be`)

#### 1. `tools/` 디렉토리 신설

`src/tools.yaml` (898줄, ~50개 도구)을 도메인별 TypeScript 파일 7개로 분산한다.  
기존 `controllers/`, `services/`, `routes/` 의 도메인 분리 패턴과 일치.

```
src/
└── tools/
    ├── workout-tools.ts      # 운동 기록 + 좋아요 + 장소 (~10개)
    ├── comment-tools.ts      # 댓글 + 좋아요 + 대댓글 (~6개)
    ├── follow-tools.ts       # 팔로우/언팔로우/조회 (~10개)
    ├── user-tools.ts         # 프로필/내 정보/소유권 (~5개)
    ├── feed-tools.ts         # 피드 (~1개)
    ├── statistics-tools.ts   # 통계 + 바디로그 + 운동종목 (~11개)
    └── notification-tools.ts # 알림 (~9개)
```

별도 barrel `index.ts`는 두지 않는다. `AiRouter.ts`에서 각 배열을 직접 import해 spread한다.

#### 2. 각 파일 작성 패턴

```typescript
import { defineTool } from '@aiglue/core'
import { z } from 'zod'

export const workoutTools = [
  defineTool({
    name: 'get_workout_records_by_nickname',
    description: '사용자의 운동 기록 목록을 조회합니다',
    endpoint: 'GET /workouts/:nickname',
    params: z.object({
      nickname: z.string().describe('조회할 사용자 닉네임'),
      page:     z.number().optional().describe('페이지 번호'),
      limit:    z.number().optional().describe('페이지당 개수'),
    }),
    responseType: 'table',
    responseMapping: { dataPath: 'data.workouts' },
    columns: [
      { key: 'date',  label: '날짜' },
      { key: 'title', label: '제목' },
    ],
  }),
  // ...
]
```

**tools.yaml → tools.ts 필드 대응**

| tools.yaml | tools.ts |
|---|---|
| `response_type` | `responseType` |
| `response_mapping.data_path` | `responseMapping.dataPath` |
| `risk_level` | `riskLevel` |
| `confirm_message` | `confirmMessage` |
| `params[].required: false` | `z.xxx().optional()` |
| `params[].enum: [...]` | `z.enum([...])` |
| `params[].description` | `.describe('...')` |

#### 3. `AiRouter.ts` 업데이트

```typescript
import { createAIEngine } from '@aiglue/core'
import { workoutTools }      from '../tools/workout-tools.js'
import { commentTools }      from '../tools/comment-tools.js'
import { followTools }       from '../tools/follow-tools.js'
import { userTools }         from '../tools/user-tools.js'
import { feedTools }         from '../tools/feed-tools.js'
import { statisticsTools }   from '../tools/statistics-tools.js'
import { notificationTools } from '../tools/notification-tools.js'

const engine = createAIEngine({
  tools: [
    ...workoutTools, ...commentTools, ...followTools,
    ...userTools, ...feedTools, ...statisticsTools, ...notificationTools,
  ],
  llm: {
    provider: 'openai-compatible',
    apiKey: process.env.GROQ_API_KEY,
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    baseUrl: 'https://api.groq.com/openai/v1',
  },
  baseUrl: `http://localhost:${process.env.PORT ?? 3000}`,
  auth: {
    type: 'bearer',
    token: (req) => (req as Request).cookies?.auth_token,
  },
})
```

`tools.yaml` 파일은 삭제한다.

---

### 프론트엔드 (`workout-archive-fe`)

#### 1. `AIChatResponse` 타입 확장 (`src/api/ai.ts`)

v0.4 `AIEResponse` discriminated union에 맞게 업데이트:

```typescript
export type AIChatResponse =
  | { type: 'text';    text: string }
  | { type: 'table';   text: string; columns: TableColumn[]; rows: unknown[][] }
  | { type: 'raw';     data: unknown }
  | { type: 'summary'; text: string }
  | { type: 'action';  text: string }
  | { type: 'confirm'; text: string; toolName: string; params: Record<string, unknown>; confirmToken?: string }
  | { type: 'clarify'; text: string }
  | { type: 'error';   text: string; code: string }
  | { type: 'multi';   results: Exclude<AIChatResponse, { type: 'multi' }>[] }
```

#### 2. confirm 흐름 업데이트 (`src/api/ai.ts`)

`confirmToken`을 `idempotencyKey`로 에코해 중복 실행 방지 (v0.4 멱등성 기능):

```typescript
export const confirmChatAction = async (
  toolName: string,
  params: Record<string, unknown>,
  confirmToken?: string,         // 추가
): Promise<AIChatResponse> => {
  const response = await authAPI.post<AIChatResponse>('/ai/chat', {
    action: 'confirm',
    toolName,
    params,
    idempotencyKey: confirmToken, // 추가
  })
  return response.data
}
```

#### 3. Redux slice 및 ChatBot 컴포넌트 업데이트

**`chatSlice`**:
- pending confirm 상태에 `confirmToken?: string` 필드 추가
- confirm 응답 수신 시 `confirmToken` 저장, 확인 전송 후 초기화

**`ChatBot.tsx` 렌더링 추가**:
- `clarify` → 기존 `text`와 동일하게 봇 메시지로 표시
- `multi` → `results` 배열을 순서대로 순회하며 각 result를 type별 렌더러에 위임 (재귀 없이 flat 렌더링, `multi` 중첩은 aiglue 스펙상 발생하지 않음)

---

## 삭제 대상

- `workout-archive-be/tools.yaml`

## 영향 없는 것

- DB, 인증, 기타 라우터, 프론트엔드 비-AI 기능 전체
- aiglue 패키지 참조 (`@aiglue/core: file:../../aiglue/packages/core`) — 로컬 참조라 그대로 유지
