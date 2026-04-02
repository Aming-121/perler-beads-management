---
name: 拼豆库存管理系统
overview: 创建一个移动端优化的拼豆库存管理网页应用，支持库存管理（入库/出库）和历史查询功能，使用React+Tailwind前端 + Express+SQLite后端架构。
design:
  architecture:
    framework: react
  styleKeywords:
    - 卡片式设计
    - 移动端优先
    - 简洁现代
  fontSystem:
    fontFamily: System Font
    heading:
      size: 20px
      weight: 600
    subheading:
      size: 18px
      weight: 500
    body:
      size: 16px
      weight: 400
  colorSystem:
    primary:
      - "#3B82F6"
    background:
      - "#F3F4F6"
      - "#FFFFFF"
    text:
      - "#1F2937"
      - "#6B7280"
    functional:
      - "#10B981"
      - "#EF4444"
todos:
  - id: init-project
    content: 初始化项目结构（client + server目录，配置文件）
    status: completed
  - id: backend-api
    content: 实现后端API和SQLite数据库（库存CRUD、交易记录）
    status: completed
    dependencies:
      - init-project
  - id: inventory-page
    content: 开发库存页面（添加弹窗、模块展开、操作弹窗、检索）
    status: completed
    dependencies:
      - backend-api
  - id: query-page
    content: 开发查询页面（表格展示、筛选功能）
    status: completed
    dependencies:
      - backend-api
  - id: test-optimize
    content: 测试和优化移动端体验
    status: completed
    dependencies:
      - inventory-page
      - query-page
---

## 产品概述

拼豆库存管理网页应用，专为iOS手机用户设计，用于管理拼豆（Perler beads）的色号库存和出入库记录。

## 核心功能

### 库存页面（默认首页）

- 右上角添加按钮：弹窗选择系列（A-Z）、序号（1-31）、数量
- 一级模块按A-M分组展示已有数据
- 点击一级模块展开二级模块，显示该系列所有色号数量
- 点击具体色号弹出操作框：加1、减1、自定义修改
- 快速检索功能：输入系列+序号快速定位

### 查询页面

- 表格展示所有出入库记录
- 筛选栏：按序列（A-H/M）、豆号（1-31）筛选
- 数据列：序列、豆号、入库时间、出库时间、数量

## Tech Stack

- 前端框架：React 18 + TypeScript
- 样式方案：Tailwind CSS
- 打包工具：Vite
- 后端框架：Express.js (Node.js 18)
- 数据库：SQLite (better-sqlite3)

## Implementation Approach

### 第一阶段：前端Mock版本（优先）

1. 使用 Vite 初始化 React + TypeScript 项目
2. 使用 Mock 数据模拟库存和交易记录
3. Tailwind CSS 实现移动端优先的响应式设计
4. 组件化开发：模块选择器、库存卡片、操作弹窗、查询表格
5. **验证页面功能是否符合需求**

### 第二阶段：后端对接（确认前端后）

1. Express.js 后端提供 RESTful API
2. SQLite 数据库存储库存和交易记录
3. 将 Mock 服务替换为真实 API 调用

## Directory Structure

```
project/
├── client/                 # React前端 (第一阶段开发)
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── pages/          # 页面
│   │   ├── hooks/          # 自定义hooks
│   │   ├── services/       # Mock数据服务
│   │   ├── types/          # TypeScript类型
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Express后端 (第二阶段)
│   ├── src/
│   │   ├── routes/         # API路由
│   │   ├── db/             # 数据库操作
│   │   └── index.ts        # 服务入口
│   └── package.json
└── SPEC.md                  # 项目规范
```

## Key Data Structures

- **Inventory**: { series, number, quantity }
- **Transaction**: { id, series, number, type(in/out), quantity, timestamp }

## Mock Data Strategy

第一阶段使用本地状态和 Mock 数据：

- 初始库存数据：随机生成 A-H 和 M 系列的色号库存
- 交易记录：模拟一些出入库历史记录
- 操作即时响应，无需等待后端

## Todo List

### Phase 1: Frontend Mock (当前)

- [ ] init-project - 初始化项目结构
- [ ] inventory-page - 开发库存页面
- [ ] query-page - 开发查询页面
- [ ] test-frontend - 测试验证页面功能

### Phase 2: Backend Integration (待确认前端后)

- [ ] backend-api - 实现后端API和SQLite数据库
- [ ] connect-api - 对接真实API
- [ ] final-test - 最终测试

---

## Design Style

采用简洁现代的卡片式设计风格，针对iOS移动端优化，确保良好的触控体验。界面简洁直观，操作流畅。

## Font System

- 标题：System Font, 20px, 600
- 正文：System Font, 16px, 400
- 辅助文字：System Font, 14px, 400

## Color System

- Primary: #3B82F6 (蓝色主色调)
- Background: #F3F4F6 (浅灰背景)
- Card Background: #FFFFFF
- Text Primary: #1F2937
- Text Secondary: #6B7280
- Success: #10B981 (入库)
- Warning: #EF4444 (出库)