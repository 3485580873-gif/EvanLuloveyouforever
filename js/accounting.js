/**
 * 同心记账 - accounting.js
 * 功能模块：支出记录、收入记录、结余统计、自定义标签
 * 数据存储：localforage (IndexedDB)
 * 依赖：getStorageKey, showNotification, showModal, hideModal, localforage
 */

/* ========== 全局状态 ========== */
let accountingRecords = [];  // 记账记录 [{ id, type: 'expense'|'income', amount, label, note, date, createdAt }]
let accountingLabels = {      // 自定义标签
    expense: [
        { id: 'food', name: '餐饮', icon: '🍜', color: '#FF6B6B' },
        { id: 'transport', name: '交通', icon: '🚗', color: '#4ECDC4' },
        { id: 'shopping', name: '购物', icon: '🛒', color: '#45B7D1' },
        { id: 'entertainment', name: '娱乐', icon: '🎮', color: '#96CEB4' },
        { id: 'housing', name: '住房', icon: '🏠', color: '#FFEAA7' },
        { id: 'medical', name: '医疗', icon: '💊', color: '#DDA0DD' },
        { id: 'education', name: '教育', icon: '📚', color: '#98D8C8' },
        { id: 'other_expense', name: '其他支出', icon: '📦', color: '#95A5A6' }
    ],
    income: [
        { id: 'salary', name: '工资', icon: '💰', color: '#2ECC71' },
        { id: 'bonus', name: '奖金', icon: '🎁', color: '#F39C12' },
        { id: 'investment', name: '投资收益', icon: '📈', color: '#3498DB' },
        { id: 'parttime', name: '兼职', icon: '💼', color: '#9B59B6' },
        { id: 'gift', name: '红包/礼物', icon: '🧧', color: '#E74C3C' },
        { id: 'other_income', name: '其他收入', icon: '💵', color: '#1ABC9C' }
    ]
};

let accountingCurrentTab = 'expense';  // 当前子标签页
let accountingCurrentMonth = null;     // 当前查看的月份 'YYYY-MM'
let accountingEditingId = null;        // 正在编辑的记录ID

/* ========== 数据初始化 ========== */
async function initAccountingData() {
    try {
        const [records, labels] = await Promise.allSettled([
            localforage.getItem(getStorageKey('accountingRecords')),
            localforage.getItem(getStorageKey('accountingLabels'))
        ]);

        if (records.status === 'fulfilled' && Array.isArray(records.value)) {
            accountingRecords = records.value;
        }
        if (labels.status === 'fulfilled' && labels.value) {
            // 合并默认标签和自定义标签
            if (labels.value.expense && Array.isArray(labels.value.expense)) {
                accountingLabels.expense = labels.value.expense;
            }
            if (labels.value.income && Array.isArray(labels.value.income)) {
                accountingLabels.income = labels.value.income;
            }
        }

        // 初始化当前月份
        const today = new Date();
        accountingCurrentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

        console.log('[同心记账] 数据初始化完成, 记录数:', accountingRecords.length);
    } catch (e) {
        console.error('[同心记账] 数据初始化失败:', e);
    }
}

/* ========== 数据保存 ========== */
function saveAccountingRecords() {
    localforage.setItem(getStorageKey('accountingRecords'), accountingRecords).catch(() => {});
}

function saveAccountingLabels() {
    localforage.setItem(getStorageKey('accountingLabels'), accountingLabels).catch(() => {});
}

/* ========== 工具函数 ========== */
function accountingFormatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function accountingTodayStr() {
    return accountingFormatDate(new Date());
}

function accountingEscHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

function accountingFormatMoney(amount) {
    return parseFloat(amount).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// 获取月份的收支统计
function getAccountingMonthStats(monthStr) {
    const monthRecords = accountingRecords.filter(r => r.date && r.date.startsWith(monthStr));

    let totalExpense = 0;
    let totalIncome = 0;

    monthRecords.forEach(r => {
        if (r.type === 'expense') {
            totalExpense += parseFloat(r.amount) || 0;
        } else if (r.type === 'income') {
            totalIncome += parseFloat(r.amount) || 0;
        }
    });

    return {
        expense: totalExpense,
        income: totalIncome,
        balance: totalIncome - totalExpense,
        count: monthRecords.length
    };
}

// 获取标签信息
function getAccountingLabel(type, labelId) {
    const labels = accountingLabels[type] || [];
    return labels.find(l => l.id === labelId) || { name: '未知', icon: '❓', color: '#95a5a6' };
}

/* ========== 主入口：打开同心记账 ========== */
async function openAccountingModal() {
    console.log('[同心记账] 打开同心记账');
    await initAccountingData();
    accountingCurrentTab = 'expense';
    accountingEditingId = null;
    renderAccountingModal();
    showModal(document.getElementById('accounting-modal'));
}

/* ========== Modal 渲染 ========== */
function renderAccountingModal() {
    const modal = document.getElementById('accounting-modal');
    if (!modal) return;

    // 更新标签页按钮状态
    const tabs = modal.querySelectorAll('.accounting-tab-btn');
    tabs.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === accountingCurrentTab);
    });

    // 渲染对应面板
    const panels = modal.querySelectorAll('.accounting-panel');
    panels.forEach(panel => {
        panel.style.display = panel.dataset.panel === accountingCurrentTab ? 'block' : 'none';
    });

    // 渲染内容
    switch (accountingCurrentTab) {
        case 'expense':
        case 'income':
            renderAccountingRecords();
            break;
        case 'stats':
            renderAccountingStats();
            break;
        case 'labels':
            renderAccountingLabelManager();
            break;
    }

    // 更新顶部统计
    updateAccountingHeaderStats();
}

function switchAccountingTab(tab) {
    accountingCurrentTab = tab;
    accountingEditingId = null;
    renderAccountingModal();
}

// 更新顶部统计显示
function updateAccountingHeaderStats() {
    const stats = getAccountingMonthStats(accountingCurrentMonth);

    const expenseEl = document.getElementById('accounting-header-expense');
    const incomeEl = document.getElementById('accounting-header-income');
    const balanceEl = document.getElementById('accounting-header-balance');
    const monthEl = document.getElementById('accounting-current-month');

    if (expenseEl) expenseEl.textContent = '¥' + accountingFormatMoney(stats.expense);
    if (incomeEl) incomeEl.textContent = '¥' + accountingFormatMoney(stats.income);
    if (balanceEl) {
        const sign = stats.balance < 0 ? '-' : '';
        balanceEl.textContent = sign + '¥' + accountingFormatMoney(Math.abs(stats.balance));
        balanceEl.style.color = stats.balance >= 0 ? 'var(--accent-color)' : '#e74c3c';
    }
    if (monthEl) {
        const [year, month] = accountingCurrentMonth.split('-');
        monthEl.textContent = `${year}年${parseInt(month)}月`;
    }
}

// 切换月份
function switchAccountingMonth(direction) {
    const [year, month] = accountingCurrentMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    date.setMonth(date.getMonth() + direction);
    accountingCurrentMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    renderAccountingModal();
}

/* ========== 记录列表渲染 ========== */
function renderAccountingRecords() {
    const type = accountingCurrentTab;
    const containerId = type === 'expense' ? 'accounting-records-list-expense' : 'accounting-records-list-income';
    const container = document.getElementById(containerId);
    if (!container) return;

    const monthRecords = accountingRecords
        .filter(r => r.type === type && r.date && r.date.startsWith(accountingCurrentMonth))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (monthRecords.length === 0) {
        container.innerHTML = `
            <div class="accounting-empty">
                <i class="fas fa-receipt" style="font-size:48px;margin-bottom:16px;opacity:0.3;"></i>
                <div>暂无${type === 'expense' ? '支出' : '收入'}记录</div>
                <div style="font-size:12px;margin-top:6px;opacity:0.7;">点击下方按钮添加记录</div>
            </div>
        `;
        return;
    }

    // 按日期分组
    const groupedRecords = {};
    monthRecords.forEach(r => {
        if (!groupedRecords[r.date]) {
            groupedRecords[r.date] = [];
        }
        groupedRecords[r.date].push(r);
    });

    let html = '';
    const sortedDates = Object.keys(groupedRecords).sort((a, b) => new Date(b) - new Date(a));

    sortedDates.forEach(date => {
        const records = groupedRecords[date];
        const dateObj = new Date(date);
        const dateStr = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;

        let dayTotal = 0;
        records.forEach(r => dayTotal += parseFloat(r.amount) || 0);

        html += `
            <div class="accounting-date-group">
                <div class="accounting-date-header">
                    <span class="accounting-date-text">${dateStr}</span>
                    <span class="accounting-date-total">${type === 'expense' ? '-' : '+'}¥${accountingFormatMoney(dayTotal)}</span>
                </div>
                <div class="accounting-records-items">
        `;

        records.forEach(record => {
            const label = getAccountingLabel(type, record.label);
            html += `
                <div class="accounting-record-item" data-id="${record.id}">
                    <div class="accounting-record-icon" style="background:${label.color}20;color:${label.color};">
                        ${label.icon}
                    </div>
                    <div class="accounting-record-info">
                        <div class="accounting-record-label">${accountingEscHtml(label.name)}</div>
                        ${record.note ? `<div class="accounting-record-note">${accountingEscHtml(record.note)}</div>` : ''}
                    </div>
                    <div class="accounting-record-amount ${type}">
                        ${type === 'expense' ? '-' : '+'}¥${accountingFormatMoney(record.amount)}
                    </div>
                    <div class="accounting-record-actions">
                        <button class="accounting-action-btn" onclick="editAccountingRecord('${record.id}')" title="编辑">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="accounting-action-btn danger" onclick="deleteAccountingRecord('${record.id}')" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

/* ========== 统计面板渲染 ========== */
function renderAccountingStats() {
    const container = document.getElementById('accounting-stats-panel');
    if (!container) return;

    const stats = getAccountingMonthStats(accountingCurrentMonth);

    // 按标签统计
    const labelStats = { expense: {}, income: {} };
    accountingRecords
        .filter(r => r.date && r.date.startsWith(accountingCurrentMonth))
        .forEach(r => {
            if (!labelStats[r.type][r.label]) {
                labelStats[r.type][r.label] = 0;
            }
            labelStats[r.type][r.label] += parseFloat(r.amount) || 0;
        });

    let html = `
        <div class="accounting-stats-summary">
            <div class="accounting-stats-card expense">
                <div class="accounting-stats-label">本月支出</div>
                <div class="accounting-stats-value">¥${accountingFormatMoney(stats.expense)}</div>
            </div>
            <div class="accounting-stats-card income">
                <div class="accounting-stats-label">本月收入</div>
                <div class="accounting-stats-value">¥${accountingFormatMoney(stats.income)}</div>
            </div>
            <div class="accounting-stats-card balance ${stats.balance >= 0 ? 'positive' : 'negative'}">
                <div class="accounting-stats-label">本月结余</div>
                <div class="accounting-stats-value">¥${accountingFormatMoney(Math.abs(stats.balance))}</div>
            </div>
        </div>
    `;

    // 支出分类统计
    if (Object.keys(labelStats.expense).length > 0) {
        html += `
            <div class="accounting-stats-section">
                <div class="accounting-stats-section-title">
                    <i class="fas fa-arrow-down" style="color:#e74c3c;"></i> 支出分类
                </div>
                <div class="accounting-stats-labels">
        `;

        const sortedExpense = Object.entries(labelStats.expense).sort((a, b) => b[1] - a[1]);
        sortedExpense.forEach(([labelId, amount]) => {
            const label = getAccountingLabel('expense', labelId);
            const percent = stats.expense > 0 ? (amount / stats.expense * 100).toFixed(1) : 0;
            html += `
                <div class="accounting-stats-label-item">
                    <div class="accounting-stats-label-bar" style="width:${percent}%;background:${label.color};"></div>
                    <div class="accounting-stats-label-content">
                        <span class="accounting-stats-label-icon">${label.icon}</span>
                        <span class="accounting-stats-label-name">${accountingEscHtml(label.name)}</span>
                        <span class="accounting-stats-label-amount">¥${accountingFormatMoney(amount)}</span>
                        <span class="accounting-stats-label-percent">${percent}%</span>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    }

    // 收入分类统计
    if (Object.keys(labelStats.income).length > 0) {
        html += `
            <div class="accounting-stats-section">
                <div class="accounting-stats-section-title">
                    <i class="fas fa-arrow-up" style="color:#2ecc71;"></i> 收入分类
                </div>
                <div class="accounting-stats-labels">
        `;

        const sortedIncome = Object.entries(labelStats.income).sort((a, b) => b[1] - a[1]);
        sortedIncome.forEach(([labelId, amount]) => {
            const label = getAccountingLabel('income', labelId);
            const percent = stats.income > 0 ? (amount / stats.income * 100).toFixed(1) : 0;
            html += `
                <div class="accounting-stats-label-item">
                    <div class="accounting-stats-label-bar" style="width:${percent}%;background:${label.color};"></div>
                    <div class="accounting-stats-label-content">
                        <span class="accounting-stats-label-icon">${label.icon}</span>
                        <span class="accounting-stats-label-name">${accountingEscHtml(label.name)}</span>
                        <span class="accounting-stats-label-amount">¥${accountingFormatMoney(amount)}</span>
                        <span class="accounting-stats-label-percent">${percent}%</span>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    }

    if (stats.count === 0) {
        html = `
            <div class="accounting-empty">
                <i class="fas fa-chart-pie" style="font-size:48px;margin-bottom:16px;opacity:0.3;"></i>
                <div>暂无数据统计</div>
                <div style="font-size:12px;margin-top:6px;opacity:0.7;">添加记录后可查看统计</div>
            </div>
        `;
    }

    container.innerHTML = html;
}

/* ========== 标签管理渲染 ========== */
function renderAccountingLabelManager() {
    const container = document.getElementById('accounting-labels-panel');
    if (!container) return;

    let html = `
        <div class="accounting-labels-section">
            <div class="accounting-labels-section-title">
                <i class="fas fa-arrow-down" style="color:#e74c3c;"></i> 支出标签
            </div>
            <div class="accounting-labels-grid">
    `;

    accountingLabels.expense.forEach(label => {
        html += `
            <div class="accounting-label-card" data-id="${label.id}" data-type="expense">
                <div class="accounting-label-icon" style="background:${label.color}20;color:${label.color};">
                    ${label.icon}
                </div>
                <div class="accounting-label-name">${accountingEscHtml(label.name)}</div>
                <div class="accounting-label-edit-btn" onclick="editAccountingLabel('expense', '${label.id}')">
                    <i class="fas fa-pen"></i>
                </div>
            </div>
        `;
    });

    html += `
                <div class="accounting-label-card add" onclick="addAccountingLabel('expense')">
                    <div class="accounting-label-icon"><i class="fas fa-plus"></i></div>
                    <div class="accounting-label-name">添加标签</div>
                </div>
            </div>
        </div>

        <div class="accounting-labels-section">
            <div class="accounting-labels-section-title">
                <i class="fas fa-arrow-up" style="color:#2ecc71;"></i> 收入标签
            </div>
            <div class="accounting-labels-grid">
    `;

    accountingLabels.income.forEach(label => {
        html += `
            <div class="accounting-label-card" data-id="${label.id}" data-type="income">
                <div class="accounting-label-icon" style="background:${label.color}20;color:${label.color};">
                    ${label.icon}
                </div>
                <div class="accounting-label-name">${accountingEscHtml(label.name)}</div>
                <div class="accounting-label-edit-btn" onclick="editAccountingLabel('income', '${label.id}')">
                    <i class="fas fa-pen"></i>
                </div>
            </div>
        `;
    });

    html += `
                <div class="accounting-label-card add" onclick="addAccountingLabel('income')">
                    <div class="accounting-label-icon"><i class="fas fa-plus"></i></div>
                    <div class="accounting-label-name">添加标签</div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

/* ========== 添加/编辑记录 ========== */
function showAccountingRecordForm(type, recordId = null) {
    const formPanel = document.getElementById('accounting-record-form');
    if (!formPanel) return;

    // 设置表单类型
    const typeInput = document.getElementById('accounting-form-type');
    const titleEl = document.getElementById('accounting-form-title');

    if (typeInput) typeInput.value = type;
    if (titleEl) titleEl.textContent = recordId ? '编辑记录' : (type === 'expense' ? '添加支出' : '添加收入');

    // 填充标签选择
    const labelSelect = document.getElementById('accounting-form-label');
    if (labelSelect) {
        const labels = accountingLabels[type] || [];
        labelSelect.innerHTML = labels.map(l =>
            `<option value="${l.id}">${l.icon} ${accountingEscHtml(l.name)}</option>`
        ).join('');
    }

    // 如果是编辑，填充数据
    if (recordId) {
        const record = accountingRecords.find(r => r.id === recordId);
        if (record) {
            accountingEditingId = recordId;
            document.getElementById('accounting-form-amount').value = record.amount;
            document.getElementById('accounting-form-label').value = record.label;
            document.getElementById('accounting-form-date').value = record.date;
            document.getElementById('accounting-form-note').value = record.note || '';
        }
    } else {
        accountingEditingId = null;
        document.getElementById('accounting-form-amount').value = '';
        document.getElementById('accounting-form-label').selectedIndex = 0;
        document.getElementById('accounting-form-date').value = accountingTodayStr();
        document.getElementById('accounting-form-note').value = '';
    }

    // 以弹窗形式显示
    formPanel.style.display = 'flex';
}

function hideAccountingRecordForm() {
    const formPanel = document.getElementById('accounting-record-form');
    if (formPanel) formPanel.style.display = 'none';
    accountingEditingId = null;
}

function saveAccountingRecord() {
    const type = document.getElementById('accounting-form-type').value;
    const amount = parseFloat(document.getElementById('accounting-form-amount').value);
    const label = document.getElementById('accounting-form-label').value;
    const date = document.getElementById('accounting-form-date').value;
    const note = document.getElementById('accounting-form-note').value.trim();

    if (!amount || amount <= 0) {
        showNotification('请输入有效金额', 'warning');
        return;
    }

    if (!date) {
        showNotification('请选择日期', 'warning');
        return;
    }

    if (accountingEditingId) {
        // 编辑模式
        const record = accountingRecords.find(r => r.id === accountingEditingId);
        if (record) {
            record.type = type;
            record.amount = amount;
            record.label = label;
            record.date = date;
            record.note = note;
            showNotification('记录已更新', 'success');
        }
    } else {
        // 新增模式
        const newRecord = {
            id: 'acc_' + Date.now(),
            type: type,
            amount: amount,
            label: label,
            date: date,
            note: note,
            createdAt: new Date().toISOString()
        };
        accountingRecords.push(newRecord);
        showNotification('记录已添加', 'success');
    }

    saveAccountingRecords();
    hideAccountingRecordForm();
    renderAccountingModal();
}

function editAccountingRecord(recordId) {
    const record = accountingRecords.find(r => r.id === recordId);
    if (!record) return;

    // 切换到对应标签页
    accountingCurrentTab = record.type;
    renderAccountingModal();

    // 显示编辑表单
    setTimeout(() => {
        showAccountingRecordForm(record.type, recordId);
    }, 50);
}

function deleteAccountingRecord(recordId) {
    if (!confirm('确定要删除这条记录吗？')) return;

    const index = accountingRecords.findIndex(r => r.id === recordId);
    if (index !== -1) {
        accountingRecords.splice(index, 1);
        saveAccountingRecords();
        showNotification('记录已删除', 'success');
        renderAccountingModal();
    }
}

/* ========== 标签管理 ========== */
function addAccountingLabel(type) {
    showAccountingLabelForm(type);
}

function editAccountingLabel(type, labelId) {
    showAccountingLabelForm(type, labelId);
}

function showAccountingLabelForm(type, labelId = null) {
    const label = labelId ? getAccountingLabel(type, labelId) : null;

    const modal = document.createElement('div');
    modal.id = 'accounting-label-form-modal';
    modal.className = 'accounting-label-form-modal';
    modal.innerHTML = `
        <div class="accounting-label-form-content">
            <div class="accounting-label-form-title">
                ${label ? '编辑标签' : '添加标签'}
            </div>
            <div class="accounting-label-form-field">
                <label>名称</label>
                <input type="text" id="accounting-label-name-input" value="${label ? accountingEscHtml(label.name) : ''}" placeholder="输入标签名称" maxlength="10">
            </div>
            <div class="accounting-label-form-field">
                <label>图标</label>
                <input type="text" id="accounting-label-icon-input" value="${label ? label.icon : '📌'}" placeholder="输入emoji图标" maxlength="4">
            </div>
            <div class="accounting-label-form-field">
                <label>颜色</label>
                <input type="color" id="accounting-label-color-input" value="${label ? label.color : '#95a5a6'}">
            </div>
            <div class="accounting-label-form-actions">
                <button class="modal-btn modal-btn-secondary" onclick="closeAccountingLabelForm()">取消</button>
                ${label ? `<button class="modal-btn modal-btn-secondary" style="color:#e74c3c;" onclick="deleteAccountingLabel('${type}', '${labelId}')">删除</button>` : ''}
                <button class="modal-btn modal-btn-primary" onclick="saveAccountingLabelForm('${type}', '${labelId || ''}')">保存</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function closeAccountingLabelForm() {
    const modal = document.getElementById('accounting-label-form-modal');
    if (modal) modal.remove();
}

function saveAccountingLabelForm(type, labelId) {
    const name = document.getElementById('accounting-label-name-input').value.trim();
    const icon = document.getElementById('accounting-label-icon-input').value.trim() || '📌';
    const color = document.getElementById('accounting-label-color-input').value || '#95a5a6';

    if (!name) {
        showNotification('请输入标签名称', 'warning');
        return;
    }

    if (labelId) {
        // 编辑
        const label = accountingLabels[type].find(l => l.id === labelId);
        if (label) {
            label.name = name;
            label.icon = icon;
            label.color = color;
            showNotification('标签已更新', 'success');
        }
    } else {
        // 新增
        const newLabel = {
            id: 'label_' + Date.now(),
            name: name,
            icon: icon,
            color: color
        };
        accountingLabels[type].push(newLabel);
        showNotification('标签已添加', 'success');
    }

    saveAccountingLabels();
    closeAccountingLabelForm();
    renderAccountingLabelManager();
}

function deleteAccountingLabel(type, labelId) {
    if (!confirm('确定要删除这个标签吗？')) return;

    const index = accountingLabels[type].findIndex(l => l.id === labelId);
    if (index !== -1) {
        accountingLabels[type].splice(index, 1);
        saveAccountingLabels();
        showNotification('标签已删除', 'success');
        closeAccountingLabelForm();
        renderAccountingLabelManager();
    }
}

/* ========== 事件监听初始化 ========== */
function initAccountingListeners() {
    // 高级功能中的入口按钮
    const entryBtn = document.getElementById('accounting-function');
    if (entryBtn && !entryBtn.dataset.initialized) {
        entryBtn.dataset.initialized = 'true';
        const newBtn = entryBtn.cloneNode(true);
        entryBtn.parentNode.replaceChild(newBtn, entryBtn);
        newBtn.addEventListener('click', () => {
            hideModal(document.getElementById('advanced-modal'));
            openAccountingModal();
        });
    }

    // 标签页切换
    document.querySelectorAll('.accounting-tab-btn').forEach(btn => {
        if (!btn.dataset.bound) {
            btn.dataset.bound = 'true';
            btn.addEventListener('click', () => switchAccountingTab(btn.dataset.tab));
        }
    });

    // 返回按钮
    const backBtn = document.getElementById('back-accounting');
    if (backBtn && !backBtn.dataset.bound) {
        backBtn.dataset.bound = 'true';
        backBtn.addEventListener('click', () => {
            hideModal(document.getElementById('accounting-modal'));
            showModal(document.getElementById('advanced-modal'));
        });
    }

    // 月份切换
    const prevMonthBtn = document.getElementById('accounting-prev-month');
    const nextMonthBtn = document.getElementById('accounting-next-month');
    if (prevMonthBtn && !prevMonthBtn.dataset.bound) {
        prevMonthBtn.dataset.bound = 'true';
        prevMonthBtn.addEventListener('click', () => switchAccountingMonth(-1));
    }
    if (nextMonthBtn && !nextMonthBtn.dataset.bound) {
        nextMonthBtn.dataset.bound = 'true';
        nextMonthBtn.addEventListener('click', () => switchAccountingMonth(1));
    }

    // 添加记录按钮
    const addBtn = document.getElementById('accounting-add-record-btn');
    if (addBtn && !addBtn.dataset.bound) {
        addBtn.dataset.bound = 'true';
        addBtn.addEventListener('click', () => {
            showAccountingRecordForm(accountingCurrentTab === 'stats' || accountingCurrentTab === 'labels' ? 'expense' : accountingCurrentTab);
        });
    }

    // 表单保存按钮
    const saveBtn = document.getElementById('accounting-form-save');
    if (saveBtn && !saveBtn.dataset.bound) {
        saveBtn.dataset.bound = 'true';
        saveBtn.addEventListener('click', saveAccountingRecord);
    }

    // 表单取消按钮
    const cancelBtn = document.getElementById('accounting-form-cancel');
    if (cancelBtn && !cancelBtn.dataset.bound) {
        cancelBtn.dataset.bound = 'true';
        cancelBtn.addEventListener('click', hideAccountingRecordForm);
    }

    // 点击遮罩层关闭弹窗
    const formOverlay = document.getElementById('accounting-record-form');
    if (formOverlay && !formOverlay.dataset.overlayBound) {
        formOverlay.dataset.overlayBound = 'true';
        formOverlay.addEventListener('click', (e) => {
            if (e.target === formOverlay) {
                hideAccountingRecordForm();
            }
        });
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initAccountingListeners, 500);
});

// 导出函数供外部调用
window.openAccountingModal = openAccountingModal;
window.switchAccountingTab = switchAccountingTab;
window.switchAccountingMonth = switchAccountingMonth;
window.showAccountingRecordForm = showAccountingRecordForm;
window.hideAccountingRecordForm = hideAccountingRecordForm;
window.saveAccountingRecord = saveAccountingRecord;
window.editAccountingRecord = editAccountingRecord;
window.deleteAccountingRecord = deleteAccountingRecord;
window.addAccountingLabel = addAccountingLabel;
window.editAccountingLabel = editAccountingLabel;
window.deleteAccountingLabel = deleteAccountingLabel;
window.closeAccountingLabelForm = closeAccountingLabelForm;
window.saveAccountingLabelForm = saveAccountingLabelForm;
