import { post, get } from '@/utils/request'
import type { LoginResponse, ApiResponse } from '@/types'

export async function login(username: string, password: string): Promise<ApiResponse<LoginResponse>> {
  return post<LoginResponse>('/api/auth/login', { username, password })
}

export async function getOAuthUrl(state: string, callback: string): Promise<ApiResponse<{ url: string }>> {
  return get<{ url: string }>('/api/auth/oauth/url', { params: { state, callback } })
}

export async function bindMSLAccount(code: string, state: string): Promise<ApiResponse<any>> {
  return post('/api/auth/oauth/bind', { code, state })
}

export async function loginWithMSL(code: string, state: string): Promise<ApiResponse<LoginResponse>> {
  return post<LoginResponse>('/api/auth/oauth/login', { code, state })
}

export async function unbindMSLAccount(): Promise<ApiResponse<any>> {
  return post('/api/auth/oauth/unbind')
}
