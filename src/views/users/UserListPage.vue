<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonList, IonItem, IonLabel, IonIcon, IonButton, IonSpinner, IonRefresher, IonRefresherContent, IonFab, IonFabButton, IonActionSheet, IonAvatar, IonBadge, IonModal, IonInput, IonSelect, IonSelectOption, IonCard, IonCardContent, IonMenu, IonMenuToggle, IonListHeader, menuController } from '@ionic/vue'
import { addOutline, personOutline, trashOutline, refreshOutline, createOutline, keyOutline, chevronForwardOutline, chevronBackOutline, serverOutline, cloudOutline, swapHorizontalOutline, settingsOutline, menuOutline, peopleOutline, informationCircleOutline, closeOutline } from 'ionicons/icons'
import { getUserList, createUser, updateUser, deleteUser, type AdminUser } from '@/api/user'
import { formatDate } from '@/utils/storage'
import { useConnectionStore } from '@/stores/connection'
import { storage } from '@/utils/storage'

const router = useRouter()
const connectionStore = useConnectionStore()

const users = ref<AdminUser[]>([])
const isLoading = ref(false)
const showActionSheet = ref(false)
const selectedUser = ref<AdminUser | null>(null)
const showCreateModal = ref(false)
const isSaving = ref(false)

const currentServerName = computed(() => connectionStore.currentServer?.name || '')
const currentServerUrl = computed(() => {
  const url = connectionStore.currentServer?.url || ''
  return url.replace(/^https?:\/\//, '').split('/')[0]
})

const newUser = ref({
  username: '',
  password: '',
  name: '',
  role: 'User',
})

import { computed } from 'vue'

onMounted(async () => {
  await loadUsers()
})

async function loadUsers() {
  isLoading.value = true
  try {
    const response = await getUserList()
    if (response.code === 200) {
      users.value = response.data
    }
  } finally {
    isLoading.value = false
  }
}

async function handleRefresh(event: any) {
  await loadUsers()
  event.target.complete()
}

async function createNewUser() {
  if (!newUser.value.username || !newUser.value.password) {
    alert('请填写用户名和密码')
    return
  }

  isSaving.value = true
  try {
    await createUser(newUser.value)
    showCreateModal.value = false
    newUser.value = { username: '', password: '', name: '', role: 'User' }
    await loadUsers()
  } finally {
    isSaving.value = false
  }
}

async function removeUser(user: AdminUser) {
  if (confirm(`确定要删除用户 ${user.username} 吗？`)) {
    await deleteUser(user.id)
    await loadUsers()
  }
}

function getRoleText(role: string): string {
  return role === 'Admin' ? '管理员' : '普通用户'
}

function getRoleColor(role: string): string {
  return role === 'Admin' ? 'warning' : 'medium'
}

function goToHome() {
  router.push('/home')
}

function goToFrp() {
  router.push('/frp')
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
  await menuController.open('users-menu')
}
</script>

<template>
  <ion-page>
    <div class="app-header">
      <button class="app-header-icon-button" @click="openMenu">
        <ion-icon :icon="menuOutline"></ion-icon>
      </button>
      <div class="app-header-center">
        <h1 class="app-header-center-title">用户管理</h1>
      </div>
      <button class="app-header-icon-button" @click="loadUsers">
        <ion-icon :icon="refreshOutline"></ion-icon>
      </button>
    </div>

    <ion-menu menu-id="users-menu" content-id="users-content">
      <ion-header>
        <ion-toolbar>
          <ion-title>菜单</ion-title>
        </ion-toolbar>
      </ion-header>
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
            <ion-item button @click="goToFrp">
              <ion-icon :icon="cloudOutline" slot="start"></ion-icon>
              <ion-label>Frp 隧道</ion-label>
            </ion-item>
          </ion-menu-toggle>
          <ion-menu-toggle :auto-hide="false">
            <ion-item button class="active-page">
              <ion-icon :icon="peopleOutline" slot="start" color="primary"></ion-icon>
              <ion-label color="primary">用户管理</ion-label>
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

    <ion-content id="users-content">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="content-wrapper">
        <div class="header-section">
          <h1 class="page-headline">用户管理</h1>
          <p class="page-supporting">管理面板用户和权限</p>
        </div>

        <div v-if="isLoading" class="loading-container">
          <ion-spinner name="circular"></ion-spinner>
          <p class="loading-text">加载中...</p>
        </div>

        <div v-else-if="users.length === 0" class="empty-state">
          <div class="empty-icon-wrapper">
            <ion-icon :icon="personOutline" class="empty-icon"></ion-icon>
          </div>
          <h3 class="empty-title">暂无用户</h3>
          <p class="empty-desc">点击下方按钮创建您的第一个用户</p>
          <ion-button @click="showCreateModal = true" class="create-button">
            <ion-icon :icon="addOutline" slot="start"></ion-icon>
            创建用户
          </ion-button>
        </div>

        <div v-else class="user-list">
          <ion-card v-for="user in users" :key="user.id" class="user-card" @click="selectedUser = user; showActionSheet = true">
            <ion-card-content>
              <div class="user-content">
                <div class="user-avatar" :class="user.role === 'Admin' ? 'admin' : 'user'">
                  <ion-icon :icon="personOutline"></ion-icon>
                </div>
                <div class="user-info">
                  <div class="user-header">
                    <span class="user-name">{{ user.name || user.username }}</span>
                    <div class="role-badge" :class="user.role === 'Admin' ? 'admin' : 'user'">
                      {{ getRoleText(user.role) }}
                    </div>
                  </div>
                  <span class="user-meta">{{ user.username }} · {{ user.lastLoginTime ? formatDate(user.lastLoginTime) : '从未登录' }}</span>
                </div>
                <ion-icon :icon="chevronForwardOutline" class="user-chevron"></ion-icon>
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
        :header="selectedUser?.username"
        :buttons="[
          { text: '删除', icon: trashOutline, role: 'destructive', handler: () => { if (selectedUser) removeUser(selectedUser) } },
          { text: '取消', role: 'cancel' }
        ]"
        @didDismiss="showActionSheet = false; selectedUser = null"
      ></ion-action-sheet>

      <ion-modal :is-open="showCreateModal" @didDismiss="showCreateModal = false" class="custom-modal">
        <div class="modal-wrapper">
          <div class="modal-box">
            <div class="modal-header">
              <h2 class="modal-title">创建用户</h2>
              <button class="modal-close-btn" @click="showCreateModal = false">
                <ion-icon :icon="closeOutline"></ion-icon>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-wrapper">
                <div class="input-group">
                  <div class="input-label">用户名</div>
                  <div class="input-field">
                    <ion-input v-model="newUser.username" placeholder="登录用户名"></ion-input>
                  </div>
                </div>

                <div class="input-group">
                  <div class="input-label">密码</div>
                  <div class="input-field">
                    <ion-input v-model="newUser.password" type="password" placeholder="登录密码"></ion-input>
                  </div>
                </div>

                <div class="input-group">
                  <div class="input-label">显示名称</div>
                  <div class="input-field">
                    <ion-input v-model="newUser.name" placeholder="可选"></ion-input>
                  </div>
                </div>

                <div class="input-group">
                  <div class="input-label">角色</div>
                  <div class="input-field">
                    <ion-select v-model="newUser.role" interface="action-sheet" placeholder="选择角色">
                      <ion-select-option value="User">普通用户</ion-select-option>
                      <ion-select-option value="Admin">管理员</ion-select-option>
                    </ion-select>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="modal-btn cancel" @click="showCreateModal = false">取消</button>
              <button class="modal-btn confirm" @click="createNewUser" :disabled="isSaving">
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

.user-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-card {
  margin: 0;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.user-card:active {
  transform: scale(0.98);
}

.user-card ion-card-content {
  padding: 12px 16px;
}

.user-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar.admin {
  background: var(--ion-color-warning-container);
}

.user-avatar.admin ion-icon {
  color: var(--ion-color-warning);
}

.user-avatar.user {
  background: var(--ion-color-primary-container);
}

.user-avatar.user ion-icon {
  color: var(--ion-color-on-primary-container);
}

.user-avatar ion-icon {
  font-size: 20px;
}

.user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--ion-text-color);
}

.role-badge {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
}

.role-badge.admin {
  background: var(--ion-color-warning-container);
  color: var(--ion-color-warning);
}

.role-badge.user {
  background: var(--ion-color-surface-container-high);
  color: var(--ion-text-color-secondary);
}

.user-meta {
  font-size: 12px;
  color: var(--ion-text-color-secondary);
}

.user-chevron {
  color: var(--ion-color-outline);
  font-size: 20px;
  flex-shrink: 0;
}

.save-button {
  --color: var(--ion-color-primary);
  --background: transparent;
  font-weight: 500;
}

/* 弹窗按钮样式 */
:deep(ion-modal.modal-default ion-button) {
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

.input-field ion-input,
.input-field ion-select {
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 14px;
  --padding-bottom: 14px;
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
