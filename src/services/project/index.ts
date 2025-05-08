import { request } from '@/utils/request';
import { IPageResponse, IResponse } from 'types';

export interface IProject {
  id: number;
  name: string;
  config?: string; // docker compose 配置文件内容
  node_count: number;
  resource_count: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface IProjectPageParams {
  name?: string;
  page?: number;
  size?: number;
}

export interface IProjectConfig {
  id: number;
  project_id: number;
  compose_config: string;
  created_at: string;
  updated_at: string;
}

export const getProjectList = async (
  params: IProjectPageParams,
): Promise<IPageResponse<IProject>> => {
  return request.get('/project/page', { params });
};

export const getProjectById = async (id: number): Promise<IResponse<IProject>> => {
  return request.get(`/project/${id}`);
};

export const getProjectConfig = async (id: string): Promise<IResponse<IProjectConfig>> => {
  return request.get(`/project/${id}/config`);
};

export interface IUpdateProjectPayload {
  name?: string;
  config?: string;
}

export const updateProject = async (id: number, params: IUpdateProjectPayload): Promise<void> => {
  return request.put(`/project/${id}`, params);
};
