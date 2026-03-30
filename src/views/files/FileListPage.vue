<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonBackButton, IonButtons, IonList, IonItem, IonLabel, IonIcon, IonButton, IonSpinner, IonRefresher, IonRefresherContent, IonFab, IonFabButton, IonActionSheet, IonBreadcrumb, IonBreadcrumbs, IonModal, IonTextarea, IonInput, IonAlert } from '@ionic/vue'
import { folderOutline, documentOutline, trashOutline, createOutline, downloadOutline, cloudUploadOutline, addOutline, refreshOutline, homeOutline, chevronForwardOutline, chevronBackOutline } from 'ionicons/icons'
import { getFileList, getFileContent, saveFile, createFolder, deleteFile, getFileDownloadUrl } from '@/api/file'
import type { FileItem } from '@/types'
import { formatFileSize, formatDate } from '@/utils/storage'

const route = useRoute()
const router = useRouter()

const instanceId = computed(() => Number(route.params.id))
const currentPath = ref('')
const files = ref<FileItem[]>([])
const isLoading = ref(false)
const showActionSheet = ref(false)
const selectedFile = ref<FileItem | null>(null)
const showCreateModal = ref(false)
const createType = ref<'file' | 'folder'>('file')
const newName = ref('')
const showEditModal = ref(false)
const editContent = ref('')
const editingFile = ref('')
const isSaving = ref(false)

onMounted(async () => {
  await loadFiles()
})

async function loadFiles() {
  isLoading.value = true
  try {
    const response = await getFileList(instanceId.value, currentPath.value || undefined)
    if (response.code === 200) {
      files.value = response.data
    }
  } finally {
    isLoading.value = false
  }
}

async function handleRefresh(event: any) {
  await loadFiles()
  event.target.complete()
}

function getPathParts(): { label: string; path: string }[] {
  const parts = currentPath.value.split('/').filter(Boolean)
  const result: { label: string; path: string }[] = [{ label: '根目录', path: '' }]
  
  let path = ''
  for (const part of parts) {
    path += '/' + part
    result.push({ label: part, path: path.substring(1) })
  }
  
  return result
}

function navigateToPath(path: string) {
  currentPath.value = path
  loadFiles()
}

function navigateUp() {
  const parts = currentPath.value.split('/').filter(Boolean)
  parts.pop()
  currentPath.value = parts.join('/')
  loadFiles()
}

async function openFile(file: FileItem) {
  if (file.type === 'folder') {
    currentPath.value = currentPath.value ? `${currentPath.value}/${file.name}` : file.name
    await loadFiles()
  } else {
    selectedFile.value = file
    showActionSheet.value = true
  }
}

async function viewFile(file: FileItem) {
  try {
    const response = await getFileContent(instanceId.value, currentPath.value ? `${currentPath.value}/${file.name}` : file.name)
    if (response.code === 200) {
      editingFile.value = file.name
      editContent.value = response.data
      showEditModal.value = true
    }
  } catch (error) {
    console.error('Failed to load file:', error)
  }
}

async function saveEditedFile() {
  isSaving.value = true
  try {
    const response = await saveFile(instanceId.value, currentPath.value ? `${currentPath.value}/${editingFile.value}` : editingFile.value, editContent.value)
    if (response.code === 200) {
      showEditModal.value = false
    }
  } finally {
    isSaving.value = false
  }
}

function downloadFile(file: FileItem) {
  const url = getFileDownloadUrl(instanceId.value, currentPath.value ? `${currentPath.value}/${file.name}` : file.name)
  window.open(url, '_blank')
}

async function removeFile(file: FileItem) {
  if (confirm(`确定要删除 ${file.name} 吗？`)) {
    const response = await deleteFile(instanceId.value, currentPath.value ? `${currentPath.value}/${file.name}` : file.name)
    if (response.code === 200) {
      await loadFiles()
    }
  }
}

function openCreateModal(type: 'file' | 'folder') {
  createType.value = type
  newName.value = ''
  showCreateModal.value = true
}

async function createNew() {
  if (!newName.value.trim()) return
  
  isSaving.value = true
  try {
    if (createType.value === 'folder') {
      const response = await createFolder(instanceId.value, currentPath.value ? `${currentPath.value}/${newName.value}` : newName.value)
      if (response.code === 200) {
        await loadFiles()
      }
    } else {
      const response = await saveFile(instanceId.value, currentPath.value ? `${currentPath.value}/${newName.value}` : newName.value, '')
      if (response.code === 200) {
        await loadFiles()
      }
    }
  } finally {
    isSaving.value = false
    showCreateModal.value = false
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
        <h1 class="app-header-center-title">文件管理</h1>
      </div>
      <button class="app-header-icon-button" @click="loadFiles">
        <ion-icon :icon="refreshOutline"></ion-icon>
      </button>
    </div>
    <ion-content>
      <div class="breadcrumb-container">
        <ion-breadcrumbs>
          <ion-breadcrumb v-for="part in getPathParts()" :key="part.path" @click="navigateToPath(part.path)">
            <ion-icon v-if="!part.path" :icon="homeOutline" slot="start"></ion-icon>
            {{ part.label }}
          </ion-breadcrumb>
        </ion-breadcrumbs>
      </div>

      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div v-if="isLoading" class="loading-container">
        <ion-spinner name="circular"></ion-spinner>
        <p class="loading-text">加载中...</p>
      </div>

      <div v-else class="file-list">
        <ion-card v-if="currentPath" class="file-item parent-folder" @click="navigateUp">
          <ion-card-content>
            <div class="file-content">
              <div class="file-icon-wrapper folder">
                <ion-icon :icon="folderOutline"></ion-icon>
              </div>
              <div class="file-info">
                <span class="file-name">..</span>
                <span class="file-meta">返回上级</span>
              </div>
              <ion-icon :icon="chevronForwardOutline" class="file-chevron"></ion-icon>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card v-for="file in files" :key="file.name" class="file-item" @click="openFile(file)">
          <ion-card-content>
            <div class="file-content">
              <div class="file-icon-wrapper" :class="file.type">
                <ion-icon :icon="file.type === 'folder' ? folderOutline : documentOutline"></ion-icon>
              </div>
              <div class="file-info">
                <span class="file-name">{{ file.name }}</span>
                <span v-if="file.type === 'file'" class="file-meta">{{ formatFileSize(file.size) }} · {{ formatDate(file.lastModified) }}</span>
                <span v-else class="file-meta">文件夹</span>
              </div>
              <ion-icon :icon="chevronForwardOutline" class="file-chevron"></ion-icon>
            </div>
          </ion-card-content>
        </ion-card>

        <div v-if="files.length === 0 && !currentPath" class="empty-state">
          <div class="empty-icon-wrapper">
            <ion-icon :icon="folderOutline" class="empty-icon"></ion-icon>
          </div>
          <p class="empty-text">此文件夹为空</p>
        </div>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="showCreateModal = true">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <ion-action-sheet
        :is-open="showActionSheet"
        :header="selectedFile?.name"
        :buttons="[
          { text: '查看/编辑', icon: createOutline, handler: () => { if (selectedFile) viewFile(selectedFile) } },
          { text: '下载', icon: downloadOutline, handler: () => { if (selectedFile) downloadFile(selectedFile) } },
          { text: '删除', icon: trashOutline, role: 'destructive', handler: () => { if (selectedFile) removeFile(selectedFile) } },
          { text: '取消', role: 'cancel' }
        ]"
        @didDismiss="showActionSheet = false; selectedFile = null"
      ></ion-action-sheet>

      <ion-alert
        :is-open="showCreateModal"
        header="新建"
        :buttons="[
          { text: '取消', role: 'cancel' },
          { text: '创建', handler: createNew }
        ]"
        :inputs="[
          { name: 'name', placeholder: '名称', attributes: { value: newName } }
        ]"
        @didDismiss="showCreateModal = false"
      ></ion-alert>

      <ion-modal :is-open="showEditModal" @didDismiss="showEditModal = false">
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button @click="showEditModal = false">取消</ion-button>
            </ion-buttons>
            <ion-title>{{ editingFile }}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="saveEditedFile" :disabled="isSaving" class="save-button">
                <ion-spinner v-if="isSaving" name="circular"></ion-spinner>
                <span v-else>保存</span>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <div class="editor-container">
            <ion-textarea v-model="editContent" class="code-editor" auto-grow></ion-textarea>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.breadcrumb-container {
  padding: 12px 16px;
  background: var(--ion-background-color);
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

.file-list {
  padding: 0 16px 88px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  margin: 0;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.file-item:active {
  transform: scale(0.98);
}

.file-item ion-card-content {
  padding: 12px 16px;
}

.file-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.file-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.file-icon-wrapper.folder {
  background: var(--ion-color-warning-container);
}

.file-icon-wrapper.folder ion-icon {
  color: var(--ion-color-warning);
}

.file-icon-wrapper.file {
  background: var(--ion-color-primary-container);
}

.file-icon-wrapper.file ion-icon {
  color: var(--ion-color-on-primary-container);
}

.file-icon-wrapper ion-icon {
  font-size: 20px;
}

.file-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--ion-text-color);
}

.file-meta {
  font-size: 12px;
  color: var(--ion-text-color-secondary);
}

.file-chevron {
  color: var(--ion-color-outline);
  font-size: 20px;
  flex-shrink: 0;
}

.parent-folder .file-name {
  color: var(--ion-text-color-secondary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
}

.empty-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background: var(--ion-color-surface-container);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-icon {
  font-size: 32px;
  color: var(--ion-text-color-secondary);
}

.empty-text {
  font-size: 14px;
  color: var(--ion-text-color-secondary);
  margin: 0;
}

.save-button {
  --color: var(--ion-color-primary);
  font-weight: 500;
}

.editor-container {
  padding: 16px;
  height: 100%;
}

.code-editor {
  --background: var(--ion-color-surface-container);
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  --color: var(--ion-text-color);
  font-family: 'Consolas', 'Monaco', 'JetBrains Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  border-radius: 16px;
  min-height: 400px;
}
</style>
