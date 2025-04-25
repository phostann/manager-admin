import React from 'react';
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query';
import { message } from 'antd';

// 创建全局的错误处理函数
const onError = (error: unknown) => {
  // 可以在这里统一处理错误，例如显示错误消息
  const errorMessage = error instanceof Error ? error.message : '未知错误';
  message.error(`请求失败: ${errorMessage}`);
};

// 创建QueryClient实例
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 查询配置
      retry: 1, // 查询失败时重试1次
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 指数退避策略
      staleTime: 5 * 60 * 1000, // 数据保持新鲜5分钟
      gcTime: 10 * 60 * 1000, // 垃圾回收时间10分钟 (之前叫 cacheTime)
      refetchOnWindowFocus: false, // 窗口获得焦点时不重新获取数据
      refetchOnMount: true, // 组件挂载时重新获取数据
    },
    mutations: {
      // 变更配置
      retry: 0, // 变更失败不重试
    },
  },
  // 查询缓存
  queryCache: new QueryCache({
    onError,
  }),
  // 变更缓存
  mutationCache: new MutationCache({
    onError,
  }),
});

// 创建React Query提供者组件
interface ReactQueryProviderProps {
  children: React.ReactNode;
}

export const ReactQueryProvider: React.FC<ReactQueryProviderProps> = ({ children }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default ReactQueryProvider;
