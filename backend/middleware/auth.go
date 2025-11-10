package middleware

import (
	"log"
	"net/http"
	"os"
	"pomodoro-api/utils"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware JWT 认证中间件
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "缺少认证令牌"})
			c.Abort()
			return
		}

		// Bearer Token
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "认证令牌格式错误"})
			c.Abort()
			return
		}

		// 解析 Token
		claims, err := utils.ParseToken(parts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "无效的认证令牌"})
			c.Abort()
			return
		}

		// 将用户 ID 存入上下文
		c.Set("user_id", claims.UserID)
		c.Next()
	}
}

// CORS 跨域中间件（支持环境变量配置）
func CORS() gin.HandlerFunc {
	// 从环境变量获取允许的域名
	allowedOrigin := getAllowedOrigin()
	log.Printf("CORS配置: 允许的域名 = %s", allowedOrigin)

	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		// 检查请求来源是否在允许列表中
		if allowedOrigin == "*" || origin == allowedOrigin {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		} else if allowedOrigin != "*" {
			// 如果设置了特定域名但请求来源不匹配，只允许配置的域名
			c.Writer.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		}

		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// getAllowedOrigin 获取允许的跨域源
func getAllowedOrigin() string {
	origin := os.Getenv("ALLOWED_ORIGIN")
	if origin == "" {
		// 默认允许服务器IP（开发环境）
		defaultOrigin := "http://124.220.224.91"
		log.Println("警告: 未设置ALLOWED_ORIGIN环境变量，使用默认配置（仅用于开发）")
		return defaultOrigin
	}
	return origin
}
