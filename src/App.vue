<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { App } from '@capacitor/app'
import SplashScreen from '@/components/SplashScreen.vue'
import { useConnectionStore } from '@/stores/connection'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const connectionStore = useConnectionStore()
const authStore = useAuthStore()

const showSplash = ref(true)

const isLoggedIn = computed(() => authStore.isLoggedIn)
const hasServer = computed(() => connectionStore.currentServer !== null)
const showTabs = computed(() => isLoggedIn.value && hasServer.value && !route.path.includes('/instances/'))

onMounted(() => {
  connectionStore.loadServers()
  authStore.loadAuth()
  
  // 安卓返回键处理
  App.addListener('backButton', () => {
    const currentPath = route.path
    
    // 首页 - 退出应用
    if (currentPath === '/' || currentPath === '/home') {
      App.exitApp()
      return
    }
    
    // 连接选择页 - 退出应用
    if (currentPath === '/connection') {
      App.exitApp()
      return
    }
    
    // 列表页面（服务器列表、用户列表等）- 返回首页
    if (currentPath === '/instance-list' || 
        currentPath === '/user-list' || 
        currentPath === '/frp-list' ||
        currentPath === '/task-list' ||
        currentPath === '/backup-list' ||
        currentPath === '/file-list' ||
        currentPath === '/player-list' ||
        currentPath === '/settings' ||
        currentPath === '/about') {
      router.push('/home')
      return
    }
    
    // 其他页面（有详情页、创建页等）- 返回上一级
    if (router.back) {
      router.back()
    } else {
      router.push('/home')
    }
  })
})

function onSplashComplete() {
  showSplash.value = false
}
</script>

<template>
  <ion-app>
    <SplashScreen v-if="showSplash" :duration="2500" @complete="onSplashComplete" />
    <ion-router-outlet />
  </ion-app>
</template>

<style>
ion-content {
  --background: var(--ion-background-color);
}

ion-card {
  margin: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --inner-padding-end: 0;
}

ion-button {
  --border-radius: 6px;
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0;
}

/* 修复按钮文字显示 */
ion-button::part(native) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-button {
  --padding-start: 16px;
  --padding-end: 16px;
  min-width: 80px;
}

.action-button::part(native) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* 确保按钮文字可见 */
ion-button span,
ion-button .button-text {
  display: inline !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* 确保图标可见 */
ion-icon {
  visibility: visible !important;
  opacity: 1 !important;
}

/* 修复空状态图标 */
.empty-icon {
  visibility: visible !important;
  opacity: 1 !important;
}
</style>
