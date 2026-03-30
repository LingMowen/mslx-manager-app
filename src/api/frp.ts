import { get, post, put, del } from '@/utils/request'
import type { FrpTunnel, ApiResponse } from '@/types'

export async function getFrpList(): Promise<ApiResponse<FrpTunnel[]>> {
  return get<FrpTunnel[]>('/api/frp/list')
}

export async function getFrp(id: number): Promise<ApiResponse<FrpTunnel>> {
  return get<FrpTunnel>(`/api/frp/${id}`)
}

export async function createFrp(data: {
  name: string
  provider: string
  config: string
  format: string
}): Promise<ApiResponse<any>> {
  return post('/api/frp/add', data)
}

export async function deleteFrp(id: number): Promise<ApiResponse<any>> {
  return del(`/api/frp/${id}`)
}

export async function frpAction(id: number, action: 'start' | 'stop'): Promise<ApiResponse<any>> {
  return post('/api/frp/action', { id, action })
}

export async function getAutostartList(): Promise<ApiResponse<number[]>> {
  return get<number[]>('/api/frp/autostart')
}

export async function updateAutostartList(ids: number[]): Promise<ApiResponse<any>> {
  return put('/api/frp/autostart', { ids })
}
