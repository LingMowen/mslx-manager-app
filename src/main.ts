import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { IonicVue } from '@ionic/vue'
import App from './App.vue'
import router from './router'
import './theme/variables.css'
import './theme/neumorphism.css'
import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

// 加载保存的主题设置
const savedDarkMode = localStorage.getItem('darkMode')
if (savedDarkMode === 'true') {
  document.body.classList.add('dark')
} else if (savedDarkMode === 'false') {
  document.body.classList.remove('dark')
} else {
  // 如果没有保存的设置，检测系统偏好
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (prefersDark) {
    document.body.classList.add('dark')
    localStorage.setItem('darkMode', 'true')
  }
}

const app = createApp(App)

app.use(createPinia())
app.use(IonicVue)
app.use(router)

router.isReady().then(() => {
  app.mount('#app')
})
