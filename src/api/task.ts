import { get, post, put, del } from '@/utils/request'
import type { ScheduledTask, ApiResponse } from '@/types'

export async function getTasks(): Promise<ApiResponse<ScheduledTask[]>> {
  return get<ScheduledTask[]>('/api/instance/tasks')
}

export async function getTasksByInstance(instanceId: number): Promise<ApiResponse<ScheduledTask[]>> {
  return get<ScheduledTask[]>(`/api/instance/tasks/instance/${instanceId}`)
}

export async function createTask(data: {
  instanceId: number
  name: string
  cron: string
  type: string
  payload: string
  enable: boolean
}): Promise<ApiResponse<string>> {
  return post<string>('/api/instance/tasks/create', data)
}

export async function updateTask(id: string, data: Partial<ScheduledTask>): Promise<ApiResponse<any>> {
  return put(`/api/instance/tasks/${id}`, data)
}

export async function deleteTask(id: string): Promise<ApiResponse<any>> {
  return del(`/api/instance/tasks/${id}`)
}
