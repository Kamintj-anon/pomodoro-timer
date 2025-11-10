package controllers

import (
	"net/http"
	"pomodoro-api/database"
	"pomodoro-api/models"
	"time"

	"github.com/gin-gonic/gin"
)

// SubmitWordCount 提交或更新今日单词数量
func SubmitWordCount(c *gin.Context) {
	userID := c.GetUint("user_id")

	var input struct {
		Date      string `json:"date"`       // YYYY-MM-DD 格式
		WordCount int    `json:"word_count"` // 单词数量
		Note      string `json:"note"`       // 备注
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数错误"})
		return
	}

	// 验证日期格式
	if input.Date == "" {
		input.Date = time.Now().Format("2006-01-02")
	}

	// 验证单词数量
	if input.WordCount < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "单词数量不能为负数"})
		return
	}

	// 查找是否已存在该日期的记录
	var record models.WordRecord
	result := database.DB.Where("user_id = ? AND date = ?", userID, input.Date).First(&record)

	if result.Error == nil {
		// 更新已有记录
		record.WordCount = input.WordCount
		record.Note = input.Note
		database.DB.Save(&record)
		c.JSON(http.StatusOK, record)
	} else {
		// 创建新记录
		newRecord := models.WordRecord{
			UserID:    userID,
			Date:      input.Date,
			WordCount: input.WordCount,
			Note:      input.Note,
		}
		database.DB.Create(&newRecord)
		c.JSON(http.StatusCreated, newRecord)
	}
}

// GetWordRecords 获取用户的单词记录
func GetWordRecords(c *gin.Context) {
	userID := c.GetUint("user_id")

	var records []models.WordRecord
	database.DB.Where("user_id = ?", userID).
		Order("date DESC").
		Find(&records)

	c.JSON(http.StatusOK, records)
}

// GetTodayWordCount 获取今日单词数量
func GetTodayWordCount(c *gin.Context) {
	userID := c.GetUint("user_id")
	today := time.Now().Format("2006-01-02")

	var record models.WordRecord
	result := database.DB.Where("user_id = ? AND date = ?", userID, today).First(&record)

	if result.Error != nil {
		c.JSON(http.StatusOK, gin.H{
			"date":       today,
			"word_count": 0,
			"note":       "",
		})
		return
	}

	c.JSON(http.StatusOK, record)
}

// GetWordStats 获取单词统计数据
func GetWordStats(c *gin.Context) {
	userID := c.GetUint("user_id")

	// 总单词数
	var totalWords int
	database.DB.Model(&models.WordRecord{}).
		Where("user_id = ?", userID).
		Select("COALESCE(SUM(word_count), 0)").
		Scan(&totalWords)

	// 总天数
	var totalDays int64
	database.DB.Model(&models.WordRecord{}).
		Where("user_id = ?", userID).
		Count(&totalDays)

	// 平均每天
	var avgPerDay float64
	if totalDays > 0 {
		avgPerDay = float64(totalWords) / float64(totalDays)
	}

	// 最近7天
	sevenDaysAgo := time.Now().AddDate(0, 0, -7).Format("2006-01-02")
	var last7Days []models.WordRecord
	database.DB.Where("user_id = ? AND date >= ?", userID, sevenDaysAgo).
		Order("date DESC").
		Find(&last7Days)

	c.JSON(http.StatusOK, gin.H{
		"total_words": totalWords,
		"total_days":  totalDays,
		"avg_per_day": avgPerDay,
		"last_7_days": last7Days,
	})
}

// DeleteWordRecord 删除单词记录
func DeleteWordRecord(c *gin.Context) {
	userID := c.GetUint("user_id")
	recordID := c.Param("id")

	var record models.WordRecord
	result := database.DB.Where("id = ? AND user_id = ?", recordID, userID).First(&record)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "记录不存在"})
		return
	}

	database.DB.Delete(&record)
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

// GetWordDailyLeaderboard 获取每日单词排行榜
func GetWordDailyLeaderboard(c *gin.Context) {
	today := time.Now().Format("2006-01-02")

	type LeaderboardItem struct {
		UserID    uint   `json:"user_id"`
		Username  string `json:"username"`
		WordCount int    `json:"word_count"`
	}

	var leaderboard []LeaderboardItem
	database.DB.Table("word_records").
		Select("word_records.user_id, users.username, word_records.word_count").
		Joins("LEFT JOIN users ON users.id = word_records.user_id").
		Where("word_records.date = ?", today).
		Order("word_records.word_count DESC").
		Limit(50).
		Scan(&leaderboard)

	c.JSON(http.StatusOK, leaderboard)
}

// GetWordTotalLeaderboard 获取累计单词排行榜
func GetWordTotalLeaderboard(c *gin.Context) {
	type LeaderboardItem struct {
		UserID     uint   `json:"user_id"`
		Username   string `json:"username"`
		TotalWords int    `json:"total_words"`
		TotalDays  int    `json:"total_days"`
	}

	var leaderboard []LeaderboardItem
	database.DB.Table("word_records").
		Select("word_records.user_id, users.username, SUM(word_records.word_count) as total_words, COUNT(DISTINCT word_records.date) as total_days").
		Joins("LEFT JOIN users ON users.id = word_records.user_id").
		Group("word_records.user_id, users.username").
		Order("total_words DESC").
		Limit(50).
		Scan(&leaderboard)

	c.JSON(http.StatusOK, leaderboard)
}
