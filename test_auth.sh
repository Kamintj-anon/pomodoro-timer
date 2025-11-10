#!/bin/bash

echo "=========================================="
echo "测试认证流程"
echo "=========================================="

# 1. 注册测试账号
echo -e "\n1. 注册测试账号..."
REGISTER_RESPONSE=$(curl -s -X POST http://124.220.224.91:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@test.com",
    "password": "test123456"
  }')

echo "注册响应: $REGISTER_RESPONSE"

# 2. 登录获取token
echo -e "\n2. 登录获取token..."
LOGIN_RESPONSE=$(curl -s -X POST http://124.220.224.91:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "test123456"
  }')

echo "登录响应: $LOGIN_RESPONSE"

# 提取token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ 登录失败，未获取到token"
    exit 1
fi

echo "✅ 成功获取token: ${TOKEN:0:50}..."

# 3. 使用token访问需要认证的API
echo -e "\n3. 测试访问单词记录API..."
WORDS_RESPONSE=$(curl -s -X GET http://124.220.224.91:8080/api/words \
  -H "Authorization: Bearer $TOKEN")

echo "单词记录响应: $WORDS_RESPONSE"

# 4. 测试访问番茄钟记录API
echo -e "\n4. 测试访问番茄钟记录API..."
POMODOROS_RESPONSE=$(curl -s -X GET http://124.220.224.91:8080/api/pomodoros \
  -H "Authorization: Bearer $TOKEN")

echo "番茄钟记录响应: $POMODOROS_RESPONSE"

echo -e "\n=========================================="
echo "测试完成"
echo "=========================================="
