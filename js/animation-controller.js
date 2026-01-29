/* ========================================
   ANIMATION CONTROLLER
   动画控制系统 - 开关、降级、性能监测
   ======================================== */

/**
 * 动画控制器
 * 功能：
 * 1. 动画开关（开启/关闭/降低）
 * 2. 性能监测和自动降级
 * 3. 动画触发器
 * 4. 彩屑爆炸效果
 * 5. 设置持久化
 */

class AnimationController {
  constructor() {
    this.STORAGE_KEY = 'animation-preference';
    this.fps = 60;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.monitoringEnabled = false;

    // 动画模式：'on', 'reduced', 'off'
    this.mode = this.loadPreference();

    // 初始化
    this.init();
  }

  /**
   * 初始化动画控制器
   */
  init() {
    // 应用保存的偏好
    this.applyMode(this.mode);

    // 检测系统偏好
    this.detectSystemPreference();

    // 开始性能监测（可选）
    if (this.shouldMonitorPerformance()) {
      this.startPerformanceMonitoring();
    }

    console.log(`[AnimationController] Initialized with mode: ${this.mode}`);
  }

  /**
   * 加载用户偏好
   */
  loadPreference() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved || 'on';
    } catch (e) {
      console.warn('[AnimationController] Failed to load preference:', e);
      return 'on';
    }
  }

  /**
   * 保存用户偏好
   */
  savePreference(mode) {
    try {
      localStorage.setItem(this.STORAGE_KEY, mode);
    } catch (e) {
      console.warn('[AnimationController] Failed to save preference:', e);
    }
  }

  /**
   * 检测系统级降低动画偏好
   */
  detectSystemPreference() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

      if (mediaQuery.matches && this.mode === 'on') {
        console.log('[AnimationController] System prefers reduced motion, auto-switching to reduced mode');
        this.setMode('reduced');
      }

      // 监听系统偏好变化
      mediaQuery.addEventListener('change', (e) => {
        if (e.matches && this.mode === 'on') {
          this.setMode('reduced');
        }
      });
    }
  }

  /**
   * 判断是否应该监测性能
   */
  shouldMonitorPerformance() {
    // 在移动设备或低端设备上启用性能监测
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  /**
   * 开始性能监测
   */
  startPerformanceMonitoring() {
    if (this.monitoringEnabled) return;

    this.monitoringEnabled = true;
    this.monitorFrame();
  }

  /**
   * 停止性能监测
   */
  stopPerformanceMonitoring() {
    this.monitoringEnabled = false;
  }

  /**
   * 监测帧率
   */
  monitorFrame() {
    if (!this.monitoringEnabled) return;

    const now = performance.now();
    const delta = now - this.lastTime;
    this.frameCount++;

    // 每秒计算一次FPS
    if (delta >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / delta);
      this.frameCount = 0;
      this.lastTime = now;

      // 如果FPS过低且当前是完整动画模式，自动降级
      if (this.fps < 30 && this.mode === 'on') {
        console.warn(`[AnimationController] Low FPS detected (${this.fps}), auto-switching to reduced mode`);
        this.setMode('reduced');
        this.showToast('检测到性能问题，已自动降低动画效果');
      }
    }

    requestAnimationFrame(() => this.monitorFrame());
  }

  /**
   * 设置动画模式
   */
  setMode(mode) {
    if (!['on', 'reduced', 'off'].includes(mode)) {
      console.error('[AnimationController] Invalid mode:', mode);
      return;
    }

    this.mode = mode;
    this.savePreference(mode);
    this.applyMode(mode);

    console.log(`[AnimationController] Mode changed to: ${mode}`);
  }

  /**
   * 应用动画模式
   */
  applyMode(mode) {
    const root = document.documentElement;

    // 移除所有动画相关的属性
    root.removeAttribute('data-animation');

    // 应用对应的属性
    if (mode === 'reduced') {
      root.setAttribute('data-animation', 'reduced');
    } else if (mode === 'off') {
      root.setAttribute('data-animation', 'off');
    }
  }

  /**
   * 获取当前模式
   */
  getMode() {
    return this.mode;
  }

  /**
   * 切换模式（循环：on -> reduced -> off -> on）
   */
  toggleMode() {
    const modes = ['on', 'reduced', 'off'];
    const currentIndex = modes.indexOf(this.mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    this.setMode(modes[nextIndex]);
    return modes[nextIndex];
  }

  /**
   * 触发弹跳动画
   */
  triggerBounce(element) {
    if (this.mode === 'off') return;

    element.classList.add('is-animating', 'bounce-pop');

    setTimeout(() => {
      element.classList.remove('is-animating', 'bounce-pop');
    }, 500);
  }

  /**
   * 触发故障抖动动画
   */
  triggerGlitch(element) {
    if (this.mode === 'off') return;

    element.classList.add('is-animating', 'glitch');

    setTimeout(() => {
      element.classList.remove('is-animating', 'glitch');
    }, 300);
  }

  /**
   * 触发霓虹脉冲动画（持续）
   */
  triggerPulse(element, continuous = true) {
    if (this.mode === 'off') return;

    if (continuous) {
      element.classList.add('is-animating', 'pulse');
    } else {
      element.classList.add('is-animating', 'pulse');
      setTimeout(() => {
        element.classList.remove('is-animating', 'pulse');
      }, 2000);
    }
  }

  /**
   * 停止脉冲动画
   */
  stopPulse(element) {
    element.classList.remove('is-animating', 'pulse');
  }

  /**
   * 触发滑入动画
   */
  triggerSlideIn(element) {
    if (this.mode === 'off') return;

    element.classList.add('is-animating', 'slide-in');

    setTimeout(() => {
      element.classList.remove('is-animating', 'slide-in');
    }, 600);
  }

  /**
   * 触发倾斜变形动画
   */
  triggerSkew(element) {
    if (this.mode === 'off') return;

    element.classList.add('is-animating', 'skew');
  }

  /**
   * 移除倾斜变形动画
   */
  removeSkew(element) {
    element.classList.remove('is-animating', 'skew');
  }

  /**
   * 触发彩屑爆炸效果
   */
  triggerConfetti(options = {}) {
    if (this.mode === 'off') return;

    const defaults = {
      count: this.mode === 'reduced' ? 20 : 50,
      colors: [
        'var(--neon-cyan)',
        'var(--neon-magenta)',
        'var(--neon-yellow)',
        'var(--neon-lime)',
        'var(--neon-purple)',
        'var(--neon-orange)'
      ],
      origin: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      spread: 360,
      velocity: this.mode === 'reduced' ? 30 : 50,
      duration: this.mode === 'reduced' ? 800 : 1200
    };

    const config = { ...defaults, ...options };

    // 创建彩屑容器
    const container = document.createElement('div');
    container.className = 'confetti-container';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: var(--z-tooltip, 9999);
    `;
    document.body.appendChild(container);

    // 生成彩屑
    for (let i = 0; i < config.count; i++) {
      const piece = this.createConfettiPiece(config, i);
      container.appendChild(piece);
    }

    // 动画结束后清理
    setTimeout(() => {
      container.remove();
    }, config.duration + 100);
  }

  /**
   * 创建单个彩屑
   */
  createConfettiPiece(config, index) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';

    // 随机颜色
    const color = config.colors[Math.floor(Math.random() * config.colors.length)];

    // 随机方向和距离
    const angle = (Math.random() * config.spread - config.spread / 2) * (Math.PI / 180);
    const velocity = config.velocity * (0.5 + Math.random() * 0.5);
    const distance = velocity * (config.duration / 1000);

    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    // 随机旋转
    const rotate = Math.random() * 720 - 360;

    // 设置样式
    piece.style.cssText = `
      position: absolute;
      left: ${config.origin.x}px;
      top: ${config.origin.y}px;
      width: 12px;
      height: 12px;
      background: ${color};
      border-radius: var(--radius-sm, 8px);
      --confetti-x: ${dx}px;
      --confetti-y: ${dy}px;
      --confetti-rotate: ${rotate}deg;
      animation-duration: ${config.duration}ms;
    `;

    return piece;
  }

  /**
   * 显示提示消息
   */
  showToast(message, duration = 3000) {
    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = 'animation-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 24px;
      padding: 16px 24px;
      background: var(--text-primary, #000);
      color: var(--bg-primary, #fff);
      border: var(--border-md, 4px solid #000);
      border-radius: var(--radius-sm, 8px);
      box-shadow: var(--shadow-md, 8px 8px 0 #000);
      font-weight: var(--font-weight-bold, 700);
      font-size: var(--font-size-sm, 14px);
      z-index: var(--z-tooltip, 9999);
      animation: slideInUp 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    // 自动移除
    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

// 创建全局实例
const animationController = new AnimationController();

// 暴露到全局
window.animationController = animationController;

// 导出（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnimationController;
}

console.log('[AnimationController] Loaded successfully');
