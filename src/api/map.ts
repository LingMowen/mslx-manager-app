import { get } from '@/utils/request'
import { storage } from '@/utils/storage'
import type { ApiResponse } from '@/types'

export async function getSpawnPoint(instanceId: number): Promise<ApiResponse<{ x: number; z: number }>> {
  return get<{ x: number; z: number }>(`/api/instance/map/spawn/${instanceId}`)
}

export async function getTileBlob(instanceId: number, x: number, z: number): Promise<string> {
  const server = storage.get<{ url: string; apiKey: string }>('currentServer')
  const userToken = storage.get<string>('token')

  if (!server) {
    throw new Error('No server config')
  }

  const baseUrl = server.url.replace(/\/+$/, '')
  const url = `${baseUrl}/api/instance/map/${instanceId}/${x}/${z}`

  console.log('Map Tile Request:', url)
  console.log('API Key:', server.apiKey ? 'exists' : 'missing')

  const myHeaders = new Headers()
  myHeaders.append('x-api-key', server.apiKey)
  if (userToken) {
    myHeaders.append('x-user-token', userToken)
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: myHeaders
    })

    console.log('Map Tile Response:', response.status, response.statusText)

    if (!response.ok) {
      const text = await response.text()
      console.error('Map Tile Error Response:', text)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const blob = await response.blob()
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error('Map Tile Fetch Error:', error)
    throw error
  }
}