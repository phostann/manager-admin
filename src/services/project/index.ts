import { request } from '@/utils/request';
import { IPageResponse } from 'types';

export interface IProject {
  id: number;
  name: string;
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

export const getProjectList = async (
  params: IProjectPageParams,
): Promise<IPageResponse<IProject>> => {
  return request.get('/project/page', { params });
};
