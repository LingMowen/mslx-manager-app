<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonList, IonItem, IonLabel, IonIcon, IonButton, IonSpinner, IonRefresher, IonRefresherContent, IonFab, IonFabButton, IonActionSheet, IonBadge, IonModal, IonInput, IonSelect, IonSelectOption, IonTextarea, IonCard, IonCardContent, IonMenu, IonMenuToggle, IonListHeader, IonAvatar, menuController } from '@ionic/vue'
import { addOutline, cloudOutline, playOutline, stopOutline, trashOutline, refreshOutline, createOutline, chevronForwardOutline, chevronBackOutline, serverOutline, swapHorizontalOutline, personOutline, settingsOutline, menuOutline, peopleOutline, informationCircleOutline, closeOutline } from 'ionicons/icons'
import { getFrpList, createFrp, deleteFrp, frpAction, getAutostartList, updateAutostartList } from '@/api/frp'
import type { FrpTunnel } from '@/types'
import { useConnectionStore } from '@/stores/connection'
import { storage } from '@/utils/storage'

const router = useRouter()
const connectionStore = useConnectionStore()

const tunnels = ref<FrpTunnel[]>([])
const autostartIds = ref<number[]>([])
const isLoading = ref(false)
const showActionSheet = ref(false)
const selectedTunnel = ref<FrpTunnel | null>(null)
const showCreateModal = ref(false)
const isSaving = ref(false)

const currentServerName = computed(() => connectionStore.currentServer?.name || '')
const currentServerUrl = computed(() => {
  const url = connectionStore.currentServer?.url || ''
  return url.replace(/^https?:\/\//, '').split('/')[0]
})

const newTunnel = ref({
  name: '',
  provider: '',
  config: '',
  format: 'toml',
})

onMounted(async () => {
  await loadData()
})

async function loadData() {
  isLoading.value = true
  try {
    const [frpResponse, autostartResponse] = await Promise.all([
      getFrpList(),
      getAutostartList(),
    ])
    if (frpResponse.code === 200) {
      tunnels.value = frpResponse.data
    }
    if (autostartResponse.code === 200) {
      autostartIds.value = autostartResponse.data
    }
  } finally {
    isLoading.value = false
  }
}

async function handleRefresh(event: any) {
  await loadData()
  event.target.complete()
}

function getStatusColor(status: number): string {
  switch (status) {
    case 1:
      return 'success'
    case 2:
      return 'warning'
    default:
      return 'medium'
  }
}

function getStatusText(status: number): string {
  switch (status) {
    case 1:
      return '运行中'
    case 2:
      return '启动中'
    default:
      return '已停止'
  }
}

async function startTunnel(tunnel: FrpTunnel) {
  await frpAction(tunnel.id, 'start')
  await loadData()
}

async function stopTunnel(tunnel: FrpTunnel) {
  await frpAction(tunnel.id, 'stop')
  await loadData()
}

async function removeTunnel(tunnel: FrpTunnel) {
  if (confirm(`确定要删除隧道 ${tunnel.name} 吗？`)) {
    await deleteFrp(tunnel.id)
    await loadData()
  }
}

async function toggleAutostart(tunnel: FrpTunnel) {
  const ids = [...autostartIds.value]
  const index = ids.indexOf(tunnel.id)
  if (index === -1) {
    ids.push(tunnel.id)
  } else {
    ids.splice(index, 1)
  }
  await updateAutostartList(ids)
  autostartIds.value = ids
}

async function createNewTunnel() {
  if (!newTunnel.value.name || !newTunnel.value.provider || !newTunnel.value.config) {
    alert('请填写所有必填字段')
    return
  }

  isSaving.value = true
  try {
    await createFrp(newTunnel.value)
    showCreateModal.value = false
    newTunnel.value = { name: '', provider: '', config: '', format: 'toml' }
    await loadData()
  } finally {
    isSaving.value = false
  }
}

function goToHome() {
  router.push('/home')
}

function goToUsers() {
  router.push('/users')
}

function goToSettings() {
  router.push('/settings')
}

function goToAbout() {
  router.push('/about')
}

function switchServer() {
  connectionStore.currentServer = null
  storage.remove('currentServer')
  router.push('/connection')
}

async function openMenu() {
  await menuController.open('frp-menu')
}
</script>

<template>
  <ion-page>
    <div class="app-header">
      <button class="app-header-icon-button" @click="openMenu">
        <ion-icon :icon="menuOutline"></ion-icon>
      </button>
      <div class="app-header-center">
        <h1 class="app-header-center-title">Frp 隧道</h1>
      </div>
      <button class="app-header-icon-button" @click="loadData">
        <ion-icon :icon="refreshOutline"></ion-icon>
      </button>
    </div>

    <ion-menu menu-id="frp-menu" content-id="frp-content">
      <ion-content>
        <ion-list>
          <ion-item lines="none" class="server-item">
            <ion-avatar slot="start" class="server-avatar">
              <ion-icon :icon="serverOutline" class="server-avatar-icon"></ion-icon>
            </ion-avatar>
            <ion-label>
              <h3>{{ currentServerName }}</h3>
              <p>{{ currentServerUrl }}</p>
            </ion-label>
          </ion-item>
        </ion-list>

        <ion-list>
          <ion-list-header>导航</ion-list-header>
          <ion-menu-toggle :auto-hide="false">
            <ion-item button @click="goToHome">
              <ion-icon :icon="serverOutline" slot="start"></ion-icon>
              <ion-label>服务器实例</ion-label>
            </ion-item>
          </ion-menu-toggle>
          <ion-menu-toggle :auto-hide="false">
            <ion-item button class="active-page">
              <ion-icon :icon="cloudOutline" slot="start" color="primary"></ion-icon>
              <ion-label color="primary">Frp 隧道</ion-label>
            </ion-item>
          </ion-menu-toggle>
          <ion-menu-toggle :auto-hide="false">
            <ion-item button @click="goToUsers">
              <ion-icon :icon="peopleOutline" slot="start"></ion-icon>
              <ion-label>用户管理</ion-label>
            </ion-item>
          </ion-menu-toggle>
        </ion-list>

        <ion-list>
          <ion-list-header>设置</ion-list-header>
          <ion-menu-toggle :auto-hide="false">
            <ion-item button @click="goToSettings">
              <ion-icon :icon="settingsOutline" slot="start"></ion-icon>
              <ion-label>系统设置</ion-label>
            </ion-item>
          </ion-menu-toggle>
          <ion-menu-toggle :auto-hide="false">
            <ion-item button @click="switchServer">
              <ion-icon :icon="swapHorizontalOutline" slot="start" color="primary"></ion-icon>
              <ion-label color="primary">切换服务器</ion-label>
            </ion-item>
          </ion-menu-toggle>
        </ion-list>

        <ion-list>
          <ion-list-header>关于</ion-list-header>
          <ion-menu-toggle :auto-hide="false">
            <ion-item button @click="goToAbout">
              <ion-icon :icon="informationCircleOutline" slot="start"></ion-icon>
              <ion-label>关于</ion-label>
            </ion-item>
          </ion-menu-toggle>
        </ion-list>
      </ion-content>
    </ion-menu>

    <ion-content id="frp-content">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="content-wrapper">
        <div class="header-section">
          <h1 class="page-headline">Frp 隧道</h1>
          <p class="page-supporting">管理您的内网穿透隧道</p>
        </div>

        <div v-if="isLoading" class="loading-container">
          <ion-spinner name="circular"></ion-spinner>
          <p class="loading-text">加载中...</p>
        </div>

        <div v-else-if="tunnels.length === 0" class="empty-state">
          <div class="empty-icon-wrapper">
            <ion-icon :icon="cloudOutline" class="empty-icon"></ion-icon>
          </div>
          <h3 class="empty-title">暂无 Frp 隧道</h3>
          <p class="empty-desc">点击下方按钮创建您的第一个隧道</p>
          <ion-button @click="showCreateModal = true" class="create-button">
            <ion-icon :icon="addOutline" slot="start"></ion-icon>
            创建隧道
          </ion-button>
        </div>

        <div v-else class="tunnel-list">
          <ion-card v-for="tunnel in tunnels" :key="tunnel.id" class="tunnel-card" @click="selectedTunnel = tunnel; showActionSheet = true">
            <ion-card-content>
              <div class="tunnel-content">
                <div class="tunnel-icon-wrapper" :class="'status-' + getStatusColor(tunnel.status)">
                  <ion-icon :icon="cloudOutline"></ion-icon>
                </div>
                <div class="tunnel-info">
                  <div class="tunnel-header">
                    <span class="tunnel-name">{{ tunnel.name }}</span>
                    <div class="status-badge" :class="'status-' + getStatusColor(tunnel.status)">
                      {{ getStatusText(tunnel.status) }}
                    </div>
                  </div>
                  <span class="tunnel-provider">{{ tunnel.provider }}</span>
                </div>
                <ion-button v-if="tunnel.status !== 1" fill="solid" size="small" class="action-button start" @click.stop="startTunnel(tunnel)">
                  <ion-icon :icon="playOutline"></ion-icon>
                </ion-button>
                <ion-button v-if="tunnel.status === 1" fill="solid" size="small" class="action-button stop" @click.stop="stopTunnel(tunnel)">
                  <ion-icon :icon="stopOutline"></ion-icon>
                </ion-button>
                <ion-icon :icon="chevronForwardOutline" class="tunnel-chevron"></ion-icon>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="showCreateModal = true">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <ion-action-sheet
        :is-open="showActionSheet"
        :header="selectedTunnel?.name"
        :buttons="[
          { text: selectedTunnel?.status === 1 ? '停止' : '启动', icon: selectedTunnel?.status === 1 ? stopOutline : playOutline, handler: () => { selectedTunnel?.status === 1 ? stopTunnel(selectedTunnel!) : startTunnel(selectedTunnel!) } },
          { text: '删除', icon: trashOutline, role: 'destructive', handler: () => { if (selectedTunnel) removeTunnel(selectedTunnel) } },
          { text: '取消', role: 'cancel' }
        ]"
        @didDismiss="showActionSheet = false; selectedTunnel = null"
      ></ion-action-sheet>

      <ion-modal :is-open="showCreateModal" @didDismiss="showCreateModal = false" class="custom-modal">
        <div class="modal-wrapper">
          <div class="modal-box">
            <div class="modal-header">
              <h2 class="modal-title">创建隧道</h2>
              <button class="modal-close-btn" @click="showCreateModal = false">
                <ion-icon :icon="closeOutline"></ion-icon>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-wrapper">
                <div class="input-group">
                  <div class="input-label">隧道名称</div>
                  <div class="input-field">
                    <ion-input v-model="newTunnel.name" placeholder="例如：我的隧道"></ion-input>
                  </div>
                </div>

                <div class="input-group">
                  <div class="input-label">服务提供商</div>
                  <div class="input-field">
                    <ion-input v-model="newTunnel.provider" placeholder="例如：SakuraFrp"></ion-input>
                  </div>
                </div>

                <div class="input-group">
                  <div class="input-label">配置格式</div>
                  <div class="input-field">
                    <ion-select v-model="newTunnel.format" interface="action-sheet" placeholder="选择格式">
                      <ion-select-option value="toml">TOML</ion-select-option>
                      <ion-select-option value="ini">INI</ion-select-option>
                    </ion-select>
                  </div>
                </div>

                <div class="input-group">
                  <div class="input-label">配置内容</div>
                  <div class="input-field textarea">
                    <ion-textarea v-model="newTunnel.config" placeholder="粘贴 Frp 配置文件内容" :rows="10"></ion-textarea>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="modal-btn cancel" @click="showCreateModal = false">取消</button>
              <button class="modal-btn confirm" @click="createNewTunnel" :disabled="isSaving">
                <ion-spinner v-if="isSaving" name="circular"></ion-spinner>
                <span v-else>创建</span>
              </button>
            </div>
          </div>
        </div>
      </ion-modal>
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

.create-button {
  --background: var(--ion-color-primary);
  --color: var(--ion-color-primary-contrast);
  --border-radius: 12px;
  --padding-start: 24px;
  --padding-end: 24px;
  --padding-top: 14px;
  --padding-bottom: 14px;
  height: auto;
  font-weight: 500;
  --box-shadow: 0 2px 8px rgba(124, 107, 255, 0.3);
}

.tunnel-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tunnel-card {
  margin: 0;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.tunnel-card:active {
  transform: scale(0.98);
}

.tunnel-card ion-card-content {
  padding: 12px 16px;
}

.tunnel-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tunnel-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tunnel-icon-wrapper.status-success {
  background: var(--ion-color-success-container);
}

.tunnel-icon-wrapper.status-success ion-icon {
  color: var(--ion-color-success);
}

.tunnel-icon-wrapper.status-warning {
  background: var(--ion-color-warning-container);
}

.tunnel-icon-wrapper.status-warning ion-icon {
  color: var(--ion-color-warning);
}

.tunnel-icon-wrapper.status-medium {
  background: var(--ion-color-surface-container-high);
}

.tunnel-icon-wrapper.status-medium ion-icon {
  color: var(--ion-text-color-secondary);
}

.tunnel-icon-wrapper ion-icon {
  font-size: 20px;
}

.tunnel-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tunnel-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tunnel-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--ion-text-color);
}

.status-badge {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
}

.status-badge.status-success {
  background: var(--ion-color-success-container);
  color: var(--ion-color-success);
}

.status-badge.status-warning {
  background: var(--ion-color-warning-container);
  color: var(--ion-color-warning);
}

.status-badge.status-medium {
  background: var(--ion-color-surface-container-high);
  color: var(--ion-text-color-secondary);
}

.tunnel-provider {
  font-size: 12px;
  color: var(--ion-text-color-secondary);
}

.action-button {
  --border-radius: 12px;
  width: 36px;
  height: 36px;
}

.action-button.start {
  --background: var(--ion-color-success-container);
  --color: var(--ion-color-success);
}

.action-button.stop {
  --background: var(--ion-color-danger);
  --color: var(--ion-color-danger-contrast);
}

.tunnel-chevron {
  color: var(--ion-color-outline);
  font-size: 20px;
  flex-shrink: 0;
}

.save-button {
  --color: var(--ion-color-primary);
  --background: transparent;
  font-weight: 500;
}

/* 弹窗样式 - 非全屏 */
ion-modal.custom-modal {
  --height: auto;
  --max-height: 90%;
  --width: 90%;
  --max-width: 480px;
  --border-radius: 20px;
}

ion-modal.custom-modal::part(content) {
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  background: var(--ion-background-color);
}

.modal-wrapper {
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  background: var(--ion-background-color);
  border-radius: 20px;
  overflow: hidden;
}

.modal-box {
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--ion-color-surface-container);
  background: var(--ion-background-color);
  flex-shrink: 0;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--ion-text-color);
  margin: 0;
}

.modal-close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--ion-color-surface-container);
  color: var(--ion-text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
}

.modal-close-btn:active {
  background: var(--ion-color-surface-container-high);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  background: var(--ion-background-color);
  max-height: 60vh;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--ion-color-surface-container);
  background: var(--ion-background-color);
  flex-shrink: 0;
}

.modal-btn {
  flex: 1;
  padding: 14px 24px;
  border-radius: 12px;
  border: none;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.modal-btn.cancel {
  background: var(--ion-color-surface-container);
  color: var(--ion-text-color);
}

.modal-btn.cancel:active {
  background: var(--ion-color-surface-container-high);
}

.modal-btn.confirm {
  background: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
}

.modal-btn.confirm:active {
  opacity: 0.9;
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-wrapper {
  padding: 20px;
}

.input-group {
  margin-bottom: 20px;
}

.input-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--ion-text-color);
  margin-bottom: 8px;
}

.input-field {
  background: var(--ion-color-surface-container);
  border-radius: 12px;
  overflow: hidden;
}

.input-field.textarea {
  padding: 12px 16px;
}

.input-field ion-input,
.input-field ion-select {
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 14px;
  --padding-bottom: 14px;
}

/* 弹窗样式 - 使用 :deep 穿透 scoped */
:deep(ion-modal.modal-default) {
  --width: 90%;
  --max-width: 480px;
  --height: auto;
  --max-height: 85%;
  --border-radius: 20px;
}

:deep(ion-modal.modal-default::part(content)) {
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

:deep(ion-modal.modal-default ion-header) {
  border-radius: 20px 20px 0 0;
  overflow: hidden;
}

:deep(ion-modal.modal-default ion-content) {
  --background: var(--ion-background-color);
  border-radius: 0 0 20px 20px;
}

:deep(ion-modal.modal-default ion-toolbar) {
  --background: var(--ion-background-color);
  --border-color: transparent;
}

:deep(ion-modal.modal-default .form-wrapper) {
  padding: 20px;
}
</style>
