package controllers

import (
	"net/http"
	"pomodoro-api/database"
	"pomodoro-api/models"

	"github.com/gin-gonic/gin"
)

// GetCategories 获取所有分类
func GetCategories(c *gin.Context) {
	userID := c.GetUint("user_id")

	var categories []models.Category
	database.DB.Where("user_id = ?", userID).Find(&categories)

	c.JSON(http.StatusOK, categories)
}

// CreateCategory 创建分类
func CreateCategory(c *gin.Context) {
	userID := c.GetUint("user_id")

	var input struct {
		Name  string `json:"name" binding:"required"`
		Color string `json:"color"`
		Icon  string `json:"icon"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	category := models.Category{
		UserID: userID,
		Name:   input.Name,
		Color:  input.Color,
		Icon:   input.Icon,
	}

	if err := database.DB.Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, category)
}

// UpdateCategory 更新分类
func UpdateCategory(c *gin.Context) {
	userID := c.GetUint("user_id")
	categoryID := c.Param("id")

	var category models.Category
	if err := database.DB.Where("id = ? AND user_id = ?", categoryID, userID).First(&category).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "分类不存在"})
		return
	}

	var input struct {
		Name  string `json:"name"`
		Color string `json:"color"`
		Icon  string `json:"icon"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Name != "" {
		category.Name = input.Name
	}
	if input.Color != "" {
		category.Color = input.Color
	}
	category.Icon = input.Icon

	database.DB.Save(&category)

	c.JSON(http.StatusOK, category)
}

// DeleteCategory 删除分类
func DeleteCategory(c *gin.Context) {
	userID := c.GetUint("user_id")
	categoryID := c.Param("id")

	var category models.Category
	if err := database.DB.Where("id = ? AND user_id = ?", categoryID, userID).First(&category).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "分类不存在"})
		return
	}

	// 检查是否有番茄钟记录
	var count int64
	database.DB.Model(&models.Pomodoro{}).Where("category_id = ?", categoryID).Count(&count)
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "该分类下还有番茄钟记录，无法删除"})
		return
	}

	database.DB.Delete(&category)

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}
