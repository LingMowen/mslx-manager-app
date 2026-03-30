import { get, post, put, del } from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface AdminUser {
  id: string
  username: string
  name: string
  avatar: string
  role: string
  apiKey: string
  openMSLID: string | null
  lastLoginTime: string
  resources: string[]
}

export async function getUserList(): Promise<ApiResponse<AdminUser[]>> {
  return get<AdminUser[]>('/api/admin/user/list')
}

export async function createUser(data: {
  username: string
  password: string
  name?: string
  role?: string
}): Promise<ApiResponse<any>> {
  return post('/api/admin/user', data)
}

export async function updateUser(id: string, data: Partial<AdminUser>): Promise<ApiResponse<any>> {
  return put(`/api/admin/user/${id}`, data)
}

export async function deleteUser(id: string): Promise<ApiResponse<any>> {
  return del(`/api/admin/user/${id}`)
}
