# 拼豆库存管理系统

一个用于管理拼豆（Perler Beads）库存的移动端网页应用。

## 项目结构

```
├── client/                 # React 前端
│   ├── src/
│   │   ├── components/     # UI 组件
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API 服务
│   │   └── types/          # TypeScript 类型
│   └── package.json
├── server/                 # Express 后端
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   ├── db/             # 数据库连接
│   │   └── index.js        # 服务入口
│   ├── package.json
│   └── .env.example        # 环境变量示例
└── SPEC.md                  # 项目规范
```

## 快速开始

### 1. 配置数据库

在 Sealos 上创建 PostgreSQL 数据库，然后执行初始化脚本：

```bash
# 登录数据库后执行
\i server/src/db/init.sql
```

或在数据库管理工具中执行 `server/src/db/init.sql` 的内容。

### 2. 配置后端环境

```bash
cd server
cp .env.example .env
# 编辑 .env，填入数据库连接信息
```

```env
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=perler_beads
DB_USER=your-username
DB_PASSWORD=your-password
PORT=3000
```

### 3. 启动后端服务

```bash
cd server
npm install
npm run dev
```

后端服务将运行在 http://localhost:3000

### 4. 启动前端

```bash
cd client
npm install
npm run dev
```

前端将运行在 http://localhost:5173

## API 接口

### 库存管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/inventory | 获取所有库存 |
| GET | /api/inventory/series/:series | 按系列获取库存 |
| GET | /api/inventory/:series/:number | 获取单个库存 |
| POST | /api/inventory | 添加库存 |
| PATCH | /api/inventory/:series/:number | 更新库存数量 |

### 交易记录

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/transactions | 获取交易记录列表 |
| GET | /api/transactions/:series/:number | 获取单个库存的操作记录 |

## 功能

- 库存管理：添加、增删库存数量
- 快速检索：按豆号搜索
- 操作记录：查看所有出入库历史
- 数据筛选：按系列、序号筛选记录
