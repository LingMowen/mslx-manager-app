<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  duration?: number
}>()

const emit = defineEmits<{
  complete: []
}>()

const isVisible = ref(true)
const isAnimating = ref(false)

onMounted(() => {
  // 开始动画
  setTimeout(() => {
    isAnimating.value = true
  }, 100)

  // 动画完成后隐藏
  setTimeout(() => {
    isVisible.value = false
    emit('complete')
  }, props.duration || 2500)
})
</script>

<template>
  <Transition name="fade">
    <div v-if="isVisible" class="splash-screen">
      <div class="splash-content" :class="{ 'animating': isAnimating }">
        <div class="logo-wrapper">
          <div class="logo-icon">
            <svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="256" height="256" rx="48" fill="var(--ion-color-primary-container)"/>
              <path d="M128 48L48 128L128 208L208 128L128 48Z" fill="var(--ion-color-primary)"/>
              <circle cx="128" cy="128" r="32" fill="var(--ion-color-on-primary)"/>
            </svg>
          </div>
        </div>
        <div class="app-name">
          <span class="name-text">MSLX Manager</span>
        </div>
        <div class="app-tagline">
          <span class="tagline-text">Minecraft 服务器管理</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--ion-background-color);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.logo-wrapper {
  position: relative;
}

.logo-icon {
  width: 120px;
  height: 120px;
  border-radius: 28px;
  transform: scale(0.5);
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.logo-icon svg {
  width: 100%;
  height: 100%;
  border-radius: 28px;
}

.splash-content.animating .logo-icon {
  transform: scale(1);
  opacity: 1;
}

.app-name {
  overflow: hidden;
}

.name-text {
  display: block;
  font-size: 28px;
  font-weight: 600;
  color: var(--ion-text-color);
  letter-spacing: -0.5px;
  transform: translateY(100%);
  opacity: 0;
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition-delay: 0.4s;
}

.splash-content.animating .name-text {
  transform: translateY(0);
  opacity: 1;
}

.app-tagline {
  overflow: hidden;
}

.tagline-text {
  display: block;
  font-size: 14px;
  color: var(--ion-text-color-secondary);
  transform: translateY(100%);
  opacity: 0;
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition-delay: 0.6s;
}

.splash-content.animating .tagline-text {
  transform: translateY(0);
  opacity: 1;
}

/* 淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
