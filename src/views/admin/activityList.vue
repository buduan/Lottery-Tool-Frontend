<template>
  <div class="space-y-6">
    <PageTitle title="活动列表" />
    
    <!-- 筛选和搜索栏 -->
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <!-- 搜索框 -->
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            v-model="searchQuery"
            placeholder="搜索活动名称..."
            class="pl-10 w-64"
            @input="handleSearch"
          />
        </div>
        
        <!-- 状态筛选 -->
        <Select v-model="statusFilter" @update:model-value="handleStatusFilter">
          <SelectTrigger class="w-32">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="draft">草稿</SelectItem>
            <SelectItem value="active">进行中</SelectItem>
            <SelectItem value="ended">已结束</SelectItem>
          </SelectContent>
        </Select>
        
        <!-- 模式筛选 -->
        <Select v-model="modeFilter" @update:model-value="handleModeFilter">
          <SelectTrigger class="w-32">
            <SelectValue placeholder="模式" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部模式</SelectItem>
            <SelectItem value="online">线上抽奖</SelectItem>
            <SelectItem value="offline">线下抽奖</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <!-- 创建按钮 -->
      <Button @click="handleCreateActivity" class="whitespace-nowrap">
        <Plus class="h-4 w-4 mr-2" />
        创建活动
      </Button>
    </div>
    
    <!-- 数据表格 -->
    <DataTable
      :data="activities"
      :columns="columns"
      :loading="loading"
      :pagination="{
        current: currentPage,
        pageSize: 10,
        total: totalPages * 10
      }"
      @page-change="handlePageChange"
      :empty-text="'暂无活动数据'"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import PageTitle from '@/components/ui/text/pageTitle.vue';
import DataTable from '@/components/common/DataTable.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus } from 'lucide-vue-next';
import { API } from '@/api/index';
import type { Activity } from '@/types/api';
import type { TableColumn } from '@/components/common/types';

const router = useRouter();

// 响应式数据
const activities = ref<Activity[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const totalPages = ref(0);
const searchQuery = ref('');
const statusFilter = ref('all');
const modeFilter = ref('all');

// 状态徽章配置
const getStatusBadge = (status: string) => {
  const statusMap = {
    draft: { label: '草稿', variant: 'secondary' as const },
    active: { label: '进行中', variant: 'default' as const },
    ended: { label: '已结束', variant: 'destructive' as const },
  };
  return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
};

// 模式徽章配置
const getModeBadge = (mode: string) => {
  const modeMap = {
    online: { label: '线上抽奖', variant: 'default' as const },
    offline: { label: '线下抽奖', variant: 'secondary' as const },
  };
  return modeMap[mode as keyof typeof modeMap] || { label: mode, variant: 'secondary' as const };
};

// 时间格式化
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 表格列配置
const columns = computed<TableColumn[]>(() => [
  {
    key: 'name',
    title: '活动名称',
    width: '200px',
  },
  {
    key: 'status',
    title: '状态',
    width: '100px',
    render: (value: unknown, record: Record<string, unknown>) => {
      const activity = record as unknown as Activity;
      const badge = getStatusBadge(activity.status);
      return `<span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-${badge.variant === 'default' ? 'primary' : badge.variant === 'secondary' ? 'secondary' : 'muted'} text-${badge.variant === 'default' ? 'primary-foreground' : 'foreground'}">${badge.label}</span>`;
    },
  },
  {
    key: 'lottery_mode',
    title: '抽奖模式',
    width: '100px',
    render: (value: unknown, record: Record<string, unknown>) => {
      const activity = record as unknown as Activity;
      const badge = getModeBadge(activity.lottery_mode);
      return `<span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-${badge.variant === 'default' ? 'primary' : 'secondary'} text-${badge.variant === 'default' ? 'primary-foreground' : 'foreground'}">${badge.label}</span>`;
    },
  },
  {
    key: 'start_time',
    title: '开始时间',
    width: '150px',
    render: (value: unknown, record: Record<string, unknown>) => {
      const activity = record as unknown as Activity;
      return activity.start_time ? formatDate(activity.start_time) : '-';
    },
  },
  {
    key: 'end_time',
    title: '结束时间',
    width: '150px',
    render: (value: unknown, record: Record<string, unknown>) => {
      const activity = record as unknown as Activity;
      return activity.end_time ? formatDate(activity.end_time) : '-';
    },
  },
  {
    key: 'created_at',
    title: '创建时间',
    width: '150px',
    render: (value: unknown, record: Record<string, unknown>) => {
      const activity = record as unknown as Activity;
      return formatDate(activity.created_at);
    },
  },
  {
    key: 'actions',
    title: '操作',
    width: '120px',
    render: (value: unknown, record: Record<string, unknown>) => {
      const activity = record as unknown as Activity;
      return `
        <div class="flex items-center gap-2">
          <button onclick="handleViewActivity('${activity.id}')" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8" title="查看详情">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
          </button>
          <button onclick="handleEditActivity('${activity.id}')" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8" title="编辑">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </button>
          <button onclick="handleDeleteActivity('${activity.id}')" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground text-destructive hover:text-destructive h-8 w-8" title="删除">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      `;
    },
  },
]);

// 获取活动列表
const fetchActivities = async () => {
  try {
    loading.value = true;
    
    const params: any = {
      page: currentPage.value,
      limit: 10,
    };
    
    // 添加搜索条件
    if (searchQuery.value.trim()) {
      params.search = searchQuery.value.trim();
    }
    
    // 添加状态筛选
    if (statusFilter.value !== 'all') {
      params.status = statusFilter.value;
    }
    
    // 添加模式筛选
    if (modeFilter.value !== 'all') {
      params.lottery_mode = modeFilter.value;
    }
    
    const response = await API.adminActivity.getActivities(params);
    
    activities.value = response.activities;
    totalPages.value = response.pagination.totalPages;
  } catch (error) {
    console.error('获取活动列表出错:', error);
    activities.value = [];
  } finally {
    loading.value = false;
  }
};

// 事件处理函数
const handleSearch = () => {
  currentPage.value = 1;
  fetchActivities();
};

const handleStatusFilter = () => {
  currentPage.value = 1;
  fetchActivities();
};

const handleModeFilter = () => {
  currentPage.value = 1;
  fetchActivities();
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchActivities();
};

// 操作处理函数
const handleCreateActivity = () => {
  router.push('/admin/activities/create');
};

const handleViewActivity = (id: string) => {
  router.push(`/admin/activities/detail/${id}`);
};

const handleEditActivity = (id: string) => {
  router.push(`/admin/activities/detail/${id}`);
};

const handleDeleteActivity = async (id: string) => {
  if (confirm('确定要删除这个活动吗？此操作不可撤销。')) {
    try {
      await API.adminActivity.deleteActivity(Number(id));
      await fetchActivities();
    } catch (error) {
      console.error('删除活动出错:', error);
      alert('删除失败，请稍后重试');
    }
  }
}

// 将操作函数挂载到全局，供内联事件使用
;(window as unknown as Record<string, unknown>).handleViewActivity = handleViewActivity
;(window as unknown as Record<string, unknown>).handleEditActivity = handleEditActivity
;(window as unknown as Record<string, unknown>).handleDeleteActivity = handleDeleteActivity;

// 组件挂载时获取数据
onMounted(() => {
  fetchActivities();
});
</script>