package main

import (
	"log"
	"pomodoro-api/controllers"
	"pomodoro-api/database"
	"pomodoro-api/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	// 初始化数据库
	database.InitDB()

	// 创建 Gin 路由
	r := gin.Default()

	// 跨域中间件
	r.Use(middleware.CORS())

	// 启动访问记录清理任务
	go middleware.CleanupVisitors()

	// 公开路由（无需认证）
	auth := r.Group("/api/auth")
	{
		// 注册接口：每小时最多3次
		auth.POST("/register", middleware.RateLimit(3, 3600), controllers.Register)
		// 登录接口：每分钟最多5次
		auth.POST("/login", middleware.RateLimit(5, 60), controllers.Login)
	}

	// 公开的数据接口（无需认证）
	r.GET("/api/leaderboard", controllers.GetLeaderboard)
	r.GET("/api/words/leaderboard/daily", controllers.GetWordDailyLeaderboard)
	r.GET("/api/words/leaderboard/total", controllers.GetWordTotalLeaderboard)

	// 需要认证的路由
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		// 用户信息
		api.GET("/profile", controllers.GetProfile)

		// 分类管理
		api.GET("/categories", controllers.GetCategories)
		api.POST("/categories", controllers.CreateCategory)
		api.PUT("/categories/:id", controllers.UpdateCategory)
		api.DELETE("/categories/:id", controllers.DeleteCategory)

		// 番茄钟管理
		api.POST("/pomodoros", controllers.StartPomodoro)
		api.PUT("/pomodoros/:id", controllers.CompletePomodoro)
		api.GET("/pomodoros", controllers.GetPomodoros)

		// 统计数据
		api.GET("/stats", controllers.GetStats)
		api.GET("/stats/total", controllers.GetTotalDuration)
		api.GET("/stats/categories", controllers.GetCategoryStats)
		api.GET("/stats/daily", controllers.GetDailyStats)

		// 用户设置
		api.GET("/settings", controllers.GetSettings)
		api.PUT("/settings", controllers.UpdateSettings)

		// 单词记录
		api.POST("/words", controllers.SubmitWordCount)
		api.GET("/words", controllers.GetWordRecords)
		api.GET("/words/today", controllers.GetTodayWordCount)
		api.GET("/words/stats", controllers.GetWordStats)
		api.DELETE("/words/:id", controllers.DeleteWordRecord)
	}

	// 静态文件托管
	r.Static("/css", "/www/wwwroot/pomodoro-frontend/css")
	r.Static("/js", "/www/wwwroot/pomodoro-frontend/js")
	r.StaticFile("/", "/www/wwwroot/pomodoro-frontend/index.html")
	r.StaticFile("/index.html", "/www/wwwroot/pomodoro-frontend/index.html")

	log.Println("服务器启动成功，监听端口 8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("服务器启动失败:", err)
	}
}
