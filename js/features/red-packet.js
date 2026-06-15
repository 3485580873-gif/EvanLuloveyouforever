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
    var RP_SVG = '<svg width="36" height="44" viewBox="0 0 20 28" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="16" height="18" rx="2"/><path d="M2 8l8 6 8-6"/><circle cx="10" cy="14" r="2.5" fill="#fff" stroke="none"/></svg>';

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
            { month: 7, day: 7, name: '七夕', messages: ['七夕快乐', '星河万里不如你', '鹊桥相会', '愿得一心人'] },
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

    // ========== 红包主菜单弹窗（发红包 / 查看余额）==========

    window.showRedPacketSendModal = function () {
        window.initTransferData();

        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:flex-end;justify-content:center;animation:fadeIn 0.2s;';
        overlay.onclick = function (e) { if (e.target === overlay) overlay.remove(); };

        overlay.innerHTML =
            '<div style="width:100%;max-width:420px;background:var(--primary-bg,#fff);border-radius:20px 20px 0 0;padding:0;animation:slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);">' +
                '<div style="width:36px;height:4px;border-radius:2px;background:var(--border-color,#e8e8e8);margin:10px auto 0;"></div>' +
                '<div style="padding:20px 20px 16px;font-size:17px;font-weight:600;text-align:center;color:var(--text-primary,#1a1a1a);">红包</div>' +
                '<div style="padding:0 20px 24px;display:flex;gap:16px;">' +
                    // 发红包按钮
                    '<button id="rp-menu-send" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px;border:1.5px solid var(--border-color,#e8e8e8);border-radius:16px;background:var(--secondary-bg,#f5f5f5);cursor:pointer;transition:all 0.2s;">' +
                        '<div style="width:48px;height:48px;border-radius:50%;background:#c4453c;display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;">' +
                            '<svg width="24" height="28" viewBox="0 0 20 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="16" height="18" rx="2"/><path d="M2 8l8 6 8-6"/><circle cx="10" cy="14" r="2" fill="currentColor" stroke="none"/></svg>' +
                        '</div>' +
                        '<span style="font-size:14px;font-weight:500;color:var(--text-primary,#1a1a1a);">发红包</span>' +
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

        // 发红包
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

    // ========== 发红包表单弹窗 ==========

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
            : ['恭喜发财', '新年快乐', '大吉大利', '好运连连', '辛苦了~', '买杯奶茶'];

        var defaultMsg = isFestival ? festival.messages[0] : '';

        overlay.innerHTML =
            '<div style="width:100%;max-width:420px;background:var(--primary-bg,#fff);border-radius:20px 20px 0 0;padding:0;animation:slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);max-height:85vh;overflow-y:auto;">' +
                '<div style="width:36px;height:4px;border-radius:2px;background:var(--border-color,#e8e8e8);margin:10px auto 0;"></div>' +
                '<div style="padding:16px 20px 12px;font-size:17px;font-weight:600;text-align:center;color:var(--text-primary,#1a1a1a);">' +
                    (isFestival
                        ? '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:10px;background:#f9e5e3;color:#c4453c;font-size:11px;font-weight:500;"><i class="fas fa-star"></i> ' + festival.name + '</span>'
                        : '发红包') +
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
                    '<button id="rp-send-btn" disabled style="width:100%;height:48px;border:none;border-radius:12px;background:#c4453c;color:#fff;font-size:16px;font-weight:600;cursor:pointer;margin-top:24px;transition:opacity 0.15s;opacity:0.4;">发送红包</button>' +
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

            var message = msgInput.value.trim() || '恭喜发财';

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
            if (typeof window.showNotification === 'function') window.showNotification('红包已发送', 'success');

            overlay.remove();

            // 系统自动处理用户发出的红包
            // 获取回复延迟设置范围
            var delayMin = (typeof settings !== 'undefined' && settings.replyDelayMin) ? settings.replyDelayMin : 3000;
            var delayMax = (typeof settings !== 'undefined' && settings.replyDelayMax) ? settings.replyDelayMax : 7000;
            var sysDelay = delayMin + Math.random() * (delayMax - delayMin);

            setTimeout(function () {
                window.initTransferData();
                var rpRecord = transferData.records.find(function (r) { return r.id === record.id; });
                if (!rpRecord || rpRecord.status !== 'pending') return;

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
                                text: '红包已被退回',
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
                        // 收取方发送已领取样式的红包卡片
                        if (typeof addMessage === 'function') {
                            addMessage({
                                id: 'rp_recv_card_' + Date.now(),
                                sender: 'partner',
                                text: rpRecord.message || '恭喜发财',
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

    // ========== 领取红包弹窗 ==========

    window.showRedPacketReceiveModal = function (recordId) {
        window.initTransferData();

        var record = null;
        if (transferData.records) {
            record = transferData.records.find(function (r) { return r.id === recordId; });
        }
        if (!record) {
            if (typeof window.showNotification === 'function') window.showNotification('红包不存在', 'warning');
            return;
        }

        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;';
        overlay.onclick = function (e) { if (e.target === overlay) overlay.remove(); };

        var isPending = record.status === 'pending';
        var isReceived = record.status === 'received';
        var isReturned = record.status === 'returned';
        var isOpened = !isPending;

        // 自己发的红包不能领取
        var isSentByMe = record.from === 'me';
        if (isSentByMe && isPending) {
            if (typeof window.showNotification === 'function') window.showNotification('自己发的红包无法领取', 'info');
            return;
        }

        var senderName = record.from === 'me' ? getMyName() : getPartnerName();

        var panelBg = isOpened
            ? 'background:linear-gradient(180deg,#e0d8d8 0%,#ccc 100%);'
            : 'background:#c4453c;';

        var btnBg = isOpened
            ? 'background:#ddd;color:#999;box-shadow:none;cursor:default;'
            : 'background:#ffd700;color:#c4453c;box-shadow:0 2px 10px rgba(255,215,0,0.5);cursor:pointer;';

        var btnText = isPending ? '開' : (isReceived ? '已领取' : '已退回');
        var titleColor = isPending ? 'color:#ffd700;' : (isReturned ? 'color:#999;' : 'color:#ffd700;');
        var titleText = isReturned ? '已过期' : record.message;

        // 判断是否为系统发出的红包（我方领取），添加退回按钮
        var isSystemSender = record.from === 'system';
        var returnBtnHtml = (isPending && isSystemSender)
            ? '<button id="rp-return-btn" style="width:100%;max-width:200px;padding:10px 16px;border:none;border-radius:10px;background:linear-gradient(135deg,#ff6b35,#f7931e);color:#fff;font-size:14px;font-weight:600;cursor:pointer;margin-top:12px;transition:all 0.25s cubic-bezier(0.4,0,0.2,1);box-shadow:0 2px 8px rgba(255,107,53,0.35);">退回红包</button>'
            : '';

        var html =
            '<div id="rp-receive-panel" style="text-align:center;position:relative;overflow:hidden;border-radius:16px;width:260px;min-height:380px;' + panelBg + 'display:flex;flex-direction:column;">' +
                // 顶部金色装饰线
                '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#ffd700 20%,#ffd700 80%,transparent);"></div>' +
                // 发送者区域
                '<div style="padding:30px 16px 20px;display:flex;flex-direction:column;align-items:center;flex:1;justify-content:center;">' +
                    '<div style="width:48px;height:48px;border-radius:50%;background:var(--accent-color,#b8a9c9);border:2px solid rgba(255,215,0,0.5);margin-bottom:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;">' +
                        (record.from === 'me' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-heart"></i>') +
                    '</div>' +
                    '<div style="font-size:13px;color:rgba(255,255,255,0.9);margin-bottom:6px;">' + senderName + ' 发来的红包</div>' +
                    '<div style="font-size:18px;font-weight:700;' + titleColor + '">' + titleText + '</div>' +
                '</div>' +
                // 底部按钮区域
                '<div style="padding:30px 20px 40px;display:flex;flex-direction:column;align-items:center;justify-content:center;' + (isOpened ? 'background:#ccc;' : 'background:#c4453c;') + '">' +
                    '<button id="rp-open-btn" style="width:60px;height:60px;border-radius:50%;' + btnBg + 'font-size:22px;font-weight:700;border:none;transition:all 0.15s;">' + btnText + '</button>' +
                    returnBtnHtml +
                '</div>' +
            '</div>';

        overlay.innerHTML = html;
        document.body.appendChild(overlay);

        // 绑定退回按钮事件（领取前）
        if (isPending && isSystemSender) {
            var returnBtn = overlay.querySelector('#rp-return-btn');
            if (returnBtn) {
                returnBtn.onmouseenter = function () { this.style.filter = 'brightness(1.1)'; this.style.transform = 'translateY(-1px)'; this.style.boxShadow = '0 4px 16px rgba(255,107,53,0.5)'; };
                returnBtn.onmouseleave = function () { this.style.filter = 'none'; this.style.transform = 'translateY(0)'; this.style.boxShadow = '0 2px 8px rgba(255,107,53,0.35)'; };
                returnBtn.onclick = function () {
                    // 退回红包：金额退回系统，不更新用户余额
                    transferData.systemBalance += record.amount;
                    record.status = 'returned';
                    record.returnedAt = Date.now();

                    if (typeof window.throttledSaveData === 'function') window.throttledSaveData();

                    // 更新弹窗为已退回状态
                    var panel = overlay.querySelector('#rp-receive-panel');
                    panel.style.background = 'linear-gradient(180deg,#e0d8d8 0%,#ccc 100%)';
                    panel.innerHTML =
                        '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#999 20%,#999 80%,transparent);"></div>' +
                        '<div style="padding:30px 16px 20px;display:flex;flex-direction:column;align-items:center;flex:1;justify-content:center;">' +
                            '<div style="width:48px;height:48px;border-radius:50%;background:#999;border:2px solid rgba(255,255,255,0.3);margin-bottom:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;">' +
                                '<i class="fas fa-undo"></i>' +
                            '</div>' +
                            '<div style="font-size:13px;color:rgba(255,255,255,0.9);margin-bottom:6px;">' + senderName + ' 发来的红包</div>' +
                            '<div style="font-size:18px;font-weight:700;color:#999;">已退回</div>' +
                        '</div>' +
                        '<div style="padding:30px 20px 40px;display:flex;justify-content:center;background:#ccc;">' +
                            '<button style="width:60px;height:60px;border-radius:50%;background:#ddd;color:#999;font-size:22px;font-weight:700;border:none;box-shadow:none;cursor:default;">已退回</button>' +
                        '</div>';

                    if (typeof window.showNotification === 'function') window.showNotification('红包已退回', 'info');

                    // 发送退回样式的红包卡片到聊天
                    if (typeof addMessage === 'function') {
                        addMessage({
                            id: 'rp_returned_' + Date.now(),
                            sender: 'user',
                            text: record.message || '恭喜发财',
                            timestamp: new Date(),
                            status: 'sent',
                            type: 'red-packet',
                            redPacket: record
                        });
                    }

                    if (typeof renderMessages === 'function') renderMessages();
                };
            }
        }

        // 点击開按钮
        var openBtn = overlay.querySelector('#rp-open-btn');
        if (openBtn && isPending) {
            openBtn.onmouseenter = function () { this.style.transform = 'scale(1.1)'; this.style.boxShadow = '0 4px 16px rgba(255,215,0,0.6)'; };
            openBtn.onmouseleave = function () { this.style.transform = 'scale(1)'; this.style.boxShadow = '0 2px 10px rgba(255,215,0,0.5)'; };
            openBtn.onmousedown = function () { this.style.transform = 'scale(0.95)'; };
            openBtn.onmouseup = function () { this.style.transform = 'scale(1.1)'; };

            openBtn.onclick = function () {
                // 用户领取系统发出的红包时，永远不退回
                // 系统领取用户发出的红包时，20%概率退回（在自动处理路径中已实现）

                // 正常领取：更新余额
                if (record.from === 'system') {
                    transferData.myBalance += record.amount;
                    transferData.systemBalance -= record.amount;
                }
                // 更新记录状态
                record.status = 'received';
                record.receivedAt = Date.now();

                // 保存
                if (typeof window.throttledSaveData === 'function') window.throttledSaveData();

                // 更新弹窗为已领取状态
                var panel = overlay.querySelector('#rp-receive-panel');
                panel.style.background = 'linear-gradient(180deg,#e0d8d8 0%,#ccc 100%)';

                // 更新弹窗为已领取状态（领取后不再显示退回按钮）
                panel.innerHTML =
                    '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#ffd700 20%,#ffd700 80%,transparent);"></div>' +
                    '<div style="padding:30px 16px 20px;display:flex;flex-direction:column;align-items:center;flex:1;justify-content:center;">' +
                        '<div style="width:48px;height:48px;border-radius:50%;background:var(--accent-color,#b8a9c9);border:2px solid rgba(255,215,0,0.5);margin-bottom:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;">' +
                            '<i class="fas fa-heart"></i>' +
                        '</div>' +
                        '<div style="font-size:13px;color:rgba(255,255,255,0.9);margin-bottom:6px;">' + senderName + ' 发来的红包</div>' +
                        '<div style="font-size:18px;font-weight:700;color:#ffd700;">' + record.message + '</div>' +
                        '<div style="font-size:24px;font-weight:700;color:#c4453c;margin-top:8px;">&yen;' + fmt(record.amount) + '</div>' +
                    '</div>' +
                    '<div style="padding:20px 20px 30px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#ccc;">' +
                        '<button style="width:60px;height:60px;border-radius:50%;background:#ddd;color:#999;font-size:22px;font-weight:700;border:none;box-shadow:none;cursor:default;">已领取</button>' +
                    '</div>';

                // 播放声音
                if (typeof window.playSound === 'function') window.playSound('message');

                // 通知
                if (typeof window.showNotification === 'function') window.showNotification('红包已领取 &yen;' + fmt(record.amount), 'success');

                // 收取方（我方）发送已领取样式的红包卡片
                if (typeof addMessage === 'function') {
                    addMessage({
                        id: 'rp_recv_card_' + Date.now(),
                        sender: 'user',
                        text: record.message || '恭喜发财',
                        timestamp: new Date(),
                        status: 'sent',
                        type: 'red-packet',
                        redPacket: record
                    });
                }

                // 刷新聊天消息列表（触发重新渲染以更新卡片状态）
                if (typeof renderMessages === 'function') renderMessages();
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
            var normalMsgs = ['给你一个小红包~', '惊喜红包', '好运红包', '开心一下~', '一点心意'];
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

    // ========== 余额设置弹窗 ==========

    window.showTransferBalanceSettings = function () {
        window.initTransferData();

        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.2s;';
        overlay.onclick = function (e) { if (e.target === overlay) overlay.remove(); };

        overlay.innerHTML =
            '<div style="width:min(360px,88vw);background:var(--primary-bg,#fff);border-radius:20px;padding:0;animation:popIn 0.25s cubic-bezier(0.34,1.56,0.64,1);box-shadow:0 20px 60px rgba(0,0,0,0.28);border:1px solid var(--border-color,#e8e8e8);">' +
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

    // ========== 渲染红包消息卡片 ==========

    window.renderRedPacketMessage = function (msg) {
        var rp = msg.redPacket || {};
        var recordId = rp.id || msg.id;
        var amount = rp.amount || 0;
        var message = rp.message || msg.text || '恭喜发财';
        var status = rp.status || 'pending';
        var isSentByMe = (msg.sender === 'user');
        var isOpened = status !== 'pending';

        // 查找最新记录状态（可能已被领取）
        if (transferData && transferData.records) {
            var latestRecord = transferData.records.find(function (r) { return r.id === recordId; });
            if (latestRecord) {
                status = latestRecord.status;
                amount = latestRecord.amount;
                message = latestRecord.message || message;
                isOpened = status !== 'pending';
            }
        }

        // 时间显示
        var timeStr = '';
        if (msg.timestamp) {
            var ts = new Date(msg.timestamp);
            var now = new Date();
            var diff = now - ts;
            if (diff < 60000) {
                timeStr = '刚刚';
            } else if (diff < 3600000) {
                timeStr = Math.floor(diff / 60000) + '分钟前';
            } else if (diff < 86400000) {
                timeStr = ts.getHours().toString().padStart(2, '0') + ':' + ts.getMinutes().toString().padStart(2, '0');
            } else {
                timeStr = (ts.getMonth() + 1) + '/' + ts.getDate();
            }
        }

        // 状态文本
        var statusHtml = '';
        if (status === 'pending') {
            statusHtml = '<span style="display:flex;align-items:center;gap:4px;font-weight:500;color:#c4453c;"><i class="fas fa-clock" style="font-size:10px;"></i> ' + (isSentByMe ? '对方待领取' : '待领取') + '</span>';
        } else if (status === 'received') {
            statusHtml = '<span style="display:flex;align-items:center;gap:4px;font-weight:500;color:#2ed573;"><i class="fas fa-check-circle" style="font-size:10px;"></i> 已领取</span>';
        } else {
            statusHtml = '<span style="display:flex;align-items:center;gap:4px;font-weight:500;color:#bbb;"><i class="fas fa-undo" style="font-size:10px;"></i> 已退回</span>';
        }

        // 卡片背景
        var bodyBg = isOpened
            ? 'background:linear-gradient(180deg,#e0d8d8 0%,#ccc 100%);'
            : 'background:linear-gradient(180deg,#c4453c 0%,#a33a32 100%);';

        var svgStroke = isOpened ? 'stroke="#999"' : 'stroke="#fff"';
        var svgCircleFill = isOpened ? 'fill="#999"' : 'fill="#fff"';
        var rpSvgCustom = '<svg width="36" height="44" viewBox="0 0 20 28" fill="none" ' + svgStroke + ' stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="16" height="18" rx="2"/><path d="M2 8l8 6 8-6"/><circle cx="10" cy="14" r="2.5" ' + svgCircleFill + ' stroke="none"/></svg>';

        var card =
            '<div class="red-packet-card' + (isOpened ? ' opened' : '') + '" data-rp-id="' + recordId + '" style="width:260px;border-radius:6px;overflow:hidden;cursor:pointer;transition:transform 0.15s;position:relative;">' +
                // 红色主体
                '<div class="rp-body" style="' + bodyBg + 'padding:12px 14px 14px;color:#fff;position:relative;display:flex;align-items:center;gap:12px;">' +
                    // 红包袋图标
                    '<div class="rp-icon" style="width:44px;height:44px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">' +
                        rpSvgCustom +
                    '</div>' +
                    // 内容区
                    '<div class="rp-content" style="flex:1;min-width:0;">' +
                        '<div class="rp-title" style="font-size:13px;font-weight:600;margin-bottom:2px;">红包</div>' +
                        '<div class="rp-amount-text" style="font-size:24px;font-weight:700;line-height:1.2;"><span style="font-size:14px;font-weight:500;">&yen;</span>' + fmt(amount) + '</div>' +
                        '<div class="rp-msg-text" style="font-size:11px;opacity:0.8;margin-top:2px;">' + message + '</div>' +
                    '</div>' +
                '</div>' +
                // 底部白色区域
                '<div class="rp-footer" style="background:#fff;padding:8px 14px;display:flex;align-items:center;justify-content:space-between;font-size:11px;border-top:1px dashed rgba(196,69,60,0.3);">' +
                    statusHtml +
                    '<span style="color:#bbb;font-size:11px;">' + timeStr + '</span>' +
                '</div>' +
            '</div>';

        return card;
    };

})();
