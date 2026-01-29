// 个人资料相关功能

// 显示个人资料弹窗
async function showProfileModal() {
    document.getElementById('profile-modal').classList.add('active');
    await loadProfileData();
}

// 关闭个人资料弹窗
function closeProfileModal() {
    document.getElementById('profile-modal').classList.remove('active');
}

// 加载个人资料数据
async function loadProfileData() {
    try {
        // 获取用户信息
        const user = getCurrentUser();
        if (user) {
            document.getElementById('profile-username').textContent = user.username;
            document.getElementById('profile-email').textContent = user.email;

            // 格式化注册时间
            const createdDate = new Date(user.CreatedAt);
            document.getElementById('profile-created').textContent =
                createdDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
        }

        // 获取统计数据
        const stats = await api.get(API_ENDPOINTS.STATS);
        if (stats) {
            document.getElementById('profile-total-count').textContent = stats.total_count || 0;

            // 只显示小时数（整数）
            const hours = Math.floor((stats.total_duration || 0) / 3600);
            document.getElementById('profile-total-duration').textContent = hours;
        }

        // 获取设置
        const settings = await api.get(API_ENDPOINTS.SETTINGS);
        if (settings && settings.default_duration) {
            document.getElementById('setting-duration').value = Math.floor(settings.default_duration / 60);
        }

    } catch (error) {
        console.error('加载个人资料失败:', error);
        showToast('加载个人资料失败', 'error');
    }
}

// 保存设置
async function saveSettings() {
    const duration = parseInt(document.getElementById('setting-duration').value);

    if (!duration || duration < 1 || duration > 60) {
        showToast('时长必须在1-60分钟之间', 'error');
        return;
    }

    try {
        await api.put(API_ENDPOINTS.SETTINGS, {
            default_duration: duration * 60
        });

        // 更新全局默认时长
        window.defaultDuration = duration * 60;
        window.remainingSeconds = duration * 60;
        updateTimerDisplay(window.remainingSeconds);

        showToast('设置已保存', 'success');
    } catch (error) {
        console.error('保存设置失败:', error);
        showToast('保存设置失败', 'error');
    }
}

// 点击弹窗外部关闭
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('profile-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeProfileModal();
            }
        });
    }
});
