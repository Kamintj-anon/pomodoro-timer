# 安全加固修复指南

## 🔴 高优先级（立即修复）

### 1. 修改JWT密钥

**文件**：`utils/jwt.go`

**修改前**：
```go
var jwtSecret = []byte("your-secret-key-change-this-in-production")
```

**修改后**：
```go
import "os"

var jwtSecret = []byte(getJWTSecret())

func getJWTSecret() string {
    secret := os.Getenv("JWT_SECRET")
    if secret == "" {
        // 生产环境必须设置环境变量
        panic("JWT_SECRET environment variable is required")
    }
    return secret
}
```

**生成强密钥**：
```bash
# 生成一个64字符的随机密钥
openssl rand -base64 64
```

**设置环境变量**（服务器上）：
```bash
export JWT_SECRET="你生成的随机密钥"
```

---

### 2. 限制CORS域名

**文件**：`middleware/auth.go`

**修改前**：
```go
c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
```

**修改后**：
```go
// 使用环境变量配置允许的域名
allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
if allowedOrigin == "" {
    allowedOrigin = "http://124.220.224.91"  // 默认IP
}
c.Writer.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
```

**配置域名后**：
```bash
export ALLOWED_ORIGIN="https://yourdomain.com"
```

---

## 🟡 中优先级（近期修复）

### 3. 添加请求频率限制

**创建新文件**：`middleware/ratelimit.go`

```go
package middleware

import (
    "net/http"
    "sync"
    "time"

    "github.com/gin-gonic/gin"
)

type visitor struct {
    lastSeen time.Time
    count    int
}

var (
    visitors = make(map[string]*visitor)
    mu       sync.RWMutex
)

// RateLimit 限流中间件
// maxRequests: 时间窗口内最大请求数
// window: 时间窗口（秒）
func RateLimit(maxRequests int, window time.Duration) gin.HandlerFunc {
    return func(c *gin.Context) {
        ip := c.ClientIP()

        mu.Lock()
        defer mu.Unlock()

        v, exists := visitors[ip]
        now := time.Now()

        if !exists || now.Sub(v.lastSeen) > window*time.Second {
            visitors[ip] = &visitor{
                lastSeen: now,
                count:    1,
            }
            c.Next()
            return
        }

        if v.count >= maxRequests {
            c.JSON(http.StatusTooManyRequests, gin.H{
                "error": "请求过于频繁，请稍后再试",
            })
            c.Abort()
            return
        }

        v.count++
        v.lastSeen = now
        c.Next()
    }
}

// 清理过期的visitor记录（可在后台定时运行）
func CleanupVisitors() {
    ticker := time.NewTicker(5 * time.Minute)
    for range ticker.C {
        mu.Lock()
        for ip, v := range visitors {
            if time.Since(v.lastSeen) > 10*time.Minute {
                delete(visitors, ip)
            }
        }
        mu.Unlock()
    }
}
```

**使用方法**（在main.go中）：
```go
// 登录接口限流：每分钟最多5次
auth.POST("/login", middleware.RateLimit(5, 60), controllers.Login)

// 注册接口限流：每小时最多3次
auth.POST("/register", middleware.RateLimit(3, 3600), controllers.Register)

// 启动清理任务
go middleware.CleanupVisitors()
```

---

### 4. 增强密码强度要求

**文件**：`controllers/auth.go`

```go
import "regexp"

func validatePassword(password string) error {
    if len(password) < 8 {
        return errors.New("密码至少8个字符")
    }

    // 至少包含一个数字
    hasNumber := regexp.MustCompile(`[0-9]`).MatchString
    if !hasNumber(password) {
        return errors.New("密码必须包含数字")
    }

    // 至少包含一个字母
    hasLetter := regexp.MustCompile(`[a-zA-Z]`).MatchString
    if !hasLetter(password) {
        return errors.New("密码必须包含字母")
    }

    return nil
}

// 在Register函数中添加
if err := validatePassword(input.Password); err != nil {
    c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
    return
}
```

---

### 5. 添加最大长度限制

**文件**：修改所有相关的结构体

```go
// 示例
var input struct {
    Username string `json:"username" binding:"required,min=3,max=20"`
    Email    string `json:"email" binding:"required,email,max=100"`
    Password string `json:"password" binding:"required,min=8,max=128"`
}

// 分类名称
Name string `json:"name" binding:"required,max=50"`

// 备注
Note string `json:"note" binding:"max=500"`
```

---

## 🟢 低优先级（建议添加）

### 6. 添加操作日志

**创建新文件**：`utils/logger.go`

```go
package utils

import (
    "log"
    "os"
)

var (
    InfoLogger    *log.Logger
    WarningLogger *log.Logger
    ErrorLogger   *log.Logger
)

func InitLogger() {
    file, err := os.OpenFile("app.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0666)
    if err != nil {
        log.Fatal(err)
    }

    InfoLogger = log.New(file, "INFO: ", log.Ldate|log.Ltime|log.Lshortfile)
    WarningLogger = log.New(file, "WARNING: ", log.Ldate|log.Ltime|log.Lshortfile)
    ErrorLogger = log.New(file, "ERROR: ", log.Ldate|log.Ltime|log.Lshortfile)
}

// 记录登录尝试
func LogLoginAttempt(email string, success bool, ip string) {
    if success {
        InfoLogger.Printf("登录成功 - Email: %s, IP: %s", email, ip)
    } else {
        WarningLogger.Printf("登录失败 - Email: %s, IP: %s", email, ip)
    }
}
```

---

### 7. 配置HTTPS（获得域名后）

```bash
# 安装certbot
apt install certbot python3-certbot-nginx

# 自动配置HTTPS
certbot --nginx -d yourdomain.com

# 自动续期
certbot renew --dry-run
```

---

### 8. 添加防XSS处理

**安装依赖**：
```bash
go get github.com/microcosm-cc/bluemonday
```

**创建工具函数**：
```go
package utils

import "github.com/microcosm-cc/bluemonday"

var policy = bluemonday.StrictPolicy()

// SanitizeInput 清理用户输入，防止XSS
func SanitizeInput(input string) string {
    return policy.Sanitize(input)
}
```

---

## 📋 修复检查清单

配置域名前：
- [ ] 修改JWT密钥为强随机密钥
- [ ] 限制CORS为你的IP
- [ ] 添加登录接口限流
- [ ] 增强密码强度要求
- [ ] 添加字段长度限制

配置域名后：
- [ ] 更新CORS为你的域名
- [ ] 配置HTTPS证书
- [ ] 更新前端API地址
- [ ] 测试所有安全措施

长期优化：
- [ ] 添加操作日志系统
- [ ] 实现邮箱验证功能
- [ ] 添加Token刷新机制
- [ ] 定期安全审计

---

## 🔐 生产环境配置示例

**创建启动脚本**：`start.sh`
```bash
#!/bin/bash

# 设置环境变量
export JWT_SECRET="$(openssl rand -base64 64)"
export ALLOWED_ORIGIN="https://yourdomain.com"
export GIN_MODE="release"
export DB_PATH="/www/wwwroot/pomodoro-api/pomodoro.db"

# 启动服务
./pomodoro-api
```

**systemd服务配置**：`/etc/systemd/system/pomodoro.service`
```ini
[Unit]
Description=Pomodoro API Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/www/wwwroot/pomodoro-api
Environment="JWT_SECRET=你的密钥"
Environment="ALLOWED_ORIGIN=https://yourdomain.com"
Environment="GIN_MODE=release"
ExecStart=/www/wwwroot/pomodoro-api/pomodoro-api
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## 🚨 安全事件响应

如果发现安全问题：

1. **立即**更换JWT密钥（会使所有现有Token失效）
2. 检查日志查找异常行为
3. 通知用户修改密码（如果数据库泄露）
4. 备份数据库
5. 更新所有依赖包
6. 加强监控

---

## 📚 安全资源

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Go安全最佳实践: https://golang.org/doc/security/
- JWT安全: https://jwt.io/introduction
