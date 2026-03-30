<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonBackButton, IonButtons, IonSegment, IonSegmentButton, IonLabel, IonList, IonItem, IonIcon, IonButton, IonSpinner, IonRefresher, IonRefresherContent, IonFab, IonFabButton, IonInput, IonAlert, IonCard, IonCardContent } from '@ionic/vue'
import { addOutline, trashOutline, personOutline, peopleOutline, shieldCheckmarkOutline, banOutline, refreshOutline, chevronForwardOutline, chevronBackOutline } from 'ionicons/icons'
import { getOnlinePlayers, getWhitelist, addWhitelist, removeWhitelist, getAdmins, addAdmin, removeAdmin, getBannedPlayers, banPlayer, unbanPlayer } from '@/api/player'
import type { Player } from '@/types'

const route = useRoute()
const router = useRouter()

const instanceId = computed(() => Number(route.params.id))
const selectedTab = ref('online')
const isLoading = ref(false)
const players = ref<string[]>([])
const whitelist = ref<Player[]>([])
const admins = ref<Player[]>([])
const banned = ref<Player[]>([])
const showAddAlert = ref(false)
const newPlayerName = ref('')

onMounted(async () => {
  await loadData()
})

async function loadData() {
  isLoading.value = true
  try {
    await loadOnlinePlayers()
  } finally {
    isLoading.value = false
  }
}

async function handleRefresh(event: any) {
  await loadData()
  event.target.complete()
}

async function loadOnlinePlayers() {
  const response = await getOnlinePlayers(instanceId.value)
  if (response.code === 200) {
    players.value = response.data
  }
}

async function loadWhitelist() {
  const response = await getWhitelist(instanceId.value)
  if (response.code === 200) {
    whitelist.value = response.data
  }
}

async function loadAdmins() {
  const response = await getAdmins(instanceId.value)
  if (response.code === 200) {
    admins.value = response.data
  }
}

async function loadBanned() {
  const response = await getBannedPlayers(instanceId.value)
  if (response.code === 200) {
    banned.value = response.data
  }
}

async function handleTabChange() {
  isLoading.value = true
  try {
    switch (selectedTab.value) {
      case 'online':
        await loadOnlinePlayers()
        break
      case 'whitelist':
        await loadWhitelist()
        break
      case 'admins':
        await loadAdmins()
        break
      case 'banned':
        await loadBanned()
        break
    }
  } finally {
    isLoading.value = false
  }
}

async function addToWhitelist(name: string) {
  const response = await addWhitelist(instanceId.value, name)
  if (response.code === 200) {
    await loadWhitelist()
  }
}

async function removeFromWhitelist(name: string) {
  const response = await removeWhitelist(instanceId.value, name)
  if (response.code === 200) {
    await loadWhitelist()
  }
}

async function addToAdmins(name: string) {
  const response = await addAdmin(instanceId.value, name)
  if (response.code === 200) {
    await loadAdmins()
  }
}

async function removeFromAdmins(name: string) {
  const response = await removeAdmin(instanceId.value, name)
  if (response.code === 200) {
    await loadAdmins()
  }
}

async function banPlayerByName(name: string) {
  const response = await banPlayer(instanceId.value, name)
  if (response.code === 200) {
    await loadBanned()
  }
}

async function unbanPlayerByName(name: string) {
  const response = await unbanPlayer(instanceId.value, name)
  if (response.code === 200) {
    await loadBanned()
  }
}

async function handleAddPlayer() {
  if (!newPlayerName.value.trim()) return
  
  switch (selectedTab.value) {
    case 'whitelist':
      await addToWhitelist(newPlayerName.value)
      break
    case 'admins':
      await addToAdmins(newPlayerName.value)
      break
    case 'banned':
      await banPlayerByName(newPlayerName.value)
      break
  }
  
  newPlayerName.value = ''
  showAddAlert.value = false
}
</script>

<template>
  <ion-page>
    <div class="app-header">
      <button class="app-header-back-button" @click="router.back()">
        <ion-icon :icon="chevronBackOutline"></ion-icon>
      </button>
      <div class="app-header-center">
        <h1 class="app-header-center-title">玩家管理</h1>
      </div>
      <div style="width: 48px;"></div>
    </div>
    <ion-content>
      <div class="content-wrapper">
        <ion-segment v-model="selectedTab" @ionChange="handleTabChange" class="player-segment">
          <ion-segment-button value="online">
            <ion-label>在线</ion-label>
          </ion-segment-button>
          <ion-segment-button value="whitelist">
            <ion-label>白名单</ion-label>
          </ion-segment-button>
          <ion-segment-button value="admins">
            <ion-label>管理员</ion-label>
          </ion-segment-button>
          <ion-segment-button value="banned">
            <ion-label>封禁</ion-label>
          </ion-segment-button>
        </ion-segment>

        <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
          <ion-refresher-content></ion-refresher-content>
        </ion-refresher>

        <div v-if="isLoading" class="loading-container">
          <ion-spinner name="circular"></ion-spinner>
          <p class="loading-text">加载中...</p>
        </div>

        <div v-else class="player-list">
          <template v-if="selectedTab === 'online'">
            <ion-card v-for="player in players" :key="player" class="player-card">
              <ion-card-content>
                <div class="player-content">
                  <div class="player-avatar online">
                    <ion-icon :icon="personOutline"></ion-icon>
                  </div>
                  <div class="player-info">
                    <span class="player-name">{{ player }}</span>
                    <span class="player-status">在线</span>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
            <div v-if="players.length === 0" class="empty-state">
              <div class="empty-icon-wrapper">
                <ion-icon :icon="peopleOutline" class="empty-icon"></ion-icon>
              </div>
              <p class="empty-text">暂无在线玩家</p>
            </div>
          </template>

          <template v-else-if="selectedTab === 'whitelist'">
            <ion-card v-for="player in whitelist" :key="player.uuid || player.name" class="player-card">
              <ion-card-content>
                <div class="player-content">
                  <div class="player-avatar whitelist">
                    <ion-icon :icon="peopleOutline"></ion-icon>
                  </div>
                  <div class="player-info">
                    <span class="player-name">{{ player.name }}</span>
                    <span class="player-status">白名单</span>
                  </div>
                  <ion-button fill="clear" color="danger" class="remove-button" @click="removeFromWhitelist(player.name)">
                    <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
                  </ion-button>
                </div>
              </ion-card-content>
            </ion-card>
            <div v-if="whitelist.length === 0" class="empty-state">
              <div class="empty-icon-wrapper">
                <ion-icon :icon="peopleOutline" class="empty-icon"></ion-icon>
              </div>
              <p class="empty-text">暂无白名单玩家</p>
            </div>
          </template>

          <template v-else-if="selectedTab === 'admins'">
            <ion-card v-for="player in admins" :key="player.uuid || player.name" class="player-card">
              <ion-card-content>
                <div class="player-content">
                  <div class="player-avatar admin">
                    <ion-icon :icon="shieldCheckmarkOutline"></ion-icon>
                  </div>
                  <div class="player-info">
                    <span class="player-name">{{ player.name }}</span>
                    <span class="player-status">管理员</span>
                  </div>
                  <ion-button fill="clear" color="danger" class="remove-button" @click="removeFromAdmins(player.name)">
                    <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
                  </ion-button>
                </div>
              </ion-card-content>
            </ion-card>
            <div v-if="admins.length === 0" class="empty-state">
              <div class="empty-icon-wrapper">
                <ion-icon :icon="shieldCheckmarkOutline" class="empty-icon"></ion-icon>
              </div>
              <p class="empty-text">暂无管理员</p>
            </div>
          </template>

          <template v-else-if="selectedTab === 'banned'">
            <ion-card v-for="player in banned" :key="player.uuid || player.name" class="player-card">
              <ion-card-content>
                <div class="player-content">
                  <div class="player-avatar banned">
                    <ion-icon :icon="banOutline"></ion-icon>
                  </div>
                  <div class="player-info">
                    <span class="player-name">{{ player.name }}</span>
                    <span class="player-status">已封禁</span>
                  </div>
                  <ion-button fill="outline" size="small" class="unban-button" @click="unbanPlayerByName(player.name)">
                    解封
                  </ion-button>
                </div>
              </ion-card-content>
            </ion-card>
            <div v-if="banned.length === 0" class="empty-state">
              <div class="empty-icon-wrapper">
                <ion-icon :icon="banOutline" class="empty-icon"></ion-icon>
              </div>
              <p class="empty-text">暂无封禁玩家</p>
            </div>
          </template>
        </div>
      </div>

      <ion-fab v-if="selectedTab !== 'online'" vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="showAddAlert = true">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <ion-alert
        :is-open="showAddAlert"
        header="添加玩家"
        :sub-header="selectedTab === 'whitelist' ? '添加到白名单' : selectedTab === 'admins' ? '添加管理员' : '封禁玩家'"
        :buttons="[
          { text: '取消', role: 'cancel' },
          { text: '确定', handler: handleAddPlayer }
        ]"
        :inputs="[
          { name: 'playerName', placeholder: '玩家名称', attributes: { value: newPlayerName } }
        ]"
        @didDismiss="showAddAlert = false"
        @willPresent="(e: any) => { const input = e.detail.inputs?.[0]; if (input) newPlayerName = input.value || '' }"
      ></ion-alert>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.content-wrapper {
  padding: 16px;
  padding-bottom: 88px;
}

.player-segment {
  margin-bottom: 16px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  gap: 16px;
}

.loading-text {
  font-size: 14px;
  color: var(--ion-text-color-secondary);
  margin: 0;
}

.player-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.player-card {
  margin: 0;
}

.player-card ion-card-content {
  padding: 12px 16px;
}

.player-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.player-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.player-avatar.online {
  background: var(--ion-color-success-container);
}

.player-avatar.online ion-icon {
  color: var(--ion-color-success);
}

.player-avatar.whitelist {
  background: var(--ion-color-primary-container);
}

.player-avatar.whitelist ion-icon {
  color: var(--ion-color-on-primary-container);
}

.player-avatar.admin {
  background: var(--ion-color-warning-container);
}

.player-avatar.admin ion-icon {
  color: var(--ion-color-warning);
}

.player-avatar.banned {
  background: var(--ion-color-danger-container);
}

.player-avatar.banned ion-icon {
  color: var(--ion-color-danger);
}

.player-avatar ion-icon {
  font-size: 20px;
}

.player-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.player-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--ion-text-color);
}

.player-status {
  font-size: 12px;
  color: var(--ion-text-color-secondary);
}

.remove-button {
  --padding-start: 8px;
  --padding-end: 8px;
}

.unban-button {
  --border-radius: 16px;
  height: 32px;
  font-size: 13px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
}

.empty-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background: var(--ion-color-surface-container);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-icon {
  font-size: 32px;
  color: var(--ion-text-color-secondary);
}

.empty-text {
  font-size: 14px;
  color: var(--ion-text-color-secondary);
  margin: 0;
}
</style>
