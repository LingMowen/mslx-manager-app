import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types'
import { storage } from '@/utils/storage'
import { setAuthToken } from '@/utils/request'
import { login as apiLogin } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const userInfo = ref<UserInfo | null>(null)
  const isLoading = ref(false)

  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username || '')
  const role = computed(() => userInfo.value?.role || '')
  const avatar = computed(() => userInfo.value?.avatar || '')

  function loadAuth() {
    const savedToken = storage.get<string>('token')
    const savedUserInfo = storage.get<UserInfo>('userInfo')
    if (savedToken) {
      token.value = savedToken
      setAuthToken(savedToken)
    }
    if (savedUserInfo) {
      userInfo.value = savedUserInfo
    }
  }

  async function login(username: string, password: string): Promise<{ success: boolean; message: string }> {
    isLoading.value = true
    try {
      const response = await apiLogin(username, password)
      if (response.code === 200) {
        token.value = response.data.token
        userInfo.value = response.data.userInfo
        storage.set('token', response.data.token)
        storage.set('userInfo', response.data.userInfo)
        setAuthToken(response.data.token)
        return { success: true, message: '登录成功' }
      }
      return { success: false, message: response.message || '登录失败' }
    } catch (error: any) {
      return { success: false, message: error.message || '登录失败' }
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    token.value = null
    userInfo.value = null
    storage.remove('token')
    storage.remove('userInfo')
    setAuthToken(null)
  }

  function updateUserInfo(info: Partial<UserInfo>) {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...info }
      storage.set('userInfo', userInfo.value)
    }
  }

  return {
    token,
    userInfo,
    isLoading,
    isLoggedIn,
    username,
    role,
    avatar,
    loadAuth,
    login,
    logout,
    updateUserInfo,
  }
})
