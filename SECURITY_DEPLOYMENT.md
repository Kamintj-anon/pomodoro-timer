# 🔒 安全加固部署指南

## ✅ 已完成的安全修复

### 1. JWT密钥修复 ✅
- ✅ 从环境变量读取JWT密钥
- ✅ 生成了64字符的强随机密钥
- ✅ 开发环境有默认值，生产环境强制使用环境变量

### 2. CORS配置修复 ✅
- ✅ 从环境变量读取允许的域名
- ✅ 默认只允许服务器IP（http://124.220.224.91）
- ✅ 支持配置域名后更新

### 3. 请求频率限制 ✅
- ✅ 登录接口：每分钟最多5次
- ✅ 注册接口：每小时最多3次
- ✅ 自动清理过期访问记录

---

## 🚀 部署到服务器

### 方法一：使用自动化脚本

```bash
# 1. 上传所有文件到服务器
cd /d/download
scp -r backend/* root@124.220.224.91:/www/wwwroot/pomodoro-api/

# 2. SSH连接到服务器
ssh root@124.220.224.91

# 3. 重新编译
cd /www/wwwroot/pomodoro-api
go build -o pomodoro-api

# 4. 使用新的启动脚本
chmod +x start.sh
./start.sh
```

### 方法二：配置systemd服务（推荐）

```bash
# 1. 上传服务配置文件
scp backend/pomodoro.service root@124.220.224.91:/etc/systemd/system/

# 2. 重新编译和部署
ssh root@124.220.224.91 << 'EOF'
cd /www/wwwroot/pomodoro-api
go build -o pomodoro-api
systemctl daemon-reload
systemctl restart pomodoro
systemctl status pomodoro
EOF
```

---

## 🔑 环境变量配置

### 当前配置（开发/测试环境）

```bash
export JWT_SECRET="dKvQbSoaux371gPXjtesW1V0lglR1Y7EFw1X5D2HQuX12bhh3aq6m5Z3g21jqY1EwSnTcpz9DjC+SgAW3kxq9w=="
export ALLOWED_ORIGIN="http://124.220.224.91"
export GIN_MODE="release"
```

### 配置域名后需要修改

```bash
# 修改允许的域名
export ALLOWED_ORIGIN="https://yourdomain.com"

# 同时更新systemd服务配置
sudo vim /etc/systemd/system/pomodoro.service
# 修改 ALLOWED_ORIGIN 那一行

# 重启服务
sudo systemctl daemon-reload
sudo systemctl restart pomodoro
```

---

## 🧪 测试安全修复

### 1. 测试JWT密钥配置

```bash
# SSH到服务器
ssh root@124.220.224.91

# 查看日志，应该显示"已加载JWT_SECRET环境变量"
journalctl -u pomodoro -n 20
```

### 2. 测试CORS配置

```bash
# 从浏览器控制台测试
curl -H "Origin: http://evil-site.com" http://124.220.224.91:8080/api/auth/login
# 应该返回CORS错误或者不包含Access-Control-Allow-Origin

curl -H "Origin: http://124.220.224.91" http://124.220.224.91:8080/api/auth/login
# 应该允许访问
```

### 3. 测试限流功能

```bash
# 快速连续请求登录接口6次
for i in {1..6}; do
  curl -X POST http://124.220.224.91:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}' &
done

# 第6次应该返回：
# {"error":"请求过于频繁，请稍后再试"}
```

---

## 📊 监控和日志

### 查看服务状态

```bash
# 查看服务运行状态
systemctl status pomodoro

# 查看最近日志
journalctl -u pomodoro -n 50

# 实时查看日志
journalctl -u pomodoro -f
```

### 查看限流统计

服务启动后会在日志中看到：
```
已加载JWT_SECRET环境变量
CORS配置: 允许的域名 = http://124.220.224.91
启动访问记录清理任务（每5分钟）
服务器启动成功，监听端口 8080
```

限流触发时的日志：
```
限流触发: IP=192.168.1.100, 请求数=6, 窗口=60s
```

---

## 🔄 配置域名后的完整流程

### 1. 更新后端环境变量

```bash
# 修改systemd服务配置
sudo vim /etc/systemd/system/pomodoro.service

# 修改这一行：
Environment="ALLOWED_ORIGIN=https://yourdomain.com"
```

### 2. 更新前端配置

```bash
# 修改 frontend/js/config.js
const API_BASE_URL = 'https://yourdomain.com:8080';
```

### 3. 配置Nginx反向代理（可选）

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 前端
    location / {
        root /www/wwwroot/pomodoro-frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. 重启服务

```bash
systemctl daemon-reload
systemctl restart pomodoro
nginx -t && nginx -s reload
```

---

## 🛡️ 安全检查清单

配置完成后，逐项检查：

- [x] JWT密钥已更换为强随机字符串
- [x] CORS配置限制为服务器IP或域名
- [x] 登录接口有频率限制（5次/分钟）
- [x] 注册接口有频率限制（3次/小时）
- [ ] HTTPS证书已配置（获得域名后）
- [ ] 防火墙规则已配置
- [ ] 数据库已备份
- [ ] 日志监控已启用

---

## 🔧 故障排查

### 问题1：服务启动失败

```bash
# 查看详细错误
journalctl -u pomodoro -n 50

# 常见原因：
# - JWT_SECRET未设置
# - 端口被占用
# - 数据库文件权限问题
```

### 问题2：前端无法访问API

```bash
# 检查CORS配置
curl -I http://124.220.224.91:8080/api/auth/login

# 检查防火墙
firewall-cmd --list-all

# 检查服务是否运行
netstat -tlnp | grep 8080
```

### 问题3：限流太严格

```bash
# 临时修改限流参数（main.go）
auth.POST("/login", middleware.RateLimit(10, 60), controllers.Login)

# 重新编译部署
go build -o pomodoro-api
systemctl restart pomodoro
```

---

## 📈 性能优化建议

1. **使用Redis存储限流数据**（多服务器部署时）
2. **启用Gzip压缩**
3. **配置CDN加速静态资源**
4. **定期清理数据库**
5. **监控API响应时间**

---

## 🚨 紧急情况处理

### 发现安全漏洞

```bash
# 1. 立即更换JWT密钥
openssl rand -base64 64

# 2. 更新环境变量
sudo vim /etc/systemd/system/pomodoro.service

# 3. 重启服务（所有用户需要重新登录）
systemctl daemon-reload
systemctl restart pomodoro

# 4. 检查日志
journalctl -u pomodoro -n 100

# 5. 备份数据库
cp /www/wwwroot/pomodoro-api/pomodoro.db /backup/
```

### 遭受DDoS攻击

```bash
# 1. 临时加强限流
# 修改 main.go 中的限流参数
auth.POST("/login", middleware.RateLimit(2, 60), controllers.Login)

# 2. 配置防火墙规则
iptables -A INPUT -p tcp --dport 8080 -m connlimit --connlimit-above 10 -j REJECT

# 3. 使用CDN（Cloudflare等）
```

---

## 📞 需要帮助？

- GitHub Issues: https://github.com/Kamintj-anon/pomodoro-timer/issues
- 查看日志: `journalctl -u pomodoro -f`
- 服务器状态: `systemctl status pomodoro`

---

**部署时间**: 预计 10-15 分钟
**安全等级**: ⭐⭐⭐⭐☆ (4/5星)

祝部署顺利！🎉
