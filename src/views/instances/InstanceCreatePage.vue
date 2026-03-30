<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonBackButton, IonButtons, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonSpinner, IonText, IonCard, IonCardContent, IonSelect, IonSelectOption, IonToggle, IonNote, IonProgressBar } from '@ionic/vue'
import { saveOutline, cloudUploadOutline, folderOutline, chevronBackOutline } from 'ionicons/icons'
import { useInstanceStore } from '@/stores/instance'
import { getJavaList } from '@/api/instance'

const router = useRouter()
const instanceStore = useInstanceStore()

const name = ref('')
const path = ref('')
const java = ref('')
const core = ref('')
const minMemory = ref(1024)
const maxMemory = ref(4096)
const args = ref('')
const isSaving = ref(false)
const isLoading = ref(false)
const javaList = ref<any[]>([])
const uploadProgress = ref(0)
const isUploading = ref(false)

onMounted(async () => {
  isLoading.value = true
  try {
    const response = await getJavaList()
    if (response.code === 200) {
      javaList.value = response.data
      if (javaList.value.length > 0) {
        java.value = javaList.value[0].path || ''
      }
    }
  } finally {
    isLoading.value = false
  }
})

async function createInstance() {
  if (!name.value || !core.value) {
    alert('请填写服务器名称和核心文件')
    return
  }

  isSaving.value = true
  try {
    const result = await instanceStore.createNewInstance({
      name: name.value,
      path: path.value || undefined,
      java: java.value || undefined,
      core: core.value,
      minM: minMemory.value,
      maxM: maxMemory.value,
      args: args.value || undefined,
    })

    if (result.success) {
      router.push('/home')
    } else {
      alert(result.message)
    }
  } finally {
    isSaving.value = false
  }
}

function selectFolder() {
  alert('文件夹选择功能需要在桌面端实现')
}
</script>

<template>
  <ion-page>
    <div class="app-header">
      <button class="app-header-back-button" @click="router.back()">
        <ion-icon :icon="chevronBackOutline"></ion-icon>
      </button>
      <div class="app-header-center">
        <h1 class="app-header-center-title">创建服务器</h1>
      </div>
      <div style="width: 48px;"></div>
    </div>
    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-content>
          <ion-item lines="full">
            <ion-label position="stacked">服务器名称 *</ion-label>
            <ion-input v-model="name" placeholder="例如：生存服务器"></ion-input>
          </ion-item>

          <ion-item lines="full">
            <ion-label position="stacked">存储路径</ion-label>
            <div class="input-with-button">
              <ion-input v-model="path" placeholder="留空使用默认路径"></ion-input>
              <ion-button fill="clear" @click="selectFolder">
                <ion-icon :icon="folderOutline"></ion-icon>
              </ion-button>
            </div>
            <ion-note>服务器文件将存储在此目录</ion-note>
          </ion-item>

          <ion-item lines="full">
            <ion-label position="stacked">Java 版本</ion-label>
            <ion-select v-model="java" placeholder="选择 Java 版本" interface="action-sheet">
              <ion-select-option v-for="j in javaList" :key="j.path" :value="j.path">
                {{ j.name || j.path }}
              </ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item lines="full">
            <ion-label position="stacked">核心文件名 *</ion-label>
            <ion-input v-model="core" placeholder="例如：paper-1.21.1.jar"></ion-input>
            <ion-note>需要先上传核心文件到服务器</ion-note>
          </ion-item>

          <ion-item lines="full">
            <ion-label position="stacked">最小内存 (MB)</ion-label>
            <ion-input v-model="minMemory" type="number" placeholder="1024"></ion-input>
          </ion-item>

          <ion-item lines="full">
            <ion-label position="stacked">最大内存 (MB)</ion-label>
            <ion-input v-model="maxMemory" type="number" placeholder="4096"></ion-input>
          </ion-item>

          <ion-item lines="full">
            <ion-label position="stacked">额外启动参数</ion-label>
            <ion-input v-model="args" placeholder="可选"></ion-input>
          </ion-item>

          <ion-button expand="block" class="create-button" @click="createInstance" :disabled="isSaving">
            <ion-spinner v-if="isSaving" name="crescent"></ion-spinner>
            <template v-else>
              <ion-icon :icon="saveOutline" slot="start"></ion-icon>
              创建服务器
            </template>
          </ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<style scoped>
ion-card {
  margin: 0;
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 8px;
}

ion-label {
  font-weight: 500;
  font-size: 14px;
}

ion-input, ion-select {
  --padding-start: 12px;
  --padding-end: 12px;
  --background: var(--ion-card-background);
  --border-radius: 8px;
  margin-top: 8px;
}

.input-with-button {
  display: flex;
  align-items: center;
  width: 100%;
}

.input-with-button ion-input {
  flex: 1;
}

ion-note {
  font-size: 12px;
  color: var(--ion-text-color-secondary);
  margin-top: 4px;
}

.create-button {
  margin-top: 24px;
  --border-radius: 12px;
  height: 48px;
}
</style>
