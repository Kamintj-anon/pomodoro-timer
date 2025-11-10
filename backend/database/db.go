package database

import (
	"log"
	"pomodoro-api/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	var err error
	DB, err = gorm.Open(sqlite.Open("pomodoro.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("数据库连接失败:", err)
	}

	// 自动迁移数据库表
	err = DB.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Pomodoro{},
		&models.Setting{},
		&models.WordRecord{},
	)
	if err != nil {
		log.Fatal("数据库迁移失败:", err)
	}

	log.Println("数据库初始化成功")
}
