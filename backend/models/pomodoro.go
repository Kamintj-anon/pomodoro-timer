package models

import (
	"time"

	"gorm.io/gorm"
)

type Pomodoro struct {
	gorm.Model
	UserID          uint       `gorm:"not null" json:"user_id"`
	CategoryID      uint       `gorm:"not null" json:"category_id"`
	Duration        int        `gorm:"not null" json:"duration"`                   // 实际时长（秒）
	PlannedDuration int        `gorm:"default:1500" json:"planned_duration"`       // 计划时长（默认25分钟）
	Completed       bool       `gorm:"default:false" json:"completed"`
	StartedAt       time.Time  `gorm:"not null" json:"started_at"`
	CompletedAt     *time.Time `json:"completed_at,omitempty"`
	Note            string     `json:"note,omitempty"`
	User            User       `gorm:"foreignKey:UserID" json:"-"`
	Category        Category   `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
}
