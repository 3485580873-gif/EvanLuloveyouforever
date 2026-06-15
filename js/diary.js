/**
 * 朝夕心记 - diary.js
 * 功能模块：待办事项、习惯打卡、月经记录、纪念日
 * 数据存储：localforage (IndexedDB)
 * 依赖：getStorageKey, showNotification, showModal, hideModal, localforage
 */

/* ========== 全局状态 ========== */
let diaryTodos = [];          // 待办事项
let diaryHabits = [];         // 习惯列表
let diaryHabitRecords = {};   // 习惯打卡记录 { 'YYYY-MM-DD': { habitId: true } }
let diaryPeriodRecords = [];  // 月经记录 [{ date: 'YYYY-MM-DD', flow: 'light'|'medium'|'heavy', note: '' }]
let diaryPeriodViewYear = 0;   // 月经日历当前查看年份
let diaryPeriodViewMonth = 0;  // 月经日历当前查看月份（0-11）
let diaryAnniversaries = [];  // 纪念日 [{ id, name, date, type: 'anniversary'|'countdown' }]
let diaryTodoCategories = [   // 待办分类 [{ id, name, icon, color }]
    { id: 'work', name: '工作', icon: '💼', color: '#4d96ff' },
    { id: 'life', name: '生活', icon: '🏠', color: '#6bcb77' },
    { id: 'study', name: '学习', icon: '📚', color: '#a29bfe' },
    { id: 'health', name: '健康', icon: '💪', color: '#fd79a8' },
    { id: 'other', name: '其他', icon: '📌', color: '#95a5a6' }
];

let diaryCurrentTab = 'todo'; // 当前子标签页
let diaryTodoSubTab = 'all';  // 待办分类二级标签页

/* ========== 数据初始化 ========== */
async function initDiaryData() {
    try {
        const key = getStorageKey('diaryTodos');
        console.log('[朝夕心记] initDiaryData 读取 key:', key);
        const [todos, habits, habitRecords, periodRecords, anniversaries, categories] = await Promise.allSettled([
            localforage.getItem(getStorageKey('diaryTodos')),
            localforage.getItem(getStorageKey('diaryHabits')),
            localforage.getItem(getStorageKey('diaryHabitRecords')),
            localforage.getItem(getStorageKey('diaryPeriodRecords')),
            localforage.getItem(getStorageKey('diaryAnniversaries')),
            localforage.getItem(getStorageKey('diaryTodoCategories'))
        ]);

        console.log('[朝夕心记] diaryTodos:', todos.status, todos.value ? todos.value.length : 0);
        if (todos.status === 'fulfilled' && Array.isArray(todos.value)) diaryTodos = todos.value;
        if (habits.status === 'fulfilled' && Array.isArray(habits.value)) diaryHabits = habits.value;
        if (categories.status === 'fulfilled' && categories.value && Array.isArray(categories.value) && categories.value.length > 0) {
            diaryTodoCategories = categories.value;
        }
        if (habitRecords.status === 'fulfilled' && habitRecords.value) diaryHabitRecords = habitRecords.value;
        if (periodRecords.status === 'fulfilled' && Array.isArray(periodRecords.value)) diaryPeriodRecords = periodRecords.value;
        if (anniversaries.status === 'fulfilled' && Array.isArray(anniversaries.value)) diaryAnniversaries = anniversaries.value;
    } catch (e) {
        console.error('[朝夕心记] 数据初始化失败:', e);
    }
}

/* ========== 数据保存 ========== */
function saveDiaryTodos() {
    localforage.setItem(getStorageKey('diaryTodos'), diaryTodos).catch(() => {});
}
function saveDiaryHabits() {
    localforage.setItem(getStorageKey('diaryHabits'), diaryHabits).catch(() => {});
}
function saveDiaryHabitRecords() {
    localforage.setItem(getStorageKey('diaryHabitRecords'), diaryHabitRecords).catch(() => {});
}
function saveDiaryPeriodRecords() {
    localforage.setItem(getStorageKey('diaryPeriodRecords'), diaryPeriodRecords).catch(() => {});
}
function saveDiaryAnniversaries() {
    localforage.setItem(getStorageKey('diaryAnniversaries'), diaryAnniversaries).catch(() => {});
}
function saveDiaryTodoCategories() {
    localforage.setItem(getStorageKey('diaryTodoCategories'), diaryTodoCategories).catch(() => {});
}

/* ========== 待办分类管理 ========== */
function addTodoCategory(name, icon, color) {
    if (!name || !name.trim()) {
        showNotification('请输入分类名称', 'warning');
        return null;
    }
    const id = 'cat_' + Date.now();
    const newCategory = { id, name: name.trim(), icon: icon || '📁', color: color || '#95a5a6' };
    diaryTodoCategories.push(newCategory);
    saveDiaryTodoCategories();
    renderTodoSubTabs();
    updateTodoCategorySelect();
    showNotification(`分类「${newCategory.name}」已创建`, 'success');
    console.log('[朝夕心记] 创建分类:', newCategory, '当前分类数:', diaryTodoCategories.length);
    return newCategory;
}

function editTodoCategory(id, name, icon, color) {
    const category = diaryTodoCategories.find(c => c.id === id);
    if (!category) return;
    if (name) category.name = name.trim();
    if (icon) category.icon = icon;
    if (color) category.color = color;
    saveDiaryTodoCategories();
    renderTodoSubTabs();
    updateTodoCategorySelect();
    renderDiaryTodos();
    showNotification('分类已更新', 'success');
}

function deleteTodoCategory(id) {
    const index = diaryTodoCategories.findIndex(c => c.id === id);
    if (index === -1) return;
    const category = diaryTodoCategories[index];
    // 将该分类下的待办移到"其他"
    diaryTodos.forEach(todo => {
        if (todo.category === id) {
            todo.category = 'other';
        }
    });
    diaryTodoCategories.splice(index, 1);
    saveDiaryTodoCategories();
    saveDiaryTodos();
    renderTodoSubTabs();
    updateTodoCategorySelect();
    renderDiaryTodos();
    showNotification(`分类「${category.name}」已删除，相关待办已移到其他`, 'success');
}

/* ========== 工具函数 ========== */
function diaryFormatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function diaryTodayStr() {
    return diaryFormatDate(new Date());
}

function diaryEscHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

/* ========== 迷你日历弹窗 ========== */
let miniCalYear = 0;
let miniCalMonth = 0;

function openMiniCalendar() {
    const today = new Date();
    miniCalYear = today.getFullYear();
    miniCalMonth = today.getMonth();
    renderMiniCalendar();
}

function renderMiniCalendar() {
    // 移除已有弹窗
    let overlay = document.getElementById('mini-calendar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'mini-calendar-overlay';
        overlay.className = 'mini-calendar-overlay';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    }

    const today = new Date();
    const todayStr = diaryTodayStr();
    const year = miniCalYear;
    const month = miniCalMonth;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDow = firstDay.getDay();

    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

    // 星期标题行
    let weekHtml = '<div class="mini-cal-weekdays">';
    weekDays.forEach(w => { weekHtml += `<div>${w}</div>`; });
    weekHtml += '</div>';

    // 日期网格
    let gridHtml = '';
    for (let i = 0; i < startDow; i++) {
        gridHtml += '<div class="mini-cal-day empty"></div>';
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isToday = dateStr === todayStr;

        // 检查该日是否有事件
        const hasTodo = diaryTodos.some(t => !t.done && t.dueDate && t.dueDate.slice(0, 10) === dateStr);
        const hasHabit = diaryHabits.some(h => diaryHabitRecords[dateStr] && diaryHabitRecords[dateStr][h.id]);
        const hasAnniversary = diaryAnniversaries.some(a => {
            const aMonth = a.date.slice(5, 7);
            const aDay = a.date.slice(8, 10);
            const dMonth = String(month + 1).padStart(2, '0');
            const dDay = String(d).padStart(2, '0');
            return aMonth === dMonth && aDay === dDay;
        });
        const hasPeriod = diaryPeriodRecords.some(r => r.date === dateStr);

        let dayClass = 'mini-cal-day';
        if (isToday) dayClass += ' mini-cal-today';

        // 小圆点指示器
        let dotsHtml = '<div class="mini-cal-dots">';
        if (hasTodo) dotsHtml += '<span class="mini-cal-dot dot-todo"></span>';
        if (hasHabit) dotsHtml += '<span class="mini-cal-dot dot-habit"></span>';
        if (hasAnniversary) dotsHtml += '<span class="mini-cal-dot dot-anniversary"></span>';
        if (hasPeriod) dotsHtml += '<span class="mini-cal-dot dot-period"></span>';
        dotsHtml += '</div>';

        gridHtml += `<div class="${dayClass}" onclick="showMiniCalDayDetail('${dateStr}')">${d}${dotsHtml}</div>`;
    }

    const monthTitle = `${year}年${month + 1}月`;

    overlay.innerHTML = `
        <div class="mini-calendar-card">
            <div class="mini-cal-nav">
                <button class="mini-cal-nav-btn" onclick="changeMiniCalMonth(-1)"><i class="fas fa-chevron-left"></i></button>
                <span class="mini-cal-nav-title">${monthTitle}</span>
                <button class="mini-cal-nav-btn" onclick="changeMiniCalMonth(1)"><i class="fas fa-chevron-right"></i></button>
            </div>
            ${weekHtml}
            <div class="mini-cal-grid">${gridHtml}</div>
            <div class="mini-cal-legend">
                <span class="mini-cal-legend-item"><span class="mini-cal-dot dot-todo"></span>待办</span>
                <span class="mini-cal-legend-item"><span class="mini-cal-dot dot-habit"></span>打卡</span>
                <span class="mini-cal-legend-item"><span class="mini-cal-dot dot-anniversary"></span>纪念日</span>
                <span class="mini-cal-legend-item"><span class="mini-cal-dot dot-period"></span>经期</span>
            </div>
            <button class="mini-cal-close-btn" onclick="document.getElementById('mini-calendar-overlay').remove()">
                <i class="fas fa-times"></i> 关闭
            </button>
        </div>`;
}

function changeMiniCalMonth(delta) {
    miniCalMonth += delta;
    if (miniCalMonth > 11) { miniCalMonth = 0; miniCalYear++; }
    else if (miniCalMonth < 0) { miniCalMonth = 11; miniCalYear--; }
    renderMiniCalendar();
}

// 显示某日详情弹窗
function showMiniCalDayDetail(dateStr) {
    const dateObj = new Date(dateStr);
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const displayDate = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日 ${weekDays[dateObj.getDay()]}`;

    // 收集待办事项（截止日期匹配且未完成）
    const todos = diaryTodos.filter(t => !t.done && t.dueDate && t.dueDate.slice(0, 10) === dateStr);

    // 收集打卡事项（该日已打卡的习惯）
    const checkedHabits = diaryHabits.filter(h => diaryHabitRecords[dateStr] && diaryHabitRecords[dateStr][h.id]);

    // 收集未打卡习惯（该日应该打卡但未打卡的）
    const uncheckedHabits = diaryHabits.filter(h => !(diaryHabitRecords[dateStr] && diaryHabitRecords[dateStr][h.id]));

    // 收集纪念日
    const anniversaries = diaryAnniversaries.filter(a => {
        const aMonth = a.date.slice(5, 7);
        const aDay = a.date.slice(8, 10);
        return aMonth === dateStr.slice(5, 7) && aDay === dateStr.slice(8, 10);
    });

    // 检查经期第几天
    let periodDayInfo = '';
    if (diaryPeriodRecords.some(r => r.date === dateStr)) {
        // 找到该经期区间的第一天
        const sortedRecords = [...diaryPeriodRecords].sort((a, b) => a.date.localeCompare(b.date));
        let periodStart = dateStr;
        // 向前查找连续的经期日期
        for (let i = 0; i < sortedRecords.length; i++) {
            if (sortedRecords[i].date > dateStr) break;
            const prev = new Date(sortedRecords[i].date);
            prev.setDate(prev.getDate() - 1);
            const prevStr = formatDateStr(prev);
            if (i === 0 || !diaryPeriodRecords.some(r => r.date === prevStr)) {
                // 这是经期开始
                if (sortedRecords[i].date <= dateStr) {
                    periodStart = sortedRecords[i].date;
                }
            }
        }
        // 计算第几天
        const startDate = new Date(periodStart);
        const targetDate = new Date(dateStr);
        const dayNum = Math.round((targetDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        periodDayInfo = `<div class="mini-cal-detail-section"><div class="mini-cal-detail-icon">🌸</div><div class="mini-cal-detail-content"><div class="mini-cal-detail-label">经期第 ${dayNum} 天</div></div></div>`;
    }

    // 构建弹窗内容
    let contentHtml = '';

    // 待办事项
    if (todos.length > 0) {
        contentHtml += '<div class="mini-cal-detail-group"><div class="mini-cal-detail-group-title">📋 待办事项</div>';
        todos.forEach(t => {
            const priorityIcon = t.priority === 'high' ? '🔴' : t.priority === 'medium' ? '🟡' : '🟢';
            contentHtml += `<div class="mini-cal-detail-section"><div class="mini-cal-detail-icon">${priorityIcon}</div><div class="mini-cal-detail-content"><div class="mini-cal-detail-label">${diaryEscHtml(t.text)}</div></div></div>`;
        });
        contentHtml += '</div>';
    }

    // 打卡事项
    if (checkedHabits.length > 0) {
        contentHtml += '<div class="mini-cal-detail-group"><div class="mini-cal-detail-group-title">✅ 已打卡</div>';
        checkedHabits.forEach(h => {
            contentHtml += `<div class="mini-cal-detail-section"><div class="mini-cal-detail-icon" style="color:${h.color};"><i class="${h.icon}"></i></div><div class="mini-cal-detail-content"><div class="mini-cal-detail-label">${diaryEscHtml(h.name)}</div></div></div>`;
        });
        contentHtml += '</div>';
    }

    // 未打卡习惯
    if (uncheckedHabits.length > 0) {
        contentHtml += '<div class="mini-cal-detail-group"><div class="mini-cal-detail-group-title">⬜ 未打卡</div>';
        uncheckedHabits.forEach(h => {
            contentHtml += `<div class="mini-cal-detail-section"><div class="mini-cal-detail-icon" style="color:${h.color};opacity:0.5;"><i class="${h.icon}"></i></div><div class="mini-cal-detail-content"><div class="mini-cal-detail-label" style="opacity:0.6;">${diaryEscHtml(h.name)}</div></div></div>`;
        });
        contentHtml += '</div>';
    }

    // 纪念日
    if (anniversaries.length > 0) {
        contentHtml += '<div class="mini-cal-detail-group"><div class="mini-cal-detail-group-title">💝 纪念日</div>';
        anniversaries.forEach(a => {
            const origDate = new Date(a.date);
            const today = new Date();
            const thisYearDate = new Date(today.getFullYear(), origDate.getMonth(), origDate.getDate());
            const diffDays = Math.round((thisYearDate - today) / (1000 * 60 * 60 * 24));
            let dayText = '';
            if (diffDays === 0) dayText = '就是今天！';
            else if (diffDays > 0) dayText = `还有 ${diffDays} 天`;
            else dayText = `已过 ${Math.abs(diffDays)} 天`;
            contentHtml += `<div class="mini-cal-detail-section"><div class="mini-cal-detail-icon">💝</div><div class="mini-cal-detail-content"><div class="mini-cal-detail-label">${diaryEscHtml(a.name)}</div><div class="mini-cal-detail-sub">${dayText}</div></div></div>`;
        });
        contentHtml += '</div>';
    }

    // 经期
    if (periodDayInfo) {
        contentHtml += '<div class="mini-cal-detail-group"><div class="mini-cal-detail-group-title">🌸 经期记录</div>';
        contentHtml += periodDayInfo;
        contentHtml += '</div>';
    }

    // 无内容
    if (!contentHtml) {
        contentHtml = '<div class="mini-cal-detail-empty">这一天没有记录哦~</div>';
    }

    // 创建弹窗
    const detailOverlay = document.createElement('div');
    detailOverlay.className = 'mini-cal-detail-overlay';
    detailOverlay.innerHTML = `
        <div class="mini-cal-detail-card">
            <div class="mini-cal-detail-header">
                <span class="mini-cal-detail-date">${displayDate}</span>
                <button class="mini-cal-detail-close" onclick="this.closest('.mini-cal-detail-overlay').remove()"><i class="fas fa-times"></i></button>
            </div>
            <div class="mini-cal-detail-body">${contentHtml}</div>
        </div>`;

    detailOverlay.addEventListener('click', (e) => { if (e.target === detailOverlay) detailOverlay.remove(); });
    document.body.appendChild(detailOverlay);
}

/* ========== 主入口：打开朝夕心记 ========== */
async function openDiaryModal() {
    console.log('[朝夕心记] 打开朝夕心记');
    await initDiaryData();
    console.log('[朝夕心记] 数据初始化完成, 分类数:', diaryTodoCategories.length);
    diaryCurrentTab = 'todo';
    renderDiaryModal();
    updateCreateTodoButton();
    const modal = document.getElementById('diary-modal');
    if (typeof showModal === 'function') {
        showModal(modal);
    } else if (typeof window.homeShowModal === 'function') {
        window.homeShowModal(modal);
    } else {
        modal.style.display = 'flex';
    }
}

// 挂载到 window 供主页等模块调用
window.openDiaryModal = openDiaryModal;
window.openMiniCalendar = openMiniCalendar;

/* ========== Modal 渲染 ========== */
function renderDiaryModal() {
    const modal = document.getElementById('diary-modal');
    if (!modal) return;

    // 更新标签页按钮状态
    const tabs = modal.querySelectorAll('.diary-tab-btn');
    tabs.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === diaryCurrentTab);
    });

    // 渲染对应面板
    const panels = modal.querySelectorAll('.diary-panel');
    panels.forEach(panel => {
        panel.style.display = panel.dataset.panel === diaryCurrentTab ? 'block' : 'none';
    });

    // 渲染内容
    switch (diaryCurrentTab) {
        case 'todo':
            renderTodoSubTabs();
            updateTodoCategorySelect();
            renderDiaryTodos();
            break;
        case 'habit': renderDiaryHabits(); break;
        case 'period': renderDiaryPeriod(); break;
        case 'anniversary': renderDiaryAnniversaries(); break;
    }
}

function switchDiaryTab(tab) {
    diaryCurrentTab = tab;
    renderDiaryModal();
    updateCreateTodoButton();
}

// 更新"创建新待办"和"创建新习惯"按钮的显示状态
function updateCreateTodoButton() {
    const todoBtn = document.getElementById('close-diary');
    const habitBtn = document.getElementById('create-habit-btn');

    // 待办按钮只在"待办"标签页显示
    if (todoBtn) {
        todoBtn.style.display = diaryCurrentTab === 'todo' ? 'block' : 'none';
    }

    // 习惯按钮只在"打卡"标签页显示
    if (habitBtn) {
        habitBtn.style.display = diaryCurrentTab === 'habit' ? 'block' : 'none';
    }
}

// 切换待办分类二级标签
function switchTodoSubTab(subtab) {
    diaryTodoSubTab = subtab;

    // 更新标签按钮状态
    const buttons = document.querySelectorAll('.diary-sub-tab-btn');
    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.subtab === subtab);
    });

    // 重新渲染待办列表
    renderDiaryTodos();
}

// 点击"创建新待办"按钮
function handleCreateTodoClick() {
    // 获取当前子标签页对应的分类
    let defaultCategory = 'other';
    if (diaryTodoSubTab !== 'all') {
        defaultCategory = diaryTodoSubTab;
    }
    expandDiaryTodoForm(defaultCategory);
}

// 渲染待办分类标签页
function renderTodoSubTabs() {
    const container = document.querySelector('.diary-sub-tabs');
    if (!container) {
        console.log('[朝夕心记] 找不到 .diary-sub-tabs 容器');
        return;
    }
    console.log('[朝夕心记] 渲染分类标签页, 分类数量:', diaryTodoCategories.length);

    let html = `<button class="diary-sub-tab-btn" onclick="showTodoCategoryManager()" title="管理分类" style="background:var(--accent-color);color:#fff;"><i class="fas fa-plus"></i></button>`;
    html += `<button class="diary-sub-tab-btn ${diaryTodoSubTab === 'all' ? 'active' : ''}" data-subtab="all" onclick="switchTodoSubTab('all')">全部</button>`;

    diaryTodoCategories.forEach(cat => {
        html += `<button class="diary-sub-tab-btn ${diaryTodoSubTab === cat.id ? 'active' : ''}" data-subtab="${cat.id}" onclick="switchTodoSubTab('${cat.id}')">${cat.icon} ${cat.name}</button>`;
    });

    container.innerHTML = html;
}

// 更新表单中的分类下拉选择
function updateTodoCategorySelect() {
    const select = document.getElementById('diary-todo-category');
    if (!select) return;

    select.innerHTML = diaryTodoCategories.map(cat =>
        `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`
    ).join('');
}

// 显示分类管理弹窗
function showTodoCategoryManager() {
    console.log('[朝夕心记] 打开分类管理弹窗');
    const modal = document.getElementById('diary-modal');
    if (!modal) {
        console.log('[朝夕心记] 找不到 diary-modal');
        return;
    }

    let html = `
        <div style="margin-bottom:16px;">
            <h4 style="margin:0 0 12px;font-size:15px;">管理分类</h4>
            <div style="display:flex;gap:8px;margin-bottom:12px;">
                <input type="text" id="new-category-name" class="diary-input" placeholder="新分类名称" style="flex:1;">
                <input type="text" id="new-category-icon" class="diary-input" placeholder="图标" style="width:60px;text-align:center;" value="📁">
                <button class="modal-btn modal-btn-primary" onclick="addNewCategoryFromManager()">添加</button>
            </div>
        </div>
        <div style="max-height:200px;overflow-y:auto;">
    `;

    diaryTodoCategories.forEach(cat => {
        html += `
            <div style="display:flex;align-items:center;gap:8px;padding:8px;border-bottom:1px solid var(--border-color);">
                <span style="font-size:18px;">${cat.icon}</span>
                <input type="text" class="diary-input category-edit-name" data-id="${cat.id}" value="${cat.name}" style="flex:1;">
                <button class="diary-todo-delete" onclick="deleteTodoCategory('${cat.id}')" title="删除"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
    });

    html += `</div>`;

    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.id = 'todo-category-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:2000;';
    overlay.onclick = closeTodoCategoryManager;

    // 创建弹窗
    const managerDiv = document.createElement('div');
    managerDiv.id = 'todo-category-manager';
    managerDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--secondary-bg);padding:20px;border-radius:12px;z-index:2001;min-width:300px;max-width:90vw;box-shadow:0 10px 40px rgba(0,0,0,0.5);';
    managerDiv.innerHTML = html + `<div style="margin-top:16px;text-align:right;"><button class="modal-btn modal-btn-secondary" onclick="closeTodoCategoryManager()">关闭</button></div>`;

    document.body.appendChild(overlay);
    document.body.appendChild(managerDiv);
}

function closeTodoCategoryManager() {
    const manager = document.getElementById('todo-category-manager');
    const overlay = document.getElementById('todo-category-overlay');
    if (manager) manager.remove();
    if (overlay) overlay.remove();
}

function addNewCategoryFromManager() {
    console.log('[朝夕心记] 点击添加分类按钮');
    const nameInput = document.getElementById('new-category-name');
    const iconInput = document.getElementById('new-category-icon');
    if (!nameInput) {
        console.log('[朝夕心记] 找不到 new-category-name 输入框');
        return;
    }

    const name = nameInput.value.trim();
    const icon = iconInput ? iconInput.value.trim() : '📁';
    console.log('[朝夕心记] 准备添加分类:', name, icon);

    const result = addTodoCategory(name, icon);
    if (result) {
        nameInput.value = '';
        closeTodoCategoryManager();
        showTodoCategoryManager();
    } else {
        console.log('[朝夕心记] 添加分类失败');
    }
}

/* ================================================================
   一、待办事项
   ================================================================ */
function renderDiaryTodos() {
    const container = document.getElementById('diary-todo-list');
    if (!container) return;

    // 按分类过滤
    let filteredTodos = diaryTodos;
    if (diaryTodoSubTab !== 'all') {
        filteredTodos = diaryTodos.filter(t => (t.category || 'other') === diaryTodoSubTab);
    }

    const pending = filteredTodos.filter(t => !t.done);
    const done = filteredTodos.filter(t => t.done);

    const categoryLabel = diaryTodoSubTab !== 'all' ? `「${getCategoryName(diaryTodoSubTab)}」分类` : '';

    if (diaryTodos.length === 0) {
        container.innerHTML = `
            <div class="diary-empty">
                <i class="fas fa-clipboard-check" style="font-size:36px;margin-bottom:10px;opacity:0.3;"></i>
                <p>还没有待办事项</p>
                <p style="font-size:12px;opacity:0.5;margin-top:4px;">点击底部按钮添加你的第一个待办</p>
            </div>`;
        return;
    }

    if (filteredTodos.length === 0) {
        container.innerHTML = `
            <div class="diary-empty">
                <i class="fas fa-inbox" style="font-size:36px;margin-bottom:10px;opacity:0.3;"></i>
                <p>${categoryLabel}没有待办事项</p>
                <p style="font-size:12px;opacity:0.5;margin-top:4px;">切换到其他分类看看吧</p>
            </div>`;
        return;
    }

    let html = '';

    if (pending.length > 0) {
        html += `<div class="diary-section-label"><i class="fas fa-clock"></i> 待完成 (${pending.length})</div>`;
        pending.forEach(todo => {
            html += renderDiaryTodoItem(todo);
        });
    }

    if (done.length > 0) {
        html += `<div class="diary-section-label" style="margin-top:16px;"><i class="fas fa-check-circle"></i> 已完成 (${done.length})</div>`;
        done.forEach(todo => {
            html += renderDiaryTodoItem(todo);
        });
    }

    container.innerHTML = html;

    // 绑定事件
    container.querySelectorAll('.diary-todo-check').forEach(btn => {
        btn.addEventListener('click', () => toggleDiaryTodo(Number(btn.dataset.id)));
    });
    container.querySelectorAll('.diary-todo-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteDiaryTodo(Number(btn.dataset.id)));
    });
}

// 获取分类名称
function getCategoryName(categoryId) {
    const cat = diaryTodoCategories.find(c => c.id === categoryId);
    return cat ? cat.name : '其他';
}

// 获取分类显示（图标+名称）
function getCategoryLabel(categoryId) {
    const cat = diaryTodoCategories.find(c => c.id === categoryId);
    return cat ? `${cat.icon} ${cat.name}` : '📌 其他';
}

function renderDiaryTodoItem(todo) {
    const priorityColors = { high: '#ff6b6b', medium: '#ffa502', low: '#6bcb77' };
    const priorityLabels = { high: '紧急', medium: '一般', low: '轻松' };
    const repeatLabels = { none: '仅一次', daily: '每天', weekly: '每周', monthly: '每月' };
    const color = priorityColors[todo.priority] || priorityColors.medium;
    const doneClass = todo.done ? 'done' : '';
    const category = todo.category || 'other';
    const categoryObj = diaryTodoCategories.find(c => c.id === category);
    const categoryColor = categoryObj ? categoryObj.color : '#95a5a6';
    const categoryBgColor = categoryColor + '26'; // 15% 透明度

    // 格式化截止时间显示
    let dueDisplay = '';
    if (todo.dueDate) {
        const due = new Date(todo.dueDate);
        const now = new Date();
        const isOverdue = due < now && !todo.done;
        const dateStr = due.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
        const timeStr = due.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        dueDisplay = `<span class="diary-todo-due" style="${isOverdue ? 'color:#ff6b6b;' : ''}"><i class="fas fa-calendar-day"></i> ${dateStr} ${timeStr}${isOverdue ? ' (已逾期)' : ''}</span>`;
    }

    // 提醒标签
    let reminderDisplay = '';
    if (todo.reminder && todo.reminder.time && !todo.done) {
        const repeatLabel = repeatLabels[todo.reminder.repeat] || '';
        reminderDisplay = `<span class="diary-todo-reminder-tag"><i class="fas fa-bell"></i> ${repeatLabel}</span>`;
    }

    return `
        <div class="diary-todo-item ${doneClass}" data-id="${todo.id}">
            <div class="diary-todo-check" data-id="${todo.id}" title="${todo.done ? '取消完成' : '标记完成'}">
                ${todo.done ? '<i class="fas fa-check"></i>' : ''}
            </div>
            <div class="diary-todo-content" onclick="showEditTodoModal(${todo.id})">
                <div class="diary-todo-text ${doneClass}">${diaryEscHtml(todo.text)}</div>
                <div class="diary-todo-meta">
                    <span class="diary-todo-category" style="background:${categoryBgColor};color:${categoryColor};">${getCategoryLabel(category)}</span>
                    <span class="diary-todo-priority" style="color:${color};">${priorityLabels[todo.priority] || '一般'}</span>
                    ${dueDisplay}
                    ${reminderDisplay}
                </div>
            </div>
            <div class="diary-todo-actions">
                <div class="diary-todo-edit" data-id="${todo.id}" title="编辑" onclick="event.stopPropagation();showEditTodoModal(${todo.id})">
                    <i class="fas fa-pen"></i>
                </div>
                <div class="diary-todo-delete" data-id="${todo.id}" title="删除">
                    <i class="fas fa-trash-alt"></i>
                </div>
            </div>
        </div>`;
}

function addDiaryTodo() {
    const textInput = document.getElementById('diary-todo-input');
    const prioritySelect = document.getElementById('diary-todo-priority');
    const categorySelect = document.getElementById('diary-todo-category');
    const dueDateInput = document.getElementById('diary-todo-due');
    const reminderEnabled = document.getElementById('diary-todo-reminder-enabled');
    const reminderTime = document.getElementById('diary-todo-reminder-time');
    const reminderRepeat = document.getElementById('diary-todo-reminder-repeat');

    const text = textInput ? textInput.value.trim() : '';
    if (!text) {
        showNotification('请输入待办内容', 'warning');
        return;
    }

    const isReminderOn = reminderEnabled && reminderEnabled.checked;
    if (isReminderOn && (!reminderTime || !reminderTime.value)) {
        showNotification('请设置提醒时间', 'warning');
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        done: false,
        priority: prioritySelect ? prioritySelect.value : 'medium',
        category: categorySelect ? categorySelect.value : 'other',
        dueDate: dueDateInput ? dueDateInput.value : '',
        createdAt: diaryTodayStr(),
        reminder: isReminderOn ? {
            time: reminderTime ? reminderTime.value : '',
            repeat: reminderRepeat ? reminderRepeat.value : 'none',
            lastTriggered: ''
        } : null
    };

    diaryTodos.unshift(todo);
    saveDiaryTodos();
    renderDiaryTodos();

    // 重置表单并收起
    if (textInput) textInput.value = '';
    if (dueDateInput) dueDateInput.value = '';
    collapseDiaryTodoForm();
    showNotification('待办已添加', 'success');
}

// 展开创建表单（隐藏列表，显示表单）
function expandDiaryTodoForm(defaultCategory = 'other') {
    const list = document.getElementById('diary-todo-list');
    const compose = document.getElementById('diary-todo-compose');
    if (list) list.style.display = 'none';
    if (compose) compose.style.display = 'flex';
    // 重置表单
    const input = document.getElementById('diary-todo-input');
    const due = document.getElementById('diary-todo-due');
    const category = document.getElementById('diary-todo-category');
    const priority = document.getElementById('diary-todo-priority');
    const reminderEnabled = document.getElementById('diary-todo-reminder-enabled');
    const reminderTime = document.getElementById('diary-todo-reminder-time');
    const reminderRepeat = document.getElementById('diary-todo-reminder-repeat');
    const reminderOptions = document.getElementById('diary-todo-reminder-options');
    if (input) input.value = '';
    if (due) due.value = '';
    if (category) category.value = defaultCategory; // 使用传入的默认分类
    if (priority) priority.value = 'medium';
    if (reminderEnabled) reminderEnabled.checked = false;
    if (reminderTime) reminderTime.value = '';
    if (reminderRepeat) reminderRepeat.value = 'none';
    if (reminderOptions) reminderOptions.style.display = 'none';
    // 聚焦到输入框
    setTimeout(() => { if (input) input.focus(); }, 100);
}

// 收起创建表单（显示列表，隐藏表单）
function collapseDiaryTodoForm() {
    const list = document.getElementById('diary-todo-list');
    const compose = document.getElementById('diary-todo-compose');
    if (compose) compose.style.display = 'none';
    if (list) list.style.display = 'block';
}

// 展开习惯创建表单（隐藏列表，显示表单）
function expandDiaryHabitForm() {
    const list = document.getElementById('diary-habit-list');
    const compose = document.getElementById('diary-habit-compose');
    if (list) list.style.display = 'none';
    if (compose) compose.style.display = 'flex';
    // 重置表单
    const input = document.getElementById('diary-habit-name-input');
    const reminderEnabled = document.getElementById('diary-habit-reminder-enabled');
    const reminderTime = document.getElementById('diary-habit-reminder-time');
    const reminderRepeat = document.getElementById('diary-habit-reminder-repeat');
    const reminderOptions = document.getElementById('diary-habit-reminder-options');
    if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 100);
    }
    if (reminderEnabled) reminderEnabled.checked = false;
    if (reminderTime) reminderTime.value = '';
    if (reminderRepeat) reminderRepeat.value = 'daily';
    if (reminderOptions) reminderOptions.style.display = 'none';
}

// 收起习惯创建表单（显示列表，隐藏表单）
function collapseDiaryHabitForm() {
    const list = document.getElementById('diary-habit-list');
    const compose = document.getElementById('diary-habit-compose');
    if (compose) compose.style.display = 'none';
    if (list) list.style.display = 'block';
}

function toggleDiaryTodo(id) {
    const todo = diaryTodos.find(t => t.id === id);
    if (todo) {
        todo.done = !todo.done;
        saveDiaryTodos();
        renderDiaryTodos();
    }
}

function deleteDiaryTodo(id) {
    diaryTodos = diaryTodos.filter(t => t.id !== id);
    saveDiaryTodos();
    renderDiaryTodos();
    showNotification('待办已删除', 'info');
}

// 显示编辑待办弹窗
function showEditTodoModal(todoId) {
    const todo = diaryTodos.find(t => t.id === todoId);
    if (!todo) return;

    const categoryObj = diaryTodoCategories.find(c => c.id === (todo.category || 'other'));
    const categoryIcon = categoryObj ? categoryObj.icon : '📌';

    // 创建编辑弹窗
    const modal = document.createElement('div');
    modal.id = 'edit-todo-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:3000;display:flex;align-items:center;justify-content:center;';

    const dueDateValue = todo.dueDate ? new Date(todo.dueDate).toISOString().slice(0, 16) : '';
    const hasReminder = todo.reminder && todo.reminder.time;
    const reminderTimeValue = hasReminder ? new Date(todo.reminder.time).toISOString().slice(0, 16) : '';

    modal.innerHTML = `
        <div style="background:var(--secondary-bg);border-radius:20px;padding:24px;width:90%;max-width:400px;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
            <div style="text-align:center;margin-bottom:20px;">
                <div style="font-size:32px;margin-bottom:8px;">${categoryIcon}</div>
                <h3 style="margin:0;font-size:18px;color:var(--text-primary);">编辑待办</h3>
            </div>
            <div style="margin-bottom:16px;">
                <label style="display:block;font-size:12px;color:var(--text-secondary);margin-bottom:6px;">待办内容</label>
                <input type="text" id="edit-todo-text" class="diary-input" value="${diaryEscHtml(todo.text)}" style="width:100%;box-sizing:border-box;">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
                <div>
                    <label style="display:block;font-size:12px;color:var(--text-secondary);margin-bottom:6px;">分类</label>
                    <select id="edit-todo-category" class="diary-input" style="width:100%;box-sizing:border-box;">
                        ${diaryTodoCategories.map(c => `<option value="${c.id}" ${c.id === (todo.category || 'other') ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label style="display:block;font-size:12px;color:var(--text-secondary);margin-bottom:6px;">紧急程度</label>
                    <select id="edit-todo-priority" class="diary-input" style="width:100%;box-sizing:border-box;">
                        <option value="high" ${todo.priority === 'high' ? 'selected' : ''}>🔴 紧急</option>
                        <option value="medium" ${todo.priority === 'medium' ? 'selected' : ''}>🟡 一般</option>
                        <option value="low" ${todo.priority === 'low' ? 'selected' : ''}>🟢 轻松</option>
                    </select>
                </div>
            </div>
            <div style="margin-bottom:16px;">
                <label style="display:block;font-size:12px;color:var(--text-secondary);margin-bottom:6px;">截止时间</label>
                <input type="datetime-local" id="edit-todo-due" class="diary-input" value="${dueDateValue}" style="width:100%;box-sizing:border-box;">
            </div>
            <div style="margin-bottom:20px;">
                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                    <input type="checkbox" id="edit-todo-reminder-enabled" ${hasReminder ? 'checked' : ''}>
                    <span style="font-size:13px;color:var(--text-primary);">设置提醒</span>
                </label>
                <div id="edit-todo-reminder-options" style="margin-top:12px;display:${hasReminder ? 'block' : 'none'};">
                    <input type="datetime-local" id="edit-todo-reminder-time" class="diary-input" value="${reminderTimeValue}" style="width:100%;box-sizing:border-box;margin-bottom:8px;">
                    <select id="edit-todo-reminder-repeat" class="diary-input" style="width:100%;box-sizing:border-box;">
                        <option value="none" ${!hasReminder || todo.reminder.repeat === 'none' ? 'selected' : ''}>不重复（仅一次）</option>
                        <option value="daily" ${hasReminder && todo.reminder.repeat === 'daily' ? 'selected' : ''}>每天重复</option>
                        <option value="weekly" ${hasReminder && todo.reminder.repeat === 'weekly' ? 'selected' : ''}>每周重复</option>
                        <option value="monthly" ${hasReminder && todo.reminder.repeat === 'monthly' ? 'selected' : ''}>每月重复</option>
                    </select>
                </div>
            </div>
            <div style="display:flex;gap:10px;">
                <button class="modal-btn modal-btn-secondary" onclick="closeEditTodoModal()" style="flex:1;">取消</button>
                <button class="modal-btn modal-btn-primary" onclick="saveEditTodo(${todoId})" style="flex:1;">保存</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // 提醒开关事件
    const reminderCheckbox = document.getElementById('edit-todo-reminder-enabled');
    const reminderOptions = document.getElementById('edit-todo-reminder-options');
    if (reminderCheckbox && reminderOptions) {
        reminderCheckbox.addEventListener('change', () => {
            reminderOptions.style.display = reminderCheckbox.checked ? 'block' : 'none';
        });
    }
}

function closeEditTodoModal() {
    const modal = document.getElementById('edit-todo-modal');
    if (modal) modal.remove();
}

function saveEditTodo(todoId) {
    const todo = diaryTodos.find(t => t.id === todoId);
    if (!todo) return;

    const textInput = document.getElementById('edit-todo-text');
    const categorySelect = document.getElementById('edit-todo-category');
    const prioritySelect = document.getElementById('edit-todo-priority');
    const dueInput = document.getElementById('edit-todo-due');
    const reminderEnabled = document.getElementById('edit-todo-reminder-enabled');
    const reminderTime = document.getElementById('edit-todo-reminder-time');
    const reminderRepeat = document.getElementById('edit-todo-reminder-repeat');

    const text = textInput ? textInput.value.trim() : '';
    if (!text) {
        showNotification('请输入待办内容', 'warning');
        return;
    }

    todo.text = text;
    todo.category = categorySelect ? categorySelect.value : 'other';
    todo.priority = prioritySelect ? prioritySelect.value : 'medium';
    todo.dueDate = dueInput ? dueInput.value : null;

    if (reminderEnabled && reminderEnabled.checked && reminderTime && reminderTime.value) {
        todo.reminder = {
            time: reminderTime.value,
            repeat: reminderRepeat ? reminderRepeat.value : 'none'
        };
    } else {
        todo.reminder = null;
    }

    saveDiaryTodos();
    renderDiaryTodos();
    closeEditTodoModal();
    showNotification('待办已更新', 'success');
}

/* ================================================================
   二、习惯打卡
   ================================================================ */
function renderDiaryHabits() {
    const container = document.getElementById('diary-habit-list');
    if (!container) return;

    if (diaryHabits.length === 0) {
        container.innerHTML = `
            <div class="diary-empty">
                <i class="fas fa-fire" style="font-size:36px;margin-bottom:10px;opacity:0.3;"></i>
                <p>还没有习惯</p>
                <p style="font-size:12px;opacity:0.5;margin-top:4px;">添加你想养成的习惯，每天打卡追踪</p>
            </div>`;
        return;
    }

    const today = diaryTodayStr();
    let html = '';

    diaryHabits.forEach(habit => {
        const todayRecord = diaryHabitRecords[today] && diaryHabitRecords[today][habit.id];
        const streak = calcHabitStreak(habit.id);
        const icon = habit.icon || 'fas fa-star';
        const color = habit.color || 'var(--accent-color)';

        html += `
            <div class="diary-habit-item">
                <div class="diary-habit-info">
                    <div class="diary-habit-icon" style="background:${color}20;color:${color};">
                        <i class="${icon}"></i>
                    </div>
                    <div class="diary-habit-detail">
                        <div class="diary-habit-name">${diaryEscHtml(habit.name)}</div>
                        <div class="diary-habit-streak">
                            <i class="fas fa-fire" style="color:#ff6b6b;"></i> 连续 ${streak} 天
                        </div>
                    </div>
                </div>
                <div class="diary-habit-actions">
                    <div class="diary-habit-check ${todayRecord ? 'checked' : ''}" 
                         data-habit-id="${habit.id}" title="${todayRecord ? '已打卡' : '点击打卡'}">
                        ${todayRecord ? '<i class="fas fa-check"></i>' : '<i class="far fa-circle"></i>'}
                    </div>
                    <div class="diary-habit-delete" data-habit-id="${habit.id}" title="删除习惯">
                        <i class="fas fa-times"></i>
                    </div>
                </div>
            </div>`;
    });

    container.innerHTML = html;

    // 绑定事件
    container.querySelectorAll('.diary-habit-check').forEach(btn => {
        btn.addEventListener('click', () => toggleHabitCheck(btn.dataset.habitId));
    });
    container.querySelectorAll('.diary-habit-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteDiaryHabit(btn.dataset.habitId));
    });
}

function calcHabitStreak(habitId) {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = diaryFormatDate(d);
        if (diaryHabitRecords[dateStr] && diaryHabitRecords[dateStr][habitId]) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

function addDiaryHabit() {
    const nameInput = document.getElementById('diary-habit-name-input');
    const iconSelect = document.getElementById('diary-habit-icon-select');
    const colorSelect = document.getElementById('diary-habit-color-select');
    const reminderEnabled = document.getElementById('diary-habit-reminder-enabled');
    const reminderTime = document.getElementById('diary-habit-reminder-time');
    const reminderRepeat = document.getElementById('diary-habit-reminder-repeat');

    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
        showNotification('请输入习惯名称', 'warning');
        return;
    }

    const habit = {
        id: Date.now(),
        name: name,
        icon: iconSelect ? iconSelect.value : 'fas fa-star',
        color: colorSelect ? colorSelect.value : '#6bcb77',
        createdAt: diaryTodayStr()
    };

    // 添加提醒设置
    if (reminderEnabled && reminderEnabled.checked && reminderTime && reminderTime.value) {
        habit.reminder = {
            time: reminderTime.value,
            repeat: reminderRepeat ? reminderRepeat.value : 'daily'
        };
    }

    diaryHabits.push(habit);
    saveDiaryHabits();
    renderDiaryHabits();

    // 收起表单
    collapseDiaryHabitForm();
    showNotification('习惯已添加', 'success');
}

function toggleHabitCheck(habitId) {
    const today = diaryTodayStr();
    if (!diaryHabitRecords[today]) {
        diaryHabitRecords[today] = {};
    }

    if (diaryHabitRecords[today][habitId]) {
        delete diaryHabitRecords[today][habitId];
    } else {
        diaryHabitRecords[today][habitId] = true;
    }

    saveDiaryHabitRecords();
    renderDiaryHabits();
}

function deleteDiaryHabit(habitId) {
    diaryHabits = diaryHabits.filter(h => String(h.id) !== String(habitId));
    saveDiaryHabits();
    renderDiaryHabits();
    showNotification('习惯已删除', 'info');
}

/* ================================================================
   三、月经记录
   ================================================================ */
function renderDiaryPeriod() {
    const container = document.getElementById('diary-period-content');
    if (!container) return;

    const today = new Date();
    const todayStr = diaryTodayStr();

    // 初始化查看月份为当前月
    if (diaryPeriodViewYear === 0) {
        diaryPeriodViewYear = today.getFullYear();
        diaryPeriodViewMonth = today.getMonth();
    }

    // 计算周期信息
    const cycleInfo = calcPeriodCycleInfo();

    // 构建日期记录映射
    const recordMap = {};
    diaryPeriodRecords.forEach(r => {
        recordMap[r.date] = r;
    });

    // 计算所有实际经期日期（自动填充中间日期）
    let actualPeriodDates = new Set();
    if (diaryPeriodRecords.length > 0) {
        const sortedRecords = [...diaryPeriodRecords].sort((a, b) => a.date.localeCompare(b.date));
        let currentStart = null;
        let prevDate = null;
        for (let i = 0; i < sortedRecords.length; i++) {
            const currDate = new Date(sortedRecords[i].date);
            if (!currentStart) {
                currentStart = currDate;
                prevDate = currDate;
            } else {
                const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
                if (diffDays <= 3) {
                    prevDate = currDate;
                } else {
                    fillDateRange(actualPeriodDates, currentStart, prevDate);
                    currentStart = currDate;
                    prevDate = currDate;
                }
            }
        }
        if (currentStart) {
            fillDateRange(actualPeriodDates, currentStart, prevDate);
        }
    }

    // 获取上次经期开始日期和预测日期
    const lastPeriodStart = cycleInfo.lastPeriodStart;
    const avgCycle = cycleInfo.avgCycle;
    const avgDuration = cycleInfo.avgDuration;

    // 计算预测经期日期范围（预测未来12个月）
    let predictedDates = new Set();
    let predictedStartStr = null;
    // 排卵日集合
    let ovulationDates = new Set();
    // 排卵期集合（排卵日前后各5天）
    let ovulationPeriodDates = new Set();

    if (lastPeriodStart && avgCycle > 0) {
        const dur = avgDuration >= 5 ? avgDuration : 5;
        const startDate = new Date(lastPeriodStart);
        startDate.setDate(startDate.getDate() + avgCycle);
        predictedStartStr = formatDateStr(startDate);

        // 找出当月已有的经期记录
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentMonthRecords = diaryPeriodRecords
            .filter(r => {
                const d = new Date(r.date);
                return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
            })
            .map(r => r.date)
            .sort();

        // 预测未来12个月的经期
        const maxDate = new Date(now);
        maxDate.setMonth(maxDate.getMonth() + 12);

        // 当月有记录时，当月的预测就是当月的实际记录日期
        if (currentMonthRecords.length > 0) {
            // 当月已记录的日期作为当月预测
            currentMonthRecords.forEach(dateStr => {
                predictedDates.add(dateStr);
            });

            // 计算当月排卵日（当月经期开始前14天）
            const currentMonthStart = new Date(currentMonthRecords[0]);
            const ovulationDay = new Date(currentMonthStart);
            ovulationDay.setDate(ovulationDay.getDate() - 14);
            ovulationDates.add(formatDateStr(ovulationDay));

            // 排卵期 = 排卵日前后各5天
            for (let j = -5; j <= 5; j++) {
                const od = new Date(ovulationDay);
                od.setDate(od.getDate() + j);
                ovulationPeriodDates.add(formatDateStr(od));
            }

            // 从下一次经期开始预测（跳过当月）
            let predictDate = new Date(startDate);
            // 如果预测开始日期在当月内，跳到下个周期
            if (predictDate.getFullYear() === currentYear && predictDate.getMonth() === currentMonth) {
                predictDate.setDate(predictDate.getDate() + avgCycle);
            }
            while (predictDate <= maxDate) {
                for (let i = 0; i < dur; i++) {
                    const d = new Date(predictDate);
                    d.setDate(d.getDate() + i);
                    predictedDates.add(formatDateStr(d));
                }
                const ovDay = new Date(predictDate);
                ovDay.setDate(ovDay.getDate() - 14);
                ovulationDates.add(formatDateStr(ovDay));
                for (let j = -5; j <= 5; j++) {
                    const od = new Date(ovDay);
                    od.setDate(od.getDate() + j);
                    ovulationPeriodDates.add(formatDateStr(od));
                }
                predictDate.setDate(predictDate.getDate() + avgCycle);
            }
        } else {
            // 当月无记录，使用原有逻辑
            let predictDate = new Date(startDate);
            while (predictDate <= maxDate) {
                for (let i = 0; i < dur; i++) {
                    const d = new Date(predictDate);
                    d.setDate(d.getDate() + i);
                    predictedDates.add(formatDateStr(d));
                }
                const ovulationDay = new Date(predictDate);
                ovulationDay.setDate(ovulationDay.getDate() - 14);
                ovulationDates.add(formatDateStr(ovulationDay));
                for (let j = -5; j <= 5; j++) {
                    const od = new Date(ovulationDay);
                    od.setDate(od.getDate() + j);
                    ovulationPeriodDates.add(formatDateStr(od));
                }
                predictDate.setDate(predictDate.getDate() + avgCycle);
            }
        }
    }

    // 计算推迟/提前天数
    let statusHtml = '';
    if (predictedStartStr) {
        const predictedDate = new Date(predictedStartStr);
        const diffDays = Math.floor((today - predictedDate) / (1000 * 60 * 60 * 24));
        if (diffDays > 0) {
            statusHtml = `
                <div class="diary-period-status">
                    <div class="diary-period-status-sub">比预测经期</div>
                    <div class="diary-period-status-main">推迟了 <span class="highlight-num">${diffDays}</span> 天</div>
                </div>`;
        } else if (diffDays < 0) {
            statusHtml = `
                <div class="diary-period-status">
                    <div class="diary-period-status-sub">距预测经期还有</div>
                    <div class="diary-period-status-main"><span class="highlight-num">${Math.abs(diffDays)}</span> 天</div>
                </div>`;
        } else {
            statusHtml = `
                <div class="diary-period-status">
                    <div class="diary-period-status-sub">预测经期</div>
                    <div class="diary-period-status-main">就是今天</div>
                </div>`;
        }
    }

    // 月份导航标题
    const monthTitle = `${diaryPeriodViewYear}年${diaryPeriodViewMonth + 1}月`;
    const navHtml = `
        <div class="diary-period-nav">
            <button class="diary-period-nav-btn" onclick="changePeriodMonth(-1)"><i class="fas fa-chevron-left"></i></button>
            <span class="diary-period-nav-title">${monthTitle}</span>
            <button class="diary-period-nav-btn" onclick="changePeriodMonth(1)"><i class="fas fa-chevron-right"></i></button>
        </div>`;

    // 日历网格
    const calendarHtml = buildPeriodMonthGrid(diaryPeriodViewYear, diaryPeriodViewMonth, todayStr, recordMap, actualPeriodDates, predictedDates, ovulationDates, ovulationPeriodDates, lastPeriodStart, predictedStartStr);

    container.innerHTML = statusHtml + navHtml + calendarHtml;

    // 初始化滑动事件
    setTimeout(initPeriodSwipeEvents, 50);
}

// 切换月份
function changePeriodMonth(delta) {
    diaryPeriodViewMonth += delta;
    if (diaryPeriodViewMonth > 11) {
        diaryPeriodViewMonth = 0;
        diaryPeriodViewYear++;
    } else if (diaryPeriodViewMonth < 0) {
        diaryPeriodViewMonth = 11;
        diaryPeriodViewYear--;
    }
    renderDiaryPeriod();
}

// 填充日期范围内的所有日期
function fillDateRange(dateSet, startDate, endDate) {
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
        dateSet.add(formatDateStr(current));
        current.setDate(current.getDate() + 1);
    }
}

// 长按滑动标记状态
let periodSwipeActive = false;
let periodSwipeTimer = null;
const PERIOD_SWIPE_DELAY = 500; // 长按触发时间(ms)

// 构建单月日历网格
function buildPeriodMonthGrid(year, month, todayStr, recordMap, lastPeriodDates, predictedDates, ovulationDates, ovulationPeriodDates, lastPeriodStart, predictedStart) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDow = firstDay.getDay();

    let gridHtml = '';
    // 空白填充
    for (let i = 0; i < startDow; i++) {
        gridHtml += '<div class="diary-period-cal-day empty"></div>';
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isToday = dateStr === todayStr;
        const isActual = lastPeriodDates.has(dateStr);
        const isPredicted = predictedDates.has(dateStr);
        const isOvulation = ovulationDates.has(dateStr);
        const isOvulationPeriod = ovulationPeriodDates.has(dateStr);

        let dayClass = 'diary-period-cal-day';
        if (isToday) {
            dayClass += ' period-today';
        }
        if (isActual) {
            dayClass += ' period-actual';
        } else if (isPredicted) {
            dayClass += ' period-predicted';
        } else if (isOvulationPeriod && !isActual) {
            dayClass += ' period-ovulation-period';
        }

        // 排卵日小花标记
        const flowerMark = isOvulation ? '<span class="period-ovulation-flower">🌸</span>' : '';

        gridHtml += `<div class="${dayClass}" data-date="${dateStr}" onclick="openPeriodRecordEditor('${dateStr}')">${d}${flowerMark}</div>`;
    }

    return `
        <div class="diary-period-month-block">
            <div class="diary-period-cal-grid" id="period-cal-grid-${year}-${month}">${gridHtml}</div>
        </div>`;
}

// 初始化滑动事件（在渲染后调用）
function initPeriodSwipeEvents() {
    const grid = document.querySelector('.diary-period-cal-grid');
    if (!grid) return;

    let isPressed = false;

    // 鼠标事件
    grid.addEventListener('mousedown', (e) => {
        const dayEl = e.target.closest('.diary-period-cal-day:not(.empty)');
        if (!dayEl) return;
        
        isPressed = true;
        periodSwipeTimer = setTimeout(() => {
            periodSwipeActive = true;
            markPeriodDate(dayEl.dataset.date);
        }, PERIOD_SWIPE_DELAY);
    });

    grid.addEventListener('mouseover', (e) => {
        const dayEl = e.target.closest('.diary-period-cal-day:not(.empty)');
        if (!dayEl || !periodSwipeActive) return;
        
        markPeriodDate(dayEl.dataset.date);
    });

    grid.addEventListener('mouseup', endPeriodSwipe);
    grid.addEventListener('mouseleave', endPeriodSwipe);

    // 触摸事件
    grid.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        const dayEl = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.diary-period-cal-day:not(.empty)');
        if (!dayEl) return;
        
        isPressed = true;
        periodSwipeTimer = setTimeout(() => {
            periodSwipeActive = true;
            markPeriodDate(dayEl.dataset.date);
        }, PERIOD_SWIPE_DELAY);
    }, { passive: true });

    grid.addEventListener('touchmove', (e) => {
        if (!periodSwipeActive) return;
        const touch = e.touches[0];
        const dayEl = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.diary-period-cal-day:not(.empty)');
        if (dayEl) {
            markPeriodDate(dayEl.dataset.date);
        }
    }, { passive: true });

    grid.addEventListener('touchend', endPeriodSwipe);
}

// 结束滑动
function endPeriodSwipe() {
    if (periodSwipeTimer) {
        clearTimeout(periodSwipeTimer);
        periodSwipeTimer = null;
    }
    if (periodSwipeActive) {
        periodSwipeActive = false;
        saveDiaryPeriodRecords();
        renderDiaryPeriod();
        // 重新绑定事件
        setTimeout(initPeriodSwipeEvents, 100);
    }
}

// 标记/取消日期为经期（切换）
function markPeriodDate(dateStr) {
    const existingIdx = diaryPeriodRecords.findIndex(r => r.date === dateStr);
    const dayEl = document.querySelector(`.diary-period-cal-day[data-date="${dateStr}"]`);
    
    if (existingIdx >= 0) {
        // 已存在，取消标记
        diaryPeriodRecords.splice(existingIdx, 1);
        if (dayEl) {
            dayEl.classList.remove('period-actual');
        }
    } else {
        // 不存在，添加标记
        diaryPeriodRecords.push({ date: dateStr, flow: 'medium', note: '' });
        if (dayEl) {
            dayEl.classList.add('period-actual');
            dayEl.classList.remove('period-predicted');
        }
    }
}

// 格式化日期为 YYYY-MM-DD
function formatDateStr(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function calcPeriodCycleInfo() {
    const sorted = [...diaryPeriodRecords].sort((a, b) => a.date.localeCompare(b.date));
    if (sorted.length < 2) {
        const lastStart = sorted.length > 0 ? sorted[sorted.length - 1].date : null;
        // 只有一条记录时，用默认28天周期
        return { avgCycle: 28, avgDuration: 5, nextPredicted: 0, lastPeriodStart: lastStart };
    }

    // 找出每次经期的开始日期
    const periodStarts = [];
    let currentStart = sorted[0].date;
    let prevDate = sorted[0].date;

    for (let i = 1; i < sorted.length; i++) {
        const curr = new Date(sorted[i].date);
        const prev = new Date(prevDate);
        const diffDays = Math.floor((curr - prev) / (1000 * 60 * 60 * 24));

        if (diffDays > 3) {
            periodStarts.push(currentStart);
            currentStart = sorted[i].date;
        }
        prevDate = sorted[i].date;
    }
    periodStarts.push(currentStart);

    // 计算平均周期
    let cycleDays = [];
    for (let i = 1; i < periodStarts.length; i++) {
        const d1 = new Date(periodStarts[i - 1]);
        const d2 = new Date(periodStarts[i]);
        cycleDays.push(Math.floor((d2 - d1) / (1000 * 60 * 60 * 24)));
    }
    const avgCycle = cycleDays.length > 0 ? Math.round(cycleDays.reduce((a, b) => a + b, 0) / cycleDays.length) : 28;

    // 计算平均经期天数
    let durations = [];
    for (let i = 0; i < periodStarts.length; i++) {
        const start = periodStarts[i];
        const end = (i < periodStarts.length - 1) ? periodStarts[i + 1] : diaryTodayStr();
        const records = diaryPeriodRecords.filter(r => r.date >= start && r.date < end);
        if (records.length > 0) {
            const firstDate = new Date(records[0].date);
            const lastDate = new Date(records[records.length - 1].date);
            durations.push(Math.floor((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1);
        }
    }
    const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 5;

    // 预测下次
    const lastStart = periodStarts[periodStarts.length - 1];
    let nextPredicted = 0;
    if (avgCycle > 0 && lastStart) {
        const lastDate = new Date(lastStart);
        const predicted = new Date(lastDate);
        predicted.setDate(predicted.getDate() + avgCycle);
        nextPredicted = Math.max(0, Math.ceil((predicted - new Date()) / (1000 * 60 * 60 * 24)));
    }

    return { avgCycle, avgDuration, nextPredicted, lastPeriodStart: lastStart };
}

function openPeriodRecordEditor(dateStr) {
    const existing = diaryPeriodRecords.find(r => r.date === dateStr);

    const overlay = document.createElement('div');
    overlay.className = 'diary-period-editor-overlay';
    overlay.innerHTML = `
        <div class="diary-period-editor-card" style="text-align:center;">
            <div class="diary-period-editor-title">${dateStr}</div>
            <div style="margin:20px 0;font-size:14px;color:var(--text-secondary);">
                ${existing ? '这天已记录经期' : '标记这天为经期？'}
            </div>
            <div style="display:flex;gap:8px;justify-content:center;">
                ${existing ? `<button class="modal-btn modal-btn-secondary" id="diary-period-remove" style="color:#ff6b6b;border-color:rgba(255,107,107,0.4);">取消记录</button>` : ''}
                <button class="modal-btn modal-btn-secondary" id="diary-period-cancel">关闭</button>
                ${!existing ? `<button class="modal-btn modal-btn-primary" id="diary-period-save">确认</button>` : ''}
            </div>
        </div>`;

    document.body.appendChild(overlay);

    overlay.querySelector('#diary-period-cancel')?.addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    const saveBtn = overlay.querySelector('#diary-period-save');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const record = { date: dateStr, flow: 'medium', note: '' };
            diaryPeriodRecords.push(record);
            saveDiaryPeriodRecords();
            renderDiaryPeriod();
            overlay.remove();
            showNotification('已记录', 'success');
        });
    }

    const removeBtn = overlay.querySelector('#diary-period-remove');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            diaryPeriodRecords = diaryPeriodRecords.filter(r => r.date !== dateStr);
            saveDiaryPeriodRecords();
            renderDiaryPeriod();
            overlay.remove();
            showNotification('已取消记录', 'info');
        });
    }
}

/* ================================================================
   四、纪念日
   ================================================================ */
function renderDiaryAnniversaries() {
    const container = document.getElementById('diary-anniversary-list');
    if (!container) return;

    if (diaryAnniversaries.length === 0) {
        container.innerHTML = `
            <div class="diary-empty">
                <i class="fas fa-heart" style="font-size:36px;margin-bottom:10px;opacity:0.3;"></i>
                <p>还没有纪念日</p>
                <p style="font-size:12px;opacity:0.5;margin-top:4px;">记录重要的日子，不错过每个纪念</p>
            </div>`;
        return;
    }

    const now = new Date();
    let html = '';

    diaryAnniversaries.forEach(ann => {
        const startDate = new Date(ann.date);
        let diffDays;

        if (ann.type === 'countdown') {
            diffDays = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
            if (diffDays < 0) diffDays = 0;
        } else {
            diffDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        }

        const typeClass = ann.type === 'countdown' ? 'type-countdown' : 'type-anniversary';
        const tagText = ann.type === 'countdown' ? '倒数' : '纪念';
        const tagColor = ann.type === 'countdown' ? '#4d96ff' : '#ff6b6b';
        const unitText = ann.type === 'countdown' ? '天后' : '天';

        html += `
            <div class="diary-anniversary-item ${typeClass}" data-id="${ann.id}">
                <div class="diary-ann-info">
                    <div class="diary-ann-name">
                        ${diaryEscHtml(ann.name)}
                        <span class="diary-ann-tag" style="background:${tagColor}20;color:${tagColor};">${tagText}</span>
                    </div>
                    <div class="diary-ann-date">${startDate.toLocaleDateString()}</div>
                </div>
                <div class="diary-ann-days">
                    <span class="diary-ann-number">${diffDays}</span>
                    <span class="diary-ann-unit">${unitText}</span>
                </div>
                <div class="diary-ann-delete" data-id="${ann.id}" title="删除">
                    <i class="fas fa-times"></i>
                </div>
            </div>`;
    });

    container.innerHTML = html;

    container.querySelectorAll('.diary-ann-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteDiaryAnniversary(Number(btn.dataset.id)));
    });
}

function addDiaryAnniversary() {
    const nameInput = document.getElementById('diary-ann-name-input');
    const dateInput = document.getElementById('diary-ann-date-input');
    const typeSelect = document.getElementById('diary-ann-type-select');

    const name = nameInput ? nameInput.value.trim() : '';
    const date = dateInput ? dateInput.value : '';

    if (!name || !date) {
        showNotification('请填写名称和日期', 'warning');
        return;
    }

    const anniversary = {
        id: Date.now(),
        name: name,
        date: date,
        type: typeSelect ? typeSelect.value : 'anniversary'
    };

    diaryAnniversaries.push(anniversary);
    saveDiaryAnniversaries();
    renderDiaryAnniversaries();

    if (nameInput) nameInput.value = '';
    if (dateInput) dateInput.value = '';
    showNotification('纪念日已添加', 'success');
}

function deleteDiaryAnniversary(id) {
    diaryAnniversaries = diaryAnniversaries.filter(a => a.id !== id);
    saveDiaryAnniversaries();
    renderDiaryAnniversaries();
    showNotification('纪念日已删除', 'info');
}

/* ========== 事件监听初始化 ========== */
function initDiaryListeners() {
    // 高级功能中的入口按钮
    const entryBtn = document.getElementById('diary-function');
    if (entryBtn && !entryBtn.dataset.initialized) {
        entryBtn.dataset.initialized = 'true';
        const newBtn = entryBtn.cloneNode(true);
        entryBtn.parentNode.replaceChild(newBtn, entryBtn);
        newBtn.addEventListener('click', () => {
            hideModal(document.getElementById('advanced-modal'));
            openDiaryModal();
        });
    }

    // 标签页切换
    document.querySelectorAll('.diary-tab-btn').forEach(btn => {
        if (!btn.dataset.bound) {
            btn.dataset.bound = 'true';
            btn.addEventListener('click', () => switchDiaryTab(btn.dataset.tab));
        }
    });

    // 返回按钮
    const backBtn = document.getElementById('back-diary');
    if (backBtn && !backBtn.dataset.bound) {
        backBtn.dataset.bound = 'true';
        backBtn.addEventListener('click', () => {
            hideModal(document.getElementById('diary-modal'));
            showModal(document.getElementById('advanced-modal'));
        });
    }

    // 待办事项 - 保存按钮
    const saveTodoBtn = document.getElementById('diary-todo-save-btn');
    if (saveTodoBtn && !saveTodoBtn.dataset.bound) {
        saveTodoBtn.dataset.bound = 'true';
        saveTodoBtn.addEventListener('click', addDiaryTodo);
    }

    // 待办事项 - 取消按钮
    const cancelTodoBtn = document.getElementById('diary-todo-cancel-btn');
    if (cancelTodoBtn && !cancelTodoBtn.dataset.bound) {
        cancelTodoBtn.dataset.bound = 'true';
        cancelTodoBtn.addEventListener('click', collapseDiaryTodoForm);
    }

    // 待办事项 - 提醒开关
    const reminderEnabled = document.getElementById('diary-todo-reminder-enabled');
    const reminderOptions = document.getElementById('diary-todo-reminder-options');
    if (reminderEnabled && !reminderEnabled.dataset.bound) {
        reminderEnabled.dataset.bound = 'true';
        reminderEnabled.addEventListener('change', () => {
            if (reminderOptions) {
                reminderOptions.style.display = reminderEnabled.checked ? 'block' : 'none';
            }
        });
    }

    // 习惯 - 保存按钮
    const saveHabitBtn = document.getElementById('diary-habit-save-btn');
    if (saveHabitBtn && !saveHabitBtn.dataset.bound) {
        saveHabitBtn.dataset.bound = 'true';
        saveHabitBtn.addEventListener('click', addDiaryHabit);
    }

    // 习惯 - 取消按钮
    const cancelHabitBtn = document.getElementById('diary-habit-cancel-btn');
    if (cancelHabitBtn && !cancelHabitBtn.dataset.bound) {
        cancelHabitBtn.dataset.bound = 'true';
        cancelHabitBtn.addEventListener('click', collapseDiaryHabitForm);
    }

    // 习惯 - 提醒开关
    const habitReminderEnabled = document.getElementById('diary-habit-reminder-enabled');
    const habitReminderOptions = document.getElementById('diary-habit-reminder-options');
    if (habitReminderEnabled && !habitReminderEnabled.dataset.bound) {
        habitReminderEnabled.dataset.bound = 'true';
        habitReminderEnabled.addEventListener('change', () => {
            if (habitReminderOptions) {
                habitReminderOptions.style.display = habitReminderEnabled.checked ? 'block' : 'none';
            }
        });
    }

    // 纪念日 - 添加按钮
    const addAnnBtn = document.getElementById('diary-ann-add-btn');
    if (addAnnBtn && !addAnnBtn.dataset.bound) {
        addAnnBtn.dataset.bound = 'true';
        addAnnBtn.addEventListener('click', addDiaryAnniversary);
    }

    // 待办输入框回车
    const todoInput = document.getElementById('diary-todo-input');
    if (todoInput && !todoInput.dataset.bound) {
        todoInput.dataset.bound = 'true';
        todoInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') addDiaryTodo();
        });
    }

    // 习惯输入框回车
    const habitInput = document.getElementById('diary-habit-name-input');
    if (habitInput && !habitInput.dataset.bound) {
        habitInput.dataset.bound = 'true';
        habitInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') addDiaryHabit();
        });
    }
}

/* ================================================================
   五、待办提醒
   ================================================================ */
let diaryReminderTimer = null;

// 启动提醒检查定时器
function startDiaryReminderChecker() {
    if (diaryReminderTimer) clearInterval(diaryReminderTimer);
    // 每30秒检查一次
    diaryReminderTimer = setInterval(checkDiaryReminders, 30000);
    // 启动时立即检查一次
    checkDiaryReminders();
    // 检查经期提醒
    checkPeriodReminder();
}

// ========== 经期提醒弹窗 ==========
const periodCareQuotes = [
    "记得多喝温水，照顾好自己哦~",
    "这几天别太累了，早点休息吧~",
    "红糖姜茶暖暖的，喝一杯吧~",
    "小肚子不舒服的话，用暖水袋敷一敷~",
    "少吃生冷食物，对自己好一点~",
    "这几天心情不好也没关系，抱抱你~",
    "记得带好必备物品，出门别忘啦~",
    "适当运动一下，散散步会舒服些~",
    "甜食可以吃一点，让自己开心~",
    "你的身体很棒，正常现象不用紧张~",
    "这几天就当给自己放个小假吧~",
    "注意保暖，别着凉了哦~",
    "多穿点衣服，别贪凉~",
    "放松心情，听听喜欢的音乐~",
    "一切都会好起来的，梦角一直陪着你~",
];

// 检查经期提醒
function checkPeriodReminder() {
    if (!diaryPeriodRecords || diaryPeriodRecords.length === 0) return;

    // 检查今天是否已经弹过提醒
    const todayStr = diaryTodayStr();
    const lastReminderDate = localStorage.getItem('diaryPeriodLastReminderDate');
    if (lastReminderDate === todayStr) {
        console.log('[朝夕心记] 今天已经弹过经期提醒了');
        return;
    }

    const cycleInfo = calcPeriodCycleInfo();
    const lastPeriodStart = cycleInfo.lastPeriodStart;
    const avgCycle = cycleInfo.avgCycle;

    if (!lastPeriodStart || avgCycle <= 0) return;

    const today = new Date();

    // 检查今天是否已经是经期
    const todayIsPeriod = diaryPeriodRecords.some(r => r.date === todayStr);

    // 计算下次经期开始日期
    const nextPeriodDate = new Date(lastPeriodStart);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + avgCycle);

    const diffMs = nextPeriodDate.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    console.log('[朝夕心记] 经期提醒检查: 今天=' + todayStr + ', 下次经期=' + formatDateStr(nextPeriodDate) + ', 距离=' + diffDays + '天, 今天是经期=' + todayIsPeriod);

    let shouldShowReminder = false;
    let reminderTitle = '';

    // 经期当天
    if (todayIsPeriod) {
        // 检查今天是否是经期第一天（前一天不是经期）
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = formatDateStr(yesterday);
        const yesterdayIsPeriod = diaryPeriodRecords.some(r => r.date === yesterdayStr);

        if (!yesterdayIsPeriod) {
            shouldShowReminder = true;
            reminderTitle = '今天是经期第一天';
        }
    }
    // 经期前3天提醒（包括今天就是预测经期当天的情况）
    else if (diffDays >= 0 && diffDays <= 3) {
        shouldShowReminder = true;
        if (diffDays === 0) {
            reminderTitle = '今天可能是经期第一天';
        } else {
            reminderTitle = `还有 ${diffDays} 天开始经期`;
        }
    }
    // 如果下次经期已过但还没记录，也提醒
    else if (diffDays < 0 && diffDays >= -3) {
        shouldShowReminder = true;
        reminderTitle = '经期可能已经来了，记得记录哦';
    }

    if (shouldShowReminder) {
        showPeriodReminderNotification(reminderTitle, reminderTitle === '今天是经期第一天');
        // 记录今天已经弹过提醒
        localStorage.setItem('diaryPeriodLastReminderDate', todayStr);
    }
}

// 显示经期提醒弹窗
function showPeriodReminderNotification(title, isFirstDay) {
    // 获取昵称
    const partnerName = (typeof settings !== 'undefined' && settings.partnerName) || '梦角';
    const myName = (typeof settings !== 'undefined' && settings.myName) || '我';

    // 随机语录
    const quote = periodCareQuotes[Math.floor(Math.random() * periodCareQuotes.length)];

    // 移除已有的提醒
    const existing = document.querySelector('.period-reminder-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'period-reminder-notification';
    notification.innerHTML = `
        <div class="period-reminder-icon">🌸</div>
        <div class="period-reminder-title">${title}</div>
        <div class="period-reminder-hint">
            <span class="period-reminder-partner">${partnerName}</span>
            <span> 提醒 </span>
            <span class="period-reminder-me">${myName}</span>
            <span>：</span>
        </div>
        <div class="period-reminder-quote">"${quote}"</div>
        <button class="period-reminder-close" onclick="this.parentElement.remove()">
            <i class="fas fa-heart"></i> 收到啦
        </button>
    `;

    document.body.appendChild(notification);

    // 播放提示音
    playTodoReminderSound();

    // 30秒后自动消失
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('hiding');
            setTimeout(() => notification.remove(), 300);
        }
    }, 30000);
}

// 检查是否有需要触发的提醒
function checkDiaryReminders() {
    const now = new Date();
    let needSave = false;

    // 检查待办提醒
    if (diaryTodos && diaryTodos.length > 0) {
        diaryTodos.forEach(todo => {
            if (todo.done || !todo.reminder || !todo.reminder.time) return;

            const reminderTime = new Date(todo.reminder.time);
            const lastTriggered = todo.reminder.lastTriggered ? new Date(todo.reminder.lastTriggered) : null;

            // 判断是否该触发：当前时间 >= 提醒时间，且未被触发过（或需要重复）
            let shouldTrigger = false;

            if (todo.reminder.repeat === 'none') {
                // 不重复：仅一次，且未触发过
                shouldTrigger = now >= reminderTime && !lastTriggered;
            } else {
                // 重复模式：计算下一次应触发时间
                const nextTriggerTime = getNextReminderTime(reminderTime, todo.reminder.repeat, now);
                shouldTrigger = now >= nextTriggerTime && (!lastTriggered || lastTriggered < nextTriggerTime);
            }

            if (shouldTrigger) {
                triggerDiaryReminder(todo);
                todo.reminder.lastTriggered = now.toISOString();
                needSave = true;
            }
        });

        if (needSave) saveDiaryTodos();
    }

    // 检查习惯提醒
    if (diaryHabits && diaryHabits.length > 0) {
        let needSaveHabits = false;

        diaryHabits.forEach(habit => {
            if (!habit.reminder || !habit.reminder.time) return;

            // 检查今天是否已打卡
            const todayStr = diaryTodayStr();
            if (diaryHabitRecords[todayStr] && diaryHabitRecords[todayStr][habit.id]) return; // 已打卡，不提醒

            const reminderTime = habit.reminder.time; // 格式 "HH:mm"
            const lastTriggered = habit.reminder.lastTriggered ? new Date(habit.reminder.lastTriggered) : null;

            // 获取当前时间的 HH:mm
            const currentHours = now.getHours().toString().padStart(2, '0');
            const currentMinutes = now.getMinutes().toString().padStart(2, '0');
            const currentTimeStr = `${currentHours}:${currentMinutes}`;

            // 判断是否该触发
            let shouldTrigger = false;

            // 检查是否到了提醒时间（允许1分钟误差）
            if (currentTimeStr >= reminderTime) {
                // 检查今天是否已经触发过
                if (!lastTriggered || lastTriggered.toDateString() !== now.toDateString()) {
                    shouldTrigger = true;
                }
            }

            if (shouldTrigger) {
                triggerDiaryHabitReminder(habit);
                habit.reminder.lastTriggered = now.toISOString();
                needSaveHabits = true;
            }
        });

        if (needSaveHabits) saveDiaryHabits();
    }
}

// 触发习惯提醒
function triggerDiaryHabitReminder(habit) {
    const repeatText = { daily: '（每天）', weekly: '（每周）', monthly: '（每月）' };
    const repeatLabel = repeatText[habit.reminder.repeat] || '（每天）';

    // 播放提示音
    playTodoReminderSound();

    // 显示美观的提醒弹窗（30秒）
    showHabitReminderNotification(habit.id, habit.name, habit.icon, habit.color, repeatLabel);

    // 系统通知（如果已授权）
    if ('Notification' in window && Notification.permission === 'granted') {
        try {
            new Notification('朝夕心记 - 习惯提醒', {
                body: `该打卡「${habit.name}」了 ${repeatLabel}`,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔥</text></svg>',
                tag: 'diary-habit-' + habit.id
            });
        } catch (e) {
            console.warn('[朝夕心记] 系统通知发送失败:', e);
        }
    }
}

// 显示习惯提醒弹窗
function showHabitReminderNotification(habitId, name, icon, color, repeatLabel) {
    // 移除已有的提醒
    const existing = document.querySelector('.todo-reminder-notification');
    if (existing) existing.remove();

    // 获取昵称
    const partnerName = (typeof settings !== 'undefined' && settings.partnerName) || '梦角';
    const myName = (typeof settings !== 'undefined' && settings.myName) || '我';

    const notification = document.createElement('div');
    notification.className = 'todo-reminder-notification';
    notification.innerHTML = `
        <div class="todo-reminder-icon" style="color:${color};">
            🔥
        </div>
        <div class="todo-reminder-title">习惯提醒</div>
        <div class="todo-reminder-hint">
            <span class="todo-reminder-partner">${partnerName}</span>
            <span> 提醒 </span>
            <span class="todo-reminder-me">${myName}</span>
            <span> 该打卡啦</span>
        </div>
        <div class="todo-reminder-text">「${name}」</div>
        ${repeatLabel ? `<div class="todo-reminder-repeat">${repeatLabel}</div>` : ''}
        <div class="todo-reminder-actions">
            <button class="todo-reminder-btn todo-reminder-done" onclick="checkHabitFromReminder(${habitId}, this.parentElement.parentElement)">
                <i class="fas fa-check"></i> 已打卡
            </button>
            <button class="todo-reminder-btn todo-reminder-later" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-clock"></i> 稍后
            </button>
        </div>
    `;

    document.body.appendChild(notification);

    // 30秒后自动消失
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('hiding');
            setTimeout(() => notification.remove(), 300);
        }
    }, 30000);
}

// 从提醒弹窗打卡习惯
function checkHabitFromReminder(habitId, notificationEl) {
    const habit = diaryHabits.find(h => h.id === habitId);
    if (habit) {
        const today = diaryTodayStr();
        if (!diaryHabitRecords[today]) diaryHabitRecords[today] = {};
        diaryHabitRecords[today][habitId] = true;
        saveDiaryHabitRecords();
        renderDiaryHabits();
        showNotification('✨ 太棒了！习惯已打卡', 'success');
    }
    if (notificationEl) {
        notificationEl.classList.add('hiding');
        setTimeout(() => notificationEl.remove(), 300);
    }
}

// 根据重复方式计算下一次提醒时间
function getNextReminderTime(baseTime, repeat, now) {
    const base = new Date(baseTime);
    const target = new Date(now);

    if (repeat === 'daily') {
        // 每天重复：取今天或明天的对应时间
        const todayTrigger = new Date(target);
        todayTrigger.setHours(base.getHours(), base.getMinutes(), 0, 0);
        if (todayTrigger > now) return todayTrigger;
        const tomorrowTrigger = new Date(todayTrigger);
        tomorrowTrigger.setDate(tomorrowTrigger.getDate() + 1);
        return tomorrowTrigger;
    }

    if (repeat === 'weekly') {
        // 每周重复：同星期几
        const baseDay = base.getDay();
        const todayTrigger = new Date(target);
        todayTrigger.setHours(base.getHours(), base.getMinutes(), 0, 0);
        const diff = baseDay - todayTrigger.getDay();
        if (diff >= 0 && todayTrigger.getTime() + diff * 86400000 > now.getTime()) {
            todayTrigger.setDate(todayTrigger.getDate() + diff);
            return todayTrigger;
        }
        const nextWeek = new Date(todayTrigger);
        nextWeek.setDate(nextWeek.getDate() + (7 - (nextWeek.getDay() - baseDay + 7) % 7) % 7 || 7);
        return nextWeek;
    }

    if (repeat === 'monthly') {
        // 每月重复：同日期
        const baseDate = base.getDate();
        const todayTrigger = new Date(target);
        todayTrigger.setHours(base.getHours(), base.getMinutes(), 0, 0);
        todayTrigger.setDate(baseDate);
        if (todayTrigger > now) return todayTrigger;
        const nextMonth = new Date(todayTrigger);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;
    }

    return base;
}

// 触发提醒通知
function triggerDiaryReminder(todo) {
    const repeatText = { none: '', daily: '（每天重复）', weekly: '（每周重复）', monthly: '（每月重复）' };
    const repeatLabel = repeatText[todo.reminder.repeat] || '';
    const categoryObj = diaryTodoCategories.find(c => c.id === (todo.category || 'other'));
    const categoryIcon = categoryObj ? categoryObj.icon : '📌';
    const categoryColor = categoryObj ? categoryObj.color : '#95a5a6';

    // 播放提示音
    playTodoReminderSound();

    // 显示美观的提醒弹窗（30秒），传入 todo id
    showTodoReminderNotification(todo.id, todo.text, categoryIcon, categoryColor, repeatLabel);

    // 系统通知（如果已授权）
    if ('Notification' in window && Notification.permission === 'granted') {
        try {
            new Notification('朝夕心记 - 待办提醒', {
                body: `${todo.text} ${repeatLabel}`,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📋</text></svg>',
                tag: 'diary-todo-' + todo.id
            });
        } catch (e) {
            console.warn('[朝夕心记] 系统通知发送失败:', e);
        }
    }
}

// 播放待办提醒提示音
function playTodoReminderSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // 悦耳的三音调提示音
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.warn('[朝夕心记] 提示音播放失败:', e);
    }
}

// 显示美观的待办提醒通知（30秒）
function showTodoReminderNotification(todoId, text, icon, color, repeatLabel) {
    // 移除已有的提醒
    const existing = document.querySelector('.todo-reminder-notification');
    if (existing) existing.remove();

    // 获取昵称
    const partnerName = (typeof settings !== 'undefined' && settings.partnerName) || '梦角';
    const myName = (typeof settings !== 'undefined' && settings.myName) || '我';

    const notification = document.createElement('div');
    notification.className = 'todo-reminder-notification';
    notification.innerHTML = `
        <div class="todo-reminder-icon" style="color:${color};">
            ${icon}
        </div>
        <div class="todo-reminder-title">待办提醒</div>
        <div class="todo-reminder-hint">
            <span class="todo-reminder-partner">${partnerName}</span>
            <span> 提示 </span>
            <span class="todo-reminder-me">${myName}</span>
            <span> 去完成</span>
        </div>
        <div class="todo-reminder-text">"${text}"</div>
        ${repeatLabel ? `<div class="todo-reminder-repeat">${repeatLabel}</div>` : ''}
        <div class="todo-reminder-actions">
            <button class="todo-reminder-btn todo-reminder-done" onclick="completeTodoFromReminder(${todoId}, this.parentElement.parentElement)">
                <i class="fas fa-check"></i> 已完成
            </button>
            <button class="todo-reminder-btn todo-reminder-later" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-clock"></i> 稍后
            </button>
        </div>
    `;

    document.body.appendChild(notification);

    // 30秒后自动消失
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('hiding');
            setTimeout(() => notification.remove(), 300);
        }
    }, 30000);
}

// 从提醒弹窗完成待办
function completeTodoFromReminder(todoId, notificationEl) {
    const todo = diaryTodos.find(t => t.id === todoId);
    if (todo) {
        todo.done = true;
        todo.doneAt = Date.now();
        saveDiaryTodos();
        renderDiaryTodos();
        showNotification('✨ 太棒了！待办已完成', 'success');
    }
    if (notificationEl) {
        notificationEl.classList.add('hiding');
        setTimeout(() => notificationEl.remove(), 300);
    }
}

// 在 DOMContentLoaded 后自动初始化监听
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initDiaryListeners, 500);
    // 启动提醒检查
    setTimeout(() => {
        initDiaryData().then(() => {
            startDiaryReminderChecker();
        });
    }, 2000);
});
