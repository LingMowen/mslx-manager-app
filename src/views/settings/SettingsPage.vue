<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonList, IonItem, IonLabel, IonToggle, IonIcon, IonButton, IonSpinner, IonCard, IonCardContent, IonInput, IonMenu, IonMenuButton, IonMenuToggle, IonAvatar, IonListHeader, menuController } from '@ionic/vue'
import { moonOutline, sunnyOutline, personOutline, serverOutline, logOutOutline, chevronForwardOutline, chevronBackOutline, cloudOutline, keyOutline, informationCircleOutline, refreshOutline, settingsOutline, swapHorizontalOutline, menuOutline } from 'ionicons/icons'
import { useAuthStore } from '@/stores/auth'
import { useConnectionStore } from '@/stores/connection'
import { useInstanceStore } from '@/stores/instance'
import { storage } from '@/utils/storage'

const router = useRouter()
const authStore = useAuthStore()
const connectionStore = useConnectionStore()
const instanceStore = useInstanceStore()

const darkMode = ref(false)
const isLoading = ref(false)

const username = computed(() => authStore.username)
const avatar = computed(() => authStore.avatar)
const role = computed(() => authStore.role)
const currentServer = computed(() => connectionStore.currentServer)
const currentServerName = computed(() => connectionStore.currentServer?.name || '')
const currentServerUrl = computed(() => {
  const url = connectionStore.currentServer?.url || ''
  return url.replace(/^https?:\/\//, '').split('/')[0]
})

onMounted(() => {
  darkMode.value = document.body.classList.contains('dark')
})

function toggleDarkMode() {
  darkMode.value = !darkMode.value
  document.body.classList.toggle('dark', darkMode.value)
  localStorage.setItem('darkMode', darkMode.value.toString())
}

function goToProfile() {
  router.push('/settings/profile')
}

function goToServerManagement() {
  router.push('/connection')
}

function goToUsers() {
  router.push('/users')
}

function goToFrp() {
  router.push('/frp')
}

function goToHome() {
  router.push('/home')
}

function switchServer() {
  connectionStore.currentServer = null
  storage.remove('currentServer')
  router.push('/connection')
}

function getAppVersion(): string {
  return '1.1.5'
}

async function openMenu() {
  await menuController.open('settings-menu')
}
</script>

<template>
  <ion-page>
    <div class="app-header">
      <button class="app-header-icon-button" @click="openMenu">
        <ion-icon :icon="menuOutline"></ion-icon>
      </button>
      <div class="app-header-center">
        <h1 class="app-header-center-title">设置</h1>
      </div>
      <div style="width: 48px;"></div>
    </div>

    <ion-menu menu-id="settings-menu" content-id="settings-content">
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
            <ion-item button @click="goToUsers">
              <ion-icon :icon="personOutline" slot="start"></ion-icon>
              <ion-label>用户管理</ion-label>
            </ion-item>
          </ion-menu-toggle>
        </ion-list>

        <ion-list>
          <ion-list-header>设置</ion-list-header>
          <ion-menu-toggle :auto-hide="false">
            <ion-item button @click="switchServer">
              <ion-icon :icon="swapHorizontalOutline" slot="start" color="primary"></ion-icon>
              <ion-label color="primary">切换服务器</ion-label>
            </ion-item>
          </ion-menu-toggle>
        </ion-list>
      </ion-content>
    </ion-menu>

    <ion-content id="settings-content">
      <div class="content-wrapper">
        <div class="header-section">
          <h1 class="page-headline">设置</h1>
          <p class="page-supporting">管理应用和服务器配置</p>
        </div>

        <ion-card class="server-card">
          <ion-card-content>
            <div class="server-content">
              <div class="server-icon-wrapper">
                <ion-icon :icon="cloudOutline"></ion-icon>
              </div>
              <div class="server-info">
                <span class="server-name">{{ currentServer?.name || '未连接' }}</span>
                <span class="server-url">{{ currentServer?.url || '点击切换服务器' }}</span>
              </div>
              <ion-button fill="solid" size="small" class="switch-button" @click="switchServer">
                <ion-icon :icon="swapHorizontalOutline" slot="start"></ion-icon>
                切换
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>

        <div class="section-title">管理</div>
        <div class="settings-list">
          <ion-card class="settings-item" @click="goToFrp">
            <ion-card-content>
              <div class="item-content">
                <div class="item-icon-wrapper">
                  <ion-icon :icon="serverOutline"></ion-icon>
                </div>
                <div class="item-info">
                  <span class="item-title">Frp 隧道管理</span>
                  <span class="item-desc">管理内网穿透隧道</span>
                </div>
                <ion-icon :icon="chevronForwardOutline" class="item-chevron"></ion-icon>
              </div>
            </ion-card-content>
          </ion-card>

          <ion-card v-if="role === 'Admin'" class="settings-item" @click="goToUsers">
            <ion-card-content>
              <div class="item-content">
                <div class="item-icon-wrapper">
                  <ion-icon :icon="personOutline"></ion-icon>
                </div>
                <div class="item-info">
                  <span class="item-title">用户管理</span>
                  <span class="item-desc">管理面板用户和权限</span>
                </div>
                <ion-icon :icon="chevronForwardOutline" class="item-chevron"></ion-icon>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <div class="section-title">外观</div>
        <ion-card class="toggle-card">
          <ion-card-content>
            <div class="toggle-content">
              <div class="toggle-icon-wrapper">
                <ion-icon :icon="darkMode ? moonOutline : sunnyOutline"></ion-icon>
              </div>
              <div class="toggle-info">
                <span class="toggle-title">深色模式</span>
                <span class="toggle-desc">切换应用主题</span>
              </div>
              <ion-toggle :checked="darkMode" @ionChange="toggleDarkMode" class="theme-toggle"></ion-toggle>
            </div>
          </ion-card-content>
        </ion-card>

        <div class="section-title">关于</div>
        <ion-card class="about-card" @click="router.push('/about')">
          <ion-card-content>
            <div class="about-content">
              <div class="app-icon-wrapper">
                <ion-icon :icon="settingsOutline"></ion-icon>
              </div>
              <div class="app-info">
                <span class="app-name">MSLX Manager</span>
                <span class="app-version">版本 {{ getAppVersion() }}</span>
              </div>
              <ion-icon :icon="chevronForwardOutline" class="about-chevron"></ion-icon>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.content-wrapper {
  padding: 16px;
  padding-bottom: 32px;
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

.server-card {
  margin: 0 0 24px 0;
}

.server-card ion-card-content {
  padding: 16px;
}

.server-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.server-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: var(--ion-color-primary-container);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.server-icon-wrapper ion-icon {
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

.switch-button {
  --background: var(--ion-color-primary-container);
  --color: var(--ion-color-on-primary-container);
  --border-radius: 16px;
  height: 36px;
  font-size: 13px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--ion-text-color-secondary);
  margin-bottom: 12px;
  letter-spacing: 0.1px;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.settings-item {
  margin: 0;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.settings-item:active {
  transform: scale(0.98);
}

.settings-item ion-card-content {
  padding: 12px 16px;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.item-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--ion-color-surface-container);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-icon-wrapper ion-icon {
  font-size: 20px;
  color: var(--ion-text-color);
}

.item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--ion-text-color);
}

.item-desc {
  font-size: 12px;
  color: var(--ion-text-color-secondary);
}

.item-chevron {
  color: var(--ion-color-outline);
  font-size: 20px;
  flex-shrink: 0;
}

.toggle-card {
  margin: 0 0 24px 0;
}

.toggle-card ion-card-content {
  padding: 12px 16px;
}

.toggle-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toggle-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--ion-color-surface-container);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toggle-icon-wrapper ion-icon {
  font-size: 20px;
  color: var(--ion-text-color);
}

.toggle-info {
  flex: 1;
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

.theme-toggle {
  flex-shrink: 0;
}

.about-card {
  margin: 0;
}

.about-card ion-card-content {
  padding: 16px;
}

.about-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.app-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: var(--ion-color-primary-container);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.app-icon-wrapper ion-icon {
  font-size: 24px;
  color: var(--ion-color-on-primary-container);
}

.app-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.app-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--ion-text-color);
}

.app-version {
  font-size: 13px;
  color: var(--ion-text-color-secondary);
}

.about-chevron {
  color: var(--ion-color-outline);
  font-size: 20px;
  flex-shrink: 0;
}

.about-card {
  cursor: pointer;
  transition: transform 0.15s ease;
}

.about-card:active {
  transform: scale(0.98);
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
