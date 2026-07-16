// ==================== 梦向问卷功能 ====================
// 兜底：万一 utils.js 的全局 escapeHtml 因为缓存等原因没加载到，这里自己也定义一份，
// 避免整个"添加题目"功能因为这一个函数缺失就直接报错
if (typeof window.escapeHtml !== 'function') {
    window.escapeHtml = function (str) {
        if (str === null || str === undefined) return '';
        const div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    };
}
if (typeof escapeHtml === 'undefined') {
    var escapeHtml = window.escapeHtml;
}
let dreamQuestionnaires = [];  // 创建的问卷列表
let dqCurrentType = 'choice';  // 当前编辑的问卷类型
let dqCurrentReplyTime = 'immediate'; // 当前编辑的回复时间
let dqQuestions = [];  // 当前编辑的题目列表
let dqEditingId = null; // 正在编辑的问卷 ID

// 修改 loadDQData 函数
async function loadDQData() {
    try {
        const saved = await localforage.getItem(getStorageKey('dreamQuestionnaires'));
        if (saved && Array.isArray(saved)) dreamQuestionnaires = saved;
    } catch(e) {
        dreamQuestionnaires = [];
    }
    
    // 检查所有待回复的问卷
    setTimeout(checkAllPendingDQs, 1000);
}

function saveDQData() {
    localforage.setItem(getStorageKey('dreamQuestionnaires'), dreamQuestionnaires).catch(() => {});
}

// 渲染问卷列表
function renderDQList() {
    const list = document.getElementById('dq-list');
    if (!list) return;

    if (dreamQuestionnaires.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                <i class="fas fa-clipboard-list" style="font-size: 40px; opacity: 0.3; margin-bottom: 12px; display: block;"></i>
                <p style="font-size: 14px; font-weight: 500;">还没有问卷</p>
                <p style="font-size: 12px; opacity: 0.6;">点击"创建新问卷"开始吧~</p>
            </div>`;
    } else {
        list.innerHTML = dreamQuestionnaires.map((dq, index) => {
            const typeBadge = dq.type === 'choice' 
                ? '<span class="dq-card-badge choice">📋 选择题</span>'
                : '<span class="dq-card-badge fill">✏️ 填空题</span>';
            const statusBadge = dq.answer 
                ? '<span class="dq-card-badge answered">✓ 已回复</span>'
                : (dq.sent ? '<span class="dq-card-badge pending">⏳ 等待回复</span>' : '');
            const questionCount = dq.questions ? dq.questions.length : 0;
            const replyTimeLabel = dq.replyTime === 'immediate' ? '立即回复' : '随机时间';
            const answerPreview = dq.answer ? '点击查看回复 →' : (dq.sent ? '等待中...' : '点击发送 →');
            
            return `
                <div class="dq-card" onclick="handleDQCardClick('${dq.id}')">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div style="flex: 1; min-width: 0;">
                            <div class="dq-card-header">
                                <span class="dq-card-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(dq.title || '未命名问卷')}</span>
                            </div>
                            <div class="dq-card-meta">
                                <span>${questionCount} 题</span>
                                <span>·</span>
                                ${typeBadge}
                                <span>·</span>
                                <span>${replyTimeLabel}</span>
                            </div>
                            <div style="font-size: 11px; color: var(--accent-color); margin-top: 4px; opacity: 0.8;">${answerPreview}</div>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; margin-left: 10px;">
                            ${statusBadge}
                            <button class="dq-delete-btn" onclick="event.stopPropagation(); deleteDQ('${dq.id}')" title="删除">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
        }).join('');
    }

    // 渲染收到的回复列表
    renderDQReceived();
}

// 渲染收到的问卷回复
function renderDQReceived() {
    const receivedList = document.getElementById('dq-received-list');
    const receivedSection = document.getElementById('dq-received');
    if (!receivedList || !receivedSection) return;

    const answeredDQs = dreamQuestionnaires.filter(dq => dq.answer);
    
    if (answeredDQs.length === 0) {
        receivedSection.style.display = 'none';
        return;
    }
    
    receivedSection.style.display = 'block';
    receivedList.innerHTML = answeredDQs.map(dq => `
        <div class="dq-card" onclick="viewDQAnswer('${dq.id}')" style="margin-bottom: 6px;">
            <div class="dq-card-header">
                <span class="dq-card-title">${escapeHtml(dq.title || '未命名问卷')}</span>
                <span class="dq-card-badge answered">✓ 已回复</span>
            </div>
            <div class="dq-card-meta">
                ${dq.questions ? dq.questions.length : 0} 题 · ${dq.type === 'choice' ? '选择题' : '填空题'}
            </div>
        </div>
    `).join('');
}

// 处理问卷卡片点击
function handleDQCardClick(id) {
    const dq = dreamQuestionnaires.find(q => q.id === id);
    if (!dq) return;
    
    // 先检查是否需要生成回复（处理页面刷新后定时器丢失的情况）
    if (dq.sent && !dq.answer && dq.expectedReplyAt) {
        checkAndGenerateDQReply(dq);
    }
    
    // 重新获取最新状态
    const updatedDq = dreamQuestionnaires.find(q => q.id === id);
    if (!updatedDq) return;
    
    if (updatedDq.answer) {
        viewDQAnswer(id);
    } else if (!updatedDq.sent) {
        openDQEditor(id);
    } else {
        // 显示等待中的提示
        const remainingMinutes = updatedDq.expectedReplyAt 
            ? Math.max(0, Math.ceil((updatedDq.expectedReplyAt - Date.now()) / 60000))
            : 0;
        showNotification(`问卷已发送，梦角预计 ${remainingMinutes} 分钟内回复`, 'info', 3000);
    }
}

// 在页面加载时检查所有待回复的问卷
function checkAllPendingDQs() {
    dreamQuestionnaires.forEach(dq => {
        if (dq.sent && !dq.answer && dq.expectedReplyAt) {
            checkAndGenerateDQReply(dq);
        }
    });
}

// 打开编辑器
function openDQEditor(id = null) {
    dqEditingId = id;
    const editorView = document.getElementById('dq-editor-view');
    const mainView = document.getElementById('dq-main-view');
    const answerView = document.getElementById('dq-answer-view');
    
    if (id) {
        const dq = dreamQuestionnaires.find(q => q.id === id);
        if (!dq) return;
        dqCurrentType = dq.type || 'choice';
        dqCurrentReplyTime = dq.replyTime || 'immediate';
        dqQuestions = JSON.parse(JSON.stringify(dq.questions || []));
        document.getElementById('dq-title-input').value = dq.title || '';
    } else {
        dqCurrentType = 'choice';
        dqCurrentReplyTime = 'immediate';
        dqQuestions = [];
        document.getElementById('dq-title-input').value = '';
    }

    mainView.style.display = 'none';
    answerView.style.display = 'none';
    editorView.style.display = 'block';
    
    updateDQTypeButtons();
    updateDQReplyTimeButtons();
    renderDQQuestions();
    
    document.getElementById('dq-create-btn').style.display = 'none';
    document.getElementById('dq-save-btn').style.display = '';
    document.getElementById('dq-send-btn').style.display = '';
    document.getElementById('dq-back-btn').style.display = '';
    document.getElementById('close-dq-modal').style.display = 'none';
    document.getElementById('dq-send-btn').style.display = id ? (dreamQuestionnaires.find(q => q.id === id)?.sent ? 'none' : '') : '';
    document.getElementById('dq-save-btn').style.display = id ? (dreamQuestionnaires.find(q => q.id === id)?.sent ? 'none' : '') : '';
}

// 返回主视图
function backToDQMain() {
    document.getElementById('dq-editor-view').style.display = 'none';
    document.getElementById('dq-answer-view').style.display = 'none';
    document.getElementById('dq-main-view').style.display = '';
    document.getElementById('dq-create-btn').style.display = '';
    document.getElementById('dq-save-btn').style.display = 'none';
    document.getElementById('dq-send-btn').style.display = 'none';
    document.getElementById('dq-back-btn').style.display = 'none';
    document.getElementById('close-dq-modal').style.display = '';
    dqEditingId = null;
    renderDQList();
}

// 更新类型按钮
function updateDQTypeButtons() {
    document.querySelectorAll('.dq-type-btn').forEach(btn => {
        if (btn.dataset.type === dqCurrentType) {
            btn.className = 'modal-btn modal-btn-primary dq-type-btn';
        } else {
            btn.className = 'modal-btn modal-btn-secondary dq-type-btn';
        }
    });
}

// 更新回复时间按钮
function updateDQReplyTimeButtons() {
    document.querySelectorAll('.dq-reply-time-btn').forEach(btn => {
        if (btn.dataset.time === dqCurrentReplyTime) {
            btn.className = 'modal-btn modal-btn-primary dq-reply-time-btn';
        } else {
            btn.className = 'modal-btn modal-btn-secondary dq-reply-time-btn';
        }
    });
    document.getElementById('dq-random-hint').style.display = 
        dqCurrentReplyTime === 'random' ? 'block' : 'none';
}

// 渲染题目列表
function renderDQQuestions() {
    const container = document.getElementById('dq-questions-container');
    if (!container) return;

    if (dqQuestions.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: var(--text-secondary); font-size: 13px; opacity: 0.6;">
                暂无题目，点击下方按钮添加
            </div>`;
        return;
    }

    container.innerHTML = dqQuestions.map((q, index) => `
        <div class="dq-question-block">
            <div class="dq-question-header">
                <div class="dq-question-number">${index + 1}</div>
                <input type="text" class="dq-question-input" value="${escapeHtml(q.question)}" 
                    placeholder="输入题目..." data-qindex="${index}" onchange="updateDQQuestion(${index}, 'question', this.value)">
                <button class="dq-option-remove" onclick="removeDQQuestion(${index})" title="删除题目">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            ${dqCurrentType === 'choice' ? renderDQOptions(q, index) : ''}
        </div>
    `).join('');
}

// 渲染选项
function renderDQOptions(question, qIndex) {
    const options = question.options || [];
    const selectionMode = question.selectionMode || 'single';
    const isSingle = selectionMode === 'single';
    
    return `
        <div style="padding-left: 34px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; margin-top: 6px;">
                <span style="font-size: 11px; color: var(--text-secondary);">答题方式</span>
                <div style="display: flex; gap: 4px;">
                    <button onclick="setDQSelectionMode(${qIndex}, 'single')" style="padding: 3px 10px; font-size: 11px; border-radius: 12px; border: 1.5px solid ${isSingle ? 'var(--accent-color)' : 'var(--border-color)'}; cursor: pointer; background: ${isSingle ? 'var(--accent-color)' : 'transparent'}; color: ${isSingle ? '#fff' : 'var(--text-secondary)'}; font-weight: ${isSingle ? '600' : '400'}; transition: all .15s;">
                        单选
                    </button>
                    <button onclick="setDQSelectionMode(${qIndex}, 'multi')" style="padding: 3px 10px; font-size: 11px; border-radius: 12px; border: 1.5px solid ${!isSingle ? 'var(--accent-color)' : 'var(--border-color)'}; cursor: pointer; background: ${!isSingle ? 'var(--accent-color)' : 'transparent'}; color: ${!isSingle ? '#fff' : 'var(--text-secondary)'}; font-weight: ${!isSingle ? '600' : '400'}; transition: all .15s;">
                        多选(最多3个)
                    </button>
                </div>
            </div>
            ${options.map((opt, oIndex) => `
                <div class="dq-option-row">
                    <span style="font-size: 11px; color: var(--text-secondary); min-width: 18px;">${isSingle ? '○' : '□'}</span>
                    <input type="text" class="dq-option-input" value="${escapeHtml(opt)}" 
                        placeholder="选项 ${oIndex + 1}" onchange="updateDQOption(${qIndex}, ${oIndex}, this.value)">
                    <button class="dq-option-remove" onclick="removeDQOption(${qIndex}, ${oIndex})" title="删除选项">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('')}
            <button onclick="addDQOption(${qIndex})" style="background: none; border: 1px dashed var(--border-color); border-radius: 6px; padding: 5px 10px; font-size: 11px; color: var(--text-secondary); cursor: pointer; width: 100%; margin-top: 4px;">
                <i class="fas fa-plus"></i> 添加选项
            </button>
        </div>
    `;
}

// 添加题目
function addDQQuestion() {
    const newQuestion = {
        question: '',
        options: dqCurrentType === 'choice' ? ['', ''] : [],
        selectionMode: 'single'
    };
    dqQuestions.push(newQuestion);
    renderDQQuestions();
}

// 删除题目
function removeDQQuestion(index) {
    dqQuestions.splice(index, 1);
    renderDQQuestions();
}

// 更新题目
function updateDQQuestion(index, field, value) {
    if (dqQuestions[index]) {
        dqQuestions[index][field] = value;
    }
}

// 添加选项
function addDQOption(qIndex) {
    if (dqQuestions[qIndex] && dqQuestions[qIndex].options) {
        dqQuestions[qIndex].options.push('');
        renderDQQuestions();
    }
}

// 删除选项
function removeDQOption(qIndex, oIndex) {
    if (dqQuestions[qIndex] && dqQuestions[qIndex].options) {
        dqQuestions[qIndex].options.splice(oIndex, 1);
        renderDQQuestions();
    }
}

// 更新选项
function updateDQOption(qIndex, oIndex, value) {
    if (dqQuestions[qIndex] && dqQuestions[qIndex].options) {
        dqQuestions[qIndex].options[oIndex] = value;
    }
}

// 设置题目的答题方式（单选/多选）
function setDQSelectionMode(qIndex, mode) {
    if (dqQuestions[qIndex]) {
        dqQuestions[qIndex].selectionMode = mode;
        renderDQQuestions();
    }
}

// 保存问卷
function saveDQ() {
    const title = document.getElementById('dq-title-input').value.trim();
    if (!title) {
        showNotification('请输入问卷标题', 'warning');
        return;
    }
    
    // 更新题目内容
    document.querySelectorAll('.dq-question-input').forEach(input => {
        const index = parseInt(input.dataset.qindex);
        if (!isNaN(index) && dqQuestions[index]) {
            dqQuestions[index].question = input.value;
        }
    });
    document.querySelectorAll('.dq-option-input').forEach((input, i) => {
        // 通过 DOM 结构解析
        const optionRow = input.closest('.dq-option-row');
        const questionBlock = input.closest('.dq-question-block');
        if (questionBlock) {
            const qInput = questionBlock.querySelector('.dq-question-input');
            if (qInput) {
                const qIndex = parseInt(qInput.dataset.qindex);
                const allOptionInputs = questionBlock.querySelectorAll('.dq-option-input');
                const oIndex = Array.from(allOptionInputs).indexOf(input);
                if (!isNaN(qIndex) && dqQuestions[qIndex] && dqQuestions[qIndex].options) {
                    dqQuestions[qIndex].options[oIndex] = input.value;
                }
            }
        }
    });

    const validQuestions = dqQuestions.filter(q => q.question.trim());
    if (validQuestions.length === 0) {
        showNotification('请至少添加一道有效题目', 'warning');
        return;
    }
    if (dqCurrentType === 'choice') {
        const invalidOptions = validQuestions.some(q => 
            !q.options || q.options.filter(o => o.trim()).length < 2
        );
        if (invalidOptions) {
            showNotification('选择题每题至少需要两个选项', 'warning');
            return;
        }
    }

    const dqData = {
        id: dqEditingId || ('dq_' + Date.now()),
        title,
        type: dqCurrentType,
        replyTime: dqCurrentReplyTime,
        questions: validQuestions.map(q => ({
            question: q.question.trim(),
            options: dqCurrentType === 'choice' ? q.options.map(o => o.trim()).filter(o => o) : [],
            selectionMode: dqCurrentType === 'choice' ? (q.selectionMode || 'single') : 'single'
        })),
        sent: false,
        answer: null,
        createdAt: Date.now()
    };

    if (dqEditingId) {
        const index = dreamQuestionnaires.findIndex(q => q.id === dqEditingId);
        if (index >= 0) {
            dreamQuestionnaires[index] = dqData;
        } else {
            dreamQuestionnaires.push(dqData);
        }
    } else {
        dreamQuestionnaires.push(dqData);
    }

    saveDQData();
    // 保存后停留在编辑页，显示发送按钮（无需跳回列表）
    dqEditingId = dqData.id;
    const sendBtn = document.getElementById('dq-send-btn');
    const saveBtn = document.getElementById('dq-save-btn');
    if (sendBtn) { sendBtn.style.display = ''; sendBtn.textContent = '📨 发送问卷'; }
    if (saveBtn) { saveBtn.style.display = ''; saveBtn.textContent = '✓ 已保存'; saveBtn.style.opacity = '0.6'; setTimeout(() => { if (saveBtn) { saveBtn.textContent = '保存'; saveBtn.style.opacity = ''; } }, 2000); }
    showNotification('问卷已保存，可直接发送 ✓', 'success');
}

// 发送问卷
function sendDQ() {
    if (!dqEditingId) {
        showNotification('请先保存问卷', 'warning');
        return;
    }
    
    const dq = dreamQuestionnaires.find(q => q.id === dqEditingId);
    if (!dq) return;
    
    if (dq.sent) {
        showNotification('该问卷已发送', 'warning');
        return;
    }
    
    // 保存最新内容
    saveDQWithoutClose(dq);
    
    // 立即标记为已发送，并记录发送时间
    dq.sent = true;
    dq.sentAt = Date.now();
    
    // 如果是随机时间，记录期望的回复时间范围
    if (dq.replyTime === 'random') {
        const delayMinutes = Math.floor(Math.random() * 300); // 0-300 分钟
        dq.expectedReplyAt = Date.now() + delayMinutes * 60 * 1000;
        dq.replyDelayMinutes = delayMinutes;
    } else {
        dq.expectedReplyAt = Date.now() + 3000; // 立即回复，约3秒
        dq.replyDelayMinutes = 0;
    }
    
    saveDQData();
    
    // 检查是否应该立即回复
    checkAndGenerateDQReply(dq);
    
    // ===== 在聊天界面显示发送的问卷消息 =====
    _addDQChatMessage(dq, 'user');
    
    backToDQMain();
    
    if (dq.replyTime === 'immediate') {
        showNotification('问卷已发送！梦角正在填写... ✉️', 'success');
    } else {
        showNotification(`问卷已发送！梦角将在 ${dq.replyDelayMinutes} 分钟内回复 ✉️`, 'success');
    }
}

// ===== 向聊天界面插入问卷消息 =====
function _addDQChatMessage(dq, sender) {
    if (typeof addMessage !== 'function' && typeof window._addDQChatFallback !== 'function') return;
    const title = dq.title || '问卷';
    const qCount = (dq.questions || []).length;
    const typeLabel = dq.type === 'choice' ? '选择题' : '填空题';
    const cardHtml = `<div onclick="if(window.openDQChatDetail)window.openDQChatDetail('${dq.id}')" style="display:flex;flex-direction:column;gap:0;min-width:190px;max-width:230px;background:transparent;cursor:pointer;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(7,193,96,0.18);active-opacity:0.85;">
        <div style="background:linear-gradient(135deg,#07c160,#05a550);color:#fff;padding:12px 14px;">
            <div style="font-size:11px;opacity:0.85;font-weight:500;margin-bottom:4px;letter-spacing:0.3px;">📋 梦向问卷</div>
            <div style="font-size:14px;font-weight:700;line-height:1.3;">${escapeHtml(title)}</div>
        </div>
        <div style="background:#fff;padding:8px 14px;display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:12px;color:#888;">${qCount} 题 · ${typeLabel}</span>
            <span style="font-size:11px;color:#07c160;font-weight:600;">点击查看 ›</span>
        </div>
    </div>`;
    const msg = {
        id: Date.now() + Math.random(),
        sender: sender,
        text: '',
        cardHtml: cardHtml,
        dqId: dq.id,
        timestamp: new Date(),
        status: 'sent',
        type: 'dq-card'
    };
    if (typeof addMessage === 'function') {
        addMessage(msg);
    }
}

// 检查并生成回复（替代 setTimeout）
function checkAndGenerateDQReply(dq) {
    if (!dq || !dq.sent || dq.answer) return;
    
    const now = Date.now();
    const expectedTime = dq.expectedReplyAt || 0;
    
    if (now >= expectedTime) {
        // 时间到了，立即生成回复
        generateDQAnswerNow(dq);
    } else {
        // 还没到时间，设置定时器
        const delay = expectedTime - now;
        setTimeout(() => {
            // 重新从数组中获取最新数据
            const currentDq = dreamQuestionnaires.find(q => q.id === dq.id);
            if (currentDq && currentDq.sent && !currentDq.answer) {
                generateDQAnswerNow(currentDq);
            }
        }, delay);
    }
}

// 无需关闭的保存
function saveDQWithoutClose(targetDQ) {
    const title = document.getElementById('dq-title-input').value.trim();
    if (title) targetDQ.title = title;
    targetDQ.type = dqCurrentType;
    targetDQ.replyTime = dqCurrentReplyTime;
    
    document.querySelectorAll('.dq-question-input').forEach(input => {
        const index = parseInt(input.dataset.qindex);
        if (!isNaN(index) && dqQuestions[index]) {
            dqQuestions[index].question = input.value;
        }
    });
    
    targetDQ.questions = dqQuestions.filter(q => q.question.trim()).map(q => ({
        question: q.question.trim(),
        options: dqCurrentType === 'choice' ? (q.options || []).map(o => o.trim()).filter(o => o) : [],
        selectionMode: dqCurrentType === 'choice' ? (q.selectionMode || 'single') : 'single'
    }));
}

// 安排回复
function scheduleDQReply(dq) {
    let delay;
    if (dq.replyTime === 'immediate') {
        delay = 2000 + Math.random() * 3000;
    } else {
        delay = Math.floor(Math.random() * 300 * 60 * 1000); // 0-300 分钟
    }
    
    setTimeout(() => {
        generateDQAnswer(dq);
    }, delay);
}

// 立即生成回复
function generateDQAnswerNow(dq) {
    if (!dq || !dq.questions) return;
    if (dq.answer) return; // 已经有答案了，不重复生成
    
    const answers = dq.questions.map(q => {
        if (dq.type === 'choice') {
            const options = q.options || [];
            if (options.length === 0) return { question: q.question, answer: q.selectionMode === 'multi' ? [] : '(无选项)', selectionMode: q.selectionMode || 'single' };
            if (q.selectionMode === 'multi') {
                // 多选：随机选1~3个（不超过选项总数），用索引记录防止同名选项混淆
                const maxPick = Math.min(3, options.length);
                const pickCount = 1 + Math.floor(Math.random() * maxPick); // 1 到 maxPick
                const allIndices = [...Array(options.length).keys()].sort(() => Math.random() - 0.5);
                const pickedIndices = allIndices.slice(0, pickCount).sort((a, b) => a - b);
                return { question: q.question, answer: pickedIndices.map(i => options[i]), answerIndices: pickedIndices, selectionMode: 'multi' };
            }
            // 单选：记录索引，防止选项文本相同时误高亮其他选项
            const randomIndex = Math.floor(Math.random() * options.length);
            return { question: q.question, answer: options[randomIndex], answerIndex: randomIndex, selectionMode: 'single' };
        } else {
            // 填空题：从主字卡中随机抽取 1-3 句话
            const replyPool = customReplies && customReplies.length > 0 
                ? customReplies 
                : (typeof CONSTANTS !== 'undefined' && CONSTANTS.REPLY_MESSAGES && CONSTANTS.REPLY_MESSAGES.length > 0
                    ? CONSTANTS.REPLY_MESSAGES
                    : ['一切安好', '今天很开心', '想你']);
            const sentenceCount = 1 + Math.floor(Math.random() * 3); // 1-3 句
            const selected = [];
            const shuffled = [...replyPool].sort(() => Math.random() - 0.5);
            for (let i = 0; i < Math.min(sentenceCount, shuffled.length); i++) {
                selected.push(shuffled[i]);
            }
            return { question: q.question, answer: selected.join('。') + (selected.length > 0 ? '。' : '') };
        }
    });
    
    dq.answer = {
        answers,
        answeredAt: Date.now()
    };
    saveDQData();
    
    // 如果问卷列表当前可见，刷新显示
    const dqList = document.getElementById('dq-list');
    if (dqList && document.getElementById('dream-questionnaire-modal').style.display !== 'none') {
        renderDQList();
    }
    
    // ===== 对方填写完毕：在聊天界面发送填写结果 =====
    setTimeout(() => {
        _addDQAnswerChatMessage(dq);
    }, 800);
    
    // 通知用户
    showNotification(`梦角已填写问卷「${dq.title}」✨`, 'success', 4000);
}

// 对方把填写结果以消息形式发给我
function _addDQAnswerChatMessage(dq) {
    if (typeof addMessage !== 'function') return;
    if (!dq || !dq.answer) return;
    const partnerName = (typeof settings !== 'undefined' && settings.partnerName) ? settings.partnerName : '梦角';
    const title = dq.title || '问卷';
    const answersHtml = (dq.answer.answers || []).map((a, i) => {
        const ansText = Array.isArray(a.answer) ? a.answer.join('、') : a.answer;
        return `<div style="margin-bottom:6px;">
            <div style="font-size:11px;color:#999;margin-bottom:2px;">${i+1}. ${escapeHtml(a.question)}</div>
            <div style="font-size:13px;color:#333;font-weight:500;">${escapeHtml(ansText)}</div>
        </div>`;
    }).join('');
    const cardHtml = `<div onclick="if(window.openDQChatDetail)window.openDQChatDetail('${dq.id}')" style="display:flex;flex-direction:column;gap:0;min-width:190px;max-width:240px;background:transparent;cursor:pointer;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(255,117,140,0.2);">
        <div style="background:linear-gradient(135deg,#ff7eb3,#ff4d6d);color:#fff;padding:12px 14px;">
            <div style="font-size:11px;opacity:0.9;font-weight:500;margin-bottom:4px;letter-spacing:0.3px;">✅ 已填写问卷</div>
            <div style="font-size:14px;font-weight:700;line-height:1.3;">${escapeHtml(title)}</div>
        </div>
        <div style="background:#fff;padding:10px 14px;">
            ${answersHtml}
            <div style="margin-top:6px;font-size:11px;color:#ff4d6d;font-weight:600;text-align:right;">点击查看详情 ›</div>
        </div>
    </div>`;
    const msg = {
        id: Date.now() + Math.random(),
        sender: 'partner',
        text: '',
        cardHtml: cardHtml,
        dqId: dq.id,
        timestamp: new Date(),
        status: 'received',
        type: 'dq-card'
    };
    addMessage(msg);
}

// 查看问卷答案
function viewDQAnswer(id) {
    const dq = dreamQuestionnaires.find(q => q.id === id);
    if (!dq || !dq.answer) return;
    
    const mainView = document.getElementById('dq-main-view');
    const editorView = document.getElementById('dq-editor-view');
    const answerView = document.getElementById('dq-answer-view');
    const answerContent = document.getElementById('dq-answer-content');
    
    mainView.style.display = 'none';
    editorView.style.display = 'none';
    answerView.style.display = 'block';
    
    const partnerName = (typeof settings !== 'undefined' && settings.partnerName) ? settings.partnerName : '梦角';
    answerContent.innerHTML = `
        <div style="margin-bottom: 16px;">
            <div style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">${escapeHtml(dq.title)}</div>
            <div style="font-size: 11px; color: var(--text-secondary);">
                ${new Date(dq.answer.answeredAt).toLocaleString('zh-CN')} · ${escapeHtml(partnerName)}填写
            </div>
        </div>
        ${dq.answer.answers.map((a, i) => {
            const origQ = dq.questions && dq.questions[i];
            const origOptions = (origQ && origQ.options) ? origQ.options : [];
            const isMultiMode = (a.selectionMode === 'multi') || (origQ && origQ.selectionMode === 'multi');
            // 用索引判断高亮，避免相同文本的选项全部高亮
            let selectedIndices;
            if (a.answerIndices !== undefined) {
                selectedIndices = a.answerIndices;
            } else if (a.answerIndex !== undefined) {
                selectedIndices = [a.answerIndex];
            } else if (isMultiMode && Array.isArray(a.answer)) {
                // 旧数据兼容：逐一匹配第一个未被占用的索引
                selectedIndices = [];
                const used = new Set();
                a.answer.forEach(text => {
                    const idx = origOptions.findIndex((o, i) => o === text && !used.has(i));
                    if (idx >= 0) { selectedIndices.push(idx); used.add(idx); }
                });
            } else {
                // 旧数据兼容：单选只取第一个匹配索引
                const idx = origOptions.findIndex(o => o === (Array.isArray(a.answer) ? a.answer[0] : a.answer));
                selectedIndices = idx >= 0 ? [idx] : [];
            }
            return `
            <div class="dq-qa-item">
                <div class="dq-qa-question" style="display:flex;align-items:center;gap:6px;">${i + 1}. ${escapeHtml(a.question)}${isMultiMode ? '<span style="font-size:10px;padding:2px 6px;border-radius:8px;background:rgba(7,193,96,0.12);color:var(--accent-color);font-weight:600;flex-shrink:0;">多选</span>' : ''}</div>
                ${dq.type === 'choice' && origOptions.length > 0
                    ? `<div style="margin-top:8px;display:flex;flex-direction:column;gap:6px;">
                        ${origOptions.map((opt, oi) => {
                            const isSelected = selectedIndices.includes(oi);
                            const shapeStyle = isMultiMode ? 'border-radius:4px;' : 'border-radius:50%;';
                            return `<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:8px;font-size:13px;
                                ${isSelected ? 'background:var(--accent-color,#07c160);color:#fff;font-weight:600;' : 'background:var(--secondary-bg,#f5f5f5);color:var(--text-primary);'}">
                                <span style="width:20px;height:20px;${shapeStyle}display:inline-flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;
                                    ${isSelected ? 'background:rgba(255,255,255,0.3);' : 'background:rgba(0,0,0,0.08);'}">
                                    ${String.fromCharCode(65 + oi)}
                                </span>
                                <span style="flex:1;">${escapeHtml(opt)}</span>
                                ${isSelected ? '<span style="font-size:16px;">✓</span>' : ''}
                            </div>`;
                        }).join('')}
                       </div>`
                    : `<div class="dq-qa-answer fill-answer">${escapeHtml(Array.isArray(a.answer) ? a.answer.join('、') : a.answer)}</div>`
                }
            </div>`;
        }).join('')}
    `;
    
    document.getElementById('dq-create-btn').style.display = 'none';
    document.getElementById('dq-save-btn').style.display = 'none';
    document.getElementById('dq-send-btn').style.display = 'none';
    document.getElementById('dq-back-btn').style.display = '';
    document.getElementById('close-dq-modal').style.display = 'none';
}

// 删除问卷
function deleteDQ(id) {
    if (!confirm('确定要删除这个问卷吗？')) return;
    dreamQuestionnaires = dreamQuestionnaires.filter(q => q.id !== id);
    saveDQData();
    renderDQList();
    showNotification('问卷已删除', 'success');
}

// 初始化问卷事件
function initDQListeners() {
    // 防止多次调用重复绑定（下面同时用了 500ms/800ms/1500ms 三次兜底调用，
    // 只有第一次真正成功绑定过、且相关按钮确实存在时才跳过后续重复绑定）
    if (window._dqListenersBound) return;

    function bind(id, handler, evt) {
        try {
            const el = document.getElementById(id);
            if (!el) { console.warn('[梦向问卷] 找不到元素:', id); return false; }
            el.addEventListener(evt || 'click', handler);
            return true;
        } catch (e) {
            console.error('[梦向问卷] 绑定失败:', id, e);
            return false;
        }
    }

    // 创建按钮
    bind('dq-create-btn', () => openDQEditor(null));

    // 返回按钮
    bind('dq-back-btn', backToDQMain);

    // 保存按钮
    bind('dq-save-btn', saveDQ);

    // 发送按钮
    bind('dq-send-btn', sendDQ);

    // 关闭按钮
    bind('close-dq-modal', () => {
        hideModal(document.getElementById('dream-questionnaire-modal'));
    });

    // 类型按钮
    try {
        document.querySelectorAll('.dq-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                dqCurrentType = btn.dataset.type;
                updateDQTypeButtons();
                renderDQQuestions();
            });
        });
    } catch (e) { console.error('[梦向问卷] 类型按钮绑定失败:', e); }

    // 回复时间按钮
    try {
        document.querySelectorAll('.dq-reply-time-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                dqCurrentReplyTime = btn.dataset.time;
                updateDQReplyTimeButtons();
            });
        });
    } catch (e) { console.error('[梦向问卷] 回复时间按钮绑定失败:', e); }

    // 添加题目按钮
    const addBtnOk = bind('dq-add-question-btn', function (e) {
        e.preventDefault();
        try {
            addDQQuestion();
        } catch (err) {
            console.error('[梦向问卷] 添加题目失败:', err);
            if (typeof showNotification === 'function') showNotification('添加题目失败：' + (err && err.message ? err.message : String(err)), 'error', 5000);
        }
    });

    // 只有确认关键按钮都绑定成功了，才标记为"已绑定"，
    // 否则允许后面 800ms/1500ms 的兜底调用重试一次
    if (addBtnOk) window._dqListenersBound = true;

    // 高级功能入口由 listeners.js 的 initNewFeatureListeners 统一绑定
}

// 脚本在页面底部加载，DOMContentLoaded已触发，直接执行
// （用 500ms 延迟只是为了保险；这里额外再兜底绑定一次，防止 500ms 时modal还没准备好导致完全绑定失败）
setTimeout(initDQListeners, 500);
setTimeout(initDQListeners, 1500);
document.addEventListener('DOMContentLoaded', () => setTimeout(initDQListeners, 800));

// ===== 聊天卡片点击：打开问卷详情底部弹窗 =====
function openDQChatDetail(dqId) {
    const dq = dreamQuestionnaires.find(q => q.id === dqId);
    if (!dq) return;

    const overlay = document.getElementById('dq-chat-detail-overlay');
    const sheet = document.getElementById('dq-chat-detail-sheet');
    const titleEl = document.getElementById('dqd-title');
    const metaEl = document.getElementById('dqd-meta');
    const statusBar = document.getElementById('dqd-status-bar');
    const body = document.getElementById('dqd-body');
    if (!overlay || !sheet || !titleEl || !body) return;

    const partnerName = (typeof settings !== 'undefined' && settings.partnerName) ? settings.partnerName : '梦角';
    const typeLabel = dq.type === 'choice' ? '选择题' : '填空题';
    const qCount = (dq.questions || []).length;

    titleEl.textContent = dq.title || '问卷';
    metaEl.textContent = qCount + ' 题 · ' + typeLabel + ' · ' + new Date(dq.createdAt || Date.now()).toLocaleDateString('zh-CN');

    // 状态条
    if (dq.answer) {
        statusBar.style.background = 'linear-gradient(135deg,#e8f8ef,#d4f1e4)';
        statusBar.style.color = '#0a8044';
        statusBar.innerHTML = '<span style="margin-right:6px;">✅</span>' + partnerName + ' 已填写 · ' + new Date(dq.answer.answeredAt).toLocaleString('zh-CN');
    } else if (dq.sent) {
        const rem = dq.expectedReplyAt ? Math.max(0, Math.ceil((dq.expectedReplyAt - Date.now()) / 60000)) : 0;
        statusBar.style.background = 'linear-gradient(135deg,#fff8e8,#ffefc0)';
        statusBar.style.color = '#a06800';
        statusBar.innerHTML = '<span style="margin-right:6px;">⏳</span>等待 ' + partnerName + ' 填写' + (rem > 0 ? '，约 ' + rem + ' 分钟后' : '，即将回复');
    } else {
        statusBar.style.background = 'linear-gradient(135deg,#f0f0f5,#e8e8ee)';
        statusBar.style.color = '#666';
        statusBar.innerHTML = '<span style="margin-right:6px;">📋</span>尚未发送';
    }

    // 题目渲染
    body.innerHTML = (dq.questions || []).map((q, i) => {
        const ans = dq.answer && dq.answer.answers && dq.answer.answers[i];
        const rawSelected = ans ? ans.answer : null;
        const isMultiMode = (ans && ans.selectionMode === 'multi') || (q.selectionMode === 'multi');
        const opts = (q.options || []);
        // 用索引判断高亮，避免相同文本的选项全部高亮
        let selectedIndices;
        if (ans && ans.answerIndices !== undefined) {
            selectedIndices = ans.answerIndices;
        } else if (ans && ans.answerIndex !== undefined) {
            selectedIndices = [ans.answerIndex];
        } else if (isMultiMode && Array.isArray(rawSelected)) {
            selectedIndices = [];
            const used = new Set();
            rawSelected.forEach(text => {
                const idx = opts.findIndex((o, i) => o === text && !used.has(i));
                if (idx >= 0) { selectedIndices.push(idx); used.add(idx); }
            });
        } else {
            const idx = opts.findIndex(o => o === (Array.isArray(rawSelected) ? rawSelected[0] : rawSelected));
            selectedIndices = idx >= 0 ? [idx] : [];
        }

        let optHtml = '';
        if (dq.type === 'choice' && opts.length) {
            const modeTag = isMultiMode ? '<span style="margin-left:6px;font-size:10px;padding:1px 6px;border-radius:8px;background:rgba(7,193,96,0.12);color:#07c160;font-weight:600;">多选</span>' : '';
            optHtml = '<div style="display:flex;flex-direction:column;gap:7px;margin-top:10px;">'
                + opts.map((opt, oi) => {
                    const isSelected = selectedIndices.includes(oi);
                    const isUnanswered = !dq.answer;
                    const shapeStyle = isMultiMode ? 'border-radius:4px;' : 'border-radius:50%;';
                    return '<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;font-size:13.5px;transition:all .15s;'
                        + (isSelected
                            ? 'background:linear-gradient(135deg,#07c160,#05a550);color:#fff;font-weight:600;box-shadow:0 2px 8px rgba(7,193,96,.25);'
                            : isUnanswered
                                ? 'background:#fff;border:1.5px solid #e5e5ea;color:#333;'
                                : 'background:#f5f5f7;color:#888;border:1.5px solid transparent;')
                        + '">'
                        + '<span style="width:22px;height:22px;' + shapeStyle + 'display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;'
                        + (isSelected ? 'background:rgba(255,255,255,0.3);' : isUnanswered ? 'background:#f0f0f5;color:#999;' : 'background:rgba(0,0,0,0.06);')
                        + '">' + String.fromCharCode(65 + oi) + '</span>'
                        + '<span style="flex:1;">' + escapeHtml(opt) + '</span>'
                        + (isSelected ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : '')
                        + '</div>';
                }).join('')
                + '</div>';
            // 在题目标题行旁边追加多选标签（通过字符串拼接在标题段）
            optHtml = modeTag + optHtml;
        } else if (dq.type === 'fill') {
            const fillText = Array.isArray(rawSelected) ? rawSelected.join('、') : rawSelected;
            if (fillText) {
                optHtml = '<div style="margin-top:10px;padding:12px 14px;background:#fff;border-radius:12px;border:1.5px solid #e5e5ea;font-size:13.5px;color:#333;line-height:1.6;">' + escapeHtml(fillText) + '</div>';
            } else if (!dq.answer) {
                optHtml = '<div style="margin-top:8px;padding:10px 14px;background:#f5f5f7;border-radius:12px;font-size:13px;color:#bbb;font-style:italic;">等待填写…</div>';
            }
        }

        return '<div style="background:#fff;border-radius:16px;padding:16px;margin-bottom:12px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">'
            + '<div style="display:flex;align-items:flex-start;gap:8px;">'
            + '<span style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#07c160,#05a550);color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">' + (i + 1) + '</span>'
            + '<div style="font-size:14px;font-weight:600;color:#1a1a1a;line-height:1.5;flex:1;">' + escapeHtml(q.question) + '</div>'
            + '</div>'
            + optHtml
            + '</div>';
    }).join('');

    overlay.style.display = 'block';
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            sheet.style.transform = 'translateY(0)';
        });
    });
}

function closeDQChatDetail() {
    const overlay = document.getElementById('dq-chat-detail-overlay');
    const sheet = document.getElementById('dq-chat-detail-sheet');
    if (!overlay || !sheet) return;
    sheet.style.transform = 'translateY(100%)';
    setTimeout(() => { overlay.style.display = 'none'; }, 360);
}

window.openDQChatDetail = openDQChatDetail;
window.closeDQChatDetail = closeDQChatDetail;

// ─── 入口按钮绑定（梦向问卷）───────────────────────────────
(function () {
    function bindDQEntry() {
        const dqEntryBtn = document.getElementById('dream-questionnaire-function');
        if (dqEntryBtn && !dqEntryBtn.dataset.dqBound) {
            dqEntryBtn.dataset.dqBound = 'true';
            dqEntryBtn.addEventListener('click', async () => {
                const advModal = document.getElementById('advanced-modal');
                if (advModal && typeof hideModal === 'function') hideModal(advModal);
                if (typeof loadDQData === 'function') await loadDQData();
                if (typeof renderDQList === 'function') renderDQList();
                const modal = document.getElementById('dream-questionnaire-modal');
                if (modal && typeof showModal === 'function') showModal(modal);
            });
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindDQEntry);
    } else {
        bindDQEntry();
    }
    if (typeof loadDQData === 'function') {
        setTimeout(() => { try { loadDQData(); } catch (e) {} }, 1500);
    }
})();
