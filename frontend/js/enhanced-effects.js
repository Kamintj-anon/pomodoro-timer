// 增强视觉效果 - 动态装饰元素

// 创建浮动粒子
function createFloatingParticles() {
    const colors = ['#FF90E8', '#00FFFF', '#FFC900', '#B8FF9F', '#FF5722', '#9C27B0'];
    const container = document.body;

    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-icon';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.animationDuration = (8 + Math.random() * 4) + 's';

        const icons = ['🍅', '⭐', '✨', '🚀', '⚡', '🔥', '💎', '🎯'];
        particle.textContent = icons[Math.floor(Math.random() * icons.length)];

        container.appendChild(particle);
    }
}

// 为按钮添加彩虹效果
function enhanceButtons() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach((btn, index) => {
        btn.addEventListener('mouseenter', function() {
            this.classList.add('animated-rainbow');
        });
        btn.addEventListener('mouseleave', function() {
            this.classList.remove('animated-rainbow');
        });
    });
}

// 为标签页添加动画类
function enhanceTabItems() {
    const tabItems = document.querySelectorAll('.tab-item');
    tabItems.forEach((tab, index) => {
        tab.addEventListener('click', function() {
            this.classList.add('animated-explode');
            setTimeout(() => {
                this.classList.remove('animated-explode');
            }, 800);
        });
    });
}

// 为模态框添加弹出动画
function enhanceModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'class') {
                    if (modal.classList.contains('active')) {
                        const modalContent = modal.querySelector('.modal-content');
                        if (modalContent) {
                            modalContent.classList.add('animated-explode');
                        }
                    }
                }
            });
        });
        observer.observe(modal, { attributes: true });
    });
}

// 为输入框添加聚焦动画
function enhanceInputs() {
    const inputs = document.querySelectorAll('input:not([type="color"]):not([type="date"])');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.classList.add('animated-lightning');
            setTimeout(() => {
                this.classList.remove('animated-lightning');
            }, 300);
        });
    });
}

// 为统计卡片添加悬浮动画
function enhanceStatCards() {
    const statCards = document.querySelectorAll('.category-stat-item, .history-item');
    statCards.forEach((card, index) => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translate(6px, 6px) scale(1.05)';
            this.style.boxShadow = 'none';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
}

// 创建彩色背景动画（登录页面）
function enhanceAuthPage() {
    const authPage = document.getElementById('auth-page');
    if (authPage && authPage.classList.contains('active')) {
        // 添加彩色背景层
        const bgLayer = document.createElement('div');
        bgLayer.className = 'auth-page-bg';
        authPage.insertBefore(bgLayer, authPage.firstChild);
    }
}

// 为计时器数字添加特殊效果
function enhanceTimer() {
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        timerElement.classList.add('neon-glow');
    }
}

// 为标题添加波浪动画
function enhanceTitles() {
    const titles = document.querySelectorAll('h2, .timer-label');
    titles.forEach((title, index) => {
        title.addEventListener('mouseenter', function() {
            this.classList.add('animated-wave');
        });
        title.addEventListener('mouseleave', function() {
            this.classList.remove('animated-wave');
        });
    });
}

// 添加随机颜色闪烁的装饰徽章
function createRandomBadges() {
    const badges = document.querySelectorAll('.decorative-badge, .decorative-sticker');
    const colors = ['#FF90E8', '#00FFFF', '#FFC900', '#B8FF9F', '#FF5722', '#9C27B0', '#00FF88'];

    badges.forEach(badge => {
        setInterval(() => {
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            badge.style.background = randomColor;
        }, 3000);
    });
}

// 为图标添加旋转动画
function enhanceIcons() {
    const icons = document.querySelectorAll('.fa-clock, .fa-star, .fa-bolt');
    icons.forEach((icon, index) => {
        if (index % 3 === 0) {
            icon.classList.add('icon-spin');
        } else if (index % 3 === 1) {
            icon.classList.add('icon-bounce');
        } else {
            icon.classList.add('icon-shake');
        }
    });
}

// 主初始化函数
function initEnhancedEffects() {
    console.log('🎨 初始化增强视觉效果...');

    // 等待DOM加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            applyEffects();
        });
    } else {
        applyEffects();
    }
}

function applyEffects() {
    // 应用所有效果
    setTimeout(() => {
        createFloatingParticles();
        enhanceButtons();
        enhanceTabItems();
        enhanceModals();
        enhanceInputs();
        enhanceAuthPage();
        enhanceTimer();
        enhanceTitles();
        createRandomBadges();

        console.log('✨ 增强视觉效果已激活！');
    }, 100);

    // 延迟应用需要DOM更新的效果
    setTimeout(() => {
        enhanceStatCards();
    }, 500);
}

// 监听页面切换，重新应用效果
function watchPageChanges() {
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.id === 'app-page' && target.classList.contains('active')) {
                    enhanceStatCards();
                    enhanceTimer();
                }
            }
        });
    });

    const appPage = document.getElementById('app-page');
    const authPage = document.getElementById('auth-page');

    if (appPage) observer.observe(appPage, { attributes: true });
    if (authPage) observer.observe(authPage, { attributes: true });
}

// 添加键盘快捷键彩蛋
function addEasterEgg() {
    let secretCode = '';
    const targetCode = 'rainbow';

    document.addEventListener('keypress', (e) => {
        secretCode += e.key.toLowerCase();
        if (secretCode.length > 10) {
            secretCode = secretCode.slice(-10);
        }

        if (secretCode.includes(targetCode)) {
            activateRainbowMode();
            secretCode = '';
        }
    });
}

function activateRainbowMode() {
    console.log('🌈 彩虹模式已激活！');
    const allCards = document.querySelectorAll('.timer-card, .total-stats, .category-stat-item, .modal-content');
    allCards.forEach((card, index) => {
        card.classList.add('animated-rainbow');
        setTimeout(() => {
            card.classList.remove('animated-rainbow');
        }, 8000);
    });

    // 显示彩虹提示
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = '🌈 彩虹模式已激活！';
        toast.className = 'toast show';
        toast.style.background = '#FF90E8';
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// 立即初始化
initEnhancedEffects();
watchPageChanges();
addEasterEgg();
