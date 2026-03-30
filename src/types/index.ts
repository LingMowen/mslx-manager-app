export interface ServerConnection {
  id: string
  name: string
  url: string
  apiKey: string
  lastConnected?: string
}

export interface UserInfo {
  username: string
  avatar: string
  role: string
  resources: string[]
}

export interface LoginResponse {
  token: string
  userInfo: UserInfo
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface Instance {
  id: number
  name: string
  basePath: string
  java: string
  core: string
  icon?: string
  status: number
  statusText: string
  args?: string
  minM?: number
  maxM?: number
  uptime?: string
  monitorPlayers?: boolean
  mcConfig?: {
    difficulty: string
    gamemode: string
    levelName: string
    serverPort: string
    onlineMode: string
  }
  extra?: {
    onlinePlayers: number
  }
}

export interface InstanceSettings {
  id: number
  name: string
  base: string
  java: string
  core: string
  minM: number
  maxM: number
  args: string
  yggdrasilApiAddr: string
  backupMaxCount: number
  backupDelay: number
  backupPath: string
  autoRestart: boolean
  runOnStartup: boolean
  inputEncoding: string
  outputEncoding: string
  stopCommand?: string
  forceExitDelay?: number
  monitorPlayers?: boolean
  forceAutoRestart?: boolean
  ignoreEula?: boolean
  forceJvmUTF8?: boolean
  fileEncoding?: string
  allowOriginASCIIColors?: boolean
}

export interface Player {
  uuid?: string
  name: string
}

export interface Backup {
  fileName: string
  fileSize: number
  fileSizeStr: string
  createTime: string
  timestamp: number
}

export interface ScheduledTask {
  id: string
  instanceId: number
  name: string
  cron: string
  type: string
  payload: string
  enable: boolean
}

export interface FrpTunnel {
  id: number
  name: string
  provider: string
  status: number
  statusText: string
}

export interface FileItem {
  name: string
  type: 'file' | 'folder'
  size: number
  lastModified: string
  permission: string
}

export interface DaemonStatus {
  clientName: string
  version: string
  serverTime: string
}

export interface SystemSettings {
  fireWallBanLocalAddr: boolean
  openWebConsoleOnLaunch: boolean
  neoForgeInstallerMirrors: string
  listenHost: string
  listenPort: number
  oAuthMSLClientID: string
  oAuthMSLClientSecret: string
}
