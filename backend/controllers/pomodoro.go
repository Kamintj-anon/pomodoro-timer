 package controllers

  import (
        "net/http"
        "time"

        "pomodoro-api/database"
        "pomodoro-api/models"

        "github.com/gin-gonic/gin"
  )

  // StartPomodoro 开始番茄钟
  func StartPomodoro(c *gin.Context) {
        userID := c.GetUint("user_id")

        var input struct {
                CategoryID      uint   `json:"category_id" binding:"required"`
                PlannedDuration int    `json:"planned_duration"` // 可选，默认用设置中的时长
                Note            string `json:"note"`
        }

        if err := c.ShouldBindJSON(&input); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
        }

        // 验证分类是否属于当前用户
        var category models.Category
        if err := database.DB.Where("id = ? AND user_id = ?", input.CategoryID, userID).First(&category).Error; err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": "分类不存在"})
                return
        }

        // 如果没有指定时长，使用默认设置
        plannedDuration := input.PlannedDuration
        if plannedDuration == 0 {
                var setting models.Setting
                database.DB.Where("user_id = ?", userID).First(&setting)
                plannedDuration = setting.DefaultDuration
        }

        pomodoro := models.Pomodoro{
                UserID:          userID,
                CategoryID:      input.CategoryID,
                PlannedDuration: plannedDuration,
                Duration:        0,
                Completed:       false,
                StartedAt:       time.Now(),
                Note:            input.Note,
        }

        if err := database.DB.Create(&pomodoro).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败"})
                return
        }

        // 加载分类信息
        database.DB.Preload("Category").First(&pomodoro, pomodoro.ID)

        c.JSON(http.StatusOK, pomodoro)
  }

  // CompletePomodoro 完成/取消番茄钟
  func CompletePomodoro(c *gin.Context) {
        userID := c.GetUint("user_id")
        pomodoroID := c.Param("id")

        var pomodoro models.Pomodoro
        if err := database.DB.Where("id = ? AND user_id = ?", pomodoroID, userID).First(&pomodoro).Error; err != nil {
                c.JSON(http.StatusNotFound, gin.H{"error": "番茄钟不存在"})
                return
        }

        var input struct {
                Completed bool `json:"completed"`
        }

        if err := c.ShouldBindJSON(&input); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
        }

        now := time.Now()
        pomodoro.Completed = input.Completed
        pomodoro.CompletedAt = &now

        // 计算实际时长
        duration := int(now.Sub(pomodoro.StartedAt).Seconds())
        pomodoro.Duration = duration

        database.DB.Save(&pomodoro)

        // 加载分类信息
        database.DB.Preload("Category").First(&pomodoro, pomodoro.ID)

        c.JSON(http.StatusOK, pomodoro)
  }

  // GetPomodoros 获取番茄钟历史
  func GetPomodoros(c *gin.Context) {
        userID := c.GetUint("user_id")

        // 查询参数
        categoryID := c.Query("category_id")
        completed := c.Query("completed")

        var pomodoros []models.Pomodoro
        query := database.DB.Where("user_id = ?", userID).Preload("Category")

        if categoryID != "" {
                query = query.Where("category_id = ?", categoryID)
        }
        if completed != "" {
                query = query.Where("completed = ?", completed)
        }

        query.Order("created_at DESC").Limit(50).Find(&pomodoros)

        c.JSON(http.StatusOK, pomodoros)
  }