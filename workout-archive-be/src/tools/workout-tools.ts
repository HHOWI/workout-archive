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
