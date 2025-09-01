import { ref, type Ref } from 'vue';
import { ApiError } from '../api';

interface UseApiOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

interface UseApiReturn<T, TArgs extends unknown[]> {
  data: Ref<T | null>;
  loading: Ref<boolean>;
  error: Ref<ApiError | null>;
  execute: (...args: TArgs) => Promise<T | null>;
  reset: () => void;
}

/**
 * 用于处理API请求的composable
 */
export function useApi<T, TArgs extends unknown[] = []>(
  apiFunction: (...args: TArgs) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T, TArgs> {
  const data = ref<T | null>(null) as Ref<T | null>;
  const loading = ref(false);
  const error = ref<ApiError | null>(null);

  const execute = async (...args: TArgs): Promise<T | null> => {
    try {
      loading.value = true;
      error.value = null;
      
      const result = await apiFunction(...args);
      data.value = result;
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('UNKNOWN_ERROR', String(err));
      error.value = apiError;
      
      if (options.onError) {
        options.onError(apiError);
      }
      
      return null;
    } finally {
      loading.value = false;
    }
  };

  const reset = () => {
    data.value = null;
    loading.value = false;
    error.value = null;
  };

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface BasePaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * 用于处理分页数据的composable
 */
export function usePaginatedApi<T, TParams extends BasePaginationParams = BasePaginationParams>(
  apiFunction: (params?: TParams) => Promise<{ activities?: T[]; data?: T[]; pagination: PaginationData }>,
  defaultParams: TParams = {} as TParams
) {
  const data = ref<T[]>([]) as Ref<T[]>;
  const pagination = ref<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const loading = ref(false);
  const error = ref<ApiError | null>(null);
  const params = ref(defaultParams);

  const loadData = async (newParams?: Partial<TParams>) => {
    try {
      loading.value = true;
      error.value = null;
      
      const mergedParams = { ...params.value, ...newParams } as TParams;
      const result = await apiFunction(mergedParams);
      
      // 兼容不同的响应结构
      data.value = result.activities || result.data || [];
      pagination.value = result.pagination;
      params.value = mergedParams;
      
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('UNKNOWN_ERROR', String(err));
      error.value = apiError;
      data.value = [];
    } finally {
      loading.value = false;
    }
  };

  const nextPage = async () => {
    if (pagination.value.page < pagination.value.totalPages) {
      await loadData({ page: pagination.value.page + 1 } as Partial<TParams>);
    }
  };

  const prevPage = async () => {
    if (pagination.value.page > 1) {
      await loadData({ page: pagination.value.page - 1 } as Partial<TParams>);
    }
  };

  const goToPage = async (page: number) => {
    await loadData({ page } as Partial<TParams>);
  };

  const setLimit = async (limit: number) => {
    await loadData({ page: 1, limit } as Partial<TParams>);
  };

  const search = async (searchTerm: string) => {
    await loadData({ page: 1, search: searchTerm } as Partial<TParams>);
  };

  const refresh = async () => {
    await loadData();
  };

  const reset = () => {
    data.value = [];
    pagination.value = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    };
    params.value = defaultParams;
    error.value = null;
  };

  return {
    data,
    pagination,
    loading,
    error,
    params,
    loadData,
    nextPage,
    prevPage,
    goToPage,
    setLimit,
    search,
    refresh,
    reset,
  };
}

/**
 * 用于处理表单提交的composable
 */
export function useFormSubmit<T, R>(
  apiFunction: (data: T) => Promise<R>,
  options: {
    onSuccess?: (result: R) => void;
    onError?: (error: ApiError) => void;
    resetOnSuccess?: boolean;
  } = {}
) {
  const loading = ref(false);
  const error = ref<ApiError | null>(null);
  const success = ref(false);

  const submit = async (formData: T): Promise<R | null> => {
    try {
      loading.value = true;
      error.value = null;
      success.value = false;
      
      const result = await apiFunction(formData);
      success.value = true;
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('UNKNOWN_ERROR', String(err));
      error.value = apiError;
      
      if (options.onError) {
        options.onError(apiError);
      }
      
      return null;
    } finally {
      loading.value = false;
    }
  };

  const reset = () => {
    loading.value = false;
    error.value = null;
    success.value = false;
  };

  return {
    loading,
    error,
    success,
    submit,
    reset,
  };
}
