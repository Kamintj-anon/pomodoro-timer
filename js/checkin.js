// 打卡统计模块

// 全局变量存储打卡数据
let checkinData = null;

// 加载打卡统计
async function loadCheckinStats() {
    try {
        checkinData = await api.get(API_ENDPOINTS.STATS_CHECKIN);
        updateCheckinUI();
    } catch (error) {
        console.error("加载打卡统计失败:", error);
    }
}

// 更新打卡 UI
function updateCheckinUI() {
    console.log("[DEBUG] updateCheckinUI called");
    console.log("[DEBUG] checkinData:", JSON.stringify(checkinData));
    if (!checkinData) return;

    // 更新考试倒计时
    console.log("[DEBUG] exam_date:", checkinData.exam_date, "days_until_exam:", checkinData.days_until_exam);
    const examCountdown = document.getElementById("exam-countdown");
    console.log("[DEBUG] examCountdown element found:", examCountdown !== null);
    if (examCountdown) {
        if (checkinData.exam_date && checkinData.days_until_exam > 0) {
            examCountdown.style.display = "block";
            document.getElementById("exam-name").textContent = checkinData.exam_name || "考试";
            document.getElementById("days-until-exam").textContent = checkinData.days_until_exam;
        } else {
            examCountdown.style.display = "none";
        }
    }

    // 更新连续打卡天数
    const streakDays = document.getElementById("streak-days");
    if (streakDays) {
        streakDays.textContent = checkinData.streak_days;
    }

    // 更新今日目标进度
    const todayProgress = document.getElementById("today-progress");
    const todayProgressBar = document.getElementById("today-progress-bar");
    const todayDuration = document.getElementById("today-duration");
    const todayGoal = document.getElementById("today-goal");

    if (todayProgress && todayProgressBar) {
        const progress = checkinData.today_goal > 0 
            ? Math.min((checkinData.today_duration / checkinData.today_goal) * 100, 100) 
            : 0;
        
        todayProgressBar.style.width = progress + "%";
        todayProgressBar.className = "progress-fill" + (checkinData.today_completed ? " completed" : "");
        
        if (todayDuration) {
            todayDuration.textContent = formatDuration(checkinData.today_duration);
        }
        if (todayGoal) {
            todayGoal.textContent = formatDuration(checkinData.today_goal);
        }
    }

    // 更新完成状态图标
    const statusIcon = document.getElementById("today-status-icon");
    if (statusIcon) {
        if (checkinData.today_completed) {
            statusIcon.innerHTML = "<i class=\"fas fa-check-circle\" style=\"color: #4CAF50;\"></i>";
        } else {
            statusIcon.innerHTML = "<i class=\"fas fa-clock\" style=\"color: #FF9800;\"></i>";
        }
    }
}

// 显示目标设置弹窗
function showGoalSettingsModal() {
    const modal = document.getElementById("goal-settings-modal");
    if (!modal) {
        console.error("找不到目标设置弹窗");
        return;
    }

    // 加载当前设置
    loadCurrentSettings();
    modal.classList.add("active");
}

// 关闭目标设置弹窗
function closeGoalSettingsModal() {
    const modal = document.getElementById("goal-settings-modal");
    if (modal) {
        modal.classList.remove("active");
    }
}

// 加载当前设置
async function loadCurrentSettings() {
    try {
        const settings = await api.get(API_ENDPOINTS.SETTINGS);
        
        // 设置每日目标（转换为分钟）
        const dailyGoalInput = document.getElementById("daily-goal-input");
        if (dailyGoalInput && settings.daily_goal) {
            dailyGoalInput.value = Math.floor(settings.daily_goal / 60);
        }
        
        // 设置考试日期
        const examDateInput = document.getElementById("exam-date-input");
        if (examDateInput && settings.exam_date) {
            examDateInput.value = settings.exam_date;
        }
        
        // 设置考试名称
        const examNameInput = document.getElementById("exam-name-input");
        if (examNameInput && settings.exam_name) {
            examNameInput.value = settings.exam_name;
        }
    } catch (error) {
        console.error("加载设置失败:", error);
    }
}

// 保存目标设置
async function saveGoalSettings() {
    try {
        const dailyGoalInput = document.getElementById("daily-goal-input");
        const examDateInput = document.getElementById("exam-date-input");
        const examNameInput = document.getElementById("exam-name-input");
        
        const dailyGoalMinutes = parseInt(dailyGoalInput.value) || 120;
        const examDate = examDateInput.value || null;
        const examName = examNameInput.value || "";

        await api.put(API_ENDPOINTS.SETTINGS, {
            daily_goal: dailyGoalMinutes * 60,  // 转换为秒
            exam_date: examDate,
            exam_name: examName
        });

        showToast("设置已保存", "success");
        closeGoalSettingsModal();
        
        // 重新加载打卡统计
        await loadCheckinStats();
    } catch (error) {
        showToast("保存失败: " + error.message, "error");
    }
}

// 页面加载时初始化
document.addEventListener("DOMContentLoaded", function() {
    // 如果用户已登录，加载打卡统计
    const token = localStorage.getItem(API_CONFIG.TOKEN_KEY);
    if (token) {
        setTimeout(loadCheckinStats, 500);
    }
});

// 登录成功后也要加载
window.addEventListener("userLoggedIn", function() {
    loadCheckinStats();
});
