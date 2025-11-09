package controllers

import (
	"net/http"
	"pomodoro-api/database"
	"pomodoro-api/models"
	"pomodoro-api/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// Register 用户注册
func Register(c *gin.Context) {
	var input struct {
		Username string `json:"username" binding:"required,min=3,max=20"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 加密密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "密码加密失败"})
		return
	}

	user := models.User{
		Username: input.Username,
		Email:    input.Email,
		Password: string(hashedPassword),
	}

	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "用户名或邮箱已存在"})
		return
	}

	// 创建默认设置
	setting := models.Setting{
		UserID:              user.ID,
		DefaultDuration:     1500,
		ShortBreak:          300,
		LongBreak:           900,
		AutoStartBreak:      false,
		NotificationEnabled: true,
	}
	database.DB.Create(&setting)

	// 创建默认分类
	defaultCategories := []models.Category{
		{UserID: user.ID, Name: "学习", Color: "#FF6B6B"},
		{UserID: user.ID, Name: "工作", Color: "#4ECDC4"},
		{UserID: user.ID, Name: "运动", Color: "#95E1D3"},
	}
	for _, cat := range defaultCategories {
		database.DB.Create(&cat)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "注册成功",
		"user":    user,
	})
}

// Login 用户登录
func Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户不存在"})
		return
	}

	// 验证密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "密码错误"})
		return
	}

	// 生成 JWT
	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Token 生成失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user":  user,
	})
}

// GetProfile 获取用户信息
func GetProfile(c *gin.Context) {
	userID := c.GetUint("user_id")

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}

	c.JSON(http.StatusOK, user)
}
