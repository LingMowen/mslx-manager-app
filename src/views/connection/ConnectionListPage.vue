<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonRefresher, IonRefresherContent, IonFab, IonFabButton, IonBadge, IonText, toastController } from '@ionic/vue'
import { addOutline, cloudOutline, trashOutline, linkOutline, checkmarkCircleOutline, closeCircleOutline, chevronForwardOutline, chevronBackOutline } from 'ionicons/icons'
import { useConnectionStore } from '@/stores/connection'
import type { ServerConnection } from '@/types'

const router = useRouter()
const connectionStore = useConnectionStore()

const servers = ref<ServerConnection[]>([])
const testingId = ref<string | null>(null)
const testResults = ref<Record<string, { success: boolean; message: string; status?: string }>>({})

onMounted(async () => {
  await connectionStore.loadServers()
  servers.value = connectionStore.servers
  
  // 自动检测所有服务器在线状态
  await autoTestAllServers()
})

async function autoTestAllServers() {
  if (servers.value.length === 0) return
  
  // 并行测试所有服务器
  const testPromises = servers.value.map(async (server) => {
    const result = await connectionStore.testConnection(server.url, server.apiKey)
    testResults.value[server.id] = result
  })
  
  await Promise.all(testPromises)
}

async function handleRefresh(event: any) {
  await connectionStore.loadServers()
  servers.value = connectionStore.servers
  event.target.complete()
}

async function testServerConnection(server: ServerConnection) {
  testingId.value = server.id
  const result = await connectionStore.testConnection(server.url, server.apiKey)
  testResults.value[server.id] = result
  testingId.value = null
}

async function selectServer(server: ServerConnection) {
  // 检查服务器是否在线
  const result = testResults.value[server.id]
  if (!result || !result.success) {
    // 服务器离线，显示提示并阻止进入
    const toast = await toastController.create({
      message: '服务器当前离线，无法进入管理界面',
      duration: 3000,
      position: 'bottom',
      color: 'warning'
    })
    await toast.present()
    return
  }
  
  await connectionStore.selectServer(server)
  router.push('/home')
}

function addNewServer() {
  router.push('/connection/add')
}

async function deleteServer(server: ServerConnection, event: Event) {
  event.stopPropagation()
  if (confirm(`确定要删除服务器 "${server.name}" 吗？`)) {
    connectionStore.removeServer(server.id)
    servers.value = connectionStore.servers
  }
}

function getServerStatus(server: ServerConnection): { color: string; text: string } {
  const result = testResults.value[server.id]
  if (!result) {
    return { color: 'medium', text: '未测试' }
  }
  
  if (result.success) {
    return { color: 'success', text: '在线' }
  }
  
  // 根据状态返回不同的提示
  switch (result.status) {
    case 'invalid':
    case 'invalid_data':
    case 'parse_error':
      return { color: 'warning', text: '无效' }
    case 'offline':
      return { color: 'danger', text: '离线' }
    case 'unauthorized':
      return { color: 'warning', text: '密钥错误' }
    case 'not_found':
      return { color: 'warning', text: '未找到' }
    case 'timeout':
      return { color: 'danger', text: '超时' }
    case 'network_error':
      return { color: 'danger', text: '网络错误' }
    default:
      return { color: 'danger', text: '离线' }
  }
}
</script>

<template>
  <ion-page>
    <div class="app-header">
      <div style="width: 48px;"></div>
      <div class="app-header-center">
        <h1 class="app-header-center-title">MSLX</h1>
      </div>
      <div style="width: 48px;"></div>
    </div>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="content-wrapper">
        <div class="header-section">
          <h1 class="page-headline">服务器连接</h1>
          <p class="page-supporting">选择一个服务器进行管理</p>
        </div>

        <div v-if="servers.length === 0" class="empty-state">
          <div class="empty-icon-wrapper">
            <ion-icon :icon="cloudOutline" class="empty-icon"></ion-icon>
          </div>
          <h3 class="empty-title">暂无保存的服务器</h3>
          <p class="empty-desc">点击下方按钮添加您的第一个服务器</p>
          <ion-button @click="addNewServer" class="empty-button">
            <ion-icon :icon="addOutline" slot="start"></ion-icon>
            添加服务器
          </ion-button>
        </div>

        <div v-else class="server-list">
          <ion-card v-for="server in servers" :key="server.id" class="server-card" @click="selectServer(server)">
            <ion-card-content>
              <div class="card-header">
                <div class="card-title-row">
                  <div class="server-avatar">
                    <ion-icon :icon="cloudOutline"></ion-icon>
                  </div>
                  <div class="server-info">
                    <span class="server-name">{{ server.name }}</span>
                    <span class="server-url">{{ server.url }}</span>
                  </div>
                  <div class="status-badge" :class="'status-' + getServerStatus(server).color">
                    {{ getServerStatus(server).text }}
                  </div>
                </div>
              </div>
              <div class="card-footer">
                <div class="server-actions">
                  <ion-button fill="clear" size="small" @click.stop="testServerConnection(server)" :disabled="testingId === server.id">
                    <ion-icon :icon="linkOutline" slot="start"></ion-icon>
                    {{ testingId === server.id ? '测试中...' : '测试连接' }}
                  </ion-button>
                  <ion-button fill="clear" size="small" color="danger" @click="deleteServer(server, $event)">
                    <ion-icon :icon="trashOutline" slot="start"></ion-icon>
                    删除
                  </ion-button>
                </div>
                <ion-icon :icon="chevronForwardOutline" class="card-chevron"></ion-icon>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="addNewServer">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.content-wrapper {
  padding: 16px;
  padding-bottom: 88px;
}

.header-section {
  margin-bottom: 24px;
  padding: 0 4px;
}

.page-headline {
  font-size: 32px;
  font-weight: 400;
  color: var(--ion-text-color);
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
}

.page-supporting {
  font-size: 14px;
  color: var(--ion-text-color-secondary);
  margin: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background: var(--ion-color-primary-container);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.empty-icon {
  font-size: 40px;
  color: var(--ion-color-on-primary-container);
}

.empty-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--ion-text-color);
  margin: 0 0 8px 0;
}

.empty-desc {
  font-size: 14px;
  color: var(--ion-text-color-secondary);
  margin: 0 0 24px 0;
}

.empty-button {
  --background: var(--ion-color-primary-container);
  --color: var(--ion-color-on-primary-container);
  --border-radius: 6px;
}

.server-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.server-card {
  margin: 0;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.server-card:active {
  transform: scale(0.98);
}

.server-card ion-card-content {
  padding: 16px;
}

.card-header {
  margin-bottom: 12px;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.server-avatar {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: var(--ion-color-primary-container);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.server-avatar ion-icon {
  font-size: 24px;
  color: var(--ion-color-on-primary-container);
}

.server-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.server-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--ion-text-color);
}

.server-url {
  font-size: 13px;
  color: var(--ion-text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
}

.status-badge.status-success {
  background: var(--ion-color-success-container);
  color: var(--ion-color-success);
}

.status-badge.status-danger {
  background: var(--ion-color-danger-container);
  color: var(--ion-color-danger);
}

.status-badge.status-medium {
  background: var(--ion-color-surface-container-high);
  color: var(--ion-text-color-secondary);
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.server-actions {
  display: flex;
  gap: 4px;
}

.server-actions ion-button {
  --color: var(--ion-color-primary);
  font-size: 13px;
}

.server-actions ion-button[color="danger"] {
  --color: var(--ion-color-danger);
}

.card-chevron {
  color: var(--ion-color-outline);
  font-size: 20px;
}
</style>
