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
