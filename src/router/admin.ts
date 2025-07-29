import type { RouteRecordRaw } from 'vue-router'

// 管理员路由配置
const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/admin/Dashboard.vue'),
        meta: {
          title: 'Dashboard'
        }
      }

    ]
  }
]

export default adminRoutes