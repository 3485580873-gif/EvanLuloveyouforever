/**
 * cloud-media-fix.js — 修复「oss:// 云端引用图片显示空白」问题
 *
 * 背景：表情包/图片迁移到阿里云 OSS 后，存储值从 base64 变成内部引用
 *       "oss://media/<sid>/<category>/<id>.<ext>"。Evan 原站的表情选择器、
 *       表情库、消息渲染等代码都是直接把该值赋给 <img src>，
 *       浏览器不认识 oss:// 协议 → 加载失败 → 显示空白/裂图。
 *
 * 方案：全局兜底，把 <img src="oss://..."> 自动解析成可显示的 blob URL。
 *   - MutationObserver 主动扫描（覆盖 display:none / 未触发 error 的元素）
 *   - error 事件委托兜底（覆盖各种动态插入的 <img>）
 *   - 解析前先换 1x1 透明占位图，避免白闪
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

    // 1) error 事件委托：浏览器加载 oss:// 协议必然失败，捕获后解析
    document.addEventListener('error', function (e) {
        var t = e.target;
        if (t && t.tagName === 'IMG' && _isOssRef(t.getAttribute('src'))) {
            _resolve(t);
        }
    }, true);

    // 2) MutationObserver：主动发现新增/改 src 的 <img>
    function _start() {
        _scan(document);
        if ('MutationObserver' in window) {
            var observer = new MutationObserver(function (mutations) {
                var needScan = false;
                for (var i = 0; i < mutations.length; i++) {
                    var m = mutations[i];
                    if (m.type === 'attributes' && m.attributeName === 'src') {
                        _resolve(m.target);
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
                attributeFilter: ['src']
            });
        } else {
            // 兜底：不支持 MutationObserver 的环境定时扫描
            var count = 0;
            var iv = setInterval(function () {
                _scan(document);
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
