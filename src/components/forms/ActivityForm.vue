<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 活动名称 -->
      <div class="space-y-2">
        <Label for="name" class="text-sm font-medium">活动名称 *</Label>
        <Input
          id="name"
          v-model="formData.name"
          placeholder="请输入活动名称"
          :class="{ 'border-red-500': errors.name }"
        />
        <p v-if="errors.name" class="text-sm text-red-500">{{ errors.name }}</p>
      </div>

      <!-- 抽奖模式 -->
      <div class="space-y-2">
        <Label for="lottery_mode" class="text-sm font-medium">抽奖模式 *</Label>
        <Select v-model="formData.lottery_mode">
          <SelectTrigger>
            <SelectValue placeholder="选择抽奖模式" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="online">线上抽奖</SelectItem>
            <SelectItem value="offline">线下抽奖</SelectItem>
          </SelectContent>
        </Select>
        <p v-if="errors.lottery_mode" class="text-sm text-red-500">
          {{ errors.lottery_mode }}
        </p>
      </div>
    </div>

    <!-- 活动描述 -->
    <div class="space-y-2">
      <Label for="description" class="text-sm font-medium">活动描述</Label>
      <Input
        id="description"
        v-model="formData.description"
        placeholder="请输入活动描述"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 开始时间 -->
      <div class="space-y-2">
        <Label for="start_time" class="text-sm font-medium">开始时间</Label>
        <Input
          id="start_time"
          type="datetime-local"
          v-model="formData.start_time"
        />
      </div>

      <!-- 结束时间 -->
      <div class="space-y-2">
        <Label for="end_time" class="text-sm font-medium">结束时间</Label>
        <Input
          id="end_time"
          type="datetime-local"
          v-model="formData.end_time"
        />
      </div>
    </div>

    <!-- 高级设置 -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">高级设置</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 最大抽奖码数量 -->
        <div class="space-y-2">
          <Label for="max_lottery_codes" class="text-sm font-medium"
            >最大抽奖码数量</Label
          >
          <Input
            id="max_lottery_codes"
            type="number"
            v-model="formData.settings.max_lottery_codes"
            placeholder="例如: 1000"
            min="1"
          />
        </div>

        <!-- 抽奖码格式 -->
        <div class="space-y-2">
          <Label for="lottery_code_format" class="text-sm font-medium"
            >抽奖码格式</Label
          >
          <Select v-model="formData.settings.lottery_code_format">
            <SelectTrigger>
              <SelectValue placeholder="选择抽奖码格式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4_digit_number">4位纯数字</SelectItem>
              <SelectItem value="8_digit_number">8位纯数字</SelectItem>
              <SelectItem value="8_digit_alphanumeric">8位数字+字母</SelectItem>
              <SelectItem value="12_digit_number">12位纯数字</SelectItem>
              <SelectItem value="12_digit_alphanumeric"
                >12位数字+字母</SelectItem
              >
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- 允许重复手机号 -->
      <div class="flex items-center space-x-2">
        <input
          id="allow_duplicate_phone"
          type="checkbox"
          v-model="formData.settings.allow_duplicate_phone"
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <Label for="allow_duplicate_phone" class="text-sm font-medium">
          允许重复手机号参与
        </Label>
      </div>
    </div>

    <!-- 提交按钮 -->
    <div class="flex justify-end space-x-4">
      <Button type="button" variant="outline" @click="$emit('cancel')">
        取消
      </Button>
      <Button type="submit" :disabled="loading">
        <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
        {{ isEdit ? '更新活动' : '创建活动' }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-vue-next';
import type {
  Activity,
  CreateActivityRequest,
  UpdateActivityRequest,
} from '@/types/api';

interface Props {
  activity?: Activity;
  loading?: boolean;
}

interface Emits {
  (e: 'submit', data: CreateActivityRequest | UpdateActivityRequest): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<Emits>();

const isEdit = computed(() => !!props.activity);

// 表单数据
const formData = ref<
  CreateActivityRequest & {
    settings: NonNullable<CreateActivityRequest['settings']>;
  }
>({
  name: '',
  description: '',
  lottery_mode: 'online',
  start_time: '',
  end_time: '',
  settings: {
    max_lottery_codes: 1000,
    lottery_code_format: '8_digit_number',
    allow_duplicate_phone: false,
  },
});

// 表单验证错误
const errors = ref<Record<string, string>>({});

// 监听props变化，填充表单数据
watch(
  () => props.activity,
  (activity) => {
    if (activity) {
      formData.value = {
        name: activity.name,
        description: activity.description || '',
        lottery_mode: activity.lottery_mode,
        start_time: activity.start_time
          ? formatDateTimeLocal(activity.start_time)
          : '',
        end_time: activity.end_time
          ? formatDateTimeLocal(activity.end_time)
          : '',
        settings: {
          max_lottery_codes: activity.settings?.max_lottery_codes || 1000,
          lottery_code_format:
            activity.settings?.lottery_code_format || '8_digit_number',
          allow_duplicate_phone:
            activity.settings?.allow_duplicate_phone || false,
        },
      };
    }
  },
  { immediate: true }
);

// 表单验证
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (!formData.value.name.trim()) {
    newErrors.name = '活动名称不能为空';
  }

  if (!formData.value.lottery_mode) {
    newErrors.lottery_mode = '请选择抽奖模式';
  }

  if (formData.value.start_time && formData.value.end_time) {
    const startTime = new Date(formData.value.start_time);
    const endTime = new Date(formData.value.end_time);
    if (startTime >= endTime) {
      newErrors.end_time = '结束时间必须晚于开始时间';
    }
  }

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

// 处理表单提交
const handleSubmit = () => {
  if (!validateForm()) {
    return;
  }

  const submitData = {
    ...formData.value,
    start_time: formData.value.start_time || undefined,
    end_time: formData.value.end_time || undefined,
  };

  emit('submit', submitData);
};

// 格式化日期时间为本地输入格式
const formatDateTimeLocal = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
</script>
