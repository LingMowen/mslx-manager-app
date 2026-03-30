import { get, post, put, del } from '@/utils/request'
import type { FileItem, ApiResponse } from '@/types'

export async function getFileList(instanceId: number, path?: string): Promise<ApiResponse<FileItem[]>> {
  const params = path ? { path } : {}
  return get<FileItem[]>(`/api/files/instance/${instanceId}/lists`, { params })
}

export async function getFileContent(instanceId: number, path: string): Promise<ApiResponse<string>> {
  return get<string>(`/api/files/instance/${instanceId}/content`, { params: { path } })
}

export async function saveFile(instanceId: number, path: string, content: string): Promise<ApiResponse<any>> {
  return post(`/api/files/instance/${instanceId}`, { path, content })
}

export async function createFile(instanceId: number, path: string, content?: string): Promise<ApiResponse<any>> {
  return post(`/api/files/instance/${instanceId}`, { path, content: content || '' })
}

export async function renameFile(instanceId: number, oldPath: string, newPath: string): Promise<ApiResponse<any>> {
  return put(`/api/files/instance/${instanceId}/rename`, { oldPath, newPath })
}

export async function deleteFile(instanceId: number, path: string): Promise<ApiResponse<any>> {
  return del(`/api/files/instance/${instanceId}?path=${encodeURIComponent(path)}`)
}

export async function createFolder(instanceId: number, path: string): Promise<ApiResponse<any>> {
  return post(`/api/files/instance/${instanceId}/folder`, { path })
}

export async function moveFile(instanceId: number, source: string, destination: string): Promise<ApiResponse<any>> {
  return put(`/api/files/instance/${instanceId}/move`, { source, destination })
}

export async function copyFile(instanceId: number, source: string, destination: string): Promise<ApiResponse<any>> {
  return put(`/api/files/instance/${instanceId}/copy`, { source, destination })
}

export function getFileDownloadUrl(instanceId: number, path: string): string {
  return `/api/files/instance/${instanceId}/download?path=${encodeURIComponent(path)}`
}

export async function getModList(instanceId: number, mode: 'mods' | 'plugins', checkClient?: boolean): Promise<ApiResponse<any>> {
  const params: any = { mode }
  if (checkClient !== undefined) {
    params.checkClient = checkClient
  }
  return get(`/api/files/pm/instance/${instanceId}/list`, { params })
}

export async function toggleMod(instanceId: number, fileName: string, enable: boolean): Promise<ApiResponse<any>> {
  return put(`/api/files/pm/instance/${instanceId}/toggle`, { fileName, enable })
}

export async function initUpload(): Promise<ApiResponse<{ key: string }>> {
  return post('/api/files/upload/init')
}

export async function uploadChunk(key: string, index: number, chunk: Blob): Promise<ApiResponse<any>> {
  const formData = new FormData()
  formData.append('key', key)
  formData.append('index', index.toString())
  formData.append('chunk', chunk)
  return post('/api/files/upload/chunk', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function completeUpload(key: string, fileName: string, instanceId?: number, targetPath?: string): Promise<ApiResponse<any>> {
  return post('/api/files/upload/complete', { key, fileName, instanceId, targetPath })
}

export async function deleteTempFile(key: string): Promise<ApiResponse<any>> {
  return del(`/api/files/upload/temp/${key}`)
}

export async function getJarList(key: string): Promise<ApiResponse<string[]>> {
  return get<string[]>(`/api/files/upload/jars/${key}`)
}

export async function createCompressTask(instanceId: number, sourcePath: string, targetPath: string): Promise<ApiResponse<any>> {
  return post('/api/files/compress', { instanceId, sourcePath, targetPath })
}

export async function getCompressProgress(taskId: string): Promise<ApiResponse<any>> {
  return get('/api/files/compress/progress', { params: { taskId } })
}

export async function createExtractTask(instanceId: number, sourcePath: string, targetPath: string): Promise<ApiResponse<any>> {
  return post('/api/files/extract', { instanceId, sourcePath, targetPath })
}

export async function getExtractProgress(taskId: string): Promise<ApiResponse<any>> {
  return get('/api/files/extract/progress', { params: { taskId } })
}

export async function addOfflineDownload(url: string, instanceId: number, targetPath: string): Promise<ApiResponse<any>> {
  return post('/api/files/offline/add', { url, instanceId, targetPath })
}

export async function getOfflineDownloadStatus(taskId: string): Promise<ApiResponse<any>> {
  return get('/api/files/offline/status', { params: { taskId } })
}
