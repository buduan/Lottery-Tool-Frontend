<template>
  <div class="space-y-6">
    <PageTitle title="活动数据统计" />

    <!-- 总体统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm     const response = await API.adminActivity.getActivities({ limit: 5 });
    topActivities.value = response.activities.map(activity => ({
      ...activity,
      participant_count: Math.floor(Math.random() * 1000), // 模拟数据
    }));
  } catch {
    toast.error('获取热门活动失败');
  } finally {
    loadingTopActivities.value = false;
  };m text-gray-600">总活动数</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total_activities }}</p>
          </div>
          <div class="p-3 bg-blue-100 rounded-full">
            <Activity class="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">进行中活动</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.active_activities }}</p>
          </div>
          <div class="p-3 bg-green-100 rounded-full">
            <Play class="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">总参与人次</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total_participants }}</p>
          </div>
          <div class="p-3 bg-purple-100 rounded-full">
            <Users class="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600">总中奖人次</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total_winners }}</p>
          </div>
          <div class="p-3 bg-yellow-100 rounded-full">
            <Trophy class="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- 图表和活动列表 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 活动趋势图表 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">活动创建趋势</h3>
        <div class="h-64 flex items-center justify-center text-gray-500">
          <!-- 这里可以集成图表库如 Chart.js 或 ECharts -->
          <div class="text-center">
            <BarChart class="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>图表功能开发中...</p>
          </div>
        </div>
      </div>

      <!-- 热门活动排行 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">热门活动排行</h3>
        <div v-if="loadingTopActivities" class="text-center py-4">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
        </div>
        <div v-else class="space-y-3">
          <div v-for="(activity, index) in topActivities" :key="activity.id"
               class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                {{ index + 1 }}
              </div>
              <div>
                <h4 class="font-medium">{{ activity.name }}</h4>
                <p class="text-sm text-gray-600">参与人数: {{ activity.participant_count || 0 }}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" @click="viewActivity(activity.id)">
              查看
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- 详细数据表格 -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">活动数据详情</h3>
        <div class="flex gap-2">
          <Button @click="exportData" variant="outline" size="sm">
            <Download class="w-4 h-4 mr-2" />
            导出数据
          </Button>
          <Button @click="refreshData" size="sm">
            <RefreshCw class="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      <!-- 筛选器 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <Label>状态筛选</Label>
          <Select v-model="filters.status">
            <SelectTrigger>
              <SelectValue placeholder="全部状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部状态</SelectItem>
              <SelectItem value="active">进行中</SelectItem>
              <SelectItem value="ended">已结束</SelectItem>
              <SelectItem value="draft">草稿</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>抽奖模式</Label>
          <Select v-model="filters.lottery_mode">
            <SelectTrigger>
              <SelectValue placeholder="全部模式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部模式</SelectItem>
              <SelectItem value="online">在线抽奖</SelectItem>
              <SelectItem value="offline">线下抽奖</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>开始日期</Label>
          <Input v-model="filters.start_date" type="date" />
        </div>
        <div>
          <Label>结束日期</Label>
          <Input v-model="filters.end_date" type="date" />
        </div>
      </div>

      <!-- 数据表格 -->
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
      <DataTable v-else :data="activities" :columns="columns" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { API } from '@/api/index';
import type { Activity } from '@/types/api';
import type { TableColumn } from '@/components/common/types';
import PageTitle from '@/components/ui/text/pageTitle.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DataTable from '@/components/common/DataTable.vue';
import { 
  Play, 
  Users, 
  Trophy, 
  BarChart, 
  Download, 
  RefreshCw,
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const router = useRouter();

// 响应式数据
const loading = ref(false);
const loadingTopActivities = ref(false);
const activities = ref<Activity[]>([]);
const topActivities = ref<(Activity & { participant_count?: number })[]>([]);

// 统计数据
const stats = ref({
  total_activities: 0,
  active_activities: 0,
  total_participants: 0,
  total_winners: 0,
});

// 筛选器
const filters = ref({
  status: '',
  lottery_mode: '',
  start_date: '',
  end_date: '',
});

// 表格列定义
const columns: TableColumn[] = [
  {
    key: 'name',
    title: '活动名称',
    sortable: true,
  },
  {
    key: 'status',
    title: '状态',
    render: (value: unknown) => {
      const statusMap = {
        active: '进行中',
        ended: '已结束',
        draft: '草稿',
      };
      return statusMap[value as keyof typeof statusMap] || String(value);
    },
  },
  {
    key: 'lottery_mode',
    title: '抽奖模式',
    render: (value: unknown) => String(value) === 'online' ? '在线抽奖' : '线下抽奖',
  },
  {
    key: 'participant_count',
    title: '参与人数',
    render: (value: unknown) => String(Number(value) || 0),
  },
  {
    key: 'winner_count',
    title: '中奖人数',
    render: (value: unknown) => String(Number(value) || 0),
  },
  {
    key: 'created_at',
    title: '创建时间',
    render: (value: unknown) => new Date(String(value)).toLocaleDateString('zh-CN'),
    sortable: true,
  },
  {
    key: 'actions',
    title: '操作',
    render: (_: unknown, record: Record<string, unknown>) => {
      const id = record.id as number;
      return `
        <div class="flex gap-2">
          <button onclick="window.viewActivity(${id})" class="text-blue-600 hover:text-blue-800">查看</button>
          <button onclick="window.editActivity(${id})" class="text-green-600 hover:text-green-800">编辑</button>
        </div>
      `;
    },
  },
];

// 计算属性
const filteredActivities = computed(() => {
  let filtered = activities.value;

  if (filters.value.status) {
    filtered = filtered.filter(activity => activity.status === filters.value.status);
  }

  if (filters.value.lottery_mode) {
    filtered = filtered.filter(activity => activity.lottery_mode === filters.value.lottery_mode);
  }

  if (filters.value.start_date) {
    filtered = filtered.filter(activity => 
      activity.start_time && activity.start_time >= filters.value.start_date
    );
  }

  if (filters.value.end_date) {
    filtered = filtered.filter(activity => 
      activity.end_time && activity.end_time <= filters.value.end_date
    );
  }

  return filtered;
});

// 获取活动数据
const fetchActivities = async () => {
  try {
    loading.value = true;
    const response = await API.adminActivity.getActivities();
    activities.value = response.activities;
    
    // 计算统计数据
    stats.value = {
      total_activities: activities.value.length,
      active_activities: activities.value.filter(a => a.status === 'active').length,
      total_participants: 0, // 这需要从后端获取
      total_winners: 0, // 这需要从后端获取
    };
  } catch (err) {
    toast.error('获取活动数据失败：' + (err instanceof Error ? err.message : '未知错误'));
  } finally {
    loading.value = false;
  }
};

// 获取热门活动
const fetchTopActivities = async () => {
  try {
    loadingTopActivities.value = true;
    // 暂时使用前5个活动作为热门活动
    const response = await API.adminActivity.getActivities({ limit: 5 });
    topActivities.value = response.activities.map(activity => ({
      ...activity,
      participant_count: Math.floor(Math.random() * 1000), // 模拟数据
    }));
  } catch {
    toast.error('获取热门活动失败');
  } finally {
    loadingTopActivities.value = false;
  }
};

// 查看活动
const viewActivity = (id: number) => {
  router.push(`/admin/activities/${id}`);
};

// 编辑活动
const editActivity = (id: number) => {
  router.push(`/admin/activities/${id}/edit`);
};

// 在 mounted 时将函数挂载到 window 对象供 render 函数使用
onMounted(() => {
  (window as unknown as Record<string, unknown>).viewActivity = viewActivity;
  (window as unknown as Record<string, unknown>).editActivity = editActivity;
});

// 在 unmounted 时清理
onUnmounted(() => {
  delete (window as unknown as Record<string, unknown>).viewActivity;
  delete (window as unknown as Record<string, unknown>).editActivity;
});

// 导出数据
const exportData = () => {
  // 导出功能实现
  const csvContent = generateCSV(filteredActivities.value);
  downloadCSV(csvContent, `活动数据_${new Date().toISOString().split('T')[0]}.csv`);
  toast.success('数据导出成功');
};

// 生成CSV内容
const generateCSV = (data: Activity[]) => {
  const headers = ['活动名称', '状态', '抽奖模式', '创建时间'];
  const rows = data.map(activity => [
    activity.name,
    getStatusText(activity.status),
    activity.lottery_mode === 'online' ? '在线抽奖' : '线下抽奖',
    new Date(activity.created_at).toLocaleDateString('zh-CN'),
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

// 下载CSV文件
const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap = {
    active: '进行中',
    ended: '已结束',
    draft: '草稿',
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

// 刷新数据
const refreshData = () => {
  fetchActivities();
  fetchTopActivities();
};

// 监听筛选器变化
watch(filters, () => {
  // 筛选器变化时可以触发一些操作
}, { deep: true });

// 页面加载时获取数据
onMounted(() => {
  fetchActivities();
  fetchTopActivities();
});
</script>