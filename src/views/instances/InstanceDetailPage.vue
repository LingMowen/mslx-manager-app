<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonBackButton, IonButtons, IonSegment, IonSegmentButton, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonSpinner, IonRefresher, IonRefresherContent, IonBadge, IonGrid, IonRow, IonCol, IonFab, IonFabButton, IonActionSheet } from '@ionic/vue'
import { playOutline, stopOutline, cloudDownloadOutline, settingsOutline, terminalOutline, peopleOutline, folderOutline, timeOutline, mapOutline, trashOutline, refreshOutline, ellipsisVerticalOutline, chevronForwardOutline, chevronBackOutline, alertCircleOutline, cubeOutline } from 'ionicons/icons'
import { useInstanceStore } from '@/stores/instance'
import type { Instance } from '@/types'

const route = useRoute()
const router = useRouter()
const instanceStore = useInstanceStore()

const instanceId = computed(() => Number(route.params.id))
const instance = computed(() => instanceStore.currentInstance)
const settings = computed(() => instanceStore.currentSettings)
const onlinePlayersCount = computed(() => instanceStore.onlinePlayersCount)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const selectedTab = ref('info')
const showActionSheet = ref(false)

let refreshInterval: number | null = null

onMounted(async () => {
  await loadInstance()
  // 启动定时刷新，每 10 秒刷新一次在线玩家数量
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})

function startAutoRefresh() {
  // 立即刷新一次
  const id = instanceId.value
  if (typeof id === 'number' && !isNaN(id) && isRunning(instance.value?.status)) {
    instanceStore.loadOnlinePlayers(id)
  }
  // 每 10 秒刷新
  refreshInterval = window.setInterval(() => {
    const currentId = instanceId.value
    if (typeof currentId === 'number' && !isNaN(currentId) && isRunning(instance.value?.status)) {
      instanceStore.loadOnlinePlayers(currentId)
    }
  }, 10000)
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

async function loadInstance() {
  isLoading.value = true
  errorMessage.value = null
  try {
    console.log('Loading instance:', instanceId.value)
    
    // 加载实例信息
    const instanceResult = await instanceStore.loadInstance(instanceId.value)
    console.log('Instance result:', instanceResult)
    
    if (!instanceResult.success) {
      errorMessage.value = instanceResult.message || '无法加载服务器信息'
      return
    }
    
    console.log('Instance loaded:', JSON.stringify(instanceStore.currentInstance, null, 2))
    console.log('Instance status:', instanceStore.currentInstance?.status, typeof instanceStore.currentInstance?.status)
    
    // 加载设置
    const settingsResult = await instanceStore.loadInstanceSettings(instanceId.value)
    console.log('Settings result:', settingsResult)
    
    // 加载在线玩家
    const playersResult = await instanceStore.loadOnlinePlayers(instanceId.value)
    console.log('Players result:', playersResult)
    
    if (!playersResult.success) {
      console.warn('Failed to load players:', playersResult.message)
    }
    
    console.log('Online players count:', instanceStore.onlinePlayersCount)
    
    // 验证数据
    if (!instanceStore.currentInstance) {
      errorMessage.value = '无法加载服务器信息，请检查网络连接'
    }
  } catch (error: any) {
    console.error('Failed to load instance:', error)
    errorMessage.value = error.message || '加载失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

async function handleRefresh(event: any) {
  await loadInstance()
  event.target.complete()
}

function getStatusColor(status: number | string): string {
  const statusNum = Number(status)
  if (statusNum === 2) return 'success'
  if (statusNum === 1) return 'warning'
  return 'medium'
}

function getStatusText(status: number | string, statusText?: string): string {
  if (statusText) return statusText
  const statusNum = Number(status)
  if (statusNum === 2) return '运行中'
  if (statusNum === 1) return '启动中'
  return '已停止'
}

function isRunning(status: number | string | undefined): boolean {
  if (status === undefined) return false
  return Number(status) === 2
}

function isStopped(status: number | string | undefined): boolean {
  if (status === undefined) return true
  return Number(status) !== 2
}

async function startInstance() {
  await instanceStore.startInstance(instanceId.value)
  await loadInstance()
  // 启动后刷新在线玩家
  setTimeout(() => {
    instanceStore.loadOnlinePlayers(instanceId.value)
  }, 2000)
}

async function stopInstance() {
  await instanceStore.stopInstance(instanceId.value)
  await loadInstance()
}

async function backupInstance() {
  await instanceStore.backupInstance(instanceId.value)
}

async function deleteInstance() {
  if (confirm('确定要删除此服务器实例吗？此操作不可恢复。')) {
    const result = await instanceStore.removeInstance(instanceId.value)
    if (result.success) {
      router.push('/home')
    }
  }
}

function openConsole() {
  router.push(`/instances/${instanceId.value}/console`)
}

function openPlayers() {
  router.push(`/instances/${instanceId.value}/players`)
}

function openFiles() {
  router.push(`/instances/${instanceId.value}/files`)
}

function openBackups() {
  router.push(`/instances/${instanceId.value}/backups`)
}

function openTasks() {
  router.push(`/instances/${instanceId.value}/tasks`)
}

function openMap() {
  router.push(`/instances/${instanceId.value}/map`)
}

function openSettings() {
  router.push(`/instances/${instanceId.value}/settings`)
}

async function handleAction(action: string) {
  switch (action) {
    case 'start':
      await startInstance()
      break
    case 'stop':
      await stopInstance()
      break
    case 'backup':
      await backupInstance()
      break
    case 'delete':
      await deleteInstance()
      break
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
        <h1 class="app-header-center-title">{{ instance?.name || '服务器详情' }}</h1>
      </div>
      <button class="app-header-icon-button" @click="showActionSheet = true">
        <ion-icon :icon="ellipsisVerticalOutline"></ion-icon>
      </button>
    </div>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div v-if="isLoading" class="loading-container">
        <ion-spinner name="circular"></ion-spinner>
        <p class="loading-text">加载中...</p>
      </div>

      <div v-else-if="errorMessage" class="error-container">
        <div class="error-icon-wrapper">
          <ion-icon :icon="alertCircleOutline" class="error-icon"></ion-icon>
        </div>
        <h3 class="error-title">{{ errorMessage }}</h3>
        <p class="error-desc">请检查网络连接或服务器配置</p>
        <ion-button @click="loadInstance" class="retry-button">
          重试
        </ion-button>
      </div>

      <template v-else-if="instance">
        <div class="content-wrapper">
          <!-- 粘性顶部区域 - 状态和选项卡 -->
          <div class="sticky-header">
            <div class="status-header">
              <div class="status-chip" :class="'status-' + getStatusColor(instance?.status)">
                <span class="status-dot"></span>
                <span>{{ getStatusText(instance?.status, instance?.statusText) }}</span>
              </div>
              <div class="player-info" v-if="isRunning(instance?.status)">
                <ion-icon :icon="peopleOutline"></ion-icon>
                <span>{{ onlinePlayersCount }} 在线玩家</span>
              </div>
            </div>

            <!-- 选项卡标题 -->
            <div class="segment-header">
              <div class="segment-title">
                <span class="server-name">{{ instance?.name || '未知服务器' }}</span>
                <span class="server-status" :class="'status-' + getStatusColor(instance?.status)">
                  {{ getStatusText(instance?.status, instance?.statusText) }}
                </span>
              </div>
              <div class="server-meta">
                <span class="meta-item" v-if="isRunning(instance?.status)">
                  <ion-icon :icon="peopleOutline"></ion-icon>
                  {{ onlinePlayersCount }} 人在线
                </span>
                <span class="meta-item" v-if="instance?.core && instance?.core !== 'none'">
                  <ion-icon :icon="cubeOutline"></ion-icon>
                  {{ instance.core }}
                </span>
              </div>
            </div>

            <ion-segment v-model="selectedTab" class="main-segment">
              <ion-segment-button value="info">
                <ion-label>信息</ion-label>
              </ion-segment-button>
              <ion-segment-button value="actions">
                <ion-label>操作</ion-label>
              </ion-segment-button>
            </ion-segment>
          </div>

          <div v-if="selectedTab === 'info'" class="tab-content">
            <div class="section-title">基本信息</div>
            <ion-card class="info-card">
              <ion-card-content>
                <div class="info-row">
                  <div class="info-item">
                    <span class="info-label">核心类型</span>
                    <span class="info-value">{{ instance?.core && instance?.core !== 'none' ? instance.core : '未设置' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Java 版本</span>
                    <span class="info-value">{{ instance?.java && instance?.java !== 'none' ? instance.java : '未设置' }}</span>
                  </div>
                </div>
                <div class="info-item full-width">
                  <span class="info-label">服务器路径</span>
                  <span class="info-value path">{{ instance?.basePath || '-' }}</span>
                </div>
              </ion-card-content>
            </ion-card>

            <div v-if="settings" class="section-title">运行配置</div>
            <ion-card v-if="settings" class="info-card">
              <ion-card-content>
                <div class="info-row">
                  <div class="info-item">
                    <span class="info-label">最小内存</span>
                    <span class="info-value memory">{{ instance?.minM || settings?.minM || '未设置' }} MB</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">最大内存</span>
                    <span class="info-value memory">{{ instance?.maxM || settings?.maxM || '未设置' }} MB</span>
                  </div>
                </div>
                <div class="info-item full-width">
                  <span class="info-label">启动参数</span>
                  <span class="info-value args">{{ instance?.args || settings?.args || '无' }}</span>
                </div>
              </ion-card-content>
            </ion-card>
          </div>

          <div v-if="selectedTab === 'actions'" class="tab-content">
            <div class="quick-actions">
              <ion-button v-if="!isRunning(instance?.status)" expand="block" class="action-button start" @click="startInstance">
                <ion-icon :icon="playOutline" slot="start"></ion-icon>
                <span>启动服务器</span>
              </ion-button>
              <ion-button v-if="isRunning(instance?.status)" expand="block" class="action-button stop" @click="stopInstance">
                <ion-icon :icon="stopOutline" slot="start"></ion-icon>
                <span>停止服务器</span>
              </ion-button>
            </div>

            <div class="section-title">快捷操作</div>
            <div class="action-list">
              <ion-card class="action-item" @click="openConsole">
                <ion-card-content>
                  <div class="action-content">
                    <div class="action-icon-wrapper">
                      <ion-icon :icon="terminalOutline"></ion-icon>
                    </div>
                    <div class="action-text">
                      <span class="action-title">控制台</span>
                      <span class="action-desc">查看服务器日志和发送命令</span>
                    </div>
                    <ion-icon :icon="chevronForwardOutline" class="action-chevron"></ion-icon>
                  </div>
                </ion-card-content>
              </ion-card>

              <ion-card class="action-item" @click="openPlayers">
                <ion-card-content>
                  <div class="action-content">
                    <div class="action-icon-wrapper">
                      <ion-icon :icon="peopleOutline"></ion-icon>
                    </div>
                    <div class="action-text">
                      <span class="action-title">玩家管理</span>
                      <span class="action-desc">管理在线玩家和白名单</span>
                    </div>
                    <ion-icon :icon="chevronForwardOutline" class="action-chevron"></ion-icon>
                  </div>
                </ion-card-content>
              </ion-card>

              <ion-card class="action-item" @click="openFiles">
                <ion-card-content>
                  <div class="action-content">
                    <div class="action-icon-wrapper">
                      <ion-icon :icon="folderOutline"></ion-icon>
                    </div>
                    <div class="action-text">
                      <span class="action-title">文件管理</span>
                      <span class="action-desc">浏览和管理服务器文件</span>
                    </div>
                    <ion-icon :icon="chevronForwardOutline" class="action-chevron"></ion-icon>
                  </div>
                </ion-card-content>
              </ion-card>

              <ion-card class="action-item" @click="openBackups">
                <ion-card-content>
                  <div class="action-content">
                    <div class="action-icon-wrapper">
                      <ion-icon :icon="cloudDownloadOutline"></ion-icon>
                    </div>
                    <div class="action-text">
                      <span class="action-title">备份管理</span>
                      <span class="action-desc">创建和恢复服务器备份</span>
                    </div>
                    <ion-icon :icon="chevronForwardOutline" class="action-chevron"></ion-icon>
                  </div>
                </ion-card-content>
              </ion-card>

              <ion-card class="action-item" @click="openTasks">
                <ion-card-content>
                  <div class="action-content">
                    <div class="action-icon-wrapper">
                      <ion-icon :icon="timeOutline"></ion-icon>
                    </div>
                    <div class="action-text">
                      <span class="action-title">定时任务</span>
                      <span class="action-desc">设置自动执行的任务</span>
                    </div>
                    <ion-icon :icon="chevronForwardOutline" class="action-chevron"></ion-icon>
                  </div>
                </ion-card-content>
              </ion-card>

              <ion-card class="action-item" @click="openMap">
                <ion-card-content>
                  <div class="action-content">
                    <div class="action-icon-wrapper">
                      <ion-icon :icon="mapOutline"></ion-icon>
                    </div>
                    <div class="action-text">
                      <span class="action-title">世界地图</span>
                      <span class="action-desc">查看服务器世界地图</span>
                    </div>
                    <ion-icon :icon="chevronForwardOutline" class="action-chevron"></ion-icon>
                  </div>
                </ion-card-content>
              </ion-card>

              <ion-card class="action-item" @click="openSettings">
                <ion-card-content>
                  <div class="action-content">
                    <div class="action-icon-wrapper">
                      <ion-icon :icon="settingsOutline"></ion-icon>
                    </div>
                    <div class="action-text">
                      <span class="action-title">服务器设置</span>
                      <span class="action-desc">修改服务器配置参数</span>
                    </div>
                    <ion-icon :icon="chevronForwardOutline" class="action-chevron"></ion-icon>
                  </div>
                </ion-card-content>
              </ion-card>
            </div>
          </div>
        </div>
      </template>
    </ion-content>

    <ion-action-sheet
      :is-open="showActionSheet"
      header="操作"
      :buttons="[
        { text: instance?.status === 2 ? '停止服务器' : '启动服务器', icon: instance?.status === 2 ? stopOutline : playOutline, handler: () => handleAction(instance?.status === 2 ? 'stop' : 'start') },
        { text: '创建备份', icon: cloudDownloadOutline, handler: () => handleAction('backup') },
        { text: '删除服务器', icon: trashOutline, role: 'destructive', handler: () => handleAction('delete') },
        { text: '取消', role: 'cancel' }
      ]"
      @didDismiss="showActionSheet = false"
    ></ion-action-sheet>
  </ion-page>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  gap: 16px;
}

.loading-text {
  font-size: 14px;
  color: var(--ion-text-color-secondary);
  margin: 0;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  text-align: center;
}

.error-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background: var(--ion-color-danger-container);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.error-icon {
  font-size: 40px;
  color: var(--ion-color-danger);
}

.error-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--ion-text-color);
  margin: 0 0 8px 0;
}

.error-desc {
  font-size: 14px;
  color: var(--ion-text-color-secondary);
  margin: 0 0 24px 0;
}

.retry-button {
  --background: var(--ion-color-primary-container);
  --color: var(--ion-color-on-primary-container);
}

.content-wrapper {
  padding: 0 16px 32px 16px;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--ion-background-color);
  padding-top: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.segment-header {
  margin-bottom: 16px;
  padding: 16px;
  background: var(--ion-color-surface-container);
  border-radius: 16px;
}

.segment-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.server-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--ion-text-color);
}

.server-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.server-status.status-success {
  background: var(--ion-color-success-container);
  color: var(--ion-color-success);
}

.server-status.status-warning {
  background: var(--ion-color-warning-container);
  color: var(--ion-color-warning);
}

.server-status.status-medium {
  background: var(--ion-color-surface-container-high);
  color: var(--ion-text-color-secondary);
}

.server-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--ion-text-color-secondary);
}

.meta-item ion-icon {
  font-size: 16px;
  --ionicon-stroke-width: 2px;
}

.status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.status-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 4px;
}

.status-chip.status-success {
  background: var(--ion-color-success-container);
  color: var(--ion-color-success);
}

.status-chip.status-success .status-dot {
  background: var(--ion-color-success);
}

.status-chip.status-warning {
  background: var(--ion-color-warning-container);
  color: var(--ion-color-warning);
}

.status-chip.status-warning .status-dot {
  background: var(--ion-color-warning);
}

.status-chip.status-danger {
  background: var(--ion-color-danger-container);
  color: var(--ion-color-danger);
}

.status-chip.status-danger .status-dot {
  background: var(--ion-color-danger);
}

.status-chip.status-medium {
  background: var(--ion-color-surface-container-high);
  color: var(--ion-text-color-secondary);
}

.status-chip.status-medium .status-dot {
  background: var(--ion-text-color-secondary);
}

.player-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--ion-text-color-secondary);
}

.player-info ion-icon {
  font-size: 18px;
}

.main-segment {
  margin-bottom: 16px;
}

.tab-content {
  padding-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--ion-text-color-secondary);
  margin-bottom: 12px;
  letter-spacing: 0.1px;
}

.info-card {
  margin: 0 0 16px 0;
}

.info-card ion-card-content {
  padding: 16px;
}

.info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full-width {
  margin-top: 0;
}

.info-label {
  font-size: 12px;
  color: var(--ion-text-color-secondary);
}

.info-value {
  font-size: 14px;
  color: var(--ion-text-color);
  font-weight: 500;
}

.info-value.path {
  font-size: 12px;
  font-family: monospace;
  word-break: break-all;
  font-weight: 400;
}

.info-value.memory {
  color: var(--ion-color-primary);
}

.info-value.args {
  font-size: 12px;
  font-weight: 400;
  word-break: break-all;
}

.quick-actions {
  margin-bottom: 24px;
}

.action-button {
  --border-radius: 20px;
  height: 48px;
  font-size: 15px;
}

.action-button.start {
  --background: var(--ion-color-success-container);
  --color: var(--ion-color-success);
}

.action-button.stop {
  --background: var(--ion-color-danger);
  --color: var(--ion-color-danger-contrast);
}

.action-button.starting {
  --background: var(--ion-color-surface-container-high);
  --color: var(--ion-text-color-secondary);
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-item {
  margin: 0;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.action-item:active {
  transform: scale(0.98);
}

.action-item ion-card-content {
  padding: 12px 16px;
}

.action-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--ion-color-primary-container);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-icon-wrapper ion-icon {
  font-size: 20px;
  color: var(--ion-color-on-primary-container);
}

.action-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.action-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--ion-text-color);
}

.action-desc {
  font-size: 12px;
  color: var(--ion-text-color-secondary);
}

.action-chevron {
  color: var(--ion-color-outline);
  font-size: 20px;
  flex-shrink: 0;
}
</style>
