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
