// API 配置
const API_CONFIG = {
    // 将此处改为你的服务器 IP 地址和端口
    BASE_URL: '/api',

    // 请求超时时间（毫秒）
    TIMEOUT: 10000,

    // Token 存储键名
    TOKEN_KEY: 'pomodoro_token',
    USER_KEY: 'pomodoro_user'
};

// API 端点
const API_ENDPOINTS = {
    // 认证
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    PROFILE: '/profile',

    // 分类
    CATEGORIES: '/categories',
    CATEGORY: (id) => `/categories/${id}`,

    // 番茄钟
    POMODOROS: '/pomodoros',
    POMODORO: (id) => `/pomodoros/${id}`,

    // 统计
    STATS: '/stats',
    STATS_TOTAL: '/stats/total',
    STATS_CATEGORIES: '/stats/categories',
    STATS_DAILY: '/stats/daily',
    STATS_CHECKIN: '/stats/checkin',

    // 设置
    SETTINGS: '/settings',

    // 单词记录
    WORDS: '/words',
    WORDS_TODAY: '/words/today',
    WORDS_STATS: '/words/stats',
    WORD: (id) => `/words/${id}`
};

// HTTP 请求封装
async function request(endpoint, options = {}) {
    const token = localStorage.getItem(API_CONFIG.TOKEN_KEY);

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method: options.method || 'GET',
        headers,
        ...options
    };

    if (options.body) {
        config.body = JSON.stringify(options.body);
    }

    try {
        console.log(`[API请求] ${config.method} ${API_CONFIG.BASE_URL}${endpoint}`);
        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            console.error(`[API错误] ${response.status}:`, data.error || '请求失败');
            throw new Error(data.error || '请求失败');
        }

        console.log(`[API成功] ${config.method} ${endpoint}:`, data);
        return data;
    } catch (error) {
        console.error(`[请求异常] ${endpoint}:`, error);
        throw error;
    }
}

// 便捷的 HTTP 方法
const api = {
    get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
    post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
    put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
    delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' })
};

// Toast 通知函数
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 格式化时间（秒转为 HH:MM:SS）
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
}

// 格式化持续时间（秒转为易读格式）
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours} 小时 ${minutes} 分钟`;
    }
    if (minutes > 0) {
        return `${minutes} 分钟`;
    }
    return `${seconds} 秒`;
}

// 格式化日期时间
function formatDateTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    // 小于1分钟
    if (diff < 60000) {
        return '刚刚';
    }

    // 小于1小时
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} 分钟前`;
    }

    // 小于1天
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} 小时前`;
    }

    // 今年
    if (date.getFullYear() === now.getFullYear()) {
        return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }

    // 其他
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

// 显示确认对话框
function showConfirm(message, title = '确认操作') {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirm-modal');
        const titleEl = document.getElementById('confirm-title');
        const messageEl = document.getElementById('confirm-message');
        const okBtn = document.getElementById('confirm-ok-btn');
        const cancelBtn = document.getElementById('confirm-cancel-btn');

        titleEl.textContent = title;
        messageEl.textContent = message;
        modal.classList.add('active');

        // 确定按钮点击
        const handleOk = () => {
            cleanup();
            resolve(true);
        };

        // 取消按钮点击
        const handleCancel = () => {
            cleanup();
            resolve(false);
        };

        // 点击背景关闭
        const handleBackdrop = (e) => {
            if (e.target === modal) {
                handleCancel();
            }
        };

        // ESC键关闭
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
            }
        };

        // 清理事件监听器
        const cleanup = () => {
            modal.classList.remove('active');
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
            modal.removeEventListener('click', handleBackdrop);
            document.removeEventListener('keydown', handleEscape);
        };

        okBtn.addEventListener('click', handleOk);
        cancelBtn.addEventListener('click', handleCancel);
        modal.addEventListener('click', handleBackdrop);
        document.addEventListener('keydown', handleEscape);
    });
}
