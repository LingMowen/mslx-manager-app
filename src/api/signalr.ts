import { HubConnectionBuilder, HubConnection, LogLevel, HttpTransportType } from '@microsoft/signalr'
import { storage } from '@/utils/storage'

function getServerConfig(): { url: string; apiKey: string } | null {
  return storage.get<{ url: string; apiKey: string }>('currentServer')
}

function getUserToken(): string | null {
  return storage.get<string>('token')
}

export class InstanceLogHub {
  private connection: HubConnection | null = null
  private isConnected = false

  async connect(): Promise<boolean> {
    const server = getServerConfig()
    if (!server) {
      console.error('No server config found')
      return false
    }

    const userToken = getUserToken()

    try {
      let hubUrl = server.url.replace(/\/+$/, '')
      hubUrl = `${hubUrl}/api/hubs/instanceControlHub`

      this.connection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          transport: HttpTransportType.LongPolling,
          headers: {
            'x-api-key': server.apiKey,
            ...(userToken ? { 'x-user-token': userToken } : {})
          },
          accessTokenFactory: userToken ? () => userToken : undefined,
          withCredentials: false,
          skipNegotiation: false
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.elapsedMilliseconds < 60000) {
              return Math.min(retryContext.previousRetryCount * 2000, 10000)
            }
            return null
          },
        })
        .configureLogging(LogLevel.Warning)
        .build()

      this.connection.onclose((error) => {
        console.log('SignalR connection closed:', error)
        this.isConnected = false
      })

      this.connection.onreconnected((connectionId) => {
        console.log('SignalR reconnected:', connectionId)
        this.isConnected = true
      })

      this.connection.onreconnecting((error) => {
        console.log('SignalR reconnecting:', error)
        this.isConnected = false
      })

      await this.connection.start()
      this.isConnected = true
      console.log('SignalR connected successfully')
      return true
    } catch (error: any) {
      console.error('Failed to connect to InstanceLogHub:', error)
      this.isConnected = false
      return false
    }
  }

  async joinInstance(instanceId: number): Promise<void> {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke('JoinGroup', instanceId)
        console.log('Joined instance group:', instanceId)
      } catch (error) {
        console.error('Failed to join instance group:', error)
        throw error
      }
    } else {
      console.warn('Cannot join instance: not connected')
    }
  }

  async leaveInstance(instanceId: number): Promise<void> {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke('LeaveGroup', instanceId)
        console.log('Left instance group:', instanceId)
      } catch (error) {
        console.error('Failed to leave instance group:', error)
      }
    }
  }

  onLog(callback: (log: string) => void): void {
    if (this.connection) {
      this.connection.on('ReceiveLog', callback)
    }
  }

  onCommandResult(callback: (result: any) => void): void {
    if (this.connection) {
      this.connection.on('CommandResult', callback)
    }
  }

  onClose(callback: () => void): void {
    if (this.connection) {
      this.connection.onclose(() => {
        callback()
      })
    }
  }

  async sendCommand(instanceId: number, command: string): Promise<void> {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke('SendCommand', instanceId, command)
      } catch (error) {
        console.error('Failed to send command:', error)
        throw error
      }
    } else {
      console.warn('Cannot send command: not connected')
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop()
        console.log('SignalR disconnected')
      } catch (error) {
        console.error('Error disconnecting:', error)
      }
      this.connection = null
      this.isConnected = false
    }
  }

  getConnectionState(): boolean {
    return this.isConnected
  }
}

export class FrpLogHub {
  private connection: HubConnection | null = null
  private isConnected = false

  async connect(): Promise<boolean> {
    const server = getServerConfig()
    if (!server) return false

    const userToken = getUserToken()

    try {
      let hubUrl = server.url.replace(/\/+$/, '')
      hubUrl = `${hubUrl}/api/hubs/frpLogsHub`

      this.connection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          transport: HttpTransportType.LongPolling,
          headers: {
            'x-api-key': server.apiKey,
            ...(userToken ? { 'x-user-token': userToken } : {})
          },
          accessTokenFactory: userToken ? () => userToken : undefined
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: () => 3000,
        })
        .configureLogging(LogLevel.Information)
        .build()

      this.connection.onclose(() => {
        this.isConnected = false
      })

      this.connection.onreconnected(() => {
        this.isConnected = true
      })

      await this.connection.start()
      this.isConnected = true
      return true
    } catch (error: any) {
      console.error('Failed to connect to FrpLogHub:', error)
      this.isConnected = false
      return false
    }
  }

  async joinFrp(frpId: number): Promise<void> {
    if (this.connection && this.isConnected) {
      await this.connection.invoke('JoinGroup', frpId)
    }
  }

  async leaveFrp(frpId: number): Promise<void> {
    if (this.connection && this.isConnected) {
      await this.connection.invoke('LeaveGroup', frpId)
    }
  }

  onLog(callback: (log: string) => void): void {
    if (this.connection) {
      this.connection.on('ReceiveLog', callback)
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop()
      this.connection = null
      this.isConnected = false
    }
  }
}

export class DaemonUpdateHub {
  private connection: HubConnection | null = null
  private isConnected = false

  async connect(): Promise<boolean> {
    const server = getServerConfig()
    if (!server) return false

    const userToken = getUserToken()

    try {
      let hubUrl = server.url.replace(/\/+$/, '')
      hubUrl = `${hubUrl}/api/hubs/daemonUpdate`

      this.connection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          transport: HttpTransportType.LongPolling,
          headers: {
            'x-api-key': server.apiKey,
            ...(userToken ? { 'x-user-token': userToken } : {})
          },
          accessTokenFactory: userToken ? () => userToken : undefined
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: () => 3000,
        })
        .configureLogging(LogLevel.Information)
        .build()

      this.connection.onclose(() => {
        this.isConnected = false
      })

      this.connection.onreconnected(() => {
        this.isConnected = true
      })

      await this.connection.start()
      this.isConnected = true
      return true
    } catch (error: any) {
      console.error('Failed to connect to DaemonUpdateHub:', error)
      this.isConnected = false
      return false
    }
  }

  onUpdateProgress(callback: (progress: any) => void): void {
    if (this.connection) {
      this.connection.on('UpdateProgress', callback)
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop()
      this.connection = null
      this.isConnected = false
    }
  }
}

export const instanceLogHub = new InstanceLogHub()
export const frpLogHub = new FrpLogHub()
export const daemonUpdateHub = new DaemonUpdateHub()
