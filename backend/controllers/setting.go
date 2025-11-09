package controllers

import (
	"net/http"
	"pomodoro-api/database"
	"pomodoro-api/models"

	"github.com/gin-gonic/gin"
)

// GetSettings 获取用户设置
func GetSettings(c *gin.Context) {
	userID := c.GetUint("user_id")

	var setting models.Setting
	if err := database.DB.Where("user_id = ?", userID).First(&setting).Error; err != nil {
		// 如果没有设置，返回默认值
		setting = models.Setting{
			UserID:              userID,
			DefaultDuration:     1500,
			ShortBreak:          300,
			LongBreak:           900,
			AutoStartBreak:      false,
			NotificationEnabled: true,
		}
	}

	c.JSON(http.StatusOK, setting)
}

// UpdateSettings 更新用户设置
func UpdateSettings(c *gin.Context) {
	userID := c.GetUint("user_id")

	var input struct {
		DefaultDuration     *int  `json:"default_duration"`
		ShortBreak          *int  `json:"short_break"`
		LongBreak           *int  `json:"long_break"`
		AutoStartBreak      *bool `json:"auto_start_break"`
		NotificationEnabled *bool `json:"notification_enabled"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var setting models.Setting
	result := database.DB.Where("user_id = ?", userID).First(&setting)

	if result.Error != nil {
		// 创建新设置
		setting = models.Setting{
			UserID:              userID,
			DefaultDuration:     1500,
			ShortBreak:          300,
			LongBreak:           900,
			AutoStartBreak:      false,
			NotificationEnabled: true,
		}
		database.DB.Create(&setting)
	}

	// 更新字段（只更新传入的字段）
	if input.DefaultDuration != nil {
		setting.DefaultDuration = *input.DefaultDuration
	}
	if input.ShortBreak != nil {
		setting.ShortBreak = *input.ShortBreak
	}
	if input.LongBreak != nil {
		setting.LongBreak = *input.LongBreak
	}
	if input.AutoStartBreak != nil {
		setting.AutoStartBreak = *input.AutoStartBreak
	}
	if input.NotificationEnabled != nil {
		setting.NotificationEnabled = *input.NotificationEnabled
	}

	database.DB.Save(&setting)

	c.JSON(http.StatusOK, setting)
}
