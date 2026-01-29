// 认证相关功能

// 显示注册表单
function showRegister() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
}

// 显示登录表单
function showLogin() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (registerForm) registerForm.style.display = 'none';
    if (loginForm) loginForm.style.display = 'block';
}

// 注册
async function register() {
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;

    // 表单验证
    if (!username) {
        showToast('请输入用户名', 'error');
        return;
    }

    if (!email) {
        showToast('请输入邮箱', 'error');
        return;
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('邮箱格式不正确', 'error');
        return;
    }

    if (!password || password.length < 6) {
        showToast('密码至少需要6位', 'error');
        return;
    }

    try {
        const data = await api.post(API_ENDPOINTS.REGISTER, {
            username,
            email,
            password
        });

        showToast('注册成功！请登录', 'success');

        // 清空表单
        document.getElementById('register-username').value = '';
        document.getElementById('register-email').value = '';
        document.getElementById('register-password').value = '';

        // 切换到登录表单
        showLogin();

        // 自动填充邮箱到登录表单
        document.getElementById('login-email').value = email;

    } catch (error) {
        showToast(error.message || '注册失败', 'error');
    }
}

// 登录
async function login() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    // 表单验证
    if (!email) {
        showToast('请输入邮箱', 'error');
        return;
    }

    if (!password) {
        showToast('请输入密码', 'error');
        return;
    }

    try {
        const data = await api.post(API_ENDPOINTS.LOGIN, {
            email,
            password
        });

        // 保存 token 和用户信息
        localStorage.setItem(API_CONFIG.TOKEN_KEY, data.token);
        localStorage.setItem(API_CONFIG.USER_KEY, JSON.stringify(data.user));

        showToast('登录成功！', 'success');

        // 切换到主应用页面
        setTimeout(() => {
            document.getElementById('auth-page').classList.remove('active');
            document.getElementById('app-page').classList.add('active');

            // 初始化应用
            initApp();
        }, 500);

    } catch (error) {
        showToast(error.message || '登录失败', 'error');
    }
}

// 退出登录
async function logout() {
    // 使用自定义确认对话框
    const confirmed = await showConfirm('确定要退出登录吗？', '退出登录');

    if (!confirmed) {
        return;
    }

    // 如果正在运行番茄钟，先提示
    if (window.currentPomodoro) {
        const confirmExit = await showConfirm('当前有正在运行的番茄钟，退出将会丢失进度，确定退出吗？', '确认退出');
        if (!confirmExit) {
            return;
        }
    }

    // 清除本地数据
    localStorage.removeItem(API_CONFIG.TOKEN_KEY);
    localStorage.removeItem(API_CONFIG.USER_KEY);

    // 停止计时器
    if (window.timerInterval) {
        clearInterval(window.timerInterval);
        window.timerInterval = null;
    }
    window.currentPomodoro = null;

    // 切换回登录页面
    document.getElementById('app-page').classList.remove('active');
    document.getElementById('auth-page').classList.add('active');

    // 清空表单
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';

    showToast('已退出登录', 'info');
}

// 检查登录状态
function checkAuth() {
    const token = localStorage.getItem(API_CONFIG.TOKEN_KEY);
    const user = localStorage.getItem(API_CONFIG.USER_KEY);

    if (token && user) {
        // 已登录，显示主应用
        document.getElementById('auth-page').classList.remove('active');
        document.getElementById('app-page').classList.add('active');

        // 初始化应用
        initApp();
    } else {
        // 未登录，显示登录页面
        document.getElementById('auth-page').classList.add('active');
        document.getElementById('app-page').classList.remove('active');
    }
}

// 获取当前用户信息
function getCurrentUser() {
    const userStr = localStorage.getItem(API_CONFIG.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
}

// 页面加载时检查登录状态
window.addEventListener('DOMContentLoaded', checkAuth);

// 回车键登录
document.addEventListener('DOMContentLoaded', () => {
    // 登录表单回车
    const loginInputs = document.querySelectorAll('#login-form input');
    loginInputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                login();
            }
        });
    });

    // 注册表单回车
    const registerInputs = document.querySelectorAll('#register-form input');
    registerInputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                register();
            }
        });
    });
});
