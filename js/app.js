// ── 语音克隆/TTS 功能体积较大，非首屏必需，改成"第一次真正用到时才加载"，
//    减少刚打开 App 时的内存占用 ──
window._loadVoiceTTS = (function () {
    let loadingPromise = null;
    return function loadVoiceTTS() {
        if (window.voiceTTS) return Promise.resolve(window.voiceTTS);
        if (loadingPromise) return loadingPromise;
        loadingPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'js/features/voice-tts.js';
            script.onload = () => resolve(window.voiceTTS || null);
            script.onerror = () => { loadingPromise = null; reject(new Error('voice-tts.js 加载失败')); };
            document.body.appendChild(script);
        });
        return loadingPromise;
    };
})();

document.addEventListener('DOMContentLoaded', async () => {
    const loaderBar = document.getElementById('loader-tech-bar');
    const welcomeSubtitle = document.querySelector('.welcome-subtitle-scramble');
    const welcomeScreen = document.getElementById('welcome-animation');
    const disclaimerModal = document.getElementById('disclaimer-modal');
    const acceptDisclaimerBtn = document.getElementById('accept-disclaimer');

    const updateLoader = (text, width) => {
        if (welcomeSubtitle) welcomeSubtitle.textContent = text;
        if (loaderBar) loaderBar.style.width = width;
    };

    const hideWelcomeScreen = () => {
        if (!welcomeScreen) return;
        welcomeScreen.classList.add('hidden');
        setTimeout(() => {
            welcomeScreen.style.display = 'none';
        }, 800);
    };

    const safeAwait = async (promise, fallback = null) => {
        try {
            return await promise;
        } catch (error) {
            console.error('操作失败:', error);
            return fallback;
        }
    };

    try {
        try { setupEventListeners?.(); } catch(e) { console.error('setupEventListeners:', e); }

        if (typeof localforage === 'undefined') {
            console.warn('LocalForage 未加载，将使用 localStorage 降级方案');
        }

        try {
            const emergencyBackupRaw = localStorage.getItem('BACKUP_V1_critical');
            if (emergencyBackupRaw) {
                const emergencyBackup = JSON.parse(emergencyBackupRaw);
                if (emergencyBackup && Array.isArray(emergencyBackup.messages) && emergencyBackup.messages.length > 0) {
                    console.warn('[boot] 检测到紧急备份，可用于异常恢复');
                }
            }
        } catch (e) {
            console.warn('[boot] 紧急备份检查失败:', e);
        }

        updateLoader('正在建立安全连接...', '10%');
        await safeAwait(initializeSession());

        updateLoader('正在读取记忆存档...', '40%');
        await safeAwait(loadData());

        // settings 已经加载完成，这时候才能正确判断上次是否用的是本地字体
        if (typeof window._restoreLocalFontIfNeeded === 'function') {
            await safeAwait(window._restoreLocalFontIfNeeded());
        }

        updateLoader('正在渲染我们的世界...', '70%');
        
        await Promise.allSettled([
            safeAwait(initializeRandomUI?.()),
            safeAwait(initMusicPlayer?.())
        ]);

        setInterval(checkStatusChange, 60000);

        if (disclaimerModal) {
            const tourSeen = await safeAwait(localforage?.getItem(APP_PREFIX + 'tour_seen'), false);
            
            if (!tourSeen) {
                showModal(disclaimerModal);
                
                if (acceptDisclaimerBtn && !acceptDisclaimerBtn._bound) {
                    acceptDisclaimerBtn._bound = true;
                    acceptDisclaimerBtn.addEventListener('click', () => {
                        hideModal(disclaimerModal);
                        localforage?.setItem(APP_PREFIX + 'tour_seen', true).catch(() => {});
                        startTour?.();
                    }, { once: true });
                }
            }
        }

        updateLoader('连接成功，欢迎回来。', '100%');
        setTimeout(hideWelcomeScreen, 3500);

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                try {
                    if (typeof saveTimeout !== 'undefined') clearTimeout(saveTimeout);
                } catch (e) {}
                try { _backupCriticalData(); } catch (e) { console.warn('[visibilitychange] 紧急备份失败:', e); }
                try {
                    const p = saveData();
                    if (p && typeof p.catch === 'function') {
                        p.catch(e => console.error('[visibilitychange] 保存失败:', e));
                    }
                } catch (e) {
                    console.error('[visibilitychange] 保存失败:', e);
                }
            } else if (document.visibilityState === 'visible') {
                try {
                    const backup = typeof _tryRecoverFromBackup === 'function' ? _tryRecoverFromBackup() : null;
                    if (backup && Array.isArray(backup.messages) && backup.messages.length > 0 && Array.isArray(messages) && backup.messages.length > messages.length) {
                        console.warn('[visibilitychange] 检测到备份消息比当前更多，自动尝试恢复');
                        try {
                            messages = backup.messages.map(m => ({
                                ...m,
                                timestamp: new Date(m.timestamp)
                            }));
                            if (backup.settings) Object.assign(settings, backup.settings);
                            if (typeof updateUI === 'function') updateUI();
                            if (typeof throttledSaveData === 'function') throttledSaveData();
                            showNotification('已自动恢复本地临时备份内容', 'warning', 3500);
                        } catch (restoreErr) {
                            console.warn('[visibilitychange] 自动恢复失败，保留当前页面内容:', restoreErr);
                        }
                    }
                } catch (e) {
                    console.warn('[visibilitychange] 恢复备份失败:', e);
                }
            }
        });

        window.addEventListener('pagehide', () => {
            try { _backupCriticalData(); } catch (e) {}
        });

        window.addEventListener('beforeunload', () => {
            try { _backupCriticalData(); } catch (e) {}
        });

        setInterval(() => {
            saveData().catch(e => console.warn('[autoBackup] 定时保存失败:', e));
        }, 3 * 60 * 1000);

        (() => {
            const REMIND_KEY = 'exportReminderLastShown';
            const last = parseInt(localStorage.getItem(REMIND_KEY) || '0', 10);
            const daysSince = (Date.now() - last) / (1000 * 60 * 60 * 24);
            if (daysSince >= 7) {
                setTimeout(() => {
                    showNotification('建议定期导出备份，防止数据意外丢失', 'info', 7000);
                    localStorage.setItem(REMIND_KEY, String(Date.now()));
                }, 8000);
            }
        })();

        setTimeout(async () => {
            if ('Notification' in window && Notification.permission === 'default') {
                try {
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        localStorage.setItem('notifEnabled', '1');
                        showNotification('已开启系统通知，收到消息时会提醒你', 'success', 3000);
                    }
                } catch(e) {
                    console.warn('通知权限请求失败:', e);
                }
            } else if ('Notification' in window && Notification.permission === 'granted' && localStorage.getItem('notifEnabled') === null) {
                // 之前已经手动同意过浏览器权限，但本地还没记录开关状态，默认视为开启
                localStorage.setItem('notifEnabled', '1');
            }
        }, 3000);

    } catch (err) {
        console.error('严重初始化错误:', err);
        try {
            const backup = typeof _tryRecoverFromBackup === 'function' ? _tryRecoverFromBackup() : null;
            if (backup && Array.isArray(backup.messages) && backup.messages.length > 0) {
                messages = backup.messages.map(m => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                }));
                if (backup.settings) Object.assign(settings, backup.settings);
                if (typeof updateUI === 'function') updateUI();
                showNotification('初始化异常，已使用本地紧急备份恢复', 'warning', 5000);
            }
        } catch (recoverErr) {
            console.warn('[boot] 初始化失败后的恢复也失败:', recoverErr);
        }
        updateLoader('加载遇到问题，已强制进入...', '100%');
        setTimeout(hideWelcomeScreen, 3500);
    }
});
const stickerInput = document.getElementById('sticker-file-input');
            if (stickerInput) {
                stickerInput.addEventListener('change', async (e) => {
                    const files = Array.from(e.target.files);
                    if (!files.length) return;

                    const oversized = files.filter(f => f.size > 2 * 1024 * 1024);
                    if (oversized.length > 0) {
                        showNotification(oversized.length + ' 张图片超过 2MB 限制，已跳过', 'warning');
                    }

                    const validFiles = files.filter(f => f.size <= 2 * 1024 * 1024);
                    if (!validFiles.length) return;

                    showNotification('正在批量处理 ' + validFiles.length + ' 张图片...', 'info');

                    let successCount = 0;
                    let failCount = 0;

                    for (const file of validFiles) {
                        try {
                            const base64 = await optimizeImage(file, 300, 0.8);
                            stickerLibrary.push(base64);
                            successCount++;
                        } catch (err) {
                            console.error(err);
                            failCount++;
                        }
                    }

                    throttledSaveData();
                    renderReplyLibrary();

                    if (failCount > 0) {
                        showNotification('上传完成：' + successCount + ' 张成功，' + failCount + ' 张失败', 'warning');
                    } else {
                        showNotification('上传成功，共 ' + successCount + ' 张', 'success');
                    }

                    e.target.value = '';
                });
            }
const myStickerQuickUpload = document.getElementById('my-sticker-quick-upload');
if (myStickerQuickUpload) {
    myStickerQuickUpload.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        const oversized = files.filter(f => f.size > 2 * 1024 * 1024);
        if (oversized.length > 0) showNotification(oversized.length + ' 张图片超过 2MB，已跳过', 'warning');
        const validFiles = files.filter(f => f.size <= 2 * 1024 * 1024);
        if (!validFiles.length) return;
        showNotification('正在处理 ' + validFiles.length + ' 张...', 'info');
        let ok = 0, fail = 0;
        for (const file of validFiles) {
            try {
                const base64 = await optimizeImage(file, 300, 0.8);
                myStickerLibrary.push(base64);
                ok++;
            } catch(err) { fail++; }
        }
        throttledSaveData();
        if (typeof renderComboContent === 'function') renderComboContent('my-sticker');
        showNotification(fail > 0 ? `上传完成：${ok} 成功 ${fail} 失败` : `✓ 已添加 ${ok} 张到我的表情库`, fail > 0 ? 'warning' : 'success');
        e.target.value = '';
    });
}

window.addEventListener('load', function() {
    setTimeout(function() {
        try {
            if (localStorage.getItem('dailyGreetingShown') === new Date().toDateString()) return;
            try { if (typeof checkPartnerDailyMood === 'function') checkPartnerDailyMood(); } catch(e2) { console.warn('checkPartnerDailyMood error:', e2); }
            if (typeof _buildDailyGreeting === 'function') _buildDailyGreeting();
            if (window.localforage && window.APP_PREFIX) {
                localforage.getItem(window.APP_PREFIX + 'tour_seen').then(function(seen) {
                    if (seen) {
                        var modal = document.getElementById('daily-greeting-modal');
                        if (modal) modal.classList.remove('hidden');
                        localStorage.setItem('dailyGreetingShown', new Date().toDateString());
                    }
                }).catch(function() {
                    var modal = document.getElementById('daily-greeting-modal');
                    if (modal) modal.classList.remove('hidden');
                    localStorage.setItem('dailyGreetingShown', new Date().toDateString());
                });
            } else {
                var modal = document.getElementById('daily-greeting-modal');
                if (modal) modal.classList.remove('hidden');
                localStorage.setItem('dailyGreetingShown', new Date().toDateString());
            }
        } catch(e) { console.warn('Daily greeting timing error:', e); }

        // 启动时检查梦角是否主动来信
        try {
            if (typeof checkEnvelopeStatus === 'function') {
                checkEnvelopeStatus().catch(function(e) { console.warn('envelope launch check error:', e); });
            }
        } catch(e) { console.warn('envelope launch check error:', e); }
    }, 4500);
}, { once: true });

// ============================================================
// AI 真实语音（TTS）配置面板逻辑
// ============================================================
(function () {
    let _lastSavedTtsConfig = null;
    let _ttsConfigDirty = false;
    let _ttsFieldsBound = false;

    const TTS_FIELD_IDS = ['tts-minimax-key', 'tts-group-id', 'tts-model', 'tts-voice-id'];

    function _normalizeTtsConfig(cfg) {
        cfg = cfg || {};
        let speed;
        if (cfg.speed === undefined || cfg.speed === null || cfg.speed === '') {
            speed = 1.0;
        } else {
            speed = Number(cfg.speed);
            if (!isFinite(speed)) speed = 1.0;
        }
        speed = Math.max(0.5, Math.min(2.0, speed));
        return {
            minimaxKey: String(cfg.minimaxKey || '').trim(),
            groupId: String(cfg.groupId || '').trim(),
            model: String(cfg.model || 'speech-02-turbo').trim() || 'speech-02-turbo',
            voiceId: String(cfg.voiceId || '').trim(),
            targetLang: String(cfg.targetLang || 'JA').trim() || 'JA',
            gender: String(cfg.gender || 'male').trim() || 'male',
            styleText: String(cfg.styleText || '').trim(),
            speed: speed
        };
    }

    function _readTtsFormConfig() {
        return _normalizeTtsConfig({
            minimaxKey: document.getElementById('tts-minimax-key')?.value,
            groupId: document.getElementById('tts-group-id')?.value,
            model: document.getElementById('tts-model')?.value,
            voiceId: document.getElementById('tts-voice-id')?.value,
            targetLang: _getSelectedTtsLang(),
            gender: document.querySelector('.tts-gender-btn.active')?.dataset.gender || 'male',
            styleText: (document.getElementById('tts-style-text')?.value || '').trim(),
            speed: document.getElementById('tts-speed')?.value
        });
    }

    function _isSameTtsConfig(a, b) {
        const left = _normalizeTtsConfig(a);
        const right = _normalizeTtsConfig(b);
        return left.minimaxKey === right.minimaxKey &&
            left.groupId === right.groupId &&
            left.model === right.model &&
            left.voiceId === right.voiceId &&
            left.targetLang === right.targetLang &&
            left.gender === right.gender &&
            left.styleText === right.styleText &&
            left.speed === right.speed;
    }

    function _paintTtsLangButtons(selectedLang) {
        document.querySelectorAll('.tts-lang-btn').forEach(btn => {
            const isActive = btn.dataset.lang === selectedLang;
            btn.classList.toggle('active', isActive);
            btn.style.border = isActive ? '1px solid var(--accent-color)' : '1px solid var(--border-color)';
            btn.style.background = isActive ? 'rgba(var(--accent-color-rgb),0.1)' : 'transparent';
            btn.style.color = isActive ? 'var(--accent-color)' : 'var(--text-secondary)';
            btn.style.fontWeight = isActive ? '600' : 'normal';
        });
        // 选原文时隐藏翻译选项
        const translateOpts = document.getElementById('tts-translate-options');
        if (translateOpts) translateOpts.style.display = selectedLang === 'RAW' ? 'none' : '';
    }

    function _getSelectedTtsLang() {
        return document.querySelector('.tts-lang-btn.active')?.dataset.lang || 'JA';
    }

    function _hasSavedTtsConfig() {
        const cfg = _normalizeTtsConfig(_lastSavedTtsConfig || {});
        return !!(cfg.minimaxKey || cfg.groupId || cfg.voiceId || cfg.model !== 'speech-02-turbo' || cfg.targetLang !== 'JA');
    }

    function _applyTtsSaveButtonState(isDirty) {
        const saveBtn = document.getElementById('tts-save-btn');
        if (!saveBtn) return;

        saveBtn.disabled = !isDirty;
        saveBtn.textContent = isDirty ? '保存配置' : (_hasSavedTtsConfig() ? '已保存' : '保存配置');
        saveBtn.style.background = isDirty ? 'var(--accent-color)' : 'var(--border-color)';
        saveBtn.style.color = isDirty ? '#fff' : 'var(--text-secondary)';
        saveBtn.style.cursor = isDirty ? 'pointer' : 'not-allowed';
        saveBtn.style.opacity = isDirty ? '1' : '0.65';
        saveBtn.style.boxShadow = isDirty ? '0 4px 14px rgba(var(--accent-color-rgb),0.24)' : 'none';
        saveBtn.style.transform = 'none';
    }

    function _setTtsDirty(isDirty) {
        _ttsConfigDirty = !!isDirty;
        _applyTtsSaveButtonState(_ttsConfigDirty);
        _updateTtsStatus();
    }

    function _checkTtsDirty() {
        if (!_lastSavedTtsConfig && window.voiceTTS) {
            _lastSavedTtsConfig = _normalizeTtsConfig(window.voiceTTS.getTtsConfig());
        }
        _setTtsDirty(!_isSameTtsConfig(_readTtsFormConfig(), _lastSavedTtsConfig));
    }

    function _bindTtsFieldListeners() {
        if (_ttsFieldsBound) return;
        const fields = TTS_FIELD_IDS
            .map(id => document.getElementById(id))
            .filter(Boolean);
        if (fields.length !== TTS_FIELD_IDS.length) return;

        fields.forEach(el => {
            el.addEventListener('input', _checkTtsDirty);
            el.addEventListener('change', _checkTtsDirty);
        });
        _ttsFieldsBound = true;
    }

    // ─── 初始化：打开聊天设置时填入已保存的值 ───
    function _initTtsFields() {
        if (!window.voiceTTS) return;
        const cfg = _normalizeTtsConfig(window.voiceTTS.getTtsConfig());
        const mKey  = document.getElementById('tts-minimax-key');
        const gId   = document.getElementById('tts-group-id');
        const model = document.getElementById('tts-model');
        const vId   = document.getElementById('tts-voice-id');
        const styleText = document.getElementById('tts-style-text');
        const styleCount = document.getElementById('tts-style-count');
        const speedEl   = document.getElementById('tts-speed');
        const speedInput = document.getElementById('tts-speed-value'); // 现在是 input 不是 span
        if (mKey)  mKey.value  = cfg.minimaxKey;
        if (gId)   gId.value   = cfg.groupId;
        if (model) model.value = cfg.model;
        if (vId)   vId.value   = cfg.voiceId;
        if (styleText) { styleText.value = cfg.styleText || ''; }
        if (styleCount) styleCount.textContent = (cfg.styleText || '').length;
        if (speedEl)    speedEl.value = String(cfg.speed);
        if (speedInput) speedInput.value = cfg.speed.toFixed(2);
        // 滑块 ↔ 输入框双向同步 + dirty 检测（只绑一次）
        if (speedEl && !speedEl.dataset.bound) {
            speedEl.dataset.bound = '1';
            speedEl.addEventListener('input', () => {
                // 拖滑块 → 同步到输入框
                if (speedInput) speedInput.value = Number(speedEl.value).toFixed(2);
                _checkTtsDirty();
            });
        }
        if (speedInput && !speedInput.dataset.bound) {
            speedInput.dataset.bound = '1';
            // 输入框变化时 → 同步到滑块
            // 用 input 事件实时同步；用 change/blur 时做边界夹紧（避免打字打到一半被改值）
            speedInput.addEventListener('input', () => {
                const v = Number(speedInput.value);
                if (isFinite(v) && speedEl) {
                    // 实时反映到滑块（不强制夹边界，让用户继续打字）
                    speedEl.value = String(Math.max(0.5, Math.min(2, v)));
                }
                _checkTtsDirty();
            });
            const clampInput = () => {
                let v = Number(speedInput.value);
                if (!isFinite(v) || speedInput.value === '') v = 1.0;
                v = Math.max(0.5, Math.min(2, v));
                // 四舍五入到 0.01
                v = Math.round(v * 100) / 100;
                speedInput.value = v.toFixed(2);
                if (speedEl) speedEl.value = String(v);
                _checkTtsDirty();
            };
            speedInput.addEventListener('change', clampInput);
            speedInput.addEventListener('blur', clampInput);
            // 回车直接确认（防止表单意外提交）
            speedInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    clampInput();
                    speedInput.blur();
                }
            });
        }
        _lastSavedTtsConfig = cfg;
        _paintTtsLangButtons(cfg.targetLang);
        // 性别按钮高亮
        const savedGender = cfg.gender || 'male';
        document.querySelectorAll('.tts-gender-btn').forEach(btn => {
            const isActive = btn.dataset.gender === savedGender;
            btn.classList.toggle('active', isActive);
            btn.style.border = isActive ? '1px solid var(--accent-color)' : '1px solid var(--border-color)';
            btn.style.background = isActive ? 'rgba(var(--accent-color-rgb),0.1)' : 'transparent';
            btn.style.color = isActive ? 'var(--accent-color)' : 'var(--text-secondary)';
            btn.style.fontWeight = isActive ? '600' : 'normal';
        });
        _bindTtsFieldListeners();
        _setTtsDirty(false);
    }
    window._initTtsFields = _initTtsFields;

    function _updateTtsStatus() {
        const el = document.getElementById('tts-status');
        if (!el || !window.voiceTTS) return;
        if (_ttsConfigDirty) {
            el.style.color = 'var(--accent-color)';
            el.textContent = '配置有修改，点击保存配置后才会生效';
            return;
        }
        if (window.voiceTTS.isTtsReady()) {
            el.style.color = '#4CAF50';
            el.textContent = '✓ 配置已保存，真实语音已启用';
        } else {
            el.style.color = 'var(--text-secondary)';
            el.textContent = '填写 MiniMax API Key、Group ID 和 Voice ID 后保存即可启用';
        }
    }

    // ─── 语言切换 ───
    window._setTtsLang = function(lang) {
        const nextLang = lang || 'JA';
        _paintTtsLangButtons(nextLang);
        _checkTtsDirty();
    };

    // ─── 性别切换 ───
    window._setTtsGender = function(gender, btn) {
        document.querySelectorAll('.tts-gender-btn').forEach(b => {
            const isActive = b === btn;
            b.classList.toggle('active', isActive);
            b.style.border = isActive ? '1px solid var(--accent-color)' : '1px solid var(--border-color)';
            b.style.background = isActive ? 'rgba(var(--accent-color-rgb),0.1)' : 'transparent';
            b.style.color = isActive ? 'var(--accent-color)' : 'var(--text-secondary)';
            b.style.fontWeight = isActive ? '600' : 'normal';
        });
        _checkTtsDirty();
    };

    // ─── 风格预设 ───
    window._setTtsStylePreset = function(btn) {
        const styleText = document.getElementById('tts-style-text');
        const styleCount = document.getElementById('tts-style-count');
        if (styleText) {
            styleText.value = btn.dataset.style || '';
            if (styleCount) styleCount.textContent = styleText.value.length;
        }
        _checkTtsDirty();
    };

    // ─── 保存配置 ───
    window._saveTtsConfig = function () {
        if (!window.voiceTTS || !_ttsConfigDirty) return;
        const cfg = _readTtsFormConfig();
        window.voiceTTS.saveTtsConfig(cfg.minimaxKey, cfg.groupId, cfg.voiceId, cfg.model, cfg.targetLang, cfg.gender, cfg.styleText, cfg.speed);
        _lastSavedTtsConfig = cfg;
        _setTtsDirty(false);
        // 清掉内存缓存，让下次点击用新设置重新翻译+TTS
        // 注意：IndexedDB 里的收藏音频不动
        if (window.voiceTTS.clearMemoryCache) window.voiceTTS.clearMemoryCache();
        if (typeof showNotification === 'function') {
            showNotification('配置已保存，语音缓存已重置', 'success');
        }
    };

    // ─── 试听：用当前表单状态合成测试句，按滑块语速本地播放 ───
    // 不读 / 不写 localStorage，所以可以在「保存」之前就听到效果。
    let _speedPreviewAudio = null;
    window._previewTts = async function () {
        if (typeof window._loadVoiceTTS === 'function') { try { await window._loadVoiceTTS(); } catch (e) {} }
        if (!window.voiceTTS) return;
        const btn   = document.getElementById('tts-preview-btn');
        const label = document.getElementById('tts-preview-label');
        const speedEl = document.getElementById('tts-speed');

        // 正在播放 → 再点一次=停止
        if (_speedPreviewAudio && !_speedPreviewAudio.paused) {
            try { _speedPreviewAudio.pause(); } catch (_) {}
            _speedPreviewAudio = null;
            if (label) label.textContent = '试听';
            return;
        }

        const cfg = _readTtsFormConfig();
        if (!cfg.minimaxKey || !cfg.groupId || !cfg.voiceId) {
            if (typeof showNotification === 'function') {
                showNotification('请先填写 MiniMax Key、Group ID 和 Voice ID', 'error');
            }
            return;
        }

        if (btn) btn.disabled = true;
        if (label) label.textContent = '生成中…';

        try {
            const audioUrl = await window.voiceTTS.previewWithConfig(cfg);
            const audio = new Audio(audioUrl);
            // 按滑块当前值（未保存）应用语速 + 保留音调
            const currentSpeed = speedEl ? Number(speedEl.value) : cfg.speed;
            window.voiceTTS.applyPlaybackSettings(audio, currentSpeed);
            _speedPreviewAudio = audio;
            if (label) label.textContent = '播放中';
            audio.onended = () => {
                if (label) label.textContent = '试听';
                if (_speedPreviewAudio === audio) _speedPreviewAudio = null;
            };
            audio.onerror = () => {
                if (label) label.textContent = '试听';
                if (_speedPreviewAudio === audio) _speedPreviewAudio = null;
                if (typeof showNotification === 'function') showNotification('试听播放失败', 'error');
            };
            await audio.play();
        } catch (err) {
            console.error('[tts-preview]', err);
            if (label) label.textContent = '试听';
            if (typeof showNotification === 'function') {
                showNotification('试听失败：' + (err.message || '未知错误'), 'error');
            }
        } finally {
            if (btn) btn.disabled = false;
        }
    };

    // 拖动滑块或输入数字时，如果正在播放试听，实时改变播放速度（即时反馈）
    document.addEventListener('input', (e) => {
        if (!_speedPreviewAudio || !window.voiceTTS) return;
        if (e.target && (e.target.id === 'tts-speed' || e.target.id === 'tts-speed-value')) {
            const v = Number(e.target.value);
            if (isFinite(v)) {
                window.voiceTTS.applyPlaybackSettings(_speedPreviewAudio, Math.max(0.5, Math.min(2, v)));
            }
        }
    });

    // ─── 聊天设置打开时初始化 ───
    // 注意：milk-main 的 showModal()/hideModal() 是直接改 style.display，
    // 不会给弹窗加 'active' 这个 class（这点跟别的项目不一样），
    // 之前监听 class 变化永远等不到，导致 TTS 模块和输入框事件从来没绑上过，
    // 存配置的按钮永远是禁用状态——这里改成监听 style 属性变化。
    const chatModal = document.getElementById('chat-modal');
    if (chatModal) {
        const observer = new MutationObserver(() => {
            if (chatModal.style.display === 'flex') {
                // 打开聊天设置面板时才需要用到 TTS 配置，这时候才加载 voice-tts.js
                if (typeof window._loadVoiceTTS === 'function') {
                    window._loadVoiceTTS().then(() => setTimeout(_initTtsFields, 50)).catch(() => {});
                } else {
                    setTimeout(_initTtsFields, 50);
                }
            }
        });
        observer.observe(chatModal, { attributes: true, attributeFilter: ['style'] });
    }

    // ─── 页面加载时也回填一次（防止刷新后显示空白；只在 voiceTTS 已经因为其他原因加载过时才有意义，
    //      不会主动触发加载，避免刚打开 App 就把 TTS 模块塞进内存）───
    document.addEventListener('DOMContentLoaded', () => setTimeout(_initTtsFields, 300));
    setTimeout(_initTtsFields, 500);

    // ============================================
    // 声音克隆 Modal 控制
    // ============================================
    let _clonedVoiceId = null;
    let _previewAudio  = null;

    window._openVoiceCloneModal = function () {
        const modal = document.getElementById('voice-clone-modal');
        if (!modal) return;
        _resetCloneModal();
        // 打开声音克隆面板一定会用到 TTS 模块，提前触发懒加载
        if (typeof window._loadVoiceTTS === 'function') window._loadVoiceTTS().catch(() => {});
        // 兼容不同时机：优先用全局showModal，否则直接操作class
        if (typeof showModal === 'function') {
            showModal(modal);
        } else {
            modal.classList.add('active');
            document.body.classList.add('modal-open');
        }
    };

    window._closeVoiceCloneModal = function () {
        const modal = document.getElementById('voice-clone-modal');
        if (!modal) return;
        if (typeof hideModal === 'function') {
            hideModal(modal);
        } else {
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
        if (_previewAudio) { _previewAudio.pause(); _previewAudio = null; }
    };

    function _resetCloneModal() {
        _clonedVoiceId = null;
        if (_previewAudio) { _previewAudio.pause(); _previewAudio = null; }
        const s1 = document.getElementById('voice-clone-step1');
        const s2 = document.getElementById('voice-clone-step2');
        const loading = document.getElementById('voice-clone-loading');
        const preview = document.getElementById('voice-clone-preview');
        const status  = document.getElementById('voice-clone-step1-status');
        const label   = document.getElementById('voice-clone-upload-label');
        const fileInput = document.getElementById('voice-clone-file-input');
        if (s1) s1.style.display = '';
        if (s2) s2.style.display = 'none';
        if (loading) loading.style.display = '';
        if (preview) preview.style.display = 'none';
        if (status)  status.textContent = '';
        if (label)   label.textContent  = '点击选择音频文件';
        if (fileInput) fileInput.value  = '';
    }

    window._retryVoiceClone = _resetCloneModal;

    // 文件选择后更新标签
    document.addEventListener('DOMContentLoaded', function () {
        const fileInput = document.getElementById('voice-clone-file-input');
        if (fileInput) {
            fileInput.addEventListener('change', function () {
                const label = document.getElementById('voice-clone-upload-label');
                if (label && fileInput.files[0]) {
                    label.textContent = '已选择：' + fileInput.files[0].name;
                }
            });
        }
    });

    // ─── 开始克隆 ───
    window._startVoiceClone = async function () {
        if (typeof window._loadVoiceTTS === 'function') { try { await window._loadVoiceTTS(); } catch (e) {} }
        if (!window.voiceTTS) return;
        const fileInput = document.getElementById('voice-clone-file-input');
        const file = fileInput && fileInput.files[0];
        if (!file) {
            const status = document.getElementById('voice-clone-step1-status');
            if (status) { status.style.color = '#e57373'; status.textContent = '请先选择音频文件'; }
            return;
        }
        const name = (document.getElementById('voice-clone-name')?.value || '').trim() || '梦角';

        // 切到 step2 · loading
        const s1 = document.getElementById('voice-clone-step1');
        const s2 = document.getElementById('voice-clone-step2');
        if (s1) s1.style.display = 'none';
        if (s2) s2.style.display = '';

        try {
            _clonedVoiceId = await window.voiceTTS.cloneVoice(file, name);
            // 显示预览区
            const loading = document.getElementById('voice-clone-loading');
            const preview = document.getElementById('voice-clone-preview');
            if (loading) loading.style.display = 'none';
            if (preview) preview.style.display = '';
        } catch (err) {
            console.error('[voice-clone]', err);
            // 回到 step1 并显示错误
            if (s1) s1.style.display = '';
            if (s2) s2.style.display = 'none';
            const status = document.getElementById('voice-clone-step1-status');
            if (status) {
                status.style.color = '#e57373';
                status.textContent = '克隆失败：' + (err.message || '请检查 API Key 和网络');
            }
        }
    };

    // ─── 试听 ───
    window._playVoicePreview = async function () {
        if (typeof window._loadVoiceTTS === 'function') { try { await window._loadVoiceTTS(); } catch (e) {} }
        if (!_clonedVoiceId || !window.voiceTTS) return;
        const btn = document.getElementById('voice-clone-play-preview');
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> 生成中…'; }
        try {
            // 先把临时 voiceId 存进配置用于试听（不影响真正保存）
            const cfg = window.voiceTTS.getTtsConfig();
            const origId = cfg.voiceId;
            window.voiceTTS.saveTtsConfig(cfg.minimaxKey, cfg.groupId, _clonedVoiceId, cfg.model, cfg.targetLang);

            const audioUrl = await window.voiceTTS.previewClonedVoice(_clonedVoiceId);
            if (_previewAudio) _previewAudio.pause();
            _previewAudio = new Audio(audioUrl);
            _previewAudio.play();
            _previewAudio.onended = () => {
                if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-play"></i> 再听一次'; }
            };

            // 恢复原 voiceId（等确认后才真正写入）
            window.voiceTTS.saveTtsConfig(cfg.minimaxKey, cfg.groupId, origId, cfg.model, cfg.targetLang);
        } catch (err) {
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-play"></i> 试听效果'; }
            if (typeof showNotification === 'function') {
                showNotification('试听失败：' + (err.message || ''), 'error');
            }
        }
    };

    // ─── 确认使用克隆的声音 ───
    window._confirmVoiceClone = function () {
        if (!_clonedVoiceId || !window.voiceTTS) return;

        // 同步回设置页输入框，但不直接保存。
        // 让用户统一点击「保存配置」后再生效，避免配置被悄悄改掉。
        const vIdInput = document.getElementById('tts-voice-id');
        if (vIdInput) vIdInput.value = _clonedVoiceId;
        _checkTtsDirty();

        window._closeVoiceCloneModal();
        if (typeof showNotification === 'function') {
            showNotification('声音 ID 已填入，请点击保存配置后生效', 'success');
        }
    };
})();
