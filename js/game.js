// ============ 游戏系统 JavaScript ============

// 游戏状态
let gameState = {
    character: null,
    battleState: null,
    currentOpponent: null,
    skills: []
};

// 职业中文名
const professionNames = {
    warrior: '战士',
    mage: '法师',
    assassin: '刺客',
    priest: '牧师'
};

// 段位中文名
const rankNames = {
    bronze: '青铜',
    silver: '白银',
    gold: '黄金',
    platinum: '铂金',
    diamond: '钻石',
    master: '大师',
    king: '王者'
};

// ============ 角色系统 ============

async function loadCharacter() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/game/character`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem(API_CONFIG.TOKEN_KEY)}` }
        });

        if (response.ok) {
            const data = await response.json(); gameState.character = data.character; gameState.skills = data.skills;
            renderCharacterPanel();
        } else if (response.status === 404) {
            // 用户没有角色，显示创建角色提示
            showNoCharacterPanel();
        } else {
            // 其他错误（如401未授权），显示错误状态
            showErrorPanel('无法加载角色数据');
        }
    } catch (error) {
        console.error('加载角色失败:', error);
        showErrorPanel('网络错误，请刷新重试');
    }
}

function showNoCharacterPanel() {
    const panel = document.getElementById('character-panel');
    if (!panel) return;

    panel.innerHTML = `
        <div style="text-align: center; padding: 40px; background: white; border: 4px solid black; box-shadow: 8px 8px 0px black;">
            <i class="fas fa-user-plus" style="font-size: 48px; color: #667eea; margin-bottom: 16px;"></i>
            <h3 style="font-family: 'Archivo Black', sans-serif; margin: 0 0 8px 0;">开始你的冒险</h3>
            <p style="font-family: 'Space Mono', monospace; color: #666; margin-bottom: 16px;">创建角色以解锁游戏系统</p>
            <button onclick="showCreateCharacterModal()" style="background: #667eea; color: white; border: 3px solid black; padding: 12px 24px; font-family: 'Space Mono', monospace; font-weight: bold; cursor: pointer; box-shadow: 4px 4px 0px black;">
                <i class="fas fa-plus"></i> 创建角色
            </button>
        </div>
    `;
}

function showErrorPanel(message) {
    const panel = document.getElementById('character-panel');
    if (!panel) return;

    panel.innerHTML = `
        <div style="text-align: center; padding: 40px; background: white; border: 4px solid black; box-shadow: 8px 8px 0px black;">
            <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #f59e0b; margin-bottom: 16px;"></i>
            <p style="font-family: 'Space Mono', monospace; color: #666;">${message}</p>
            <button onclick="loadCharacter()" style="background: #667eea; color: white; border: 3px solid black; padding: 12px 24px; font-family: 'Space Mono', monospace; font-weight: bold; cursor: pointer; box-shadow: 4px 4px 0px black; margin-top: 16px;">
                <i class="fas fa-sync"></i> 重试
            </button>
        </div>
    `;
}

function showCreateCharacterModal() {
    const modal = document.getElementById('create-character-modal');
    if (modal) {
        modal.style.display = 'flex';
        loadProfessions();
    }
}


async function loadProfessions() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/game/professions`);
        const professions = await response.json();

        const container = document.getElementById('profession-options');
        if (container) {
            container.innerHTML = professions.map(p => `
                <div class="profession-card" onclick="selectProfession('${p.id}')" data-profession="${p.id}">
                    <div class="profession-icon">${getProfessionIcon(p.id)}</div>
                    <h3>${p.name}</h3>
                    <p>${p.description}</p>
                    <div class="profession-stats">
                        <span>HP: +${p.bonus.hp}</span>
                        <span>攻击: +${p.bonus.attack}</span>
                        <span>防御: +${p.bonus.defense}</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('加载职业失败:', error);
    }
}

function getProfessionIcon(type) {
    const icons = {
        warrior: '<i class="fas fa-shield-halved"></i>',
        mage: '<i class="fas fa-hat-wizard"></i>',
        assassin: '<i class="fas fa-user-ninja"></i>',
        priest: '<i class="fas fa-cross"></i>'
    };
    return icons[type] || '<i class="fas fa-user"></i>';
}

let selectedProfession = null;

function selectProfession(type) {
    selectedProfession = type;
    document.querySelectorAll('.profession-card').forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.profession === type) {
            card.classList.add('selected');
        }
    });
}

async function createCharacter() {
    const nameInput = document.getElementById('character-name');
    const name = nameInput ? nameInput.value.trim() : '';

    if (!name) {
        alert('请输入角色名称');
        return;
    }

    if (!selectedProfession) {
        alert('请选择职业');
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/game/character`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(API_CONFIG.TOKEN_KEY)}`
            },
            body: JSON.stringify({ name, profession: selectedProfession })
        });

        if (response.ok) {
            const data = await response.json(); gameState.character = data.character; gameState.skills = data.skills;
            closeModal('create-character-modal');
            renderCharacterPanel();
            showNotification('角色创建成功！', 'success');
        } else {
            const data = await response.json();
            alert(data.error || '创建失败');
        }
    } catch (error) {
        console.error('创建角色失败:', error);
        alert('网络错误');
    }
}

function renderCharacterPanel() {
    const char = gameState.character;
    if (!char) return;

    const panel = document.getElementById('character-panel');
    if (!panel) return;

    const hpPercent = (char.current_hp / char.max_hp) * 100;
    const mpPercent = (char.current_mp / char.max_mp) * 100;
    const expPercent = (char.exp / char.exp_to_next) * 100;

    panel.innerHTML = `
        <div class="character-header">
            <div class="character-avatar">${getProfessionIcon(char.profession)}</div>
            <div class="character-info">
                <h3>${char.name}</h3>
                <div class="character-class">Lv.${char.level} ${professionNames[char.profession]}</div>
            </div>
            <div class="character-rank" style="background: ${getRankColor(char.pvp_rank)}">
                ${rankNames[char.pvp_rank]}
            </div>
        </div>

        <div class="character-bars">
            <div class="stat-bar hp-bar">
                <div class="bar-label">HP</div>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${hpPercent}%; background: linear-gradient(90deg, #FF6B6B, #FF8E53)"></div>
                </div>
                <div class="bar-value">${char.current_hp}/${char.max_hp}</div>
            </div>
            <div class="stat-bar mp-bar">
                <div class="bar-label">MP</div>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${mpPercent}%; background: linear-gradient(90deg, #4ECDC4, #44A8B3)"></div>
                </div>
                <div class="bar-value">${char.current_mp}/${char.max_mp}</div>
            </div>
            <div class="stat-bar exp-bar">
                <div class="bar-label">EXP</div>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${expPercent}%; background: linear-gradient(90deg, #A8E6CF, #7BC96F)"></div>
                </div>
                <div class="bar-value">${char.exp}/${char.exp_to_next}</div>
            </div>
        </div>

        <div class="character-stats">
            <div class="stat-item">
                <i class="fas fa-sword"></i>
                <span class="stat-label">攻击</span>
                <span class="stat-value">${char.attack}</span>
            </div>
            <div class="stat-item">
                <i class="fas fa-shield"></i>
                <span class="stat-label">防御</span>
                <span class="stat-value">${char.defense}</span>
            </div>
            <div class="stat-item">
                <i class="fas fa-bolt"></i>
                <span class="stat-label">速度</span>
                <span class="stat-value">${char.speed}</span>
            </div>
            <div class="stat-item">
                <i class="fas fa-crosshairs"></i>
                <span class="stat-label">暴击</span>
                <span class="stat-value">${char.crit_rate}%</span>
            </div>
        </div>

        ${char.attribute_points > 0 ? `
            <div class="attribute-points-notice">
                <i class="fas fa-plus-circle"></i>
                有 <strong>${char.attribute_points}</strong> 点属性点可分配
                <button onclick="showAllocateModal()">分配</button>
            </div>
        ` : ''}

        <div class="character-pvp-stats">
            <div class="pvp-stat">
                <span class="pvp-label">PVP积分</span>
                <span class="pvp-value">${char.pvp_score}</span>
            </div>
            <div class="pvp-stat">
                <span class="pvp-label">胜/负</span>
                <span class="pvp-value">${char.pvp_wins}/${char.pvp_losses}</span>
            </div>
            <div class="pvp-stat">
                <span class="pvp-label">爬塔层数</span>
                <span class="pvp-value">${char.tower_floor}层</span>
            </div>
        </div>

        <div class="character-actions">
            <button class="btn-battle btn-pve" onclick="startPVEBattle()">
                <i class="fas fa-dungeon"></i> 爬塔挑战
            </button>
            <button class="btn-battle btn-pvp" onclick="startPVPBattle()">
                <i class="fas fa-swords"></i> PVP对战
            </button>
        </div>
    `;
}

function getRankColor(rank) {
    const colors = {
        bronze: '#CD7F32',
        silver: '#C0C0C0',
        gold: '#FFD700',
        platinum: '#E5E4E2',
        diamond: '#B9F2FF',
        master: '#9B59B6',
        king: '#FF4444'
    };
    return colors[rank] || '#666';
}

// ============ 战斗系统 ============

async function startPVEBattle() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/game/pve/start`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem(API_CONFIG.TOKEN_KEY)}` }
        });

        if (response.ok) {
            const data = await response.json();
            gameState.battleState = data.state;
            gameState.currentOpponent = data.monster;
            gameState.skills = data.skills;
            showBattleModal('pve', data);
        } else {
            const error = await response.json();
            alert(error.error || '开始战斗失败');
        }
    } catch (error) {
        console.error('开始PVE战斗失败:', error);
    }
}

async function startPVPBattle() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/game/pvp/start`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem(API_CONFIG.TOKEN_KEY)}` }
        });

        if (response.ok) {
            const data = await response.json();
            gameState.battleState = data.state;
            gameState.currentOpponent = data.opponent;
            gameState.skills = data.skills;
            showBattleModal('pvp', data);
        } else {
            const error = await response.json();
            alert(error.error || '匹配失败');
        }
    } catch (error) {
        console.error('开始PVP战斗失败:', error);
    }
}

function showBattleModal(type, data) {
    let modal = document.getElementById('battle-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'battle-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="battle-container">
            <div class="battle-header">
                <h2>${type === 'pve' ? `第${data.floor}层` : 'PVP对战'}</h2>
                <span class="battle-round">回合 ${gameState.battleState.round}</span>
            </div>

            <div class="battle-arena">
                <div class="combatant player">
                    <div class="combatant-name">${gameState.character.name}</div>
                    <div class="hp-bar">
                        <div class="hp-fill" id="player-hp" style="width: ${(gameState.battleState.player_hp / gameState.battleState.player_max_hp) * 100}%"></div>
                    </div>
                    <div class="hp-text">${gameState.battleState.player_hp}/${gameState.battleState.player_max_hp}</div>
                    <div class="mp-bar">
                        <div class="mp-fill" id="player-mp" style="width: ${(gameState.battleState.player_mp / gameState.battleState.player_max_mp) * 100}%"></div>
                    </div>
                    <div class="mp-text">${gameState.battleState.player_mp}/${gameState.battleState.player_max_mp}</div>
                    ${gameState.battleState.shield > 0 ? `<div class="shield-indicator"><i class="fas fa-shield"></i> ${gameState.battleState.shield}</div>` : ''}
                </div>

                <div class="vs-indicator">VS</div>

                <div class="combatant enemy">
                    <div class="combatant-name">${gameState.battleState.enemy_name}</div>
                    <div class="hp-bar enemy-hp">
                        <div class="hp-fill" id="enemy-hp" style="width: ${(gameState.battleState.enemy_hp / gameState.battleState.enemy_max_hp) * 100}%"></div>
                    </div>
                    <div class="hp-text">${gameState.battleState.enemy_hp}/${gameState.battleState.enemy_max_hp}</div>
                </div>
            </div>

            <div class="battle-log" id="battle-log">
                ${gameState.battleState.battle_log.map(log => `<p>${log}</p>`).join('')}
            </div>

            <div class="battle-actions" id="battle-actions">
                <button class="btn-action attack" onclick="executeBattleAction('${type}', 'attack')">
                    <i class="fas fa-fist-raised"></i> 普通攻击
                </button>
                ${gameState.skills.map(skill => `
                    <button class="btn-action skill ${gameState.battleState.player_mp < skill.mp_cost ? 'disabled' : ''}"
                            onclick="executeBattleAction('${type}', 'skill', '${skill.id}')"
                            ${gameState.battleState.player_mp < skill.mp_cost ? 'disabled' : ''}
                            title="${skill.description} (MP: ${skill.mp_cost})">
                        <i class="fas fa-magic"></i> ${skill.name}
                        <span class="mp-cost">${skill.mp_cost}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    modal.style.display = 'flex';
}

async function executeBattleAction(type, action, skillId = '') {
    const endpoint = type === 'pve' ? '/game/pve/action' : '/game/pvp/action';

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(API_CONFIG.TOKEN_KEY)}`
            },
            body: JSON.stringify({
                action: action,
                skill_id: skillId,
                state: gameState.battleState,
                opponent_id: gameState.currentOpponent?.id || 0
            })
        });

        const result = await response.json();

        if (result.ongoing) {
            gameState.battleState = result.state;
            updateBattleUI();
        } else {
            // 战斗结束
            showBattleResult(result);
        }
    } catch (error) {
        console.error('执行战斗行动失败:', error);
    }
}

function updateBattleUI() {
    const state = gameState.battleState;

    document.getElementById('player-hp').style.width = `${(state.player_hp / state.player_max_hp) * 100}%`;
    document.getElementById('player-mp').style.width = `${(state.player_mp / state.player_max_mp) * 100}%`;
    document.getElementById('enemy-hp').style.width = `${(state.enemy_hp / state.enemy_max_hp) * 100}%`;

    const logContainer = document.getElementById('battle-log');
    logContainer.innerHTML = state.battle_log.map(log => `<p>${log}</p>`).join('');
    logContainer.scrollTop = logContainer.scrollHeight;

    // 更新技能按钮状态
    document.querySelectorAll('.btn-action.skill').forEach(btn => {
        const mpCost = parseInt(btn.querySelector('.mp-cost').textContent);
        if (state.player_mp < mpCost) {
            btn.classList.add('disabled');
            btn.disabled = true;
        } else {
            btn.classList.remove('disabled');
            btn.disabled = false;
        }
    });
}

function showBattleResult(result) {
    const state = result.battle_state;
    const modal = document.getElementById('battle-modal');

    const resultClass = result.won ? 'victory' : 'defeat';
    const resultText = result.won ? '胜利！' : '失败...';

    modal.innerHTML = `
        <div class="battle-result ${resultClass}">
            <h2 class="result-title">${resultText}</h2>

            <div class="result-details">
                ${result.exp_gained > 0 ? `<p><i class="fas fa-star"></i> 获得经验: +${result.exp_gained}</p>` : ''}
                ${result.score_change !== 0 ? `<p><i class="fas fa-trophy"></i> 积分变化: ${result.score_change > 0 ? '+' : ''}${result.score_change}</p>` : ''}
                ${result.new_floor ? `<p><i class="fas fa-dungeon"></i> 通过第 ${result.new_floor} 层！</p>` : ''}
                ${result.level_up ? `<p class="level-up"><i class="fas fa-arrow-up"></i> 升级了！</p>` : ''}
            </div>

            <div class="battle-log final-log">
                ${state.battle_log.slice(-5).map(log => `<p>${log}</p>`).join('')}
            </div>

            <div class="result-actions">
                <button onclick="closeBattleModal()" class="btn-close">返回</button>
                ${result.won ? `<button onclick="continueBattle()" class="btn-continue">继续挑战</button>` : ''}
            </div>
        </div>
    `;

    // 刷新角色数据
    loadCharacter();
}

function closeBattleModal() {
    const modal = document.getElementById('battle-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function continueBattle() {
    closeBattleModal();
    startPVEBattle();
}

// ============ 成就系统 ============

async function loadAchievements() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/game/achievements`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem(API_CONFIG.TOKEN_KEY)}` }
        });

        if (response.ok) {
            const achievements = await response.json();
            renderAchievements(achievements);
        }
    } catch (error) {
        console.error('加载成就失败:', error);
    }
}

function renderAchievements(achievements) {
    const container = document.getElementById('achievements-list');
    if (!container) return;

    container.innerHTML = achievements.map(ach => `
        <div class="achievement-item ${ach.claimed ? 'claimed' : ''} ${ach.completed ? 'completed' : ''}">
            <div class="achievement-icon">
                <i class="fas ${getAchievementIcon(ach.achievement.type)}"></i>
            </div>
            <div class="achievement-info">
                <h4>${ach.achievement.name}</h4>
                <p>${ach.achievement.description}</p>
                <div class="achievement-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(100, (ach.progress / ach.achievement.target) * 100)}%"></div>
                    </div>
                    <span class="progress-text">${ach.progress}/${ach.achievement.target}</span>
                </div>
            </div>
            <div class="achievement-reward">
                <span class="exp-reward">+${ach.achievement.exp_reward} EXP</span>
                ${ach.completed && !ach.claimed ? `
                    <button onclick="claimAchievement('${ach.achievement.id}')" class="btn-claim">领取</button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function getAchievementIcon(type) {
    const icons = {
        daily: 'fa-calendar-day',
        weekly: 'fa-calendar-week',
        one_time: 'fa-trophy',
        repeatable: 'fa-repeat'
    };
    return icons[type] || 'fa-star';
}

async function claimAchievement(achievementId) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/game/achievements/${achievementId}/claim`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem(API_CONFIG.TOKEN_KEY)}` }
        });

        if (response.ok) {
            const result = await response.json();
            showNotification(`获得 ${result.exp_gained} 经验！`, 'success');
            loadAchievements();
            loadCharacter();
        }
    } catch (error) {
        console.error('领取成就失败:', error);
    }
}

// ============ 工具函数 ============

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i> ${message}`;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// ============ 初始化 ============

function initGameSystem() {
    if (localStorage.getItem(API_CONFIG.TOKEN_KEY)) {
        loadCharacter();
    }
}

// 页面加载时初始化
// 由app.js在登录后调用 initGameSystem()
