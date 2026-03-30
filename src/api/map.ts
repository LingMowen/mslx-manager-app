import { get } from '@/utils/request'
import type { ApiResponse } from '@/types'

export async function getSpawnPoint(instanceId: number): Promise<ApiResponse<{ x: number; z: number }>> {
  return get<{ x: number; z: number }>(`/api/instance/map/spawn/${instanceId}`)
}

export function getTileUrl(instanceId: number, x: number, z: number, zoom: number): string {
  return `/api/instance/map/tile/${instanceId}?x=${x}&z=${z}&zoom=${zoom}`
}
