// 计时器相关功能

// 全局变量
window.timerInterval = null;
window.currentPomodoro = null;
window.remainingSeconds = 25 * 60; // 默认 25 分钟
window.defaultDuration = 25 * 60;

// 初始化计时器
function initTimer() {
    const timerDisplay = document.getElementById('timer');
    const statusDisplay = document.getElementById('timer-status');

    // 获取默认时长（从设置中）
    loadSettings();

    // 显示默认时间
    updateTimerDisplay(window.remainingSeconds);
    statusDisplay.textContent = '准备开始';
}

// 加载用户设置
async function loadSettings() {
    try {
        const settings = await api.get(API_ENDPOINTS.SETTINGS);
        window.defaultDuration = settings.default_duration || 1500;
        window.remainingSeconds = window.defaultDuration;
        updateTimerDisplay(window.remainingSeconds);
    } catch (error) {
        console.error('加载设置失败:', error);
        // 使用默认值
        window.defaultDuration = 1500;
        window.remainingSeconds = 1500;
    }
}

// 更新计时器显示
function updateTimerDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const display = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    document.getElementById('timer').textContent = display;

    // 更新页面标题
    if (window.currentPomodoro) {
        document.title = `${display} - 番茄钟`;
    } else {
        document.title = '番茄钟 - 专注时间管理';
    }
}

// 开始计时
async function startTimer() {
    const categorySelect = document.getElementById('category-select');
    const categoryId = categorySelect.value;

    if (!categoryId) {
        showToast('请先选择一个分类', 'warning');
        return;
    }

    // 获取备注
    const note = document.getElementById('pomodoro-note').value.trim();

    try {
        // 调用 API 开始番茄钟
        const pomodoro = await api.post(API_ENDPOINTS.POMODOROS, {
            category_id: parseInt(categoryId),
            planned_duration: window.defaultDuration,
            note: note
        });

        window.currentPomodoro = pomodoro;

        // 切换按钮显示
        document.getElementById('start-btn').style.display = 'none';
        document.getElementById('pause-btn').style.display = 'inline-block';

        // 更新状态
        document.getElementById('timer-status').textContent = '专注中...';

        // 禁用分类选择
        categorySelect.disabled = true;

        // 开始倒计时
        window.remainingSeconds = window.defaultDuration;
        updateTimerDisplay(window.remainingSeconds);

        window.timerInterval = setInterval(() => {
            window.remainingSeconds--;
            updateTimerDisplay(window.remainingSeconds);

            // 时间到
            if (window.remainingSeconds <= 0) {
                completeTimer(true);
            }
        }, 1000);

        showToast('番茄钟已开始！', 'success');

    } catch (error) {
        showToast(error.message || '开始失败', 'error');
    }
}

// 暂停计时
function pauseTimer() {
    if (window.timerInterval) {
        clearInterval(window.timerInterval);
        window.timerInterval = null;

        document.getElementById('pause-btn').style.display = 'none';
        document.getElementById('start-btn').style.display = 'inline-block';
        document.getElementById('start-btn').textContent = '继续';

        document.getElementById('timer-status').textContent = '已暂停';

        showToast('计时已暂停', 'info');
    }
}

// 继续计时
function resumeTimer() {
    if (!window.currentPomodoro) {
        startTimer();
        return;
    }

    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('pause-btn').style.display = 'inline-block';

    document.getElementById('timer-status').textContent = '专注中...';

    window.timerInterval = setInterval(() => {
        window.remainingSeconds--;
        updateTimerDisplay(window.remainingSeconds);

        if (window.remainingSeconds <= 0) {
            completeTimer(true);
        }
    }, 1000);

    showToast('继续计时', 'info');
}

// 完成/取消计时
async function completeTimer(completed = true) {
    if (!window.currentPomodoro) {
        showToast('没有正在运行的番茄钟', 'warning');
        return;
    }

    // 停止计时器
    if (window.timerInterval) {
        clearInterval(window.timerInterval);
        window.timerInterval = null;
    }

    try {
        // 调用 API 完成番茄钟
        await api.put(API_ENDPOINTS.POMODORO(window.currentPomodoro.ID), {
            completed: completed
        });

        // 播放提示音（可选）
        if (completed) {
            playNotificationSound();
            showToast('🎉 番茄钟完成！休息一下吧', 'success');
        } else {
            showToast('番茄钟已取消', 'info');
        }

        // 重置界面
        resetTimerUI();

        // 刷新统计和历史
        loadStats();
        loadHistory();

    } catch (error) {
        showToast(error.message || '操作失败', 'error');
    }
}

// 重置计时器
async function resetTimer() {
    if (window.currentPomodoro) {
        const confirmed = await showConfirm('确定要取消当前番茄钟吗？', '取消番茄钟');
        if (!confirmed) {
            return;
        }

        completeTimer(false);
    } else {
        // 只是重置显示
        window.remainingSeconds = window.defaultDuration;
        updateTimerDisplay(window.remainingSeconds);
        document.getElementById('timer-status').textContent = '准备开始';
        showToast('已重置', 'info');
    }
}

// 重置界面
function resetTimerUI() {
    window.currentPomodoro = null;
    window.remainingSeconds = window.defaultDuration;

    updateTimerDisplay(window.remainingSeconds);

    document.getElementById('timer-status').textContent = '准备开始';
    document.getElementById('start-btn').style.display = 'inline-block';
    document.getElementById('start-btn').textContent = '开始';
    document.getElementById('pause-btn').style.display = 'none';

    // 启用分类选择
    document.getElementById('category-select').disabled = false;

    // 清空备注
    document.getElementById('pomodoro-note').value = '';

    // 重置页面标题
    document.title = '番茄钟 - 专注时间管理';
}

// 播放通知音（可选功能）
function playNotificationSound() {
    try {
        // 使用 Web Audio API 生成简单的提示音
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.error('播放提示音失败:', error);
    }
}

// 修改开始按钮的点击处理
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.onclick = () => {
            if (window.currentPomodoro && !window.timerInterval) {
                // 有当前番茄钟且暂停中，继续计时
                resumeTimer();
            } else {
                // 开始新的番茄钟
                startTimer();
            }
        };
    }
});
