// 排行榜功能

// 显示排行榜弹窗
async function showLeaderboard() {
    document.getElementById('leaderboard-modal').classList.add('active');
    await loadLeaderboardData();
}

// 关闭排行榜弹窗
function closeLeaderboard() {
    document.getElementById('leaderboard-modal').classList.remove('active');
}

// 加载排行榜数据
async function loadLeaderboardData() {
    try {
        const leaderboard = await api.get('/leaderboard');
        updateLeaderboardList(leaderboard || []);
    } catch (error) {
        console.error('加载排行榜失败:', error);
        showToast('加载排行榜失败', 'error');
    }
}

// 更新排行榜列表
function updateLeaderboardList(leaderboard) {
    const container = document.getElementById('leaderboard-list');
    container.innerHTML = '';

    if (leaderboard.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px 0;">暂无排行数据</p>';
        return;
    }

    const currentUser = getCurrentUser();

    leaderboard.forEach((user, index) => {
        const item = createLeaderboardItem(user, index + 1, currentUser);
        container.appendChild(item);
    });
}

// 创建排行榜项
function createLeaderboardItem(user, rank, currentUser) {
    const item = document.createElement('div');
    item.className = 'leaderboard-item';

    // 如果是当前用户，添加高亮
    if (currentUser && user.user_id === currentUser.ID) {
        item.classList.add('current-user');
    }

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

    // 格式化时长
    const hours = Math.floor(user.total_duration / 3600);
    const minutes = Math.floor((user.total_duration % 3600) / 60);
    let durationText = '';
    if (hours > 0) {
        durationText = `${hours}小时${minutes}分钟`;
    } else if (minutes > 0) {
        durationText = `${minutes}分钟`;
    } else {
        durationText = `${user.total_duration}秒`;
    }

    item.innerHTML = `
        ${rankBadge}
        <div class="leaderboard-user">
            <div class="user-icon"><i class="fas fa-user-circle"></i></div>
            <div class="user-name">${user.username}</div>
        </div>
        <div class="leaderboard-stats">
            <div class="stat-item">
                <i class="fas fa-clock"></i>
                <span>${durationText}</span>
            </div>
            <div class="stat-item">
                <i class="fas fa-check-circle"></i>
                <span>${user.total_count} 个</span>
            </div>
        </div>
    `;

    return item;
}

// 点击弹窗外部关闭
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('leaderboard-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeLeaderboard();
            }
        });
    }
});
