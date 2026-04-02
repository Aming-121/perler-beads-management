#!/bin/bash

# 拼豆库存管理系统 - 生产环境启动脚本

set -e

echo "=========================================="
echo "  拼豆库存管理系统 - 启动中..."
echo "=========================================="

# 安装依赖
echo "📦 安装依赖..."
cd server && npm install --production
cd ../client && npm install

# 构建前端
echo "🔨 构建前端..."
npm run build

# 返回项目根目录
cd ..

echo ""
echo "=========================================="
echo "  服务启动完成！"
echo "=========================================="
echo "  前端地址: http://localhost:5173"
echo "  后端地址: http://localhost:3000"
echo "=========================================="

# 启动后端服务
cd server && npm start
