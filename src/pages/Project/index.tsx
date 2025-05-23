import { getProjectList, IProject, IProjectPageParams } from '@/services/project';
import { EllipsisOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import { history } from '@umijs/max';
import { Button, Dropdown, Form, Input } from 'antd';
import Table, { ColumnProps } from 'antd/es/table';
import { MenuInfo } from 'rc-menu/lib/interface';
import { useState } from 'react';

export default function Project() {
  const [queryForm] = Form.useForm<Pick<IProjectPageParams, 'name'>>();

  const [params, setParams] = useState<IProjectPageParams>({
    page: 1,
    size: 10,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['project', params],
    queryFn: () => getProjectList(params),
  });

  const handleMenuClick = (info: MenuInfo, id: number) => {
    switch (info.key) {
      case 'resource':
        history.push(`/project/${id}/resource`);
        break;
      case 'node':
        history.push(`/project/${id}/node`);
        break;
      case 'edit-config':
        history.push(`/project/${id}/config`);
        break;

      default:
        console.log('未找到');
    }
  };

  const columns: ColumnProps<IProject>[] = [
    {
      title: '项目名称',
      dataIndex: 'name',
    },
    {
      title: '节点数量',
      dataIndex: 'node_count',
    },
    {
      title: '资源数量',
      dataIndex: 'resource_count',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
    },
    {
      title: '操作',
      dataIndex: 'action',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { label: '资源管理', key: 'resource' },
              { label: '节点管理', key: 'node' },
              { label: '编辑项目', key: 'edit' },
              { label: '编辑配置', key: 'edit-config' },
              { label: '删除项目', key: 'delete', danger: true },
            ],
            onClick: (e) => {
              handleMenuClick(e, record.id);
            },
          }}
        >
          <EllipsisOutlined className="cursor-pointer" />
        </Dropdown>
      ),
    },
  ];

  const handleSearch = (values: Pick<IProjectPageParams, 'name'>) => {
    setParams({ ...params, page: 1, ...values });
  };

  const handleReset = () => {
    setParams({ ...params, name: undefined, page: 1 });
  };

  return (
    <PageContainer>
      <div className="p-4 bg-white">
        <Form form={queryForm} layout="inline" onFinish={handleSearch} onReset={handleReset}>
          <Form.Item label="项目名称" name="name">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              搜索
            </Button>
          </Form.Item>
          <Form.Item>
            <Button htmlType="reset">重置</Button>
          </Form.Item>
        </Form>
      </div>
      <div className="p-4 bg-white mt-4">
        <Table<IProject>
          columns={columns}
          dataSource={data?.data?.records}
          loading={isLoading}
          rowKey={'id'}
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
