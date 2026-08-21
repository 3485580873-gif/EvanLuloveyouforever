/**
 * cloud-media-fix.js — 修复「oss:// 云端引用图片/背景显示空白」问题
 *
 * 背景：表情包/图片/背景迁移到阿里云 OSS 后，存储值从 base64 变成内部引用
 *       "oss://media/<sid>/<category>/<id>.<ext>"。Evan 原站所有渲染代码
 *       都是直接把该值赋给 <img src> 或 style.backgroundImage / CSS 变量，
 *       浏览器不认识 oss:// 协议 → 加载失败 → 显示空白/裂图。
 *
 * 覆盖场景：
 *   1. <img src="oss://...">（表情选择器、表情库、消息图片、背景缩略图等）
 *   2. CSS 变量 --chat-bg-image = url(oss://...)（聊天主背景）
 *   3. element.style.backgroundImage = url(oss://...)（主题头部背景、卡片背景、黑胶封面等）
 *
 * 机制：
 *   - MutationObserver 监听 document.documentElement（根），src/style 变化即时修复
 *   - 轮询兜底（常驻，每 2s 一次，成本极低）
 *   - error 事件委托兜底
 *   - 解析前先换 1x1 透明占位图，避免白闪
 */
(function () {
    'use strict';

    var PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

    function _isOssRef(v) {
        return typeof v === 'string' && v.indexOf('oss://') === 0;
    }

    // 从 url(oss://...) 或裸 oss://... 字符串中提取引用
    function _extractOssRef(str) {
        if (!str || typeof str !== 'string') return null;
        var m = str.match(/url\(\s*["']?(oss:\/\/[^)"']+)/);
        if (m) return m[1];
        m = str.match(/(^|[^a-zA-Z0-9])(oss:\/\/[^\s"'()]+)/);
        if (m) return m[2];
        return null;
    }

    function _getCloudMedia() {
        return window.CloudMedia && typeof window.CloudMedia.fetchUrl === 'function' ? window.CloudMedia : null;
    }

    // ── 1) <img src="oss://..."> ──
    function _resolve(img) {
        if (!img || img.tagName !== 'IMG') return;
        if (img.getAttribute('data-cloud-fix') === '1') return;
        var ref = img.getAttribute('src') || '';
        if (!_isOssRef(ref)) return;
        img.setAttribute('data-cloud-fix', '1');
        img.src = PLACEHOLDER;

        var CM = _getCloudMedia();
        if (!CM) {
            img.removeAttribute('data-cloud-fix');
            img.classList.add('cloud-media-error');
            return;
        }
        CM.fetchUrl(ref).then(function (url) {
            if (img.getAttribute('data-cloud-fix') === '1') {
                img.src = url;
                img.classList.add('cloud-media-loaded');
            }
            img.removeAttribute('data-cloud-fix');
        }).catch(function () {
            img.removeAttribute('data-cloud-fix');
            img.classList.add('cloud-media-error');
        });
    }

    // ── 2) CSS 变量 --chat-bg-image（聊天主背景）──
    // applyBackground() 会把存储值写成 url(oss://media/xxx)
    function _fixCssVariable() {
        var doc = document.documentElement;
        if (!doc) return;
        var v = doc.style.getPropertyValue('--chat-bg-image') || '';
        if (v.indexOf('oss://') === -1) return;
        var ref = _extractOssRef(v);
        if (!ref) return;
        if (doc.getAttribute('data-bg-fixing') === ref) return; // 正在解析，跳过
        var CM = _getCloudMedia();
        if (!CM) return;
        doc.setAttribute('data-bg-fixing', ref);
        CM.fetchUrl(ref).then(function (url) {
            doc.removeAttribute('data-bg-fixing');
            var cur = doc.style.getPropertyValue('--chat-bg-image') || '';
            // 仅当用户没有在这期间切换到别的背景时替换
            if (cur.indexOf(ref) !== -1) {
                doc.style.setProperty('--chat-bg-image', 'url(' + url + ')');
            }
        }).catch(function () {
            doc.removeAttribute('data-bg-fixing');
        });
    }

    // ── 3) 元素内联 style.backgroundImage = url(oss://...) ──
    // 主题头部背景(features.js)、卡片背景、黑胶封面(listeners.js)、onboarding 引导等
    function _fixElementStyle(el) {
        if (!el || !el.style) return;
        var bg = el.style.backgroundImage || '';
        if (bg.indexOf('oss://') === -1) return;
        var ref = _extractOssRef(bg);
        if (!ref) return;
        if (el.getAttribute('data-bg-fixing-el') === ref) return; // 正在解析
        var CM = _getCloudMedia();
        if (!CM) return;
        el.setAttribute('data-bg-fixing-el', ref);
        CM.fetchUrl(ref).then(function (url) {
            el.removeAttribute('data-bg-fixing-el');
            var cur = el.style.backgroundImage || '';
            if (cur.indexOf(ref) !== -1) {
                el.style.backgroundImage = cur.replace(ref, url);
            }
        }).catch(function () {
            el.removeAttribute('data-bg-fixing-el');
            el.classList.add('cloud-media-error');
        });
    }

    // ── 全量扫描 ──
    function _scanAll() {
        var imgs = document.querySelectorAll('img[src^="oss://"]');
        for (var i = 0; i < imgs.length; i++) _resolve(imgs[i]);
        _fixCssVariable();
        var els = document.querySelectorAll('[style*="oss://"]');
        for (var j = 0; j < els.length; j++) _fixElementStyle(els[j]);
    }

    // error 事件委托：浏览器加载 oss:// 协议必然失败，捕获后解析
    document.addEventListener('error', function (e) {
        var t = e.target;
        if (t && t.tagName === 'IMG' && _isOssRef(t.getAttribute('src'))) {
            _resolve(t);
        }
    }, true);

    function _start() {
        _scanAll();
        if ('MutationObserver' in window) {
            // 必须观察 document.documentElement（根），因为 --chat-bg-image 设置在 html 上，
            // 只观察 body 子树会漏掉 html 的 style 变化
            var observer = new MutationObserver(function (mutations) {
                var needScan = false;
                for (var i = 0; i < mutations.length; i++) {
                    var m = mutations[i];
                    if (m.type === 'attributes' && m.attributeName === 'src') {
                        _resolve(m.target);
                    } else if (m.type === 'attributes' && m.attributeName === 'style') {
                        _fixCssVariable();
                        _fixElementStyle(m.target);
                    } else if (m.addedNodes && m.addedNodes.length) {
                        needScan = true;
                    }
                }
                if (needScan) _scanAll();
            });
            observer.observe(document.documentElement, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['src', 'style']
            });
        }
        // 常驻轮询兜底（成本极低）：覆盖 observer 漏掉的场景（如 display:none 元素、跨域 iframe 等）
        setInterval(_scanAll, 2000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _start);
    } else {
        _start();
    }
})();
