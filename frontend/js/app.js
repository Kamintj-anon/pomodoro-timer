// 主应用逻辑

// 全局分类数据
window.categories = [];

// 初始化应用
async function initApp() {
    // 显示用户名
    const user = getCurrentUser();
    if (user) {
        document.getElementById('username-display').textContent = user.username;
    }

    // 加载分类
    await loadCategories();

    // 初始化计时器
    initTimer();

    // 加载统计数据
    loadStats();

    // 加载历史记录
    loadHistory();
}

// 加载分类列表
async function loadCategories() {
    try {
        const categories = await api.get(API_ENDPOINTS.CATEGORIES);
        window.categories = categories || [];

        // 更新分类选择器
        updateCategorySelect();

        // 更新分类管理列表
        updateCategoryList();

    } catch (error) {
        console.error('加载分类失败:', error);
        showToast('加载分类失败', 'error');
    }
}

// 更新分类选择器
function updateCategorySelect() {
    const select = document.getElementById('category-select');
    select.innerHTML = '';

    if (window.categories.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '请先创建分类';
        select.appendChild(option);
        select.disabled = true;
        return;
    }

    select.disabled = false;

    window.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.ID;
        option.textContent = category.name;
        option.style.color = category.color;
        select.appendChild(option);
    });
}

// ==================== 分类管理 ====================

// 显示分类管理弹窗
function showCategoryManager() {
    document.getElementById('category-modal').classList.add('active');
    updateCategoryList();
}

// 关闭分类管理弹窗
function closeCategoryManager() {
    document.getElementById('category-modal').classList.remove('active');
}

// 点击弹窗外部关闭
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('category-modal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeCategoryManager();
        }
    });
});

// 添加分类
async function addCategory() {
    const nameInput = document.getElementById('new-category-name');
    const colorInput = document.getElementById('new-category-color');

    const name = nameInput.value.trim();
    const color = colorInput.value;

    if (!name) {
        showToast('请输入分类名称', 'warning');
        return;
    }

    try {
        await api.post(API_ENDPOINTS.CATEGORIES, {
            name: name,
            color: color
        });

        showToast('分类添加成功', 'success');

        // 清空输入
        nameInput.value = '';
        colorInput.value = '#FF6B6B';

        // 重新加载分类
        await loadCategories();

    } catch (error) {
        showToast(error.message || '添加分类失败', 'error');
    }
}

// 更新分类管理列表
function updateCategoryList() {
    const container = document.getElementById('category-list');
    container.innerHTML = '';

    if (window.categories.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px 0;">暂无分类，请添加</p>';
        return;
    }

    window.categories.forEach(category => {
        const item = createCategoryItem(category);
        container.appendChild(item);
    });
}

// 创建分类项
function createCategoryItem(category) {
    const item = document.createElement('div');
    item.className = 'category-item';

    item.innerHTML = `
        <div class="category-item-color" style="background-color: ${category.color}"></div>
        <div class="category-item-name">${category.name}</div>
        <div class="category-item-actions">
            <button class="btn-edit" onclick="editCategory(${category.ID})">编辑</button>
            <button class="btn-delete" onclick="deleteCategory(${category.ID})">删除</button>
        </div>
    `;

    return item;
}

// 编辑分类
async function editCategory(categoryId) {
    const category = window.categories.find(c => c.ID === categoryId);
    if (!category) return;

    const newName = prompt('修改分类名称:', category.name);
    if (!newName || newName.trim() === '') {
        return;
    }

    const newColor = prompt('修改颜色（十六进制格式，如 #FF6B6B）:', category.color);
    if (!newColor || !/^#[0-9A-F]{6}$/i.test(newColor)) {
        showToast('颜色格式不正确', 'error');
        return;
    }

    try {
        await api.put(API_ENDPOINTS.CATEGORY(categoryId), {
            name: newName.trim(),
            color: newColor
        });

        showToast('分类更新成功', 'success');

        // 重新加载分类
        await loadCategories();

    } catch (error) {
        showToast(error.message || '更新分类失败', 'error');
    }
}

// 删除分类
async function deleteCategory(categoryId) {
    const category = window.categories.find(c => c.ID === categoryId);
    if (!category) return;

    if (!confirm(`确定要删除分类"${category.name}"吗？\n删除后该分类下的所有番茄钟记录仍会保留。`)) {
        return;
    }

    try {
        await api.delete(API_ENDPOINTS.CATEGORY(categoryId));

        showToast('分类删除成功', 'success');

        // 重新加载分类
        await loadCategories();

    } catch (error) {
        showToast(error.message || '删除分类失败', 'error');
    }
}

// 添加分类输入框回车支持
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('new-category-name');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addCategory();
            }
        });
    }
});

// ==================== 设置管理 ====================

// 获取用户设置
async function getSettings() {
    try {
        const settings = await api.get(API_ENDPOINTS.SETTINGS);
        return settings;
    } catch (error) {
        console.error('获取设置失败:', error);
        return null;
    }
}

// 更新用户设置
async function updateSettings(settings) {
    try {
        await api.put(API_ENDPOINTS.SETTINGS, settings);
        showToast('设置已保存', 'success');

        // 重新加载设置
        await loadSettings();
    } catch (error) {
        showToast(error.message || '保存设置失败', 'error');
    }
}

// ==================== 通知权限 ====================

// 请求通知权限（可选功能）
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showToast('通知权限已开启', 'success');
            }
        });
    }
}

// 发送系统通知
function sendNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: '/assets/icon.png', // 可选：添加应用图标
            badge: '/assets/badge.png' // 可选：添加徽章图标
        });
    }
}

// ==================== 键盘快捷键 ====================

// 添加键盘快捷键支持
document.addEventListener('keydown', (e) => {
    // 忽略在输入框中的按键
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }

    // Space: 开始/暂停
    if (e.code === 'Space') {
        e.preventDefault();
        if (window.currentPomodoro && window.timerInterval) {
            pauseTimer();
        } else if (window.currentPomodoro && !window.timerInterval) {
            resumeTimer();
        } else {
            startTimer();
        }
    }

    // Escape: 重置
    if (e.code === 'Escape') {
        e.preventDefault();
        resetTimer();
    }

    // C: 打开分类管理
    if (e.code === 'KeyC' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        showCategoryManager();
    }
});

// ==================== 页面可见性 ====================

// 监听页面可见性变化
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 页面隐藏时，可以考虑暂停计时或发送通知
        console.log('页面已隐藏');
    } else {
        // 页面重新可见时
        console.log('页面已显示');
        // 可以刷新数据
        if (document.getElementById('app-page').classList.contains('active')) {
            loadStats();
            loadHistory();
        }
    }
});

// ==================== 自动保存 ====================

// 定期自动保存和同步（每 5 分钟）
setInterval(() => {
    if (document.getElementById('app-page').classList.contains('active')) {
        // 静默刷新统计和历史
        loadStats().catch(err => console.error('自动刷新失败:', err));
        loadHistory().catch(err => console.error('自动刷新失败:', err));
    }
}, 5 * 60 * 1000);

// ==================== PWA 支持（可选）====================

// Service Worker 注册（可选功能）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // 如果需要 PWA 功能，可以在这里注册 service worker
        // navigator.serviceWorker.register('/sw.js');
    });
}

// ==================== 初始化 ====================

// 页面加载完成后的额外初始化
window.addEventListener('DOMContentLoaded', () => {
    console.log('番茄钟应用已加载');

    // 可以在这里添加欢迎提示或引导
    // 例如：首次使用提示、键盘快捷键说明等
});

// ==================== 标签页切换 ====================

function switchTab(tabName) {
    // 隐藏所有标签内容
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 移除所有标签按钮的活动状态
    document.querySelectorAll('.tab-item').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示选中的标签内容
    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // 激活对应的标签按钮
    const activeBtn = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // 根据切换的标签加载对应数据
    if (tabName === 'stats') {
        loadStats();
    } else if (tabName === 'history') {
        loadHistory();
    } else if (tabName === 'words') {
        initWords();
    }
}
