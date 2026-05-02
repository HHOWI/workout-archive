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
