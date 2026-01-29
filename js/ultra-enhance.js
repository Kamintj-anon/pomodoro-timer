// 超级增强脚本 - 完全替换emoji为图标，大幅增加登录注册页面差异

// FontAwesome图标映射 - 扩展版
const iconMap = {
    // 常用图标
    '🎯': '<i class="fas fa-bullseye"></i>',
    '⚡': '<i class="fas fa-bolt"></i>',
    '🔥': '<i class="fas fa-fire"></i>',
    '✨': '<i class="fas fa-sparkles"></i>',
    '⭐': '<i class="fas fa-star"></i>',
    '🚀': '<i class="fas fa-rocket"></i>',
    '💯': '<i class="fas fa-hundred-points"></i>',
    '🎨': '<i class="fas fa-palette"></i>',
    '🍅': '<i class="fas fa-clock"></i>',
    '💎': '<i class="fas fa-gem"></i>',
    '🎪': '<i class="fas fa-campground"></i>',
    '🌟': '<i class="fas fa-star"></i>',
    '📊': '<i class="fas fa-chart-bar"></i>',
    '🏆': '<i class="fas fa-trophy"></i>',
    '📈': '<i class="fas fa-chart-line"></i>',
    '📅': '<i class="fas fa-calendar"></i>',
    '📚': '<i class="fas fa-book"></i>',
    '✅': '<i class="fas fa-check-circle"></i>',
    '❌': '<i class="fas fa-times-circle"></i>',
    '💪': '<i class="fas fa-dumbbell"></i>',
    '🎉': '<i class="fas fa-party-horn"></i>',
    '👍': '<i class="fas fa-thumbs-up"></i>',
    '👏': '<i class="fas fa-hands-clapping"></i>',
    '💰': '<i class="fas fa-coins"></i>',
    '🎁': '<i class="fas fa-gift"></i>',
    '🌈': '<i class="fas fa-rainbow"></i>',
    '❤️': '<i class="fas fa-heart"></i>',
    '💖': '<i class="fas fa-heart"></i>',
    '🔔': '<i class="fas fa-bell"></i>',
    '📝': '<i class="fas fa-pen"></i>',
    '✏️': '<i class="fas fa-pencil"></i>',
};

// 全局emoji替换函数 - 支持整个文档
function replaceAllEmojis(container = document.body) {
    if (!container) return;

    // 跳过script和style标签
    if (container.tagName === 'SCRIPT' || container.tagName === 'STYLE') {
        return;
    }

    // 替换所有文本节点中的emoji
    const walk = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    const nodesToReplace = [];
    let node;

    while (node = walk.nextNode()) {
        // 跳过script和style中的文本
        if (node.parentElement &&
            (node.parentElement.tagName === 'SCRIPT' ||
             node.parentElement.tagName === 'STYLE')) {
            continue;
        }

        let text = node.textContent;
        let hasEmoji = false;

        Object.keys(iconMap).forEach(emoji => {
            if (text.includes(emoji)) {
                hasEmoji = true;
            }
        });

        if (hasEmoji) {
            nodesToReplace.push(node);
        }
    }

    nodesToReplace.forEach(node => {
        let html = node.textContent;
        Object.keys(iconMap).forEach(emoji => {
            html = html.replaceAll(emoji, iconMap[emoji]);
        });

        const span = document.createElement('span');
        span.innerHTML = html;

        // 替换节点
        if (node.parentNode) {
            node.parentNode.replaceChild(span, node);
        }
    });

    console.log(`✓ 已替换 ${nodesToReplace.length} 个文本节点中的emoji`);
}

// 监听DOM变化，自动替换新加入的emoji
function observeEmojiChanges() {
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            // 检查新添加的节点
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // 延迟替换，确保内容已完全渲染
                    setTimeout(() => {
                        replaceAllEmojis(node);
                    }, 50);
                } else if (node.nodeType === Node.TEXT_NODE) {
                    // 直接处理文本节点
                    let text = node.textContent;
                    let hasEmoji = false;

                    Object.keys(iconMap).forEach(emoji => {
                        if (text.includes(emoji)) {
                            hasEmoji = true;
                        }
                    });

                    if (hasEmoji && node.parentElement) {
                        setTimeout(() => {
                            replaceAllEmojis(node.parentElement);
                        }, 50);
                    }
                }
            });
        });
    });

    // 监听整个body的变化
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

    console.log('✓ DOM变化监听已启动');
}

// 清除之前的装饰元素
function clearThemeDecorations() {
    const authPage = document.getElementById('auth-page');
    if (!authPage) return;

    // 清除所有主题装饰
    const oldDecorations = authPage.querySelectorAll('.theme-decoration, .login-decoration, .register-decoration');
    oldDecorations.forEach(el => el.remove());
}

// 为登录表单添加专属装饰 - 粉色主题
function enhanceLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    // 监听表单显示状态
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.attributeName === 'class') {
                if (loginForm.classList.contains('active')) {
                    clearThemeDecorations();
                    applyLoginTheme();
                }
            }
        });
    });

    observer.observe(loginForm, { attributes: true });

    if (loginForm.classList.contains('active')) {
        clearThemeDecorations();
        applyLoginTheme();
    }
}

function applyLoginTheme() {
    const authPage = document.getElementById('auth-page');
    if (!authPage) return;

    // 检查是否是新的 Bento Split View - 如果是则跳过旧的增强
    if (authPage.querySelector('.page.active') && authPage.children.length > 0) {
        const firstChild = authPage.children[0];
        if (firstChild.style && firstChild.style.width === '60%') {
            console.log('✓ 检测到 Bento Split View，跳过旧增强');
            return;
        }
    }

    // 修改背景为登录主题（强烈粉色/紫色）
    authPage.style.background = `
        radial-gradient(circle at 15% 25%, rgba(255, 144, 232, 0.5) 0%, transparent 40%),
        radial-gradient(circle at 85% 75%, rgba(147, 51, 234, 0.4) 0%, transparent 40%),
        radial-gradient(circle at 50% 50%, rgba(255, 0, 110, 0.3) 0%, transparent 60%),
        linear-gradient(135deg, #ffe6f7 0%, #f3e7ff 100%)
    `;

    // 添加粉色浮动心形和星星
    const loginIcons = [
        { icon: 'fa-heart', color: '#FF90E8', size: 60, top: '15%', left: '10%', rotate: 15, delay: 0 },
        { icon: 'fa-heart', color: '#FF006E', size: 50, top: '75%', right: '15%', rotate: -20, delay: 0.3 },
        { icon: 'fa-star', color: '#FF90E8', size: 55, top: '25%', right: '12%', rotate: 30, delay: 0.6 },
        { icon: 'fa-heart', color: '#9333EA', size: 45, top: '60%', left: '8%', rotate: -15, delay: 0.9 },
        { icon: 'fa-star', color: '#FF006E', size: 40, top: '85%', left: '20%', rotate: 20, delay: 1.2 },
        { icon: 'fa-sparkles', color: '#FF90E8', size: 50, top: '40%', left: '15%', rotate: 0, delay: 1.5 },
        { icon: 'fa-gem', color: '#9333EA', size: 55, top: '50%', right: '10%', rotate: -25, delay: 1.8 },
    ];

    loginIcons.forEach((iconData, index) => {
        const container = document.createElement('div');
        container.className = 'theme-decoration login-decoration';
        container.style.cssText = `
            position: absolute;
            ${iconData.top ? `top: ${iconData.top};` : ''}
            ${iconData.left ? `left: ${iconData.left};` : ''}
            ${iconData.right ? `right: ${iconData.right};` : ''}
            z-index: 5;
            animation: float-wave 4s ease-in-out infinite;
            animation-delay: ${iconData.delay}s;
        `;

        const iconBox = document.createElement('div');
        iconBox.style.cssText = `
            width: ${iconData.size}px;
            height: ${iconData.size}px;
            background: ${iconData.color};
            border: 4px solid black;
            border-radius: 15px;
            transform: rotate(${iconData.rotate}deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 6px 6px 0px 0px black;
            transition: all 0.3s ease;
        `;

        const icon = document.createElement('i');
        icon.className = `fas ${iconData.icon}`;
        icon.style.cssText = `
            font-size: ${iconData.size * 0.5}px;
            color: black;
        `;

        iconBox.appendChild(icon);
        container.appendChild(iconBox);
        authPage.appendChild(container);

        // 添加悬浮效果
        iconBox.addEventListener('mouseenter', function() {
            this.style.transform = `rotate(${iconData.rotate}deg) scale(1.1)`;
        });
        iconBox.addEventListener('mouseleave', function() {
            this.style.transform = `rotate(${iconData.rotate}deg) scale(1)`;
        });
    });

    // 添加粉色光晕效果
    const glowContainer = document.createElement('div');
    glowContainer.className = 'theme-decoration login-decoration';
    glowContainer.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 500px;
        height: 500px;
        background: radial-gradient(circle, rgba(255, 144, 232, 0.3) 0%, transparent 70%);
        border-radius: 50%;
        z-index: 1;
        animation: pulse-glow 3s ease-in-out infinite;
        pointer-events: none;
    `;
    authPage.appendChild(glowContainer);

    console.log('✓ 登录主题已应用（粉色/紫色梦幻风格）');
}

// 为注册表单添加专属装饰 - 黄色/绿色主题
function enhanceRegisterForm() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.attributeName === 'class') {
                if (registerForm.classList.contains('active')) {
                    clearThemeDecorations();
                    applyRegisterTheme();
                }
            }
        });
    });

    observer.observe(registerForm, { attributes: true });
}

function applyRegisterTheme() {
    const authPage = document.getElementById('auth-page');
    if (!authPage) return;

    // 检查是否是新的 Bento Split View - 如果是则跳过旧的增强
    if (authPage.querySelector('.page.active') && authPage.children.length > 0) {
        const firstChild = authPage.children[0];
        if (firstChild.style && firstChild.style.width === '60%') {
            console.log('✓ 检测到 Bento Split View，跳过旧增强');
            return;
        }
    }

    // 修改背景为注册主题（明亮黄色/绿色）
    authPage.style.background = `
        radial-gradient(circle at 20% 20%, rgba(255, 201, 0, 0.5) 0%, transparent 40%),
        radial-gradient(circle at 80% 80%, rgba(184, 255, 159, 0.5) 0%, transparent 40%),
        radial-gradient(circle at 50% 50%, rgba(255, 107, 53, 0.3) 0%, transparent 60%),
        linear-gradient(135deg, #fffae6 0%, #e8ffe6 100%)
    `;

    // 添加黄色/绿色浮动图标（太阳、火箭、奖杯等）
    const registerIcons = [
        { icon: 'fa-sun', color: '#FFC900', size: 65, top: '12%', left: '8%', rotate: 0, delay: 0 },
        { icon: 'fa-rocket', color: '#B8FF9F', size: 55, top: '70%', right: '10%', rotate: 45, delay: 0.4 },
        { icon: 'fa-trophy', color: '#FF6B35', size: 50, top: '20%', right: '15%', rotate: -10, delay: 0.8 },
        { icon: 'fa-leaf', color: '#B8FF9F', size: 45, top: '55%', left: '12%', rotate: 20, delay: 1.2 },
        { icon: 'fa-fire', color: '#FF6B35', size: 60, top: '80%', left: '18%', rotate: -15, delay: 1.6 },
        { icon: 'fa-bolt', color: '#FFC900', size: 50, top: '35%', left: '10%', rotate: 25, delay: 2.0 },
        { icon: 'fa-crown', color: '#FF6B35', size: 55, top: '45%', right: '8%', rotate: -20, delay: 2.4 },
    ];

    registerIcons.forEach((iconData, index) => {
        const container = document.createElement('div');
        container.className = 'theme-decoration register-decoration';
        container.style.cssText = `
            position: absolute;
            ${iconData.top ? `top: ${iconData.top};` : ''}
            ${iconData.left ? `left: ${iconData.left};` : ''}
            ${iconData.right ? `right: ${iconData.right};` : ''}
            z-index: 5;
            animation: bounce-float 3s ease-in-out infinite;
            animation-delay: ${iconData.delay}s;
        `;

        const iconBox = document.createElement('div');
        iconBox.style.cssText = `
            width: ${iconData.size}px;
            height: ${iconData.size}px;
            background: ${iconData.color};
            border: 4px solid black;
            border-radius: 50%;
            transform: rotate(${iconData.rotate}deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 6px 6px 0px 0px black;
            transition: all 0.3s ease;
        `;

        const icon = document.createElement('i');
        icon.className = `fas ${iconData.icon}`;
        icon.style.cssText = `
            font-size: ${iconData.size * 0.5}px;
            color: black;
        `;

        iconBox.appendChild(icon);
        container.appendChild(iconBox);
        authPage.appendChild(container);

        // 添加悬浮效果
        iconBox.addEventListener('mouseenter', function() {
            this.style.transform = `rotate(${iconData.rotate}deg) scale(1.15)`;
        });
        iconBox.addEventListener('mouseleave', function() {
            this.style.transform = `rotate(${iconData.rotate}deg) scale(1)`;
        });
    });

    // 添加黄色/绿色双色光晕
    const glowContainer1 = document.createElement('div');
    glowContainer1.className = 'theme-decoration register-decoration';
    glowContainer1.style.cssText = `
        position: absolute;
        top: 30%;
        left: 30%;
        transform: translate(-50%, -50%);
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, rgba(255, 201, 0, 0.3) 0%, transparent 70%);
        border-radius: 50%;
        z-index: 1;
        animation: pulse-glow 4s ease-in-out infinite;
        pointer-events: none;
    `;
    authPage.appendChild(glowContainer1);

    const glowContainer2 = document.createElement('div');
    glowContainer2.className = 'theme-decoration register-decoration';
    glowContainer2.style.cssText = `
        position: absolute;
        top: 70%;
        left: 70%;
        transform: translate(-50%, -50%);
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, rgba(184, 255, 159, 0.3) 0%, transparent 70%);
        border-radius: 50%;
        z-index: 1;
        animation: pulse-glow 4s ease-in-out infinite 2s;
        pointer-events: none;
    `;
    authPage.appendChild(glowContainer2);

    console.log('✓ 注册主题已应用（黄色/绿色活力风格）');
}

// 添加CSS动画
function addCustomAnimations() {
    // 检查是否已添加
    if (document.getElementById('ultra-enhance-animations')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'ultra-enhance-animations';
    style.textContent = `
        @keyframes float-wave {
            0%, 100% {
                transform: translateY(0px) translateX(0px) rotate(0deg);
            }
            25% {
                transform: translateY(-15px) translateX(10px) rotate(5deg);
            }
            50% {
                transform: translateY(-8px) translateX(-5px) rotate(-3deg);
            }
            75% {
                transform: translateY(-20px) translateX(8px) rotate(4deg);
            }
        }

        @keyframes bounce-float {
            0%, 100% {
                transform: translateY(0px) scale(1) rotate(0deg);
            }
            25% {
                transform: translateY(-25px) scale(1.05) rotate(10deg);
            }
            50% {
                transform: translateY(-12px) scale(0.95) rotate(-5deg);
            }
            75% {
                transform: translateY(-20px) scale(1.02) rotate(8deg);
            }
        }

        @keyframes pulse-glow {
            0%, 100% {
                opacity: 0.5;
                transform: translate(-50%, -50%) scale(1);
            }
            50% {
                opacity: 0.8;
                transform: translate(-50%, -50%) scale(1.1);
            }
        }

        .login-decoration:hover {
            z-index: 10 !important;
        }

        .register-decoration:hover {
            z-index: 10 !important;
        }
    `;
    document.head.appendChild(style);
}

// 为跑马灯添加颜色渐变
function enhanceMarquees() {
    const marquees = document.querySelectorAll('[class*="animate-scroll"]');
    marquees.forEach((marquee, index) => {
        const parent = marquee.parentElement;
        if (parent) {
            // 为跑马灯条添加多色边框
            parent.style.borderImage = `linear-gradient(
                90deg,
                #FF90E8 0%,
                #00FFFF 25%,
                #FFC900 50%,
                #B8FF9F 75%,
                #FF90E8 100%
            ) 1`;
        }
    });

    console.log('✓ 跑马灯颜色已增强');
}

// 为主容器添加更多颜色边框
function enhanceAuthContainer() {
    const authContainer = document.querySelector('.auth-container');
    if (!authContainer) return;

    // 添加多色阴影效果
    authContainer.style.boxShadow = `
        4px 4px 0 #FF90E8,
        8px 8px 0 #00FFFF,
        12px 12px 0 #FFC900,
        16px 16px 0 black
    `;

    console.log('✓ 认证容器颜色已增强');
}

// 为按钮添加渐变悬浮效果
function enhanceButtons() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
            this.style.filter = 'brightness(1.1) saturate(1.2)';
        });
        button.addEventListener('mouseleave', function() {
            this.style.filter = 'brightness(1) saturate(1)';
        });
    });

    console.log('✓ 按钮悬浮效果已增强');
}

// 主初始化函数
function initUltraEnhance() {
    console.log('🎨 开始超级增强...');

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyEnhancements);
    } else {
        applyEnhancements();
    }
}

function applyEnhancements() {
    setTimeout(() => {
        // 第一步：添加自定义动画
        addCustomAnimations();

        // 第二步：替换所有现有emoji
        replaceAllEmojis();

        // 第三步：启动DOM监听，自动替换新加入的emoji
        observeEmojiChanges();

        // 第四步：应用其他增强效果
        enhanceLoginForm();
        enhanceRegisterForm();
        enhanceMarquees();
        enhanceAuthContainer();
        enhanceButtons();

        console.log('✅ 超级增强完成！');
    }, 200);

    // 定期强制替换emoji（确保动态内容也能被替换）
    setInterval(() => {
        replaceAllEmojis();
    }, 3000);
}

// 立即执行
initUltraEnhance();
