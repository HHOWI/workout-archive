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
