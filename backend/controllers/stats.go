package controllers

import (
	"time"
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

// CheckinStatsResponse 打卡统计响应
type CheckinStatsResponse struct {
	StreakDays      int  `json:"streak_days"`       // 连续打卡天数
	TodayDuration   int  `json:"today_duration"`    // 今日学习时长（秒）
	TodayGoal       int  `json:"today_goal"`        // 今日目标（秒）
	TodayCompleted  bool `json:"today_completed"`   // 今日是否完成目标
	TodayCount      int  `json:"today_count"`       // 今日番茄钟数量
	ExamDate        *string `json:"exam_date"`      // 考试日期
	ExamName        string  `json:"exam_name"`      // 考试名称
	DaysUntilExam   int  `json:"days_until_exam"`   // 距离考试天数
}

// GetCheckinStats 获取打卡统计
func GetCheckinStats(c *gin.Context) {
	userID := c.GetUint("user_id")

	// 获取用户设置
	var setting models.Setting
	database.DB.Where("user_id = ?", userID).First(&setting)

	// 今日学习时长
	today := time.Now().Format("2006-01-02")
	var todayStats struct {
		Duration int
		Count    int
	}
	database.DB.Model(&models.Pomodoro{}).
		Select("COALESCE(SUM(duration), 0) as duration, COUNT(*) as count").
		Where("user_id = ? AND completed = ? AND DATE(started_at) = ?", userID, true, today).
		Scan(&todayStats)

	// 计算连续打卡天数
	streakDays := calculateStreak(userID, setting.DailyGoal)

	// 计算距离考试天数
	daysUntilExam := 0
	if setting.ExamDate != nil && *setting.ExamDate != "" {
		examDate, err := time.Parse("2006-01-02", *setting.ExamDate)
		if err == nil {
			daysUntilExam = int(examDate.Sub(time.Now()).Hours() / 24) + 1
			if daysUntilExam < 0 {
				daysUntilExam = 0
			}
		}
	}

	response := CheckinStatsResponse{
		StreakDays:     streakDays,
		TodayDuration:  todayStats.Duration,
		TodayGoal:      setting.DailyGoal,
		TodayCompleted: todayStats.Duration >= setting.DailyGoal,
		TodayCount:     todayStats.Count,
		ExamDate:       setting.ExamDate,
		ExamName:       setting.ExamName,
		DaysUntilExam:  daysUntilExam,
	}

	c.JSON(http.StatusOK, response)
}

// calculateStreak 计算连续打卡天数
func calculateStreak(userID uint, dailyGoal int) int {
	type DayDuration struct {
		Date     string
		Duration int
	}

	var results []DayDuration
	database.DB.Model(&models.Pomodoro{}).
		Select("DATE(started_at) as date, SUM(duration) as duration").
		Where("user_id = ? AND completed = ?", userID, true).
		Group("DATE(started_at)").
		Order("date DESC").
		Limit(365).
		Scan(&results)

	if len(results) == 0 {
		return 0
	}

	streak := 0
	today := time.Now()

	for i, r := range results {
		date, err := time.Parse("2006-01-02", r.Date)
		if err != nil {
			continue
		}

		// 计算期望的日期（今天往前数）
		expectedDate := today.AddDate(0, 0, -i)

		// 日期必须匹配且达到目标
		if date.Format("2006-01-02") == expectedDate.Format("2006-01-02") && r.Duration >= dailyGoal {
			streak++
		} else if i == 0 && date.Format("2006-01-02") == today.AddDate(0, 0, -1).Format("2006-01-02") && r.Duration >= dailyGoal {
			// 如果今天还没学习，但昨天达标了，从昨天开始计算
			streak++
		} else {
			break
		}
	}

	return streak
}
