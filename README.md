# 🍅 番茄钟 - Pomodoro Timer

一个功能完善的番茄钟时间管理应用，集成单词打卡、排行榜等多种功能，帮助你提升专注力和学习效率。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go)](https://golang.org)

## ✨ 核心功能

### 🎯 番茄钟计时
- ⏱️ 可自定义时长的番茄钟计时器
- 📁 自定义分类管理（学习、工作、运动等）
- 📊 实时进度显示和倒计时
- 🔔 计时完成提醒

### 📚 单词打卡
- ✍️ 每日单词数量记录
- 📅 日期选择和备注功能
- 📈 累计统计（总单词数、打卡天数、日均单词）
- 📜 打卡历史记录查看
- 🗑️ 记录编辑和删除

### 🏆 排行榜系统
- **番茄钟排行榜**：按总专注时长和番茄钟数量排名
- **单词排行榜**：
  - 今日排行：当天单词数量排名
  - 累计排行：总单词数和坚持天数排名
- 🥇🥈🥉 金银铜牌徽章显示（前3名）
- 👤 当前用户高亮显示

### 📊 数据统计
- 📈 总时长、总番茄钟数、平均时长
- 📊 分类统计（每个分类的专注时长）
- 📅 每日统计图表
- 🕐 历史记录完整展示

### 👤 用户系统
- 🔐 注册/登录（JWT认证）
- 👥 个人资料管理
- ⚙️ 番茄钟时长设置（25/30/45/60分钟）

### 🎨 UI/UX 设计
- ✨ 大师级Glassmorphism毛玻璃效果
- 🌊 流动渐变动画和光晕效果
- 🎭 弹性进入动画
- 🎯 精致的图标和按钮交互
- 📱 完整响应式设计
- 🎨 优雅的薄荷绿配色主题

## 🔒 安全特性

- 🛡️ JWT密钥环境变量配置（64字符强随机密钥）
- 🌐 CORS跨域限制（可配置允许域名）
- 🚦 API限流保护：
  - 登录接口：5次/分钟
  - 注册接口：3次/小时
- 🔐 bcrypt密码加密存储
- ✅ 输入验证和SQL注入防护

## 🛠️ 技术栈

### 后端
- **语言**: Go 1.21+
- **框架**: Gin Web Framework
- **数据库**: SQLite 3 + GORM
- **认证**: JWT (golang-jwt/jwt)
- **密码**: bcrypt
- **安全**: 自定义限流中间件

### 前端
- **架构**: SPA (单页应用)
- **语言**: Vanilla JavaScript (ES6+)
- **样式**: 纯 CSS3
  - Glassmorphism 毛玻璃效果
  - CSS Grid & Flexbox布局
  - 复杂动画和过渡效果
- **图标**: Font Awesome 6.4.0
- **特性**: 无任何前端框架依赖

## 📦 项目结构

```
pomodoro-timer/
├── backend/                    # Go 后端 API
│   ├── controllers/            # 控制器
│   │   ├── auth.go            # 认证相关
│   │   ├── pomodoro.go        # 番茄钟管理
│   │   ├── category.go        # 分类管理
│   │   ├── stats.go           # 统计数据
│   │   └── word.go            # 单词打卡
│   ├── models/                # 数据模型
│   │   ├── user.go
│   │   ├── pomodoro.go
│   │   ├── category.go
│   │   └── word_record.go
│   ├── middleware/            # 中间件
│   │   ├── auth.go            # JWT认证
│   │   ├── cors.go            # CORS配置
│   │   └── ratelimit.go       # 限流控制
│   ├── database/              # 数据库配置
│   ├── utils/                 # 工具函数
│   │   └── jwt.go             # JWT工具
│   └── main.go                # 入口文件
│
├── frontend/                   # 前端界面
│   ├── css/
│   │   └── main.css           # 主样式文件（3000+行）
│   ├── js/
│   │   ├── config.js          # API配置
│   │   ├── auth.js            # 认证逻辑
│   │   ├── timer.js           # 番茄钟逻辑
│   │   ├── stats.js           # 统计数据
│   │   ├── words.js           # 单词打卡
│   │   ├── leaderboard.js     # 排行榜
│   │   ├── profile.js         # 个人资料
│   │   └── app.js             # 主应用逻辑
│   └── index.html             # 主页面
│
├── deploy.sh                   # 部署脚本
├── .env.example               # 环境变量示例
├── SECURITY_DEPLOYMENT.md     # 安全部署指南
└── README.md                  # 项目文档
```

## 🚀 快速开始

### 前置要求
- Go 1.21 或更高版本
- SQLite 3
- 现代浏览器（支持 ES6+）

### 本地开发

1. **克隆项目**
```bash
git clone https://github.com/Kamintj-anon/pomodoro-timer.git
cd pomodoro-timer
```

2. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，设置JWT密钥等配置
```

3. **启动后端**
```bash
cd backend
go mod tidy
go run main.go
# 服务器将在 http://localhost:8080 启动
```

4. **访问应用**
- 打开浏览器访问：http://localhost:8080
- 后端自动托管前端静态文件

### 生产部署

详细部署指南请参考：[SECURITY_DEPLOYMENT.md](SECURITY_DEPLOYMENT.md)

**快速部署**：
```bash
# 1. 编译后端
cd backend
go build -o pomodoro-api

# 2. 配置环境变量
export JWT_SECRET="your-64-char-secret"
export ALLOWED_ORIGIN="http://yourdomain.com"
export GIN_MODE="release"

# 3. 启动服务
./pomodoro-api
```

**使用systemd**（推荐）：
```bash
# 复制服务文件
sudo cp pomodoro.service /etc/systemd/system/

# 启动服务
sudo systemctl daemon-reload
sudo systemctl enable pomodoro
sudo systemctl start pomodoro
```

## ⚙️ 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| JWT_SECRET | JWT签名密钥（建议64字符） | - | 生产环境必填 |
| ALLOWED_ORIGIN | 允许的CORS源 | http://localhost | 否 |
| GIN_MODE | Gin运行模式 | debug | 否 |
| DB_PATH | 数据库文件路径 | ./pomodoro.db | 否 |
| PORT | 服务端口 | 8080 | 否 |

**生成强随机JWT密钥**：
```bash
openssl rand -base64 64
```

### 前端配置

编辑 `frontend/js/config.js`：
```javascript
const API_CONFIG = {
    BASE_URL: 'http://124.220.224.91:8080/api', // 修改为你的服务器地址
    TIMEOUT: 10000,
    TOKEN_KEY: 'pomodoro_token',
    USER_KEY: 'pomodoro_user'
};
```

## 📖 API文档

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 番茄钟接口
- `GET /api/pomodoros` - 获取番茄钟列表
- `POST /api/pomodoros` - 开始番茄钟
- `PUT /api/pomodoros/:id` - 完成番茄钟

### 单词打卡接口
- `GET /api/words` - 获取打卡记录
- `POST /api/words` - 提交打卡
- `GET /api/words/today` - 获取今日打卡
- `GET /api/words/stats` - 获取统计数据
- `DELETE /api/words/:id` - 删除记录

### 排行榜接口（公开）
- `GET /api/leaderboard` - 番茄钟排行榜
- `GET /api/words/leaderboard/daily` - 单词今日排行
- `GET /api/words/leaderboard/total` - 单词累计排行

### 统计接口
- `GET /api/stats` - 获取用户统计
- `GET /api/stats/categories` - 分类统计
- `GET /api/stats/daily` - 每日统计

## 🎯 使用说明

### 番茄钟使用
1. 注册账号或登录
2. 创建分类（如：学习、工作、运动等）
3. 选择分类，点击"开始"按钮
4. 专注工作，直到计时结束
5. 查看统计数据和历史记录
6. 查看排行榜，与其他用户比拼

### 单词打卡使用
1. 进入"单词打卡"标签页
2. 输入今日背诵的单词数量
3. 可选择日期和添加备注
4. 点击"提交打卡"
5. 查看累计统计和打卡记录
6. 点击"排行榜"查看自己的排名

## 🔧 开发计划

### 即将实现
- [ ] 番茄钟完成音效
- [ ] 桌面通知（Web Notifications）
- [ ] 数据导出功能（JSON/CSV）
- [ ] 深色模式切换
- [ ] PWA支持（离线可用）

### 考虑中
- [ ] 社交功能（好友、小组）
- [ ] 成就系统
- [ ] 学习目标设定
- [ ] 数据备份和恢复
- [ ] 多语言支持

## 🐛 故障排查

### 常见问题

**1. 登录后打卡记录加载失败**
- 检查JWT密钥是否正确配置
- 清除浏览器缓存，重新登录

**2. CORS错误**
- 检查 `ALLOWED_ORIGIN` 环境变量
- 确保前端API配置正确

**3. 限流触发**
- 登录接口：每分钟最多5次
- 注册接口：每小时最多3次
- 等待一段时间后重试

**4. 服务启动失败**
- 检查端口8080是否被占用
- 查看日志：`journalctl -u pomodoro -n 50`

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m '添加某个功能'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 👤 作者

**kamintj**
- GitHub: [@Kamintj-anon](https://github.com/Kamintj-anon)

## 🙏 致谢

- [Gin](https://github.com/gin-gonic/gin) - Go Web框架
- [GORM](https://gorm.io/) - Go ORM库
- [Font Awesome](https://fontawesome.com/) - 图标库

## 📞 支持

- 提交 Issue: [GitHub Issues](https://github.com/Kamintj-anon/pomodoro-timer/issues)
- 项目主页: [https://github.com/Kamintj-anon/pomodoro-timer](https://github.com/Kamintj-anon/pomodoro-timer)

---

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！

💡 欢迎提 Issue 和 PR，让这个项目变得更好！
