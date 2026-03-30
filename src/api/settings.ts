import { get, put, post } from '@/utils/request'
import type { DaemonStatus, SystemSettings, ApiResponse } from '@/types'

export async function getStatus(): Promise<ApiResponse<DaemonStatus>> {
  return get<DaemonStatus>('/api/status')
}

export async function getSystemSettings(): Promise<ApiResponse<SystemSettings>> {
  return get<SystemSettings>('/api/settings')
}

export async function updateSystemSettings(settings: Partial<SystemSettings>): Promise<ApiResponse<any>> {
  return put('/api/settings', settings)
}

export async function getUserInfo(): Promise<ApiResponse<any>> {
  return get('/api/user/info')
}

export async function updateUserInfo(info: any): Promise<ApiResponse<any>> {
  return put('/api/user/info', info)
}

export async function getUserStyle(): Promise<ApiResponse<any>> {
  return get('/api/user/style')
}

export async function updateUserStyle(style: any): Promise<ApiResponse<any>> {
  return put('/api/user/style', style)
}

export async function getCustomStyle(): Promise<ApiResponse<any>> {
  return get('/api/customStyle')
}

export async function updateCustomStyle(style: any): Promise<ApiResponse<any>> {
  return put('/api/customStyle', style)
}

export async function getUpdateInfo(): Promise<ApiResponse<any>> {
  return get('/api/update/info')
}

export async function getUpdateUrl(): Promise<ApiResponse<{ url: string }>> {
  return get<{ url: string }>('/api/update/url')
}

export async function startUpdate(): Promise<ApiResponse<any>> {
  return post('/api/update/start')
}
