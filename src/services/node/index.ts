import { request } from '@/utils/request';
import type { IPageResponse } from 'types';

export interface INode {
  id: number;
  name: string;
  uid: string;
  project_id: number;
  ip_addr: string;
  status: number;
  auto_sync: boolean;
  sync_status: number;
  created_at: string;
  updated_at: string;
}

export interface INodePageParams {
  name?: string;
  page?: number;
  size?: number;
}

export const getNodesByProjectId = async (
  projectId: number,
  params: INodePageParams,
): Promise<IPageResponse<INode>> => {
  return request.get(`/project/${projectId}/nodes/page`, { params });
};

export const updateNodeAutoSync = async (params: { nodeId: number; autoSync: boolean }) => {
  return request.put(`/node/${params.nodeId}/auto-sync`, { auto_sync: params.autoSync });
};
