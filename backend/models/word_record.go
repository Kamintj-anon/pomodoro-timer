package models

import "gorm.io/gorm"

type WordRecord struct {
	gorm.Model
	UserID    uint   `gorm:"not null" json:"user_id"`
	Date      string `gorm:"type:date;not null;index:idx_user_date,unique" json:"date"` // YYYY-MM-DD 格式
	WordCount int    `gorm:"not null;default:0" json:"word_count"`
	Note      string `gorm:"type:text" json:"note"`
	User      User   `gorm:"foreignKey:UserID" json:"-"`
}
