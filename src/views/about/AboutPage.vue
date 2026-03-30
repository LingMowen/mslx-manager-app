<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonContent, IonPage, IonIcon } from '@ionic/vue'
import { chevronBackOutline, logoGithub, mailOutline, shieldOutline, documentTextOutline } from 'ionicons/icons'
import { Browser } from '@capacitor/browser'

const router = useRouter()

const appInfo = ref({
  name: 'MSLX Manager',
  version: '1.1.6.5',
  buildNumber: '2025033001',
  developer: 'LingMowen',
  website: 'https://github.com/LingMowen',
  bilibili: 'https://b23.tv/1yabrrp'
})

const updateHistory = ref([
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
      '新增关于页面一级菜单入口',
      '更新版本号至 1.1.5',
      '更新许可证为 AGPL-3.0'
    ]
  },
  {
    version: '1.1.0',
    date: '2025-03-29',
    changes: [
      '全新 Material You 设计风格',
      '支持深色模式，自动跟随系统主题',
      '优化圆角和阴影效果',
      '修复服务器离线状态检测',
      '改进服务器连接验证机制',
      '优化侧边栏菜单样式',
      '统一整体配色方案',
      '修复部分按钮文字显示问题',
      '改进图标显示效果'
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
  { title: '服务器管理', desc: '轻松管理多个 Minecraft 服务器实例，支持启动、停止、重启等操作' },
  { title: 'Frp 隧道', desc: '一键配置内网穿透，让服务器可被外部访问，支持多种隧道类型' },
  { title: '用户管理', desc: '多用户支持，权限分级管理，保障服务器安全' },
  { title: '实时监控', desc: '查看服务器状态、在线玩家、资源占用情况，实时掌握服务器运行状况' },
  { title: '文件管理', desc: '在线浏览、上传、下载、编辑服务器文件，支持压缩和解压' },
  { title: '地图可视化', desc: '实时查看服务器地图和玩家位置，支持在线地图渲染' },
  { title: '任务调度', desc: '定时备份、自动重启等自动化任务，支持 Cron 表达式' },
  { title: '备份管理', desc: '快速创建和恢复服务器备份，支持自动备份策略' }
])

function goBack() {
  router.back()
}

async function openExternalLink(url: string) {
  await Browser.open({ url })
}
</script>

<template>
  <ion-page>
    <div class="app-header">
      <button class="app-header-back-button" @click="goBack">
        <ion-icon :icon="chevronBackOutline"></ion-icon>
      </button>
      <div class="app-header-center">
        <h1 class="app-header-center-title">关于</h1>
      </div>
      <div style="width: 48px;"></div>
    </div>

    <ion-content>
      <div class="content-wrapper">
        <!-- App Info Section -->
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

        <!-- Features Section -->
        <div class="section">
          <h2 class="section-title">功能介绍</h2>
          <div class="features-grid">
            <div v-for="feature in features" :key="feature.title" class="feature-item">
              <span class="feature-title">{{ feature.title }}</span>
              <span class="feature-desc">{{ feature.desc }}</span>
            </div>
          </div>
        </div>

        <!-- Update History Section -->
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

        <!-- Links Section -->
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
            </div>
            <div class="link-item" @click="openExternalLink(appInfo.bilibili)">
              <div class="link-icon-wrapper">
                <ion-icon :icon="documentTextOutline"></ion-icon>
              </div>
              <div class="link-info">
                <span class="link-title">哔哩哔哩</span>
                <span class="link-desc">凌墨问的个人空间</span>
              </div>
            </div>
          </div>
        </div>

        <!-- License Section -->
        <div class="section">
          <h2 class="section-title">开源许可</h2>
          <div class="license-card">
            <p class="license-name">GNU Affero General Public License v3.0</p>
            <p class="license-desc">本项目基于 AGPL-3.0 许可证开源。如果通过网络使用（如 SaaS），必须开源修改版本。</p>
          </div>
        </div>

        <!-- Copyright -->
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
  width: 100px;
  height: 100px;
  border-radius: 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.app-logo svg {
  width: 100%;
  height: 100%;
  border-radius: 24px;
}

.app-name {
  font-size: 24px;
  font-weight: 600;
  color: var(--ion-text-color);
  margin: 0 0 8px 0;
}

.app-version {
  font-size: 14px;
  color: var(--ion-text-color-secondary);
  margin: 0 0 4px 0;
}

.app-developer {
  font-size: 13px;
  color: var(--ion-text-color-secondary);
  margin: 0;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--ion-text-color-secondary);
  margin-bottom: 12px;
  letter-spacing: 0.1px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.feature-item {
  background: var(--ion-color-surface-container);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.feature-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--ion-text-color);
}

.feature-desc {
  font-size: 13px;
  color: var(--ion-text-color-secondary);
  line-height: 1.5;
}

.update-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.update-card {
  background: var(--ion-color-surface-container);
  border-radius: 16px;
  padding: 16px;
}

.update-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.update-version {
  font-size: 16px;
  font-weight: 600;
  color: var(--ion-color-primary);
}

.update-date {
  font-size: 13px;
  color: var(--ion-text-color-secondary);
}

.update-changes {
  margin: 0;
  padding-left: 16px;
  color: var(--ion-text-color);
  font-size: 14px;
  line-height: 1.6;
}

.update-changes li {
  margin-bottom: 4px;
}

.links-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: var(--ion-color-surface-container);
  border-radius: 16px;
  cursor: pointer;
  transition: background 0.2s ease;
  text-decoration: none;
}

.link-item:active {
  background: var(--ion-color-surface-container-high);
}

.link-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--ion-color-primary-container);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.link-icon-wrapper ion-icon {
  font-size: 20px;
  color: var(--ion-color-on-primary-container);
}

.link-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.link-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--ion-text-color);
}

.link-desc {
  font-size: 13px;
  color: var(--ion-text-color-secondary);
}

.copyright {
  text-align: center;
  padding: 24px 16px;
  margin-top: 8px;
}

.copyright p {
  font-size: 12px;
  color: var(--ion-text-color-secondary);
  margin: 0 0 4px 0;
}

.license-card {
  background: var(--ion-color-surface-container);
  border-radius: 12px;
  padding: 16px;
}

.license-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--ion-text-color);
  margin: 0 0 8px 0;
}

.license-desc {
  font-size: 13px;
  color: var(--ion-text-color-secondary);
  line-height: 1.5;
  margin: 0;
}
</style>
