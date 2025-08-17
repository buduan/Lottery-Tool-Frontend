import { defineStore } from 'pinia';
import { authApi } from '@/api';

// 用户信息接口
interface UserInfo {
  id?: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
}

interface UserState {
  token: string | null;
  userInfo: UserInfo | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: null,
    userInfo: null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token && !!state.userInfo,
    isAdmin: (state) => state.userInfo?.role === 'admin' || state.userInfo?.role === 'super_admin',
    isSuperAdmin: (state) => state.userInfo?.role === 'super_admin',
  },
  actions: {
    setToken(token: string) {
      this.token = token;
      localStorage.setItem('token', token);
    },
    clearToken() {
      this.token = null;
      this.userInfo = null;
      localStorage.removeItem('token');
    },
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo;
    },
    clearUserInfo() {
      this.userInfo = null;
    },
    // 获取用户信息
    async fetchUserInfo() {
      try {
        if (!this.token) {
          throw new Error('No token available');
        }
        const response = await authApi.me();
        this.setUserInfo({
          id: response.user.id.toString(),
          username: response.user.username,
          email: response.user.email,
          role: response.user.role,
          avatar: '',
        });
        return response.user;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch user info:', error);
        this.clearToken();
        throw error;
      }
    },
    // 检查 JWT token 是否有效
    checkToken(): boolean {
      if (!this.token) {
        return false;
      }

      try {
        // 解析 JWT token
        const payload = this.parseJWTPayload(this.token);
        
        // 检查 token 是否过期
        if (payload.exp && Date.now() >= payload.exp * 1000) {
          this.clearToken();
          return false;
        }

        return true;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Invalid token format:', error);
        this.clearToken();
        return false;
      }
    },
    // 解析 JWT payload
    parseJWTPayload(token: string) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
      } catch {
        throw new Error('Invalid JWT format');
      }
    },
    // 初始化用户状态
    async initializeAuth() {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        this.token = storedToken;
        if (this.checkToken()) {
          try {
            await this.fetchUserInfo();
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Failed to initialize auth:', error);
            this.clearToken();
          }
        }
      }
    },
    // 登出
    logout() {
      this.clearToken();
      // 可以在这里添加重定向到登录页的逻辑
    },
  },
  persist: true,
});