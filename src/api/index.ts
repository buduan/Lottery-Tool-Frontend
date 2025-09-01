import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios';
import type {
  User,
  Activity,
  Prize,
  LotteryCode,
  ApiResponse,
  ErrorResponse,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  CreateActivityRequest,
  UpdateActivityRequest,
  CreatePrizeRequest,
  UpdatePrizeRequest,
  AddLotteryCodeRequest,
  BatchAddLotteryCodesRequest,
  UserListParams,
  ActivityListParams,
  LotteryCodeListParams,
  LotteryRecordListParams,
  SystemOverview,
  SystemHealth,
  LotteryStatistics,
  WebhookInfo,
  UpdateParticipantInfoRequest,
  OfflineDrawRequest,
  ResetPasswordRequest,
  CleanupLogsRequest,
  OperationLogListParams,
  UserListResponse,
  ActivityListResponse,
  LotteryCodeListResponse,
  LotteryRecordListResponse,
  OperationLogListResponse,
  DrawLotteryResponse,
  LoginResponse,
} from '../types/api';

// API 基础配置
const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const windowEnv = (window as { ENV?: { VITE_API_BASE_URL?: string } })?.ENV;
    return windowEnv?.VITE_API_BASE_URL || 'http://localhost:3000/api';
  }
  return 'http://localhost:3000/api';
};

const API_BASE_URL = getApiBaseUrl();

// API 错误类
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 获取认证 token
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

// 设置认证 token
function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

// 清除认证 token
function clearAuthToken(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_info');
}

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token 过期或无效，清除本地存储并跳转到登录页
      clearAuthToken();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// 通用API请求方法
async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: unknown,
  config?: Record<string, unknown>
): Promise<T> {
  try {
    const response = await apiClient.request<ApiResponse<T>>({
      method,
      url,
      data,
      ...config,
    });

    if (!response.data.success) {
      const errorData = response.data as unknown as ErrorResponse;
      throw new ApiError(
        errorData.error.code,
        errorData.error.message,
        errorData.error.details,
        response.status
      );
    }

    return response.data.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data?.error) {
        throw new ApiError(
          axiosError.response.data.error.code,
          axiosError.response.data.error.message,
          axiosError.response.data.error.details,
          axiosError.response.status
        );
      } else {
        throw new ApiError(
          'NETWORK_ERROR',
          axiosError.message || '网络错误',
          undefined,
          axiosError.response?.status
        );
      }
    }

    throw new ApiError('UNKNOWN_ERROR', '未知错误');
  }
}

// ============= 认证模块 API =============

/**
 * 用户登录
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const result = await apiRequest<LoginResponse>('POST', '/auth/login', credentials);
  // 保存token和用户信息
  setAuthToken(result.token);
  localStorage.setItem('user_info', JSON.stringify(result.user));
  return result;
}

/**
 * 用户注册
 */
export async function register(userData: RegisterRequest): Promise<{ user: User }> {
  return apiRequest<{ user: User }>('POST', '/auth/register', userData);
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<{ user: User }> {
  return apiRequest<{ user: User }>('GET', '/auth/me');
}

/**
 * 修改密码
 */
export async function changePassword(passwordData: ChangePasswordRequest): Promise<void> {
  await apiRequest<void>('PUT', '/auth/password', passwordData);
}

/**
 * 用户登出
 */
export async function logout(): Promise<void> {
  try {
    await apiRequest<void>('POST', '/auth/logout');
  } finally {
    clearAuthToken();
  }
}

// ============= 活动管理 API =============

/**
 * 获取活动列表
 */
export async function getActivities(params?: ActivityListParams): Promise<ActivityListResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.search) query.append('search', params.search);
  if (params?.status) query.append('status', params.status);
  
  const queryString = query.toString();
  const url = queryString ? `/admin/activities?${queryString}` : '/admin/activities';
  
  return apiRequest<ActivityListResponse>('GET', url);
}

/**
 * 获取活动详情
 */
export async function getActivity(id: number): Promise<{ activity: Activity }> {
  return apiRequest<{ activity: Activity }>('GET', `/admin/activities/${id}`);
}

/**
 * 创建活动
 */
export async function createActivity(activityData: CreateActivityRequest): Promise<{ activity: Activity }> {
  return apiRequest<{ activity: Activity }>('POST', '/admin/activities', activityData);
}

/**
 * 更新活动
 */
export async function updateActivity(id: number, activityData: UpdateActivityRequest): Promise<{ activity: Activity }> {
  return apiRequest<{ activity: Activity }>('PUT', `/admin/activities/${id}`, activityData);
}

/**
 * 删除活动
 */
export async function deleteActivity(id: number): Promise<void> {
  await apiRequest<void>('DELETE', `/admin/activities/${id}`);
}

// ============= 奖品管理 API =============

/**
 * 获取活动奖品列表
 */
export async function getActivityPrizes(activityId: number): Promise<{ prizes: Prize[] }> {
  return apiRequest<{ prizes: Prize[] }>('GET', `/admin/activities/${activityId}/prizes`);
}

/**
 * 添加奖品
 */
export async function createPrize(activityId: number, prizeData: CreatePrizeRequest): Promise<{ prize: Prize }> {
  return apiRequest<{ prize: Prize }>('POST', `/admin/activities/${activityId}/prizes`, prizeData);
}

/**
 * 更新奖品
 */
export async function updatePrize(prizeId: number, prizeData: UpdatePrizeRequest): Promise<{ prize: Prize }> {
  return apiRequest<{ prize: Prize }>('PUT', `/admin/prizes/${prizeId}`, prizeData);
}

/**
 * 删除奖品
 */
export async function deletePrize(prizeId: number): Promise<void> {
  await apiRequest<void>('DELETE', `/admin/prizes/${prizeId}`);
}

// ============= 抽奖码管理 API =============

/**
 * 获取活动抽奖码列表
 */
export async function getActivityLotteryCodes(
  activityId: number, 
  params?: LotteryCodeListParams
): Promise<LotteryCodeListResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.search) query.append('search', params.search);
  if (params?.status) query.append('status', params.status);
  if (params?.has_participant_info !== undefined) {
    query.append('has_participant_info', params.has_participant_info.toString());
  }
  
  const queryString = query.toString();
  const url = queryString 
    ? `/admin/activities/${activityId}/lottery-codes?${queryString}` 
    : `/admin/activities/${activityId}/lottery-codes`;
  
  return apiRequest<LotteryCodeListResponse>('GET', url);
}

/**
 * 单个添加抽奖码
 */
export async function addLotteryCode(
  activityId: number, 
  codeData: AddLotteryCodeRequest
): Promise<{ lottery_code: LotteryCode }> {
  return apiRequest<{ lottery_code: LotteryCode }>('POST', `/admin/activities/${activityId}/lottery-codes`, codeData);
}

/**
 * 批量创建抽奖码
 */
export async function batchCreateLotteryCodes(
  activityId: number, 
  batchData: BatchAddLotteryCodesRequest
): Promise<{ created_count: number; lottery_codes: LotteryCode[] }> {
  return apiRequest<{ created_count: number; lottery_codes: LotteryCode[] }>(
    'POST', 
    `/admin/activities/${activityId}/lottery-codes/batch`, 
    batchData
  );
}

/**
 * 批量导入抽奖码
 */
export async function importLotteryCodes(
  activityId: number, 
  file: File
): Promise<{ imported_count: number; lottery_codes: LotteryCode[] }> {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiRequest<{ imported_count: number; lottery_codes: LotteryCode[] }>(
    'POST', 
    `/admin/activities/${activityId}/lottery-codes/import`, 
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
}

/**
 * 修改抽奖码参与者信息
 */
export async function updateLotteryCodeParticipant(
  codeId: number, 
  participantData: UpdateParticipantInfoRequest
): Promise<{ lottery_code: LotteryCode }> {
  return apiRequest<{ lottery_code: LotteryCode }>(
    'PUT', 
    `/admin/lottery-codes/${codeId}/participant-info`, 
    participantData
  );
}

/**
 * 批量删除抽奖码
 */
export async function batchDeleteLotteryCodes(
  activityId: number, 
  codeIds: number[]
): Promise<void> {
  await apiRequest<void>('DELETE', `/admin/activities/${activityId}/lottery-codes/batch`, {
    lottery_code_ids: codeIds,
  });
}

/**
 * 获取导入模板
 */
export async function downloadImportTemplate(): Promise<Blob> {
  const response = await apiClient.get('/admin/lottery-codes/template', {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * 获取活动Webhook信息
 */
export async function getActivityWebhookInfo(activityId: number): Promise<WebhookInfo> {
  return apiRequest<WebhookInfo>('GET', `/admin/activities/${activityId}/webhook-info`);
}

// ============= 抽奖模块 API =============

/**
 * 获取活动抽奖信息（公开接口）
 */
export async function getLotteryActivity(activityId: number): Promise<{ activity: Activity; prizes: Prize[]; lottery_codes_count: number }> {
  // 对于公开接口，暂时移除requireAuth配置，使用基础请求
  return apiRequest<{ activity: Activity; prizes: Prize[]; lottery_codes_count: number }>(
    'GET', 
    `/lottery/activities/${activityId}`
  );
}

/**
 * 用户线上抽奖
 */
export async function drawLottery(
  activityId: number, 
  drawData: { lottery_code: string }
): Promise<DrawLotteryResponse> {
  return apiRequest<DrawLotteryResponse>(
    'POST', 
    `/lottery/activities/${activityId}/draw`, 
    drawData
  );
}

/**
 * 管理员线下抽奖
 */
export async function offlineDrawLottery(
  activityId: number, 
  drawData: OfflineDrawRequest
): Promise<DrawLotteryResponse> {
  return apiRequest<DrawLotteryResponse>('POST', `/lottery/activities/${activityId}/offline-draw`, drawData);
}

/**
 * 获取抽奖记录
 */
export async function getLotteryRecords(
  activityId: number, 
  params?: LotteryRecordListParams
): Promise<LotteryRecordListResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.winner_only) query.append('winner_only', 'true');
  if (params?.participant_name) query.append('participant_name', params.participant_name);
  if (params?.lottery_code) query.append('lottery_code', params.lottery_code);
  
  const queryString = query.toString();
  const url = queryString 
    ? `/lottery/activities/${activityId}/records?${queryString}` 
    : `/lottery/activities/${activityId}/records`;
  
  return apiRequest<LotteryRecordListResponse>('GET', url);
}

/**
 * 获取抽奖统计信息
 */
export async function getLotteryStatistics(activityId: number): Promise<{ statistics: LotteryStatistics }> {
  return apiRequest<{ statistics: LotteryStatistics }>('GET', `/lottery/activities/${activityId}/statistics`);
}

// ============= 抽奖记录管理 API =============

/**
 * 获取抽奖记录列表（管理员）
 */
export async function getAdminLotteryRecords(params?: LotteryRecordListParams): Promise<LotteryRecordListResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.activity_id) query.append('activity_id', params.activity_id.toString());
  if (params?.winner_only) query.append('winner_only', 'true');
  if (params?.start_date) query.append('start_date', params.start_date);
  if (params?.end_date) query.append('end_date', params.end_date);
  
  const queryString = query.toString();
  const url = queryString ? `/admin/lottery-records?${queryString}` : '/admin/lottery-records';
  
  return apiRequest<LotteryRecordListResponse>('GET', url);
}

// ============= 系统管理 API =============

/**
 * 获取用户列表
 */
export async function getUsers(params?: UserListParams): Promise<UserListResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.search) query.append('search', params.search);
  if (params?.role) query.append('role', params.role);
  
  const queryString = query.toString();
  const url = queryString ? `/system/users?${queryString}` : '/system/users';
  
  return apiRequest<UserListResponse>('GET', url);
}

/**
 * 创建用户
 */
export async function createUser(userData: RegisterRequest): Promise<{ user: User }> {
  return apiRequest<{ user: User }>('POST', '/system/users', userData);
}

/**
 * 更新用户
 */
export async function updateUser(userId: number, userData: Partial<User>): Promise<{ user: User }> {
  return apiRequest<{ user: User }>('PUT', `/system/users/${userId}`, userData);
}

/**
 * 重置用户密码
 */
export async function resetUserPassword(userId: number, passwordData: ResetPasswordRequest): Promise<void> {
  await apiRequest<void>('POST', `/system/users/${userId}/reset-password`, passwordData);
}

/**
 * 删除用户
 */
export async function deleteUser(userId: number): Promise<void> {
  await apiRequest<void>('DELETE', `/system/users/${userId}`);
}

/**
 * 获取操作日志列表
 */
export async function getOperationLogs(params?: OperationLogListParams): Promise<OperationLogListResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.user_id) query.append('user_id', params.user_id.toString());
  if (params?.operation_type) query.append('operation_type', params.operation_type);
  if (params?.target_type) query.append('target_type', params.target_type);
  if (params?.start_date) query.append('start_date', params.start_date);
  if (params?.end_date) query.append('end_date', params.end_date);
  
  const queryString = query.toString();
  const url = queryString ? `/system/operation-logs?${queryString}` : '/system/operation-logs';
  
  return apiRequest<OperationLogListResponse>('GET', url);
}

/**
 * 获取操作类型统计
 */
export async function getOperationLogStatistics(): Promise<{ statistics: Array<{ operation_type: string; count: number }> }> {
  return apiRequest<{ statistics: Array<{ operation_type: string; count: number }> }>('GET', '/system/operation-logs/statistics');
}

/**
 * 清理操作日志
 */
export async function cleanupOperationLogs(cleanupData: CleanupLogsRequest): Promise<{ deleted_count: number }> {
  return apiRequest<{ deleted_count: number }>('DELETE', '/system/operation-logs/cleanup', cleanupData);
}

/**
 * 获取系统概览
 */
export async function getSystemOverview(): Promise<{ overview: SystemOverview }> {
  return apiRequest<{ overview: SystemOverview }>('GET', '/system/overview');
}

/**
 * 获取系统健康状态
 */
export async function getSystemHealth(): Promise<{ health: SystemHealth }> {
  return apiRequest<{ health: SystemHealth }>('GET', '/system/health');
}

/**
 * 获取系统统计数据
 */
export async function getSystemStats(): Promise<{
  total_users: number;
  total_activities: number;
  total_lottery_codes: number;
  total_lottery_records: number;
}> {
  return apiRequest<{
    total_users: number;
    total_activities: number;
    total_lottery_codes: number;
    total_lottery_records: number;
  }>('GET', '/stats');
}

// ======================== 分类 API 结构 ========================

// 认证相关 API
export const authApi = {
  login,
  register,
  logout,
  me: getCurrentUser,
  changePassword,
};

// 抽奖相关 API
export const lotteryApi = {
  draw: drawLottery,
  drawOffline: offlineDrawLottery,
  getRecords: getLotteryRecords,
  getAdminRecords: getAdminLotteryRecords,
  updateParticipant: updateLotteryCodeParticipant,
  getStatistics: getLotteryStatistics,
  getActivity: getLotteryActivity,
};

// 系统管理相关 API
export const systemApi = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  getOperationLogs,
  getOperationLogStatistics,
  cleanupLogs: cleanupOperationLogs,
  getSystemOverview,
  getHealth: getSystemHealth,
};

// 活动管理相关 API
export const adminActivityApi = {
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  getWebhookInfo: getActivityWebhookInfo,
};

// 奖品管理相关 API
export const adminPrizeApi = {
  getPrizes: getActivityPrizes,
  createPrize,
  updatePrize,
  deletePrize,
};

// 抽奖码管理相关 API
export const adminLotteryCodeApi = {
  getLotteryCodes: getActivityLotteryCodes,
  addLotteryCode,
  batchCreate: batchCreateLotteryCodes,
  import: importLotteryCodes,
  downloadTemplate: downloadImportTemplate,
  batchDelete: batchDeleteLotteryCodes,
};

// 统计相关 API
export const statsApi = {
  getSystemStats,
};

// 主要的 API 导出结构
export const API = {
  auth: authApi,
  lottery: lotteryApi,
  system: systemApi,
  adminActivity: adminActivityApi,
  adminPrize: adminPrizeApi,
  adminLotteryCode: adminLotteryCodeApi,
  stats: statsApi,
};

// 导出工具函数
export { setAuthToken, clearAuthToken, getAuthToken };
