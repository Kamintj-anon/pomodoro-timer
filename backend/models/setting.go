package models

import "gorm.io/gorm"

type Setting struct {
	gorm.Model
	UserID              uint    `gorm:"unique;not null" json:"user_id"`
	DefaultDuration     int     `gorm:"default:1500" json:"default_duration"`      // 默认25分钟
	ShortBreak          int     `gorm:"default:300" json:"short_break"`            // 短休息5分钟
	LongBreak           int     `gorm:"default:900" json:"long_break"`             // 长休息15分钟
	AutoStartBreak      bool    `gorm:"default:false" json:"auto_start_break"`
	NotificationEnabled bool    `gorm:"default:true" json:"notification_enabled"`
	DailyGoal           int     `gorm:"default:7200" json:"daily_goal"`            // 每日目标（秒），默认2小时
	ExamDate            *string `gorm:"type:date" json:"exam_date"`                // 考试日期 YYYY-MM-DD
	ExamName            string  `gorm:"default:''' json:"exam_name"`               // 考试名称
	User                User    `gorm:"foreignKey:UserID" json:"-"`
}
