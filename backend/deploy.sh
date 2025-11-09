#!/bin/bash

echo "========================================="
echo "番茄钟 API 服务器部署脚本"
echo "========================================="

# 1. 安装 Go
echo ""
echo "[1/5] 安装 Go 环境..."
if command -v go &> /dev/null; then
    echo "✓ Go 已安装: $(go version)"
else
    echo "正在安装 Go 1.21.5..."
    cd /tmp
    wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz
    rm -rf /usr/local/go
    tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz

    # 配置环境变量
    export PATH=$PATH:/usr/local/go/bin
    echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc

    echo "✓ Go 安装完成: $(go version)"
fi

# 2. 解压项目
echo ""
echo "[2/5] 解压项目代码..."
cd ~
if [ -f pomodoro-api.tar.gz ]; then
    tar -xzf pomodoro-api.tar.gz
    echo "✓ 项目解压完成"
else
    echo "✗ 错误: 找不到 pomodoro-api.tar.gz 文件"
    echo "请先上传压缩包到服务器根目录"
    exit 1
fi

# 3. 进入项目目录
cd ~/pomodoro-api

# 4. 配置 Go 模块代理（加速下载）
echo ""
echo "[3/5] 配置 Go 模块代理..."
export GOPROXY=https://goproxy.cn,direct
echo 'export GOPROXY=https://goproxy.cn,direct' >> ~/.bashrc
echo "✓ 已配置国内代理"

# 5. 安装依赖
echo ""
echo "[4/5] 安装项目依赖..."
go mod download
echo "✓ 依赖安装完成"

# 6. 编译并运行
echo ""
echo "[5/5] 启动服务..."
echo "编译项目..."
go build -o pomodoro-api main.go

if [ $? -eq 0 ]; then
    echo "✓ 编译成功"
    echo ""
    echo "========================================="
    echo "部署完成！"
    echo "========================================="
    echo ""
    echo "启动服务命令："
    echo "  nohup ./pomodoro-api > pomodoro.log 2>&1 &"
    echo ""
    echo "查看日志："
    echo "  tail -f pomodoro.log"
    echo ""
    echo "停止服务："
    echo "  pkill pomodoro-api"
    echo ""
    echo "API 地址："
    echo "  http://你的服务器IP:8080/api/"
    echo ""
else
    echo "✗ 编译失败，请检查错误信息"
    exit 1
fi
