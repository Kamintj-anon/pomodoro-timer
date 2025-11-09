package models

import "gorm.io/gorm"

type Setting struct {
	gorm.Model
	UserID              uint `gorm:"unique;not null" json:"user_id"`
	DefaultDuration     int  `gorm:"default:1500" json:"default_duration"`      // 默认25分钟
	ShortBreak          int  `gorm:"default:300" json:"short_break"`            // 短休息5分钟
	LongBreak           int  `gorm:"default:900" json:"long_break"`             // 长休息15分钟
	AutoStartBreak      bool `gorm:"default:false" json:"auto_start_break"`
	NotificationEnabled bool `gorm:"default:true" json:"notification_enabled"`
	User                User `gorm:"foreignKey:UserID" json:"-"`
}
