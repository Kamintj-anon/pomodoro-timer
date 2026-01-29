// 单词打卡功能

// 初始化单词打卡页面
async function initWords() {
    // 设置今天的日期
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('word-date').value = today;

    // 加载今日打卡数据
    await loadTodayWord();

    // 加载统计数据
    await loadWordStats();

    // 加载打卡记录
    await loadWordRecords();
}

// 提交单词打卡
async function submitWordCount() {
    const date = document.getElementById('word-date').value;
    const wordCount = parseInt(document.getElementById('word-count').value);
    const note = document.getElementById('word-note').value.trim();

    if (!date) {
        showToast('请选择日期', 'warning');
        return;
    }

    if (isNaN(wordCount) || wordCount < 0) {
        showToast('请输入有效的单词数量', 'warning');
        return;
    }

    try {
        await api.post(API_ENDPOINTS.WORDS, {
            date: date,
            word_count: wordCount,
            note: note
        });

        showToast('打卡成功！', 'success');

        // 清空输入（备注）
        document.getElementById('word-note').value = '';

        // 重新加载数据
        await loadWordStats();
        await loadWordRecords();

    } catch (error) {
        showToast(error.message || '打卡失败', 'error');
    }
}

// 加载今日打卡数据
async function loadTodayWord() {
    try {
        const data = await api.get(API_ENDPOINTS.WORDS_TODAY);

        if (data && data.word_count > 0) {
            document.getElementById('word-count').value = data.word_count;
            document.getElementById('word-note').value = data.note || '';
        }
    } catch (error) {
        console.error('加载今日数据失败:', error);
    }
}

// 加载统计数据
async function loadWordStats() {
    try {
        const stats = await api.get(API_ENDPOINTS.WORDS_STATS);

        // 更新统计卡片
        document.getElementById('total-words').textContent = stats.total_words || 0;
        document.getElementById('total-days').textContent = stats.total_days || 0;
        document.getElementById('avg-words').textContent = stats.avg_per_day
            ? Math.round(stats.avg_per_day)
            : 0;

    } catch (error) {
        console.error('加载统计失败:', error);
    }
}

// 加载打卡记录
async function loadWordRecords() {
    try {
        const records = await api.get(API_ENDPOINTS.WORDS);
        const container = document.getElementById('word-records-list');

        if (!records || records.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px 0;">暂无打卡记录</p>';
            return;
        }

        container.innerHTML = records.map(record => `
            <div class="word-record-item">
                <div class="record-date">
                    <i class="fas fa-calendar"></i>
                    <span>${formatDate(record.date)}</span>
                </div>
                <div class="record-content">
                    <div class="record-count">
                        <i class="fas fa-book"></i>
                        <strong>${record.word_count}</strong> 个单词
                    </div>
                    ${record.note ? `<div class="record-note">${record.note}</div>` : ''}
                </div>
                <button class="btn-delete-record" onclick="deleteWordRecord(${record.id})" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

    } catch (error) {
        console.error('加载打卡记录失败:', error);
        showToast('加载打卡记录失败', 'error');
    }
}

// 删除打卡记录
async function deleteWordRecord(recordId) {
    const confirmed = await showConfirm('确定要删除这条打卡记录吗？', '删除记录');
    if (!confirmed) {
        return;
    }

    try {
        await api.delete(API_ENDPOINTS.WORD(recordId));
        showToast('删除成功', 'success');

        // 重新加载数据
        await loadWordStats();
        await loadWordRecords();

    } catch (error) {
        showToast(error.message || '删除失败', 'error');
    }
}

// 格式化日期显示
function formatDate(dateStr) {
    // 验证日期字符串
    if (!dateStr) {
        return '未知日期';
    }

    // 提取日期部分（去除时间戳）
    // 支持格式：2025-11-10 或 2025-11-10T00:00:00Z
    const datePart = dateStr.split('T')[0];

    // 创建日期对象（使用本地时间，避免时区问题）
    const [year, month, day] = datePart.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
        console.error('无效的日期格式:', dateStr);
        return datePart; // 返回日期部分
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // 归零时间部分
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // 将date也归零时间部分用于比较
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate.getTime() === today.getTime()) {
        return '今天';
    } else if (compareDate.getTime() === yesterday.getTime()) {
        return '昨天';
    } else {
        const monthStr = (month).toString().padStart(2, '0');
        const dayStr = (day).toString().padStart(2, '0');
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const weekDay = weekDays[date.getDay()];
        return `${year}-${monthStr}-${dayStr} ${weekDay}`;
    }
}

// 日期输入框回车支持
document.addEventListener('DOMContentLoaded', () => {
    const countInput = document.getElementById('word-count');
    const noteInput = document.getElementById('word-note');

    if (countInput) {
        countInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitWordCount();
            }
        });
    }

    if (noteInput) {
        noteInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitWordCount();
            }
        });
    }
});

// ==================== 单词排行榜功能 ====================

let currentWordLeaderboardType = 'daily';

// 显示单词排行榜
async function showWordLeaderboard() {
    document.getElementById('word-leaderboard-modal').classList.add('active');
    await loadWordLeaderboardData('daily');
}

// 关闭单词排行榜
function closeWordLeaderboard() {
    document.getElementById('word-leaderboard-modal').classList.remove('active');
}

// 切换排行榜类型
async function switchWordLeaderboard(type) {
    currentWordLeaderboardType = type;

    // 更新标签页激活状态
    const tabs = document.querySelectorAll('#word-leaderboard-modal .modal-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if ((type === 'daily' && tab.textContent.includes('今日')) ||
            (type === 'total' && tab.textContent.includes('累计'))) {
            tab.classList.add('active');
        }
    });

    // 加载对应数据
    await loadWordLeaderboardData(type);
}

// 加载排行榜数据
async function loadWordLeaderboardData(type) {
    try {
        const endpoint = type === 'daily'
            ? '/words/leaderboard/daily'
            : '/words/leaderboard/total';

        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`);
        const leaderboard = await response.json();

        updateWordLeaderboardList(leaderboard, type);
    } catch (error) {
        console.error('加载单词排行榜失败:', error);
        showToast('加载排行榜失败', 'error');
    }
}

// 更新排行榜列表
function updateWordLeaderboardList(leaderboard, type) {
    const container = document.getElementById('word-leaderboard-list');

    if (!leaderboard || leaderboard.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px 0;">暂无排行数据</p>';
        return;
    }

    const currentUser = getCurrentUser();

    container.innerHTML = leaderboard.map((user, index) => {
        const rank = index + 1;
        const isCurrentUser = currentUser && user.user_id === currentUser.ID;

        // 排名徽章
        let rankBadge = '';
        if (rank === 1) {
            rankBadge = '<div class="rank-badge gold"><i class="fas fa-crown"></i> 1</div>';
        } else if (rank === 2) {
            rankBadge = '<div class="rank-badge silver"><i class="fas fa-medal"></i> 2</div>';
        } else if (rank === 3) {
            rankBadge = '<div class="rank-badge bronze"><i class="fas fa-award"></i> 3</div>';
        } else {
            rankBadge = `<div class="rank-badge normal">${rank}</div>`;
        }

        // 统计信息
        let statsHTML = '';
        if (type === 'daily') {
            statsHTML = `
                <div class="stat-item">
                    <i class="fas fa-book"></i>
                    <span>${user.word_count} 个单词</span>
                </div>
            `;
        } else {
            statsHTML = `
                <div class="stat-item">
                    <i class="fas fa-book"></i>
                    <span>${user.total_words} 个单词</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-calendar-check"></i>
                    <span>${user.total_days} 天</span>
                </div>
            `;
        }

        return `
            <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''}">
                ${rankBadge}
                <div class="leaderboard-user">
                    <div class="user-icon"><i class="fas fa-user-circle"></i></div>
                    <div class="user-name">${user.username}</div>
                </div>
                <div class="leaderboard-stats">
                    ${statsHTML}
                </div>
            </div>
        `;
    }).join('');
}

// 点击弹窗外部关闭
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('word-leaderboard-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeWordLeaderboard();
            }
        });
    }
});
