// API 类型定义
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'super_admin' | 'admin';
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Activity {
  id: number;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'ended';
  lottery_mode: 'offline' | 'online';
  start_time?: string;
  end_time?: string;
  settings?: {
    max_lottery_codes?: number;
    lottery_code_format?: '4_digit_number' | '8_digit_number' | '8_digit_alphanumeric' | '12_digit_number' | '12_digit_alphanumeric';
    allow_duplicate_phone?: boolean;
  };
  created_at: string;
  lottery_codes_count?: number;
  remaining_lottery_codes?: number;
  used_lottery_codes?: number;
  prizes?: Prize[];
}

export interface Prize {
  id: number;
  name: string;
  description?: string;
  total_quantity: number;
  remaining_quantity: number;
  probability: number;
  sort_order: number;
}

export interface LotteryCode {
  id: number;
  code: string;
  status: 'unused' | 'used';
  participant_info?: {
    name: string;
    phone: string;
    email?: string;
  };
  used_at?: string;
  created_at: string;
}

export interface LotteryRecord {
  id: number;
  is_winner: boolean;
  created_at: string;
  lottery_code: LotteryCode;
  prize?: Prize;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
  };
}

// 请求参数类型
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'super_admin';
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface CreateActivityRequest {
  name: string;
  description?: string;
  lottery_mode: 'offline' | 'online';
  start_time?: string;
  end_time?: string;
  settings?: {
    max_lottery_codes?: number;
    lottery_code_format?: '4_digit_number' | '8_digit_number' | '8_digit_alphanumeric' | '12_digit_number' | '12_digit_alphanumeric';
    allow_duplicate_phone?: boolean;
  };
}

export interface UpdateActivityRequest {
  name?: string;
  description?: string;
  status?: 'draft' | 'active' | 'ended';
  start_time?: string;
  end_time?: string;
}

export interface DrawLotteryRequest {
  lottery_code: string;
  participant_info: {
    name: string;
    phone: string;
    email?: string;
  };
}

export interface CreatePrizeRequest {
  name: string;
  description?: string;
  total_quantity: number;
  probability: number;
  sort_order?: number;
}

export interface UpdatePrizeRequest {
  name?: string;
  description?: string;
  total_quantity?: number;
  probability?: number;
  sort_order?: number;
}

export interface AddLotteryCodeRequest {
  code?: string;
  participant_info?: {
    name: string;
    phone: string;
    email?: string;
  };
}

export interface BatchAddLotteryCodesRequest {
  count: number;
  participant_infos?: Array<{
    name: string;
    phone: string;
    email?: string;
  }>;
}

// 查询参数类型
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams extends PaginationParams {
  search?: string;
}

export interface UserListParams extends SearchParams {
  role?: 'admin' | 'super_admin';
  status?: 'active' | 'inactive';
}

export interface ActivityListParams extends SearchParams {
  status?: 'draft' | 'active' | 'ended';
  lottery_mode?: 'offline' | 'online';
}

export interface LotteryCodeListParams extends SearchParams {
  status?: 'unused' | 'used';
  has_participant_info?: boolean;
}

export interface LotteryRecordListParams extends PaginationParams {
  activity_id?: number;
  is_winner?: boolean;
  winner_only?: boolean;
  start_date?: string;
  end_date?: string;
  participant_name?: string;
  lottery_code?: string;
}

// export interface ImportLotteryCodesRequest {
//   file: File;
// }

export interface UpdateParticipantInfoRequest {
  participant_info: {
    name: string;
    phone: string;
    email?: string;
  };
}

export interface OfflineDrawRequest {
  lottery_code: string;
  prize_id: number;
}

export interface ResetPasswordRequest {
  new_password: string;
}

export interface CleanupLogsRequest {
  days: number;
}

// 系统相关类型
export interface OperationLog {
  id: number;
  user_id: number;
  operation_type: string;
  description: string;
  target_type: string;
  target_id: number;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user?: {
    id: number;
    username: string;
  };
}

export interface SystemOverview {
  total_users: number;
  total_activities: number;
  total_lottery_codes: number;
  total_lottery_records: number;
  recent_activities: number;
  recent_lotteries: number;
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  database: string;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  version: string;
}

export interface LotteryStatistics {
  total_lottery_codes: number;
  total_lottery_records: number;
  total_winners: number;
  win_rate: string;
  prize_statistics: Array<{
    id: number;
    name: string;
    total_quantity: number;
    remaining_quantity: number;
    awarded_count: number;
    award_rate: string;
  }>;
}

export interface WebhookInfo {
  webhook_url: string;
  webhook_token: string;
  activity_id: string;
}

export interface OperationLogListParams {
  page?: number;
  limit?: number;
  user_id?: number;
  operation_type?: string;
  target_type?: string;
  start_date?: string;
  end_date?: string;
}

// 响应数据类型
export interface UserListResponse {
  users: User[];
  pagination: Pagination;
}

export interface ActivityListResponse {
  activities: Activity[];
  pagination: Pagination;
}

export interface LotteryCodeListResponse {
  lottery_codes: LotteryCode[];
  pagination: Pagination;
}

export interface LotteryRecordListResponse {
  records: LotteryRecord[];
  pagination: Pagination;
}

export interface OperationLogListResponse {
  logs: OperationLog[];
  pagination: Pagination;
}

export interface DrawLotteryResponse {
  is_winner: boolean;
  prize?: Prize;
  lottery_record: {
    id: number;
    created_at: string;
  };
  lottery_code: LotteryCode;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// 系统设置相关类型
// export interface SystemSettings {
//   systemName: string;
//   version: string;
//   allowMultipleWins: boolean;
//   autoLottery: boolean;
//   maxParticipants: number;
//   emailNotification: boolean;
//   smsNotification: boolean;
//   sessionTimeout: number;
//   forcePasswordChange: boolean;
// }

// i18n 相关类型
export type Locale = 'en-US' | 'zh-CN';

export interface I18nConfig {
  locale: Locale;
  fallbackLocale: Locale;
  messages: Record<Locale, Record<string, string | Record<string, string>>>;
}