<template>
  <div class="space-y-6">
    <!-- 文件上传区域 -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium">批量导入抽奖码</h3>
        <Button
          variant="outline"
          @click="downloadTemplate"
          :disabled="downloading"
        >
          <Download v-if="!downloading" class="mr-2 h-4 w-4" />
          <Loader2 v-if="downloading" class="mr-2 h-4 w-4 animate-spin" />
          下载模板
        </Button>
      </div>

      <!-- 文件拖拽上传区 -->
      <div
        class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
        :class="{ 'border-blue-500 bg-blue-50': isDragOver }"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
      >
        <Upload class="mx-auto h-12 w-12 text-gray-400" />
        <div class="mt-4">
          <p class="text-sm text-gray-600">
            拖拽文件到此处，或
            <button
              type="button"
              class="text-blue-600 hover:text-blue-500 underline"
              @click="triggerFileInput"
            >
              点击选择文件
            </button>
          </p>
          <p class="text-xs text-gray-500 mt-1">
            支持 .xlsx, .xls, .csv 格式文件，最大 5MB
          </p>
        </div>
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          accept=".xlsx,.xls,.csv"
          @change="handleFileSelect"
        />
      </div>

      <!-- 选中的文件信息 -->
      <div v-if="selectedFile" class="bg-gray-50 p-4 rounded-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <FileText class="h-8 w-8 text-blue-600" />
            <div>
              <p class="text-sm font-medium text-gray-900">
                {{ selectedFile.name }}
              </p>
              <p class="text-xs text-gray-500">
                {{ formatFileSize(selectedFile.size) }}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" @click="removeFile">
            <X class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <!-- 错误信息 -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex">
          <AlertCircle class="h-5 w-5 text-red-400" />
          <div class="ml-3">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 导入设置 -->
    <div class="space-y-4">
      <h4 class="text-md font-medium">导入设置</h4>

      <div class="space-y-3">
        <!-- 重复处理方式 -->
        <div class="space-y-2">
          <Label class="text-sm font-medium">重复数据处理</Label>
          <Select v-model="importSettings.duplicateHandling">
            <SelectTrigger>
              <SelectValue placeholder="选择重复数据处理方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="skip">跳过重复数据</SelectItem>
              <SelectItem value="overwrite">覆盖重复数据</SelectItem>
              <SelectItem value="error">遇到重复数据时报错</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- 验证选项 -->
        <div class="space-y-2">
          <Label class="text-sm font-medium">数据验证</Label>
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <input
                id="validate_phone"
                type="checkbox"
                v-model="importSettings.validatePhone"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label for="validate_phone" class="text-sm">验证手机号格式</Label>
            </div>
            <div class="flex items-center space-x-2">
              <input
                id="validate_email"
                type="checkbox"
                v-model="importSettings.validateEmail"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label for="validate_email" class="text-sm">验证邮箱格式</Label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex justify-end space-x-4">
      <Button type="button" variant="outline" @click="$emit('cancel')">
        取消
      </Button>
      <Button
        type="button"
        @click="handleImport"
        :disabled="!selectedFile || importing"
      >
        <Loader2 v-if="importing" class="mr-2 h-4 w-4 animate-spin" />
        <Upload v-else class="mr-2 h-4 w-4" />
        开始导入
      </Button>
    </div>

    <!-- 导入进度 -->
    <div v-if="importing" class="space-y-2">
      <div class="flex justify-between text-sm">
        <span>导入进度</span>
        <span>{{ importProgress }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${importProgress}%` }"
        ></div>
      </div>
    </div>

    <!-- 导入结果 -->
    <div
      v-if="importResult"
      class="bg-green-50 border border-green-200 rounded-lg p-4"
    >
      <div class="flex">
        <CheckCircle class="h-5 w-5 text-green-400" />
        <div class="ml-3">
          <p class="text-sm text-green-800">
            导入完成！成功导入 {{ importResult.imported_count }} 个抽奖码
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Upload,
  Download,
  FileText,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-vue-next';
import { API } from '@/api/index';
import type { LotteryCode } from '@/types/api';

interface Props {
  activityId: number;
}

interface Emits {
  (
    e: 'success',
    result: { imported_count: number; lottery_codes: LotteryCode[] }
  ): void;
  (e: 'cancel'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 文件相关
const fileInput = ref<HTMLInputElement>();
const selectedFile = ref<File | null>(null);
const isDragOver = ref(false);

// 状态
const downloading = ref(false);
const importing = ref(false);
const importProgress = ref(0);
const error = ref<string>('');
const importResult = ref<{
  imported_count: number;
  lottery_codes: LotteryCode[];
} | null>(null);

// 导入设置
const importSettings = ref({
  duplicateHandling: 'skip',
  validatePhone: true,
  validateEmail: true,
});

// 下载模板
const downloadTemplate = async () => {
  try {
    downloading.value = true;
    const blob = await API.adminLotteryCode.downloadTemplate();

    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '抽奖码导入模板.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch {
    error.value = '下载模板失败，请重试';
  } finally {
    downloading.value = false;
  }
};

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click();
};

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    selectFile(file);
  }
};

// 处理拖拽
const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = () => {
  isDragOver.value = false;
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;

  const file = event.dataTransfer?.files[0];
  if (file) {
    selectFile(file);
  }
};

// 选择文件
const selectFile = (file: File) => {
  // 验证文件类型
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv', // .csv
  ];

  if (!allowedTypes.includes(file.type)) {
    error.value = '不支持的文件格式，请上传 .xlsx, .xls 或 .csv 文件';
    return;
  }

  // 验证文件大小 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    error.value = '文件大小不能超过 5MB';
    return;
  }

  selectedFile.value = file;
  error.value = '';
  importResult.value = null;
};

// 移除文件
const removeFile = () => {
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 开始导入
const handleImport = async () => {
  if (!selectedFile.value) return;

  try {
    importing.value = true;
    importProgress.value = 0;
    error.value = '';

    // 模拟进度更新
    const progressInterval = setInterval(() => {
      if (importProgress.value < 90) {
        importProgress.value += 10;
      }
    }, 200);

    const result = await API.adminLotteryCode.import(
      props.activityId,
      selectedFile.value
    );

    clearInterval(progressInterval);
    importProgress.value = 100;

    importResult.value = result;
    selectedFile.value = null;

    emit('success', result);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : '导入失败，请检查文件格式和内容';
    error.value = errorMessage;
  } finally {
    importing.value = false;
  }
};
</script>
