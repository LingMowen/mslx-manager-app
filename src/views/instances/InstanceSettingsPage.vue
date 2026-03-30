<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonBackButton, IonButtons, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonSpinner, IonCard, IonCardContent, IonToggle, IonSelect, IonSelectOption, IonNote } from '@ionic/vue'
import { saveOutline, refreshOutline, chevronBackOutline } from 'ionicons/icons'
import { useInstanceStore } from '@/stores/instance'
import { getJavaList } from '@/api/instance'

const route = useRoute()
const router = useRouter()
const instanceStore = useInstanceStore()

const instanceId = computed(() => Number(route.params.id))
const isLoading = ref(false)
const isSaving = ref(false)
const javaList = ref<any[]>([])

const name = ref('')
const java = ref('')
const minMemory = ref(1024)
const maxMemory = ref(4096)
const args = ref('')
const autoRestart = ref(false)
const runOnStartup = ref(false)

onMounted(async () => {
  isLoading.value = true
  try {
    await instanceStore.loadInstanceSettings(instanceId.value)
    const settings = instanceStore.currentSettings
    if (settings) {
      name.value = settings.name
      java.value = settings.java
      minMemory.value = settings.minM
      maxMemory.value = settings.maxM
      args.value = settings.args
      autoRestart.value = settings.autoRestart
      runOnStartup.value = settings.runOnStartup
    }

    const response = await getJavaList()
    if (response.code === 200) {
      javaList.value = response.data
    }
  } finally {
    isLoading.value = false
  }
})

async function saveSettings() {
  isSaving.value = true
  try {
    const result = await instanceStore.saveInstanceSettings(instanceId.value, {
      name: name.value,
      java: java.value,
      minM: minMemory.value,
      maxM: maxMemory.value,
      args: args.value,
      autoRestart: autoRestart.value,
      runOnStartup: runOnStartup.value,
    })
    if (result.success) {
      alert('保存成功')
    } else {
      alert(result.message)
    }
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
        <h1 class="app-header-center-title">服务器设置</h1>
      </div>
      <button class="app-header-icon-button" @click="saveSettings" :disabled="isSaving">
        <ion-spinner v-if="isSaving" name="crescent"></ion-spinner>
        <ion-icon v-else :icon="saveOutline"></ion-icon>
      </button>
    </div>
    <ion-content class="ion-padding">
      <div v-if="isLoading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <template v-else>
        <ion-card>
          <ion-card-content>
            <ion-item lines="full">
              <ion-label position="stacked">服务器名称</ion-label>
              <ion-input v-model="name" placeholder="服务器名称"></ion-input>
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
              <ion-label position="stacked">最小内存 (MB)</ion-label>
              <ion-input v-model="minMemory" type="number" placeholder="1024"></ion-input>
            </ion-item>

            <ion-item lines="full">
              <ion-label position="stacked">最大内存 (MB)</ion-label>
              <ion-input v-model="maxMemory" type="number" placeholder="4096"></ion-input>
            </ion-item>

            <ion-item lines="full">
              <ion-label position="stacked">启动参数</ion-label>
              <ion-input v-model="args" placeholder="额外启动参数"></ion-input>
              <ion-note slot="helper">额外的 JVM 启动参数</ion-note>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-content>
            <ion-item lines="none">
              <ion-label>
                <h3>自动重启</h3>
                <p>服务器崩溃时自动重启</p>
              </ion-label>
              <ion-toggle v-model="autoRestart" slot="end"></ion-toggle>
            </ion-item>

            <ion-item lines="none">
              <ion-label>
                <h3>开机启动</h3>
                <p>守护进程启动时自动启动服务器</p>
              </ion-label>
              <ion-toggle v-model="runOnStartup" slot="end"></ion-toggle>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <ion-button expand="block" class="save-button" @click="saveSettings" :disabled="isSaving">
          <ion-spinner v-if="isSaving" name="crescent"></ion-spinner>
          <template v-else>
            <ion-icon :icon="saveOutline" slot="start"></ion-icon>
            保存设置
          </template>
        </ion-button>
      </template>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
}

ion-label {
  font-weight: 500;
}

.save-button {
  margin: 16px;
  --border-radius: 12px;
  height: 48px;
}
</style>
