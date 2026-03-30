import { get, post, del } from '@/utils/request'
import type { Backup, ApiResponse } from '@/types'

export async function getBackups(instanceId: number): Promise<ApiResponse<Backup[]>> {
  return get<Backup[]>(`/api/instance/backups/${instanceId}`)
}

export async function getAllBackups(): Promise<ApiResponse<any[]>> {
  return get<any[]>('/api/instance/backups/all')
}

export async function deleteBackup(instanceId: number, fileName: string): Promise<ApiResponse<any>> {
  return del(`/api/instance/backups/${instanceId}/${encodeURIComponent(fileName)}`)
}

export function getBackupDownloadUrl(instanceId: number, fileName: string): string {
  return `/api/instance/backups/download/${instanceId}/${encodeURIComponent(fileName)}`
}
