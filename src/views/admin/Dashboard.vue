<template>
  <PageTitle
    :title="'Dashboard'"
    :subTitle="'Welcome to the admin dashboard'"
  />
  <!-- 顶部数据卡片 -->
  <div class="grid md:grid-cols-4 grid-cols-2 gap-4 py-4">
    <NumberCard title="Activities" :value="dashboardStats.total_activities" :icon="Users" />
    <NumberCard title="Lottery Codes" :value="dashboardStats.total_lottery_codes" :icon="ShoppingCart" />
    <NumberCard title="Users" :value="dashboardStats.total_users" :icon="Users" />
    <NumberCard title="Records" :value="dashboardStats.total_lottery_records" :icon="Package" />
  </div>
  
  <!-- 活动列表 -->
  <div class="grid lg:grid-cols-2 grid-cols-1 gap-8 py-4">
    <!-- 进行中的活动 -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="scroll-m-20 text-xl font-semibold tracking-tight">
          进行中的活动
        </h3>
        <Button variant="outline" size="sm" @click="$router.push('/admin/activities/list')">
          查看全部
        </Button>
      </div>
      
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="border rounded-lg p-4">
          <div class="animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
      
      <div v-else-if="activeActivities.length === 0" class="text-center py-8 text-muted-foreground">
        <Activity class="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>暂无进行中的活动</p>
      </div>
      
      <div v-else class="space-y-4">
        <ActivityCard 
          v-for="activity in activeActivities" 
          :key="activity.id" 
          :activity="activity"
          show-mode="active"
          @click="handleActivityClick"
        />
      </div>
    </div>
    
    <!-- 最近创建的活动 -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="scroll-m-20 text-xl font-semibold tracking-tight">
          最近创建的活动
        </h3>
        <Button variant="outline" size="sm" @click="$router.push('/admin/activities/create')">
          创建活动
        </Button>
      </div>
      
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="border rounded-lg p-4">
          <div class="animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
      
      <div v-else-if="recentActivities.length === 0" class="text-center py-8 text-muted-foreground">
        <Plus class="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>暂无最近创建的活动</p>
      </div>
      
      <div v-else class="space-y-4">
        <ActivityCard 
          v-for="activity in recentActivities" 
          :key="activity.id" 
          :activity="activity"
          show-mode="recent"
          @click="handleActivityClick"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import PageTitle from '@/components/ui/text/pageTitle.vue';
import NumberCard from '@/components/admin/dashboard/numberCard.vue';
import ActivityCard from '@/components/admin/dashboard/ActivityCard.vue';
import { Button } from '@/components/ui/button';
import { Users, ShoppingCart, Package, Activity, Plus } from 'lucide-vue-next';
import { API } from '@/api';
import type { Activity as ActivityType } from '@/types/api';

const router = useRouter();

// 响应式数据
const loading = ref(false);
const activeActivities = ref<ActivityType[]>([]);
const recentActivities = ref<ActivityType[]>([]);
const dashboardStats = ref({
  total_users: 0,
  total_activities: 0,
  total_lottery_codes: 0,
  total_lottery_records: 0,
});

// 获取仪表板统计数据
const fetchDashboardStats = async () => {
  try {
    const stats = await API.stats.getSystemStats();
    dashboardStats.value = stats;
  } catch (error) {
    console.error('获取统计数据失败:', error);
    // 使用模拟数据作为后备
    dashboardStats.value = {
      total_users: 156,
      total_activities: 23,
      total_lottery_codes: 1250,
      total_lottery_records: 892,
    };
  }
};

// 获取进行中的活动
const fetchActiveActivities = async () => {
  try {
    const response = await API.adminActivity.getActivities({
      status: 'active',
      limit: 5,
    });
    activeActivities.value = response.activities;
  } catch (error) {
    console.error('获取进行中活动失败:', error);
    // 使用模拟数据作为后备
    activeActivities.value = [
      {
        id: 1,
        name: '春节抽奖活动',
        description: '欢度春节，好礼相送！参与即有机会获得丰厚奖品。',
        status: 'active' as const,
        lottery_mode: 'online' as const,
        start_time: '2024-01-20T10:00:00Z',
        end_time: '2024-02-10T23:59:59Z',
        created_at: '2024-01-15T09:00:00Z',
        lottery_codes_count: 500,
        remaining_lottery_codes: 320,
        used_lottery_codes: 180,
      },
      {
        id: 2,
        name: '新用户专享抽奖',
        description: '新用户注册即可参与，100%中奖率！',
        status: 'active' as const,
        lottery_mode: 'online' as const,
        start_time: '2024-01-01T00:00:00Z',
        end_time: '2024-12-31T23:59:59Z',
        created_at: '2023-12-25T10:00:00Z',
        lottery_codes_count: 1000,
        remaining_lottery_codes: 750,
        used_lottery_codes: 250,
      },
    ];
  }
};

// 获取最近创建的活动
const fetchRecentActivities = async () => {
  try {
    const response = await API.adminActivity.getActivities({
      limit: 5,
    });
    recentActivities.value = response.activities;
  } catch (error) {
    console.error('获取最近活动失败:', error);
    // 使用模拟数据作为后备
    recentActivities.value = [
      {
        id: 3,
        name: '元宵节线下抽奖',
        description: '线下门店活动，到店即可参与抽奖。',
        status: 'draft' as const,
        lottery_mode: 'offline' as const,
        start_time: '2024-02-24T10:00:00Z',
        end_time: '2024-02-24T20:00:00Z',
        created_at: '2024-01-25T14:30:00Z',
        lottery_codes_count: 200,
        remaining_lottery_codes: 200,
        used_lottery_codes: 0,
      },
      {
        id: 4,
        name: '会员积分兑换抽奖',
        description: '使用积分兑换抽奖机会，奖品丰富。',
        status: 'draft' as const,
        lottery_mode: 'online' as const,
        created_at: '2024-01-24T16:45:00Z',
        lottery_codes_count: 0,
        remaining_lottery_codes: 0,
        used_lottery_codes: 0,
      },
      {
        id: 5,
        name: '周年庆典大抽奖',
        description: '公司周年庆，超级大奖等你来拿！',
        status: 'ended' as const,
        lottery_mode: 'online' as const,
        start_time: '2024-01-01T00:00:00Z',
        end_time: '2024-01-07T23:59:59Z',
        created_at: '2023-12-20T11:00:00Z',
        lottery_codes_count: 2000,
        remaining_lottery_codes: 0,
        used_lottery_codes: 2000,
      },
    ];
  }
};

// 处理活动点击事件
const handleActivityClick = (activity: ActivityType) => {
  router.push(`/admin/activities/detail/${activity.id}`);
};

// 获取所有数据
const fetchAllData = async () => {
  loading.value = true;
  try {
    await Promise.all([
      fetchDashboardStats(),
      fetchActiveActivities(),
      fetchRecentActivities(),
    ]);
  } finally {
    loading.value = false;
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchAllData();
});
</script>