/**
 * TA的手机 - 系统自动收藏用户发过的朋友圈和聊天内容
 */
(function() {
    'use strict';

    const STORAGE_KEY = 'ta_phone_collections';
    const CHAT_CHANCE = 0.02;     // 聊天实时收藏概率 2%
    const MOMENTS_CHANCE = 0.10;  // 朋友圈实时收藏概率 10%
    const CHAT_HISTORY_CHANCE = 0.03;    // 历史聊天收藏概率 3%
    const MOMENTS_HISTORY_CHANCE = 0.05; // 历史朋友圈收藏概率 5%

    let collections = { chat: [], moments: [] };
    let chatSortMode = 'collected'; // 'collected' 按收藏时间, 'original-asc' 按发言时间正序, 'original-desc' 按发言时间倒序

    // 加载收藏数据
    function loadCollections() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.chat) collections.chat = parsed.chat;
                if (parsed.moments) collections.moments = parsed.moments;
            }
        } catch(e) {}
    }

    // 保存收藏数据
    function saveCollections() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
        } catch(e) {
            console.warn('[TA的手机] 保存收藏失败:', e);
        }
    }

    // 添加收藏
    function addCollection(type, content, originalTime, extra) {
        const item = {
            id: Date.now() + Math.random(),
            content: content,
            originalTime: originalTime || Date.now(),
            collectedTime: Date.now()
        };
        if (extra) {
            if (extra.msgType) item.msgType = extra.msgType;
            if (extra.shareData) item.shareData = extra.shareData;
        }
        collections[type].unshift(item);
        saveCollections();
    }

    // 删除收藏（带确认提示）
    function deleteCollection(type, id) {
        if (!confirm('是否要偷偷取消他的收藏？')) return;
        collections[type] = collections[type].filter(item => item.id !== id);
        saveCollections();
        renderList(type);
    }

    // 尝试收藏聊天消息（返回是否收藏成功）
    function tryCollectChat(text, timestamp, msgRef) {
        if (!text || text.trim().length === 0) return false;
        if (Math.random() < CHAT_CHANCE) {
            var extra = null;
            if (msgRef && typeof msgRef === 'object') {
                msgRef.taPhoneCollected = true;
                if (msgRef.type === 'share' && msgRef.shareData) {
                    extra = { msgType: msgRef.type, shareData: msgRef.shareData };
                }
            }
            addCollection('chat', text.trim(), timestamp, extra);
            return true;
        }
        return false;
    }

    // 尝试收藏朋友圈（返回是否收藏成功）
    function tryCollectMoment(text, timestamp, momentRef) {
        if (!text || text.trim().length === 0) return false;
        if (Math.random() < MOMENTS_CHANCE) {
            addCollection('moments', text.trim(), timestamp);
            // 在原始朋友圈上打标记
            if (momentRef && typeof momentRef === 'object') {
                momentRef.taPhoneCollected = true;
            }
            return true;
        }
        return false;
    }

    // 扫描历史内容（只扫描未标记的消息）
    function scanHistory() {
        if (typeof messages !== 'undefined' && Array.isArray(messages)) {
            messages.forEach(msg => {
                // 跳过已标记的消息
                if (msg.taPhoneCollected) return;
                if (msg.sender === 'user' && msg.text && msg.text.trim()) {
                    const alreadyCollected = collections.chat.some(c =>
                        c.content === msg.text.trim() && c.originalTime === msg.timestamp.getTime()
                    );
                    if (!alreadyCollected && Math.random() < CHAT_HISTORY_CHANCE) {
                        var extra = null;
                        if (msg.type === 'share' && msg.shareData) {
                            extra = { msgType: msg.type, shareData: msg.shareData };
                        }
                        addCollection('chat', msg.text.trim(), msg.timestamp.getTime(), extra);
                        // 打标记
                        msg.taPhoneCollected = true;
                    }
                }
            });
        }

        if (typeof momentsData !== 'undefined' && Array.isArray(momentsData)) {
            momentsData.forEach(moment => {
                // 跳过已标记的朋友圈
                if (moment.taPhoneCollected) return;
                if (moment.text && moment.text.trim()) {
                    const alreadyCollected = collections.moments.some(c =>
                        c.content === moment.text.trim() && c.originalTime === moment.time
                    );
                    if (!alreadyCollected && Math.random() < MOMENTS_HISTORY_CHANCE) {
                        addCollection('moments', moment.text.trim(), moment.time);
                        // 打标记
                        moment.taPhoneCollected = true;
                    }
                }
            });
        }
    }

    // 格式化时间
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hour}:${minute}`;
    }

    // 渲染列表
    function renderList(type) {
        const listEl = document.getElementById('ta-phone-list');
        if (!listEl) return;

        let items = collections[type];
        if (items.length === 0) {
            listEl.innerHTML = '<div class="ta-phone-empty">TA还没有收藏任何内容...</div>';
            return;
        }

        // 聊天支持排序
        if (type === 'chat' && chatSortMode === 'original-asc') {
            items = [...items].sort((a, b) => (a.originalTime || 0) - (b.originalTime || 0));
        } else if (type === 'chat' && chatSortMode === 'original-desc') {
            items = [...items].sort((a, b) => (b.originalTime || 0) - (a.originalTime || 0));
        } else {
            items = [...items].sort((a, b) => (b.collectedTime || 0) - (a.collectedTime || 0));
        }

        listEl.innerHTML = items.map(item => {
            const meta = `发送于: ${formatTime(item.originalTime)} | 收藏于: ${formatTime(item.collectedTime)}`;
            // 商品消息显示为【商品：xxx】
            var displayText = item.content;
            if (item.msgType === 'share' && item.shareData && item.shareData.name) {
                displayText = '【商品：' + item.shareData.name + '】';
            }
            return `
                <div class="ta-phone-item">
                    <button class="ta-phone-item-delete" onclick="window.TaPhoneApp.deleteCollection('${type}', ${item.id})" title="删除">×</button>
                    <div class="ta-phone-item-time">${formatTime(item.originalTime)}</div>
                    <div class="ta-phone-item-text">${escapeHtml(displayText)}</div>
                    <div class="ta-phone-item-meta">${meta}</div>
                </div>
            `;
        }).join('');
    }

    function setChatSortMode(mode) {
        chatSortMode = mode;
        // 更新按钮样式
        document.querySelectorAll('#ta-phone-sort-bar button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.sort === mode);
        });
        renderList('chat');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 渲染礼物柜
    function renderGiftCabinet() {
        const listEl = document.getElementById('ta-phone-list');
        if (!listEl) return;

        // 优先从 ShopApp 获取（IndexedDB 数据）
        let gifts = [];
        if (window.ShopApp && typeof window.ShopApp.getGiftCabinet === 'function') {
            gifts = window.ShopApp.getGiftCabinet();
        }
        // 兜底从 localStorage 读取
        if (!gifts || gifts.length === 0) {
            try {
                const saved = localStorage.getItem('shop_gift_cabinet');
                if (saved) gifts = JSON.parse(saved);
            } catch(e) {}
        }

        if (!gifts || gifts.length === 0) {
            listEl.innerHTML = '<div class="ta-phone-empty">礼物柜还是空的，快去商城给TA买礼物吧~</div>';
            return;
        }

        listEl.innerHTML = gifts.map((item, idx) => {
            const replyPreview = item.replies && item.replies.length > 0
                ? `<div style="margin-top:8px;padding:8px;background:rgba(233,69,96,0.08);border-radius:8px;font-size:0.78rem;color:#c0392b;line-height:1.4;">${item.replies[0].text}</div>`
                : '';
            return `
                <div class="ta-phone-item">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                        <span style="font-size:1.5rem;">${item.icon || '📦'}</span>
                        <div style="flex:1;">
                            <div style="font-weight:600;font-size:0.9rem;">${item.name}</div>
                            <div style="font-size:0.72rem;color:var(--text-light);">¥${item.price} x ${item.qty}</div>
                        </div>
                    </div>
                    <div class="ta-phone-item-time">${formatTime(item.time)}</div>
                    ${item.remark ? `<div style="font-size:0.78rem;color:#b37400;margin-top:4px;">备注: ${escapeHtml(item.remark)}</div>` : ''}
                    ${replyPreview}
                    ${item.replies && item.replies.length > 1 ? `<button style="margin-top:8px;background:none;border:none;color:var(--accent-color);font-size:0.75rem;cursor:pointer;" onclick="window.TaPhoneApp.showGiftReplies(${idx})">查看全部回复 (${item.replies.length}条)</button>` : ''}
                </div>
            `;
        }).join('');
    }

    // 显示礼物柜中的回复
    function showGiftReplies(idx) {
        // 隐藏排序栏（礼物柜回复页面不需要）
        const sortBar = document.getElementById('ta-phone-sort-bar');
        if (sortBar) sortBar.style.display = 'none';

        let gifts = [];
        // 优先从 ShopApp 获取（与 renderGiftCabinet 保持一致）
        if (window.ShopApp && typeof window.ShopApp.getGiftCabinet === 'function') {
            gifts = window.ShopApp.getGiftCabinet();
        }
        if (!gifts || gifts.length === 0) {
            try {
                const saved = localStorage.getItem('shop_gift_cabinet');
                if (saved) gifts = JSON.parse(saved);
            } catch(e) {}
        }
        const item = gifts[idx];
        if (!item || !item.replies) return;

        const listEl = document.getElementById('ta-phone-list');
        listEl.innerHTML = `
            <div style="margin-bottom:12px;">
                <button class="ta-phone-back" onclick="window.TaPhoneApp.showTaPhoneTab('gifts')" style="margin-bottom:10px;">← 返回礼物柜</button>
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:2rem;">${item.icon || '📦'}</span>
                    <div>
                        <div style="font-weight:700;">${item.name}</div>
                        <div style="font-size:0.8rem;color:var(--text-light);">¥${item.price} x ${item.qty}</div>
                    </div>
                </div>
            </div>
            ${item.replies.map(r => `
                <div style="background:var(--primary-bg);border-radius:10px;padding:12px;margin-bottom:10px;border:1px solid var(--border-color);">
                    <div style="font-size:0.72rem;color:var(--text-light);margin-bottom:6px;">${r.time || ''}</div>
                    <div style="font-size:0.88rem;line-height:1.5;">${r.text || ''}</div>
                    ${r.img ? `<img src="${r.img}" style="max-width:100%;border-radius:8px;margin-top:6px;">` : ''}
                </div>
            `).join('')}
        `;
    }

    // 显示TA的手机弹窗
    function showTaPhone() {
        const container = document.getElementById('ta-phone-container');
        if (!container) return;
        // 确保容器在 body 下
        if (container.parentElement !== document.body) {
            document.body.appendChild(container);
        }
        container.style.display = 'flex';
        showDesktop();
    }

    // 隐藏TA的手机弹窗
    function hideTaPhone() {
        const container = document.getElementById('ta-phone-container');
        if (container) {
            container.style.display = 'none';
        }
        showDesktop();
    }

    // 显示桌面
    function showDesktop() {
        const desktop = document.querySelector('.ta-phone-desktop');
        const content = document.getElementById('ta-phone-content');
        if (desktop) desktop.style.display = 'flex';
        if (content) content.style.display = 'none';
        updateTitle('TA的手机');
    }

    // 一级级返回
    function goBack() {
        const content = document.getElementById('ta-phone-content');
        if (content && content.style.display !== 'none') {
            // 当前在内容列表，返回桌面
            showDesktop();
        } else {
            // 当前在桌面，关闭弹窗
            hideTaPhone();
        }
    }

    // 更新标题
    function updateTitle(text) {
        const titleEl = document.getElementById('ta-phone-header-title');
        if (titleEl) titleEl.textContent = text;
    }

    // 显示标签内容
    function showTaPhoneTab(type) {
        const desktop = document.querySelector('.ta-phone-desktop');
        const content = document.getElementById('ta-phone-content');
        if (desktop) desktop.style.display = 'none';
        if (content) content.style.display = 'flex';

        document.querySelectorAll('.ta-phone-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === type);
        });

        if (type === 'gifts') {
            updateTitle('礼物柜');
            renderGiftCabinet();
            const sortBar = document.getElementById('ta-phone-sort-bar');
            if (sortBar) sortBar.style.display = 'none';
        } else {
            updateTitle(type === 'chat' ? '聊天' : '朋友圈');
            renderList(type);
            // 聊天页显示排序选项
            const sortBar = document.getElementById('ta-phone-sort-bar');
            if (sortBar) {
                sortBar.style.display = type === 'chat' ? 'flex' : 'none';
            }
        }
    }

    // 动态注入 CSS
    function injectStyles() {
        if (document.getElementById('ta-phone-styles')) return;
        const style = document.createElement('style');
        style.id = 'ta-phone-styles';
        style.textContent = `
            /* 弹窗遮罩 + 居中弹窗 */
            .ta-phone-container {
                position: fixed !important;
                top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
                z-index: 100000 !important;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0,0,0,0.5) !important;
            }
            /* 弹窗卡片 */
            .ta-phone-modal {
                background: var(--primary-bg, #16213e);
                border-radius: 16px;
                width: 320px;
                max-height: 70vh;
                overflow: hidden;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                display: flex;
                flex-direction: column;
            }
            /* 弹窗主体 */
            .ta-phone-header {
                background: var(--primary-bg, #16213e);
                border-radius: 16px 16px 0 0;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 14px 18px;
                border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.08));
            }
            .ta-phone-back {
                background: none;
                border: none;
                color: var(--accent-color, #e94560);
                font-size: 0.9rem;
                cursor: pointer;
            }
            .ta-phone-title {
                font-weight: 700;
                font-size: 1rem;
                color: var(--text, #e0e0e0);
            }
            /* 桌面区域（弹窗内部） */
            .ta-phone-desktop {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 36px;
                padding: 50px 20px;
                flex-shrink: 0;
            }
            .ta-phone-app {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                cursor: pointer;
            }
            .ta-phone-app:active {
                opacity: 0.7;
            }
            .ta-phone-app-icon {
                width: 56px;
                height: 56px;
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--border-color, rgba(255,255,255,0.08));
                color: var(--text, #e0e0e0);
            }
            .ta-phone-app-icon svg {
                width: 28px;
                height: 28px;
            }
            .ta-phone-app-name {
                font-size: 0.8rem;
                color: var(--text-light, #a0a0a0);
            }
            /* 内容列表区域 */
            .ta-phone-content {
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            .ta-phone-tabs {
                display: flex;
                border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.08));
                flex-shrink: 0;
            }
            .ta-phone-tab {
                flex: 1;
                padding: 10px;
                background: none;
                border: none;
                border-bottom: 2px solid transparent;
                color: var(--text-light, #a0a0a0);
                font-size: 0.85rem;
                cursor: pointer;
            }
            .ta-phone-tab.active {
                color: var(--accent-color, #e94560);
                border-bottom-color: var(--accent-color, #e94560);
            }
            .ta-phone-list {
                flex: 1;
                overflow-y: auto;
                padding: 10px;
            }
            .ta-phone-item {
                background: var(--secondary-bg, #1a1a2e);
                border-radius: 10px;
                padding: 12px;
                margin-bottom: 8px;
                position: relative;
            }
            .ta-phone-item-time {
                font-size: 0.72rem;
                color: var(--text-light, #a0a0a0);
                margin-bottom: 4px;
            }
            .ta-phone-item-text {
                font-size: 0.88rem;
                color: #000000;
                line-height: 1.5;
                word-break: break-all;
            }
            html[data-theme="dark"] .ta-phone-item-text {
                color: #ffffff;
            }
            .ta-phone-item-meta {
                font-size: 0.72rem;
                color: var(--text-light, #a0a0a0);
                margin-top: 4px;
            }
            .ta-phone-sort-btn.active {
                border-color: var(--accent-color, #e94560) !important;
                color: var(--accent-color, #e94560) !important;
            }
            .ta-phone-item-delete {
                position: absolute;
                top: 8px;
                right: 8px;
                background: none;
                border: none;
                color: var(--text-light, #a0a0a0);
                font-size: 1.1rem;
                cursor: pointer;
                opacity: 0.5;
                line-height: 1;
            }
            .ta-phone-item-delete:hover {
                opacity: 1;
                color: #ef4444;
            }
            .ta-phone-empty {
                text-align: center;
                padding: 30px;
                color: var(--text-light, #a0a0a0);
                font-size: 0.85rem;
            }
        `;
        document.head.appendChild(style);
    }

    let _historyScanned = false;

    // 初始化
    function init() {
        injectStyles();
        loadCollections();
        if (!_historyScanned) {
            _historyScanned = true;
            setTimeout(scanHistory, 2000);
        }
    }

    // 暴露到全局
    window.TaPhoneApp = {
        init,
        showTaPhone,
        hideTaPhone,
        goBack,
        showDesktop,
        showTaPhoneTab,
        deleteCollection,
        tryCollectChat,
        tryCollectMoment,
        showGiftReplies,
        setChatSortMode
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
