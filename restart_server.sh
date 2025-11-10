#!/bin/bash
cd /www/wwwroot/pomodoro-api

echo "停止旧服务..."
pkill -f pomodoro-api

echo "设置环境变量..."
export JWT_SECRET="dKvQbSoaux371gPXjtesW1V0lglR1Y7EFw1X5D2HQuX12bhh3aq6m5Z3g21jqY1EwSnTcpz9DjC+SgAW3kxq9w=="
export ALLOWED_ORIGIN="http://124.220.224.91"
export GIN_MODE="release"

echo "启动服务..."
nohup ./pomodoro-api > pomodoro.log 2>&1 &

sleep 2

echo "检查服务状态..."
if ps aux | grep -v grep | grep pomodoro-api > /dev/null; then
    echo "✅ 服务启动成功"
    tail -10 pomodoro.log
else
    echo "❌ 服务启动失败"
    cat pomodoro.log
fi
