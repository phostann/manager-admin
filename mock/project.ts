// @ts-ignore
import { MockMethod } from '@umijs/max';

const sampleYamlConfig = `version: '3'
services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
    environment:
      - NGINX_HOST=example.com
      - NGINX_PORT=80
    depends_on:
      - db
    networks:
      - frontend
      - backend

  db:
    image: mysql:8.0
    volumes:
      - db_data:/var/lib/mysql
    environment:
      - MYSQL_ROOT_PASSWORD=example_password
      - MYSQL_DATABASE=example_db
      - MYSQL_USER=example_user
      - MYSQL_PASSWORD=example_password
    ports:
      - "3306:3306"
    networks:
      - backend

networks:
  frontend:
  backend:

volumes:
  db_data:`;

export default [
  {
    url: '/api/project/page',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: 'ok',
        data: {
          records: [
            {
              id: 1,
              name: '示例项目1',
              node_count: 5,
              resource_count: 10,
              description: '这是一个示例项目',
              created_at: '2023-01-01 00:00:00',
              updated_at: '2023-01-01 00:00:00',
            },
            {
              id: 2,
              name: '示例项目2',
              node_count: 3,
              resource_count: 7,
              description: '这是另一个示例项目',
              created_at: '2023-02-01 00:00:00',
              updated_at: '2023-02-01 00:00:00',
            },
          ],
          total: 2,
          size: 10,
          current: 1,
        },
      };
    },
  },
  {
    url: '/api/project/:id',
    method: 'get',
    response: ({ params }: { params: { id: string } }) => {
      return {
        code: 200,
        message: 'ok',
        data: {
          id: Number(params.id),
          name: `示例项目${params.id}`,
          node_count: 5,
          resource_count: 10,
          description: '这是一个示例项目',
          created_at: '2023-01-01 00:00:00',
          updated_at: '2023-01-01 00:00:00',
          compose_config: sampleYamlConfig,
        },
      };
    },
  },
  {
    url: '/api/project/:id/config',
    method: 'get',
    response: ({ params }: { params: { id: string } }) => {
      return {
        code: 200,
        message: 'ok',
        data: {
          id: 1,
          project_id: Number(params.id),
          compose_config: sampleYamlConfig,
          created_at: '2023-01-01 00:00:00',
          updated_at: '2023-01-01 00:00:00',
        },
      };
    },
  },
  {
    url: '/api/project/:id/config',
    method: 'put',
    response: ({ params }: { params: { id: string } }) => {
      return {
        code: 200,
        message: 'ok',
        data: {
          id: Number(params.id),
          name: `示例项目${params.id}`,
          node_count: 5,
          resource_count: 10,
          description: '这是一个示例项目',
          created_at: '2023-01-01 00:00:00',
          updated_at: new Date().toISOString(),
        },
      };
    },
  },
];
