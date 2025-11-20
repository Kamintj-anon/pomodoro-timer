/* ========================================
   ADVANCED INTERACTIONS
   高级交互系统 - 磁力、倾斜、粒子、光标
   ======================================== */

/**
 * 高级交互管理器
 */
class AdvancedInteractions {
  constructor() {
    this.magneticElements = [];
    this.tiltElements = [];
    this.cursorTrail = [];
    this.maxTrailLength = 20;
    this.notifications = [];

    this.init();
  }

  /**
   * 初始化所有交互
   */
  init() {
    this.initMagneticButtons();
    this.initTiltCards();
    this.initRippleEffect();
    this.initCursorTrail();
    this.initFloatingShapes();

    console.log('[AdvancedInteractions] Initialized');
  }

  /* ========================================
     1. 磁性按钮效果
     ======================================== */
  initMagneticButtons() {
    document.addEventListener('mousemove', (e) => {
      const buttons = document.querySelectorAll('.magnetic-btn');

      buttons.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;
        const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

        // 磁力范围：150px
        const magneticRange = 150;

        if (distance < magneticRange) {
          const strength = (magneticRange - distance) / magneticRange;
          const moveX = distanceX * strength * 0.3;
          const moveY = distanceY * strength * 0.3;

          btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
        } else {
          btn.style.transform = 'translate(0, 0)';
        }
      });
    });

    // 鼠标离开时重置
    document.addEventListener('mouseleave', () => {
      const buttons = document.querySelectorAll('.magnetic-btn');
      buttons.forEach(btn => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  /* ========================================
     2. 3D 卡片倾斜效果
     ======================================== */
  initTiltCards() {
    const cards = document.querySelectorAll('.card-tilt');

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; // -10 到 10 度
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.setProperty('--rotate-x', `${rotateX}deg`);
        card.style.setProperty('--rotate-y', `${rotateY}deg`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--rotate-x', '0deg');
        card.style.setProperty('--rotate-y', '0deg');
      });
    });
  }

  /* ========================================
     3. 涟漪点击效果
     ======================================== */
  initRippleEffect() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.ripple-effect');

      if (!target) return;

      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      target.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  }

  /* ========================================
     4. 光标追踪粒子效果
     ======================================== */
  initCursorTrail() {
    // 检查是否是移动设备
    if ('ontouchstart' in window) return;

    // 创建光标追踪容器
    const trailContainer = document.createElement('div');
    trailContainer.id = 'cursor-trail-container';
    trailContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9998;
    `;
    document.body.appendChild(trailContainer);

    let lastX = 0;
    let lastY = 0;
    let lastTime = Date.now();

    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      const dt = now - lastTime;

      // 节流：每 30ms 添加一个粒子
      if (dt < 30) return;

      lastTime = now;

      // 计算速度
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const velocity = Math.sqrt(dx ** 2 + dy ** 2);

      lastX = e.clientX;
      lastY = e.clientY;

      // 速度越快，粒子越多越大
      if (velocity > 2) {
        this.createTrailParticle(e.clientX, e.clientY, velocity);
      }
    });
  }

  createTrailParticle(x, y, velocity) {
    const container = document.getElementById('cursor-trail-container');
    if (!container) return;

    const particle = document.createElement('div');
    particle.className = 'cursor-trail';

    const size = Math.min(velocity * 0.5, 15);
    const colors = ['#00F0FF', '#FF00FF', '#FFFF00', '#00FF00'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    particle.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${color};
      pointer-events: none;
      animation: cursorTrailFade 0.6s ease-out forwards;
      mix-blend-mode: screen;
    `;

    container.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 600);
  }

  /* ========================================
     5. 浮动几何图形
     ======================================== */
  initFloatingShapes() {
    // 检查是否已存在
    if (document.querySelector('.floating-shapes')) return;

    const shapesContainer = document.createElement('div');
    shapesContainer.className = 'floating-shapes';
    document.body.appendChild(shapesContainer);

    const shapes = [
      { type: 'circle', color: 'cyan', count: 3 },
      { type: 'square', color: 'magenta', count: 3 },
      { type: 'triangle', color: 'yellow', count: 2 }
    ];

    shapes.forEach(shapeConfig => {
      for (let i = 0; i < shapeConfig.count; i++) {
        const shape = document.createElement('div');
        shape.className = `shape shape-${shapeConfig.type}`;

        // 随机位置
        shape.style.left = `${Math.random() * 100}%`;
        shape.style.top = `${Math.random() * 100}%`;

        // 随机动画时长
        shape.style.setProperty('--float-duration', `${15 + Math.random() * 10}s`);

        // 随机延迟
        shape.style.animationDelay = `${Math.random() * 5}s`;

        shapesContainer.appendChild(shape);
      }
    });
  }

  /* ========================================
     6. 通知系统
     ======================================== */
  showNotification(message, type = 'info', duration = 3000) {
    // 创建通知容器（如果不存在）
    let container = document.querySelector('.notification-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'notification-container';
      document.body.appendChild(container);
    }

    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <strong>${this.getNotificationTitle(type)}</strong>
        <p>${message}</p>
      </div>
      <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(notification);

    // 自动移除
    setTimeout(() => {
      notification.style.animation = 'notificationSlideOut 0.3s ease-in forwards';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, duration);

    // 添加退出动画
    if (!document.querySelector('#notification-slide-out-keyframes')) {
      const style = document.createElement('style');
      style.id = 'notification-slide-out-keyframes';
      style.textContent = `
        @keyframes notificationSlideOut {
          to {
            transform: translateX(120%);
            opacity: 0;
          }
        }

        @keyframes cursorTrailFade {
          to {
            transform: scale(0);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    return notification;
  }

  getNotificationTitle(type) {
    const titles = {
      info: 'ℹ️ 信息',
      success: '✓ 成功',
      warning: '⚠ 警告',
      error: '✖ 错误'
    };
    return titles[type] || titles.info;
  }

  /* ========================================
     7. 圆形进度条
     ======================================== */
  createCircularProgress(element, targetProgress, duration = 2000) {
    if (!element) return;

    element.classList.add('circular-progress');

    let currentProgress = 0;
    const step = targetProgress / (duration / 16);

    const animate = () => {
      currentProgress += step;

      if (currentProgress >= targetProgress) {
        currentProgress = targetProgress;
      }

      element.style.setProperty('--progress', `${currentProgress}%`);

      if (currentProgress < targetProgress) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /* ========================================
     8. 液态按钮增强
     ======================================== */
  enhanceLiquidButtons() {
    const liquidButtons = document.querySelectorAll('.btn-liquid');

    liquidButtons.forEach(btn => {
      btn.addEventListener('mouseenter', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        btn.style.setProperty('--x', `${x}%`);
        btn.style.setProperty('--y', `${y}%`);
      });
    });
  }

  /* ========================================
     9. 骨架屏加载
     ======================================== */
  createSkeleton(container, config = {}) {
    const defaults = {
      avatar: false,
      title: true,
      lines: 3,
      width: '100%'
    };

    const settings = { ...defaults, ...config };

    container.innerHTML = '';
    container.style.width = settings.width;

    if (settings.avatar) {
      const avatar = document.createElement('div');
      avatar.className = 'skeleton skeleton-avatar';
      container.appendChild(avatar);
    }

    if (settings.title) {
      const title = document.createElement('div');
      title.className = 'skeleton skeleton-title';
      container.appendChild(title);
    }

    for (let i = 0; i < settings.lines; i++) {
      const line = document.createElement('div');
      line.className = 'skeleton skeleton-text';
      if (i === settings.lines - 1) {
        line.style.width = '60%';
      }
      container.appendChild(line);
    }
  }

  /* ========================================
     10. 页面加载动画
     ======================================== */
  pageLoadAnimation() {
    // 添加渐变网格背景
    if (!document.querySelector('.animated-grid-bg')) {
      const gridBg = document.createElement('div');
      gridBg.className = 'animated-grid-bg';
      document.body.appendChild(gridBg);
    }

    // 添加渐变叠加
    if (!document.querySelector('.gradient-overlay')) {
      const gradientOverlay = document.createElement('div');
      gradientOverlay.className = 'gradient-overlay';
      document.body.appendChild(gradientOverlay);
    }

    // 元素逐个进入动画
    const elements = document.querySelectorAll('section');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });

    elements.forEach(el => {
      el.style.opacity = '0';
      observer.observe(el);
    });

    // 添加淡入动画
    if (!document.querySelector('#fade-in-up-keyframes')) {
      const style = document.createElement('style');
      style.id = 'fade-in-up-keyframes';
      style.textContent = `
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /* ========================================
     11. 视差滚动效果
     ======================================== */
  initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');

    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;

      parallaxElements.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.5;
        const yPos = -(scrolled * speed);
        el.style.transform = `translateY(${yPos}px)`;
      });
    });
  }

  /* ========================================
     12. 平滑滚动
     ======================================== */
  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      });
    });
  }

  /* ========================================
     13. 全息文字效果
     ======================================== */
  applyHolographicText(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.classList.add('holographic');
    });
  }

  /* ========================================
     14. RGB 分离效果触发
     ======================================== */
  triggerRGBSplit(element, duration = 3000) {
    element.classList.add('rgb-split');

    setTimeout(() => {
      element.classList.remove('rgb-split');
    }, duration);
  }

  /* ========================================
     15. 扫描线效果
     ======================================== */
  applyScanlines(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.classList.add('scanlines');
    });
  }

  /* ========================================
     16. 装饰性角落
     ======================================== */
  addCornerDecorations(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.classList.add('corner-decoration');
    });
  }

  /* ========================================
     17. 清理
     ======================================== */
  destroy() {
    const trailContainer = document.getElementById('cursor-trail-container');
    if (trailContainer) trailContainer.remove();

    const shapesContainer = document.querySelector('.floating-shapes');
    if (shapesContainer) shapesContainer.remove();

    const gridBg = document.querySelector('.animated-grid-bg');
    if (gridBg) gridBg.remove();

    const gradientOverlay = document.querySelector('.gradient-overlay');
    if (gradientOverlay) gradientOverlay.remove();

    console.log('[AdvancedInteractions] Destroyed');
  }
}

// 创建全局实例
const advancedInteractions = new AdvancedInteractions();
window.advancedInteractions = advancedInteractions;

// 页面加载完成后初始化
window.addEventListener('load', () => {
  advancedInteractions.pageLoadAnimation();
  advancedInteractions.initParallax();
  advancedInteractions.initSmoothScroll();

  // 欢迎通知
  setTimeout(() => {
    advancedInteractions.showNotification(
      '欢迎使用 Neo-Brutal 设计系统！',
      'success',
      4000
    );
  }, 1000);
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdvancedInteractions;
}

console.log('[AdvancedInteractions] Loaded successfully');
