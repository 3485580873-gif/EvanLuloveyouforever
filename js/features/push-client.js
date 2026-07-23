// 推送通知客户端模块。
// 用法：
//   1. 部署好 cf-push 后端后，把下面 BACKEND_URL 和 APP_SECRET 改成你自己的
//   2. 用户在「设置 → 推送通知」里点开启，会走：注册 ServiceWorker → 订阅推送 → 把订阅信息发给后端
//   3. 其他功能模块（目前是 envelope.js）在算出"未来该提醒用户"的时间点时，
//      调用 window.pushNotify.schedule(tag, fireAtMs, title, body, url) 登记一条

const PUSH_CONFIG_KEY = 'pushBackendConfig'; // 全局存储，不与会话绑定

// 全局存储 key（不依赖 SESSION_ID，避免会话未初始化时读不到）
function getPushStorageKey() {
  const prefix = (typeof window !== 'undefined' && window.APP_PREFIX) || 'CHAT_APP_V3_';
  return prefix + PUSH_CONFIG_KEY;
}

window.pushNotify = (function () {
  let config = { backendUrl: '', appSecret: '' };
  let swRegistration = null;

  async function loadConfig() {
    try {
      const saved = await localforage.getItem(getPushStorageKey());
      if (saved && typeof saved === 'object') {
        config = saved;
      }
    } catch (e) {
      console.warn('[pushNotify] loadConfig failed', e);
    }
    return config;
  }

  async function saveConfig(backendUrl, appSecret) {
    config = { backendUrl: (backendUrl || '').replace(/\/+$/, ''), appSecret: appSecret || '' };
    try {
      await localforage.setItem(getPushStorageKey(), config);
    } catch (e) {
      console.warn('[pushNotify] saveConfig failed', e);
    }
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
  }

  async function apiFetch(path, opts = {}) {
    if (!config.backendUrl) throw new Error('尚未配置推送后端地址');
    const resp = await fetch(config.backendUrl + path, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        'X-App-Secret': config.appSecret || '',
        ...(opts.headers || {})
      }
    });
    if (!resp.ok) {
      let msg = resp.statusText;
      try { const j = await resp.json(); if (j.error) msg = j.error; } catch (e) {}
      throw new Error(msg);
    }
    return resp.json().catch(() => ({}));
  }

  async function isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  async function getStatus() {
    await loadConfig();
    if (!(await isSupported())) return 'unsupported';
    if (!config.backendUrl) return 'not-configured';
    if (Notification.permission === 'denied') return 'denied';
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) return 'enabled';
      }
    } catch (e) {}
    return 'disabled';
  }

  async function enable(backendUrl, appSecret) {
    if (!(await isSupported())) throw new Error('当前浏览器/环境不支持推送（iOS 需要 16.4+ 并且已添加到主屏幕独立打开）');
    if (backendUrl) await saveConfig(backendUrl, appSecret);
    await loadConfig();
    if (!config.backendUrl) throw new Error('请先填写后端地址');

    swRegistration = await navigator.serviceWorker.register('./sw.js');
    await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('未授权通知权限');

    const { publicKey } = await apiFetch('/api/push/vapid-public-key');
    if (!publicKey) throw new Error('未能获取推送公钥，检查后端是否正确部署');

    let sub = await swRegistration.pushManager.getSubscription();
    if (!sub) {
      sub = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });
    }

    const subJson = sub.toJSON();
    await apiFetch('/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify({ endpoint: subJson.endpoint, keys: subJson.keys })
    });

    return true;
  }

  async function disable() {
    await loadConfig();
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = reg && (await reg.pushManager.getSubscription());
      if (sub) {
        await apiFetch('/api/push/unsubscribe', {
          method: 'POST',
          body: JSON.stringify({ endpoint: sub.endpoint })
        }).catch(() => {});
        await sub.unsubscribe();
      }
    } catch (e) {}
  }

  // tag: 幂等标识（比如 'envelope_reply_' + letterId），fireAtMs: 触发时间戳(ms)
  async function schedule(tag, fireAtMs, title, body, url) {
    await loadConfig();
    if (!config.backendUrl) return; // 没配置后端就悄悄跳过，不影响本地既有逻辑
    try {
      await apiFetch('/api/notify/schedule', {
        method: 'POST',
        body: JSON.stringify({ tag, fireAt: fireAtMs, title, body, url: url || './index.html' })
      });
    } catch (e) {
      console.warn('[pushNotify] schedule failed', e);
    }
  }

  async function cancel(tag) {
    await loadConfig();
    if (!config.backendUrl) return;
    try {
      await apiFetch('/api/notify/cancel', { method: 'POST', body: JSON.stringify({ tag }) });
    } catch (e) {
      console.warn('[pushNotify] cancel failed', e);
    }
  }

  return { isSupported, getStatus, enable, disable, schedule, cancel, loadConfig, saveConfig, getConfig: () => config };
})();

// ---- 设置页里的开关/输入框接线 ----
(function () {
    let saveTimer = null;

    async function refreshUI() {
        const sw = document.getElementById('push-notify-switch');
        const urlInput = document.getElementById('push-backend-url');
        const secretInput = document.getElementById('push-app-secret');

        // 设置面板还没渲染就稍后重试（最多等3秒）
        if (!sw) {
            let retries = 0;
            const tryAgain = setInterval(() => {
                retries++;
                if (retries > 15) { clearInterval(tryAgain); return; }
                if (document.getElementById('push-notify-switch')) {
                    clearInterval(tryAgain);
                    refreshUI();
                }
            }, 200);
            return;
        }

        const cfg = await window.pushNotify.loadConfig();
        if (urlInput && document.activeElement !== urlInput) urlInput.value = cfg.backendUrl || '';
        if (secretInput && document.activeElement !== secretInput) secretInput.value = cfg.appSecret || '';

        const row = document.getElementById('push-notify-toggle');
        const desc = document.getElementById('push-notify-desc');
        const status = await window.pushNotify.getStatus();
        if (row) row.classList.toggle('active', status === 'enabled');
        if (desc) {
            const map = {
                unsupported: '当前环境不支持（iOS需16.4+并已添加到主屏幕）',
                'not-configured': '先填好下面的后端地址再开启',
                denied: '通知权限被拒绝，去系统设置里重新允许',
                enabled: '已开启 · App被系统挂起也能收到提醒',
                disabled: '未开启'
            };
            desc.textContent = map[status] || '';
        }
    }

    function debouncedSave() {
        const urlInput = document.getElementById('push-backend-url');
        const secretInput = document.getElementById('push-app-secret');
        if (!urlInput && !secretInput) return;

        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            window.pushNotify.saveConfig(
                urlInput ? urlInput.value.trim() : '',
                secretInput ? secretInput.value.trim() : ''
            );
        }, 400);
    }

    window._togglePushNotify = async function () {
        const status = await window.pushNotify.getStatus();
        if (status === 'enabled') {
            await window.pushNotify.disable();
            if (typeof showNotification === 'function') showNotification('推送通知已关闭', 'info', 1500);
        } else {
            const urlInput = document.getElementById('push-backend-url');
            const secretInput = document.getElementById('push-app-secret');
            try {
                await window.pushNotify.enable(urlInput && urlInput.value.trim(), secretInput && secretInput.value.trim());
                if (typeof showNotification === 'function') showNotification('推送通知已开启 🔔', 'success', 2000);
            } catch (e) {
                if (typeof showNotification === 'function') showNotification(e.message || '开启失败', 'warning', 2500);
            }
        }
        refreshUI();
    };

    document.addEventListener('DOMContentLoaded', refreshUI);

    // 输入时实时保存（防抖400ms），防止闪退/刷新前没失焦导致丢数据
    document.addEventListener('input', function (e) {
        if (e.target && (e.target.id === 'push-backend-url' || e.target.id === 'push-app-secret')) {
            debouncedSave();
        }
    }, true);

    // 失焦时也存一次兜底
    document.addEventListener('blur', function (e) {
        if (e.target && (e.target.id === 'push-backend-url' || e.target.id === 'push-app-secret')) {
            if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
            debouncedSave();
        }
    }, true);

    // 页面前进/返回时也刷新一下
    window.addEventListener('pageshow', function () {
        setTimeout(refreshUI, 100);
    });
})();
