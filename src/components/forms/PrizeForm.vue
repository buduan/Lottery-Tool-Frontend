<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 奖品名称 -->
      <div class="space-y-2">
        <Label for="name" class="text-sm font-medium">奖品名称 *</Label>
        <Input
          id="name"
          v-model="formData.name"
          placeholder="请输入奖品名称"
          :class="{ 'border-red-500': errors.name }"
        />
        <p v-if="errors.name" class="text-sm text-red-500">{{ errors.name }}</p>
      </div>

      <!-- 奖品数量 -->
      <div class="space-y-2">
        <Label for="total_quantity" class="text-sm font-medium"
          >奖品数量 *</Label
        >
        <Input
          id="total_quantity"
          type="number"
          v-model="formData.total_quantity"
          placeholder="请输入奖品数量"
          min="1"
          :class="{ 'border-red-500': errors.total_quantity }"
        />
        <p v-if="errors.total_quantity" class="text-sm text-red-500">
          {{ errors.total_quantity }}
        </p>
      </div>
    </div>

    <!-- 奖品描述 -->
    <div class="space-y-2">
      <Label for="description" class="text-sm font-medium">奖品描述</Label>
      <Input
        id="description"
        v-model="formData.description"
        placeholder="请输入奖品描述"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 中奖概率 -->
      <div class="space-y-2">
        <Label for="probability" class="text-sm font-medium"
          >中奖概率 (%) *</Label
        >
        <Input
          id="probability"
          type="number"
          v-model="probabilityPercent"
          placeholder="请输入中奖概率"
          min="0"
          max="100"
          step="0.01"
          :class="{ 'border-red-500': errors.probability }"
        />
        <p v-if="errors.probability" class="text-sm text-red-500">
          {{ errors.probability }}
        </p>
        <p class="text-xs text-gray-500">例如：10.5 表示 10.5% 的中奖概率</p>
      </div>

      <!-- 排序 -->
      <div class="space-y-2">
        <Label for="sort_order" class="text-sm font-medium">排序</Label>
        <Input
          id="sort_order"
          type="number"
          v-model="formData.sort_order"
          placeholder="排序数字，越小越靠前"
          min="1"
        />
        <p class="text-xs text-gray-500">用于控制奖品显示顺序</p>
      </div>
    </div>

    <!-- 提交按钮 -->
    <div class="flex justify-end space-x-4">
      <Button type="button" variant="outline" @click="$emit('cancel')">
        取消
      </Button>
      <Button type="submit" :disabled="loading">
        <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
        {{ isEdit ? '更新奖品' : '添加奖品' }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-vue-next';
import type {
  Prize,
  CreatePrizeRequest,
  UpdatePrizeRequest,
} from '@/types/api';

interface Props {
  prize?: Prize;
  loading?: boolean;
}

interface Emits {
  (e: 'submit', data: CreatePrizeRequest | UpdatePrizeRequest): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<Emits>();

const isEdit = computed(() => !!props.prize);

// 表单数据
const formData = ref<CreatePrizeRequest>({
  name: '',
  description: '',
  total_quantity: 1,
  probability: 0,
  sort_order: 1,
});

// 概率百分比（用于显示）
const probabilityPercent = computed({
  get: () => formData.value.probability * 100,
  set: (value: number) => {
    formData.value.probability = value / 100;
  },
});

// 表单验证错误
const errors = ref<Record<string, string>>({});

// 监听props变化，填充表单数据
watch(
  () => props.prize,
  (prize) => {
    if (prize) {
      formData.value = {
        name: prize.name,
        description: prize.description || '',
        total_quantity: prize.total_quantity,
        probability: prize.probability,
        sort_order: prize.sort_order,
      };
    }
  },
  { immediate: true }
);

// 表单验证
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (!formData.value.name.trim()) {
    newErrors.name = '奖品名称不能为空';
  }

  if (!formData.value.total_quantity || formData.value.total_quantity < 1) {
    newErrors.total_quantity = '奖品数量必须大于0';
  }

  if (formData.value.probability < 0 || formData.value.probability > 1) {
    newErrors.probability = '中奖概率必须在0-100%之间';
  }

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

// 处理表单提交
const handleSubmit = () => {
  if (!validateForm()) {
    return;
  }

  emit('submit', formData.value);
};
</script>
