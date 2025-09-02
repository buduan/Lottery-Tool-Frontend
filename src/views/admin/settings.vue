<template>
  <div class="space-y-6">
    <PageTitle title="系统设置" />
    
    <!-- 基本设置 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">基本设置</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            系统名称
          </label>
          <input
            v-model="settings.systemName"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入系统名称"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            系统版本
          </label>
          <input
            v-model="settings.version"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入系统版本"
          />
        </div>
      </div>
    </div>

    <!-- 抽奖设置 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">抽奖设置</h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-900">允许重复中奖</h3>
            <p class="text-sm text-gray-500">允许用户在同一活动中多次中奖</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="settings.allowMultipleWins"
              type="checkbox"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-900">自动开奖</h3>
            <p class="text-sm text-gray-500">活动结束时自动进行开奖</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="settings.autoLottery"
              type="checkbox"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            最大参与人数
          </label>
          <input
            v-model.number="settings.maxParticipants"
            type="number"
            min="1"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入最大参与人数"
          />
        </div>
      </div>
    </div>

    <!-- 通知设置 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">通知设置</h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-900">邮件通知</h3>
            <p class="text-sm text-gray-500">重要事件发生时发送邮件通知</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="settings.emailNotification"
              type="checkbox"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-900">短信通知</h3>
            <p class="text-sm text-gray-500">中奖后发送短信通知</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="settings.smsNotification"
              type="checkbox"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>

    <!-- 安全设置 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">安全设置</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            会话超时时间（分钟）
          </label>
          <input
            v-model.number="settings.sessionTimeout"
            type="number"
            min="5"
            max="1440"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入会话超时时间"
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-900">强制定期修改密码</h3>
            <p class="text-sm text-gray-500">要求用户定期更换密码</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="settings.forcePasswordChange"
              type="checkbox"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex justify-end space-x-4">
      <button
        @click="resetSettings"
        :disabled="loading"
        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        重置
      </button>
      <button
        @click="saveSettings"
        :disabled="loading"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
      >
        <Save v-if="!loading" class="w-4 h-4 mr-2" />
        <Loader2 v-else class="w-4 h-4 mr-2 animate-spin" />
        {{ loading ? '保存中...' : '保存设置' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
// import { API } from '@/api';
import PageTitle from '@/components/ui/text/pageTitle.vue';
import { Save, Loader2 } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

// 设置数据
const settings = reactive({
  systemName: '抽奖系统',
  version: '1.0.0',
  allowMultipleWins: false,
  autoLottery: true,
  maxParticipants: 10000,
  emailNotification: true,
  smsNotification: false,
  sessionTimeout: 30,
  forcePasswordChange: false,
});

// 加载状态
const loading = ref(false);

// 原始设置用于重置
const originalSettings = ref({});

// 加载设置
const loadSettings = async () => {
  try {
    // const response = await API.system.getSettings();
    // Object.assign(settings, response);
    // originalSettings.value = { ...response };
  } catch {
    toast.error('加载设置失败');
  }
};

// 保存设置
const saveSettings = async () => {
  loading.value = true;
  try {
    // await API.system.updateSettings(settings);
    // originalSettings.value = { ...settings };
    // toast.success('设置保存成功');
  } catch {
    toast.error('保存设置失败');
  } finally {
    loading.value = false;
  }
};

// 重置设置
const resetSettings = () => {
  Object.assign(settings, originalSettings.value);
  toast.info('设置已重置');
};

// 页面加载时获取设置
onMounted(() => {
  loadSettings();
});
</script>