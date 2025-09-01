<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- 抽奖码 -->
    <div class="space-y-2">
      <Label for="code" class="text-sm font-medium">抽奖码</Label>
      <Input
        id="code"
        v-model="formData.code"
        placeholder="留空则自动生成"
        :class="{ 'border-red-500': errors.code }"
      />
      <p v-if="errors.code" class="text-sm text-red-500">{{ errors.code }}</p>
      <p class="text-xs text-gray-500">如果留空，系统将根据活动设置自动生成</p>
    </div>

    <div class="space-y-4">
      <h3 class="text-lg font-medium">参与者信息</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 姓名 -->
        <div class="space-y-2">
          <Label for="name" class="text-sm font-medium">姓名 *</Label>
          <Input
            id="name"
            v-model="formData.participant_info.name"
            placeholder="请输入参与者姓名"
            :class="{ 'border-red-500': errors.name }"
          />
          <p v-if="errors.name" class="text-sm text-red-500">
            {{ errors.name }}
          </p>
        </div>

        <!-- 手机号 -->
        <div class="space-y-2">
          <Label for="phone" class="text-sm font-medium">手机号 *</Label>
          <Input
            id="phone"
            v-model="formData.participant_info.phone"
            placeholder="请输入手机号"
            :class="{ 'border-red-500': errors.phone }"
          />
          <p v-if="errors.phone" class="text-sm text-red-500">
            {{ errors.phone }}
          </p>
        </div>
      </div>

      <!-- 邮箱 -->
      <div class="space-y-2">
        <Label for="email" class="text-sm font-medium">邮箱</Label>
        <Input
          id="email"
          type="email"
          v-model="formData.participant_info.email"
          placeholder="请输入邮箱地址（可选）"
          :class="{ 'border-red-500': errors.email }"
        />
        <p v-if="errors.email" class="text-sm text-red-500">
          {{ errors.email }}
        </p>
      </div>
    </div>

    <!-- 提交按钮 -->
    <div class="flex justify-end space-x-4">
      <Button type="button" variant="outline" @click="$emit('cancel')">
        取消
      </Button>
      <Button type="submit" :disabled="loading">
        <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
        {{ isEdit ? '更新抽奖码' : '添加抽奖码' }}
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
  LotteryCode,
  AddLotteryCodeRequest,
  UpdateParticipantInfoRequest,
} from '@/types/api';

interface Props {
  lotteryCode?: LotteryCode;
  loading?: boolean;
}

interface Emits {
  (
    e: 'submit',
    data: AddLotteryCodeRequest | UpdateParticipantInfoRequest
  ): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<Emits>();

const isEdit = computed(() => !!props.lotteryCode);

// 表单数据
const formData = ref<
  AddLotteryCodeRequest & {
    participant_info: NonNullable<AddLotteryCodeRequest['participant_info']>;
  }
>({
  code: '',
  participant_info: {
    name: '',
    phone: '',
    email: '',
  },
});

// 表单验证错误
const errors = ref<Record<string, string>>({});

// 监听props变化，填充表单数据
watch(
  () => props.lotteryCode,
  (lotteryCode) => {
    if (lotteryCode) {
      formData.value = {
        code: lotteryCode.code,
        participant_info: {
          name: lotteryCode.participant_info?.name || '',
          phone: lotteryCode.participant_info?.phone || '',
          email: lotteryCode.participant_info?.email || '',
        },
      };
    }
  },
  { immediate: true }
);

// 表单验证
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (!formData.value.participant_info.name.trim()) {
    newErrors.name = '参与者姓名不能为空';
  }

  if (!formData.value.participant_info.phone.trim()) {
    newErrors.phone = '手机号不能为空';
  } else if (!/^1[3-9]\d{9}$/.test(formData.value.participant_info.phone)) {
    newErrors.phone = '请输入有效的手机号';
  }

  if (
    formData.value.participant_info.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.participant_info.email)
  ) {
    newErrors.email = '请输入有效的邮箱地址';
  }

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

// 处理表单提交
const handleSubmit = () => {
  if (!validateForm()) {
    return;
  }

  if (isEdit.value) {
    // 编辑模式，只提交参与者信息
    const submitData: UpdateParticipantInfoRequest = {
      participant_info: formData.value.participant_info,
    };
    emit('submit', submitData);
  } else {
    // 新增模式，提交完整数据
    const submitData: AddLotteryCodeRequest = {
      code: formData.value.code || undefined,
      participant_info: formData.value.participant_info,
    };
    emit('submit', submitData);
  }
};
</script>
