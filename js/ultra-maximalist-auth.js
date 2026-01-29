/**
 * ULTRA-MAXIMALIST AUTH PAGE - DYNAMIC ELEMENTS
 * Adds marquees, chaos shapes, and dynamic decorations
 */

(function() {
    'use strict';

    // 等待DOM加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUltraMaximalist);
    } else {
        initUltraMaximalist();
    }

    function initUltraMaximalist() {
        const authPage = document.getElementById('auth-page');
        if (!authPage) return;

        // 1. 添加滚动跑马灯
        addMarqueeBorders();

        // 2. 添加混沌几何形状
        addChaosShapes();

        // 3. 添加随机闪烁点
        addBlinkingDots();

        console.log('✓ Ultra-Maximalist Auth 已初始化');
    }

    /**
     * 添加滚动跑马灯边框
     */
    function addMarqueeBorders() {
        const authPage = document.getElementById('auth-page');

        // 顶部跑马灯
        const marqueeTop = document.createElement('div');
        marqueeTop.className = 'marquee-top';
        marqueeTop.innerHTML = `
            <div class="marquee-content">
                <span>/// TIME MANAGEMENT ///</span>
                <span>/// KEEP FOCUS ///</span>
                <span>/// DO IT NOW ///</span>
                <span>/// POMODORO METHOD ///</span>
                <span>/// STAY PRODUCTIVE ///</span>
                <span>/// TIME MANAGEMENT ///</span>
                <span>/// KEEP FOCUS ///</span>
                <span>/// DO IT NOW ///</span>
            </div>
        `;

        // 底部跑马灯
        const marqueeBottom = document.createElement('div');
        marqueeBottom.className = 'marquee-bottom';
        marqueeBottom.innerHTML = `
            <div class="marquee-content">
                <span>★ 100% FREE</span>
                <span>★ NO ADS</span>
                <span>★ OPEN SOURCE</span>
                <span>★ PRIVACY FIRST</span>
                <span>★ ULTRA SPEED</span>
                <span>★ 100% FREE</span>
                <span>★ NO ADS</span>
                <span>★ OPEN SOURCE</span>
            </div>
        `;

        // 插入到页面（在现有跑马灯之前，如果存在的话替换）
        const existingTop = authPage.querySelector('.marquee-top');
        const existingBottom = authPage.querySelector('.marquee-bottom');

        if (existingTop) existingTop.remove();
        if (existingBottom) existingBottom.remove();

        authPage.insertBefore(marqueeTop, authPage.firstChild);
        authPage.insertBefore(marqueeBottom, authPage.firstChild);
    }

    /**
     * 添加混沌几何形状
     */
    function addChaosShapes() {
        const authPage = document.getElementById('auth-page');

        // 移除旧的混沌形状
        const oldShapes = authPage.querySelectorAll('.chaos-shape');
        oldShapes.forEach(shape => shape.remove());

        // 方形1
        const shape1 = document.createElement('div');
        shape1.className = 'chaos-shape chaos-shape-1';

        // 圆形
        const shape2 = document.createElement('div');
        shape2.className = 'chaos-shape chaos-shape-2';

        // 三角形
        const shape3 = document.createElement('div');
        shape3.className = 'chaos-shape chaos-shape-3';

        // 添加更多随机形状
        const shape4 = document.createElement('div');
        shape4.className = 'chaos-shape';
        shape4.style.cssText = `
            top: 15%;
            right: 15%;
            width: 60px;
            height: 60px;
            background: #B8FF9F;
            border: 4px solid black;
            transform: rotate(-30deg);
            box-shadow: 5px 5px 0 black;
            animation: float-chaos 9s ease-in-out infinite;
        `;

        const shape5 = document.createElement('div');
        shape5.className = 'chaos-shape';
        shape5.style.cssText = `
            bottom: 35%;
            right: 5%;
            width: 70px;
            height: 70px;
            background: #FF006E;
            border: 4px solid black;
            border-radius: 50%;
            box-shadow: 5px 5px 0 black;
            animation: float-chaos 11s ease-in-out infinite reverse;
        `;

        authPage.appendChild(shape1);
        authPage.appendChild(shape2);
        authPage.appendChild(shape3);
        authPage.appendChild(shape4);
        authPage.appendChild(shape5);
    }

    /**
     * 添加随机闪烁的装饰点
     */
    function addBlinkingDots() {
        const authPage = document.getElementById('auth-page');

        // 创建10个随机位置的闪烁点
        for (let i = 0; i < 10; i++) {
            const dot = document.createElement('div');
            dot.style.cssText = `
                position: absolute;
                width: 12px;
                height: 12px;
                background: ${getRandomColor()};
                border: 2px solid black;
                border-radius: 50%;
                top: ${Math.random() * 90}%;
                left: ${Math.random() * 90}%;
                z-index: 3;
                pointer-events: none;
                animation: blink ${1 + Math.random() * 2}s infinite;
                animation-delay: ${Math.random()}s;
            `;
            authPage.appendChild(dot);
        }
    }

    /**
     * 获取随机颜色
     */
    function getRandomColor() {
        const colors = ['#FF90E8', '#00FFFF', '#FFC900', '#B8FF9F', '#FF006E'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * 为表单添加额外的maximalist装饰
     */
    function enhanceFormDecorations() {
        const forms = document.querySelectorAll('.form-container');

        forms.forEach(form => {
            // 添加侧边装饰条
            const sideDecor = document.createElement('div');
            sideDecor.style.cssText = `
                position: absolute;
                left: -15px;
                top: 20%;
                bottom: 20%;
                width: 8px;
                background: repeating-linear-gradient(
                    0deg,
                    #FF90E8 0px,
                    #FF90E8 20px,
                    #00FFFF 20px,
                    #00FFFF 40px,
                    #FFC900 40px,
                    #FFC900 60px
                );
                border: 2px solid black;
                box-shadow: 3px 0 0 black;
            `;
            form.appendChild(sideDecor);
        });
    }

    // 延迟执行表单装饰（等待表单显示）
    setTimeout(enhanceFormDecorations, 100);

})();
