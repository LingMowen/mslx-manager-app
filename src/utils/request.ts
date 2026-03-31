import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types'
import { storage } from '@/utils/storage'

const request: AxiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

let currentUserToken: string | null = null

export function setAuthToken(token: string | null) {
  currentUserToken = token
  if (token) {
    storage.set('token', token)
  } else {
    storage.remove('token')
  }
}

function getServerConfig(): { url: string; apiKey: string } | null {
  return storage.get<{ url: string; apiKey: string }>('currentServer')
}

request.interceptors.request.use(
  (config) => {
    const server = getServerConfig()
    if (server) {
      config.baseURL = server.url.replace(/\/+$/, '')
      config.headers['x-api-key'] = server.apiKey
    }
    const token = currentUserToken || storage.get<string>('token')
    if (token) {
      config.headers['x-user-token'] = token
    }
    console.log('API Request:', config.method?.toUpperCase(), (config.baseURL || '') + (config.url || ''))
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export async function get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  const response = await request.get<ApiResponse<T>>(url, config)
  return response.data
}

export async function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  const response = await request.post<ApiResponse<T>>(url, data, config)
  return response.data
}

export async function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  const response = await request.put<ApiResponse<T>>(url, data, config)
  return response.data
}

export async function del<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  const response = await request.delete<ApiResponse<T>>(url, config)
  return response.data
}

export default request
