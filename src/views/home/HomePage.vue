<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonRefresher, IonRefresherContent, IonFab, IonFabButton, IonBadge, IonText, IonGrid, IonRow, IonCol, IonMenu, IonMenuButton, IonButtons, IonList, IonItem, IonLabel, IonMenuToggle, IonAvatar, IonListHeader, IonSpinner } from '@ionic/vue'
import { addOutline, playOutline, stopOutline, settingsOutline, trashOutline, terminalOutline, peopleOutline, folderOutline, cloudDownloadOutline, refreshOutline, menuOutline, logOutOutline, personOutline, serverOutline, mapOutline, cloudOutline, swapHorizontalOutline, chevronForwardOutline, informationCircleOutline } from 'ionicons/icons'
import { useInstanceStore } from '@/stores/instance'
import { useConnectionStore } from '@/stores/connection'
import { storage } from '@/utils/storage'
import type { Instance } from '@/types'

const router = useRouter()
const instanceStore = useInstanceStore()
const connectionStore = useConnectionStore()

const isLoading = ref(false)

const instances = computed(() => instanceStore.instances)
const runningCount = computed(() => instanceStore.runningCount)
const stoppedCount = computed(() => instanceStore.stoppedCount)
const currentServerName = computed(() => connectionStore.currentServer?.name || '')
const currentServerUrl = computed(() => {
  const url = connectionStore.currentServer?.url || ''
  return url.replace(/^https?:\/\//, '').split('/')[0]
})

onMounted(async () => {
  await loadInstances()
})

async function loadInstances() {
  isLoading.value = true
  try {
    await instanceStore.loadInstances()
  } finally {
    isLoading.value = false
  }
}

async function handleRefresh(event: any) {
  await loadInstances()
  event.target.complete()
}

function getStatusColor(status: number): string {
  switch (status) {
    case 2:
      return 'success'
    case 1:
      return 'warning'
    case 3:
      return 'danger'
    default:
      return 'medium'
  }
}

function getStatusText(status: number): string {
  switch (status) {
    case 2:
      return '运行中'
    case 1:
      return '启动中'
    case 3:
      return '错误'
    default:
      return '已停止'
  }
}

async function startInstance(instance: Instance, event: Event) {
  event.stopPropagation()
  await instanceStore.startInstance(instance.id)
  await loadInstances()
}

async function stopInstance(instance: Instance, event: Event) {
  event.stopPropagation()
  await instanceStore.stopInstance(instance.id)
  await loadInstances()
}

function openConsole(instance: Instance) {
  router.push(`/instances/${instance.id}/console`)
}

function openSettings(instance: Instance) {
  router.push(`/instances/${instance.id}/settings`)
}

function openInstanceDetail(instance: Instance) {
  router.push(`/instances/${instance.id}`)
}

function createInstance() {
  router.push('/instances/create')
}

function switchServer() {
  connectionStore.currentServer = null
  storage.remove('currentServer')
  router.push('/connection')
}

function openMenu() {
  const menu = document.querySelector('ion-menu')
  if (menu) {
    menu.open()
  }
}

function goToSettings() {
  router.push('/settings')
}

function goToFrp() {
  router.push('/frp')
}

function goToUsers() {
  router.push('/users')
}

function goToAbout() {
  router.push('/about')
}
</script>

<template>
  <ion-page>
    <div class="app-header">
      <button class="app-header-icon-button" @click="openMenu">
        <ion-icon :icon="menuOutline"></ion-icon>
      </button>
      <h1 class="app-header-title">MSLX</h1>
      <button class="app-header-icon-button" @click="goToSettings">
        <ion-icon :icon="settingsOutline"></ion-icon>
      </button>
    </div>

    <ion-menu menu-id="main-menu" content-id="main-content">
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
            <ion-item button @click="router.push('/home')">
              <ion-icon :icon="serverOutline" slot="start"></ion-icon>
              <ion-label>服务器实例</ion-label>
            </ion-item>
          </ion-menu-toggle>
          <ion-menu-toggle :auto-hide="false">
            <ion-item button @click="goToFrp">
              <ion-icon :icon="cloudOutline" slot="start"></ion-icon>
              <ion-label>Frp 隧道</ion-label>
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

    <ion-content id="main-content">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="content-wrapper">
        <div class="header-section">
          <h1 class="page-headline">服务器实例</h1>
          <p class="page-supporting">管理您的 Minecraft 服务器</p>
        </div>

        <div class="stats-chips">
          <div class="stat-chip running">
            <span class="stat-number">{{ runningCount }}</span>
            <span class="stat-text">运行中</span>
          </div>
          <div class="stat-chip stopped">
            <span class="stat-number">{{ stoppedCount }}</span>
            <span class="stat-text">已停止</span>
          </div>
        </div>

        <div v-if="isLoading && instances.length === 0" class="loading-container">
          <ion-spinner name="circular"></ion-spinner>
        </div>

        <div v-else-if="instances.length === 0" class="empty-state">
          <div class="empty-icon-wrapper">
            <ion-icon :icon="serverOutline" class="empty-icon"></ion-icon>
          </div>
          <h3 class="empty-title">暂无服务器实例</h3>
          <p class="empty-desc">点击下方按钮创建您的第一个服务器</p>
          <ion-button @click="createInstance" class="empty-button">
            <ion-icon :icon="addOutline" slot="start"></ion-icon>
            创建服务器
          </ion-button>
        </div>

        <div v-else class="instance-list">
          <ion-card v-for="instance in instances" :key="instance.id" class="instance-card" @click="openInstanceDetail(instance)">
            <ion-card-content>
              <div class="card-header">
                <div class="card-title-row">
                  <span class="instance-name">{{ instance.name }}</span>
                  <div class="status-badge" :class="'status-' + getStatusColor(instance.status)">
                    {{ getStatusText(instance.status) }}
                  </div>
                </div>
                <div class="instance-meta">
                  <span class="meta-item">
                    <ion-icon :icon="serverOutline"></ion-icon>
                    {{ instance.core }}
                  </span>
                  <span class="meta-item" v-if="instance.status === 2">
                    <ion-icon :icon="peopleOutline"></ion-icon>
                    {{ instance.extra?.onlinePlayers || 0 }} 在线
                  </span>
                </div>
              </div>
              <div class="card-actions">
                <ion-button v-if="instance.status !== 2" fill="solid" size="small" class="action-button start" @click="startInstance(instance, $event)">
                  <ion-icon :icon="playOutline" slot="start"></ion-icon>
                  启动
                </ion-button>
                <ion-button v-if="instance.status === 2" fill="solid" size="small" class="action-button stop" @click="stopInstance(instance, $event)">
                  <ion-icon :icon="stopOutline" slot="start"></ion-icon>
                  停止
                </ion-button>
                <ion-button fill="outline" size="small" class="action-button" @click="openConsole(instance)">
                  <ion-icon :icon="terminalOutline" slot="start"></ion-icon>
                  控制台
                </ion-button>
                <ion-icon :icon="chevronForwardOutline" class="card-chevron"></ion-icon>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="createInstance">
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

.stats-chips {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 16px;
  background: var(--ion-color-surface-container);
}

.stat-chip.running {
  background: var(--ion-color-success-container);
}

.stat-chip.running .stat-number {
  color: var(--ion-color-success);
}

.stat-chip.stopped {
  background: var(--ion-color-surface-container-high);
}

.stat-number {
  font-size: 24px;
  font-weight: 500;
  color: var(--ion-text-color);
}

.stat-text {
  font-size: 14px;
  color: var(--ion-text-color-secondary);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
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
}

.instance-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.instance-card {
  margin: 0;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.instance-card:active {
  transform: scale(0.98);
}

.instance-card ion-card-content {
  padding: 16px;
}

.card-header {
  margin-bottom: 16px;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.instance-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--ion-text-color);
}

.status-badge {
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
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

.status-badge.status-danger {
  background: var(--ion-color-danger-container);
  color: var(--ion-color-danger);
}

.status-badge.status-medium {
  background: var(--ion-color-surface-container-high);
  color: var(--ion-text-color-secondary);
}

.instance-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--ion-text-color-secondary);
}

.meta-item ion-icon {
  font-size: 16px;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-button {
  --border-radius: 20px;
  height: 36px;
  font-size: 14px;
}

.action-button.start {
  --background: var(--ion-color-success-container);
  --color: var(--ion-color-success);
}

.action-button.stop {
  --background: var(--ion-color-danger);
  --color: var(--ion-color-danger-contrast);
}

.action-button[fill="tonal"] {
  --background: var(--ion-color-surface-container-high);
  --color: var(--ion-text-color);
}

.card-chevron {
  margin-left: auto;
  color: var(--ion-color-outline);
  font-size: 20px;
}

.server-item {
  --padding-start: 16px;
  --inner-padding-end: 16px;
  padding: 16px 0;
}

.server-avatar {
  width: 40px;
  height: 40px;
  background: var(--ion-color-primary-container);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.server-avatar-icon {
  font-size: 24px;
  color: var(--ion-color-on-primary-container);
}

.server-item h3 {
  font-weight: 500;
  margin: 0;
}

.server-item p {
  font-size: 12px;
  color: var(--ion-text-color-secondary);
  margin: 4px 0 0 0;
}
</style>
