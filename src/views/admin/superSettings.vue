<template>
  <div class="space-y-6">
    <PageTitle title="超级管理员设置" />
    
    <!-- 危险操作警告 -->
    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex">
        <AlertTriangle class="h-5 w-5 text-red-400" />
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">危险操作区域</h3>
          <p class="mt-2 text-sm text-red-700">
            以下操作可能会对系统造成不可逆的影响，请谨慎操作。
          </p>
        </div>
      </div>
    </div>

    <!-- 系统状态 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">系统状态</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">{{ systemStatus.uptime }}</div>
          <div class="text-sm text-gray-500">运行时间</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">{{ systemStatus.memory }}%</div>
          <div class="text-sm text-gray-500">内存使用率</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-orange-600">{{ systemStatus.cpu }}%</div>
          <div class="text-sm text-gray-500">CPU使用率</div>
        </div>
      </div>
    </div>

    <!-- 数据库管理 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">数据库管理</h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h3 class="font-medium text-gray-900">备份数据库</h3>
            <p class="text-sm text-gray-500">创建完整的数据库备份</p>
          </div>
          <button
            @click="backupDatabase"
            :disabled="operations.backup"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <Database v-if="!operations.backup" class="w-4 h-4 mr-2" />
            <Loader2 v-else class="w-4 h-4 mr-2 animate-spin" />
            {{ operations.backup ? '备份中...' : '创建备份' }}
          </button>
        </div>

        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h3 class="font-medium text-gray-900">优化数据库</h3>
            <p class="text-sm text-gray-500">清理碎片并优化性能</p>
          </div>
          <button
            @click="optimizeDatabase"
            :disabled="operations.optimize"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
          >
            <Zap v-if="!operations.optimize" class="w-4 h-4 mr-2" />
            <Loader2 v-else class="w-4 h-4 mr-2 animate-spin" />
            {{ operations.optimize ? '优化中...' : '开始优化' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 系统维护 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">系统维护</h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h3 class="font-medium text-gray-900">清理系统缓存</h3>
            <p class="text-sm text-gray-500">清除临时文件和缓存数据</p>
          </div>
          <button
            @click="clearCache"
            :disabled="operations.cache"
            class="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 flex items-center"
          >
            <Trash2 v-if="!operations.cache" class="w-4 h-4 mr-2" />
            <Loader2 v-else class="w-4 h-4 mr-2 animate-spin" />
            {{ operations.cache ? '清理中...' : '清理缓存' }}
          </button>
        </div>

        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h3 class="font-medium text-gray-900">重启应用服务</h3>
            <p class="text-sm text-gray-500">重新启动应用程序（将断开所有连接）</p>
          </div>
          <button
            @click="showRestartConfirm = true"
            :disabled="operations.restart"
            class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 flex items-center"
          >
            <RotateCcw v-if="!operations.restart" class="w-4 h-4 mr-2" />
            <Loader2 v-else class="w-4 h-4 mr-2 animate-spin" />
            {{ operations.restart ? '重启中...' : '重启服务' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 危险操作 -->
    <div class="bg-white rounded-lg shadow p-6 border-2 border-red-200">
      <h2 class="text-lg font-semibold text-red-900 mb-4 flex items-center">
        <AlertTriangle class="w-5 h-5 mr-2" />
        危险操作
      </h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
          <div>
            <h3 class="font-medium text-red-900">清空所有数据</h3>
            <p class="text-sm text-red-700">删除所有活动、用户和相关数据（不可恢复）</p>
          </div>
          <button
            @click="showDeleteAllConfirm = true"
            :disabled="operations.deleteAll"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
          >
            <Trash2 v-if="!operations.deleteAll" class="w-4 h-4 mr-2" />
            <Loader2 v-else class="w-4 h-4 mr-2 animate-spin" />
            {{ operations.deleteAll ? '删除中...' : '清空数据' }}
          </button>
        </div>

        <div class="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
          <div>
            <h3 class="font-medium text-red-900">重置系统设置</h3>
            <p class="text-sm text-red-700">将所有系统设置恢复为默认值</p>
          </div>
          <button
            @click="showResetSettingsConfirm = true"
            :disabled="operations.resetSettings"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
          >
            <RotateCcw v-if="!operations.resetSettings" class="w-4 h-4 mr-2" />
            <Loader2 v-else class="w-4 h-4 mr-2 animate-spin" />
            {{ operations.resetSettings ? '重置中...' : '重置设置' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 重启确认对话框 -->
    <div v-if="showRestartConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <div class="flex items-center mb-4">
          <AlertTriangle class="h-6 w-6 text-orange-600 mr-3" />
          <h3 class="text-lg font-semibold text-gray-900">确认重启服务</h3>
        </div>
        <p class="text-sm text-gray-600 mb-6">
          重启服务将断开所有用户连接，正在进行的操作可能会丢失。确定要继续吗？
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="showRestartConfirm = false"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="restartService"
            class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            确认重启
          </button>
        </div>
      </div>
    </div>

    <!-- 删除所有数据确认对话框 -->
    <div v-if="showDeleteAllConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <div class="flex items-center mb-4">
          <AlertTriangle class="h-6 w-6 text-red-600 mr-3" />
          <h3 class="text-lg font-semibold text-gray-900">确认删除所有数据</h3>
        </div>
        <p class="text-sm text-gray-600 mb-4">
          此操作将永久删除所有数据，包括：
        </p>
        <ul class="text-sm text-gray-600 mb-6 list-disc list-inside">
          <li>所有活动和奖品</li>
          <li>所有抽奖码和记录</li>
          <li>所有用户账户（除超级管理员）</li>
          <li>所有操作日志</li>
        </ul>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            请输入 "DELETE ALL" 确认删除：
          </label>
          <input
            v-model="deleteConfirmText"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="DELETE ALL"
          />
        </div>
        <div class="flex justify-end space-x-3">
          <button
            @click="showDeleteAllConfirm = false; deleteConfirmText = ''"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="deleteAllData"
            :disabled="deleteConfirmText !== 'DELETE ALL'"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>

    <!-- 重置设置确认对话框 -->
    <div v-if="showResetSettingsConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <div class="flex items-center mb-4">
          <AlertTriangle class="h-6 w-6 text-orange-600 mr-3" />
          <h3 class="text-lg font-semibold text-gray-900">确认重置设置</h3>
        </div>
        <p class="text-sm text-gray-600 mb-6">
          此操作将重置所有系统设置为默认值。确定要继续吗？
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="showResetSettingsConfirm = false"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="resetAllSettings"
            class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            确认重置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { API } from '@/api';
import PageTitle from '@/components/ui/text/pageTitle.vue';
import { 
  AlertTriangle, 
  Database, 
  Zap, 
  Trash2, 
  RotateCcw, 
  Loader2,
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';

// 系统状态
const systemStatus = reactive({
  uptime: '0天',
  memory: 0,
  cpu: 0,
});

// 操作状态
const operations = reactive({
  backup: false,
  optimize: false,
  cache: false,
  restart: false,
  deleteAll: false,
  resetSettings: false,
});

// 确认对话框状态
const showRestartConfirm = ref(false);
const showDeleteAllConfirm = ref(false);
const showResetSettingsConfirm = ref(false);
const deleteConfirmText = ref('');

// 获取系统状态
const getSystemStatus = async () => {
  try {
    const health = await API.system.getHealth();
    systemStatus.uptime = calculateUptime(health.health.uptime || 0);
    // 计算内存使用率（heapUsed / heapTotal）
    const memoryUsage = health.health.memory.heapUsed / health.health.memory.heapTotal;
    systemStatus.memory = Math.round(memoryUsage * 100);
    // CPU使用率使用模拟数据
    systemStatus.cpu = Math.round(Math.random() * 50 + 20);
  } catch {
    toast.error('获取系统状态失败');
  }
};

// 计算运行时间
const calculateUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) {
    return `${days}天${hours}小时`;
  }
  return `${hours}小时`;
};

// 备份数据库
const backupDatabase = async () => {
  operations.backup = true;
  try {
    // 模拟备份操作
    await new Promise(resolve => setTimeout(resolve, 3000));
    toast.success('数据库备份完成');
  } catch {
    toast.error('数据库备份失败');
  } finally {
    operations.backup = false;
  }
};

// 优化数据库
const optimizeDatabase = async () => {
  operations.optimize = true;
  try {
    // 模拟优化操作
    await new Promise(resolve => setTimeout(resolve, 5000));
    toast.success('数据库优化完成');
  } catch {
    toast.error('数据库优化失败');
  } finally {
    operations.optimize = false;
  }
};

// 清理缓存
const clearCache = async () => {
  operations.cache = true;
  try {
    // 模拟清理操作
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success('系统缓存清理完成');
  } catch {
    toast.error('清理缓存失败');
  } finally {
    operations.cache = false;
  }
};

// 重启服务
const restartService = async () => {
  showRestartConfirm.value = false;
  operations.restart = true;
  try {
    // 模拟重启操作
    await new Promise(resolve => setTimeout(resolve, 3000));
    toast.success('服务重启完成');
    // 实际项目中这里可能需要重新加载页面
  } catch {
    toast.error('服务重启失败');
  } finally {
    operations.restart = false;
  }
};

// 删除所有数据
const deleteAllData = async () => {
  if (deleteConfirmText.value !== 'DELETE ALL') {
    return;
  }
  
  showDeleteAllConfirm.value = false;
  deleteConfirmText.value = '';
  operations.deleteAll = true;
  
  try {
    // 模拟删除操作
    await new Promise(resolve => setTimeout(resolve, 5000));
    toast.success('所有数据已清空');
  } catch {
    toast.error('清空数据失败');
  } finally {
    operations.deleteAll = false;
  }
};

// 重置所有设置
const resetAllSettings = async () => {
  showResetSettingsConfirm.value = false;
  operations.resetSettings = true;
  
  try {
    // 重置为默认设置
    // const defaultSettings = {
    //   systemName: '抽奖系统',
    //   version: '1.0.0',
    //   allowMultipleWins: false,
    //   autoLottery: true,
    //   maxParticipants: 10000,
    //   emailNotification: true,
    //   smsNotification: false,
    //   sessionTimeout: 30,
    //   forcePasswordChange: false,
    // };
    
    // await API.system.updateSettings(defaultSettings);
    // toast.success('系统设置已重置为默认值');
  } catch {
    toast.error('重置设置失败');
  } finally {
    operations.resetSettings = false;
  }
};

// 页面加载时获取系统状态
onMounted(() => {
  getSystemStatus();
  // 每30秒更新一次系统状态
  setInterval(getSystemStatus, 30000);
});
</script>