<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonBackButton, IonButtons, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonSpinner, IonText, IonCard, IonCardContent, IonNote } from '@ionic/vue'
import { saveOutline, cloudUploadOutline, checkmarkCircleOutline, closeCircleOutline, keyOutline, linkOutline, serverOutline, chevronBackOutline } from 'ionicons/icons'
import { useConnectionStore } from '@/stores/connection'

const router = useRouter()
const connectionStore = useConnectionStore()

const name = ref('')
const url = ref('')
const apiKey = ref('')
const isTesting = ref(false)
const testResult = ref<{ success: boolean; message: string } | null>(null)
const isSaving = ref(false)

// 验证 URL 格式
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    // 只允许 http 和 https 协议
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

// 格式化 URL（确保有协议前缀）
function formatUrl(urlString: string): string {
  let formatted = urlString.trim()
  // 如果没有协议前缀，默认添加 http://
  if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
    formatted = 'http://' + formatted
  }
  return formatted
}

async function testConnection() {
  // 验证必填字段
  if (!url.value || !apiKey.value) {
    testResult.value = { success: false, message: '请填写面板地址和 API 密钥' }
    return
  }

  // 格式化并验证 URL
  const formattedUrl = formatUrl(url.value)
  url.value = formattedUrl

  if (!isValidUrl(formattedUrl)) {
    testResult.value = { success: false, message: '面板地址格式不正确，请输入有效的 URL（例如：http://192.168.1.1:11027）' }
    return
  }

  isTesting.value = true
  testResult.value = null

  try {
    // 先测试网络连通性
    testResult.value = { success: true, message: '正在检测服务器...' }

    // 执行 API 连接测试
    const result = await connectionStore.testConnection(formattedUrl, apiKey.value)
    testResult.value = result
  } finally {
    isTesting.value = false
  }
}

async function saveAndConnect() {
  // 验证必填字段
  if (!name.value || !url.value || !apiKey.value) {
    testResult.value = { success: false, message: '请填写所有必填字段' }
    return
  }

  // 格式化并验证 URL
  const formattedUrl = formatUrl(url.value)
  url.value = formattedUrl

  if (!isValidUrl(formattedUrl)) {
    testResult.value = { success: false, message: '面板地址格式不正确，请输入有效的 URL（例如：http://192.168.1.1:11027）' }
    return
  }

  isSaving.value = true
  testResult.value = { success: true, message: '正在保存并连接...' }

  try {
    // 先测试连接是否成功
    const testResult_conn = await connectionStore.testConnection(formattedUrl, apiKey.value)
    if (!testResult_conn.success) {
      testResult.value = { success: false, message: '连接失败：' + testResult_conn.message }
      isSaving.value = false
      return
    }

    // 保存服务器
    const server = await connectionStore.addServer({
      name: name.value,
      url: formattedUrl,
      apiKey: apiKey.value,
    })

    await connectionStore.selectServer(server)
    router.push('/home')
  } catch (error: any) {
    testResult.value = { success: false, message: error.message || '保存失败' }
  } finally {
    isSaving.value = false
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
        <h1 class="app-header-center-title">添加服务器</h1>
      </div>
      <div style="width: 48px;"></div>
    </div>
    <ion-content>
      <div class="content-wrapper">
        <div class="header-section">
          <h1 class="page-headline">添加服务器</h1>
          <p class="page-supporting">输入服务器信息以连接到 MSLX 面板</p>
        </div>

        <div class="form-section">
          <div class="input-group">
            <div class="input-label">
              <ion-icon :icon="serverOutline"></ion-icon>
              <span>服务器名称</span>
            </div>
            <div class="input-field">
              <ion-input v-model="name" placeholder="例如：我的服务器" class="material-input"></ion-input>
            </div>
            <p class="input-hint">为这个服务器设置一个易于识别的名称</p>
          </div>

          <div class="input-group">
            <div class="input-label">
              <ion-icon :icon="linkOutline"></ion-icon>
              <span>面板地址</span>
            </div>
            <div class="input-field">
              <ion-input v-model="url" placeholder="http://ip:port" class="material-input"></ion-input>
            </div>
            <p class="input-hint">面板的完整地址，包含端口号</p>
          </div>

          <div class="input-group">
            <div class="input-label">
              <ion-icon :icon="keyOutline"></ion-icon>
              <span>API 密钥</span>
            </div>
            <div class="input-field">
              <ion-input v-model="apiKey" placeholder="输入 API 密钥" type="password" class="material-input"></ion-input>
            </div>
            <p class="input-hint">在面板设置中获取 API 密钥</p>
          </div>
        </div>

        <div v-if="testResult" class="test-result" :class="{ success: testResult.success, error: !testResult.success }">
          <ion-icon :icon="testResult.success ? checkmarkCircleOutline : closeCircleOutline"></ion-icon>
          <span>{{ testResult.message }}</span>
        </div>

        <div class="form-actions">
          <ion-button expand="block" fill="outline" @click="testConnection" :disabled="isTesting" class="test-button">
            <ion-icon :icon="cloudUploadOutline" slot="start"></ion-icon>
            <ion-spinner v-if="isTesting" name="circular"></ion-spinner>
            <span v-else>测试连接</span>
          </ion-button>

          <ion-button expand="block" @click="saveAndConnect" :disabled="isSaving" class="save-button">
            <ion-icon :icon="saveOutline" slot="start"></ion-icon>
            <ion-spinner v-if="isSaving" name="circular"></ion-spinner>
            <span v-else>保存并连接</span>
          </ion-button>
        </div>

        <ion-card class="help-card">
          <ion-card-content>
            <h4 class="help-title">如何获取 API 密钥？</h4>
            <ol class="help-list">
              <li>登录 MSLX 面板</li>
              <li>进入「设置」页面</li>
              <li>找到「API 密钥」选项</li>
              <li>复制密钥到上方输入框</li>
            </ol>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.content-wrapper {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 32px;
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

.form-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 24px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: var(--ion-text-color);
}

.input-label ion-icon {
  font-size: 20px;
  color: var(--ion-color-primary);
}

.input-field {
  background: var(--ion-color-surface-container);
  border-radius: 12px;
  overflow: hidden;
}

.material-input {
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  --background: transparent;
  --color: var(--ion-text-color);
  --placeholder-color: var(--ion-text-color-secondary);
  font-size: 16px;
}

.input-hint {
  font-size: 12px;
  color: var(--ion-text-color-secondary);
  margin: 0;
  padding-left: 4px;
}

.test-result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 24px;
  font-size: 14px;
}

.test-result.success {
  background: var(--ion-color-success-container);
  color: var(--ion-color-success);
}

.test-result.error {
  background: var(--ion-color-danger-container);
  color: var(--ion-color-danger);
}

.test-result ion-icon {
  font-size: 24px;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.test-button {
  --background: var(--ion-color-surface-container-high);
  --color: var(--ion-text-color);
  --border-radius: 6px;
}

.save-button {
  --background: var(--ion-color-primary-container);
  --color: var(--ion-color-on-primary-container);
  --border-radius: 6px;
}

.help-card {
  margin: 0;
  background: var(--ion-color-surface-container);
}

.help-card ion-card-content {
  padding: 20px;
}

.help-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--ion-text-color);
  margin: 0 0 12px 0;
}

.help-list {
  margin: 0;
  padding-left: 20px;
  font-size: 14px;
  color: var(--ion-text-color-secondary);
  line-height: 2;
}
</style>
