import { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, message, Spin, Alert, Button, Space } from 'antd';
import { useParams } from '@umijs/max';
import YamlEditor from '@/components/YamlEditor';
import { getProjectById, updateProjectConfig } from '@/services/project';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function ProjectConfig() {
  const { id } = useParams<{ id: string }>();
  const [yamlContent, setYamlContent] = useState<string>('');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editedContent, setEditedContent] = useState<string>('');
  const queryClient = useQueryClient();

  // 查询项目配置
  const { data, isLoading, error } = useQuery({
    queryKey: ['project-config', id],
    queryFn: () => getProjectById(Number(id)),
    enabled: !!id,
  });

  // 更新项目配置
  const mutation = useMutation({
    mutationFn: (config: string) => updateProjectConfig(Number(id), { config }),
    onSuccess: () => {
      message.success('配置保存成功');
      setEditMode(false);
      queryClient.invalidateQueries({ queryKey: ['project-config', id] });
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
    console.log('保存编辑后的配置:', editedContent);
    mutation.mutate(editedContent);
  };

  // 处理编辑器内容变更
  const handleContentChange = (value: string) => {
    setEditedContent(value);
  };

  return (
    <PageContainer
      title="项目配置"
      extra={
        !isLoading &&
        yamlContent && (
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
                  onChange={editMode ? handleContentChange : undefined}
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
