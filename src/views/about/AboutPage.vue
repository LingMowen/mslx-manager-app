<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonMenu, IonContent, IonList, IonItem, IonLabel, IonIcon, IonListHeader, IonMenuToggle, IonHeader, IonToolbar, IonTitle } from '@ionic/vue'
import { serverOutline, cloudOutline, peopleOutline, settingsOutline, swapHorizontalOutline, informationCircleOutline, chevronForwardOutline, chevronBackOutline, logoGithub, shieldOutline, documentTextOutline, folderOutline, mapOutline, timeOutline, downloadOutline, terminalOutline, pulseOutline } from 'ionicons/icons'
import { Browser } from '@capacitor/browser'
import { menuController } from '@ionic/vue'
import { useConnectionStore } from '@/stores/connection'
import { storage } from '@/utils/storage'

const router = useRouter()
const connectionStore = useConnectionStore()

const appInfo = ref({
  name: 'MSLX Manager',
  version: '1.1.7',
  buildNumber: '2025040101',
  developer: 'LingMowen',
  website: 'https://github.com/LingMowen',
  bilibili: 'https://b23.tv/1yabrrp'
})

const updateHistory = ref([
  {
    version: '1.1.7',
    date: '2025-04-01',
    changes: [
      '优化 ion-select 弹出框样式，修复选项显示问题',
      '修复实例设置保存 API 路径错误',
      '优化控制台日志滚动逻辑，日志从下往上排列',
      '完善实例设置页面，添加更多配置选项',
      '优化地图瓦片加载，显示加载进度条',
      '添加地图缩放控制功能',
      '优化 ion-action-sheet 样式为 Android 14 风格',
      '更新版本号至 1.1.7'
    ]
  },
  {
    version: '1.1.6.5',
    date: '2025-03-30',
    changes: [
      '优化安卓返回键逻辑，与系统保持一致',
      '修复 SignalR 实时日志连接问题',
      '优化命令输入框状态管理',
      '改进错误提示信息',
      '更新版本号至 1.1.6.5'
    ]
  },
  {
    version: '1.1.6',
    date: '2025-03-29',
    changes: [
      '修复 SignalR 实时日志连接问题',
      '优化命令输入框状态管理',
      '改进错误提示信息',
      '更新版本号至 1.1.6'
    ]
  },
  {
    version: '1.1.5.1',
    date: '2025-03-31',
    changes: [
      'UI 全面调整为纯白背景风格',
      '优化新拟态设计效果',
      '修复按钮文字显示问题',
      '优化 ion-select 弹窗样式',
      '修复在线玩家数量显示',
      '优化控制台历史日志加载',
      '改进服务器连接验证逻辑',
      '优化 Android 返回键行为',
      '修复 Action Sheet 按钮方向',
      '更新版本号至 1.1.5.1'
    ]
  },
  {
    version: '1.1.5',
    date: '2025-03-30',
    changes: [
      'UI 全面调整为纯白背景风格',
      '优化新拟态设计效果',
      '修复按钮文字显示问题',
      '更新版本号至 1.1.5'
    ]
  },
  {
    version: '1.1.0',
    date: '2025-03-29',
    changes: [
      '正式版发布',
      '支持 Minecraft 服务器管理',
      '支持 Frp 内网穿透管理',
      '支持用户权限管理',
      '支持实时控制台查看',
      '支持文件管理',
      '支持任务调度',
      '支持地图可视化'
    ]
  },
  {
    version: '1.0.0',
    date: '2025-03-28',
    changes: [
      '初始版本发布',
      '支持 Minecraft 服务器管理',
      '支持 Frp 内网穿透管理',
      '支持用户权限管理',
      '支持实时控制台查看',
      '支持文件管理',
      '支持任务调度',
      '支持地图可视化'
    ]
  }
])

const features = ref([
  { title: '服务器管理', desc: '轻松管理多个 Minecraft 服务器实例，支持启动、停止、重启等操作', icon: 'server-outline' },
  { title: 'Frp 隧道', desc: '一键配置内网穿透，让服务器可被外部访问，支持多种隧道类型', icon: 'cloud-outline' },
  { title: '用户管理', desc: '多用户支持，权限分级管理，保障服务器安全', icon: 'people-outline' },
  { title: '实时监控', desc: '查看服务器状态、在线玩家、资源占用情况', icon: 'pulse-outline' },
  { title: '文件管理', desc: '在线浏览、上传、下载、编辑服务器文件，支持压缩和解压', icon: 'folder-outline' },
  { title: '地图可视化', desc: '实时查看服务器地图和玩家位置，支持在线地图渲染', icon: 'map-outline' },
  { title: '任务调度', desc: '定时备份、自动重启等自动化任务，支持 Cron 表达式', icon: 'time-outline' },
  { title: '备份管理', desc: '快速创建和恢复服务器备份，支持自动备份策略', icon: 'download-outline' },
  { title: '命令控制', desc: '发送控制台命令，实时查看服务器日志', icon: 'terminal-outline' }
])

const currentServerName = ref('')
const currentServerUrl = ref('')

try {
  const server = storage.get<{ url: string; name?: string }>('currentServer')
  if (server) {
    currentServerName.value = server.name || '未命名服务器'
    currentServerUrl.value = server.url.replace(/^https?:\/\//, '').split('/')[0]
  }
} catch (e) {
  console.warn('Failed to get server info:', e)
}

function goBack() {
  router.back()
}

async function openMenu() {
  await menuController.open('about-menu')
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

async function openExternalLink(url: string) {
  await Browser.open({ url })
}
</script>

<template>
  <ion-page>
    <ion-menu menu-id="about-menu" content-id="about-content">
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

    <div class="app-header">
      <button class="app-header-icon-button" @click="openMenu">
        <ion-icon :icon="chevronBackOutline"></ion-icon>
      </button>
      <div class="app-header-center">
        <h1 class="app-header-center-title">关于</h1>
      </div>
      <div style="width: 48px;"></div>
    </div>

    <ion-content id="about-content">
      <div class="content-wrapper">
        <div class="app-info-section">
          <div class="app-logo">
            <svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="256" height="256" rx="48" fill="var(--ion-color-primary-container)"/>
              <path d="M128 48L48 128L128 208L208 128L128 48Z" fill="var(--ion-color-primary)"/>
              <circle cx="128" cy="128" r="32" fill="var(--ion-color-on-primary)"/>
            </svg>
          </div>
          <h1 class="app-name">{{ appInfo.name }}</h1>
          <p class="app-version">v{{ appInfo.version }}</p>
          <p class="app-developer">开发者: {{ appInfo.developer }}</p>
        </div>

        <div class="section">
          <h2 class="section-title">功能介绍</h2>
          <div class="features-grid">
            <div v-for="feature in features" :key="feature.title" class="feature-item">
              <ion-icon :icon="feature.icon" class="feature-icon"></ion-icon>
              <span class="feature-title">{{ feature.title }}</span>
              <span class="feature-desc">{{ feature.desc }}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">更新历史</h2>
          <div class="update-list">
            <div v-for="update in updateHistory" :key="update.version" class="update-card">
              <div class="update-header">
                <span class="update-version">v{{ update.version }}</span>
                <span class="update-date">{{ update.date }}</span>
              </div>
              <ul class="update-changes">
                <li v-for="change in update.changes" :key="change">{{ change }}</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">关于作者</h2>
          <div class="links-list">
            <div class="link-item" @click="openExternalLink(appInfo.website)">
              <div class="link-icon-wrapper">
                <ion-icon :icon="logoGithub"></ion-icon>
              </div>
              <div class="link-info">
                <span class="link-title">GitHub</span>
                <span class="link-desc">https://github.com/LingMowen</span>
              </div>
              <ion-icon :icon="chevronForwardOutline" class="link-arrow"></ion-icon>
            </div>
            <div class="link-item" @click="openExternalLink(appInfo.bilibili)">
              <div class="link-icon-wrapper">
                <ion-icon :icon="documentTextOutline"></ion-icon>
              </div>
              <div class="link-info">
                <span class="link-title">哔哩哔哩</span>
                <span class="link-desc">凌墨问的个人空间</span>
              </div>
              <ion-icon :icon="chevronForwardOutline" class="link-arrow"></ion-icon>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">开源许可</h2>
          <div class="license-card">
            <p class="license-name">GNU Affero General Public License v3.0</p>
            <p class="license-desc">本项目基于 AGPL-3.0 许可证开源。如果通过网络使用（如 SaaS），必须开源修改版本。</p>
          </div>
        </div>

        <div class="copyright">
          <p>© 2025 LingMowen. All rights reserved.</p>
          <p>本软件仅供学习交流使用</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.content-wrapper {
  padding: 16px;
  padding-bottom: 32px;
}

.app-info-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
  text-align: center;
}

.app-logo {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
}

.app-logo svg {
  width: 100%;
  height: 100%;
}

.app-name {
  font-size: 24px;
  font-weight: 500;
  color: var(--ion-text-color);
  margin: 0 0 8px 0;
}

.app-version {
  font-size: 14px;
  color: var(--ion-text-color-secondary);
  margin: 0 0 4px 0;
  background: var(--ion-color-surface-container);
  padding: 4px 12px;
  border-radius: 12px;
}

.app-developer {
  font-size: 14px;
  color: var(--ion-text-color-secondary);
  margin: 0;
}

.section {
  margin-top: 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--ion-text-color-secondary);
  letter-spacing: 0.1px;
  margin: 0 0 16px 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  background: var(--ion-color-surface-container);
  border-radius: 12px;
  text-align: center;
}

.feature-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.feature-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--ion-text-color);
  margin-bottom: 4px;
}

.feature-desc {
  font-size: 12px;
  color: var(--ion-text-color-secondary);
  line-height: 1.4;
}

.update-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.update-card {
  padding: 16px;
  background: var(--ion-color-surface-container);
  border-radius: 12px;
}

.update-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.update-version {
  font-size: 16px;
  font-weight: 500;
  color: var(--ion-color-primary);
}

.update-date {
  font-size: 12px;
  color: var(--ion-text-color-secondary);
}

.update-changes {
  margin: 0;
  padding-left: 20px;
}

.update-changes li {
  font-size: 14px;
  color: var(--ion-text-color);
  margin-bottom: 4px;
}

.update-changes li:last-child {
  margin-bottom: 0;
}

.links-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.link-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--ion-color-surface-container);
  border-radius: 12px;
  cursor: pointer;
}

.link-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--ion-color-primary-container);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.link-icon-wrapper ion-icon {
  font-size: 20px;
  color: var(--ion-color-on-primary-container);
}

.link-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.link-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--ion-text-color);
}

.link-desc {
  font-size: 12px;
  color: var(--ion-text-color-secondary);
}

.link-arrow {
  font-size: 20px;
  color: var(--ion-text-color-secondary);
}

.license-card {
  padding: 16px;
  background: var(--ion-color-surface-container);
  border-radius: 12px;
}

.license-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--ion-text-color);
  margin: 0 0 8px 0;
}

.license-desc {
  font-size: 14px;
  color: var(--ion-text-color-secondary);
  margin: 0;
  line-height: 1.5;
}

.copyright {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--ion-border-color);
  text-align: center;
}

.copyright p {
  font-size: 12px;
  color: var(--ion-text-color-secondary);
  margin: 0 0 4px 0;
}
</style>
