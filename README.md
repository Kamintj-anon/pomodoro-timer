# 🍅 番茄钟 - Pomodoro Timer

一个现代化的番茄钟时间管理应用，帮助你提升专注力和工作效率。

## ✨ 功能特性

- 🔐 用户认证（注册/登录）
- ⏱️ 可自定义时长的番茄钟计时器
- 📁 自定义分类管理
- 📊 详细的统计数据和历史记录
- 🏆 排行榜（按总专注时长排名，支持金银铜牌显示）
- 👤 个人资料和设置
- 🎨 优雅的薄荷绿主题设计
- 📱 响应式界面

## 🛠️ 技术栈

### 后端
- **语言**: Go 1.21+
- **框架**: Gin
- **数据库**: SQLite + GORM
- **认证**: JWT

### 前端
- **技术**: Vanilla JavaScript (SPA)
- **UI**: Font Awesome 图标
- **样式**: 纯 CSS（复杂动画和过渡效果）

## 📦 项目结构

```
pomodoro-timer/
├── backend/          # Go 后端 API
│   ├── controllers/  # 控制器
│   ├── models/       # 数据模型
│   ├── middleware/   # 中间件
│   ├── database/     # 数据库配置
│   ├── utils/        # 工具函数
│   └── main.go       # 入口文件
│
└── frontend/         # 前端界面
    ├── css/          # 样式文件
    ├── js/           # JavaScript 文件
    └── index.html    # 主页面
```

## 🚀 快速开始

### 后端部署

```bash
cd backend
go mod tidy
go run main.go
# 服务器将在 http://localhost:8080 启动
```

### 前端部署

方式一：由后端直接服务（已配置）
- 后端会自动托管前端静态文件
- 访问 http://localhost:8080 即可

方式二：独立部署
- 将 frontend 目录部署到任意静态服务器
- 修改 `frontend/js/config.js` 中的 API 地址

## 📝 配置说明

### 后端配置
- 数据库文件：`pomodoro.db`（自动创建）
- 端口：8080（可在 main.go 修改）
- JWT 密钥：在 `utils/jwt.go` 中配置

### 前端配置
编辑 `frontend/js/config.js`：
```javascript
const API_CONFIG = {
    BASE_URL: 'http://你的服务器IP:8080/api',
    // ...
};
```

## 🎯 使用说明

1. 注册账号或登录
2. 创建分类（如：学习、工作、运动等）
3. 选择分类，点击开始按钮
4. 专注工作，直到计时结束
5. 查看统计数据和历史记录
6. 点击排行榜查看与其他用户的排名对比

## 📸 截图

（待添加）

## 🔧 开发计划

- [ ] 番茄钟完成音效
- [ ] 桌面通知
- [ ] 数据导出功能
- [ ] 深色模式
- [ ] 移动端优化

## 📄 许可证

MIT License

## 👤 作者

kamintj

---

💡 如有问题或建议，欢迎提 Issue！
