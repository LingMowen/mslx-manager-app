import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ServerConnection } from '@/types'
import { storage, generateId } from '@/utils/storage'

export const useConnectionStore = defineStore('connection', () => {
  const servers = ref<ServerConnection[]>([])
  const currentServer = ref<ServerConnection | null>(null)
  const isConnected = ref(false)
  const isConnecting = ref(false)

  const hasServers = computed(() => servers.value.length > 0)
  const currentServerName = computed(() => currentServer.value?.name || '')

  function loadServers() {
    const saved = storage.get<ServerConnection[]>('servers')
    if (saved) {
      servers.value = saved
    }
    const current = storage.get<ServerConnection>('currentServer')
    if (current) {
      currentServer.value = current
    }
  }

  function saveServers() {
    storage.set('servers', servers.value)
  }

  async function addServer(server: Omit<ServerConnection, 'id'>): Promise<ServerConnection> {
    const newServer: ServerConnection = {
      ...server,
      id: generateId(),
    }
    servers.value.push(newServer)
    saveServers()
    return newServer
  }

  function updateServer(id: string, updates: Partial<ServerConnection>) {
    const index = servers.value.findIndex((s) => s.id === id)
    if (index !== -1) {
      servers.value[index] = { ...servers.value[index], ...updates }
      saveServers()
    }
  }

  function removeServer(id: string) {
    const index = servers.value.findIndex((s) => s.id === id)
    if (index !== -1) {
      servers.value.splice(index, 1)
      saveServers()
      if (currentServer.value?.id === id) {
        currentServer.value = null
        storage.remove('currentServer')
      }
    }
  }

  async function selectServer(server: ServerConnection) {
    currentServer.value = server
    storage.set('currentServer', server)
    updateServer(server.id, { lastConnected: new Date().toISOString() })
  }

  async function testConnection(url: string, apiKey: string): Promise<{ success: boolean; message: string; status?: string }> {
    try {
      // 设置超时
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      console.log('Testing connection to:', `${url}/api/status`)
      
      // 发送 API Key 验证请求
      const response = await fetch(`${url}/api/status`, {
        headers: { 'x-api-key': apiKey },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (response.ok) {
        // HTTP 200 表示 API Key 有效
        return { success: true, message: 'API 密钥验证成功', status: 'online' }
      } else if (response.status === 401) {
        return { success: false, message: 'API 密钥无效，请检查密钥是否正确', status: 'unauthorized' }
      } else if (response.status === 404) {
        return { success: false, message: '服务器未找到，请检查地址是否正确', status: 'not_found' }
      } else {
        return { success: false, message: `服务器返回错误: ${response.status}`, status: 'error' }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { success: false, message: '连接超时，请检查服务器是否在线', status: 'timeout' }
      } else if (error.message?.includes('Failed to fetch')) {
        return { success: false, message: '无法连接到服务器，请检查网络或服务器地址', status: 'network_error' }
      } else {
        return { success: false, message: `连接失败: ${error.message}`, status: 'unknown' }
      }
    }
  }

  return {
    servers,
    currentServer,
    isConnected,
    isConnecting,
    hasServers,
    currentServerName,
    loadServers,
    addServer,
    updateServer,
    removeServer,
    selectServer,
    testConnection,
  }
})
