import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { List, Card, Button, Modal, Form, Input, Spin, message } from 'antd';
import { getPosts, createPost, updatePost, deletePost, Post } from '@/services/api';
import { queryClient } from '@/utils/reactQueryConfig';

const PostsList: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [form] = Form.useForm();

  // 使用React Query获取文章列表
  const {
    data: posts,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  });

  // 创建文章的mutation
  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      // 成功后重新获取文章列表
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setIsModalVisible(false);
      form.resetFields();
      message.success('文章创建成功！');
    },
    onError: (error) => {
      message.error(`创建失败: ${error instanceof Error ? error.message : '未知错误'}`);
    },
  });

  // 更新文章的mutation
  const updatePostMutation = useMutation({
    mutationFn: updatePost,
    onSuccess: () => {
      // 成功后重新获取文章列表
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setIsModalVisible(false);
      setEditingPost(null);
      form.resetFields();
      message.success('文章更新成功！');
    },
    onError: (error) => {
      message.error(`更新失败: ${error instanceof Error ? error.message : '未知错误'}`);
    },
  });

  // 删除文章的mutation
  const deletePostMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      // 成功后重新获取文章列表
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      message.success('文章删除成功！');
    },
    onError: (error) => {
      message.error(`删除失败: ${error instanceof Error ? error.message : '未知错误'}`);
    },
  });

  // 处理表单提交
  const handleSubmit = (values: any) => {
    if (editingPost) {
      // 更新文章
      updatePostMutation.mutate({
        ...editingPost,
        ...values,
      });
    } else {
      // 创建文章
      createPostMutation.mutate({
        ...values,
        userId: 1, // 默认用户ID
      });
    }
  };

  // 打开编辑模态框
  const handleEdit = (post: Post) => {
    setEditingPost(post);
    form.setFieldsValue(post);
    setIsModalVisible(true);
  };

  // 打开新建模态框
  const handleCreate = () => {
    setEditingPost(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 删除文章
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这篇文章吗？',
      onOk: () => {
        deletePostMutation.mutate(id);
      },
    });
  };

  if (isLoading) {
    return <Spin size="large" tip="加载中..." />;
  }

  if (isError) {
    return <div>加载失败: {error instanceof Error ? error.message : '未知错误'}</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleCreate}>
          新建文章
        </Button>
      </div>

      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={posts}
        renderItem={(post) => (
          <List.Item>
            <Card
              title={post.title}
              actions={[
                <Button key="edit" type="link" onClick={() => handleEdit(post)}>
                  编辑
                </Button>,
                <Button key="delete" type="link" danger onClick={() => handleDelete(post.id)}>
                  删除
                </Button>,
              ]}
            >
              <p>{post.body}</p>
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title={editingPost ? '编辑文章' : '新建文章'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="body" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={createPostMutation.isPending || updatePostMutation.isPending}
            >
              {editingPost ? '更新' : '创建'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PostsList;
