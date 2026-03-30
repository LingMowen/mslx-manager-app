<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonBackButton, IonButtons, IonList, IonItem, IonLabel, IonIcon, IonButton, IonSpinner, IonRefresher, IonRefresherContent, IonFab, IonFabButton, IonActionSheet, IonToggle, IonBadge, IonModal, IonInput, IonSelect, IonSelectOption, IonTextarea, IonCard, IonCardContent } from '@ionic/vue'
import { addOutline, timeOutline, trashOutline, createOutline, playOutline, pauseOutline, refreshOutline, chevronForwardOutline, chevronBackOutline } from 'ionicons/icons'
import { getTasksByInstance, createTask, updateTask, deleteTask } from '@/api/task'
import type { ScheduledTask } from '@/types'

const route = useRoute()
const router = useRouter()

const instanceId = computed(() => Number(route.params.id))
const tasks = ref<ScheduledTask[]>([])
const isLoading = ref(false)
const showActionSheet = ref(false)
const selectedTask = ref<ScheduledTask | null>(null)
const showEditModal = ref(false)
const editingTask = ref<Partial<ScheduledTask>>({})
const isSaving = ref(false)

onMounted(async () => {
  await loadTasks()
})

async function loadTasks() {
  isLoading.value = true
  try {
    const response = await getTasksByInstance(instanceId.value)
    if (response.code === 200) {
      tasks.value = response.data
    }
  } finally {
    isLoading.value = false
  }
}

async function handleRefresh(event: any) {
  await loadTasks()
  event.target.complete()
}

function openCreateModal() {
  editingTask.value = {
    instanceId: instanceId.value,
    name: '',
    cron: '',
    type: 'command',
    payload: '',
    enable: true,
  }
  showEditModal.value = true
}

function editTask(task: ScheduledTask) {
  editingTask.value = { ...task }
  showEditModal.value = true
}

async function saveTask() {
  if (!editingTask.value.name || !editingTask.value.cron || !editingTask.value.payload) {
    alert('请填写所有必填字段')
    return
  }

  isSaving.value = true
  try {
    if (editingTask.value.id) {
      await updateTask(editingTask.value.id, editingTask.value)
    } else {
      await createTask(editingTask.value as any)
    }
    showEditModal.value = false
    await loadTasks()
  } finally {
    isSaving.value = false
  }
}

async function toggleTask(task: ScheduledTask) {
  await updateTask(task.id, { enable: !task.enable })
  await loadTasks()
}

async function removeTask(task: ScheduledTask) {
  if (confirm(`确定要删除任务 ${task.name} 吗？`)) {
    await deleteTask(task.id)
    await loadTasks()
  }
}

function getTaskTypeText(type: string): string {
  switch (type) {
    case 'command':
      return '执行命令'
    case 'backup':
      return '创建备份'
    case 'restart':
      return '重启服务器'
    default:
      return type
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
        <h1 class="app-header-center-title">定时任务</h1>
      </div>
      <button class="app-header-icon-button" @click="loadTasks">
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

        <div v-else-if="tasks.length === 0" class="empty-state">
          <div class="empty-icon-wrapper">
            <ion-icon :icon="timeOutline" class="empty-icon"></ion-icon>
          </div>
          <h3 class="empty-title">暂无定时任务</h3>
          <p class="empty-desc">点击下方按钮创建您的第一个任务</p>
          <ion-button @click="openCreateModal" class="create-button">
            <ion-icon :icon="addOutline" slot="start"></ion-icon>
            创建任务
          </ion-button>
        </div>

        <div v-else class="task-list">
          <ion-card v-for="task in tasks" :key="task.id" class="task-card" @click="showActionSheet = true; selectedTask = task">
            <ion-card-content>
              <div class="task-content">
                <div class="task-icon-wrapper" :class="task.enable ? 'enabled' : 'disabled'">
                  <ion-icon :icon="timeOutline"></ion-icon>
                </div>
                <div class="task-info">
                  <div class="task-header">
                    <span class="task-name">{{ task.name }}</span>
                    <div class="status-badge" :class="task.enable ? 'enabled' : 'disabled'">
                      {{ task.enable ? '启用' : '禁用' }}
                    </div>
                  </div>
                  <span class="task-meta">{{ task.cron }} · {{ getTaskTypeText(task.type) }}</span>
                </div>
                <ion-toggle :checked="task.enable" @ionChange.stop="toggleTask(task)" class="task-toggle"></ion-toggle>
                <ion-icon :icon="chevronForwardOutline" class="task-chevron"></ion-icon>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="openCreateModal">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <ion-action-sheet
        :is-open="showActionSheet"
        :header="selectedTask?.name"
        :buttons="[
          { text: '编辑', icon: createOutline, handler: () => { if (selectedTask) editTask(selectedTask) } },
          { text: '删除', icon: trashOutline, role: 'destructive', handler: () => { if (selectedTask) removeTask(selectedTask) } },
          { text: '取消', role: 'cancel' }
        ]"
        @didDismiss="showActionSheet = false; selectedTask = null"
      ></ion-action-sheet>

      <ion-modal :is-open="showEditModal" @didDismiss="showEditModal = false">
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button @click="showEditModal = false">取消</ion-button>
            </ion-buttons>
            <ion-title>{{ editingTask?.id ? '编辑任务' : '创建任务' }}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="saveTask" :disabled="isSaving" class="save-button">
                <ion-spinner v-if="isSaving" name="circular"></ion-spinner>
                <span v-else>保存</span>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <div class="form-wrapper">
            <div class="input-group">
              <div class="input-label">任务名称</div>
              <div class="input-field">
                <ion-input v-model="editingTask.name" placeholder="例如：每日备份"></ion-input>
              </div>
            </div>

            <div class="input-group">
              <div class="input-label">Cron 表达式</div>
              <div class="input-field">
                <ion-input v-model="editingTask.cron" placeholder="例如：0 0 * * *"></ion-input>
              </div>
              <p class="input-hint">每天 00:00 执行</p>
            </div>

            <div class="input-group">
              <div class="input-label">任务类型</div>
              <div class="input-field">
                <ion-select v-model="editingTask.type" interface="action-sheet" placeholder="选择类型">
                  <ion-select-option value="command">执行命令</ion-select-option>
                  <ion-select-option value="backup">创建备份</ion-select-option>
                  <ion-select-option value="restart">重启服务器</ion-select-option>
                </ion-select>
              </div>
            </div>

            <div v-if="editingTask.type === 'command'" class="input-group">
              <div class="input-label">命令内容</div>
              <div class="input-field textarea">
                <ion-textarea v-model="editingTask.payload" placeholder="例如：say 服务器即将重启" :rows="3"></ion-textarea>
              </div>
            </div>

            <div class="input-group toggle-group">
              <div class="toggle-label">
                <span class="toggle-title">启用任务</span>
                <span class="toggle-desc">任务将按计划自动执行</span>
              </div>
              <ion-toggle v-model="editingTask.enable"></ion-toggle>
            </div>
          </div>
        </ion-content>
      </ion-modal>
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

.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-card {
  margin: 0;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.task-card:active {
  transform: scale(0.98);
}

.task-card ion-card-content {
  padding: 12px 16px;
}

.task-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.task-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.task-icon-wrapper.enabled {
  background: var(--ion-color-primary-container);
}

.task-icon-wrapper.enabled ion-icon {
  color: var(--ion-color-on-primary-container);
}

.task-icon-wrapper.disabled {
  background: var(--ion-color-surface-container-high);
}

.task-icon-wrapper.disabled ion-icon {
  color: var(--ion-text-color-secondary);
}

.task-icon-wrapper ion-icon {
  font-size: 20px;
}

.task-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-name {
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

.status-badge.enabled {
  background: var(--ion-color-success-container);
  color: var(--ion-color-success);
}

.status-badge.disabled {
  background: var(--ion-color-surface-container-high);
  color: var(--ion-text-color-secondary);
}

.task-meta {
  font-size: 12px;
  color: var(--ion-text-color-secondary);
}

.task-toggle {
  flex-shrink: 0;
}

.task-chevron {
  color: var(--ion-color-outline);
  font-size: 20px;
  flex-shrink: 0;
}

.save-button {
  --color: var(--ion-color-primary);
  font-weight: 500;
}

.form-wrapper {
  padding: 16px;
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

.input-hint {
  font-size: 12px;
  color: var(--ion-text-color-secondary);
  margin: 6px 0 0 0;
}

.toggle-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--ion-color-surface-container);
  border-radius: 16px;
}

.toggle-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toggle-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--ion-text-color);
}

.toggle-desc {
  font-size: 12px;
  color: var(--ion-text-color-secondary);
}
</style>
