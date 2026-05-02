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
