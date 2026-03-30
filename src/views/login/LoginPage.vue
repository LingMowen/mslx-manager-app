<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonSpinner, IonText, IonCard, IonCardContent, IonButtons, IonBackButton } from '@ionic/vue'
import { logInOutline, personOutline, lockClosedOutline, swapHorizontalOutline, chevronBackOutline } from 'ionicons/icons'
import { useAuthStore } from '@/stores/auth'
import { useConnectionStore } from '@/stores/connection'

const router = useRouter()
const authStore = useAuthStore()
const connectionStore = useConnectionStore()

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const currentServerName = computed(() => connectionStore.currentServer?.name || '')
const currentServerUrl = computed(() => {
  const url = connectionStore.currentServer?.url || ''
  return url.replace(/^https?:\/\//, '').split('/')[0]
})

async function handleLogin() {
  if (!username.value || !password.value) {
    errorMessage.value = '请输入用户名和密码'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = await authStore.login(username.value, password.value)
    if (result.success) {
      router.push('/home')
    } else {
      errorMessage.value = result.message
    }
  } finally {
    isLoading.value = false
  }
}

function switchServer() {
  router.push('/connection')
}
</script>

<template>
  <ion-page>
    <div class="app-header">
      <button class="app-header-back-button" @click="router.back()">
        <ion-icon :icon="chevronBackOutline"></ion-icon>
      </button>
      <div class="app-header-center">
        <h1 class="app-header-center-title">登录</h1>
      </div>
      <div style="width: 48px;"></div>
    </div>
    <ion-content class="ion-padding">
      <div class="login-container">
        <div class="login-header">
          <div class="logo">
            <ion-icon :icon="personOutline" class="logo-icon"></ion-icon>
          </div>
          <h1 class="title">MSLX 管理面板</h1>
          <p class="server-info">
            <ion-icon :icon="swapHorizontalOutline"></ion-icon>
            已连接: {{ currentServerName }}
          </p>
        </div>

        <ion-card class="login-card">
          <ion-card-content>
            <ion-item lines="none" class="input-item">
              <ion-label position="stacked">用户名</ion-label>
              <div class="input-wrapper">
                <ion-icon :icon="personOutline" class="input-icon"></ion-icon>
                <ion-input v-model="username" placeholder="请输入用户名" clear-input></ion-input>
              </div>
            </ion-item>

            <ion-item lines="none" class="input-item">
              <ion-label position="stacked">密码</ion-label>
              <div class="input-wrapper">
                <ion-icon :icon="lockClosedOutline" class="input-icon"></ion-icon>
                <ion-input v-model="password" type="password" placeholder="请输入密码" clear-input @keyup.enter="handleLogin"></ion-input>
              </div>
            </ion-item>

            <div v-if="errorMessage" class="error-message">
              <ion-text color="danger">{{ errorMessage }}</ion-text>
            </div>

            <ion-button expand="block" class="login-button" @click="handleLogin" :disabled="isLoading">
              <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
              <template v-else>
                <ion-icon :icon="logInOutline" slot="start"></ion-icon>
                登录
              </template>
            </ion-button>

            <div class="divider">
              <span>或</span>
            </div>

            <ion-button expand="block" fill="outline" class="oauth-button">
              <ion-icon :icon="personOutline" slot="start"></ion-icon>
              MSL 账号登录
            </ion-button>
          </ion-card-content>
        </ion-card>

        <ion-button fill="clear" class="switch-button" @click="switchServer">
          <ion-icon :icon="swapHorizontalOutline" slot="start"></ion-icon>
          切换服务器
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100% - 56px);
  padding: 24px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background-color: var(--ion-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.logo-icon {
  font-size: 40px;
  color: white;
}

.title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--ion-text-color);
}

.server-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  color: var(--ion-text-color-secondary);
  margin: 0;
}

.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 16px;
}

.input-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 16px;
}

.input-item ion-label {
  font-weight: 500;
  font-size: 14px;
  color: var(--ion-text-color);
  margin-bottom: 8px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background-color: var(--ion-card-background);
  border-radius: 12px;
  padding: 0 12px;
  margin-top: 8px;
}

.input-icon {
  font-size: 20px;
  color: var(--ion-text-color-secondary);
  margin-right: 8px;
}

.input-wrapper ion-input {
  --padding-start: 0;
  --padding-end: 0;
  flex: 1;
}

.error-message {
  text-align: center;
  margin-bottom: 16px;
  padding: 8px;
  background-color: rgba(244, 67, 54, 0.1);
  border-radius: 8px;
}

.login-button {
  --border-radius: 12px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 8px;
}

.divider {
  display: flex;
  align-items: center;
  margin: 24px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: var(--ion-border-color);
}

.divider span {
  padding: 0 16px;
  color: var(--ion-text-color-secondary);
  font-size: 13px;
}

.oauth-button {
  --border-radius: 12px;
  height: 48px;
  font-size: 16px;
}

.switch-button {
  margin-top: 24px;
}
</style>
