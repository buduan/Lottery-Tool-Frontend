import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { API, clearAuthToken, getAuthToken } from '@/api';
import type { User, LoginRequest } from '@/types/api';

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string>('');

  // 计算属性
  const isLoggedIn = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isSuperAdmin = computed(() => user.value?.role === 'super_admin');
  const hasAdminAccess = computed(() => isAdmin.value || isSuperAdmin.value);

  // 获取用户信息
  const fetchUser = async () => {
    try {
      loading.value = true;
      error.value = '';
      
      const result = await API.auth.me();
      user.value = result.user;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取用户信息失败';
      user.value = null;
      clearAuthToken();
    } finally {
      loading.value = false;
    }
  };

  // 用户登录
  const loginUser = async (credentials: LoginRequest) => {
    try {
      loading.value = true;
      error.value = '';
      
      const result = await API.auth.login(credentials);
      user.value = result.user;
      
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '登录失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 用户登出
  const logoutUser = async () => {
    try {
      loading.value = true;
      await API.auth.logout();
    } catch (err) {
      // 即使登出失败，也要清除本地状态
      // eslint-disable-next-line no-console
      console.error('登出失败:', err);
    } finally {
      user.value = null;
      clearAuthToken();
      loading.value = false;
    }
  };

  // 初始化用户状态
  const initializeAuth = async () => {
    const token = getAuthToken();
    if (token) {
      // 尝试获取用户信息
      await fetchUser();
    }
  };

  // 清除错误
  const clearError = () => {
    error.value = '';
  };

  // 更新用户信息
  const updateUser = (userData: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userData };
    }
  };

  return {
    // 状态
    user,
    loading,
    error,
    
    // 计算属性
    isLoggedIn,
    isAdmin,
    isSuperAdmin,
    hasAdminAccess,
    
    // 方法
    fetchUser,
    loginUser,
    logoutUser,
    initializeAuth,
    clearError,
    updateUser,
  };
}, {
  persist: {
    key: 'user-store',
    paths: ['user'],
  },
});