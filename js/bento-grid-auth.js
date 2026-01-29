/**
 * BENTO GRID AUTH - INITIALIZATION
 * Creates structured grid layout with NO random floating elements
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBentoGrid);
    } else {
        initBentoGrid();
    }

    function initBentoGrid() {
        const authPage = document.getElementById('auth-page');
        if (!authPage) {
            console.warn('Auth page not found');
            return;
        }

        // Check if Bento Grid already exists
        if (authPage.querySelector('.auth-bento-container')) {
            console.log('✓ Bento Grid already initialized');
            return;
        }

        // Hide old auth-container
        const oldContainer = authPage.querySelector('.auth-container');
        if (oldContainer) {
            oldContainer.style.display = 'none';
        }

        // Create Bento Grid structure
        const bentoContainer = createBentoStructure();

        // Clear auth page and append new structure
        // authPage.innerHTML = '';
        authPage.appendChild(bentoContainer);

        console.log('✓ Bento Grid layout initialized');
    }

    function createBentoStructure() {
        const container = document.createElement('div');
        container.className = 'auth-bento-container';

        // TOP BAR - Marquee Header
        const topBar = document.createElement('div');
        topBar.className = 'auth-top-bar';
        topBar.innerHTML = `
            <div class="auth-marquee">
                /// STAY FOCUSED /// TIME IS CURRENCY /// MAXIMIZE YOUR PRODUCTIVITY ///
                FOCUS MODE ACTIVATED /// EVERY SECOND COUNTS ///
                /// STAY FOCUSED /// TIME IS CURRENCY /// MAXIMIZE YOUR PRODUCTIVITY ///
                FOCUS MODE ACTIVATED /// EVERY SECOND COUNTS ///
            </div>
        `;

        // MAIN CONTENT - Split Layout
        const mainContent = document.createElement('div');
        mainContent.className = 'auth-main-content';

        // LEFT PANEL - Brand Poster
        const leftPanel = createLeftPanel();

        // RIGHT PANEL - Login Form
        const rightPanel = createRightPanel();

        mainContent.appendChild(leftPanel);
        mainContent.appendChild(rightPanel);

        // BOTTOM BAR - Status Bar
        const bottomBar = document.createElement('div');
        bottomBar.className = 'auth-bottom-bar';
        bottomBar.innerHTML = `
            <div class="auth-status-item">
                <div class="auth-status-dot"></div>
                <span>System Ready</span>
            </div>
            <div class="auth-status-divider"></div>
            <div class="auth-status-item">
                <span>v2.0.1</span>
            </div>
            <div class="auth-status-divider"></div>
            <div class="auth-status-item">
                <span>© 2024 Pomodoro</span>
            </div>
            <div class="auth-social-icons">
                <i class="fab fa-github auth-social-icon"></i>
                <i class="fab fa-twitter auth-social-icon"></i>
                <i class="fas fa-envelope auth-social-icon"></i>
            </div>
        `;

        // Assemble
        container.appendChild(topBar);
        container.appendChild(mainContent);
        container.appendChild(bottomBar);

        return container;
    }

    function createLeftPanel() {
        const panel = document.createElement('div');
        panel.className = 'auth-left-panel';
        panel.innerHTML = `
            <div class="auth-brand-title">
                FOCUS<br>MODE
            </div>

            <!-- Structured Badges -->
            <div class="auth-badge top-left">
                <i class="fas fa-star"></i> v2.0
            </div>
            <div class="auth-badge top-right">
                <i class="fas fa-clock"></i> 24/7
            </div>
            <div class="auth-badge bottom-left">
                <i class="fas fa-fire"></i> HOT
            </div>

            <!-- Decorative Data Box -->
            <div class="auth-data-box">
                <div class="data-label">SESSION ID</div>
                <div class="data-value">#882-99</div>
            </div>
        `;
        return panel;
    }

    function createRightPanel() {
        const panel = document.createElement('div');
        panel.className = 'auth-right-panel';

        // Determine if showing login or register form
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const isLogin = loginForm && loginForm.classList.contains('active');

        if (isLogin) {
            panel.innerHTML = createLoginFormHTML();
        } else {
            panel.innerHTML = createRegisterFormHTML();
        }

        return panel;
    }

    function createLoginFormHTML() {
        return `
            <div class="auth-form-badge">SECURE</div>

            <h1 class="auth-form-title">登录</h1>
            <p class="auth-form-subtitle">Access Your Workspace</p>

            <div class="auth-form">
                <div class="auth-input-group">
                    <label class="auth-input-label">电子邮箱</label>
                    <input type="email" id="login-email" class="auth-input" placeholder="YOUR@EMAIL.COM" required>
                </div>

                <div class="auth-input-group">
                    <label class="auth-input-label">密码</label>
                    <div class="auth-input-wrapper">
                        <input type="password" id="login-password" class="auth-input" placeholder="••••••••" required>
                        <button type="button" class="auth-toggle-password" onclick="togglePasswordBento('login-password', this)">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>

                <button onclick="login()" class="auth-button">
                    <i class="fas fa-sign-in-alt"></i> 立即登录
                </button>

                <div class="auth-toggle-link">
                    还没有账号？ <a onclick="showRegisterBento()">立即注册</a>
                </div>
            </div>
        `;
    }

    function createRegisterFormHTML() {
        return `
            <div class="auth-form-badge">NEW USER</div>

            <h1 class="auth-form-title">注册</h1>
            <p class="auth-form-subtitle">Create Your Account</p>

            <div class="auth-form">
                <div class="auth-input-group">
                    <label class="auth-input-label">用户名</label>
                    <input type="text" id="register-username" class="auth-input" placeholder="YOUR NAME" required>
                </div>

                <div class="auth-input-group">
                    <label class="auth-input-label">电子邮箱</label>
                    <input type="email" id="register-email" class="auth-input" placeholder="YOUR@EMAIL.COM" required>
                </div>

                <div class="auth-input-group">
                    <label class="auth-input-label">密码（至少6位）</label>
                    <div class="auth-input-wrapper">
                        <input type="password" id="register-password" class="auth-input" placeholder="••••••••" required>
                        <button type="button" class="auth-toggle-password" onclick="togglePasswordBento('register-password', this)">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>

                <button onclick="register()" class="auth-button">
                    <i class="fas fa-rocket"></i> 开始旅程
                </button>

                <div class="auth-toggle-link">
                    已有账号？ <a onclick="showLoginBento()">立即登录</a>
                </div>
            </div>
        `;
    }

    // Make functions globally accessible
    window.showLoginBento = function() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (loginForm) loginForm.classList.add('active');
        if (registerForm) registerForm.classList.remove('active');

        // Update right panel
        const rightPanel = document.querySelector('.auth-right-panel');
        if (rightPanel) {
            rightPanel.innerHTML = createLoginFormHTML();
        }
    };

    window.showRegisterBento = function() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (loginForm) loginForm.classList.remove('active');
        if (registerForm) registerForm.classList.add('active');

        // Update right panel
        const rightPanel = document.querySelector('.auth-right-panel');
        if (rightPanel) {
            rightPanel.innerHTML = createRegisterFormHTML();
        }
    };

    window.togglePasswordBento = function(inputId, btn) {
        const input = document.getElementById(inputId);
        const icon = btn.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    };

})();
