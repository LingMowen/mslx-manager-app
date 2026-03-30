import { get, post, put, del } from '@/utils/request'
import type { Instance, InstanceSettings, ApiResponse } from '@/types'

export async function getInstances(): Promise<ApiResponse<Instance[]>> {
  return get<Instance[]>('/api/instance/list')
}

export async function getInstance(id: number): Promise<ApiResponse<Instance>> {
  return get<Instance>('/api/instance/info', { params: { id } })
}

export async function createInstance(data: {
  name: string
  path?: string
  java?: string
  core: string
  minM: number
  maxM: number
  args?: string
  coreFileKey?: string
  coreUrl?: string
  coreSha256?: string
}): Promise<ApiResponse<number>> {
  return post<number>('/api/instance/createServer', data)
}

export async function deleteInstance(id: number): Promise<ApiResponse<any>> {
  return del(`/api/instance/${id}`)
}

export async function getInstanceIcon(id: number): Promise<string> {
  return `/api/instance/icon/${id}`
}

export async function instanceAction(id: number, action: 'start' | 'stop' | 'backup'): Promise<ApiResponse<any>> {
  return post('/api/instance/action', { id, action })
}

export async function getInstanceSettings(id: number): Promise<ApiResponse<InstanceSettings>> {
  return get<InstanceSettings>(`/api/instance/settings/general/${id}`)
}

export async function updateInstanceSettings(id: number, settings: Partial<InstanceSettings>): Promise<ApiResponse<any>> {
  return put(`/api/instance/settings/${id}`, settings)
}

export async function getCreateProgress(): Promise<ApiResponse<any>> {
  return get('/api/instance/createServer/progress')
}

export async function getJavaList(): Promise<ApiResponse<any[]>> {
  return get<any[]>('/api/java/list')
}

export async function getOnlinePlayers(id: number): Promise<ApiResponse<string[]>> {
  return get<string[]>(`/api/instance/players/online/${id}`)
}

export async function getInstanceLogs(id: number, lines: number = 100): Promise<ApiResponse<string[]>> {
  return get<string[]>(`/api/instance/logs/${id}`, { params: { lines } })
}
