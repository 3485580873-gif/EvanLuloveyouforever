/**
 * cloud-media-fix.js — 修复「oss:// 云端引用图片显示空白」问题
 *
 * 背景：表情包/图片迁移到阿里云 OSS 后，存储值从 base64 变成内部引用
 *       "oss://media/<sid>/<category>/<id>.<ext>"。Evan 原站的表情选择器、
 *       表情库、消息渲染等代码都是直接把该值赋给 <img src>，
 *       浏览器不认识 oss:// 协议 → 加载失败 → 显示空白/裂图。
 *
 * 方案：全局兜底，把 <img src="oss://..."> 与 CSS 背景 url(oss://...) 自动解析成可显示的 blob URL。
 *   - MutationObserver 主动扫描（覆盖 display:none / 未触发 error 的元素）
 *   - error 事件委托兜底（覆盖各种动态插入的 <img>）
 *   - 解析前先换 1x1 透明占位图，避免白闪
 *   - 轮询修复 --chat-bg-image CSS 变量里的 oss:// 背景引用（聊天背景）
 */
(function () {
    'use strict';

    var PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

    function _isOssRef(v) {
        return typeof v === 'string' && v.indexOf('oss://') === 0;
    }

    function _resolve(img) {
        if (!img || img.tagName !== 'IMG') return;
        if (img.getAttribute('data-cloud-fix') === '1') return;
        var ref = img.getAttribute('src') || '';
        if (!_isOssRef(ref)) return;
        img.setAttribute('data-cloud-fix', '1');
        img.src = PLACEHOLDER;

        var CM = window.CloudMedia;
        if (!CM || typeof CM.fetchUrl !== 'function') {
            img.removeAttribute('data-cloud-fix');
            img.classList.add('cloud-media-error');
            return;
        }
        CM.fetchUrl(ref).then(function (url) {
            if (img.isConnected || img.getAttribute('data-cloud-fix') === '1') {
                img.src = url;
                img.classList.remove('cloud-media-pending');
                img.classList.remove('cloud-media-loading');
                img.classList.add('cloud-media-loaded');
            }
            img.removeAttribute('data-cloud-fix');
        }).catch(function () {
            img.removeAttribute('data-cloud-fix');
            img.classList.add('cloud-media-error');
        });
    }

    function _scan(root) {
        var imgs = (root || document).querySelectorAll('img[src^="oss://"]');
        for (var i = 0; i < imgs.length; i++) _resolve(imgs[i]);
    }

    // 修复 CSS 背景变量 --chat-bg-image 中的 oss:// 引用（聊天背景图）
    // applyBackground() 会把存储值写成 url(oss://media/xxx)，CSS 无法加载 oss:// 协议 → 背景空白
    function _fixCssBackground() {
        var doc = document.documentElement;
        if (!doc) return;
        var v = doc.style.getPropertyValue('--chat-bg-image');
        if (!v || v.indexOf('oss://') === -1) return;
        var m = v.match(/url\(\s*["']?(oss:\/\/[^)"']+)/);
        if (!m) return;
        var ref = m[1];
        if (doc.getAttribute('data-bg-fixing') === ref) return; // 正在解析，跳过
        var CM = window.CloudMedia;
        if (!CM || typeof CM.fetchUrl !== 'function') return;
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

    // 兜底：CSS 变量是 applyBackground() 随时可能写入的，轮询修复
    var _bgFixCount = 0;
    var _bgFixTimer = setInterval(function () {
        _fixCssBackground();
        if (++_bgFixCount > 120) clearInterval(_bgFixTimer); // 最多 3 分钟
    }, 1500);

    // 1) error 事件委托：浏览器加载 oss:// 协议必然失败，捕获后解析
    document.addEventListener('error', function (e) {
        var t = e.target;
        if (t && t.tagName === 'IMG' && _isOssRef(t.getAttribute('src'))) {
            _resolve(t);
        }
    }, true);

    // 2) MutationObserver：主动发现新增/改 src 的 <img> 以及背景样式变化
    function _start() {
        _scan(document);
        _fixCssBackground();
        if ('MutationObserver' in window) {
            var observer = new MutationObserver(function (mutations) {
                var needScan = false;
                for (var i = 0; i < mutations.length; i++) {
                    var m = mutations[i];
                    if (m.type === 'attributes' && m.attributeName === 'src') {
                        _resolve(m.target);
                    } else if (m.type === 'attributes' && m.attributeName === 'style') {
                        _fixCssBackground();
                    } else if (m.addedNodes && m.addedNodes.length) {
                        needScan = true;
                    }
                }
                if (needScan) _scan(document);
            });
            observer.observe(document.body || document.documentElement, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['src', 'style']
            });
        } else {
            // 兜底：不支持 MutationObserver 的环境定时扫描
            var count = 0;
            var iv = setInterval(function () {
                _scan(document);
                _fixCssBackground();
                if (++count > 30) clearInterval(iv);
            }, 2000);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _start);
    } else {
        _start();
    }
})();
