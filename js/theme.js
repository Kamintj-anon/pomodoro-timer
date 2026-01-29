// ==================== 主题切换系统 ====================

// 主题配置
const THEME_KEY = 'pomodoro_theme';
const DEFAULT_THEME = 'light';

// 初始化主题
function initTheme() {
    // 从 localStorage 加载保存的主题
    const savedTheme = localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
    applyTheme(savedTheme);

    // 更新主题菜单中的激活状态
    updateThemeMenuActiveState(savedTheme);
}

// 切换主题菜单显示/隐藏
function toggleThemeMenu() {
    const menu = document.getElementById('theme-menu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

// 切换主题
function switchTheme(themeName) {
    // 验证主题名称
    const validThemes = ['light', 'dark', 'high-contrast'];
    if (!validThemes.includes(themeName)) {
        console.error('无效的主题名称:', themeName);
        return;
    }

    // 应用主题
    applyTheme(themeName);

    // 保存到 localStorage
    localStorage.setItem(THEME_KEY, themeName);

    // 更新菜单激活状态
    updateThemeMenuActiveState(themeName);

    // 关闭主题菜单
    const menu = document.getElementById('theme-menu');
    if (menu) {
        menu.classList.remove('active');
    }

    // 显示提示
    const themeNames = {
        'light': '浅色模式',
        'dark': '夜间模式',
        'high-contrast': '高对比度'
    };
    showToast(`已切换至${themeNames[themeName]}`, 'success');
}

// 应用主题
function applyTheme(themeName) {
    // 设置 data-theme 属性到 html 元素
    document.documentElement.setAttribute('data-theme', themeName);
}

// 更新主题菜单中的激活状态
function updateThemeMenuActiveState(currentTheme) {
    // 移除所有激活状态
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
    });

    // 添加当前主题的激活状态
    const currentOption = document.querySelector(`.theme-option[data-theme="${currentTheme}"]`);
    if (currentOption) {
        currentOption.classList.add('active');
    }
}

// 点击主题菜单外部关闭菜单
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
        const themeSwitcher = document.querySelector('.theme-switcher');
        const themeMenu = document.getElementById('theme-menu');

        // 如果点击的不是主题切换器及其子元素,则关闭菜单
        if (themeSwitcher && !themeSwitcher.contains(e.target)) {
            if (themeMenu) {
                themeMenu.classList.remove('active');
            }
        }
    });

    // 初始化主题
    initTheme();
});

// 监听系统主题变化(可选功能)
if (window.matchMedia) {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // 如果用户没有手动设置主题,则跟随系统主题
    darkModeQuery.addEventListener('change', (e) => {
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (!savedTheme) {
            const systemTheme = e.matches ? 'dark' : 'light';
            applyTheme(systemTheme);
        }
    });
}
