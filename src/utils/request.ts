import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';

// 默认配置
const defaultConfig: AxiosRequestConfig = {
  baseURL: 'http://localhost:8888/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// 创建Axios实例
const _request: AxiosInstance = axios.create(defaultConfig);

// 请求拦截器
_request.interceptors.request.use(
  (config) => {
    // 从localStorage获取token，如果有则添加到请求头
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
_request.interceptors.response.use(
  (response: AxiosResponse) => {
    // 如果响应成功，则直接返回数据
    const { data } = response;

    // 可以根据你的后端API约定，判断请求是否成功
    // 例如：如果后端返回 { success: false, errorMessage: '...' }
    if (data && data.success === false) {
      message.error(data.errorMessage || '请求失败');
      return Promise.reject(new Error(data.errorMessage || '请求失败'));
    }

    return data;
  },
  (error) => {
    // 处理响应错误
    if (error.response) {
      // 请求已发出，但服务器返回状态码不在 2xx 范围内
      const { status } = error.response;

      switch (status) {
        case 400:
          message.error('请求错误');
          break;
        case 401:
          message.error('未授权，请重新登录');
          // 可以在这里处理登出逻辑
          // localStorage.removeItem('token');
          // window.location.href = '/login';
          break;
        case 403:
          message.error('拒绝访问');
          break;
        case 404:
          message.error('请求地址不存在');
          break;
        case 500:
          message.error('服务器错误');
          break;
        default:
          message.error(`连接错误 ${status}`);
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      message.error('网络异常，无法连接服务器');
    } else {
      // 请求配置有误
      message.error('请求配置错误: ' + error.message);
    }

    return Promise.reject(error);
  },
);

export const request = _request;
