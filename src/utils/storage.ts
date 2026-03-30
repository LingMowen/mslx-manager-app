const STORAGE_PREFIX = 'mslx_'

export const storage = {
  get<T>(key: string): T | null {
    const value = localStorage.getItem(STORAGE_PREFIX + key)
    if (value) {
      try {
        return JSON.parse(value) as T
      } catch {
        return value as unknown as T
      }
    }
    return null
  },

  set(key: string, value: any): void {
    if (typeof value === 'string') {
      localStorage.setItem(STORAGE_PREFIX + key, value)
    } else {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
    }
  },

  remove(key: string): void {
    localStorage.removeItem(STORAGE_PREFIX + key)
  },

  clear(): void {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  },
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
