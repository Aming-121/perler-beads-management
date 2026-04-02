#!/bin/bash

# ============================================
# 拼豆库存管理系统 - DevBox 部署脚本
# ============================================

set -e

echo "=========================================="
echo "  拼豆库存管理系统 - 部署脚本"
echo "=========================================="

# 配置变量
PROJECT_DIR="/root/perler-beads-management"
PORT=3000

# 数据库配置
DB_HOST="beads-manager-postgresql.ns-lewxfuoj.svc"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"
DB_PASSWORD="mc9prkzs"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo_step() {
    echo -e "${GREEN}[步骤]${NC} $1"
}

echo_info() {
    echo -e "${YELLOW}[信息]${NC} $1"
}

# 1. 安装前端依赖
echo_step "1/5 - 安装前端依赖..."
cd $PROJECT_DIR/client
npm install

# 2. 构建前端
echo_step "2/5 - 构建前端..."
npm run build
echo_info "前端构建完成"

# 3. 安装后端依赖
echo_step "3/5 - 安装后端依赖..."
cd $PROJECT_DIR/server
npm install

# 4. 配置环境变量
echo_step "4/5 - 配置环境变量..."
cat > $PROJECT_DIR/server/.env << EOF
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
PORT=$PORT
EOF
echo_info "环境变量已配置"

# 5. 启动后端服务
echo_step "5/5 - 启动后端服务..."
cd $PROJECT_DIR/server
PORT=$PORT nohup npm start > server.log 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > $PROJECT_DIR/server.pid
echo_info "后端服务已启动 (PID: $SERVER_PID)"

echo ""
echo "=========================================="
echo "  部署完成！"
echo "=========================================="
echo "  访问地址: http://localhost:$PORT"
echo ""
echo "  查看日志: tail -f $PROJECT_DIR/server/server.log"
echo "  停止服务: kill \$(cat $PROJECT_DIR/server.pid)"
echo "=========================================="
