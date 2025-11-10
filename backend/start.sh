#!/bin/bash

# 番茄钟API启动脚本（生产环境）

echo "=========================================="
echo "番茄钟API服务启动"
echo "=========================================="

# 设置环境变量
export JWT_SECRET="dKvQbSoaux371gPXjtesW1V0lglR1Y7EFw1X5D2HQuX12bhh3aq6m5Z3g21jqY1EwSnTcpz9DjC+SgAW3kxq9w=="
export ALLOWED_ORIGIN="http://124.220.224.91"
export GIN_MODE="release"
export DB_PATH="/www/wwwroot/pomodoro-api/pomodoro.db"

echo "环境变量配置："
echo "  JWT_SECRET: [已设置]"
echo "  ALLOWED_ORIGIN: $ALLOWED_ORIGIN"
echo "  GIN_MODE: $GIN_MODE"
echo "  DB_PATH: $DB_PATH"
echo ""

# 检查可执行文件
if [ ! -f "./pomodoro-api" ]; then
    echo "错误: 未找到 pomodoro-api 可执行文件"
    echo "请先运行: go build -o pomodoro-api"
    exit 1
fi

echo "启动服务..."
./pomodoro-api
