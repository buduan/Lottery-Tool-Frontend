import type { RouteRecordRaw } from 'vue-router';

// 管理员路由配置
const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: {
      requiresAuth: true,
      breadcrumb: [
        { name: '首页', path: '/' },
        { name: '管理后台', path: '/admin' },
      ],
    },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/admin/Dashboard.vue'),
        meta: {
          title: 'Dashboard',
          breadcrumb: [
            { name: '首页', path: '/' },
            { name: '管理后台', path: '/admin' },
            { name: '仪表盘', path: '/admin' },
          ],
        },
      },
    ],
  },
];

export default adminRoutes;
