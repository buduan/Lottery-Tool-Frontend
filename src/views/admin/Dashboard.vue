<template>
  <PageTitle
    :title="'Dashboard'"
    :subTitle="'Welcome to the admin dashboard'"
  />
  <!-- 顶部数据卡片 -->
  <div class="grid md:grid-cols-4 grid-cols-2 gap-4 py-4">
    <NumberCard title="Activities" :value="100" :icon="Users" />
    <NumberCard title="Orders" :value="100" :icon="ShoppingCart" />
    <NumberCard title="Users" :value="100" :icon="Users" />
    <NumberCard title="Products" :value="100" :icon="Package" />
  </div>
  <!-- 活动 -->
  <div class="flex flex-1/3 gap-8">
    <!-- 进行中的活动 -->
    <div>
      <h3 class="scroll-m-20 text-xl font-semibold tracking-tight">
        In-process Activities
      </h3>
    </div>
    <!-- 最近活动 -->
    <div>
      <h3 class="scroll-m-20 text-xl font-semibold tracking-tight">
        Recent Activities
      </h3>
      <div></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PageTitle from '@/components/ui/text/pageTitle.vue';
import NumberCard from '@/components/admin/dashboard/numberCard.vue';
import { Separator } from '@/components/ui/separator';

import { Users, ShoppingCart, Package } from 'lucide-vue-next';

</script>