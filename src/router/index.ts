// 路由配置
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false, title: '登录' }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/views/LayoutView.vue'),
    meta: { requiresAuth: true },
    redirect: '/statistics',
    children: [
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/views/StatisticsView.vue'),
        meta: { requiresAuth: true, title: '统计分析' }
      },
      {
        path: 'scores',
        name: 'Scores',
        component: () => import('@/views/ScoresView.vue'),
        meta: { requiresAuth: true, title: '成绩管理' }
      },
      {
        path: 'import',
        name: 'Import',
        component: () => import('@/views/ImportView.vue'),
        meta: { requiresAuth: true, title: '数据导入' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/scores'
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 体测数据管理平台`
  } else {
    document.title = '体测数据管理平台'
  }

  // 判断是否需要认证
  if (to.meta.requiresAuth) {
    if (userStore.isAuthenticated) {
      next()
    } else {
      // 未认证,重定向到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  } else {
    // 已登录用户访问登录页,重定向到首页
    if (to.path === '/login' && userStore.isAuthenticated) {
      next({ path: '/' })
    } else {
      next()
    }
  }
})

export default router
