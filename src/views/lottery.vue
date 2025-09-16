<template>
  <header class="w-full p-4 bg-white[0.8] backdrop-blur-2xl">
    <div class="h-2 overflow-clip">
      <!-- 标识 -->
      <image
        v-if="basicInfo.icon"
        :src="basicInfo.icon"
        mode="scaleToFill"
        class="h-full"
      />

      <span v-else class="font-bold text-2xl">
        {{ basicInfo.title }}
      </span>
    </div>
  </header>
  <!-- 抽奖码输入框 -->
  <div>
    <Input v-model="lotteryCode">
      
    </Input>
  </div>
  
  <!-- 键盘 移动端显示 -->
  <div>

  </div>

</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Input } from '@/components/ui/input';
import { lotteryApi } from '@/api';
import { lotteryInfo } from '@/types/lottery';

const urlParams = new URLSearchParams(window.location.search);

const lotteryCode = ref<string>('');
const basicInfo = ref<lotteryInfo>({
  id: 0,
  icon: 'logo.png',
  title: '抽奖',
  description: '这是一个测试抽奖',
  codeFormat: '4_digit_number',

});

const activityId = Number(urlParams.get('activityId'));


// TODO: 基础信息查询逻辑
const getActivityInfo = lotteryApi.getActivity(activityId);
getActivityInfo;


</script>

<style lang="less" module>

</style>
