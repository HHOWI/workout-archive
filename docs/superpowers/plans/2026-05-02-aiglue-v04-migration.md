# aiglue v0.4 마이그레이션 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** workout-archive를 aiglue v0.3(tools.yaml) → v0.4(defineTool + zod)로 마이그레이션하고, 프론트엔드도 v0.4 응답 타입과 confirmToken 흐름에 맞게 업데이트한다.

**Architecture:** 백엔드는 tools.yaml 삭제 후 도메인별 TypeScript 파일(8개) + AiRouter.ts 업데이트. 프론트엔드는 AIChatResponse discriminated union 교체, chatSlice confirmPayload에 confirmToken 추가, ChatBot/ChatMessage confirmToken 전달.

**Tech Stack:** TypeScript, Node.js/Express, @aiglue/core(로컬), zod, React 18, Redux Toolkit, CRA/Jest

---

## 파일 맵

**생성:**
- `workout-archive-be/src/tools/workout-tools.ts`
- `workout-archive-be/src/tools/comment-tools.ts`
- `workout-archive-be/src/tools/search-tools.ts`
- `workout-archive-be/src/tools/follow-tools.ts`
- `workout-archive-be/src/tools/user-tools.ts`
- `workout-archive-be/src/tools/feed-tools.ts`
- `workout-archive-be/src/tools/statistics-tools.ts`
- `workout-archive-be/src/tools/notification-tools.ts`

**수정:**
- `workout-archive-be/src/routes/AiRouter.ts`
- `workout-archive-fe/src/api/ai.ts`
- `workout-archive-fe/src/store/slices/chatSlice.ts`
- `workout-archive-fe/src/store/slices/chatSlice.test.ts`
- `workout-archive-fe/src/components/chatbot/ChatBot.tsx`
- `workout-archive-fe/src/components/chatbot/ChatMessage.tsx`

**삭제:**
- `workout-archive-be/tools.yaml`

---

## Task 1: workout-tools.ts 생성

운동 기록(9개) + 좋아요(3개) + 장소(1개) = 13개 도구

**Files:**
- Create: `workout-archive-be/src/tools/workout-tools.ts`

- [ ] **Step 1: 파일 생성**

```typescript
import { defineTool } from '@aiglue/core'
import { z } from 'zod'

export const workoutTools = [
  defineTool({
    name: 'get_workout_records_by_nickname',
    description: '특정 닉네임 사용자의 운동 기록 목록을 조회한다. 페이지네이션 지원.',
    endpoint: 'GET /workouts/profiles/:nickname/workout-records',
    params: z.object({
      nickname: z.string().describe('조회할 사용자의 닉네임'),
      page:     z.number().optional().describe('페이지 번호 (기본값: 1)'),
      limit:    z.number().optional().describe('페이지당 항목 수 (기본값: 10)'),
    }),
    responseType: 'table',
    responseMapping: { dataPath: 'records' },
    columns: [
      { key: 'workoutOfTheDaySeq', label: '기록 ID',    type: 'number' as const },
      { key: 'workoutDate',        label: '운동 날짜',  type: 'date'   as const },
      { key: 'placeName',          label: '운동 장소',  type: 'string' as const },
      { key: 'likeCount',          label: '좋아요 수',  type: 'number' as const },
    ],
  }),

  defineTool({
    name: 'get_workout_record_detail',
    description: '특정 운동 기록의 상세 정보를 조회한다.',
    endpoint: 'GET /workouts/profiles/workout-records/:workoutOfTheDaySeq',
    params: z.object({
      workoutOfTheDaySeq: z.number().describe('조회할 운동 기록 ID'),
    }),
    responseType: 'text',
  }),

  defineTool({
    name: 'get_workout_records_count_by_nickname',
    description: '특정 닉네임 사용자의 전체 운동 기록 수를 조회한다.',
    endpoint: 'GET /workouts/profiles/:nickname/workout-records-count',
    params: z.object({
      nickname: z.string().describe('조회할 사용자의 닉네임'),
    }),
    responseType: 'text',
  }),

  defineTool({
    name: 'get_recent_workout_records',
    description: '현재 로그인한 사용자의 최근 운동 기록 목록을 조회한다. 인증 필요.',
    endpoint: 'GET /workouts/workout-records/recent',
    params: z.object({}),
    responseType: 'table',
    responseMapping: { dataPath: 'records' },
    columns: [
      { key: 'workoutOfTheDaySeq', label: '기록 ID',   type: 'number' as const },
      { key: 'workoutDate',        label: '운동 날짜', type: 'date'   as const },
      { key: 'placeName',          label: '운동 장소', type: 'string' as const },
    ],
  }),

  defineTool({
    name: 'delete_workout_record',
    description: '특정 운동 기록을 소프트 삭제한다. 인증 필요.',
    endpoint: 'DELETE /workouts/workout-records/:workoutOfTheDaySeq',
    params: z.object({
      workoutOfTheDaySeq: z.number().describe('삭제할 운동 기록 ID'),
    }),
    riskLevel: 'write',
    confirmMessage: '운동 기록 {workoutOfTheDaySeq}를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    responseType: 'text',
  }),

  defineTool({
    name: 'update_workout_record',
    description: '특정 운동 기록의 내용을 수정한다. 인증 필요.',
    endpoint: 'PUT /workouts/workout-records/:workoutOfTheDaySeq',
    params: z.object({
      workoutOfTheDaySeq: z.number().describe('수정할 운동 기록 ID'),
      content:            z.string().optional().describe('수정할 운동 기록 내용'),
    }),
    riskLevel: 'write',
    confirmMessage: '운동 기록 {workoutOfTheDaySeq}를 수정하시겠습니까?',
    responseType: 'text',
  }),

  defineTool({
    name: 'get_workout_records_by_place',
    description: '특정 운동 장소의 운동 기록 목록을 조회한다.',
    endpoint: 'GET /workouts/places/:placeSeq/workout-records',
    params: z.object({
      placeSeq: z.number().describe('조회할 운동 장소 ID'),
      page:     z.number().optional().describe('페이지 번호 (기본값: 1)'),
      limit:    z.number().optional().describe('페이지당 항목 수 (기본값: 10)'),
    }),
    responseType: 'table',
    responseMapping: { dataPath: 'records' },
    columns: [
      { key: 'workoutOfTheDaySeq', label: '기록 ID',   type: 'number' as const },
      { key: 'workoutDate',        label: '운동 날짜', type: 'date'   as const },
      { key: 'nickname',           label: '작성자',    type: 'string' as const },
    ],
  }),

  defineTool({
    name: 'get_workout_records_count_by_place',
    description: '특정 운동 장소의 전체 운동 기록 수를 조회한다.',
    endpoint: 'GET /workouts/places/:placeSeq/workout-records-count',
    params: z.object({
      placeSeq: z.number().describe('조회할 운동 장소 ID'),
    }),
    responseType: 'text',
  }),

  defineTool({
    name: 'get_monthly_workout_dates',
    description: '특정 닉네임 사용자의 월별 운동 날짜 목록을 조회한다.',
    endpoint: 'GET /workouts/profiles/:nickname/workout-records/monthly',
    params: z.object({
      nickname: z.string().describe('조회할 사용자의 닉네임'),
      year:     z.number().optional().describe('조회할 연도 (예: 2024)'),
      month:    z.number().optional().describe('조회할 월 (1-12)'),
    }),
    responseType: 'table',
    responseMapping: { dataPath: 'dates' },
    columns: [
      { key: 'date', label: '운동 날짜', type: 'date' as const },
    ],
  }),

  // ─── Workout Likes ──────────────────────────────────────────

  defineTool({
    name: 'toggle_workout_like',
    description: '특정 운동 기록에 좋아요를 추가하거나 취소한다. 인증 필요.',
    endpoint: 'POST /workouts/workout-records/:workoutOfTheDaySeq/like',
    params: z.object({
      workoutOfTheDaySeq: z.number().describe('좋아요를 토글할 운동 기록 ID'),
    }),
    riskLevel: 'write',
    confirmMessage: '운동 기록 {workoutOfTheDaySeq}에 좋아요를 토글하시겠습니까?',
    responseType: 'text',
  }),

  defineTool({
    name: 'get_workout_like_status',
    description: '특정 운동 기록에 대한 현재 사용자의 좋아요 상태를 조회한다.',
    endpoint: 'GET /workouts/workout-records/:workoutOfTheDaySeq/like',
    params: z.object({
      workoutOfTheDaySeq: z.number().describe('조회할 운동 기록 ID'),
    }),
    responseType: 'text',
  }),

  defineTool({
    name: 'get_workout_like_count',
    description: '특정 운동 기록의 좋아요 수를 조회한다.',
    endpoint: 'GET /workouts/workout-records/:workoutOfTheDaySeq/like-count',
    params: z.object({
      workoutOfTheDaySeq: z.number().describe('조회할 운동 기록 ID'),
    }),
    responseType: 'text',
  }),

  // ─── Workout Places ─────────────────────────────────────────

  defineTool({
    name: 'get_recent_workout_places',
    description: '현재 로그인한 사용자가 최근 이용한 운동 장소 목록을 조회한다. 인증 필요.',
    endpoint: 'GET /workout-places/recent',
    params: z.object({}),
    responseType: 'table',
    responseMapping: { dataPath: 'places' },
    columns: [
      { key: 'placeSeq',    label: '장소 ID',    type: 'number' as const },
      { key: 'placeName',   label: '장소명',     type: 'string' as const },
      { key: 'lastVisited', label: '최근 방문일', type: 'date'   as const },
    ],
  }),
]
```

- [ ] **Step 2: 타입 체크**

```bash
cd workout-archive-be && npx tsc --noEmit
```

Expected: 오류 없음 (또는 workout-tools.ts 외 기존 오류만)

- [ ] **Step 3: 커밋**

```bash
cd workout-archive-be && git add src/tools/workout-tools.ts
git commit -m "feat: add workout-tools.ts (v0.4 defineTool)"
```

---

## Task 2: comment-tools.ts 생성

댓글(6개) 도구

**Files:**
- Create: `workout-archive-be/src/tools/comment-tools.ts`

- [ ] **Step 1: 파일 생성**

```typescript
import { defineTool } from '@aiglue/core'
import { z } from 'zod'

export const commentTools = [
  defineTool({
    name: 'get_comments',
    description: '특정 운동 기록의 댓글 목록을 조회한다.',
    endpoint: 'GET /workouts/:workoutOfTheDaySeq/comments',
    params: z.object({
      workoutOfTheDaySeq: z.number().describe('댓글을 조회할 운동 기록 ID'),
    }),
    responseType: 'table',
    responseMapping: { dataPath: 'comments' },
    columns: [
      { key: 'commentSeq', label: '댓글 ID', type: 'number' as const },
      { key: 'nickname',   label: '작성자',  type: 'string' as const },
      { key: 'content',    label: '내용',    type: 'string' as const },
      { key: 'createdAt',  label: '작성일',  type: 'date'   as const },
    ],
  }),

  defineTool({
    name: 'create_comment',
    description: '특정 운동 기록에 댓글을 작성한다. 인증 필요.',
    endpoint: 'POST /workouts/:workoutOfTheDaySeq/comments',
    params: z.object({
      workoutOfTheDaySeq: z.number().describe('댓글을 작성할 운동 기록 ID'),
      content:            z.string().describe('댓글 내용'),
    }),
    riskLevel: 'write',
    confirmMessage: '운동 기록 {workoutOfTheDaySeq}에 댓글을 작성하시겠습니까?',
    responseType: 'text',
  }),

  defineTool({
    name: 'update_comment',
    description: '특정 댓글의 내용을 수정한다. 인증 필요.',
    endpoint: 'PUT /workouts/comments/:commentSeq',
    params: z.object({
      commentSeq: z.number().describe('수정할 댓글 ID'),
      content:    z.string().describe('수정할 댓글 내용'),
    }),
    riskLevel: 'write',
    confirmMessage: '댓글 {commentSeq}를 수정하시겠습니까?',
    responseType: 'text',
  }),

  defineTool({
    name: 'delete_comment',
    description: '특정 댓글을 삭제한다. 인증 필요.',
    endpoint: 'DELETE /workouts/comments/:commentSeq',
    params: z.object({
      commentSeq: z.number().describe('삭제할 댓글 ID'),
    }),
    riskLevel: 'write',
    confirmMessage: '댓글 {commentSeq}를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    responseType: 'text',
  }),

  defineTool({
    name: 'toggle_comment_like',
    description: '특정 댓글에 좋아요를 추가하거나 취소한다. 인증 필요.',
    endpoint: 'POST /workouts/comments/:commentSeq/like',
    params: z.object({
      commentSeq: z.number().describe('좋아요를 토글할 댓글 ID'),
    }),
    riskLevel: 'write',
    confirmMessage: '댓글 {commentSeq}에 좋아요를 토글하시겠습니까?',
    responseType: 'text',
  }),

  defineTool({
    name: 'get_comment_replies',
    description: '특정 댓글의 대댓글 목록을 조회한다.',
    endpoint: 'GET /workouts/comments/:commentSeq/replies',
    params: z.object({
      commentSeq: z.number().describe('대댓글을 조회할 댓글 ID'),
    }),
    responseType: 'table',
    responseMapping: { dataPath: 'replies' },
    columns: [
      { key: 'commentSeq', label: '댓글 ID', type: 'number' as const },
      { key: 'nickname',   label: '작성자',  type: 'string' as const },
      { key: 'content',    label: '내용',    type: 'string' as const },
    ],
  }),
]
```

- [ ] **Step 2: 타입 체크**

```bash
cd workout-archive-be && npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add src/tools/comment-tools.ts
git commit -m "feat: add comment-tools.ts (v0.4 defineTool)"
```

---

## Task 3: search-tools.ts 생성

검색(2개) 도구

**Files:**
- Create: `workout-archive-be/src/tools/search-tools.ts`

- [ ] **Step 1: 파일 생성**

```typescript
import { defineTool } from '@aiglue/core'
import { z } from 'zod'

export const searchTools = [
  defineTool({
    name: 'search_users',
    description: '닉네임으로 사용자를 검색한다.',
    endpoint: 'GET /search/users',
    params: z.object({
      query: z.string().describe('검색할 닉네임 키워드'),
      page:  z.number().optional().describe('페이지 번호 (기본값: 1)'),
      limit: z.number().optional().describe('페이지당 항목 수 (기본값: 10)'),
    }),
    responseType: 'table',
    responseMapping: { dataPath: 'users' },
    columns: [
      { key: 'userSeq',      label: '사용자 ID',    type: 'number' as const },
      { key: 'nickname',     label: '닉네임',       type: 'string' as const },
      { key: 'profileImage', label: '프로필 이미지', type: 'string' as const },
    ],
  }),

  defineTool({
    name: 'search_workout_places',
    description: '이름으로 운동 장소를 검색한다.',
    endpoint: 'GET /search/places',
    params: z.object({
      query: z.string().describe('검색할 장소명 키워드'),
      page:  z.number().optional().describe('페이지 번호 (기본값: 1)'),
      limit: z.number().optional().describe('페이지당 항목 수 (기본값: 10)'),
    }),
    responseType: 'table',
    responseMapping: { dataPath: 'places' },
    columns: [
      { key: 'placeSeq',  label: '장소 ID', type: 'number' as const },
      { key: 'placeName', label: '장소명',  type: 'string' as const },
      { key: 'address',   label: '주소',    type: 'string' as const },
    ],
  }),
]
```

- [ ] **Step 2: 타입 체크**

```bash
cd workout-archive-be && npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add src/tools/search-tools.ts
git commit -m "feat: add search-tools.ts (v0.4 defineTool)"
```

---

## Task 4: follow-tools.ts 생성

팔로우(11개) 도구

**Files:**
- Create: `workout-archive-be/src/tools/follow-tools.ts`

- [ ] **Step 1: 파일 생성**

```typescript
import { defineTool } from '@aiglue/core'
import { z } from 'zod'

export const followTools = [
  defineTool({
    name: 'follow_user',
    description: '특정 사용자를 팔로우한다. 인증 필요.',
    endpoint: 'POST /follow/user',
    params: z.object({
      followingUserSeq: z.number().describe('팔로우할 사용자 ID'),
    }),
    riskLevel: 'write',
    confirmMessage: '해당 사용자를 팔로우하시겠습니까?',
    responseType: 'text',
  }),

  defineTool({
    name: 'unfollow_user',
    description: '특정 사용자를 언팔로우한다. 인증 필요.',
    endpoint: 'DELETE /follow/user/:followingUserSeq',
    params: z.object({
      followingUserSeq: z.number().describe('언팔로우할 사용자 ID'),
    }),
    riskLevel: 'write',
    confirmMessage: '사용자 {followingUserSeq}를 언팔로우하시겠습니까?',
    responseType: 'text',
  }),

  defineTool({
    name: 'follow_place',
    description: '특정 운동 장소를 팔로우한다. 인증 필요.',
    endpoint: 'POST /follow/place',
    params: z.object({
      workoutPlaceSeq: z.number().describe('팔로우할 운동 장소 ID'),
    }),
    riskLevel: 'write',
    confirmMessage: '해당 운동 장소를 팔로우하시겠습니까?',
    responseType: 'text',
  }),

  defineTool({
    name: 'unfollow_place',
    description: '특정 운동 장소를 언팔로우한다. 인증 필요.',
    endpoint: 'DELETE /follow/place/:workoutPlaceSeq',
    params: z.object({
      workoutPlaceSeq: z.number().describe('언팔로우할 운동 장소 ID'),
    }),
    riskLevel: 'write',
    confirmMessage: '운동 장소 {workoutPlaceSeq}를 언팔로우하시겠습니까?',
    responseType: 'text',
  }),

  defineTool({
    name: 'get_followers',
    description: '특정 사용자의 팔로워 목록을 조회한다.',
    endpoint: 'GET /follow/followers/:userSeq',
    params: z.object({
      userSeq: z.number().describe('팔로워를 조회할 사용자 ID'),
    }),
    responseType: 'table',
    responseMapping: { dataPath: 'followers' },
    columns: [
      { key: 'userSeq',  label: '사용자 ID', type: 'number' as const },
      { key: 'nickname', label: '닉네임',    type: 'string' as const },
    ],
  }),

  defineTool({
    name: 'get_following',
    description: '특정 사용자가 팔로우하는 사용자 목록을 조회한다.',
    endpoint: 'GET /follow/following/:userSeq',
    params: z.object({
      userSeq: z.number().describe('팔로잉을 조회할 사용자 ID'),
    }),
    responseType: 'table',
    responseMapping: { dataPath: 'following' },
    columns: [
      { key: 'userSeq',  label: '사용자 ID', type: 'number' as const },
      { key: 'nickname', label: '닉네임',    type: 'string' as const },
    ],
  }),

  defineTool({
    name: 'get_following_places',
    description: '특정 사용자가 팔로우하는 운동 장소 목록을 조회한다.',
    endpoint: 'GET /follow/place/:userSeq',
    params: z.object({
      userSeq: z.number().describe('팔로우 중인 장소를 조회할 사용자 ID'),
    }),
    responseType: 'table',
    responseMapping: { dataPath: 'places' },
    columns: [
      { key: 'placeSeq',  label: '장소 ID', type: 'number' as const },
      { key: 'placeName', label: '장소명',  type: 'string' as const },
    ],
  }),

  defineTool({
    name: 'get_follow_counts',
    description: '특정 사용자의 팔로워 수와 팔로잉 수를 조회한다. 주의: 입력값은 반드시 순수 숫자여야 하며, 객체를 전달하지 마시오.',
    endpoint: 'GET /follow/counts/:userSeq',
    params: z.object({
      userSeq: z.string().describe("조회할 사용자의 ID. 본인의 팔로워를 조회하려면 'me'를 입력하십시오."),
    }),
    responseType: 'text',
  }),

  defineTool({
    name: 'check_user_follow_status',
    description: '현재 사용자가 특정 사용자를 팔로우하고 있는지 확인한다.',
    endpoint: 'GET /follow/status/user/:followingUserSeq',
    params: z.object({
      followingUserSeq: z.number().describe('팔로우 상태를 확인할 대상 사용자 ID'),
    }),
    responseType: 'text',
  }),

  defineTool({
    name: 'check_place_follow_status',
    description: '현재 사용자가 특정 운동 장소를 팔로우하고 있는지 확인한다.',
    endpoint: 'GET /follow/status/place/:workoutPlaceSeq',
    params: z.object({
      workoutPlaceSeq: z.number().describe('팔로우 상태를 확인할 운동 장소 ID'),
    }),
    responseType: 'text',
  }),

  defineTool({
    name: 'get_place_follower_count',
    description: '특정 운동 장소의 팔로워 수를 조회한다.',
    endpoint: 'GET /follow/count/place/:workoutPlaceSeq',
    params: z.object({
      workoutPlaceSeq: z.number().describe('팔로워 수를 조회할 운동 장소 ID'),
    }),
    responseType: 'text',
  }),
]
```

- [ ] **Step 2: 타입 체크**

```bash
cd workout-archive-be && npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add src/tools/follow-tools.ts
git commit -m "feat: add follow-tools.ts (v0.4 defineTool)"
```

---

## Task 5: user-tools.ts 생성

사용자 프로필(5개) 도구

**Files:**
- Create: `workout-archive-be/src/tools/user-tools.ts`

- [ ] **Step 1: 파일 생성**

```typescript
import { defineTool } from '@aiglue/core'
import { z } from 'zod'

export const userTools = [
  defineTool({
    name: 'get_user_profile_image',
    description: '특정 닉네임 사용자의 프로필 이미지 URL을 조회한다.',
    endpoint: 'GET /users/profile-image/:userNickname',
    params: z.object({
      userNickname: z.string().describe('프로필 이미지를 조회할 사용자의 닉네임'),
    }),
    responseType: 'text',
  }),

  defineTool({
    name: 'check_profile_ownership',
    description: '현재 로그인한 사용자가 특정 닉네임의 프로필 소유자인지 확인한다.',
    endpoint: 'GET /users/check-profile-ownership/:userNickname',
    params: z.object({
      userNickname: z.string().describe('소유권을 확인할 프로필의 닉네임'),
    }),
    responseType: 'text',
  }),

  defineTool({
    name: 'get_user_seq_by_nickname',
    description: '닉네임으로 사용자의 고유 ID(seq)를 조회한다.',
    endpoint: 'GET /users/seq/:userNickname',
    params: z.object({
      userNickname: z.string().describe('seq를 조회할 사용자의 닉네임'),
    }),
    responseType: 'text',
    responseMapping: { dataPath: 'userSeq' },
  }),

  defineTool({
    name: 'get_my_info',
    description: '현재 로그인한 본인의 숫자 ID(userSeq)를 확인한다.',
    endpoint: 'GET /users/verify-token',
    params: z.object({}),
    responseType: 'text',
    responseMapping: { dataPath: 'userSeq' },
  }),

  defineTool({
    name: 'get_user_profile_info',
    description: '특정 닉네임 사용자의 프로필 정보(닉네임, 소개, 통계 등)를 조회한다.',
    endpoint: 'GET /users/profile-info/:userNickname',
    params: z.object({
      userNickname: z.string().describe('프로필 정보를 조회할 사용자의 닉네임'),
    }),
    responseType: 'text',
  }),
]
```

- [ ] **Step 2: 타입 체크**

```bash
cd workout-archive-be && npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add src/tools/user-tools.ts
git commit -m "feat: add user-tools.ts (v0.4 defineTool)"
```

---

## Task 6: feed-tools.ts 생성

피드(1개) 도구

**Files:**
- Create: `workout-archive-be/src/tools/feed-tools.ts`

- [ ] **Step 1: 파일 생성**

```typescript
import { defineTool } from '@aiglue/core'
import { z } from 'zod'

export const feedTools = [
  defineTool({
    name: 'get_feed',
    description: '현재 로그인한 사용자의 피드(팔로우한 사용자·장소의 최신 운동 기록)를 조회한다. 인증 필요.',
    endpoint: 'GET /feed',
    params: z.object({
      page:  z.number().optional().describe('페이지 번호 (기본값: 1)'),
      limit: z.number().optional().describe('페이지당 항목 수 (기본값: 10)'),
    }),
    responseType: 'table',
    responseMapping: { dataPath: 'records' },
    columns: [
      { key: 'workoutOfTheDaySeq', label: '기록 ID',   type: 'number' as const },
      { key: 'nickname',           label: '작성자',    type: 'string' as const },
      { key: 'workoutDate',        label: '운동 날짜', type: 'date'   as const },
      { key: 'placeName',          label: '운동 장소', type: 'string' as const },
    ],
  }),
]
```

- [ ] **Step 2: 타입 체크**

```bash
cd workout-archive-be && npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add src/tools/feed-tools.ts
git commit -m "feat: add feed-tools.ts (v0.4 defineTool)"
```

---

## Task 7: statistics-tools.ts 생성

통계(4개) + 바디로그(4개) + 운동종목(1개) = 9개 도구

**Files:**
- Create: `workout-archive-be/src/tools/statistics-tools.ts`

- [ ] **Step 1: 파일 생성**

```typescript
import { defineTool } from '@aiglue/core'
import { z } from 'zod'

export const statisticsTools = [
  // ─── Statistics ────────────────────────────────────────────

  defineTool({
    name: 'get_body_log_stats',
    description: '현재 로그인한 사용자의 바디로그(체중·체지방 등) 통계를 조회한다. 인증 필요.',
    endpoint: 'GET /statistics/body-log-stats',
    params: z.object({
      period:   z.enum(['1months', '3months', '6months', '1year', '2years', 'all']).optional().describe('조회 기간 (기본값: 1year)'),
      interval: z.enum(['1week', '2weeks', '4weeks', '3months', 'all']).optional().describe('집계 간격 (기본값: 1week)'),
    }),
    responseType: 'table',
    responseMapping: { dataPath: 'bodyWeight' },
    columns: [
      { key: 'date',        label: '날짜',       type: 'date'   as const },
      { key: 'value',       label: '체중 (kg)',  type: 'number' as const },
      { key: 'isEstimated', label: '추정값 여부', type: 'string' as const },
    ],
  }),

  defineTool({
    name: 'get_exercise_weight_stats',
    description: '현재 로그인한 사용자의 특정 운동 종목 무게 변화 통계를 조회한다. 인증 필요.',
    endpoint: 'GET /statistics/exercise-weight-stats',
    params: z.object({
      exerciseSeqs: z.array(z.number()).min(1).max(5).describe('조회할 운동 종목 ID 목록 (최소 1개, 최대 5개)'),
      period:       z.enum(['1months', '3months', '6months', '1year', '2years', 'all']).optional().describe('조회 기간 (기본값: 3months)'),
      interval:     z.enum(['1week', '2weeks', '4weeks', '3months', 'all']).optional().describe('집계 간격 (기본값: all)'),
      rm:           z.enum(['1RM', '5RM', 'over8RM']).optional().describe('반복 수 기준 (기본값: over8RM)'),
    }),
    responseType: 'table',
    responseMapping: { dataPath: 'exercises' },
    columns: [
      { key: 'exerciseName', label: '운동명',    type: 'string' as const },
      { key: 'exerciseType', label: '운동 유형', type: 'string' as const },
    ],
  }),

  defineTool({
    name: 'get_cardio_stats',
    description: '현재 로그인한 사용자의 유산소 운동 통계를 조회한다. 인증 필요.',
    endpoint: 'GET /statistics/cardio-stats',
    params: z.object({
      period:       z.enum(['1months', '3months', '6months', '1year', '2years', 'all']).optional().describe('조회 기간 (기본값: 3months)'),
      exerciseSeqs: z.array(z.number()).optional().describe('조회할 유산소 운동 종목 ID 목록 (선택사항)'),
    }),
    responseType: 'table',
    columns: [
      { key: 'exerciseName', label: '운동명',    type: 'string' as const },
      { key: 'exerciseType', label: '운동 유형', type: 'string' as const },
    ],
  }),

  defineTool({
    name: 'get_body_part_volume_stats',
    description: '현재 로그인한 사용자의 신체 부위별 운동 볼륨 통계를 조회한다. 인증 필요.',
    endpoint: 'GET /statistics/body-part-volume-stats',
    params: z.object({
      period:   z.enum(['1months', '3months', '6months', '1year', '2years', 'all']).optional().describe('조회 기간 (기본값: 3months)'),
      interval: z.enum(['1week', '2weeks', '1month', '3months', 'all']).optional().describe('집계 간격 (기본값: 1week)'),
      bodyPart: z.enum(['all', 'chest', 'back', 'legs', 'shoulders', 'triceps', 'biceps']).optional().describe('신체 부위 (기본값: all)'),
    }),
    responseType: 'table',
    responseMapping: { dataPath: 'volumeData' },
    columns: [
      { key: 'date',  label: '날짜',       type: 'date'   as const },
      { key: 'value', label: '볼륨 (kg)',  type: 'number' as const },
    ],
  }),

  // ─── Body Logs ─────────────────────────────────────────────

  defineTool({
    name: 'get_body_logs',
    description: '현재 로그인한 사용자의 바디로그 목록을 조회한다. 인증 필요.',
    endpoint: 'GET /users/body-logs',
    params: z.object({}),
    responseType: 'table',
    responseMapping: { dataPath: 'bodyLogs' },
    columns: [
      { key: 'bodyLogSeq', label: '바디로그 ID', type: 'number' as const },
      { key: 'date',       label: '기록 날짜',   type: 'date'   as const },
      { key: 'weight',     label: '체중 (kg)',   type: 'number' as const },
      { key: 'bodyFat',    label: '체지방률 (%)', type: 'number' as const },
    ],
  }),

  defineTool({
    name: 'get_latest_body_log',
    description: '현재 로그인한 사용자의 가장 최신 바디로그를 조회한다. 인증 필요.',
    endpoint: 'GET /users/body-logs/latest',
    params: z.object({}),
    responseType: 'text',
  }),

  defineTool({
    name: 'save_body_log',
    description: '현재 로그인한 사용자의 바디로그(체중, 체지방 등)를 저장한다. 인증 필요.',
    endpoint: 'POST /users/body-logs',
    params: z.object({
      weight:  z.number().optional().describe('체중 (kg)'),
      bodyFat: z.number().optional().describe('체지방률 (%)'),
      date:    z.string().optional().describe('기록 날짜 (YYYY-MM-DD)'),
    }),
    riskLevel: 'write',
    confirmMessage: '바디로그를 저장하시겠습니까?',
    responseType: 'text',
  }),

  defineTool({
    name: 'delete_body_log',
    description: '특정 바디로그를 삭제한다. 인증 필요.',
    endpoint: 'DELETE /users/body-logs/:bodyLogSeq',
    params: z.object({
      bodyLogSeq: z.number().describe('삭제할 바디로그 ID'),
    }),
    riskLevel: 'write',
    confirmMessage: '바디로그 {bodyLogSeq}를 삭제하시겠습니까?',
    responseType: 'text',
  }),

  // ─── Exercises ─────────────────────────────────────────────

  defineTool({
    name: 'get_all_exercises',
    description: '시스템에 등록된 모든 운동 종목 목록을 조회한다.',
    endpoint: 'GET /exercises/exercises',
    params: z.object({}),
    responseType: 'table',
    responseMapping: { dataPath: 'exercises' },
    columns: [
      { key: 'exerciseSeq',  label: '운동 ID', type: 'number' as const },
      { key: 'exerciseName', label: '운동명',  type: 'string' as const },
      { key: 'bodyPart',     label: '부위',    type: 'string' as const },
    ],
  }),
]
```

- [ ] **Step 2: 타입 체크**

```bash
cd workout-archive-be && npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add src/tools/statistics-tools.ts
git commit -m "feat: add statistics-tools.ts (v0.4 defineTool)"
```

---

## Task 8: notification-tools.ts 생성

알림(7개) 도구

**Files:**
- Create: `workout-archive-be/src/tools/notification-tools.ts`

- [ ] **Step 1: 파일 생성**

```typescript
import { defineTool } from '@aiglue/core'
import { z } from 'zod'

export const notificationTools = [
  defineTool({
    name: 'get_notifications',
    description: '현재 로그인한 사용자의 알림 목록을 조회한다. 인증 필요.',
    endpoint: 'GET /notifications/',
    params: z.object({}),
    responseType: 'table',
    responseMapping: { dataPath: 'notifications' },
    columns: [
      { key: 'notificationSeq', label: '알림 ID', type: 'number' as const },
      { key: 'type',            label: '유형',    type: 'badge'  as const },
      { key: 'message',         label: '내용',    type: 'string' as const },
      { key: 'createdAt',       label: '생성일',  type: 'date'   as const },
      { key: 'isRead',          label: '읽음 여부', type: 'string' as const },
    ],
  }),

  defineTool({
    name: 'get_unread_notifications',
    description: '현재 로그인한 사용자의 읽지 않은 알림 목록을 조회한다. 인증 필요.',
    endpoint: 'GET /notifications/unread',
    params: z.object({}),
    responseType: 'table',
    responseMapping: { dataPath: 'notifications' },
    columns: [
      { key: 'notificationSeq', label: '알림 ID', type: 'number' as const },
      { key: 'type',            label: '유형',    type: 'badge'  as const },
      { key: 'message',         label: '내용',    type: 'string' as const },
      { key: 'createdAt',       label: '생성일',  type: 'date'   as const },
    ],
  }),

  defineTool({
    name: 'get_notification_count',
    description: '현재 로그인한 사용자의 읽지 않은 알림 수를 조회한다. 인증 필요.',
    endpoint: 'GET /notifications/count',
    params: z.object({}),
    responseType: 'text',
  }),

  defineTool({
    name: 'mark_notifications_as_read',
    description: '특정 알림들을 읽음 처리한다. 인증 필요.',
    endpoint: 'PATCH /notifications/read',
    params: z.object({
      notificationSeqs: z.array(z.number()).describe('읽음 처리할 알림 ID 목록'),
    }),
    riskLevel: 'write',
    confirmMessage: '선택한 알림을 읽음 처리하시겠습니까?',
    responseType: 'text',
  }),

  defineTool({
    name: 'mark_all_notifications_as_read',
    description: '모든 알림을 읽음 처리한다. 인증 필요.',
    endpoint: 'PATCH /notifications/read/all',
    params: z.object({}),
    riskLevel: 'write',
    confirmMessage: '모든 알림을 읽음 처리하시겠습니까?',
    responseType: 'text',
  }),

  defineTool({
    name: 'delete_notification',
    description: '특정 알림을 삭제한다. 인증 필요.',
    endpoint: 'DELETE /notifications/:notificationSeq',
    params: z.object({
      notificationSeq: z.number().describe('삭제할 알림 ID'),
    }),
    riskLevel: 'write',
    confirmMessage: '알림 {notificationSeq}를 삭제하시겠습니까?',
    responseType: 'text',
  }),

  defineTool({
    name: 'delete_all_notifications',
    description: '모든 알림을 삭제한다. 인증 필요.',
    endpoint: 'DELETE /notifications/all',
    params: z.object({}),
    riskLevel: 'critical',
    confirmMessage: '모든 알림을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    responseType: 'text',
  }),
]
```

- [ ] **Step 2: 타입 체크**

```bash
cd workout-archive-be && npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add src/tools/notification-tools.ts
git commit -m "feat: add notification-tools.ts (v0.4 defineTool)"
```

---

## Task 9: AiRouter.ts 업데이트 + tools.yaml 삭제

**Files:**
- Modify: `workout-archive-be/src/routes/AiRouter.ts`
- Delete: `workout-archive-be/tools.yaml`

- [ ] **Step 1: AiRouter.ts 전체 교체**

`workout-archive-be/src/routes/AiRouter.ts`를 다음으로 교체:

```typescript
import { Router } from 'express'
import { createAIEngine } from '@aiglue/core'
import type { Request } from 'express'
import { workoutTools }      from '../tools/workout-tools'
import { commentTools }      from '../tools/comment-tools'
import { searchTools }       from '../tools/search-tools'
import { followTools }       from '../tools/follow-tools'
import { userTools }         from '../tools/user-tools'
import { feedTools }         from '../tools/feed-tools'
import { statisticsTools }   from '../tools/statistics-tools'
import { notificationTools } from '../tools/notification-tools'

const aiRouter = Router()

const engine = createAIEngine({
  tools: [
    ...workoutTools, ...commentTools, ...searchTools,
    ...followTools,  ...userTools,    ...feedTools,
    ...statisticsTools, ...notificationTools,
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

aiRouter.post('/chat', engine.handler())

export default aiRouter
```

- [ ] **Step 2: tools.yaml 삭제**

```bash
rm workout-archive-be/tools.yaml
```

- [ ] **Step 3: 전체 타입 체크**

```bash
cd workout-archive-be && npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 4: 커밋**

```bash
cd workout-archive-be
git add src/routes/AiRouter.ts
git rm tools.yaml
git commit -m "feat: migrate AiRouter to v0.4 defineTool array, remove tools.yaml"
```

---

## Task 10: 프론트엔드 api/ai.ts 업데이트

v0.4 AIEResponse discriminated union + confirmToken 파라미터

**Files:**
- Modify: `workout-archive-fe/src/api/ai.ts`

**v0.4 응답 타입과 기존 코드의 차이:**
- `text` 타입: `text` 필드 → `content` 필드
- `action` 타입: `text` 필드 → `message` + `status` 필드
- `confirm` 타입: `text` 필드 → `message` 필드, `confirmToken?` 추가
- `error` 타입: `text` 필드 → `message` 필드
- `clarify` 타입 신규: `question` + `options?`
- `multi` 타입 신규: `results[]`
- `table.rows` 타입: `unknown[][]` → `Record<string, unknown>[]`

- [ ] **Step 1: `src/api/ai.ts` 전체 교체**

```typescript
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
```

- [ ] **Step 2: TypeScript 오류 없음 확인**

```bash
cd workout-archive-fe && npx tsc --noEmit
```

Expected: `ai.ts` 관련 타입 오류 없음 (chatSlice, ChatBot.tsx에서 오류가 나면 Task 11-12에서 처리)

- [ ] **Step 3: 커밋**

```bash
git add src/api/ai.ts
git commit -m "feat(fe): update AIChatResponse to v0.4 union + confirmToken param"
```

---

## Task 11: chatSlice.ts 업데이트

`ResponseType` 확장, `confirmPayload.confirmToken` 추가, `tableData.rows` 타입 수정

**Files:**
- Modify: `workout-archive-fe/src/store/slices/chatSlice.ts`
- Modify: `workout-archive-fe/src/store/slices/chatSlice.test.ts`

- [ ] **Step 1: 실패하는 테스트 추가**

`chatSlice.test.ts`의 기존 describe 블록 안에 추가:

```typescript
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
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
cd workout-archive-fe && npx react-scripts test --watchAll=false --testPathPattern=chatSlice
```

Expected: FAIL — `confirmToken` 프로퍼티가 타입에 없어 TypeScript 오류 발생

- [ ] **Step 3: chatSlice.ts 전체 교체**

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type MessageRole = 'user' | 'ai' | 'loading'
export type ResponseType =
  | 'text' | 'table' | 'raw' | 'summary'
  | 'action' | 'confirm' | 'clarify' | 'error' | 'multi'

export interface ColumnDefinition {
  key: string
  label: string
  type?: 'string' | 'number' | 'date' | 'badge'
}

export interface AIChatMessage {
  id: string
  role: MessageRole
  text: string
  responseType?: ResponseType
  confirmPayload?: {
    toolName: string
    params: Record<string, unknown>
    confirmToken?: string
  }
  tableData?: {
    columns: ColumnDefinition[]
    rows: Record<string, unknown>[]
  }
  timestamp: number
}

interface ChatState {
  messages: AIChatMessage[]
  isOpen: boolean
  confirmedMessageIds: string[]
}

const MAX_MESSAGES = 50

const initialState: ChatState = {
  messages: [],
  isOpen: false,
  confirmedMessageIds: [],
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<AIChatMessage>) {
      state.messages.push(action.payload)
      if (state.messages.length > MAX_MESSAGES) {
        state.messages.shift()
      }
    },
    clearMessages(state) {
      state.messages = []
      state.confirmedMessageIds = []
    },
    setOpen(state, action: PayloadAction<boolean>) {
      state.isOpen = action.payload
    },
    markConfirmed(state, action: PayloadAction<string>) {
      if (!state.confirmedMessageIds.includes(action.payload)) {
        state.confirmedMessageIds.push(action.payload)
      }
    },
  },
})

export const { addMessage, clearMessages, setOpen, markConfirmed } = chatSlice.actions
export default chatSlice.reducer
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd workout-archive-fe && npx react-scripts test --watchAll=false --testPathPattern=chatSlice
```

Expected: PASS — 5개 테스트 모두 통과

- [ ] **Step 5: 커밋**

```bash
git add src/store/slices/chatSlice.ts src/store/slices/chatSlice.test.ts
git commit -m "feat(fe): add confirmToken to confirmPayload, expand ResponseType for v0.4"
```

---

## Task 12: ChatBot.tsx + ChatMessage.tsx 업데이트

v0.4 응답 필드명 대응, confirmToken 전달, multi/clarify 처리

**Files:**
- Modify: `workout-archive-fe/src/components/chatbot/ChatBot.tsx`
- Modify: `workout-archive-fe/src/components/chatbot/ChatMessage.tsx`

- [ ] **Step 1: ChatMessage.tsx 업데이트**

`onConfirm` prop에 `confirmToken` 파라미터 추가, 버튼 클릭 시 전달:

```typescript
import React from 'react'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { theme } from '../../styles/theme'
import { AIChatMessage } from '../../store/slices/chatSlice'
import ChatConfirmButtons from './ChatConfirmButtons'

interface Props {
  message: AIChatMessage
  onConfirm: (toolName: string, params: Record<string, unknown>, confirmToken?: string) => void
  onCancel: () => void
  confirmDone: boolean
}

const blink = keyframes`
  0%, 80%, 100% { opacity: 0; }
  40% { opacity: 1; }
`

const Wrapper = styled.div<{ isUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ isUser }) => (isUser ? 'flex-end' : 'flex-start')};
  margin-bottom: 8px;
`

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
`

const TableWrapper = styled.div`
  max-width: 100%;
  overflow-x: auto;
  margin-top: 6px;
  border-radius: 8px;
  border: 1px solid ${theme.border};
  font-size: 13px;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
`

const Th = styled.th`
  padding: 7px 12px;
  background: #f0f4fa;
  color: ${theme.textLight};
  font-weight: 600;
  text-align: left;
  border-bottom: 1px solid ${theme.border};
`

const Td = styled.td`
  padding: 7px 12px;
  color: ${theme.text};
  border-bottom: 1px solid ${theme.border};

  tr:last-child & {
    border-bottom: none;
  }
`

const EmptyRow = styled.div`
  padding: 12px;
  text-align: center;
  color: ${theme.textMuted};
  font-size: 13px;
`

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
`

const ChatMessage: React.FC<Props> = ({ message, onConfirm, onCancel, confirmDone }) => {
  if (message.role === 'loading') {
    return (
      <Wrapper isUser={false}>
        <LoadingDots>
          <span /><span /><span />
        </LoadingDots>
      </Wrapper>
    )
  }

  const isUser    = message.role === 'user'
  const isError   = message.responseType === 'error'
  const isConfirm = message.responseType === 'confirm'
  const isTable   = message.responseType === 'table' && message.tableData

  return (
    <Wrapper isUser={isUser}>
      {message.text && (
        <Bubble isUser={isUser} isError={isError}>
          {message.text}
        </Bubble>
      )}
      {isTable && (
        <TableWrapper>
          {message.tableData!.rows.length === 0 ? (
            <EmptyRow>데이터가 없습니다</EmptyRow>
          ) : (
            <Table>
              <thead>
                <tr>
                  {message.tableData!.columns.map((col) => (
                    <Th key={col.key}>{col.label}</Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {message.tableData!.rows.map((row, i) => (
                  <tr key={i}>
                    {message.tableData!.columns.map((col) => (
                      <Td key={col.key}>{String(row[col.key] ?? '')}</Td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </TableWrapper>
      )}
      {isConfirm && message.confirmPayload && (
        <ChatConfirmButtons
          onConfirm={() =>
            onConfirm(
              message.confirmPayload!.toolName,
              message.confirmPayload!.params,
              message.confirmPayload!.confirmToken,
            )
          }
          onCancel={onCancel}
          disabled={confirmDone}
        />
      )}
    </Wrapper>
  )
}

export default ChatMessage
```

- [ ] **Step 2: ChatBot.tsx 업데이트**

전체 내용:

```typescript
import React, { useEffect, useRef } from 'react'
import styled from '@emotion/styled'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import CloseIcon from '@mui/icons-material/Close'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import { RootState, AppDispatch } from '../../store/store'
import { addMessage, clearMessages, setOpen, markConfirmed, AIChatMessage } from '../../store/slices/chatSlice'
import { sendChatMessage, confirmChatAction, AIChatResponse } from '../../api/ai'
import { theme, media } from '../../styles/theme'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'

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
`

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
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid ${theme.border};
  background: ${theme.primary};
  color: #fff;
  border-radius: 16px 16px 0 0;
`

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
`

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
`

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 2px; }
`

const CONFIRM_KEYWORDS = ['네', '예', 'ㅇ', 'ok', 'yes', '응', 'ㅇㅇ']
const CANCEL_KEYWORDS  = ['아니오', '아니', 'ㄴ', 'no', '아니요', 'nope']

const INITIAL_MESSAGE: AIChatMessage = {
  id: 'initial',
  role: 'ai',
  text: '안녕하세요! 운동 기록, 통계, 팔로우 등 무엇이든 물어보세요 😊',
  timestamp: Date.now(),
}

type SingleResponse = Exclude<AIChatResponse, { type: 'multi' }>

function getResponseText(res: SingleResponse): string {
  switch (res.type) {
    case 'text':    return res.content
    case 'summary': return res.text
    case 'action':  return res.message
    case 'confirm': return res.message
    case 'clarify': return res.question
    case 'error':   return res.message
    case 'table':   return `${res.rows.length}건의 데이터`
    case 'raw':     return JSON.stringify(res.data)
  }
}

function buildAiMessage(res: SingleResponse): AIChatMessage {
  return {
    id: uuidv4(),
    role: 'ai',
    text: getResponseText(res),
    responseType: res.type,
    confirmPayload:
      res.type === 'confirm'
        ? { toolName: res.toolName, params: res.params, confirmToken: res.confirmToken }
        : undefined,
    tableData:
      res.type === 'table'
        ? { columns: res.columns, rows: res.rows }
        : undefined,
    timestamp: Date.now(),
  }
}

function dispatchResponse(
  res: AIChatResponse,
  dispatch: AppDispatch
): void {
  if (res.type === 'multi') {
    for (const result of res.results) {
      dispatch(addMessage(buildAiMessage(result)))
    }
  } else {
    dispatch(addMessage(buildAiMessage(res)))
  }
}

const ChatBot: React.FC = () => {
  const dispatch    = useDispatch<AppDispatch>()
  const { messages, isOpen } = useSelector((state: RootState) => state.chat)
  const confirmedIds = useSelector((state: RootState) => state.chat.confirmedMessageIds)
  const bottomRef   = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const allMessages = messages.length === 0 ? [INITIAL_MESSAGE] : messages

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages, isLoading])

  const handleSend = async (text: string) => {
    const lower = text.trim().toLowerCase()

    const lastConfirmMsg = [...messages].reverse().find((m) => m.responseType === 'confirm')
    if (lastConfirmMsg && lastConfirmMsg.confirmPayload && !confirmedIds.includes(lastConfirmMsg.id)) {
      if (CONFIRM_KEYWORDS.includes(lower)) {
        await handleConfirm(
          lastConfirmMsg.confirmPayload.toolName,
          lastConfirmMsg.confirmPayload.params,
          lastConfirmMsg.confirmPayload.confirmToken,
          lastConfirmMsg.id,
        )
        return
      }
      if (CANCEL_KEYWORDS.includes(lower)) {
        handleCancel(lastConfirmMsg.id)
        return
      }
    }

    const historyBeforeSend = messages
    dispatch(addMessage({
      id: uuidv4(),
      role: 'user',
      text,
      timestamp: Date.now(),
    }))
    setIsLoading(true)

    try {
      const res = await sendChatMessage(text, historyBeforeSend)
      dispatchResponse(res, dispatch)
    } catch {
      dispatch(addMessage({
        id: uuidv4(),
        role: 'ai',
        text: '요청 처리 중 오류가 발생했습니다.',
        responseType: 'error',
        timestamp: Date.now(),
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = async (
    toolName: string,
    params: Record<string, unknown>,
    confirmToken: string | undefined,
    msgId: string,
  ) => {
    dispatch(markConfirmed(msgId))
    setIsLoading(true)
    try {
      const res = await confirmChatAction(toolName, params, confirmToken)
      dispatchResponse(res, dispatch)
    } catch {
      dispatch(addMessage({
        id: uuidv4(),
        role: 'ai',
        text: '실행 중 오류가 발생했습니다.',
        responseType: 'error',
        timestamp: Date.now(),
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = (msgId: string) => {
    dispatch(markConfirmed(msgId))
    dispatch(addMessage({
      id: uuidv4(),
      role: 'ai',
      text: '취소되었습니다.',
      timestamp: Date.now(),
    }))
  }

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
                  onConfirm={(toolName, params, confirmToken) =>
                    handleConfirm(toolName, params, confirmToken, msg.id)
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
  )
}

export default ChatBot
```

- [ ] **Step 3: 전체 TypeScript 체크**

```bash
cd workout-archive-fe && npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd workout-archive-fe && npx react-scripts test --watchAll=false
```

Expected: PASS — chatSlice 테스트 5개 모두 통과

- [ ] **Step 5: 커밋**

```bash
cd workout-archive-fe
git add src/components/chatbot/ChatBot.tsx src/components/chatbot/ChatMessage.tsx
git commit -m "feat(fe): update ChatBot/ChatMessage for v0.4 response types and confirmToken"
```
