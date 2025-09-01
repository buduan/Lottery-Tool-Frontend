<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <PageTitle :title="`用户详情 - ${user?.username || 'Loading...'}`" />
      <Button variant="outline" @click="$router.back()">
        返回
      </Button>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-500">{{ error }}</p>
      <Button @click="fetchUserDetail" class="mt-4">重试</Button>
    </div>

    <div v-else-if="user" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 用户基本信息 -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">基本信息</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>用户名</Label>
              <Input v-model="editForm.username" :disabled="!isEditing" />
            </div>
            <div>
              <Label>邮箱</Label>
              <Input v-model="editForm.email" :disabled="!isEditing" />
            </div>
            <div>
              <Label>角色</Label>
              <Select v-model="editForm.role" :disabled="!isEditing">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="super_admin">超级管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>状态</Label>
              <Select v-model="editForm.status" :disabled="!isEditing">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">活跃</SelectItem>
                  <SelectItem value="inactive">未激活</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>创建时间</Label>
              <Input :value="formatDate(user.created_at)" disabled />
            </div>
          </div>
          
          <div class="flex justify-end gap-2 mt-6">
            <Button v-if="!isEditing" @click="startEdit">编辑</Button>
            <template v-else>
              <Button variant="outline" @click="cancelEdit">取消</Button>
              <Button @click="saveChanges" :disabled="saving">
                {{ saving ? '保存中...' : '保存' }}
              </Button>
            </template>
          </div>
        </div>

        <!-- 密码重置 -->
        <div class="bg-white rounded-lg shadow p-6 mt-6">
          <h3 class="text-lg font-semibold mb-4">密码管理</h3>
          <div class="space-y-4">
            <div>
              <Label>新密码</Label>
              <Input 
                v-model="passwordForm.new_password" 
                type="password" 
                placeholder="输入新密码"
              />
            </div>
            <div>
              <Label>确认密码</Label>
              <Input 
                v-model="passwordForm.confirm_password" 
                type="password" 
                placeholder="确认新密码"
              />
            </div>
            <Button 
              @click="resetPassword" 
              :disabled="resettingPassword || !passwordForm.new_password"
              variant="destructive"
            >
              {{ resettingPassword ? '重置中...' : '重置密码' }}
            </Button>
          </div>
        </div>
      </div>

      <!-- 用户统计信息 -->
      <div class="space-y-6">
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">用户统计</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">登录次数</span>
              <span class="font-medium">--</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">最后登录</span>
              <span class="font-medium">--</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">创建活动数</span>
              <span class="font-medium">--</span>
            </div>
          </div>
        </div>

        <!-- 危险操作 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4 text-red-600">危险操作</h3>
          <div class="space-y-4">
            <p class="text-sm text-gray-600">
              删除用户将永久移除该用户的所有数据，此操作不可撤销。
            </p>
            <Button 
              @click="confirmDelete" 
              variant="destructive"
              :disabled="deleting"
            >
              {{ deleting ? '删除中...' : '删除用户' }}
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
import { API } from '@/api/index';
import type { User } from '@/types/api';
import PageTitle from '@/components/ui/text/pageTitle.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'vue-sonner';

const route = useRoute();
const router = useRouter();

// 响应式数据
const user = ref<User | null>(null);
const loading = ref(false);
const error = ref('');
const isEditing = ref(false);
const saving = ref(false);
const resettingPassword = ref(false);
const deleting = ref(false);

// 编辑表单
const editForm = ref({
  username: '',
  email: '',
  role: 'admin' as 'admin' | 'super_admin',
  status: 'active' as 'active' | 'inactive',
});

// 密码重置表单
const passwordForm = ref({
  new_password: '',
  confirm_password: '',
});

// 计算属性
const userId = computed(() => Number(route.params.id));

// 获取用户详情
const fetchUserDetail = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    // 注意：这里假设我们有一个获取单个用户的API
    // 如果没有，我们可以从用户列表中获取
    const users = await API.system.getUsers();
    const foundUser = users.users.find(u => u.id === userId.value);
    
    if (!foundUser) {
      error.value = '用户不存在';
      return;
    }
    
    user.value = foundUser;
    resetEditForm();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取用户信息失败';
  } finally {
    loading.value = false;
  }
};

// 重置编辑表单
const resetEditForm = () => {
  if (user.value) {
    editForm.value = {
      username: user.value.username,
      email: user.value.email,
      role: user.value.role,
      status: user.value.status,
    };
  }
};

// 开始编辑
const startEdit = () => {
  isEditing.value = true;
};

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false;
  resetEditForm();
};

// 保存更改
const saveChanges = async () => {
  try {
    saving.value = true;
    
    await API.system.updateUser(userId.value, editForm.value);
    
    // 更新本地数据
    if (user.value) {
      Object.assign(user.value, editForm.value);
    }
    
    isEditing.value = false;
    toast.success('用户信息更新成功');
  } catch (err) {
    toast.error('更新失败：' + (err instanceof Error ? err.message : '未知错误'));
  } finally {
    saving.value = false;
  }
};

// 重置密码
const resetPassword = async () => {
  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    toast.error('两次输入的密码不一致');
    return;
  }
  
  try {
    resettingPassword.value = true;
    
    await API.system.resetUserPassword(userId.value, {
      new_password: passwordForm.value.new_password,
    });
    
    passwordForm.value = { new_password: '', confirm_password: '' };
    toast.success('密码重置成功');
  } catch (err) {
    toast.error('密码重置失败：' + (err instanceof Error ? err.message : '未知错误'));
  } finally {
    resettingPassword.value = false;
  }
};

// 确认删除
const confirmDelete = () => {
  if (confirm('确定要删除这个用户吗？此操作不可撤销！')) {
    deleteUser();
  }
};

// 删除用户
const deleteUser = async () => {
  try {
    deleting.value = true;
    
    await API.system.deleteUser(userId.value);
    
    toast.success('用户删除成功');
    router.push('/admin/users');
  } catch (err) {
    toast.error('删除失败：' + (err instanceof Error ? err.message : '未知错误'));
  } finally {
    deleting.value = false;
  }
};

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN');
};

onMounted(() => {
  fetchUserDetail();
});
</script>