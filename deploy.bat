@echo off
chcp 65001 >nul
echo ==========================================
echo 番茄钟单词打卡功能部署脚本
echo 服务器: 124.220.224.91
echo ==========================================
echo.

set SERVER=124.220.224.91
set BACKEND_PATH=/www/wwwroot/pomodoro-api
set FRONTEND_PATH=/www/wwwroot/pomodoro-frontend

echo 1. 上传后端文件...
echo.
pscp -batch D:\download\backend\models\word_record.go root@%SERVER%:%BACKEND_PATH%/models/
pscp -batch D:\download\backend\database\db.go root@%SERVER%:%BACKEND_PATH%/database/
pscp -batch D:\download\backend\controllers\word.go root@%SERVER%:%BACKEND_PATH%/controllers/
pscp -batch D:\download\backend\main.go root@%SERVER%:%BACKEND_PATH%/

echo.
echo 2. 上传前端文件...
echo.
pscp -batch D:\download\frontend\index.html root@%SERVER%:%FRONTEND_PATH%/
pscp -batch D:\download\frontend\js\config.js root@%SERVER%:%FRONTEND_PATH%/js/
pscp -batch D:\download\frontend\js\words.js root@%SERVER%:%FRONTEND_PATH%/js/
pscp -batch D:\download\frontend\js\app.js root@%SERVER%:%FRONTEND_PATH%/js/
pscp -batch D:\download\frontend\css\main.css root@%SERVER%:%FRONTEND_PATH%/css/

echo.
echo 3. 重新编译和重启服务...
echo.
plink -batch root@%SERVER% "cd %BACKEND_PATH% && go build -o pomodoro-api && systemctl restart pomodoro && echo '部署完成！'"

echo.
echo ==========================================
echo 部署完成！
echo ==========================================
echo.
echo 请在浏览器中按 Ctrl+Shift+R 强制刷新页面
echo.
pause
