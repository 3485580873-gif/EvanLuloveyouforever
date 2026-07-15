/**
 * red-packet.js - 红包功能模块
 * 集成到同心账单项目，使用 transferData 全局状态
 */

(function () {
    'use strict';

    // ========== 工具函数 ==========

    /** 金额格式化：分 -> 元 */
    function fmt(n) {
        return (n / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    /** 生成唯一 ID */
    function genId() {
        return 'rp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    /** 获取对方昵称 */
    function getPartnerName() {
        return (typeof settings !== 'undefined' && settings.partnerName) ? settings.partnerName : '对方';
    }

    /** 获取我的昵称 */
    function getMyName() {
        return (typeof settings !== 'undefined' && settings.myName) ? settings.myName : '我';
    }

    /** 红包袋 SVG 图标 */
    var RP_SVG = '<svg width="36" height="44" viewBox="0 0 20 28" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="5" width="18" height="14" rx="2.5"/><path d="M1 9h18M5 13h4" stroke-linecap="round"/><circle cx="15" cy="13" r="1.8" fill="#fff" stroke="none"/></svg>';

    // ========== 节日检测 ==========

    function getFestivals() {
        var now = new Date();
        var m = now.getMonth() + 1;
        var d = now.getDate();
        var festivals = [
            { month: 1, day: 1, name: '元旦', messages: ['新年快乐!', '元旦快乐', '新的一年加油~', '万事如意'] },
            { month: 2, day: 14, name: '情人节', messages: ['情人节快乐', '永远爱你', '你是我最珍贵的', '甜蜜每一天'] },
            { month: 3, day: 8, name: '妇女节', messages: ['女神节快乐', '你是最美的', '做自己的女王'] },
            { month: 4, day: 1, name: '愚人节', messages: ['愚人节快乐', '今天你被套路了吗', '哈哈开个玩笑~'] },
            { month: 5, day: 1, name: '劳动节', messages: ['劳动节快乐', '辛苦了~', '好好休息一下吧'] },
            { month: 5, day: 20, name: '520', messages: ['520快乐', '我爱你', '一生一世', '你是我心中唯一'] },
            { month: 6, day: 1, name: '儿童节', messages: ['儿童节快乐', '永远做个快乐的小孩', '今天你最大~'] },
            { month: 7, day: 7, name: '七夕', messages: ['七夕快乐', '转账给你', '鹊桥相会', '愿得一心人'] },
            { month: 10, day: 1, name: '国庆节', messages: ['国庆快乐', '放假快乐~', '祖国生日快乐'] },
            { month: 10, day: 31, name: '万圣节', messages: ['万圣节快乐', 'Trick or Treat!', '不给糖就捣蛋'] },
            { month: 11, day: 11, name: '双十一', messages: ['双十一快乐', '购物愉快~', '清空购物车'] },
            { month: 12, day: 24, name: '平安夜', messages: ['平安夜快乐', '平平安安', '圣诞前夕温暖你'] },
            { month: 12, day: 25, name: '圣诞节', messages: ['圣诞快乐', 'Merry Christmas!', '铃儿响叮当'] },
            { month: 12, day: 31, name: '跨年', messages: ['跨年快乐', '一起迎接新年~', '辞旧迎新'] }
        ];
        return festivals.filter(function (f) { return f.month === m && f.day === d; });
    }

    // ========== 初始化余额数据 ==========

    window.initTransferData = function () {
        if (typeof transferData === 'undefined' || transferData === null) {
            transferData = { myBalance: 100000, systemBalance: 100000, records: [] };
        }
        if (!transferData.records) transferData.records = [];
        if (typeof transferData.myBalance !== 'number') transferData.myBalance = 100000;
        if (typeof transferData.systemBalance !== 'number') transferData.systemBalance = 100000;
    };

    // ========== 红包主菜单弹窗（发起转账 / 查看余额）==========

    window.showRedPacketSendModal = function () {
        window.initTransferData();

        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:flex-end;justify-content:center;animation:fadeIn 0.2s;';
        overlay.onclick = function (e) { if (e.target === overlay) overlay.remove(); };

        overlay.innerHTML =
            '<div style="width:100%;max-width:420px;background:var(--primary-bg,#fff);border-radius:20px 20px 0 0;padding:0;animation:slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);">' +
                '<div style="width:36px;height:4px;border-radius:2px;background:var(--border-color,#e8e8e8);margin:10px auto 0;"></div>' +
                '<div style="padding:20px 20px 16px;font-size:17px;font-weight:600;text-align:center;color:var(--text-primary,#1a1a1a);">转账</div>' +
                '<div style="padding:0 20px 24px;display:flex;gap:16px;">' +
                    // 发起转账按钮
                    '<button id="rp-menu-send" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px;border:1.5px solid var(--border-color,#e8e8e8);border-radius:16px;background:var(--secondary-bg,#f5f5f5);cursor:pointer;transition:all 0.2s;">' +
                        '<div style="width:48px;height:48px;border-radius:50%;background:#e88fa7;display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;">' +
                            '<svg width="24" height="28" viewBox="0 0 20 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="16" height="18" rx="2"/><path d="M2 8l8 6 8-6"/><circle cx="10" cy="14" r="2" fill="currentColor" stroke="none"/></svg>' +
                        '</div>' +
                        '<span style="font-size:14px;font-weight:500;color:var(--text-primary,#1a1a1a);">发起转账</span>' +
                    '</button>' +
                    // 查看余额按钮
                    '<button id="rp-menu-balance" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px;border:1.5px solid var(--border-color,#e8e8e8);border-radius:16px;background:var(--secondary-bg,#f5f5f5);cursor:pointer;transition:all 0.2s;">' +
                        '<div style="width:48px;height:48px;border-radius:50%;background:var(--accent-color,#b8a9c9);display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;">' +
                            '<i class="fas fa-wallet"></i>' +
                        '</div>' +
                        '<span style="font-size:14px;font-weight:500;color:var(--text-primary,#1a1a1a);">查看余额</span>' +
                    '</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(overlay);

        // 发起转账
        overlay.querySelector('#rp-menu-send').onclick = function () {
            overlay.remove();
            showRedPacketSendForm();
        };

        // 查看余额
        overlay.querySelector('#rp-menu-balance').onclick = function () {
            overlay.remove();
            showTransferBalanceSettings();
        };
    };

    // ========== 发起转账表单弹窗 ==========

    function showRedPacketSendForm() {
        window.initTransferData();

        var festivals = getFestivals();
        var isFestival = festivals.length > 0;
        var festival = isFestival ? festivals[0] : null;

        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:flex-end;justify-content:center;animation:fadeIn 0.2s;';
        overlay.onclick = function (e) { if (e.target === overlay) overlay.remove(); };

        var quickMsgs = isFestival
            ? festival.messages
            : ['转账给你', '新年快乐', '大吉大利', '好运连连', '辛苦了~', '买杯奶茶'];

        var defaultMsg = isFestival ? festival.messages[0] : '';

        overlay.innerHTML =
            '<div style="width:100%;max-width:420px;background:var(--primary-bg,#fff);border-radius:20px 20px 0 0;padding:0;animation:slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);max-height:85vh;overflow-y:auto;">' +
                '<div style="width:36px;height:4px;border-radius:2px;background:var(--border-color,#e8e8e8);margin:10px auto 0;"></div>' +
                '<div style="padding:16px 20px 12px;font-size:17px;font-weight:600;text-align:center;color:var(--text-primary,#1a1a1a);">' +
                    (isFestival
                        ? '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:10px;background:#f9e5e3;color:#3a9f8a;font-size:11px;font-weight:500;"><i class="fas fa-star"></i> ' + festival.name + '</span>'
                        : '发起转账') +
                '</div>' +
                '<div style="padding:0 20px 24px;">' +
                    // 金额输入区
                    '<div style="text-align:center;padding:20px 0 24px;">' +
                        '<div style="display:flex;align-items:baseline;justify-content:center;gap:2px;">' +
                            '<span style="font-size:28px;font-weight:500;color:var(--text-primary,#1a1a1a);">&yen;</span>' +
                            '<input type="number" placeholder="0.00" step="0.01" min="0.01" id="rp-send-amount" style="width:180px;font-size:42px;font-weight:700;border:none;outline:none;text-align:center;background:none;color:var(--text-primary,#1a1a1a);border-bottom:2px solid var(--border-color,#e8e8e8);padding-bottom:4px;transition:border-color 0.2s;" />' +
                        '</div>' +
                        '<div style="margin-top:10px;font-size:12px;color:var(--text-secondary,#888);">余额: &yen;' + fmt(transferData.myBalance) + '</div>' +
                    '</div>' +
                    // 留言输入
                    '<input type="text" placeholder="添加留言..." id="rp-send-message" maxlength="50" value="' + defaultMsg + '" style="width:100%;height:40px;border:1.5px solid var(--border-color,#e8e8e8);border-radius:10px;padding:0 14px;font-size:14px;outline:none;background:var(--secondary-bg,#f5f5f5);color:var(--text-primary,#1a1a1a);transition:border-color 0.2s;box-sizing:border-box;" />' +
                    // 快捷留言
                    '<div id="rp-quick-msgs" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;">' +
                        quickMsgs.map(function (m, i) {
                            return '<span data-msg="' + m + '" style="padding:6px 14px;border-radius:16px;border:1px solid var(--border-color,#e8e8e8);background:var(--secondary-bg,#f5f5f5);font-size:12px;color:var(--text-secondary,#888);cursor:pointer;transition:all 0.15s;' + (i === 0 ? 'border-color:var(--accent-color,#b8a9c9);background:rgba(184,169,201,0.08);color:var(--accent-dark,#9b8ab5);' : '') + '">' + m + '</span>';
                        }).join('') +
                    '</div>' +
                    // 发送按钮
                    '<button id="rp-send-btn" disabled style="width:100%;height:48px;border:none;border-radius:12px;background:#e88fa7;color:#fff;font-size:16px;font-weight:600;cursor:pointer;margin-top:24px;transition:opacity 0.15s;opacity:0.4;">发起转账</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(overlay);

        var amountInput = overlay.querySelector('#rp-send-amount');
        var msgInput = overlay.querySelector('#rp-send-message');
        var submitBtn = overlay.querySelector('#rp-send-btn');

        // 快捷留言点击
        overlay.querySelectorAll('#rp-quick-msgs span').forEach(function (btn) {
            btn.onclick = function () {
                overlay.querySelectorAll('#rp-quick-msgs span').forEach(function (b) {
                    b.style.borderColor = 'var(--border-color,#e8e8e8)';
                    b.style.background = 'var(--secondary-bg,#f5f5f5)';
                    b.style.color = 'var(--text-secondary,#888)';
                });
                btn.style.borderColor = 'var(--accent-color,#b8a9c9)';
                btn.style.background = 'rgba(184,169,201,0.08)';
                btn.style.color = 'var(--accent-dark,#9b8ab5)';
                msgInput.value = btn.dataset.msg;
            };
        });

        // 金额输入校验
        amountInput.oninput = function () {
            var val = parseFloat(amountInput.value);
            var valid = val && val > 0 && val * 100 <= transferData.myBalance;
            submitBtn.disabled = !valid;
            submitBtn.style.opacity = valid ? '1' : '0.4';
        };

        // 聚焦金额输入框
        setTimeout(function () { amountInput.focus(); }, 100);

        // 发送
        submitBtn.onclick = function () {
            var amount = Math.round(parseFloat(amountInput.value) * 100);
            if (!amount || amount <= 0) return;
            if (amount > transferData.myBalance) {
                if (typeof window.showNotification === 'function') window.showNotification('余额不足', 'warning');
                return;
            }

            var message = msgInput.value.trim() || '转账给你';

            // 扣除余额
            transferData.myBalance -= amount;

            // 创建记录
            var record = {
                id: genId(),
                from: 'me',
                to: 'system',
                amount: amount,
                message: message,
                status: 'pending',
                createdAt: Date.now()
            };
            transferData.records.push(record);

            // 保存
            if (typeof window.throttledSaveData === 'function') window.throttledSaveData();

            // 添加红包消息到聊天
            if (typeof addMessage === 'function') {
                addMessage({
                    id: record.id,
                    sender: 'user',
                    text: message,
                    timestamp: new Date(),
                    status: 'sent',
                    type: 'red-packet',
                    redPacket: record
                });
            }

            // 播放声音
            if (typeof window.playSound === 'function') window.playSound('send');

            // 通知
            if (typeof window.showNotification === 'function') window.showNotification('转账已发送', 'success');

            overlay.remove();

            // 系统自动处理用户发出的转账
            // 获取回复延迟设置范围
            var delayMin = (typeof settings !== 'undefined' && settings.replyDelayMin) ? settings.replyDelayMin : 3000;
            var delayMax = (typeof settings !== 'undefined' && settings.replyDelayMax) ? settings.replyDelayMax : 7000;
            var sysDelay = delayMin + Math.random() * (delayMax - delayMin);

            setTimeout(function () {
                window.initTransferData();
                var rpRecord = transferData.records.find(function (r) { return r.id === record.id; });
                if (!rpRecord || rpRecord.status !== 'pending') return;

                // 标记这条转账消息为"已读"（转账走的是单独的发送流程，不经过普通发消息的已读模拟逻辑，
                // 之前一直不会显示已读，这里补上）
                if (typeof messages !== 'undefined' && Array.isArray(messages)) {
                    var sentMsg = messages.find(function (m) { return String(m.id) === String(record.id); });
                    if (sentMsg) sentMsg.status = 'read';
                    if (typeof window._updateReadReceiptsDOM === 'function') window._updateReadReceiptsDOM();
                    if (typeof window.throttledSaveData === 'function') window.throttledSaveData();
                }

                // 独立判定退回：20%概率退回
                if (Math.random() < 0.2) {
                    rpRecord.status = 'returned';
                    rpRecord.returnedAt = Date.now();
                    transferData.myBalance += rpRecord.amount;

                    if (typeof window.throttledSaveData === 'function') window.throttledSaveData();

                    setTimeout(function () {
                        if (typeof addMessage === 'function') {
                            addMessage({
                                id: 'rp_sys_ret_' + Date.now(),
                                sender: 'system',
                                text: '转账已退回',
                                timestamp: new Date(),
                                status: 'sent',
                                type: 'system'
                            });
                        }
                        if (typeof renderMessages === 'function') renderMessages();
                        if (typeof window.playSound === 'function') window.playSound('message');
                    }, delayMin + Math.random() * (delayMax - delayMin));
                    return;
                }

                // 剩余80%：70%立即收取，10%后续随机收取
                if (Math.random() < 0.7 / 0.8) {
                    // 70%：立即收取
                    rpRecord.status = 'received';
                    rpRecord.receivedAt = Date.now();
                    transferData.systemBalance += rpRecord.amount;

                    if (typeof window.throttledSaveData === 'function') window.throttledSaveData();

                    setTimeout(function () {
                        // 收取方发送已领取样式的转账卡片
                        if (typeof addMessage === 'function') {
                            addMessage({
                                id: 'rp_recv_card_' + Date.now(),
                                sender: 'partner',
                                text: rpRecord.message || '转账给你',
                                timestamp: new Date(),
                                status: 'received',
                                type: 'red-packet',
                                redPacket: rpRecord
                            });
                        }
                        if (typeof renderMessages === 'function') renderMessages();
                        if (typeof window.playSound === 'function') window.playSound('message');
                    }, delayMin + Math.random() * (delayMax - delayMin));
                }
                // 10%：保持 pending，后续聊天中随机收取（由 tryCollectPendingRedPacket 处理）
            }, sysDelay);
        };
    };

    // ========== 确认收款弹窗（图二风格 + 开/退回同行）==========

    window.showRedPacketReceiveModal = function (recordId) {
        window.initTransferData();
        var record = null;
        if (transferData.records) {
            record = transferData.records.find(function (r) { return r.id === recordId; });
        }
        if (!record) {
            if (typeof window.showNotification === 'function') window.showNotification('转账记录不存在', 'warning');
            return;
        }

        var isPending = record.status === 'pending';
        var isReceived = record.status === 'received';
        var isReturned = record.status === 'returned';
        var isSentByMe = record.from === 'me';
        var isSystemSender = record.from === 'system';

        if (isSentByMe && isPending) {
            if (typeof window.showNotification === 'function') window.showNotification('这是你发出的转账', 'info');
            return;
        }

        var senderName = record.from === 'me' ? getMyName() : getPartnerName();

        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.55);backdrop-filter:blur(8px);z-index:10000;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.2s ease;';
        overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

        var panelBg = isPending
            ? 'linear-gradient(160deg,#f9cfe0 0%,#f4a8c2 40%,#ec8ab0 100%)'
            : 'linear-gradient(160deg,#e0d0d8 0%,#c8b8c0 100%)';
        var amountColor = isPending ? '#fff' : '#ddd';
        var msgColor = isPending ? 'rgba(255,255,255,0.85)' : 'rgba(220,200,210,0.9)';

        // 開按钮
        var openBtnStyle = isPending
            ? 'flex:1;padding:12px 8px;border:none;border-radius:12px;background:rgba(255,255,255,0.92);color:#d4607a;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 2px 10px rgba(220,100,130,0.2);'
            : 'flex:1;padding:12px 8px;border:none;border-radius:12px;background:rgba(200,180,190,0.4);color:#b898a8;font-size:15px;font-weight:700;cursor:default;';
        var openBtnText = isPending ? '确认收款' : (isReceived ? '已收款' : '已退回');

        // 退回按钮（只有 pending+system 才显示）
        var returnBtnHtml = (isPending && isSystemSender)
            ? '<button id="rp-return-btn" style="flex:1;padding:12px 8px;border:none;border-radius:12px;background:rgba(255,255,255,0.25);color:#fff;font-size:14px;font-weight:600;cursor:pointer;border:1.5px solid rgba(255,255,255,0.4);">退回转账</button>'
            : '';

        // 可爱插图区（图二风格 CSS 实现）
        var illustrationHtml =
            '<div style="position:relative;padding:20px 0 8px;display:flex;flex-direction:column;align-items:center;gap:4px;">' +
                // 粉色点点背景装饰
                '<div style="position:absolute;inset:0;opacity:0.25;background-image:radial-gradient(circle,#ff80a0 1px,transparent 1px);background-size:16px 16px;"></div>' +
                // 可爱字符插图
                '<div style="position:relative;font-size:36px;letter-spacing:-4px;filter:drop-shadow(0 2px 6px rgba(220,100,130,0.3));">🐻🩷🐰</div>' +
                '<div style="position:relative;font-size:11px;color:rgba(255,255,255,0.7);letter-spacing:2px;margin-top:2px;">· 小熊和小兔子都是小猪变的 ·</div>' +
            '</div>';

        var html =
            '<div id="rp-receive-panel" style="width:280px;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(180,80,120,0.35),inset 0 1px 0 rgba(255,255,255,0.3);background:' + panelBg + ';">' +
                // 顶部装饰线
                '<div style="height:3px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.7) 50%,transparent);"></div>' +
                // 插图区
                illustrationHtml +
                // 金额信息
                '<div style="text-align:center;padding:8px 20px 20px;">' +
                    '<div style="font-size:11px;color:rgba(255,255,255,0.75);margin-bottom:6px;">' + senderName + ' 发来的转账</div>' +
                    '<div style="font-size:32px;font-weight:200;color:' + amountColor + ';letter-spacing:1px;">&yen;' + fmt(record.amount) + '</div>' +
                    '<div style="font-size:12px;color:' + msgColor + ';margin-top:6px;font-style:italic;">' + (record.message || '转账给你') + '</div>' +
                '</div>' +
                // 按钮区（同行）
                '<div style="padding:0 16px 20px;display:flex;gap:10px;">' +
                    '<button id="rp-open-btn" style="' + openBtnStyle + '">' + openBtnText + '</button>' +
                    returnBtnHtml +
                '</div>' +
            '</div>';

        overlay.innerHTML = html;
        document.body.appendChild(overlay);

        // 退回按钮事件
        if (isPending && isSystemSender) {
            var returnBtn = overlay.querySelector('#rp-return-btn');
            if (returnBtn) {
                returnBtn.onclick = function() {
                    transferData.systemBalance += record.amount;
                    record.status = 'returned';
                    record.returnedAt = Date.now();
                    if (typeof window.throttledSaveData === 'function') window.throttledSaveData();
                    overlay.remove();
                    if (typeof window.showNotification === 'function') window.showNotification('转账已退回', 'info');
                    if (typeof renderMessages === 'function') renderMessages();
                };
            }
        }

        // 开启按钮事件
        var openBtn = overlay.querySelector('#rp-open-btn');
        if (openBtn && isPending) {
            openBtn.onclick = function() {
                if (record.from === 'system') {
                    transferData.myBalance += record.amount;
                }
                record.status = 'received';
                record.receivedAt = Date.now();
                if (typeof window.throttledSaveData === 'function') window.throttledSaveData();
                overlay.remove();
                if (typeof window.showNotification === 'function') window.showNotification('收款 &yen;' + fmt(record.amount) + ' 成功！', 'success');
                // 立即刷新聊天记录，让原始的"待领取"卡片马上变成"已领取"的灰色样式
                if (typeof renderMessages === 'function') renderMessages();
                // 添加我方已领取回执卡片
                if (typeof addMessage === 'function') {
                    addMessage({
                        id: 'rp_recv_card_' + Date.now(),
                        sender: 'user',
                        text: record.message || '转账给你',
                        timestamp: new Date(),
                        status: 'received',
                        type: 'red-packet',
                        redPacket: record
                    });
                }
            };
        }
    };



    // ========== 系统随机发红包 ==========

    // 特殊金额池（单位：元，转分时 * 100）
    var SPECIAL_AMOUNTS = [5.2, 52, 520, 5200, 13.14, 1314];

    // 单日发送计数器
    var _lastRPSendDate = '';
    var _rpSendCountToday = 0;

    window.trySystemRedPacket = function () {
        window.initTransferData();

        // 单日上限检查（5次）
        var today = new Date().toISOString().slice(0, 10);
        if (today !== _lastRPSendDate) {
            _lastRPSendDate = today;
            _rpSendCountToday = 0;
        }
        if (_rpSendCountToday >= 5) return false;

        var festivals = getFestivals();
        var isFestival = festivals.length > 0;
        var festival = isFestival ? festivals[0] : null;

        // 触发概率：平日 5%，节日 80%
        var chance = isFestival ? 0.8 : 0.05;
        if (Math.random() > chance) return false;

        // 决定金额：节日90% / 平日40% 使用特殊金额
        var useSpecial = Math.random() < (isFestival ? 0.9 : 0.4);
        var amount;
        if (useSpecial) {
            var specialYuan = SPECIAL_AMOUNTS[Math.floor(Math.random() * SPECIAL_AMOUNTS.length)];
            amount = Math.round(specialYuan * 100); // 转为分
        } else {
            // 80%在0-200元内随机，20%在0-余额内随机
            var maxBalance = Math.floor(transferData.systemBalance / 100); // 余额（元）
            if (maxBalance <= 0) return false;
            if (Math.random() < 0.8) {
                var max200 = Math.min(200, maxBalance);
                amount = Math.floor(Math.random() * (max200 * 100)) + 1; // 0.01~200元
            } else {
                amount = Math.floor(Math.random() * transferData.systemBalance) + 1;
            }
        }

        // 检查系统余额
        if (transferData.systemBalance < amount) return false;

        // 扣除系统余额
        transferData.systemBalance -= amount;

        // 留言
        var message;
        if (isFestival && festival) {
            var msgs = festival.messages;
            message = msgs[Math.floor(Math.random() * msgs.length)];
        } else {
            var normalMsgs = ['转账给你', '新年快乐', '大吉大利', '好运连连', '辛苦了~', '买杯奶茶'];
            message = normalMsgs[Math.floor(Math.random() * normalMsgs.length)];
        }

        // 创建记录
        var record = {
            id: genId(),
            from: 'system',
            to: 'me',
            amount: amount,
            message: message,
            status: 'pending',
            createdAt: Date.now()
        };
        transferData.records.push(record);

        // 计数
        _rpSendCountToday++;

        // 保存
        if (typeof window.throttledSaveData === 'function') window.throttledSaveData();

        // 添加红包消息到聊天
        if (typeof addMessage === 'function') {
            addMessage({
                id: record.id,
                sender: 'partner',
                text: message,
                timestamp: new Date(),
                status: 'sent',
                type: 'red-packet',
                redPacket: record
            });
        }

        // 播放声音
        if (typeof window.playSound === 'function') window.playSound('message');

        // 通知
        if (typeof window.showNotification === 'function') {
            var notifyMsg = isFestival
                ? festival.name + '红包来啦! &yen;' + fmt(amount)
                : '收到一个红包 &yen;' + fmt(amount);
            window.showNotification(notifyMsg, 'success');
        }

        return true;
    };

    // ========== 后续随机领取待领取红包 ==========

    window.tryCollectPendingRedPacket = function () {
        window.initTransferData();
        if (!transferData.records) return;

        var pending = transferData.records.filter(function (r) {
            return r.status === 'pending' && r.from === 'me';
        });
        if (pending.length === 0) return;

        // 每次有 8% 概率随机收取一个 pending 红包
        if (Math.random() > 0.08) return;

        var target = pending[Math.floor(Math.random() * pending.length)];

        // 先检查是否已超过24小时（由过期检查处理）
        if (Date.now() - target.createdAt > 24 * 3600 * 1000) return;

        // 系统收取
        target.status = 'received';
        target.receivedAt = Date.now();
        transferData.systemBalance += target.amount;

        if (typeof window.throttledSaveData === 'function') window.throttledSaveData();

        // 收取方发送已领取样式的红包卡片
        if (typeof addMessage === 'function') {
            addMessage({
                id: 'rp_recv_card_' + Date.now(),
                sender: 'partner',
                text: target.message || '恭喜发财',
                timestamp: new Date(),
                status: 'received',
                type: 'red-packet',
                redPacket: target
            });
        }
        if (typeof renderMessages === 'function') renderMessages();
        if (typeof window.playSound === 'function') window.playSound('message');
    };

    // ========== 24小时过期自动退回 ==========

    window.checkRedPacketExpiry = function () {
        window.initTransferData();
        if (!transferData.records) return;

        var now = Date.now();
        var expired = transferData.records.filter(function (r) {
            return r.status === 'pending' && (now - r.createdAt) > 24 * 3600 * 1000;
        });

        expired.forEach(function (r) {
            r.status = 'returned';
            r.returnedAt = now;
            // 退回发送方余额
            if (r.from === 'me') {
                transferData.myBalance += r.amount;
            } else if (r.from === 'system') {
                transferData.systemBalance += r.amount;
            }
        });

        if (expired.length > 0) {
            if (typeof window.throttledSaveData === 'function') window.throttledSaveData();

            // 发送过期提示
            if (typeof addMessage === 'function') {
                addMessage({
                    id: 'rp_expired_' + Date.now(),
                    sender: 'system',
                    text: expired.length > 1
                        ? expired.length + '个红包已超过24小时未领取，已自动退回'
                        : '一个红包已超过24小时未领取，已自动退回',
                    timestamp: new Date(),
                    status: 'sent',
                    type: 'system'
                });
            }
            if (typeof renderMessages === 'function') renderMessages();
        }
    };


    // ========== 渲染转账消息卡片 ==========

    window.renderRedPacketMessage = function (msg) {
        var rp = msg.redPacket || {};
        var recordId = rp.id || msg.id;
        var amount = rp.amount || 0;
        var message = rp.message || msg.text || '转账给你';
        var status = rp.status || 'pending';
        var isSentByMe = (msg.sender === 'user');
        var isOpened = status !== 'pending';

        if (transferData && transferData.records) {
            var latestRecord = transferData.records.find(function (r) { return r.id === recordId; });
            if (latestRecord) {
                status = latestRecord.status;
                amount = latestRecord.amount;
                message = latestRecord.message || message;
                isOpened = status !== 'pending';
            }
        }

        // 时间
        var timeStr = '';
        if (msg.timestamp) {
            var ts = new Date(msg.timestamp);
            var diff = Date.now() - ts;
            if (diff < 60000) timeStr = '刚刚';
            else if (diff < 3600000) timeStr = Math.floor(diff/60000) + '分钟前';
            else timeStr = ts.getHours().toString().padStart(2,'0') + ':' + ts.getMinutes().toString().padStart(2,'0');
        }

        // 标题文字（图一风格）
        var partnerName = (typeof settings !== 'undefined' && settings.partnerName) ? settings.partnerName : '对方';
        var myName = (typeof settings !== 'undefined' && settings.myName) ? settings.myName : '我';
        var transferSender = (rp.from === 'me') ? myName : partnerName;
        // 用 rp.from 而非 msg.sender 判断转账方向
        // 我主动发出(from='me') → '向 X 转账'
        // 对方发来/我的领取回执(from='system') → '来自 X 的'
        var isMyTransfer = (rp.from === 'me');
        var titleText = isMyTransfer
            ? ('向 ' + partnerName + ' 转账 &yen;' + fmt(amount))
            : ('来自 ' + transferSender + ' 的 &yen;' + fmt(amount));

        // 状态文字
        var statusText = status === 'pending'
            ? (isSentByMe ? '对方待领取' : '待领取')
            : (status === 'received' ? '已领取' : '已被退还');
        var statusColor = status === 'pending' ? 'rgba(255,255,255,0.75)' : (status === 'received' ? '#b8fde0' : 'rgba(255,255,255,0.6)');

        // 背景色：已领取/退回变灰
        var bodyBg = isOpened
            ? 'background:linear-gradient(135deg,#e8d0d8 0%,#d4b8c2 100%);'
            : 'background:linear-gradient(135deg,#f4a0bc 0%,#e8789a 60%,#d86085 100%);';

        var card =
            '<div class="red-packet-card tc-style' + (isOpened ? ' opened' : '') + '" data-rp-id="' + recordId + '" ' +
            'style="width:240px;border-radius:16px;overflow:hidden;cursor:pointer;box-shadow:0 6px 24px rgba(220,100,140,0.25),inset 0 1px 0 rgba(255,255,255,0.25);">' +
                // 主体：大字转账信息
                '<div style="' + bodyBg + 'padding:18px 16px 16px;position:relative;">' +
                    '<div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.5) 50%,transparent);"></div>' +
                    '<div style="font-size:16px;font-weight:700;color:#fff;line-height:1.3;letter-spacing:0.3px;">' + titleText + '</div>' +
                    '<div style="font-size:11px;color:' + statusColor + ';margin-top:5px;font-weight:500;">' + statusText + (message ? ' <span style="opacity:0.65;">— ' + message + '</span>' : '') + '</div>' +
                '</div>' +
                // 底部：kaomoji + 时间
                '<div style="background:rgba(255,230,238,0.85);padding:7px 14px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(220,100,140,0.15);">' +
                    '<span style="font-size:12px;color:#c06880;letter-spacing:1px;">ꒉ -´ω&#39;- ꒊ</span>' +
                    '<span style="font-size:10px;color:#bba8b0;">' + timeStr + '</span>' +
                '</div>' +
            '</div>';

        return card;
    };


    // ========== 余额设置弹窗 ==========

    window.showTransferBalanceSettings = function () {
        window.initTransferData();

        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.2s;';
        overlay.onclick = function (e) { if (e.target === overlay) overlay.remove(); };

        overlay.innerHTML =
            '<div style="width:min(360px,88vw);background:var(--primary-bg,#fff);border-radius:20px;padding:0;animation:modalContentSlideIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both;box-shadow:0 20px 60px rgba(0,0,0,0.28);border:1px solid var(--border-color,#e8e8e8);">' +
                '<div style="width:36px;height:4px;border-radius:2px;background:var(--border-color,#e8e8e8);margin:10px auto 0;"></div>' +
                '<div style="padding:16px 20px 12px;font-size:17px;font-weight:600;text-align:center;color:var(--text-primary,#1a1a1a);">余额设置</div>' +
                '<div style="padding:0 20px 24px;">' +
                    '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:0.5px solid var(--border-color,#e8e8e8);">' +
                        '<div style="font-size:14px;color:var(--text-primary,#1a1a1a);"><span>我的余额</span><small style="display:block;font-size:11px;color:var(--text-secondary,#888);margin-top:2px;">当前会话</small></div>' +
                        '<input type="number" id="rp-bal-my" value="' + (transferData.myBalance / 100).toFixed(2) + '" style="width:120px;height:36px;border:1.5px solid var(--border-color,#e8e8e8);border-radius:8px;padding:0 10px;font-size:15px;text-align:right;outline:none;font-weight:600;background:var(--secondary-bg,#f5f5f5);color:var(--text-primary,#1a1a1a);box-sizing:border-box;" />' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 0;">' +
                        '<div style="font-size:14px;color:var(--text-primary,#1a1a1a);"><span>对方余额</span><small style="display:block;font-size:11px;color:var(--text-secondary,#888);margin-top:2px;">当前会话</small></div>' +
                        '<input type="number" id="rp-bal-sys" value="' + (transferData.systemBalance / 100).toFixed(2) + '" style="width:120px;height:36px;border:1.5px solid var(--border-color,#e8e8e8);border-radius:8px;padding:0 10px;font-size:15px;text-align:right;outline:none;font-weight:600;background:var(--secondary-bg,#f5f5f5);color:var(--text-primary,#1a1a1a);box-sizing:border-box;" />' +
                    '</div>' +
                    '<button id="rp-bal-save" style="width:100%;height:48px;border:none;border-radius:12px;background:var(--accent-color,#b8a9c9);color:#fff;font-size:16px;font-weight:600;cursor:pointer;margin-top:16px;transition:opacity 0.15s;">保存</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(overlay);

        overlay.querySelector('#rp-bal-save').onclick = function () {
            transferData.myBalance = Math.round((parseFloat(overlay.querySelector('#rp-bal-my').value) || 0) * 100);
            transferData.systemBalance = Math.round((parseFloat(overlay.querySelector('#rp-bal-sys').value) || 0) * 100);
            if (typeof window.throttledSaveData === 'function') window.throttledSaveData();
            if (typeof window.showNotification === 'function') window.showNotification('余额已保存', 'success');
            overlay.remove();
        };
    };


})();
