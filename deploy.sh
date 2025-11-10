#!/bin/bash

# 番茄钟单词打卡功能部署脚本
# 服务器: 124.220.224.91

echo "=========================================="
echo "开始部署单词打卡功能..."
echo "=========================================="

# 服务器配置
SERVER="124.220.224.91"
BACKEND_PATH="/www/wwwroot/pomodoro-api"
FRONTEND_PATH="/www/wwwroot/pomodoro-frontend"

# 1. 上传后端文件
echo ""
echo "1. 上传后端文件..."
scp D:/download/backend/models/word_record.go root@$SERVER:$BACKEND_PATH/models/
scp D:/download/backend/database/db.go root@$SERVER:$BACKEND_PATH/database/
scp D:/download/backend/controllers/word.go root@$SERVER:$BACKEND_PATH/controllers/
scp D:/download/backend/main.go root@$SERVER:$BACKEND_PATH/

# 2. 上传前端文件
echo ""
echo "2. 上传前端文件..."
scp D:/download/frontend/index.html root@$SERVER:$FRONTEND_PATH/
scp D:/download/frontend/js/config.js root@$SERVER:$FRONTEND_PATH/js/
scp D:/download/frontend/js/words.js root@$SERVER:$FRONTEND_PATH/js/
scp D:/download/frontend/js/app.js root@$SERVER:$FRONTEND_PATH/js/
scp D:/download/frontend/css/main.css root@$SERVER:$FRONTEND_PATH/css/

# 3. 重新编译后端
echo ""
echo "3. 重新编译后端..."
ssh root@$SERVER << 'EOF'
cd /www/wwwroot/pomodoro-api
echo "开始编译..."
go build -o pomodoro-api
if [ $? -eq 0 ]; then
    echo "编译成功！"
else
    echo "编译失败！"
    exit 1
fi
EOF

# 4. 重启后端服务
echo ""
echo "4. 重启后端服务..."
ssh root@$SERVER << 'EOF'
if systemctl is-active --quiet pomodoro; then
    systemctl restart pomodoro
    echo "服务已重启"
else
    # 如果没有systemd服务，使用其他方式重启
    pkill -f pomodoro-api
    cd /www/wwwroot/pomodoro-api
    nohup ./pomodoro-api > pomodoro.log 2>&1 &
    echo "服务已启动"
fi

# 检查服务状态
sleep 2
if systemctl is-active --quiet pomodoro; then
    echo "服务运行正常"
else
    if pgrep -f pomodoro-api > /dev/null; then
        echo "服务运行正常"
    else
        echo "警告：服务可能未正常启动，请检查日志"
    fi
fi
EOF

# 5. 清理浏览器缓存提示
echo ""
echo "=========================================="
echo "部署完成！"
echo "=========================================="
echo ""
echo "请在浏览器中按 Ctrl+Shift+R 强制刷新页面"
echo "或清除浏览器缓存后访问应用"
echo ""
echo "数据库迁移会在服务启动时自动执行"
echo ""
