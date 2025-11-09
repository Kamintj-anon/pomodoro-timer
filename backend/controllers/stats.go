package controllers

import (
	"net/http"
	"pomodoro-api/database"
	"pomodoro-api/models"

	"github.com/gin-gonic/gin"
)

type CategoryStats struct {
	ID         uint   `json:"id"`
	Name       string `json:"name"`
	Color      string `json:"color"`
	Duration   int    `json:"duration"`   // 总时长（秒）
	Count      int64  `json:"count"`      // 番茄钟数量
	Percentage float64 `json:"percentage"` // 占总时长的百分比
}

type StatsResponse struct {
	TotalDuration int             `json:"total_duration"` // 总时长（秒）
	TotalCount    int64           `json:"total_count"`    // 总番茄钟数
	Categories    []CategoryStats `json:"categories"`     // 各分类统计
}

// GetStats 获取统计数据（总时长 + 各分类时长）
func GetStats(c *gin.Context) {
	userID := c.GetUint("user_id")

	// 查询所有已完成的番茄钟
	var pomodoros []models.Pomodoro
	database.DB.Where("user_id = ? AND completed = ?", userID, true).Preload("Category").Find(&pomodoros)

	// 计算总时长和总数量
	var totalDuration int
	for _, p := range pomodoros {
		totalDuration += p.Duration
	}
	totalCount := int64(len(pomodoros))

	// 按分类统计
	categoryMap := make(map[uint]*CategoryStats)

	for _, p := range pomodoros {
		if _, exists := categoryMap[p.CategoryID]; !exists {
			categoryMap[p.CategoryID] = &CategoryStats{
				ID:       p.Category.ID,
				Name:     p.Category.Name,
				Color:    p.Category.Color,
				Duration: 0,
				Count:    0,
			}
		}
		categoryMap[p.CategoryID].Duration += p.Duration
		categoryMap[p.CategoryID].Count++
	}

	// 计算百分比
	categories := make([]CategoryStats, 0, len(categoryMap))
	for _, stats := range categoryMap {
		if totalDuration > 0 {
			stats.Percentage = float64(stats.Duration) / float64(totalDuration) * 100
		}
		categories = append(categories, *stats)
	}

	response := StatsResponse{
		TotalDuration: totalDuration,
		TotalCount:    totalCount,
		Categories:    categories,
	}

	c.JSON(http.StatusOK, response)
}

// GetTotalDuration 获取总时长
func GetTotalDuration(c *gin.Context) {
	userID := c.GetUint("user_id")

	var result struct {
		TotalDuration int `json:"total_duration"`
	}

	database.DB.Model(&models.Pomodoro{}).
		Where("user_id = ? AND completed = ?", userID, true).
		Select("COALESCE(SUM(duration), 0) as total_duration").
		Scan(&result)

	c.JSON(http.StatusOK, result)
}

// GetCategoryStats 获取各分类统计
func GetCategoryStats(c *gin.Context) {
	userID := c.GetUint("user_id")

	type Result struct {
		CategoryID uint
		Duration   int
		Count      int64
	}

	var results []Result
	database.DB.Model(&models.Pomodoro{}).
		Select("category_id, SUM(duration) as duration, COUNT(*) as count").
		Where("user_id = ? AND completed = ?", userID, true).
		Group("category_id").
		Scan(&results)

	// 获取分类信息
	var categories []models.Category
	database.DB.Where("user_id = ?", userID).Find(&categories)

	categoryMap := make(map[uint]models.Category)
	for _, cat := range categories {
		categoryMap[cat.ID] = cat
	}

	// 组装结果
	stats := make([]CategoryStats, 0)
	for _, r := range results {
		if cat, exists := categoryMap[r.CategoryID]; exists {
			stats = append(stats, CategoryStats{
				ID:       cat.ID,
				Name:     cat.Name,
				Color:    cat.Color,
				Duration: r.Duration,
				Count:    r.Count,
			})
		}
	}

	c.JSON(http.StatusOK, stats)
}

// GetDailyStats 获取每日统计
func GetDailyStats(c *gin.Context) {
	userID := c.GetUint("user_id")

	type DailyResult struct {
		Date     string `json:"date"`
		Duration int    `json:"duration"`
		Count    int64  `json:"count"`
	}

	var results []DailyResult
	database.DB.Model(&models.Pomodoro{}).
		Select("DATE(started_at) as date, SUM(duration) as duration, COUNT(*) as count").
		Where("user_id = ? AND completed = ?", userID, true).
		Group("DATE(started_at)").
		Order("date DESC").
		Limit(30). // 最近30天
		Scan(&results)

	c.JSON(http.StatusOK, results)
}

// 获取排行榜
func GetLeaderboard(c *gin.Context) {
	type UserStat struct {
		UserID       uint   `json:"user_id"`
		Username     string `json:"username"`
		TotalCount   int64  `json:"total_count"`
		TotalDuration int   `json:"total_duration"`
	}

	var userStats []UserStat

	// 查询所有用户的统计数据
	database.DB.Table("pomodoros").
		Select("users.id as user_id, users.username, COUNT(*) as total_count, SUM(pomodoros.duration) as total_duration").
		Joins("JOIN users ON users.id = pomodoros.user_id").
		Where("pomodoros.completed = ?", true).
		Group("users.id, users.username").
		Order("total_duration DESC").
		Limit(100).
		Scan(&userStats)

	c.JSON(http.StatusOK, userStats)
}
