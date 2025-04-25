import { getNodesByProjectId, INode, INodePageParams, updateNodeAutoSync } from '@/services/node';
import { queryClient } from '@/utils/reactQueryConfig';
import { EllipsisOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from '@umijs/max';
import { Badge, Button, Dropdown, Form, Input, message, Switch } from 'antd';
import Table, { ColumnProps } from 'antd/es/table';
import { useState } from 'react';

export default function Node() {
  const { id } = useParams();

  const [queryForm] = Form.useForm<INodePageParams>();
  const [updatingNodeId, setUpdatingNodeId] = useState<number | null>(null);

  const [params, setParams] = useState<INodePageParams>({
    page: 1,
    size: 10,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['nodes', params],
    queryFn: () => getNodesByProjectId(Number(id), params),
  });

  const { mutate: updateNodeAutoSyncMutate, isPending: isUpdateNodeAutoSyncLoading } = useMutation({
    mutationFn: updateNodeAutoSync,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] });
    },
    onError: (error) => {
      message.error(error.message);
    },
  });

  const handleAutoSyncChange = (nodeId: number, checked: boolean) => {
    setUpdatingNodeId(nodeId);
    updateNodeAutoSyncMutate({ nodeId, autoSync: checked });
  };

  const columns: ColumnProps<INode>[] = [
    {
      title: '节点名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '节点IP',
      dataIndex: 'ip_addr',
      key: 'ip_addr',
    },
    {
      title: '自动同步',
      dataIndex: 'auto_sync',
      render: (_, record) => {
        return (
          <Switch
            checked={record.auto_sync}
            onChange={(checked) => handleAutoSyncChange(record.id, checked)}
            disabled={isUpdateNodeAutoSyncLoading && updatingNodeId === record.id}
          />
        );
      },
    },
    {
      title: '节点状态',
      dataIndex: 'status',
      render: (_, record) => {
        switch (record.status) {
          case 1:
            return <Badge status="success" text="在线"></Badge>;
          case 0:
            return <Badge status="error" text="离线"></Badge>;
          default:
            return null;
        }
      },
    },
    {
      title: '同步状态',
      dataIndex: 'auto_sync',
      render: (_, record) => {
        switch (record.sync_status) {
          case 0:
            return <Badge status="default" text="未同步"></Badge>;
          case 1:
            return <Badge status="processing" text="同步中"></Badge>;
          case 2:
            return <Badge status="error" text="同步失败"></Badge>;
          case 3:
            return <Badge status="success" text="同步成功"></Badge>;
          default:
            return null;
        }
      },
    },
    {
      title: '操作',
      dataIndex: 'action',
      render: (_, record) => {
        return (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'sync',
                  label: '手动同步',
                  disabled: record.sync_status === 1,
                },
                {
                  key: 'edit',
                  label: '编辑节点',
                },
                {
                  key: 'delete',
                  label: '删除节点',
                  danger: true,
                },
              ],
            }}
          >
            <EllipsisOutlined className="cursor-pointer" />
          </Dropdown>
        );
      },
    },
  ];

  const handleSearch = (values: Pick<INodePageParams, 'name'>) => {
    setParams({ ...params, page: 1, ...values });
  };

  const handleReset = () => {
    setParams({ ...params, name: undefined, page: 1 });
  };

  return (
    <PageContainer>
      <div className="p-4 bg-white">
        <Form form={queryForm} layout="inline" onFinish={handleSearch} onReset={handleReset}>
          <Form.Item label="节点名称" name="name">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
          </Form.Item>
          <Form.Item>
            <Button htmlType="reset">重置</Button>
          </Form.Item>
        </Form>
      </div>
      <div className="p-4 bg-white mt-4">
        <Table<INode>
          loading={isLoading}
          rowKey={'id'}
          columns={columns}
          dataSource={data?.data?.records}
          pagination={{
            total: data?.data?.total,
            current: params.page,
            pageSize: params.size,
            onChange: (page, pageSize) => {
              setParams({ ...params, page, size: pageSize });
            },
          }}
        ></Table>
      </div>
    </PageContainer>
  );
}
