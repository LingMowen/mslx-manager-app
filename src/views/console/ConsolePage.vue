<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonBackButton, IonButtons, IonButton, IonIcon, IonInput, IonSpinner, IonBadge, IonFab, IonFabButton, IonActionSheet } from '@ionic/vue'
import { sendOutline, playOutline, stopOutline, refreshOutline, trashOutline, cloudDownloadOutline, ellipsisVerticalOutline, terminalOutline, chevronBackOutline, alertCircleOutline } from 'ionicons/icons'
import { useInstanceStore } from '@/stores/instance'
import { instanceLogHub } from '@/api/signalr'
import { getInstanceLogs } from '@/api/instance'
import { storage } from '@/utils/storage'

const route = useRoute()
const router = useRouter()
const instanceStore = useInstanceStore()

const instanceId = computed(() => Number(route.params.id))
const logs = ref<string[]>([])
const command = ref('')
const isLoading = ref(true)
const isConnected = ref(false)
const connectionError = ref<string | null>(null)
const autoScroll = ref(true)
const showActionSheet = ref(false)

const instance = computed(() => instanceStore.currentInstance)

let logContainer: HTMLElement | null = null

onMounted(async () => {
  await instanceStore.loadInstance(instanceId.value)
  await loadHistoryLogs()
  await connectToHub()
  isLoading.value = false
})

async function loadHistoryLogs() {
  try {
    const response = await getInstanceLogs(instanceId.value, 100)
    if (response.code === 200 && Array.isArray(response.data)) {
      logs.value = response.data
    }
  } catch (error) {
    console.error('Failed to load history logs:', error)
  }
}

onUnmounted(async () => {
  try {
    await instanceLogHub.leaveInstance(instanceId.value)
    await instanceLogHub.disconnect()
  } catch (e) {
    console.warn('Disconnect error:', e)
  }
})

async function connectToHub() {
  connectionError.value = null
  
  const server = storage.get<{ url: string; apiKey: string }>('currentServer')
  
  if (!server) {
    connectionError.value = '未找到服务器配置'
    return
  }

  try {
    const connected = await instanceLogHub.connect()
    
    if (connected) {
      isConnected.value = true
      
      instanceLogHub.onLog((log: string) => {
        logs.value.push(log)
        if (autoScroll.value) {
          nextTick(() => {
            scrollToBottom()
          })
        }
      })
      
      instanceLogHub.onClose(() => {
        isConnected.value = false
        connectionError.value = '连接已断开，请点击重连'
      })
      
      try {
        await instanceLogHub.joinInstance(instanceId.value)
      } catch (joinError) {
        console.error('Failed to join instance group:', joinError)
      }
    } else {
      connectionError.value = '无法连接到实时日志服务'
    }
  } catch (error: any) {
    console.error('SignalR connection error:', error)
    const errorMessage = error?.message || ''
    
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      connectionError.value = '网络连接失败，请检查服务器地址和网络'
    } else if (errorMessage.includes('401') || error?.statusCode === 401) {
      connectionError.value = '认证失败，请检查 API 密钥是否正确'
    } else if (errorMessage.includes('404') || error?.statusCode === 404) {
      connectionError.value = 'SignalR 端点未找到，请检查服务器版本'
    } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      connectionError.value = '连接超时，请检查服务器是否在线'
    } else if (errorMessage.includes('CORS') || errorMessage.includes('cross-origin')) {
      connectionError.value = '跨域请求被拒绝，请检查服务器配置'
    } else {
      connectionError.value = errorMessage || '连接失败，请稍后重试'
    }
  }
}

async function reconnect() {
  isLoading.value = true
  connectionError.value = null
  
  try {
    await instanceLogHub.disconnect()
  } catch (e) {
    console.warn('Disconnect error during reconnect:', e)
  }
  
  await connectToHub()
  isLoading.value = false
}

function scrollToBottom() {
  if (logContainer) {
    logContainer.scrollTop = logContainer.scrollHeight
  }
}

async function sendCommand() {
  if (!command.value.trim() || !isConnected.value) return
  
  try {
    await instanceLogHub.sendCommand(instanceId.value, command.value)
    command.value = ''
  } catch (error) {
    console.error('Send command error:', error)
  }
}

async function startInstance() {
  await instanceStore.startInstance(instanceId.value)
  await instanceStore.loadInstance(instanceId.value)
}

async function stopInstance() {
  await instanceStore.stopInstance(instanceId.value)
  await instanceStore.loadInstance(instanceId.value)
}

async function backupInstance() {
  await instanceStore.backupInstance(instanceId.value)
}

function clearLogs() {
  logs.value = []
}

function handleInputKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    sendCommand()
  }
}

function onScroll(event: any) {
  const target = event.target
  if (target) {
    const { scrollTop, scrollHeight, clientHeight } = target
    autoScroll.value = scrollTop + clientHeight >= scrollHeight - 50
  }
}
</script>

<template>
  <ion-page>
    <div class="app-header">
      <button class="app-header-back-button" @click="router.back()">
        <ion-icon :icon="chevronBackOutline"></ion-icon>
      </button>
      <div class="app-header-center">
        <h1 class="app-header-center-title">控制台</h1>
      </div>
      <button class="app-header-icon-button" @click="showActionSheet = true">
        <ion-icon :icon="ellipsisVerticalOutline"></ion-icon>
      </button>
    </div>
    <ion-content>
      <div v-if="isLoading" class="loading-container">
        <ion-spinner name="circular"></ion-spinner>
        <p class="loading-text">连接中...</p>
      </div>

      <template v-else>
        <div class="status-bar">
          <div class="status-chip" :class="isConnected ? 'connected' : (connectionError ? 'error' : 'connecting')">
            <span class="status-dot"></span>
            <span>{{ isConnected ? '已连接' : (connectionError ? '连接失败' : '连接中...') }}</span>
          </div>
          <div class="status-chip instance-status" :class="instance?.status === 2 ? 'status-running' : 'status-stopped'">
            {{ instance?.status === 2 ? '运行中' : '已停止' }}
          </div>
        </div>

        <div v-if="connectionError && !isConnected" class="error-banner">
          <ion-icon :icon="alertCircleOutline"></ion-icon>
          <span>{{ connectionError }}</span>
          <ion-button size="small" fill="outline" @click="reconnect">重连</ion-button>
        </div>

        <div class="log-container" ref="logContainer" @scroll="onScroll">
          <div v-if="logs.length === 0" class="empty-logs">
            <div class="empty-icon-wrapper">
              <ion-icon :icon="terminalOutline" class="empty-icon"></ion-icon>
            </div>
            <p class="empty-text">{{ isConnected ? '暂无日志，等待服务器输出...' : '正在连接实时日志...' }}</p>
            <p class="empty-subtext" v-if="!isConnected && !connectionError">如果长时间无响应，请检查服务器状态</p>
          </div>
          <div v-else class="log-content">
            <div v-for="(log, index) in logs" :key="index" class="log-line">
              {{ log }}
            </div>
          </div>
        </div>

        <div class="command-bar">
          <div class="command-input-wrapper">
            <ion-input
              v-model="command"
              placeholder="输入命令..."
              class="command-input"
              :disabled="!isConnected"
              @keydown="handleInputKeydown"
            ></ion-input>
          </div>
          <ion-button class="send-button" @click="sendCommand" :disabled="!command.trim() || !isConnected">
            <ion-icon :icon="sendOutline"></ion-icon>
          </ion-button>
        </div>
      </template>

      <ion-action-sheet
        :is-open="showActionSheet"
        header="操作"
        :buttons="[
          { text: instance?.status === 2 ? '停止服务器' : '启动服务器', icon: instance?.status === 2 ? stopOutline : playOutline, handler: () => { instance?.status === 2 ? stopInstance() : startInstance(); showActionSheet = false } },
          { text: '创建备份', icon: cloudDownloadOutline, handler: () => { backupInstance(); showActionSheet = false } },
          { text: '清空日志', icon: trashOutline, handler: () => { clearLogs(); showActionSheet = false } },
          { text: '重新连接', icon: refreshOutline, handler: () => { reconnect(); showActionSheet = false } },
          { text: '取消', role: 'cancel' }
        ]"
        @didDismiss="showActionSheet = false"
      ></ion-action-sheet>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 16px;
}

.loading-text {
  font-size: 14px;
  color: var(--ion-text-color-secondary);
  margin: 0;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--ion-background-color);
}

.status-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 3px;
}

.status-chip.connected {
  background: var(--ion-color-success-container);
  color: var(--ion-color-success);
}

.status-chip.connected .status-dot {
  background: var(--ion-color-success);
}

.status-chip.connecting {
  background: var(--ion-color-warning-container);
  color: var(--ion-color-warning);
}

.status-chip.connecting .status-dot {
  background: var(--ion-color-warning);
}

.status-chip.error {
  background: var(--ion-color-danger-container);
  color: var(--ion-color-danger);
}

.status-chip.error .status-dot {
  background: var(--ion-color-danger);
}

.instance-status.status-running {
  background: var(--ion-color-primary-container);
  color: var(--ion-color-on-primary-container);
}

.instance-status.status-stopped {
  background: var(--ion-color-surface-container-high);
  color: var(--ion-text-color-secondary);
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin: 0 16px 16px;
  background: var(--ion-color-danger-container);
  color: var(--ion-color-danger);
  border-radius: 12px;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(var(--ion-color-danger-rgb), 0.15);
}

.error-banner ion-icon {
  font-size: 20px;
}

.error-banner ion-button {
  margin-left: auto;
  --border-color: var(--ion-color-danger);
  --color: var(--ion-color-danger);
  --border-radius: 8px;
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 8px;
  --padding-bottom: 8px;
  height: auto;
  font-weight: 500;
}

.log-container {
  height: calc(100% - 180px);
  overflow-y: auto;
  background: #1D1B20;
  margin: 0 16px;
  border-radius: 16px;
  padding: 12px;
}

.empty-logs {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.empty-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-icon {
  font-size: 32px;
  color: rgba(255, 255, 255, 0.5);
}

.empty-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 8px 0;
}

.empty-subtext {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  margin: 0;
}

.log-content {
  font-family: 'Consolas', 'Monaco', 'JetBrains Mono', monospace;
  font-size: 12px;
  line-height: 1.6;
}

.log-line {
  color: #E6E0E9;
  white-space: pre-wrap;
  word-break: break-all;
  padding: 2px 0;
}

.command-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--ion-background-color);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.command-input-wrapper {
  flex: 1;
  background: var(--ion-color-surface-container);
  border-radius: 24px;
  overflow: hidden;
}

.command-input {
  --background: transparent;
  --padding-start: 20px;
  --padding-end: 20px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  --color: var(--ion-text-color);
  --placeholder-color: var(--ion-text-color-secondary);
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
}

.send-button {
  --background: var(--ion-color-primary);
  --color: var(--ion-color-primary-contrast);
  --border-radius: 12px;
  width: 48px;
  height: 48px;
  margin: 0;
}

.send-button ion-icon {
  font-size: 20px;
}

/* ion-content 样式优化 */
ion-content {
  --background: var(--ion-background-color);
}

ion-content::part(scroll) {
  padding-bottom: 80px;
}
</style>
