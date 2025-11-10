package middleware

import (
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// visitor 记录访问者信息
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
// windowSeconds: 时间窗口（秒）
func RateLimit(maxRequests int, windowSeconds int) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()

		mu.Lock()
		v, exists := visitors[ip]
		now := time.Now()
		window := time.Duration(windowSeconds) * time.Second

		if !exists || now.Sub(v.lastSeen) > window {
			// 新访问者或时间窗口已过期
			visitors[ip] = &visitor{
				lastSeen: now,
				count:    1,
			}
			mu.Unlock()
			c.Next()
			return
		}

		if v.count >= maxRequests {
			// 超过限制
			mu.Unlock()
			log.Printf("限流触发: IP=%s, 请求数=%d, 窗口=%ds", ip, v.count, windowSeconds)
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "请求过于频繁，请稍后再试",
			})
			c.Abort()
			return
		}

		// 增加计数
		v.count++
		v.lastSeen = now
		mu.Unlock()
		c.Next()
	}
}

// CleanupVisitors 定期清理过期的访问记录
func CleanupVisitors() {
	ticker := time.NewTicker(5 * time.Minute)
	log.Println("启动访问记录清理任务（每5分钟）")

	for range ticker.C {
		mu.Lock()
		cleaned := 0
		for ip, v := range visitors {
			if time.Since(v.lastSeen) > 10*time.Minute {
				delete(visitors, ip)
				cleaned++
			}
		}
		mu.Unlock()

		if cleaned > 0 {
			log.Printf("清理了 %d 条过期的访问记录", cleaned)
		}
	}
}

// GetVisitorStats 获取当前访问统计（用于监控）
func GetVisitorStats() map[string]interface{} {
	mu.RLock()
	defer mu.RUnlock()

	return map[string]interface{}{
		"total_visitors": len(visitors),
		"timestamp":      time.Now(),
	}
}
