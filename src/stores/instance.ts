import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Instance, InstanceSettings } from '@/types'
import { getInstances, getInstance, getInstanceSettings, createInstance, deleteInstance, instanceAction, updateInstanceSettings, getOnlinePlayers } from '@/api/instance'

export const useInstanceStore = defineStore('instance', () => {
  const instances = ref<Instance[]>([])
  const currentInstance = ref<Instance | null>(null)
  const currentSettings = ref<InstanceSettings | null>(null)
  const onlinePlayersCount = ref<number>(0)
  const isLoading = ref(false)

  const runningCount = computed(() => instances.value.filter((i) => i.status === 2).length)
  const stoppedCount = computed(() => instances.value.filter((i) => i.status === 0).length)

  async function loadInstances() {
    isLoading.value = true
    try {
      const response = await getInstances()
      if (response.code === 200) {
        instances.value = response.data
      }
    } finally {
      isLoading.value = false
    }
  }

  async function loadInstance(id: number): Promise<{ success: boolean; message?: string }> {
    isLoading.value = true
    try {
      const response = await getInstance(id)
      console.log('getInstance response:', JSON.stringify(response, null, 2))
      if (response.code === 200 && response.data) {
        currentInstance.value = response.data
        console.log('currentInstance set to:', JSON.stringify(currentInstance.value, null, 2))
        return { success: true }
      } else {
        console.error('Invalid response:', response)
        currentInstance.value = null
        return { success: false, message: response.message || '无法获取服务器信息' }
      }
    } catch (error: any) {
      console.error('Failed to load instance:', error)
      currentInstance.value = null
      return { success: false, message: error.message || '加载服务器信息失败' }
    } finally {
      isLoading.value = false
    }
  }

  async function loadInstanceSettings(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await getInstanceSettings(id)
      console.log('getInstanceSettings response:', JSON.stringify(response, null, 2))
      if (response.code === 200 && response.data) {
        currentSettings.value = response.data
        console.log('currentSettings set to:', JSON.stringify(currentSettings.value, null, 2))
        return { success: true }
      } else {
        console.error('Invalid settings response:', response)
        currentSettings.value = null
        return { success: false, message: response.message || '无法获取服务器设置' }
      }
    } catch (error: any) {
      console.error('Failed to load instance settings:', error)
      currentSettings.value = null
      return { success: false, message: error.message || '加载服务器设置失败' }
    }
  }

  async function startInstance(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await instanceAction(id, 'start')
      return { success: response.code === 200, message: response.message }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  async function stopInstance(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await instanceAction(id, 'stop')
      return { success: response.code === 200, message: response.message }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  async function backupInstance(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await instanceAction(id, 'backup')
      return { success: response.code === 200, message: response.message }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  async function createNewInstance(data: any): Promise<{ success: boolean; message: string; id?: number }> {
    try {
      const response = await createInstance(data)
      if (response.code === 200) {
        await loadInstances()
        return { success: true, message: '创建成功', id: response.data }
      }
      return { success: false, message: response.message }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  async function removeInstance(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await deleteInstance(id)
      if (response.code === 200) {
        instances.value = instances.value.filter((i) => i.id !== id)
        return { success: true, message: '删除成功' }
      }
      return { success: false, message: response.message }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  async function saveInstanceSettings(id: number, settings: Partial<InstanceSettings>): Promise<{ success: boolean; message: string }> {
    try {
      const response = await updateInstanceSettings(id, settings)
      return { success: response.code === 200, message: response.message }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  function clearCurrentInstance() {
    currentInstance.value = null
    currentSettings.value = null
    onlinePlayersCount.value = 0
  }

  async function loadOnlinePlayers(id: number): Promise<{ success: boolean; count: number; message?: string }> {
    try {
      const response = await getOnlinePlayers(id)
      console.log('getOnlinePlayers response:', JSON.stringify(response, null, 2))
      if (response.code === 200 && Array.isArray(response.data)) {
        onlinePlayersCount.value = response.data.length
        return { success: true, count: response.data.length }
      } else {
        console.error('Invalid players response:', response)
        onlinePlayersCount.value = 0
        return { success: false, count: 0, message: response.message || '无法获取在线玩家信息' }
      }
    } catch (error: any) {
      console.error('Failed to load online players:', error)
      onlinePlayersCount.value = 0
      return { success: false, count: 0, message: error.message || '加载在线玩家失败' }
    }
  }

  return {
    instances,
    currentInstance,
    currentSettings,
    onlinePlayersCount,
    isLoading,
    runningCount,
    stoppedCount,
    loadInstances,
    loadInstance,
    loadInstanceSettings,
    loadOnlinePlayers,
    startInstance,
    stopInstance,
    backupInstance,
    createNewInstance,
    removeInstance,
    saveInstanceSettings,
    clearCurrentInstance,
  }
})
