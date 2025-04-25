import React, { useState } from 'react';
import { List, Card, Button, Modal, Form, Input, Spin, message } from 'antd';
import { usePostsApi } from '@/hooks/usePostsApi';
import { Post } from '@/services/api';

const PostsWithHooks: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [form] = Form.useForm();

  // 使用自定义Hook获取文章列表
  const { data: posts, isLoading, isError, error } = usePostsApi.useList();

  // 使用自定义Hook进行文章创建
  const { mutate: createPost, isPending: isCreating } = usePostsApi.useCreate({
    onSuccess: () => {
      setIsModalVisible(false);
      form.resetFields();
      message.success('文章创建成功！');
    },
    onError: (error) => {
      message.error(`创建失败: ${error instanceof Error ? error.message : '未知错误'}`);
    },
  });

  // 使用自定义Hook进行文章更新
  const { mutate: updatePost, isPending: isUpdating } = usePostsApi.useUpdate({
    onSuccess: () => {
      setIsModalVisible(false);
      setEditingPost(null);
      form.resetFields();
      message.success('文章更新成功！');
    },
    onError: (error) => {
      message.error(`更新失败: ${error instanceof Error ? error.message : '未知错误'}`);
    },
  });

  // 使用自定义Hook进行文章删除
  const { mutate: deletePost } = usePostsApi.useRemove({
    onSuccess: () => {
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
      updatePost({
        ...editingPost,
        ...values,
      });
    } else {
      // 创建文章
      createPost({
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
        deletePost(id);
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
            <Button type="primary" htmlType="submit" loading={isCreating || isUpdating}>
              {editingPost ? '更新' : '创建'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PostsWithHooks;
