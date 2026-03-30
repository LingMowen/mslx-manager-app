<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonBackButton, IonButtons, IonSpinner, IonIcon } from '@ionic/vue'
import { mapOutline, chevronBackOutline } from 'ionicons/icons'
import { getSpawnPoint } from '@/api/map'

const route = useRoute()
const router = useRouter()

const instanceId = computed(() => Number(route.params.id))
const isLoading = ref(true)
const spawnPoint = ref({ x: 0, z: 0 })

onMounted(async () => {
  await loadMap()
})

async function loadMap() {
  try {
    const response = await getSpawnPoint(instanceId.value)
    if (response.code === 200) {
      spawnPoint.value = response.data
    }
  } catch (error) {
    console.error('Failed to load map:', error)
  } finally {
    isLoading.value = false
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
        <h1 class="app-header-center-title">世界地图</h1>
      </div>
      <div style="width: 48px;"></div>
    </div>
    <ion-content>
      <div v-if="isLoading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <div v-else class="map-container">
        <div class="map-info">
          <p>出生点: X={{ spawnPoint.x }}, Z={{ spawnPoint.z }}</p>
        </div>
        <div class="map-placeholder">
          <ion-icon :icon="mapOutline" class="map-icon"></ion-icon>
          <p>地图渲染功能开发中</p>
          <p class="hint">将支持瓦片地图浏览</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.map-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.map-info {
  padding: 12px 16px;
  background: var(--ion-card-background);
  font-size: 14px;
  color: var(--ion-text-color-secondary);
}

.map-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--ion-card-background);
  margin: 16px;
  border-radius: 12px;
}

.map-icon {
  font-size: 64px;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

.map-placeholder p {
  margin: 4px 0;
  color: var(--ion-text-color-secondary);
}

.map-placeholder .hint {
  font-size: 12px;
  color: var(--ion-color-medium);
}
</style>
