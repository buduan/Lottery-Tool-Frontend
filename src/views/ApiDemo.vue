<template>
  <div class="container mx-auto px-4 py-8 space-y-8">
    <!-- 页面标题 -->
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold text-gray-900">抽奖系统API框架演示</h1>
      <p class="text-lg text-gray-600">展示与后台通信的表单组件和API调用</p>
    </div>

    <!-- 用户状态 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">用户状态</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <p class="text-sm text-gray-600">登录状态: 
            <span :class="isLoggedIn ? 'text-green-600' : 'text-red-600'">
              {{ isLoggedIn ? '已登录' : '未登录' }}
            </span>
          </p>
          <p v-if="user" class="text-sm text-gray-600">
            用户: {{ user.username }} ({{ user.role }})
          </p>
        </div>
        <div class="flex space-x-2">
          <Button v-if="!isLoggedIn" @click="showLoginForm = true">
            登录
          </Button>
          <Button v-if="isLoggedIn" @click="handleLogout" variant="outline">
            登出
          </Button>
        </div>
      </div>
    </div>

    <!-- 登录表单 -->
    <div v-if="showLoginForm && !isLoggedIn" class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">用户登录</h2>
      <form @submit.prevent="handleLogin" class="space-y-4 max-w-md">
        <div>
          <Label for="username">用户名</Label>
          <Input 
            id="username" 
            v-model="loginForm.username" 
            placeholder="请输入用户名"
            required
          />
        </div>
        <div>
          <Label for="password">密码</Label>
          <Input 
            id="password" 
            type="password" 
            v-model="loginForm.password" 
            placeholder="请输入密码"
            required
          />
        </div>
        <div class="flex space-x-2">
          <Button type="submit" :disabled="userStore.loading">
            <Loader2 v-if="userStore.loading" class="mr-2 h-4 w-4 animate-spin" />
            登录
          </Button>
          <Button type="button" variant="outline" @click="showLoginForm = false">
            取消
          </Button>
        </div>
        <p v-if="userStore.error" class="text-sm text-red-600">{{ userStore.error }}</p>
      </form>
    </div>

    <!-- 活动管理演示 -->
    <div  class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">活动管理</h2>
      <div class="space-y-4">
        <!-- 活动列表 -->
        <div>
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">活动列表</h3>
            <div class="flex space-x-2">
              <Button @click="refreshActivities" :disabled="activitiesLoading">
                <Loader2 v-if="activitiesLoading" class="mr-2 h-4 w-4 animate-spin" />
                刷新
              </Button>
              <Button @click="showActivityForm = true">
                新建活动
              </Button>
            </div>
          </div>
          
          <div v-if="activitiesLoading" class="text-center py-4">
            <Loader2 class="h-6 w-6 animate-spin mx-auto" />
            <p class="text-sm text-gray-600 mt-2">加载中...</p>
          </div>
          
          <div v-else-if="activities.length === 0" class="text-center py-8 text-gray-500">
            暂无活动数据
          </div>
          
          <div v-else class="grid gap-4">
            <div 
              v-for="activity in activities" 
              :key="activity.id"
              class="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-medium">{{ activity.name }}</h4>
                  <p class="text-sm text-gray-600">{{ activity.description }}</p>
                  <div class="flex space-x-4 mt-2 text-xs text-gray-500">
                    <span>模式: {{ activity.lottery_mode === 'online' ? '线上' : '线下' }}</span>
                    <span>状态: {{ getStatusText(activity.status) }}</span>
                    <span>抽奖码: {{ activity.lottery_codes_count || 0 }}</span>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <Button size="sm" variant="outline" @click="editActivity(activity)">
                    编辑
                  </Button>
                  <Button size="sm" variant="outline" @click="viewActivityDetails(activity.id)">
                    详情
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div v-if="activityPagination.totalPages > 1" class="flex justify-center mt-4">
            <div class="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                @click="prevActivitiesPage"
                :disabled="activityPagination.page <= 1"
              >
                上一页
              </Button>
              <span class="px-3 py-1 text-sm">
                {{ activityPagination.page }} / {{ activityPagination.totalPages }}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                @click="nextActivitiesPage"
                :disabled="activityPagination.page >= activityPagination.totalPages"
              >
                下一页
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 活动表单 -->
    <div v-if="showActivityForm" class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">
        {{ editingActivity ? '编辑活动' : '新建活动' }}
      </h2>
      <ActivityForm
        :activity="editingActivity"
        :loading="activityFormLoading"
        @submit="handleActivitySubmit"
        @cancel="cancelActivityForm"
      />
    </div>

    <!-- API状态显示 -->
    <div class="bg-gray-50 rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4">API调用状态</h2>
      <div class="space-y-2 font-mono text-sm">
        <p>API基础地址: {{ apiBaseUrl }}</p>
        <p>最后调用: {{ lastApiCall || '无' }}</p>
        <p>调用计数: {{ apiCallCount }}</p>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="globalError" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex">
        <AlertCircle class="h-5 w-5 text-red-400" />
        <div class="ml-3">
          <p class="text-sm text-red-800">{{ globalError }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-vue-next';
import { useUserStore } from '@/stores/user';
import { usePaginatedApi, useApi } from '@/composables/useApi';
import { API } from '@/api/index';
import ActivityForm from '@/components/forms/ActivityForm.vue';
import type { Activity, LoginRequest, CreateActivityRequest, UpdateActivityRequest, ActivityListParams } from '@/types/api';

// 用户相关
const userStore = useUserStore();
const { user, isLoggedIn, hasAdminAccess } = storeToRefs(userStore);

const showLoginForm = ref(false);
const loginForm = ref<LoginRequest>({
  username: '',
  password: '',
});

// 活动管理
const showActivityForm = ref(false);
const editingActivity = ref<Activity | undefined>();
const activityFormLoading = ref(false);

// 使用分页API
const {
  data: activities,
  pagination: activityPagination,
  loading: activitiesLoading,
  loadData: loadActivities,
  nextPage: nextActivitiesPage,
  prevPage: prevActivitiesPage,
} = usePaginatedApi<Activity, ActivityListParams>(API.adminActivity.getActivities);

// 全局状态
const globalError = ref<string>('');
const apiCallCount = ref(0);
const lastApiCall = ref<string>('');
const apiBaseUrl = ref('http://localhost:3000/api');

// 计算属性
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    active: '进行中',
    ended: '已结束',
  };
  return statusMap[status] || status;
};

// 用户登录
const handleLogin = async () => {
  try {
    await userStore.loginUser(loginForm.value);
    showLoginForm.value = false;
    loginForm.value = { username: '', password: '' };
    await loadActivities();
  } catch {
    // 错误已在store中处理
  }
};

// 用户登出
const handleLogout = async () => {
  await userStore.logoutUser();
};

// 刷新活动列表
const refreshActivities = async () => {
  await loadActivities();
  updateApiCallInfo('GET /admin/activities');
};

// 编辑活动
const editActivity = (activity: Activity) => {
  editingActivity.value = activity;
  showActivityForm.value = true;
};

// 查看活动详情
const viewActivityDetails = async (activityId: number) => {
  try {
    const { execute } = useApi(API.adminActivity.getActivity);
    const result = await execute(activityId);
    if (result) {
      updateApiCallInfo(`GET /admin/activities/${activityId}`);
      // 这里可以显示详情对话框或跳转到详情页
      alert(`活动详情:\n${JSON.stringify(result.activity, null, 2)}`);
    }
  } catch (error) {
    globalError.value = error instanceof Error ? error.message : '获取活动详情失败';
  }
};

// 处理活动表单提交
const handleActivitySubmit = async (_data: CreateActivityRequest | UpdateActivityRequest) => {
  try {
    activityFormLoading.value = true;
    
    if (editingActivity.value) {
      // 更新活动
      updateApiCallInfo(`PUT /admin/activities/${editingActivity.value.id}`);
    } else {
      // 创建活动
      updateApiCallInfo('POST /admin/activities');
    }
    
    // 这里应该调用实际的API
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟API调用
    
    cancelActivityForm();
    await refreshActivities();
  } catch (error) {
    globalError.value = error instanceof Error ? error.message : '操作失败';
  } finally {
    activityFormLoading.value = false;
  }
};

// 取消活动表单
const cancelActivityForm = () => {
  showActivityForm.value = false;
  editingActivity.value = undefined;
};

// 更新API调用信息
const updateApiCallInfo = (endpoint: string) => {
  lastApiCall.value = `${new Date().toLocaleTimeString()} - ${endpoint}`;
  apiCallCount.value += 1;
};

// 初始化
onMounted(async () => {
  await userStore.initializeAuth();
  if (hasAdminAccess.value) {
    await loadActivities();
  }
});
</script>
