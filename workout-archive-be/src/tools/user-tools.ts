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
