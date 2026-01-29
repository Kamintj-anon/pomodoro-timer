// 统计数据相关功能

// 加载统计数据
async function loadStats() {
    try {
        const stats = await api.get(API_ENDPOINTS.STATS);

        // 更新总时长
        updateTotalStats(stats.total_duration, stats.total_count);

        // 更新分类统计
        updateCategoryStats(stats.categories || []);

    } catch (error) {
        console.error('加载统计失败:', error);
        showToast('加载统计数据失败', 'error');
    }
}

// 更新总时长显示
function updateTotalStats(totalDuration, totalCount) {
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);

    let durationText = '';
    if (hours > 0) {
        durationText = `${hours} 小时 ${minutes} 分钟`;
    } else if (minutes > 0) {
        durationText = `${minutes} 分钟`;
    } else {
        durationText = `${totalDuration} 秒`;
    }

    document.getElementById('total-duration').textContent = durationText;
    document.getElementById('total-count').textContent = `${totalCount} 个番茄钟`;
}

// 更新分类统计
function updateCategoryStats(categories) {
    const container = document.getElementById('category-stats');
    container.innerHTML = '';

    if (categories.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; grid-column: 1/-1;">暂无数据</p>';
        return;
    }

    categories.forEach(category => {
        const card = createCategoryStatCard(category);
        container.appendChild(card);
    });
}

// 创建分类统计卡片
function createCategoryStatCard(category) {
    const card = document.createElement('div');
    card.className = 'category-stat-card';

    const hours = Math.floor(category.duration / 3600);
    const minutes = Math.floor((category.duration % 3600) / 60);

    let durationText = '';
    if (hours > 0) {
        durationText = `${hours}h ${minutes}m`;
    } else {
        durationText = `${minutes}m`;
    }

    card.innerHTML = `
        <div class="category-stat-header">
            <div class="category-color-dot" style="background-color: ${category.color}"></div>
            <h4>${category.name}</h4>
        </div>
        <div class="category-stat-info">
            <div class="category-duration">${durationText}</div>
            <div class="category-percentage">${category.percentage.toFixed(1)}%</div>
        </div>
        <div style="color: var(--text-secondary); font-size: 0.9em; margin-top: 8px;">
            ${category.count} 个番茄钟
        </div>
    `;

    return card;
}

// 加载历史记录
async function loadHistory() {
    try {
        const pomodoros = await api.get(API_ENDPOINTS.POMODOROS + '?completed=true');

        updateHistoryList(pomodoros || []);

    } catch (error) {
        console.error('加载历史失败:', error);
    }
}

// 更新历史记录列表
function updateHistoryList(pomodoros) {
    const container = document.getElementById('history-list');
    container.innerHTML = '';

    if (pomodoros.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px 0;">暂无记录</p>';
        return;
    }

    // 只显示最近 20 条
    const recentPomodoros = pomodoros.slice(0, 20);

    recentPomodoros.forEach(pomodoro => {
        const item = createHistoryItem(pomodoro);
        container.appendChild(item);
    });
}

// 创建历史记录项
function createHistoryItem(pomodoro) {
    const item = document.createElement('div');
    item.className = 'history-item';

    const minutes = Math.floor(pomodoro.duration / 60);
    const seconds = pomodoro.duration % 60;
    const durationText = `${minutes}:${String(seconds).padStart(2, '0')}`;

    const categoryColor = pomodoro.category?.color || '#FF6B6B';
    const categoryName = pomodoro.category?.name || '未知分类';
    const timeText = formatDateTime(pomodoro.completed_at || pomodoro.created_at);

    item.innerHTML = `
        <div class="history-color" style="background-color: ${categoryColor}"></div>
        <div class="history-content">
            <div class="history-category">${categoryName}</div>
            <div class="history-time">${timeText}${pomodoro.note ? ' · ' + pomodoro.note : ''}</div>
        </div>
        <div class="history-duration">${durationText}</div>
    `;

    return item;
}

// 加载每日统计（图表，可选功能）
async function loadDailyStats() {
    try {
        const dailyStats = await api.get(API_ENDPOINTS.STATS_DAILY);
        // 这里可以使用图表库（如 Chart.js）展示每日数据
        console.log('每日统计:', dailyStats);
    } catch (error) {
        console.error('加载每日统计失败:', error);
    }
}
