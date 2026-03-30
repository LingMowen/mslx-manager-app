<script setup lang="ts">
import { ref, computed } from 'vue'
import { IonActionSheet, IonIcon } from '@ionic/vue'
import { chevronDownOutline, checkmarkOutline } from 'ionicons/icons'

interface SelectOption {
  label: string
  value: string
  description?: string
}

const props = defineProps<{
  modelValue: string
  options: SelectOption[]
  label?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)

const selectedLabel = computed(() => {
  const option = props.options.find(opt => opt.value === props.modelValue)
  return option?.label || props.placeholder || '请选择'
})

const actionSheetButtons = computed(() => {
  return props.options.map(option => ({
    text: option.label,
    data: { value: option.value },
    cssClass: option.value === props.modelValue ? 'action-sheet-selected' : '',
    icon: option.value === props.modelValue ? checkmarkOutline : undefined
  }))
})

function openSelect() {
  isOpen.value = true
}

function handleActionSheetDismiss(event: any) {
  isOpen.value = false
  const selected = event.detail.data
  if (selected && selected.value !== undefined) {
    emit('update:modelValue', selected.value)
  }
}
</script>

<template>
  <div class="material-select">
    <label v-if="label" class="select-label">{{ label }}</label>
    <button class="select-trigger" @click="openSelect">
      <span class="select-value">{{ selectedLabel }}</span>
      <ion-icon :icon="chevronDownOutline" class="select-icon"></ion-icon>
    </button>
    
    <ion-action-sheet
      :is-open="isOpen"
      :header="label || '请选择'"
      :buttons="actionSheetButtons"
      @didDismiss="handleActionSheetDismiss"
      class="material-action-sheet"
    ></ion-action-sheet>
  </div>
</template>

<style scoped>
.material-select {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.select-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--ion-text-color-secondary);
  letter-spacing: 0.25px;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--ion-color-surface-container);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
  width: 100%;
  text-align: left;
}

.select-trigger:active {
  background: var(--ion-color-surface-container-high);
}

.select-value {
  font-size: 16px;
  color: var(--ion-text-color);
  font-weight: 400;
}

.select-icon {
  font-size: 20px;
  color: var(--ion-text-color-secondary);
  transition: transform 0.2s ease;
}

.select-trigger:active .select-icon {
  transform: rotate(180deg);
}
</style>
