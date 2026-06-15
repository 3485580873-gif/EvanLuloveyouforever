/**
 * 礼物柜模块 - gift-cabinet.js
 * 独立管理"我的礼物柜"功能
 * 依赖：window.ShopApp（需要 state、saveData、getProductThumbHtml）
 */
(function() {
    'use strict';

    // ========== 礼物柜操作 ==========

    function openGiftCabinet() {
        const modal = document.getElementById('gift-cabinet-modal');
        if (modal) {
            renderGiftCabinetList();
            modal.classList.add('active');
        }
    }

    function closeGiftCabinet() {
        const modal = document.getElementById('gift-cabinet-modal');
        if (modal) modal.classList.remove('active');
    }

    function renderGiftCabinetList() {
        const listEl = document.getElementById('gift-cabinet-list');
        if (!listEl) return;

        const shopApp = window.ShopApp;
        const state = shopApp ? shopApp._getState() : null;
        const items = state ? (state.myGiftCabinet || []) : [];

        if (items.length === 0) {
            listEl.innerHTML = '<div style="text-align:center;color:var(--text-light);padding:20px;font-size:0.85rem;">礼物柜还是空的~</div>';
            return;
        }

        const getThumb = shopApp && shopApp.getProductThumbHtml
            ? shopApp.getProductThumbHtml.bind(shopApp)
            : function(item, size) {
                const s = size || 48;
                if (item.img && typeof item.img === 'string' && item.img.startsWith('data:')) {
                    return `<img src="${item.img}" style="width:${s}px;height:${s}px;object-fit:cover;border-radius:6px;">`;
                }
                return `<span style="font-size:${s * 0.5}px;">${item.icon || '📦'}</span>`;
            };

        listEl.innerHTML = items.map(item => {
            const thumbHtml = getThumb(item, 48);
            const timeStr = item.time ? new Date(item.time).toLocaleString('zh-CN', { month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit' }) : '';
            return `<div style="display:flex;gap:10px;align-items:center;padding:10px;background:var(--primary-bg);border-radius:10px;margin-bottom:8px;border:1px solid var(--border-color);">
                <div style="width:48px;height:48px;background:#f0f0f0;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;">${thumbHtml}</div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:0.85rem;font-weight:600;color:var(--text-color);">${item.name}</div>
                    <div style="font-size:0.78rem;color:#ff4757;font-weight:700;">¥${item.price} x${item.qty}</div>
                    <div style="font-size:0.68rem;color:var(--text-light);margin-top:2px;">${timeStr}</div>
                </div>
            </div>`;
        }).join('');
    }

    /**
     * 添加商品到我的礼物柜
     * @param {Object} product - 商品对象 { name, icon, img, price }
     * @param {number} qty - 数量
     * @param {string} source - 来源（购买/代付/自动购买/给梦角买）
     * @param {string} orderId - 关联订单ID（用于取消订单时精确删除）
     */
    function addToMyGiftCabinet(product, qty, source, orderId) {
        const shopApp = window.ShopApp;
        if (!shopApp) return;

        const state = shopApp._getState();
        if (!state.myGiftCabinet) state.myGiftCabinet = [];

        state.myGiftCabinet.unshift({
            name: product.name,
            icon: product.icon,
            img: product.img,
            price: product.price,
            qty: qty || 1,
            source: source || '购买',
            orderId: orderId || null,
            time: Date.now()
        });

        try { shopApp._saveData(); } catch (e) {}
    }

    // 暴露到全局
    window.GiftCabinetApp = {
        open: openGiftCabinet,
        close: closeGiftCabinet,
        render: renderGiftCabinetList,
        add: addToMyGiftCabinet
    };

})();
