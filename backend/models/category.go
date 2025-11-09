package models

import "gorm.io/gorm"

type Category struct {
	gorm.Model
	UserID uint   `gorm:"not null" json:"user_id"`
	Name   string `gorm:"not null" json:"name"`
	Color  string `gorm:"default:#FF6B6B" json:"color"`
	Icon   string `json:"icon,omitempty"`
	User   User   `gorm:"foreignKey:UserID" json:"-"`
}
