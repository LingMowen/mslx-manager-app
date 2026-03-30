<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonBackButton, IonButtons, IonList, IonItem, IonLabel, IonIcon, IonButton, IonSpinner, IonRefresher, IonRefresherContent, IonFab, IonFabButton, IonActionSheet, IonText, IonCard, IonCardContent } from '@ionic/vue'
import { saveOutline, downloadOutline, trashOutline, addOutline, refreshOutline, cloudDownloadOutline, chevronForwardOutline, chevronBackOutline } from 'ionicons/icons'
import { getBackups, deleteBackup, getBackupDownloadUrl } from '@/api/backup'
import { useInstanceStore } from '@/stores/instance'
import type { Backup } from '@/types'
import { formatDate } from '@/utils/storage'

const route = useRoute()
const router = useRouter()
const instanceStore = useInstanceStore()

const instanceId = computed(() => Number(route.params.id))
const backups = ref<Backup[]>([])
const isLoading = ref(false)
const showActionSheet = ref(false)
const selectedBackup = ref<Backup | null>(null)

onMounted(async () => {
  await loadBackups()
})

async function loadBackups() {
  isLoading.value = true
  try {
    const response = await getBackups(instanceId.value)
    if (response.code === 200) {
      backups.value = response.data
    }
  } finally {
    isLoading.value = false
  }
}

async function handleRefresh(event: any) {
  await loadBackups()
  event.target.complete()
}

async function createBackup() {
  const result = await instanceStore.backupInstance(instanceId.value)
  if (result.success) {
    await loadBackups()
  }
}

function downloadBackup(backup: Backup) {
  const url = getBackupDownloadUrl(instanceId.value, backup.fileName)
  window.open(url, '_blank')
}

async function removeBackup(backup: Backup) {
  if (confirm(`确定要删除备份 ${backup.fileName} 吗？`)) {
    const response = await deleteBackup(instanceId.value, backup.fileName)
    if (response.code === 200) {
      await loadBackups()
    }
  }
}

function showBackupActions(backup: Backup) {
  selectedBackup.value = backup
  showActionSheet.value = true
}
</script>

<template>
  <ion-page>
    <div class="app-header">
      <button class="app-header-back-button" @click="router.back()">
        <ion-icon :icon="chevronBackOutline"></ion-icon>
      </button>
      <div class="app-header-center">
        <h1 class="app-header-center-title">备份管理</h1>
      </div>
      <button class="app-header-icon-button" @click="loadBackups">
        <ion-icon :icon="refreshOutline"></ion-icon>
      </button>
    </div>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="content-wrapper">
        <div v-if="isLoading" class="loading-container">
          <ion-spinner name="circular"></ion-spinner>
          <p class="loading-text">加载中...</p>
        </div>

        <div v-else-if="backups.length === 0" class="empty-state">
          <div class="empty-icon-wrapper">
            <ion-icon :icon="saveOutline" class="empty-icon"></ion-icon>
          </div>
          <h3 class="empty-title">暂无备份文件</h3>
          <p class="empty-desc">点击下方按钮创建您的第一个备份</p>
          <ion-button @click="createBackup" class="create-button">
            <ion-icon :icon="addOutline" slot="start"></ion-icon>
            创建备份
          </ion-button>
        </div>

        <div v-else class="backup-list">
          <ion-card v-for="backup in backups" :key="backup.fileName" class="backup-card" @click="showBackupActions(backup)">
            <ion-card-content>
              <div class="backup-content">
                <div class="backup-icon-wrapper">
                  <ion-icon :icon="saveOutline"></ion-icon>
                </div>
                <div class="backup-info">
                  <span class="backup-name">{{ backup.fileName }}</span>
                  <span class="backup-meta">{{ formatDate(backup.createTime) }} · {{ backup.fileSizeStr }}</span>
                </div>
                <ion-button fill="clear" class="download-button" @click.stop="downloadBackup(backup)">
                  <ion-icon :icon="downloadOutline"></ion-icon>
                </ion-button>
                <ion-icon :icon="chevronForwardOutline" class="backup-chevron"></ion-icon>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="createBackup">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <ion-action-sheet
        :is-open="showActionSheet"
        :header="selectedBackup?.fileName"
        :buttons="[
          { text: '下载', icon: downloadOutline, handler: () => { if (selectedBackup) downloadBackup(selectedBackup) } },
          { text: '删除', icon: trashOutline, role: 'destructive', handler: () => { if (selectedBackup) removeBackup(selectedBackup) } },
          { text: '取消', role: 'cancel' }
        ]"
        @didDismiss="showActionSheet = false; selectedBackup = null"
      ></ion-action-sheet>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.content-wrapper {
  padding: 16px;
  padding-bottom: 88px;
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
  --background: var(--ion-color-primary-container);
  --color: var(--ion-color-on-primary-container);
}

.backup-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.backup-card {
  margin: 0;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.backup-card:active {
  transform: scale(0.98);
}

.backup-card ion-card-content {
  padding: 12px 16px;
}

.backup-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.backup-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--ion-color-primary-container);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.backup-icon-wrapper ion-icon {
  font-size: 20px;
  color: var(--ion-color-on-primary-container);
}

.backup-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.backup-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--ion-text-color);
}

.backup-meta {
  font-size: 12px;
  color: var(--ion-text-color-secondary);
}

.download-button {
  --padding-start: 8px;
  --padding-end: 8px;
}

.backup-chevron {
  color: var(--ion-color-outline);
  font-size: 20px;
  flex-shrink: 0;
}
</style>
