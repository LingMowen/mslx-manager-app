import { createRouter, createWebHistory } from '@ionic/vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { storage } from '@/utils/storage'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/connection',
  },
  {
    path: '/connection',
    name: 'Connection',
    component: () => import('@/views/connection/ConnectionListPage.vue'),
    meta: { requiresServer: false },
  },
  {
    path: '/connection/add',
    name: 'AddConnection',
    component: () => import('@/views/connection/AddConnectionPage.vue'),
    meta: { requiresServer: false },
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/HomePage.vue'),
    meta: { requiresServer: true },
  },
  {
    path: '/instances',
    name: 'Instances',
    component: () => import('@/views/instances/InstanceListPage.vue'),
    meta: { requiresServer: true },
  },
  {
    path: '/instances/create',
    name: 'CreateInstance',
    component: () => import('@/views/instances/InstanceCreatePage.vue'),
    meta: { requiresServer: true },
  },
  {
    path: '/instances/:id',
    name: 'InstanceDetail',
    component: () => import('@/views/instances/InstanceDetailPage.vue'),
    meta: { requiresServer: true },
  },
  {
    path: '/instances/:id/settings',
    name: 'InstanceSettings',
    component: () => import('@/views/instances/InstanceSettingsPage.vue'),
    meta: { requiresServer: true },
  },
  {
    path: '/instances/:id/console',
    name: 'Console',
    component: () => import('@/views/console/ConsolePage.vue'),
    meta: { requiresServer: true },
  },
  {
    path: '/instances/:id/players',
    name: 'Players',
    component: () => import('@/views/players/PlayerListPage.vue'),
    meta: { requiresServer: true },
  },
  {
    path: '/instances/:id/files',
    name: 'Files',
    component: () => import('@/views/files/FileListPage.vue'),
    meta: { requiresServer: true },
  },
  {
    path: '/instances/:id/backups',
    name: 'Backups',
    component: () => import('@/views/backups/BackupListPage.vue'),
    meta: { requiresServer: true },
  },
  {
    path: '/instances/:id/tasks',
    name: 'Tasks',
    component: () => import('@/views/tasks/TaskListPage.vue'),
    meta: { requiresServer: true },
  },
  {
    path: '/frp',
    name: 'Frp',
    component: () => import('@/views/frp/FrpListPage.vue'),
    meta: { requiresServer: true },
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/views/users/UserListPage.vue'),
    meta: { requiresServer: true },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/settings/SettingsPage.vue'),
    meta: { requiresServer: true },
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/about/AboutPage.vue'),
    meta: { requiresServer: false },
  },
  {
    path: '/instances/:id/map',
    name: 'Map',
    component: () => import('@/views/map/MapPage.vue'),
    meta: { requiresServer: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const currentServer = storage.get<any>('currentServer')
  const hasServer = !!currentServer

  // 需要服务器但未选择服务器，跳转到连接页面
  if (to.meta.requiresServer && !hasServer) {
    next('/connection')
    return
  }

  next()
})

export default router
