<template>
  <div class="space-y-6">
    <PageTitle 
      :title="activity?.name || 'Activity Detail'"
      :subTitle="activity?.description || ''"
    />
    
    <!-- 概览数值卡片 -->
    <div class="grid md:grid-cols-3 grid-cols-1 gap-4">
      <NumberCard 
        title="奖品种数" 
        :value="prizeTypeCount" 
        :icon="Gift" 
      />
      <NumberCard 
        title="抽奖码数" 
        :value="totalLotteryCodes" 
        :icon="Ticket" 
      />
      <NumberCard 
        title="剩余奖品数 / 奖品总数" 
        :value="`${remainingPrizes} / ${totalPrizes}`" 
        :icon="Package" 
      />
    </div>
    
    <!-- 抽奖记录表格 -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="scroll-m-20 text-xl font-semibold tracking-tight">
          抽奖记录
        </h3>
      </div>
      
      <!-- 搜索和筛选区域 -->
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              v-model="searchQuery"
              placeholder="搜索抽奖码、姓名..."
              class="pl-10 w-full"
              @input="handleSearch"
            />
          </div>
        </div>
        <div class="flex gap-2">
          <Button variant="outline">
            管理奖品
          </Button>
        </div>
      </div>
      
      <!-- 数据表格 -->
      <DataTable
        :data="lotteryRecords"
        :columns="columns"
        :loading="loading"
        :pagination="{
          current: currentPage,
          pageSize: pageSize,
          total: totalRecords
        }"
        @page-change="handlePageChange"
        :empty-text="'暂无抽奖记录'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, h } from 'vue';
import { useRoute } from 'vue-router';
import { useDebounceFn } from '@vueuse/core';
import PageTitle from '@/components/ui/text/pageTitle.vue';
import NumberCard from '@/components/admin/dashboard/numberCard.vue';
import DataTable from '@/components/common/DataTable.vue';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Package, Gift, Search, Ticket } from 'lucide-vue-next';
import { API } from '@/api';
import type { Activity, Prize, LotteryRecord } from '@/types/api';
import type { TableColumn } from '@/components/common/types';

const route = useRoute();
const activityId = Number(route.params.id);

// 响应式数据
const activity = ref<Activity | null>(null);
const prizes = ref<Prize[]>([]);
const lotteryRecords = ref<LotteryRecord[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const totalRecords = ref(0);
const searchQuery = ref('');

// 计算属性
const prizeTypeCount = computed(() => {
  return prizes.value.length;
});

const totalLotteryCodes = computed(() => {
  return activity.value?.lottery_codes_count || 0;
});

const totalPrizes = computed(() => {
  return prizes.value.reduce((sum, prize) => sum + prize.total_quantity, 0);
});

const remainingPrizes = computed(() => {
  return prizes.value.reduce((sum, prize) => sum + prize.remaining_quantity, 0);
});

// 表格列定义
const columns: TableColumn[] = [
  {
    key: 'lotteryCode',
    title: '抽奖码',
    width: '120px',
  },
  {
    key: 'name',
    title: '参与者',
    width: '100px',
    render: (value: unknown) => (value as string) || '-',
  },
  {
    key: 'phone',
    title: '手机号',
    width: '120px',
    render: (value: unknown) => (value as string) || '-',
  },
  {
    key: 'is_winner',
    title: '中奖状态',
    width: '100px',
    align: 'center',
    render: (value: unknown) => {
      const isWinner = value as boolean;
      return h('span', {
        class: `inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
          isWinner 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`,
      }, isWinner ? '中奖' : '未中奖');
    },
  },
  {
    key: 'prize',
    title: '奖品',
    width: '150px',
    render: (value: unknown) => (value as string) || '-',
  },
  {
    key: 'operator',
    title: '操作员',
    width: '100px',
    render: (value: unknown) => (value as string) || '-',
  },
  {
    key: 'created_at',
    title: '抽奖时间',
    width: '160px',
    render: (value: unknown) => {
      return new Date(value as string).toLocaleString('zh-CN');
    },
  },
];

// 获取活动详情
const fetchActivity = async () => {
  try {
    const response = await API.adminActivity.getActivity(activityId);
    activity.value = response.activity;
  } catch {
    // 获取活动详情失败
    activity.value = null;
  }
};

// 获取奖品列表
const fetchPrizes = async () => {
  try {
    const response = await API.adminPrize.getPrizes(activityId);
    prizes.value = response.prizes;
  } catch {
    // 获取奖品列表失败
    prizes.value = [];
  }
};

// 获取抽奖记录
const fetchLotteryRecords = async () => {
  loading.value = true;
  try {
    const response = await API.adminActivity.getLotteryRecords(activityId, {
      page: currentPage.value,
      limit: pageSize.value,
      keyword: searchQuery.value || undefined,
    });
    lotteryRecords.value = response.records;
    totalRecords.value = response.pagination.total;
  } catch {
    // 获取抽奖记录失败
    lotteryRecords.value = [];
    totalRecords.value = 0;
  } finally {
    loading.value = false;
  }
};

// 处理页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchLotteryRecords();
};

// 防抖搜索
const handleSearch = useDebounceFn(() => {
  currentPage.value = 1;
  fetchLotteryRecords();
}, 500);

// 初始化数据
const initData = async () => {
  await Promise.all([
    fetchActivity(),
    fetchPrizes(),
    fetchLotteryRecords(),
  ]);
};

// 组件挂载时获取数据
onMounted(() => {
  initData();
});
</script>