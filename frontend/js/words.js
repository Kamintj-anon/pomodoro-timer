// 单词打卡功能

// 初始化单词打卡页面
async function initWords() {
    // 设置今天的日期
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('word-date').value = today;

    // 加载今日打卡数据
    await loadTodayWord();

    // 加载统计数据
    await loadWordStats();

    // 加载打卡记录
    await loadWordRecords();
}

// 提交单词打卡
async function submitWordCount() {
    const date = document.getElementById('word-date').value;
    const wordCount = parseInt(document.getElementById('word-count').value);
    const note = document.getElementById('word-note').value.trim();

    if (!date) {
        showToast('请选择日期', 'warning');
        return;
    }

    if (isNaN(wordCount) || wordCount < 0) {
        showToast('请输入有效的单词数量', 'warning');
        return;
    }

    try {
        await api.post(API_ENDPOINTS.WORDS, {
            date: date,
            word_count: wordCount,
            note: note
        });

        showToast('打卡成功！', 'success');

        // 清空输入（备注）
        document.getElementById('word-note').value = '';

        // 重新加载数据
        await loadWordStats();
        await loadWordRecords();

    } catch (error) {
        showToast(error.message || '打卡失败', 'error');
    }
}

// 加载今日打卡数据
async function loadTodayWord() {
    try {
        const data = await api.get(API_ENDPOINTS.WORDS_TODAY);

        if (data && data.word_count > 0) {
            document.getElementById('word-count').value = data.word_count;
            document.getElementById('word-note').value = data.note || '';
        }
    } catch (error) {
        console.error('加载今日数据失败:', error);
    }
}

// 加载统计数据
async function loadWordStats() {
    try {
        const stats = await api.get(API_ENDPOINTS.WORDS_STATS);

        // 更新统计卡片
        document.getElementById('total-words').textContent = stats.total_words || 0;
        document.getElementById('total-days').textContent = stats.total_days || 0;
        document.getElementById('avg-words').textContent = stats.avg_per_day
            ? Math.round(stats.avg_per_day)
            : 0;

    } catch (error) {
        console.error('加载统计失败:', error);
    }
}

// 加载打卡记录
async function loadWordRecords() {
    try {
        const records = await api.get(API_ENDPOINTS.WORDS);
        const container = document.getElementById('word-records-list');

        if (!records || records.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px 0;">暂无打卡记录</p>';
            return;
        }

        container.innerHTML = records.map(record => `
            <div class="word-record-item">
                <div class="record-date">
                    <i class="fas fa-calendar"></i>
                    <span>${formatDate(record.date)}</span>
                </div>
                <div class="record-content">
                    <div class="record-count">
                        <i class="fas fa-book"></i>
                        <strong>${record.word_count}</strong> 个单词
                    </div>
                    ${record.note ? `<div class="record-note">${record.note}</div>` : ''}
                </div>
                <button class="btn-delete-record" onclick="deleteWordRecord(${record.id})" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

    } catch (error) {
        console.error('加载打卡记录失败:', error);
        showToast('加载打卡记录失败', 'error');
    }
}

// 删除打卡记录
async function deleteWordRecord(recordId) {
    const confirmed = await showConfirm('确定要删除这条打卡记录吗？', '删除记录');
    if (!confirmed) {
        return;
    }

    try {
        await api.delete(API_ENDPOINTS.WORD(recordId));
        showToast('删除成功', 'success');

        // 重新加载数据
        await loadWordStats();
        await loadWordRecords();

    } catch (error) {
        showToast(error.message || '删除失败', 'error');
    }
}

// 格式化日期显示
function formatDate(dateStr) {
    // 验证日期字符串
    if (!dateStr) {
        return '未知日期';
    }

    // 尝试创建日期对象
    const date = new Date(dateStr + 'T00:00:00');

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
        console.error('无效的日期格式:', dateStr);
        return dateStr; // 返回原始字符串
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // 格式化为 YYYY-MM-DD 用于比较
    const dateOnly = date.toISOString().split('T')[0];
    const todayOnly = today.toISOString().split('T')[0];
    const yesterdayOnly = yesterday.toISOString().split('T')[0];

    if (dateOnly === todayOnly) {
        return '今天';
    } else if (dateOnly === yesterdayOnly) {
        return '昨天';
    } else {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const weekDay = weekDays[date.getDay()];
        return `${year}-${month}-${day} ${weekDay}`;
    }
}

// 日期输入框回车支持
document.addEventListener('DOMContentLoaded', () => {
    const countInput = document.getElementById('word-count');
    const noteInput = document.getElementById('word-note');

    if (countInput) {
        countInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitWordCount();
            }
        });
    }

    if (noteInput) {
        noteInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitWordCount();
            }
        });
    }
});
