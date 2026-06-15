let envelopeData = { outbox: [], inbox: [], spacetime: [] };
let currentEnvTab = 'outbox';
let editingEnvId = null;
let editingEnvSection = null;

// 获取原信内容
function getOriginalContent(section, id) {
    if (!section || !id) return '';
    const letters = section === 'spacetime' ? envelopeData.spacetime : section === 'inbox' ? envelopeData.inbox : envelopeData.outbox;
    const letter = letters.find(l => l.id === id);
    return letter ? letter.content : '';
} 

async function loadEnvelopeData() {
    const saved = await localforage.getItem(getStorageKey('envelopeData'));
    if (saved) {
        envelopeData = saved;
        // 兼容旧数据：确保所有字段都存在
        if (!envelopeData.outbox) envelopeData.outbox = [];
        if (!envelopeData.inbox) envelopeData.inbox = [];
        if (!envelopeData.spacetime) envelopeData.spacetime = [];
    }
    const oldPending = await localforage.getItem(getStorageKey('pending_envelope'));
    if (oldPending && envelopeData.outbox.length === 0) {
        envelopeData.outbox.push({
            id: 'legacy_' + Date.now(),
            content: '（历史寄出的信件）',
            sentTime: oldPending.sentTime,
            replyTime: oldPending.replyTime,
            status: 'pending'
        });
        await localforage.removeItem(getStorageKey('pending_envelope'));
        saveEnvelopeData();
    }
}

function saveEnvelopeData() {
    localforage.setItem(getStorageKey('envelopeData'), envelopeData);
}

async function checkEnvelopeStatus() {
    await loadEnvelopeData();
    const now = Date.now();
    let changed = false;
    let newReplyLetter = null;

    // 先处理定时发送的信件
    envelopeData.outbox.forEach(letter => {
        if (letter.status === 'scheduled' && now >= letter.scheduleTime) {
            // 时间到了，执行发送
            letter.status = 'pending';
            letter.sentTime = now; // 更新实际发送时间
            changed = true;

            // 如果需要发送到聊天记录
            if (letter.sendToChat) {
                addMessage({ id: Date.now(), sender: 'user', text: `【寄出的信】\n${letter.content}`, timestamp: new Date(), status: 'sent', type: 'normal' });
            }

            // 显示通知
            const pName = (typeof settings !== 'undefined' && settings.partnerName) ? settings.partnerName : '梦角';
            showNotification(`定时信件已寄出，正在加急寄给 ${pName} ✉️`, 'success');
            playSound('message');
        }
    });

    // 再处理等待回信的信件
    envelopeData.outbox.forEach(letter => {
        if (letter.status === 'pending' && now >= letter.replyTime) {
            // 如果是回复时空来信，只有30%概率回信
            if (letter.replyToSection === 'spacetime' && letter.replyToId) {
                if (Math.random() >= 0.3) {
                    // 70%概率不回信，直接标记为replied
                    letter.status = 'replied';
                    changed = true;
                    return;
                }
            }

            letter.status = 'replied';
            const replyContent = generateEnvelopeReplyText();
            const replyId = 'reply_' + Date.now() + '_' + Math.random().toString(36).substr(2,4);
            const inboxLetter = {
                id: replyId,
                refId: letter.id,
                originalContent: letter.content,
                content: replyContent,
                receivedTime: Date.now(),
                isNew: true
            };
            envelopeData.inbox.push(inboxLetter);
            newReplyLetter = inboxLetter;
            changed = true;
            playSound('message');
        }
    });

    if (changed) {
        saveEnvelopeData();
        if (newReplyLetter) showEnvelopeReplyPopup(newReplyLetter);
    }
}

function showEnvelopeReplyPopup(letter) {
    const existing = document.getElementById('envelope-reply-popup');
    if (existing) existing.remove();
    const popup = document.createElement('div');
    popup.id = 'envelope-reply-popup';
    popup.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--secondary-bg);border:1px solid var(--border-color);border-radius:20px;padding:18px 20px;z-index:8000;max-width:320px;width:88%;box-shadow:0 8px 32px rgba(0,0,0,0.18);display:flex;flex-direction:column;gap:12px;animation:slideUpNotif 0.4s cubic-bezier(0.22,1,0.36,1);';
    popup.innerHTML = `
        <style>@keyframes slideUpNotif{from{opacity:0;transform:translateX(-50%) translateY(24px) scale(0.9)}60%{transform:translateX(-50%) translateY(-4px) scale(1.02)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}</style>
        <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:26px;">💌</span>
            <div>
                <div style="font-size:14px;font-weight:700;color:var(--text-primary);">收到了一封回信</div>
                <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;opacity:0.8;">Ta 给你写了回信，快去看看吧~</div>
            </div>
        </div>
        <div style="display:flex;gap:8px;">
            <button onclick="document.getElementById('envelope-reply-popup').remove();" style="flex:1;padding:8px 0;border-radius:12px;border:1px solid var(--border-color);background:var(--primary-bg);color:var(--text-secondary);font-size:13px;cursor:pointer;">稍后查看</button>
            <button onclick="openEnvelopeAndViewReply('${letter.id}');" style="flex:2;padding:8px 0;border-radius:12px;border:none;background:var(--accent-color);color:#fff;font-size:13px;font-weight:600;cursor:pointer;">立即阅读 ✉</button>
        </div>`;
    document.body.appendChild(popup);
    setTimeout(() => { if (popup.parentNode) popup.remove(); }, 8000);
}

const APPEARANCE_PANEL_TITLES = {
    'theme': '主题配色', 'font': '字体设置', 'background': '聊天背景',
    'bubble': '气泡样式', 'avatar': '聊天头像', 'css': '自定义CSS',
    'font-bg': '背景 & 字体', 'bubble-css': '气泡 & CSS'
};
window.showAppearancePanel = function(panel) {
    const panelMap = {
        'font-bg': ['font', 'background'],
        'bubble-css': ['bubble', 'css']
    };
    document.getElementById('appearance-nav-grid').style.display = 'none';
    var unBtn = document.getElementById('update-notice-btn');
    if (unBtn) unBtn.style.display = 'none';
    var galleryBanner = document.getElementById('gallery-banner-entry');
    if (galleryBanner) galleryBanner.style.display = 'none';
    document.getElementById('appearance-panel-container').style.display = 'block';
    document.getElementById('appearance-panel-title').textContent = APPEARANCE_PANEL_TITLES[panel] || panel;
    document.querySelectorAll('.appearance-sub-panel').forEach(p => p.style.display = 'none');
    if (panelMap[panel]) {
        panelMap[panel].forEach(sub => {
            const target = document.getElementById('appearance-panel-' + sub);
            if (target) target.style.display = 'block';
        });
    } else {
        const target = document.getElementById('appearance-panel-' + panel);
        if (target) target.style.display = 'block';
    }
    if (panel === 'bubble' || panel === 'bubble-css') { setTimeout(() => { if (typeof window.updateBubblePreviewFn === 'function') window.updateBubblePreviewFn(); }, 50); }
};
window.hideAppearancePanel = function() {
    document.getElementById('appearance-nav-grid').style.display = 'grid';
    document.getElementById('appearance-panel-container').style.display = 'none';
    document.querySelectorAll('.appearance-sub-panel').forEach(p => p.style.display = 'none');
    var unBtn = document.getElementById('update-notice-btn');
    if (unBtn) unBtn.style.display = 'flex';
    var galleryBanner = document.getElementById('gallery-banner-entry');
    if (galleryBanner) galleryBanner.style.display = 'flex';
};

window.openEnvelopeAndViewReply = function(replyId) {
    const popup = document.getElementById('envelope-reply-popup');
    if (popup) popup.remove();
    const envelopeModal = document.getElementById('envelope-modal');
    showModal(envelopeModal);
    setTimeout(() => {
        switchEnvTab('inbox');
        viewEnvLetter('inbox', replyId);
    }, 200);
};

function generateEnvelopeReplyText() {
    const sourcePool = [...customReplies];
    // 使用自定义设置或默认值
    let minSentences = 8, maxSentences = 12;
    if (typeof settings !== 'undefined' && settings.envelopeCustomRuleEnabled) {
        minSentences = settings.envelopeReplyMinSentences || 8;
        maxSentences = settings.envelopeReplyMaxSentences || 12;
    }
    const sentenceCount = Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences;
    let replyContent = "";
    for (let i = 0; i < sentenceCount; i++) {
        const randomSentence = sourcePool[Math.floor(Math.random() * sourcePool.length)];
        const punctuation = Math.random() < 0.2 ? "！" : (Math.random() < 0.2 ? "..." : "。");
        replyContent += randomSentence + punctuation;
    }
    return replyContent;
}


window.switchEnvTab = function(tab) {
    currentEnvTab = tab;
    document.getElementById('env-tab-outbox').classList.toggle('active', tab === 'outbox');
    document.getElementById('env-tab-inbox').classList.toggle('active', tab === 'inbox');
    document.getElementById('env-tab-spacetime').classList.toggle('active', tab === 'spacetime');
    document.getElementById('env-outbox-section').style.display = tab === 'outbox' ? 'block' : 'none';
    document.getElementById('env-inbox-section').style.display = tab === 'inbox' ? 'block' : 'none';
    document.getElementById('env-spacetime-section').style.display = tab === 'spacetime' ? 'block' : 'none';
    document.getElementById('env-compose-form').style.display = 'none';
    document.getElementById('env-main-close-btn').style.display = 'flex';
    renderEnvelopeLists();
};

function renderEnvelopeLists() {
    renderOutboxList();
    renderInboxList();
    renderSpacetimeList();
    const pendingCount = envelopeData.outbox.filter(l => l.status === 'pending').length;
    const newInboxCount = envelopeData.inbox.filter(l => l.isNew).length;
    const newSpacetimeCount = envelopeData.spacetime.filter(l => l.isNew).length;
    const outboxBadge = document.getElementById('env-outbox-badge');
    const inboxBadge = document.getElementById('env-inbox-badge');
    const spacetimeBadge = document.getElementById('env-spacetime-badge');
    if (outboxBadge) { outboxBadge.textContent = pendingCount; outboxBadge.style.display = pendingCount > 0 ? 'inline-block' : 'none'; }
    if (inboxBadge) { inboxBadge.textContent = newInboxCount; inboxBadge.style.display = newInboxCount > 0 ? 'inline-block' : 'none'; }
    if (spacetimeBadge) { spacetimeBadge.textContent = newSpacetimeCount; spacetimeBadge.style.display = newSpacetimeCount > 0 ? 'inline-block' : 'none'; }
    const envelopeEntryBadge = document.getElementById('env-entry-badge');
    if (envelopeEntryBadge) { envelopeEntryBadge.style.display = (newInboxCount + newSpacetimeCount) > 0 ? 'inline-block' : 'none'; }
}

function renderOutboxList() {
    const list = document.getElementById('env-outbox-list');
    if (!list) return;
    if (envelopeData.outbox.length === 0) {
        list.innerHTML = `<div class="env-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
            <div style="font-size:14px;font-weight:500;margin-top:4px;">还没有寄出任何信件</div>
            <div style="font-size:12px;margin-top:6px;opacity:0.6;">提笔写下心意，寄送给Ta吧~</div>
        </div>`;
        return;
    }
    list.innerHTML = envelopeData.outbox.slice().reverse().map(letter => {
        const date = new Date(letter.sentTime).toLocaleDateString('zh-CN', {month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'});
        const isScheduled = letter.status === 'scheduled';
        const isPending = letter.status === 'pending';
        let statusIcon, statusText;
        if (isScheduled) {
            const scheduleDate = new Date(letter.scheduleTime).toLocaleString('zh-CN', {month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'});
            statusIcon = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
            statusText = `${statusIcon} 定时发送 · ${scheduleDate}`;
        } else {
            statusIcon = isPending
                ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
                : `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
            statusText = isPending ? `${statusIcon} 等待回信` : `${statusIcon} 已收到回信`;
        }
        const preview = letter.content.length > 38 ? letter.content.substring(0, 38) + '…' : letter.content;
        // 检查是否是回复某封信
        const isReply = letter.replyToId && letter.replyToSection;
        const originalContent = isReply ? getOriginalContent(letter.replyToSection, letter.replyToId) : '';
        const origPreview = originalContent ? (originalContent.length > 32 ? originalContent.substring(0, 32) + '…' : originalContent) : '';
        return `
        <div class="env-letter-item" onclick="viewEnvLetter('outbox','${letter.id}')">
            <div class="env-letter-header">
                <div class="env-letter-header-from">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px;margin-right:3px;"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
                    ${isScheduled ? '定时' : '寄出'} · ${date}
                </div>
                <div class="env-stamp">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </div>
            </div>
            ${origPreview ? `<div style="padding:6px 12px 0;display:flex;align-items:flex-start;gap:6px;"><div style="width:2px;border-radius:2px;background:rgba(var(--accent-color-rgb),0.4);flex-shrink:0;align-self:stretch;min-height:14px;margin-top:1px;"></div><div style="font-size:11px;color:var(--text-secondary);font-style:italic;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:calc(100% - 14px);opacity:0.75;">回复: ${origPreview}</div></div>` : ''}
            <div class="env-letter-body">
                <div class="env-letter-preview">${preview}</div>
                <div class="env-letter-status">${statusText}</div>
            </div>
            <button class="env-letter-delete-btn" onclick="deleteEnvLetter(event,'outbox','${letter.id}')">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>`;
    }).join('');
}

function renderInboxList() {
    const list = document.getElementById('env-inbox-list');
    if (!list) return;
    if (envelopeData.inbox.length === 0) {
        list.innerHTML = `<div class="env-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/><polyline points="22 13 12 13"/><path d="M19 16l-5-3-5 3"/></svg>
            <div style="font-size:14px;font-weight:500;margin-top:4px;">还没有收到回信</div>
            <div style="font-size:12px;margin-top:6px;opacity:0.6;">对方正在认真回复中，请稍候~</div>
        </div>`;
        return;
    }
    list.innerHTML = envelopeData.inbox.slice().reverse().map(letter => {
        const date = new Date(letter.receivedTime).toLocaleDateString('zh-CN', {month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'});
        const preview = letter.content.length > 50 ? letter.content.substring(0, 50) + '…' : letter.content;
        const isNew = letter.isNew;
        const origPreview = letter.originalContent ? (letter.originalContent.length > 32 ? letter.originalContent.substring(0, 32) + '…' : letter.originalContent) : '';
        return `
        <div class="env-letter-item reply ${isNew ? 'env-letter-new' : ''}" onclick="viewEnvLetter('inbox','${letter.id}')">
            <div class="env-letter-header">
                <div class="env-letter-header-from">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px;margin-right:3px;"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
                    收到 · ${date}
                    ${isNew ? '<span style="background:rgba(255,255,255,0.3);color:#fff;font-size:9px;padding:1px 5px;border-radius:6px;margin-left:6px;">新</span>' : ''}
                </div>
                <div class="env-stamp">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
            </div>
            ${origPreview ? `<div style="padding:6px 12px 0;display:flex;align-items:flex-start;gap:6px;"><div style="width:2px;border-radius:2px;background:rgba(var(--accent-color-rgb),0.4);flex-shrink:0;align-self:stretch;min-height:14px;margin-top:1px;"></div><div style="font-size:11px;color:var(--text-secondary);font-style:italic;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:calc(100% - 14px);opacity:0.75;">原信: ${origPreview}</div></div>` : ''}
            <div class="env-letter-body">
                <div class="env-letter-preview">${preview}</div>
            </div>
            <button class="env-letter-delete-btn" onclick="deleteEnvLetter(event,'inbox','${letter.id}')">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>`;
    }).join('');
}

function renderSpacetimeList() {
    const list = document.getElementById('env-spacetime-list');
    if (!list) return;
    if (envelopeData.spacetime.length === 0) {
        list.innerHTML = `<div class="env-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/><path d="M2 12h20"/></svg>
            <div style="font-size:14px;font-weight:500;margin-top:4px;">还没有收到时空来信</div>
            <div style="font-size:12px;margin-top:6px;opacity:0.6;">开启"主动给我写信"后，系统会随机给你写信~</div>
        </div>`;
        return;
    }
    list.innerHTML = envelopeData.spacetime.slice().reverse().map(letter => {
        const date = new Date(letter.receivedTime).toLocaleDateString('zh-CN', {month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'});
        const preview = letter.content.length > 50 ? letter.content.substring(0, 50) + '…' : letter.content;
        const isNew = letter.isNew;
        // 检查是否已回复，用于添加 reply 类
        const hasReplied = envelopeData.outbox.some(l => l.replyToId === letter.id);
        return `
        <div class="env-letter-item ${hasReplied ? 'reply' : ''} ${isNew ? 'env-letter-new' : ''}" onclick="viewEnvLetter('spacetime','${letter.id}')">
            <div class="env-letter-header">
                <div class="env-letter-header-from">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px;margin-right:3px;"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/><path d="M2 12h20"/></svg>
                    时空 · ${date}
                    ${isNew ? '<span style="background:rgba(255,255,255,0.3);color:#fff;font-size:9px;padding:1px 5px;border-radius:6px;margin-left:6px;">新</span>' : ''}
                </div>
                <div class="env-stamp">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/><path d="M2 12h20"/></svg>
                </div>
            </div>
            <div class="env-letter-body">
                <div class="env-letter-preview">${preview}</div>
                ${hasReplied ? '<div class="env-letter-status"></div>' : ''}
            </div>
            <button class="env-letter-delete-btn" onclick="deleteEnvLetter(event,'spacetime','${letter.id}')">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>`;
    }).join('');
}

window.viewEnvLetter = function(section, id) {
    const letters = section === 'outbox' ? envelopeData.outbox : section === 'spacetime' ? envelopeData.spacetime : envelopeData.inbox;
    const letter = letters.find(l => l.id === id);
    if (!letter) return;
    if ((section === 'inbox' || section === 'spacetime') && letter.isNew) {
        letter.isNew = false;
        saveEnvelopeData();
        renderEnvelopeLists();
    }
    editingEnvId = id;
    editingEnvSection = section;

    let viewTitle = '收到的回信';
    if (section === 'outbox') viewTitle = '寄出的信';
    else if (section === 'spacetime') viewTitle = '时空来信';
    document.getElementById('env-view-title').textContent = viewTitle;

    const dateObj = letter.timestamp ? new Date(letter.timestamp) : (letter.receivedTime ? new Date(letter.receivedTime) : new Date());
    const y = dateObj.getFullYear();
    const mo = String(dateObj.getMonth()+1).padStart(2,'0');
    const d = String(dateObj.getDate()).padStart(2,'0');
    const dateStr = `${y}/${mo}/${d}`;
    const weekdays = ['日','一','二','三','四','五','六'];
    const fullDateStr = dateStr + ' 星期' + weekdays[dateObj.getDay()];

    const stampEl = document.getElementById('env-view-stamp-date');
    if (stampEl) stampEl.textContent = `${mo}/${d}`;

    const dateLine = document.getElementById('env-view-date-line');
    if (dateLine) dateLine.textContent = fullDateStr;

    const toLine = document.getElementById('env-view-to-line');
    const greetingLine = document.getElementById('env-view-greeting-line');
    if (section === 'outbox') {
        const partnerName = (typeof settings !== 'undefined' && settings.partnerName) || '亲爱的';
        if (toLine) toLine.textContent = `致 ${partnerName}：`;
        if (greetingLine) greetingLine.textContent = '见字如面，望君安好。';
    } else if (section === 'spacetime') {
        const myName = (typeof settings !== 'undefined' && settings.myName) || '你';
        if (toLine) toLine.textContent = `致 ${myName}：`;
        if (greetingLine) greetingLine.textContent = '见字如面，时空流转。';
    } else {
        const myName = (typeof settings !== 'undefined' && settings.myName) || '你';
        if (toLine) toLine.textContent = `致 ${myName}：`;
        if (greetingLine) greetingLine.textContent = '见字如面，一切皆好。';
    }

    const textEl = document.getElementById('env-view-text');
    if (textEl) textEl.textContent = letter.content;

    const signDateEl = document.getElementById('env-view-sign-date');
    const signNameEl = document.getElementById('env-view-sign-name');
    if (signDateEl) signDateEl.textContent = fullDateStr;
    if (section === 'outbox') {
        const myName = (typeof settings !== 'undefined' && settings.myName) || '你';
        if (signNameEl) signNameEl.textContent = myName;
    } else if (section === 'spacetime') {
        const partnerName = (typeof settings !== 'undefined' && settings.partnerName) || '时空';
        if (signNameEl) signNameEl.textContent = partnerName;
    } else {
        const partnerName = (typeof settings !== 'undefined' && settings.partnerName) || '对方';
        if (signNameEl) signNameEl.textContent = partnerName;
    }

    document.getElementById('env-edit-input').value = letter.content;
    document.getElementById('env-view-content').style.display = 'block';
    document.getElementById('env-view-edit').style.display = 'none';
    // outbox 和 spacetime 可以编辑，inbox（收到的回信）不能编辑
    document.getElementById('env-view-edit-btn').style.display = (section === 'outbox' || section === 'spacetime') ? 'inline-flex' : 'none';
    document.getElementById('env-view-save-btn').style.display = 'none';
    // inbox 和 spacetime 可以回复
    const replyBtn = document.getElementById('env-view-reply-btn');
    if (replyBtn) {
        replyBtn.style.display = (section === 'inbox' || section === 'spacetime') ? 'inline-flex' : 'none';
        replyBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px;margin-right:4px;"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>回复';
        replyBtn.dataset.mode = '';
        replyBtn.className = 'modal-btn modal-btn-secondary';
    }
    const origCtx = document.getElementById('env-view-original-ctx');
    const origText = document.getElementById('env-view-original-text');
    const origExpand = document.getElementById('env-view-original-expand');
    if (origCtx && origText) {
        // inbox 显示 originalContent（用户寄出的信）
        // outbox 如果是回复，显示 replyToSection 和 replyToId 对应的原信
        let originalContent = '';
        if (section === 'inbox' && letter.originalContent) {
            originalContent = letter.originalContent;
        } else if (section === 'outbox' && letter.replyToSection && letter.replyToId) {
            originalContent = getOriginalContent(letter.replyToSection, letter.replyToId);
        }
        if (originalContent) {
            origText.textContent = originalContent;
            origText.style.maxHeight = '80px';
            origCtx.style.display = 'block';
            if (origExpand) {
                origExpand.style.display = originalContent.length > 120 ? 'block' : 'none';
                origExpand.textContent = '展开查看全文';
            }
        } else {
            origCtx.style.display = 'none';
        }
    }
    showModal(document.getElementById('envelope-view-modal'));
};

window.toggleEnvEdit = function() {
    const contentEl = document.getElementById('env-view-content');
    const editEl = document.getElementById('env-view-edit');
    const editBtn = document.getElementById('env-view-edit-btn');
    const saveBtn = document.getElementById('env-view-save-btn');
    const isEditing = editEl.style.display !== 'none';
    if (isEditing) {
        contentEl.style.display = 'block';
        editEl.style.display = 'none';
        editBtn.textContent = '编辑';
        saveBtn.style.display = 'none';
    } else {
        contentEl.style.display = 'none';
        editEl.style.display = 'block';
        editBtn.textContent = '取消';
        saveBtn.style.display = 'inline-flex';
    }
};

window.saveEnvEdit = function() {
    const newContent = document.getElementById('env-edit-input').value.trim();
    if (!newContent) { showNotification('内容不能为空', 'warning'); return; }
    const letters = editingEnvSection === 'outbox' ? envelopeData.outbox : editingEnvSection === 'spacetime' ? envelopeData.spacetime : envelopeData.inbox;
    const letter = letters.find(l => l.id === editingEnvId);
    if (letter) {
        letter.content = newContent;
        saveEnvelopeData();
        const textEl = document.getElementById('env-view-text');
        if (textEl) textEl.textContent = newContent;
        showNotification('已保存修改', 'success');
        toggleEnvEdit();
    }
};

window.closeEnvViewModal = function() {
    hideModal(document.getElementById('envelope-view-modal'));
};

// 回复时空来信（或收到的回信）
window.replyToEnvLetter = function() {
    const replyBtn = document.getElementById('env-view-reply-btn');
    if (!replyBtn) return;

    // 切换到回复输入模式
    const contentEl = document.getElementById('env-view-content');
    const editEl = document.getElementById('env-view-edit');
    const editBtn = document.getElementById('env-view-edit-btn');
    const saveBtn = document.getElementById('env-view-save-btn');
    const editInput = document.getElementById('env-edit-input');

    if (!contentEl || !editEl || !editInput) return;

    // 如果已经在回复模式，执行发送
    if (replyBtn.dataset.mode === 'sending') {
        const text = editInput.value.trim();
        if (!text) { showNotification('回复内容不能为空', 'warning'); return; }

        // 使用自定义设置或默认值计算回信时间
        let minMs = 10 * 60 * 60 * 1000, maxMs = 24 * 60 * 60 * 1000;
        if (typeof settings !== 'undefined' && settings.envelopeCustomRuleEnabled) {
            const unitToMs = { minutes: 60 * 1000, hours: 60 * 60 * 1000, days: 24 * 60 * 60 * 1000 };
            const minVal = settings.envelopeReplyMinVal || 10;
            const maxVal = settings.envelopeReplyMaxVal || 24;
            const minUnit = unitToMs[settings.envelopeReplyMinUnit] || unitToMs.hours;
            const maxUnit = unitToMs[settings.envelopeReplyMaxUnit] || unitToMs.hours;
            minMs = minVal * minUnit;
            maxMs = maxVal * maxUnit;
        }
        const randomMs = Math.random() * (maxMs - minMs) + minMs;
        const replyTime = Date.now() + randomMs;

        const newId = 'env_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
        const replyLetter = {
            id: newId,
            content: text,
            sentTime: Date.now(),
            replyTime: replyTime,
            status: 'pending',
            replyToId: editingEnvId,       // 关联到哪封信
            replyToSection: editingEnvSection  // 关联到哪个板块
        };
        envelopeData.outbox.push(replyLetter);
        saveEnvelopeData();

        // 退出回复模式
        contentEl.style.display = 'block';
        editEl.style.display = 'none';
        replyBtn.textContent = '回复';
        replyBtn.dataset.mode = '';
        replyBtn.className = 'modal-btn modal-btn-secondary';
        if (editBtn) editBtn.style.display = 'inline-flex';
        if (saveBtn) saveBtn.style.display = 'none';

        // 获取梦角昵称
        const pName = (typeof settings !== 'undefined' && settings.partnerName) ? settings.partnerName : '梦角';

        showNotification(`回信已寄出，正在加急寄给 ${pName} ✉️`, 'success');
        hideModal(document.getElementById('envelope-view-modal'));
        renderEnvelopeLists();
        return;
    }

    // 进入回复模式
    contentEl.style.display = 'none';
    editEl.style.display = 'block';
    editInput.value = '';
    editInput.placeholder = '写下你的回复...';
    editInput.focus();
    if (editBtn) editBtn.style.display = 'none';
    if (saveBtn) saveBtn.style.display = 'none';

    replyBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px;margin-right:4px;"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>发送';
    replyBtn.dataset.mode = 'sending';
    replyBtn.className = 'modal-btn modal-btn-primary';
};

window.deleteEnvLetter = function(event, section, id) {
    event.stopPropagation();
    if (!confirm('确定要删除这封信吗？')) return;
    if (section === 'outbox') {
        envelopeData.outbox = envelopeData.outbox.filter(l => l.id !== id);
    } else if (section === 'spacetime') {
        envelopeData.spacetime = envelopeData.spacetime.filter(l => l.id !== id);
    } else {
        envelopeData.inbox = envelopeData.inbox.filter(l => l.id !== id);
    }
    saveEnvelopeData();
    renderEnvelopeLists();
    showNotification('已删除', 'success');
};

window.openNewEnvelopeForm = function() {
    document.getElementById('env-outbox-section').style.display = 'none';
    document.getElementById('env-inbox-section').style.display = 'none';
    document.getElementById('env-spacetime-section').style.display = 'none';
    document.getElementById('env-main-close-btn').style.display = 'none';
    document.getElementById('env-compose-title').textContent = '写一封信';
    document.getElementById('envelope-input').value = '';
    document.getElementById('env-send-to-chat').checked = false;
    document.getElementById('env-compose-form').style.display = 'block';
};

window.cancelEnvelopeCompose = function() {
    document.getElementById('env-compose-form').style.display = 'none';
    document.getElementById('env-main-close-btn').style.display = 'flex';
    document.getElementById('env-outbox-section').style.display = currentEnvTab === 'outbox' ? 'block' : 'none';
    document.getElementById('env-inbox-section').style.display = currentEnvTab === 'inbox' ? 'block' : 'none';
    document.getElementById('env-spacetime-section').style.display = currentEnvTab === 'spacetime' ? 'block' : 'none';
};

function handleSendEnvelope() {
    const text = document.getElementById('envelope-input').value.trim();
    if (!text) { showNotification('信件内容不能为空', 'warning'); return; }

    const sendToChat = document.getElementById('env-send-to-chat').checked;
    const scheduleSend = document.getElementById('env-schedule-send').checked;
    const scheduleTimeInput = document.getElementById('env-schedule-time').value;

    // 检查是否定时发送
    let scheduleTime = null;
    if (scheduleSend && scheduleTimeInput) {
        scheduleTime = new Date(scheduleTimeInput).getTime();
        if (scheduleTime <= Date.now()) {
            showNotification('定时时间必须在未来', 'warning');
            return;
        }
    }

    if (sendToChat && !scheduleSend) {
        addMessage({ id: Date.now(), sender: 'user', text: `【寄出的信】\n${text}`, timestamp: new Date(), status: 'sent', type: 'normal' });
    }

    // 使用自定义设置或默认值
    let minMs = 10 * 60 * 60 * 1000, maxMs = 24 * 60 * 60 * 1000;
    if (typeof settings !== 'undefined' && settings.envelopeCustomRuleEnabled) {
        const unitToMs = { minutes: 60 * 1000, hours: 60 * 60 * 1000, days: 24 * 60 * 60 * 1000 };
        const minVal = settings.envelopeReplyMinVal || 10;
        const maxVal = settings.envelopeReplyMaxVal || 24;
        const minUnit = unitToMs[settings.envelopeReplyMinUnit] || unitToMs.hours;
        const maxUnit = unitToMs[settings.envelopeReplyMaxUnit] || unitToMs.hours;
        minMs = minVal * minUnit;
        maxMs = maxVal * maxUnit;
    }
    const randomMs = Math.random() * (maxMs - minMs) + minMs;
    const replyTime = Date.now() + randomMs;
    const newId = 'env_' + Date.now() + '_' + Math.random().toString(36).substr(2,4);

    // 创建信件对象
    const letterObj = {
        id: newId, content: text,
        sentTime: Date.now(), replyTime,
        status: 'pending'
    };

    // 如果是定时发送，添加 schedule 相关字段
    if (scheduleSend && scheduleTime) {
        letterObj.scheduleTime = scheduleTime;
        letterObj.status = 'scheduled';  // scheduled 状态表示等待定时发送
        letterObj.sendToChat = sendToChat;  // 记录是否需要发送到聊天记录
    }

    envelopeData.outbox.push(letterObj);
    saveEnvelopeData();

    cancelEnvelopeCompose();
    switchEnvTab('outbox');

    // 获取梦角昵称
    const pName = (typeof settings !== 'undefined' && settings.partnerName) ? settings.partnerName : '梦角';

    if (scheduleSend && scheduleTime) {
        const scheduleDateStr = new Date(scheduleTime).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        showNotification(`信件已设定，将在 ${scheduleDateStr} 寄给 ${pName} ✉️`, 'success');
    } else {
        showNotification(`信件已寄出，正在加急寄给 ${pName} ✉️`, 'success');
    }
}

// 时空来信：系统随机写信给用户（使用回复库）
function generateRandomEnvelopeLetter() {
    // 使用回复库生成信件内容
    const sourcePool = [...customReplies];
    if (sourcePool.length === 0) {
        console.warn('回复库为空，无法生成时空来信');
        return;
    }
    
    // 随机选择 5-12 句话合成一段信件，统一使用句号
    const sentenceCount = Math.floor(Math.random() * 8) + 5;
    let sentences = [];
    for (let i = 0; i < sentenceCount; i++) {
        const randomSentence = sourcePool[Math.floor(Math.random() * sourcePool.length)];
        sentences.push(randomSentence + '。');
    }
    // 合成一段，在句号后随机插入换行（确保不拆分句子）
    let content = sentences.join('');
    // 找到所有句号的位置
    const periodPositions = [];
    for (let i = 0; i < content.length; i++) {
        if (content[i] === '。') periodPositions.push(i);
    }
    // 随机选择 1-3 个句号位置插入换行
    const breakCount = Math.min(Math.floor(Math.random() * 3) + 1, periodPositions.length);
    const shuffledPositions = periodPositions.sort(() => Math.random() - 0.5);
    for (let b = 0; b < breakCount; b++) {
        const pos = shuffledPositions[b] + 1; // 在句号后面插入
        content = content.substring(0, pos) + '\n' + content.substring(pos);
        // 更新后续位置（因为插入了字符）
        for (let j = b + 1; j < shuffledPositions.length; j++) {
            if (shuffledPositions[j] > pos - 1) shuffledPositions[j]++;
        }
    }
    
    // 创建信件放入时空来信
    const newLetter = {
        id: 'auto_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        content: content.trim(),
        receivedTime: Date.now(),
        isNew: true
    };
    
    envelopeData.spacetime.push(newLetter);
    saveEnvelopeData();
    
    // 显示通知
    if (typeof showNotification === 'function') {
        showNotification('📬 收到一封来自时空的信件！', 'success');
    }
    
    // 如果信封模态框打开，刷新列表
    if (currentEnvTab === 'spacetime') {
        renderEnvelopeLists();
    }
}

// 暴露到全局
window.generateRandomEnvelopeLetter = generateRandomEnvelopeLetter;

