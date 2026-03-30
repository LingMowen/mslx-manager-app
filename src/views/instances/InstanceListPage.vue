<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonRefresher, IonRefresherContent, IonFab, IonFabButton, IonBadge, IonSpinner, IonBackButton, IonButtons } from '@ionic/vue'
import { addOutline, playOutline, stopOutline, settingsOutline, terminalOutline, serverOutline, chevronBackOutline } from 'ionicons/icons'
import { useInstanceStore } from '@/stores/instance'
import type { Instance } from '@/types'

const router = useRouter()
const instanceStore = useInstanceStore()

const isLoading = ref(false)
const instances = computed(() => instanceStore.instances)

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

function openInstance(instance: Instance) {
  router.push(`/instances/${instance.id}`)
}

function openConsole(instance: Instance) {
  router.push(`/instances/${instance.id}/console`)
}

function openSettings(instance: Instance) {
  router.push(`/instances/${instance.id}/settings`)
}

function createInstance() {
  router.push('/instances/create')
}
</script>

<template>
  <ion-page>
    <div class="app-header">
      <button class="app-header-back-button" @click="router.back()">
        <ion-icon :icon="chevronBackOutline"></ion-icon>
      </button>
      <div class="app-header-center">
        <h1 class="app-header-center-title">服务器实例</h1>
      </div>
      <div style="width: 48px;"></div>
    </div>
    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div v-if="isLoading && instances.length === 0" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <div v-else-if="instances.length === 0" class="empty-state">
        <ion-icon :icon="serverOutline" class="empty-icon"></ion-icon>
        <p>暂无服务器实例</p>
        <ion-button @click="createInstance">
          <ion-icon :icon="addOutline" slot="start"></ion-icon>
          创建服务器
        </ion-button>
      </div>

      <template v-else>
        <ion-card v-for="instance in instances" :key="instance.id" class="instance-card" @click="openInstance(instance)">
          <ion-card-header>
            <ion-card-title>
              <div class="instance-header">
                <span class="instance-name">{{ instance.name }}</span>
                <ion-badge :color="getStatusColor(instance.status)" class="status-badge">
                  {{ getStatusText(instance.status) }}
                </ion-badge>
              </div>
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="instance-info">
              <div class="info-item">
                <ion-icon :icon="serverOutline"></ion-icon>
                <span>{{ instance.core || '未知核心' }}</span>
              </div>
              <div class="info-item">
                <ion-icon :icon="serverOutline"></ion-icon>
                <span>在线: {{ instance.extra?.onlinePlayers || 0 }}</span>
              </div>
            </div>
            <div class="instance-actions">
              <ion-button v-if="instance.status !== 2" fill="solid" size="small" color="success" @click="startInstance(instance, $event)">
                <ion-icon :icon="playOutline" slot="start"></ion-icon>
                启动
              </ion-button>
              <ion-button v-if="instance.status === 2" fill="solid" size="small" color="warning" @click="stopInstance(instance, $event)">
                <ion-icon :icon="stopOutline" slot="start"></ion-icon>
                停止
              </ion-button>
              <ion-button fill="outline" size="small" @click="openConsole(instance)">
                <ion-icon :icon="terminalOutline" slot="start"></ion-icon>
                控制台
              </ion-button>
              <ion-button fill="clear" size="small" @click="openSettings(instance)">
                <ion-icon :icon="settingsOutline" slot="icon-only"></ion-icon>
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </template>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="createInstance">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<style scoped>
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
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

.instance-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.instance-card:active {
  transform: scale(0.98);
}

.instance-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.instance-name {
  font-size: 16px;
  font-weight: 600;
}

.status-badge {
  font-size: 11px;
}

.instance-info {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--ion-text-color-secondary);
}

.info-item ion-icon {
  font-size: 16px;
}

.instance-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
