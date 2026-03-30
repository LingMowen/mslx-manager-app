import { get, post, del } from '@/utils/request'
import type { Player, ApiResponse } from '@/types'

export async function getOnlinePlayers(instanceId: number): Promise<ApiResponse<string[]>> {
  return get<string[]>(`/api/instance/players/online/${instanceId}`)
}

export async function getHistoryPlayers(instanceId: number): Promise<ApiResponse<Player[]>> {
  return get<Player[]>(`/api/instance/players/history/${instanceId}`)
}

export async function getWhitelist(instanceId: number): Promise<ApiResponse<Player[]>> {
  return get<Player[]>(`/api/instance/players/whitelist/${instanceId}`)
}

export async function addWhitelist(instanceId: number, name: string): Promise<ApiResponse<any>> {
  return post(`/api/instance/players/whitelist/${instanceId}`, { name })
}

export async function removeWhitelist(instanceId: number, name: string): Promise<ApiResponse<any>> {
  return del(`/api/instance/players/whitelist/${instanceId}?name=${encodeURIComponent(name)}`)
}

export async function getAdmins(instanceId: number): Promise<ApiResponse<Player[]>> {
  return get<Player[]>(`/api/instance/players/admins/${instanceId}`)
}

export async function addAdmin(instanceId: number, name: string): Promise<ApiResponse<any>> {
  return post(`/api/instance/players/admins/${instanceId}`, { name })
}

export async function removeAdmin(instanceId: number, name: string): Promise<ApiResponse<any>> {
  return del(`/api/instance/players/admins/${instanceId}?name=${encodeURIComponent(name)}`)
}

export async function getBannedPlayers(instanceId: number): Promise<ApiResponse<Player[]>> {
  return get<Player[]>(`/api/instance/players/banned/${instanceId}`)
}

export async function banPlayer(instanceId: number, name: string): Promise<ApiResponse<any>> {
  return post(`/api/instance/players/banned/${instanceId}`, { name })
}

export async function unbanPlayer(instanceId: number, name: string): Promise<ApiResponse<any>> {
  return del(`/api/instance/players/banned/${instanceId}?name=${encodeURIComponent(name)}`)
}

export async function getBannedIPs(instanceId: number): Promise<ApiResponse<string[]>> {
  return get<string[]>(`/api/instance/players/bannedip/${instanceId}`)
}

export async function banIP(instanceId: number, ip: string): Promise<ApiResponse<any>> {
  return post(`/api/instance/players/bannedip/${instanceId}`, { ip })
}

export async function unbanIP(instanceId: number, ip: string): Promise<ApiResponse<any>> {
  return del(`/api/instance/players/bannedip/${instanceId}?ip=${encodeURIComponent(ip)}`)
}
