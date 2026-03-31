<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonContent, IonPage, IonSpinner, IonIcon, IonButton } from '@ionic/vue'
import { chevronBackOutline, removeOutline, addOutline } from 'ionicons/icons'
import { getSpawnPoint, getTileBlob } from '@/api/map'
import { storage } from '@/utils/storage'

const route = useRoute()
const router = useRouter()

const instanceId = computed(() => Number(route.params.id))
const isLoading = ref(true)
const spawnPoint = ref({ x: 0, z: 0 })
const mapSize = 3
const halfSize = Math.floor(mapSize / 2)
const tileUrls = ref<Map<string, string>>(new Map())
const isMapLoading = ref(true)
const loadingTiles = ref<Set<string>>(new Set())
const requestDelay = 200
const scale = ref(1)
const minScale = 0.5
const maxScale = 3

const loadedTileCount = computed(() => tileUrls.value.size)
const totalTiles = computed(() => tileCoordinates.value.length)

const tileCoordinates = computed(() => {
  const coords: { x: number; z: number }[] = []
  for (let z = -halfSize; z <= halfSize; z++) {
    for (let x = -halfSize; x <= halfSize; x++) {
      coords.push({ x, z })
    }
  }
  return coords
})

onMounted(async () => {
  await loadMap()
})

async function loadMap() {
  try {
    const spawnResponse = await getSpawnPoint(instanceId.value)
    if (spawnResponse.code === 200) {
      spawnPoint.value = spawnResponse.data
    }
    await loadTiles()
  } catch (error: any) {
    console.error('Failed to load map:', error)
  } finally {
    isLoading.value = false
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function loadTiles() {
  isMapLoading.value = true

  for (let i = 0; i < tileCoordinates.value.length; i++) {
    const { x, z } = tileCoordinates.value[i]
    const key = `${x},${z}`
    loadingTiles.value.add(key)

    try {
      const blobUrl = await getTileBlob(instanceId.value, x, z)
      tileUrls.value.set(key, blobUrl)
      
      if (i < tileCoordinates.value.length - 1) {
        await delay(requestDelay)
      }
    } catch (error: any) {
      tileUrls.value.set(key, '')
    } finally {
      loadingTiles.value.delete(key)
    }
  }
  
  isMapLoading.value = false
}

function getTileUrl(x: number, z: number): string {
  const key = `${x},${z}`
  return tileUrls.value.get(key) || ''
}

function isTileLoading(x: number, z: number): boolean {
  const key = `${x},${z}`
  return loadingTiles.value.has(key) && !tileUrls.value.has(key)
}

function zoomIn() {
  if (scale.value < maxScale) {
    scale.value = Math.min(maxScale, scale.value + 0.25)
  }
}

function zoomOut() {
  if (scale.value > minScale) {
    scale.value = Math.max(minScale, scale.value - 0.25)
  }
}

function onSliderChange(event: Event) {
  const target = event.target as HTMLInputElement
  scale.value = parseFloat(target.value)
}

onUnmounted(() => {
  tileUrls.value.forEach(url => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  })
})
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
      <div class="map-container">
        <div class="map-info">
          <p>出生点: X={{ spawnPoint.x }}, Z={{ spawnPoint.z }}</p>
        </div>

        <div class="map-viewport">
          <div v-if="isMapLoading" class="map-loading">
            <ion-spinner name="crescent"></ion-spinner>
            <p>加载地图中... {{ loadedTileCount }}/{{ totalTiles }}</p>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${(loadedTileCount / totalTiles) * 100}%` }"></div>
            </div>
          </div>

          <div 
            class="tile-grid" 
            :style="{ 
              gridTemplateColumns: `repeat(${mapSize}, 256px)`,
              transform: `scale(${scale})`,
              transformOrigin: 'center center'
            }"
          >
            <div
              v-for="(coord, index) in tileCoordinates"
              :key="`${coord.x}-${coord.z}`"
              class="tile-wrapper"
            >
              <img
                v-if="getTileUrl(coord.x, coord.z)"
                :src="getTileUrl(coord.x, coord.z)"
                class="tile"
                loading="lazy"
              />
              <div v-else class="tile-placeholder">
                <ion-spinner v-if="isTileLoading(coord.x, coord.z)" name="crescent" class="tile-spinner"></ion-spinner>
                <span v-else class="tile-error">!</span>
              </div>
            </div>
          </div>

          <div class="zoom-control">
            <ion-button class="zoom-btn" @click="zoomOut" :disabled="scale <= minScale">
              <ion-icon :icon="removeOutline"></ion-icon>
            </ion-button>
            <input 
              type="range" 
              class="zoom-slider" 
              :min="minScale" 
              :max="maxScale" 
              step="0.1" 
              :value="scale"
              @input="onSliderChange"
            />
            <ion-button class="zoom-btn" @click="zoomIn" :disabled="scale >= maxScale">
              <ion-icon :icon="addOutline"></ion-icon>
            </ion-button>
            <span class="zoom-value">{{ Math.round(scale * 100) }}%</span>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
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
  flex-shrink: 0;
}

.map-viewport {
  flex: 1;
  overflow: auto;
  background: var(--ion-card-background);
  margin: 16px;
  border-radius: 12px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  scrollbar-width: thin;
  scrollbar-color: var(--ion-color-outline-variant) transparent;
}

.map-viewport::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.map-viewport::-webkit-scrollbar-track {
  background: transparent;
}

.map-viewport::-webkit-scrollbar-thumb {
  background: var(--ion-color-outline-variant);
  border-radius: 3px;
}

.map-viewport::-webkit-scrollbar-thumb:hover {
  background: var(--ion-color-outline);
}

.map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 10;
  background: rgba(var(--ion-background-color-rgb), 0.9);
  padding: 24px;
  border-radius: 12px;
}

.map-loading p {
  margin: 0;
  font-size: 14px;
  color: var(--ion-text-color);
}

.progress-bar {
  width: 200px;
  height: 8px;
  background: var(--ion-color-surface-container);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--ion-color-primary);
  transition: width 0.3s ease;
}

.tile-grid {
  display: grid;
  gap: 0;
  transition: transform 0.2s ease;
}

.tile-wrapper {
  width: 256px;
  height: 256px;
  overflow: hidden;
}

.tile {
  width: 256px;
  height: 256px;
  object-fit: cover;
}

.tile-placeholder {
  width: 256px;
  height: 256px;
  background: var(--ion-color-surface-container);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tile-spinner {
  width: 32px;
  height: 32px;
  color: var(--ion-color-primary);
}

.tile-error {
  font-size: 24px;
  color: var(--ion-color-medium);
}

.zoom-control {
  position: absolute;
  left: 16px;
  bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--ion-color-surface-container-high);
  padding: 8px 12px;
  border-radius: 24px;
  box-shadow: var(--md-sys-elevation-2);
}

.zoom-btn {
  --padding-start: 8px;
  --padding-end: 8px;
  width: 32px;
  height: 32px;
  --border-radius: 50%;
}

.zoom-slider {
  width: 120px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--ion-color-surface-variant);
  border-radius: 2px;
  outline: none;
}

.zoom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--ion-color-primary);
  border-radius: 50%;
  cursor: pointer;
}

.zoom-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: var(--ion-color-primary);
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.zoom-value {
  font-size: 12px;
  color: var(--ion-text-color-secondary);
  min-width: 40px;
  text-align: center;
}
</style>