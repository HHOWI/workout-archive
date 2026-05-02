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
