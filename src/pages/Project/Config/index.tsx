import YamlEditor from '@/components/YamlEditor';
import { getProjectById, updateProject } from '@/services/project';
import { PageContainer } from '@ant-design/pro-components';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@umijs/max';
import { Alert, Button, Card, message, Space, Spin } from 'antd';
import { useEffect, useState } from 'react';

export default function ProjectConfig() {
  const { id } = useParams<{ id: string }>();
  const [yamlContent, setYamlContent] = useState<string>('');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editedContent, setEditedContent] = useState<string>('');
  const queryClient = useQueryClient();

  // 查询项目配置
  const { data, isLoading, error } = useQuery({
    queryKey: ['project-detail', id],
    queryFn: () => getProjectById(Number(id)),
    enabled: !!id,
  });

  // 更新项目配置
  const mutation = useMutation({
    mutationFn: (config: string) => updateProject(Number(id), { config }),
    onSuccess: () => {
      message.success('配置保存成功');
      setEditMode(false);
      queryClient.invalidateQueries({ queryKey: ['project-detail', id] });
    },
    onError: (err) => {
      message.error('配置保存失败');
      console.error('保存项目配置失败:', err);
    },
  });

  useEffect(() => {
    if (data?.data?.config) {
      setYamlContent(data.data.config);
    } else if (data?.data && !data.data.config) {
      setYamlContent('');
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      message.error('获取项目配置失败');
      console.error('获取项目配置失败:', error);
    }
  }, [error]);

  // 处理编辑按钮点击
  const handleEditClick = () => {
    setEditedContent(yamlContent);
    setEditMode(true);
  };

  // 处理取消按钮点击
  const handleCancelClick = () => {
    setEditMode(false);
    setEditedContent('');
  };

  // 处理保存按钮点击
  const handleSaveClick = () => {
    if (editedContent === null || editedContent.replace(/\s/g, '') === '') {
      message.error('配置不能为空');
      return;
    }
    mutation.mutate(editedContent);
  };

  // 处理编辑器内容变更
  const handleContentChange = (value: string) => {
    setEditedContent(value);
    console.log('value', value);
  };

  return (
    <PageContainer
      title="项目配置"
      extra={
        !isLoading && (
          <Space>
            {!editMode ? (
              <Button type="primary" onClick={handleEditClick}>
                编辑
              </Button>
            ) : (
              <>
                <Button onClick={handleCancelClick}>取消</Button>
                <Button type="primary" onClick={handleSaveClick} loading={mutation.isPending}>
                  保存
                </Button>
              </>
            )}
          </Space>
        )
      }
    >
      <Card>
        {error ? (
          <Alert
            type="error"
            message="获取项目配置失败"
            description="无法加载项目配置信息，请稍后重试或联系管理员。"
            showIcon
          />
        ) : (
          <Spin
            spinning={(isLoading && !yamlContent) || mutation.isPending}
            tip={mutation.isPending ? '正在保存配置...' : '正在加载项目配置...'}
          >
            <div className="min-h-[600px]">
              {yamlContent || editMode ? (
                <YamlEditor
                  value={editMode ? editedContent : yamlContent}
                  onChange={handleContentChange}
                  readOnly={!editMode}
                  height="600px"
                />
              ) : (
                !isLoading && <div className="text-center p-8 text-gray-500">暂无配置信息</div>
              )}
            </div>
          </Spin>
        )}
      </Card>
    </PageContainer>
  );
}
