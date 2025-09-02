<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <PageTitle :title="`活动详情 - ${activity?.name || 'Loading...'}`" />
      <div class="flex gap-2">
        <Button variant="outline" @click="$router.back()">
          返回
        </Button>
        <Button v-if="activity" @click="editActivity">
          编辑活动
        </Button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-500">{{ error }}</p>
      <Button @click="fetchActivityDetail" class="mt-4">重试</Button>
    </div>

    <div v-else-if="activity" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 活动基本信息 -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 活动信息卡片 -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">基本信息</h3>
            <span :class="getStatusBadgeClass(activity.status)">
              {{ getStatusText(activity.status) }}
            </span>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>活动名称</Label>
              <p class="text-sm text-gray-900 mt-1">{{ activity.name }}</p>
            </div>
            <div>
              <Label>抽奖模式</Label>
              <p class="text-sm text-gray-900 mt-1">
                {{ activity.lottery_mode === 'online' ? '在线抽奖' : '线下抽奖' }}
              </p>
            </div>
            <div>
              <Label>开始时间</Label>
              <p class="text-sm text-gray-900 mt-1">{{ activity.start_time ? formatDate(activity.start_time) : '--' }}</p>
            </div>
            <div>
              <Label>结束时间</Label>
              <p class="text-sm text-gray-900 mt-1">{{ activity.end_time ? formatDate(activity.end_time) : '--' }}</p>
            </div>
            <div>
              <Label>创建时间</Label>
              <p class="text-sm text-gray-900 mt-1">{{ formatDate(activity.created_at) }}</p>
            </div>
          </div>
          
          <div class="mt-4">
            <Label>活动描述</Label>
            <p class="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{{ activity.description }}</p>
          </div>
        </div>

        <!-- 奖品列表 -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">奖品列表</h3>
            <Button @click="addPrize" size="sm">
              <Plus class="w-4 h-4 mr-2" />
              添加奖品
            </Button>
          </div>
          
          <div v-if="loadingPrizes" class="text-center py-4">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
          </div>
          
          <div v-else-if="prizes.length === 0" class="text-center py-8 text-gray-500">
            暂无奖品
          </div>
          
          <div v-else class="space-y-3">
            <div v-for="prize in prizes" :key="prize.id" 
                 class="flex items-center justify-between p-3 border rounded-lg">
              <div class="flex-1">
                <h4 class="font-medium">{{ prize.name }}</h4>
                <p class="text-sm text-gray-600">{{ prize.description }}</p>
                <div class="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span>数量: {{ prize.total_quantity }}</span>
                  <span>概率: {{ prize.probability }}%</span>
                  <span>剩余: {{ prize.remaining_quantity }}</span>
                </div>
              </div>
              <div class="flex gap-2">
                <Button size="sm" variant="outline" @click="editPrize(prize)">
                  编辑
                </Button>
                <Button size="sm" variant="destructive" @click="deletePrize(prize.id)">
                  删除
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- 抽奖码管理 -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">抽奖码管理</h3>
            <div class="flex gap-2">
              <Button @click="importCodes" size="sm" variant="outline">
                <Upload class="w-4 h-4 mr-2" />
                导入抽奖码
              </Button>
              <Button @click="addSingleCode" size="sm">
                <Plus class="w-4 h-4 mr-2" />
                添加单个
              </Button>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ lotteryCodeStats.total }}</div>
              <div class="text-sm text-blue-600">总数量</div>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ lotteryCodeStats.unused }}</div>
              <div class="text-sm text-green-600">未使用</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-gray-600">{{ lotteryCodeStats.used }}</div>
              <div class="text-sm text-gray-600">已使用</div>
            </div>
          </div>
          
          <Button @click="viewAllCodes" variant="outline" class="w-full">
            查看所有抽奖码
          </Button>
        </div>
      </div>

      <!-- 侧边栏统计 -->
      <div class="space-y-6">
        <!-- 活动统计 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">活动统计</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">抽奖码数量</span>
              <span class="font-medium">{{ statistics.total_lottery_codes || '--' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">抽奖记录</span>
              <span class="font-medium">{{ statistics.total_lottery_records || '--' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">中奖人数</span>
              <span class="font-medium">{{ statistics.total_winners || '--' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">中奖率</span>
              <span class="font-medium">{{ getWinRate() }}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">总奖品价值</span>
              <span class="font-medium">¥{{ getTotalPrizeValue() }}</span>
            </div>
          </div>
        </div>

        <!-- 快速操作 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">快速操作</h3>
          <div class="space-y-2">
            <Button class="w-full" @click="viewLotteryRecords">
              查看中奖记录
            </Button>
            <Button class="w-full" variant="outline" @click="exportData">
              导出数据
            </Button>
            <Button 
              class="w-full" 
              variant="outline" 
              @click="duplicateActivity"
            >
              复制活动
            </Button>
          </div>
        </div>

        <!-- 危险操作 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4 text-red-600">危险操作</h3>
          <div class="space-y-4">
            <p class="text-sm text-gray-600">
              删除活动将永久移除所有相关数据，包括奖品、抽奖码和中奖记录。
            </p>
            <Button 
              @click="confirmDelete" 
              variant="destructive"
              class="w-full"
              :disabled="deleting"
            >
              {{ deleting ? '删除中...' : '删除活动' }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { API } from '@/api';
import type { Activity, Prize, LotteryStatistics } from '@/types/api';
import PageTitle from '@/components/ui/text/pageTitle.vue';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Upload } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const route = useRoute();
const router = useRouter();

// 响应式数据
const activity = ref<Activity | null>(null);
const prizes = ref<Prize[]>([]);
const statistics = ref<LotteryStatistics>({
  total_lottery_codes: 0,
  total_lottery_records: 0,
  total_winners: 0,
  win_rate: '0',
  prize_statistics: [],
});
const loading = ref(false);
const loadingPrizes = ref(false);
const error = ref('');
const deleting = ref(false);

// 抽奖码统计
const lotteryCodeStats = ref({
  total: 0,
  used: 0,
  unused: 0,
});

// 计算属性
const activityId = computed(() => Number(route.params.id));

// 获取活动详情
const fetchActivityDetail = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const [activityResponse, prizesResponse, statsResponse] = await Promise.all([
      API.adminActivity.getActivity(activityId.value),
      API.adminPrize.getPrizes(activityId.value),
      API.lottery.getStatistics(activityId.value).catch(() => ({ statistics: statistics.value })),
    ]);
    
    activity.value = activityResponse.activity;
    prizes.value = prizesResponse.prizes;
    statistics.value = statsResponse.statistics;
    
    // 获取抽奖码统计
    await fetchLotteryCodeStats();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取活动详情失败';
  } finally {
    loading.value = false;
  }
};

// 获取抽奖码统计
const fetchLotteryCodeStats = async () => {
  try {
    const response = await API.adminLotteryCode.getLotteryCodes(activityId.value);
    const codes = response.lottery_codes;
    
    lotteryCodeStats.value = {
      total: codes.length,
      used: codes.filter(code => code.status === 'used').length,
      unused: codes.filter(code => code.status === 'unused').length,
    };
  } catch {
    // 忽略获取抽奖码统计失败的错误
  }
};

// 状态样式
const getStatusBadgeClass = (status: string) => {
  const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
  switch (status) {
  case 'active':
    return `${baseClasses} bg-green-100 text-green-800`;
  case 'inactive':
    return `${baseClasses} bg-gray-100 text-gray-800`;
  case 'draft':
    return `${baseClasses} bg-yellow-100 text-yellow-800`;
  default:
    return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

// 状态文本
const getStatusText = (status: string) => {
  const statusMap = {
    active: '进行中',
    inactive: '已结束',
    draft: '草稿',
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN');
};

// 计算中奖率
const getWinRate = () => {
  return statistics.value.win_rate;
};

// 计算总奖品价值
const getTotalPrizeValue = () => {
  return prizes.value.reduce((total, prize) => total + (1000 * prize.total_quantity), 0);
};

// 编辑活动
const editActivity = () => {
  router.push(`/admin/activities/${activityId.value}/edit`);
};

// 添加奖品
const addPrize = () => {
  // 这里可以打开一个模态框或跳转到添加奖品页面
  toast.info('添加奖品功能开发中...');
};

// 编辑奖品
const editPrize = (prize: Prize) => {
  // 编辑奖品功能
  toast.info(`编辑奖品: ${prize.name}`);
};

// 删除奖品
const deletePrize = async (prizeId: number) => {
  if (!confirm('确定要删除这个奖品吗？')) return;
  
  try {
    await API.adminPrize.deletePrize(prizeId);
    prizes.value = prizes.value.filter(p => p.id !== prizeId);
    toast.success('奖品删除成功');
  } catch (err) {
    toast.error('删除失败：' + (err instanceof Error ? err.message : '未知错误'));
  }
};

// 导入抽奖码
const importCodes = () => {
  router.push(`/admin/activities/${activityId.value}/codes/import`);
};

// 添加单个抽奖码
const addSingleCode = () => {
  // 添加单个抽奖码功能
  toast.info('添加单个抽奖码功能开发中...');
};

// 查看所有抽奖码
const viewAllCodes = () => {
  router.push(`/admin/activities/${activityId.value}/codes`);
};

// 查看中奖记录
const viewLotteryRecords = () => {
  router.push(`/admin/activities/${activityId.value}/records`);
};

// 导出数据
const exportData = () => {
  // 导出功能
  toast.info('导出功能开发中...');
};

// 复制活动
const duplicateActivity = () => {
  // 复制活动功能
  toast.info('复制活动功能开发中...');
};

// 确认删除
const confirmDelete = () => {
  if (confirm('确定要删除这个活动吗？此操作不可撤销！')) {
    deleteActivity();
  }
};

// 删除活动
const deleteActivity = async () => {
  try {
    deleting.value = true;
    
    await API.adminActivity.deleteActivity(activityId.value);
    
    toast.success('活动删除成功');
    router.push('/admin/activities');
  } catch (err) {
    toast.error('删除失败：' + (err instanceof Error ? err.message : '未知错误'));
  } finally {
    deleting.value = false;
  }
};

onMounted(() => {
  fetchActivityDetail();
});
</script>