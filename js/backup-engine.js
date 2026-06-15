/**
 * 统一备份/恢复：v5 默认 ZIP（结构 JSON + media/ 二进制），避免单文件巨型 JSON 无法解析；
 * v4 单文件 JSON 仍可导入。依赖：localforage、JSZip（CDN）、全局 APP_PREFIX / SESSION_ID。
 */
(function (global) {
    'use strict';

    var MIN_MEDIA_CHARS = 800;

    function escapeRe(s) {
        return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function isDataMediaUrl(s) {
        return typeof s === 'string' && s.length > MIN_MEDIA_CHARS && /^data:(image|video)\//i.test(s);
    }

    function isZipArrayBuffer(ab) {
        if (!ab || ab.byteLength < 4) return false;
        var u = new Uint8Array(ab);
        return u[0] === 0x50 && u[1] === 0x4b && (u[2] === 0x03 || u[2] === 0x05 || u[2] === 0x07) &&
            (u[3] === 0x04 || u[3] === 0x06 || u[3] === 0x08);
    }

    function dataUrlToBinary(dataUrl) {
        if (typeof dataUrl !== 'string') return null;
        var m = /^data:([^,]+),([\s\S]*)$/.exec(dataUrl);
        if (!m) return null;
        var header = m[1];
        var body = m[2].replace(/\s/g, '');
        var mime = header.split(';')[0].trim();
        var isB64 = /;base64/i.test(header);
        if (isB64) {
            try {
                var binary = atob(body);
                var len = binary.length;
                var bytes = new Uint8Array(len);
                for (var i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
                return { mime: mime, bytes: bytes };
            } catch (e) {
                return null;
            }
        }
        try {
            return { mime: mime, bytes: new TextEncoder().encode(decodeURIComponent(body)) };
        } catch (e2) {
            return null;
        }
    }

    function uint8ToBase64Chunked(u8) {
        var CHUNK = 0x8000;
        var str = '';
        for (var i = 0; i < u8.length; i += CHUNK) {
            str += String.fromCharCode.apply(null, u8.subarray(i, Math.min(i + CHUNK, u8.length)));
        }
        return btoa(str);
    }

    function binaryToDataUrl(mime, u8) {
        return 'data:' + (mime || 'application/octet-stream') + ';base64,' + uint8ToBase64Chunked(u8);
    }

    function deepCloneJsonSafe(obj) {
        try {
            return JSON.parse(JSON.stringify(obj, function (k, v) {
                if (v instanceof Date) return v.toISOString();
                return v;
            }));
        } catch (e) {
            return obj;
        }
    }

    /**
     * 将大树中的 data: 媒体字符串抽离到 store，原处替换为 { __mRef: id }（导入时再展开）
     */
    function extractMediaTree(node, state) {
        if (!state) state = { store: {}, map: new Map(), n: 0 };
        if (node === null || node === undefined) return node;
        if (typeof node === 'string') {
            if (isDataMediaUrl(node)) {
                var id = state.map.get(node);
                if (!id) {
                    id = 'm' + state.n++;
                    state.map.set(node, id);
                    state.store[id] = node;
                }
                return { __mRef: id };
            }
            return node;
        }
        if (Array.isArray(node)) return node.map(function (x) { return extractMediaTree(x, state); });
        if (typeof node === 'object') {
            if (node instanceof Date) return node.toISOString();
            var out = {};
            for (var k in node) {
                if (!Object.prototype.hasOwnProperty.call(node, k)) continue;
                out[k] = extractMediaTree(node[k], state);
            }
            return out;
        }
        return node;
    }

    function inlineMediaTree(node, store) {
        if (!store) store = {};
        if (node === null || node === undefined) return node;
        if (typeof node === 'object' && !Array.isArray(node) && node.__mRef && typeof node.__mRef === 'string') {
            var blob = store[node.__mRef];
            if (blob !== undefined && blob !== null) return blob;
            console.warn('[backup] mediaStore 中缺少 __mRef:', node.__mRef);
            return ''; // 降级为空字符串，避免保留 __mRef 对象
        }
        if (Array.isArray(node)) return node.map(function (x) { return inlineMediaTree(x, store); });
        if (typeof node === 'object') {
            var o = {};
            for (var k in node) {
                if (!Object.prototype.hasOwnProperty.call(node, k)) continue;
                o[k] = inlineMediaTree(node[k], store);
            }
            return o;
        }
        return node;
    }

    function processLocalStorageValueForExport(str, state) {
        if (str == null) return str;
        if (typeof str !== 'string') return str;
        if (isDataMediaUrl(str)) {
            var id = state.map.get(str);
            if (!id) {
                id = 'm' + state.n++;
                state.map.set(str, id);
                state.store[id] = str;
            }
            return JSON.stringify({ __mRef: id });
        }
        try {
            var parsed = JSON.parse(str);
            var extracted = extractMediaTree(parsed, state);
            return JSON.stringify(extracted);
        } catch (e) {
            return str;
        }
    }

    function processLocalStorageValueForImport(str, store) {
        if (str == null) return str;
        if (typeof str !== 'string') return str;
        try {
            var parsed = JSON.parse(str);
            return JSON.stringify(inlineMediaTree(parsed, store));
        } catch (e) {
            return str;
        }
    }

    /**
     * 直接在 JSON 字符串中替换 __mRef 引用，避免 JSON.parse/stringify 对大 base64 的内存开销
     */
    function inlineMediaRefsInJson(jsonStr, store) {
        if (typeof jsonStr !== 'string' || !jsonStr) return jsonStr;
        if (!store || typeof store !== 'object') return jsonStr;
        var result = jsonStr;
        var refRe = /\{"__mRef":"([^"]+)"\}/g;
        var match;
        var replacements = [];
        while ((match = refRe.exec(jsonStr)) !== null) {
            var refId = match[1];
            var blob = store[refId];
            if (blob !== undefined && blob !== null) {
                replacements.push({ from: match[0], to: JSON.stringify(blob) });
            } else {
                console.warn('[backup] mediaStore 中缺少 __mRef:', refId);
                replacements.push({ from: match[0], to: '""' });
            }
        }
        for (var i = 0; i < replacements.length; i++) {
            result = result.split(replacements[i].from).join(replacements[i].to);
        }
        return result;
    }

    function inferBackupSessionId(lfKeys, appPrefix) {
        var pfx = appPrefix || (typeof APP_PREFIX !== 'undefined' ? APP_PREFIX : 'CHAT_APP_V3_');
        var skipParts = ['MIGRATION', 'sessionList', 'lastSessionId', 'customThemes', 'themeSchemes'];
        for (var i = 0; i < lfKeys.length; i++) {
            var sk = lfKeys[i];
            if (!sk || !sk.startsWith(pfx)) continue;
            if (skipParts.some(function (s) { return sk.startsWith(pfx + s); })) continue;
            var after = sk.slice(pfx.length);
            var u = after.indexOf('_');
            if (u > 0) return after.slice(0, u);
        }
        return null;
    }

    function remapLfKey(key, oldSid, newSid, appPrefix) {
        if (!oldSid || !newSid || oldSid === newSid || !key) return key;
        var re = new RegExp(escapeRe(oldSid), 'g');
        return key.replace(re, newSid);
    }

    /** 与 group-chat 导出勾选项一致：未勾选的模块对应键名子串会被排除 */
    function buildModuleSkipPatterns(flags) {
        flags = flags || {};
        var p = [];
        if (!flags.inclStickers) p.push('stickerLibrary', 'myStickerLibrary');
        if (!flags.inclThemes) p.push('backgroundGallery', 'chatBackground', 'partnerAvatar', 'myAvatar', 'playerCover');
        if (!flags.inclMsgs) p.push('chatMessages');
        if (!flags.inclSet) p.push('chatSettings', 'partnerPersonas', 'showPartnerNameInChat');
        if (!flags.inclCustom) p.push('customReplies', 'customPokes', 'customStatuses', 'customMottos', 'customIntros', 'customEmojis', 'customReplyGroups', 'customPokeGroups', 'customStatusGroups');
        if (!flags.inclThemes) p.push('customThemes', 'themeSchemes');
        if (!flags.inclDg) p.push('dg_custom_data', 'dg_status_pool', 'weekly_fortune', 'daily_fortune', 'customWeather_', 'dg_header_bg', 'dg_overlay_bg', 'dg_overlay_bg_tint', '_dgUserSalt', 'dailyFortuneNotes_');
        // 新增模块
        if (!flags.inclHome) p.push('home_page_bg', 'home_card_bg', 'home_icon_color', 'home_icon_color_name', 'home_hero_subtitle', 'home_theme', 'home_theme_custom', 'home_app_icons', 'home_app_order', 'home_session_bind', 'home_avatar_sync', 'home_bg_sync', 'home_card_bg_custom', 'home_page_bg_custom', 'home_profile_', 'profile_me', 'home_avatar_me');
        if (!flags.inclMoyu) p.push('moyuRecords', 'currentMoyuRecord', 'moyuWorkSession', 'moyuLocations', 'moyuActivities', 'moyuUnread');
        if (!flags.inclShop) p.push('shop_balance', 'shop_search_history', 'shop_gift_cabinet', 'shop_products', 'shop_cart', 'shop_orders');
        if (!flags.inclMoments) p.push('moments_data', 'moments_visitor_records', 'moments_friends', 'moments_reply_speed', 'moments_reply_count_min', 'moments_reply_count_max', 'moments_friend_like', 'moments_cover', 'moments_visitor_last_online', 'moments_visitor_last_viewed_count', 'home_avatar_me', 'profile_me');
        if (!flags.inclMap) p.push('_mapData');
        if (!flags.inclTaPhone) p.push('ta_phone_collections');
        if (!flags.inclPet) p.push('petGameState', 'pixelPetGame');
        if (!flags.inclDiary) p.push('diaryTodos', 'diaryHabits', 'diaryHabitRecords', 'diaryPeriodRecords', 'diaryAnniversaries', 'diaryTodoCategories', 'diaryPeriodLastReminderDate');
        if (!flags.inclAccounting) p.push('accountingRecords', 'accountingLabels');
        if (!flags.inclEnvelope) p.push('envelopeData');
        if (!flags.inclMood) p.push('moodCalendar', 'customMoodOptions', 'moodTrash');
        if (!flags.inclTarot) p.push('diviHistory', 'customTarotDeck', 'customTarotEnabled');
        if (!flags.inclCall) p.push('callFeatureEnabled', 'callWindowPos', 'callWindowSize', 'callPillPos', 'callBgImageData');
        if (!flags.inclGroupChat) p.push('groupChatSettings', 'gca_');
        if (!flags.inclSpark) p.push('chat_streak_data');
        if (!flags.inclFeatures) p.push('pokeSym_my', 'pokeSym_partner', 'pokeSym_my_custom', 'pokeSym_partner_custom', 'headerAlwaysClear', 'keepaliveAudioEnabled', 'immersive_mode');
        if (!flags.inclCoreExtra) p.push('kaomojiGroups', 'kaomojiLibrary', 'customVoices', 'customVoiceGroups', 'customStickerGroups', 'transferData', 'myPokes', 'lastSessionId', 'sessionList', 'disabledStickerItems', 'disabledReplyItems', 'exportReminderLastShown', 'notifEnabled');
        if (!flags.inclOnboarding) p.push('tiSettings_showAvatar', 'tiSettings_customText', 'splashPledgeSigned_v3', 'tour_seen');
        return p;
    }

    /**
     * 将 moments_data 中的 __IDB_IMG__ 和 __IDB__ 引用从 IndexedDB 展开为实际 base64 数据
     * 这样备份文件包含完整的图片/视频数据，恢复后不依赖 IndexedDB
     */
    async function inlineMomentsIdbRefs(momentsJsonStr) {
        var parsed = JSON.parse(momentsJsonStr);
        if (!Array.isArray(parsed)) return momentsJsonStr;
        // 尝试打开 MomentsVideoDB
        var db = null;
        try {
            db = await new Promise(function(resolve, reject) {
                var req = indexedDB.open('MomentsVideoDB', 2);
                req.onsuccess = function() { resolve(req.result); };
                req.onerror = function() { resolve(null); };
                req.onupgradeneeded = function(e) {
                    var d = e.target.result;
                    if (!d.objectStoreNames.contains('videos')) d.createObjectStore('videos');
                    if (!d.objectStoreNames.contains('images')) d.createObjectStore('images');
                };
            });
        } catch (e) { db = null; }
        if (!db) return momentsJsonStr; // IDB 不可用，原样返回

        function getFromStore(storeName, key) {
            return new Promise(function(resolve) {
                try {
                    var tx = db.transaction(storeName, 'readonly');
                    var req = tx.objectStore(storeName).get(key);
                    req.onsuccess = function() { resolve(req.result || null); };
                    req.onerror = function() { resolve(null); };
                } catch (e) { resolve(null); }
            });
        }

        for (var mi = 0; mi < parsed.length; mi++) {
            var m = parsed[mi];
            // 展开图片引用
            if (m.images && Array.isArray(m.images)) {
                for (var ii = 0; ii < m.images.length; ii++) {
                    var img = m.images[ii];
                    if (typeof img === 'string' && img.startsWith('__IDB_IMG__')) {
                        var imgKey = img.replace('__IDB_IMG__', 'img_');
                        var data = await getFromStore('images', imgKey);
                        if (data) {
                            m.images[ii] = data;
                        } else {
                            m.images[ii] = '';
                        }
                    }
                }
            }
            // 展开视频引用
            if (m.video && m.video.url && typeof m.video.url === 'string' && m.video.url.startsWith('__IDB__')) {
                var vidId = parseInt(m.video.url.replace('__IDB__', ''));
                if (!isNaN(vidId)) {
                    var vidData = await getFromStore('videos', 'vid_' + vidId);
                    if (vidData) {
                        m.video.url = vidData;
                    } else {
                        m.video.url = '';
                    }
                }
            }
        }
        try { db.close(); } catch (e) {}
        return JSON.stringify(parsed);
    }

    /**
     * localStorage 容量不足时，将 moments_data 中的大图片/视频移入 IndexedDB 后再保存
     */
    async function saveMomentsDataWithIdbFallback(momentsJsonStr) {
        var IDB_THRESHOLD = 50000; // 与 moments.js 中的阈值一致
        var parsed = JSON.parse(momentsJsonStr);
        if (!Array.isArray(parsed)) {
            localStorage.setItem('moments_data', momentsJsonStr);
            return;
        }
        var db = null;
        try {
            db = await new Promise(function(resolve, reject) {
                var req = indexedDB.open('MomentsVideoDB', 2);
                req.onsuccess = function() { resolve(req.result); };
                req.onerror = function() { resolve(null); };
                req.onupgradeneeded = function(e) {
                    var d = e.target.result;
                    if (!d.objectStoreNames.contains('videos')) d.createObjectStore('videos');
                    if (!d.objectStoreNames.contains('images')) d.createObjectStore('images');
                };
            });
        } catch (e) { db = null; }
        if (!db) {
            localStorage.setItem('moments_data', momentsJsonStr);
            return;
        }
        function putToStore(storeName, key, value) {
            return new Promise(function(resolve) {
                try {
                    var tx = db.transaction(storeName, 'readwrite');
                    var req = tx.objectStore(storeName).put(value, key);
                    req.onsuccess = function() { resolve(); };
                    req.onerror = function() { resolve(); };
                } catch (e) { resolve(); }
            });
        }
        for (var mi = 0; mi < parsed.length; mi++) {
            var m = parsed[mi];
            if (m.images && Array.isArray(m.images)) {
                for (var ii = 0; ii < m.images.length; ii++) {
                    var img = m.images[ii];
                    if (typeof img === 'string' && img.length > IDB_THRESHOLD) {
                        await putToStore('images', 'img_' + m.id + '_' + ii, img);
                        m.images[ii] = '__IDB_IMG__' + m.id + '_' + ii;
                    }
                }
            }
            if (m.video && m.video.url && typeof m.video.url === 'string' && m.video.url.length > 1000) {
                await putToStore('videos', 'vid_' + m.id, m.video.url);
                m.video = Object.assign({}, m.video, { url: '__IDB__' + m.id });
            }
        }
        try { db.close(); } catch (e) {}
        localStorage.setItem('moments_data', JSON.stringify(parsed));
    }

    function shouldSkipKeyGroupChat(key, flags) {
        if (!key) return true;
        if (key.indexOf('dg_header_bg') !== -1 || key.indexOf('dg_overlay_bg') !== -1) return true;
        var patterns = buildModuleSkipPatterns(flags || {});
        return patterns.some(function (p) { return key.indexOf(p) !== -1; });
    }

    /**
     * 从当前环境收集备份数据并打包为 v4（紧凑 JSON + mediaStore）
     */
    /**
         * 从 ShopDB IndexedDB 读取所有数据
         */
        function readAllFromShopDB() {
            return new Promise(function(resolve) {
                try {
                    var req = indexedDB.open('ShopDB', 2);
                    req.onerror = function() { resolve({}); };
                    req.onsuccess = function(e) {
                        var db = e.target.result;
                        var result = {};
                        var stores = ['products', 'images'];
                        var pending = stores.length;
                        if (pending === 0) { resolve(result); return; }
                        stores.forEach(function(storeName) {
                            try {
                                var tx = db.transaction(storeName, 'readonly');
                                var store = tx.objectStore(storeName);
                                var getAll = store.getAll();
                                getAll.onsuccess = function() {
                                    var items = getAll.result || [];
                                    var obj = {};
                                    items.forEach(function(item) {
                                        // ShopDB products store 用 keyPath: 'key'
                                        if (item.key !== undefined) {
                                            obj[item.key] = item.value;
                                        } else if (item.productId !== undefined) {
                                            // images store 用 keyPath: 'productId'
                                            obj[item.productId] = item;
                                        }
                                    });
                                    result[storeName] = obj;
                                    if (--pending === 0) resolve(result);
                                };
                                getAll.onerror = function() {
                                    result[storeName] = {};
                                    if (--pending === 0) resolve(result);
                                };
                            } catch (ex) {
                                result[storeName] = {};
                                if (--pending === 0) resolve(result);
                            }
                        });
                    };
                } catch (ex) { resolve({}); }
            });
        }

        /**
         * 将数据写入 ShopDB IndexedDB
         */
        function writeAllToShopDB(shopDBData) {
            return new Promise(function(resolve) {
                if (!shopDBData || typeof shopDBData !== 'object') { resolve(); return; }
                try {
                    var req = indexedDB.open('ShopDB', 2);
                    req.onerror = function() { resolve(); };
                    req.onupgradeneeded = function(e) {
                        var db = e.target.result;
                        if (!db.objectStoreNames.contains('products')) {
                            db.createObjectStore('products', { keyPath: 'key' });
                        }
                        if (!db.objectStoreNames.contains('images')) {
                            db.createObjectStore('images', { keyPath: 'productId' });
                        }
                    };
                    req.onsuccess = function(e) {
                        var db = e.target.result;
                        var storeNames = Object.keys(shopDBData);
                        var pending = storeNames.length;
                        if (pending === 0) { resolve(); return; }
                        storeNames.forEach(function(storeName) {
                            try {
                                var tx = db.transaction(storeName, 'readwrite');
                                var store = tx.objectStore(storeName);
                                var data = shopDBData[storeName];
                                var keys = Object.keys(data);
                                var done = 0;
                                if (keys.length === 0) {
                                    if (--pending === 0) resolve();
                                    return;
                                }
                                keys.forEach(function(k) {
                                    var val = data[k];
                                    var putReq;
                                    if (storeName === 'images') {
                                        // images store 用 keyPath: 'productId'
                                        putReq = store.put(val);
                                    } else {
                                        // products store 用 keyPath: 'key'
                                        putReq = store.put({ key: k, value: val });
                                    }
                                    putReq.onsuccess = function() {
                                        if (++done === keys.length && --pending === 0) resolve();
                                    };
                                    putReq.onerror = function() {
                                        if (++done === keys.length && --pending === 0) resolve();
                                    };
                                });
                            } catch (ex) {
                                if (--pending === 0) resolve();
                            }
                        });
                    };
                } catch (ex) { resolve(); }
            });
        }

        async function buildBackupPayload(flags) {
        flags = flags || {
            inclMsgs: true, inclSet: true, inclCustom: true,
            inclThemes: true, inclDg: true, inclStickers: false,
            inclHome: true,
            inclMoyu: true, inclShop: true, inclMoments: true,
            inclMap: true, inclTaPhone: true, inclPet: true,
            inclDiary: true, inclAccounting: true, inclEnvelope: true,
            inclMood: true, inclTarot: true, inclCall: true,
            inclGroupChat: true, inclSpark: true, inclFeatures: true,
            inclCoreExtra: true, inclOnboarding: true
        };
        var lfData = {};
        var keys = await localforage.keys();
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (shouldSkipKeyGroupChat(key, flags)) continue;
            try {
                var rawVal = await localforage.getItem(key);
                if (rawVal === null || rawVal === undefined) continue;
                lfData[key] = deepCloneJsonSafe(rawVal);
            } catch (e) { console.warn('[backup] 读取失败', key, e); }
        }
        var lsData = {};
        for (var j = 0; j < localStorage.length; j++) {
            var lk = localStorage.key(j);
            if (!lk || shouldSkipKeyGroupChat(lk, flags)) continue;
            try {
                lsData[lk] = localStorage.getItem(lk);
            } catch (e2) {}
        }
        // 朋友圈 moments_data 中的 __IDB_IMG__ / __IDB__ 引用需要从 IndexedDB 展开为实际数据
        if (flags.inclMoments && lsData['moments_data']) {
            try {
                lsData['moments_data'] = await inlineMomentsIdbRefs(lsData['moments_data']);
            } catch (e3) { console.warn('[backup] 朋友圈 IDB 引用展开失败', e3); }
        }
        // 诊断日志：检查 diary / accounting 数据
        var diaryKeys = Object.keys(lfData).filter(function(k) { return k.indexOf('diary') !== -1; });
        var accountingKeys = Object.keys(lfData).filter(function(k) { return k.indexOf('accounting') !== -1; });
        console.log('[backup] buildBackupPayload diary keys:', diaryKeys.length, diaryKeys);
        console.log('[backup] buildBackupPayload accounting keys:', accountingKeys.length, accountingKeys);
        // 收集 ShopDB 数据（商城商品、购物车、订单等）
        var shopDBData = {};
        if (flags.inclShop) {
            try {
                shopDBData = await readAllFromShopDB();
            } catch (e4) { console.warn('[backup] ShopDB 读取失败', e4); }
        }
        var state = { store: {}, map: new Map(), n: 0 };
        var lfOut = {};
        for (var k in lfData) {
            if (!Object.prototype.hasOwnProperty.call(lfData, k)) continue;
            lfOut[k] = extractMediaTree(lfData[k], state);
        }
        var lsOut = {};
        for (var k2 in lsData) {
            if (!Object.prototype.hasOwnProperty.call(lsData, k2)) continue;
            lsOut[k2] = processLocalStorageValueForExport(lsData[k2], state);
        }
        // ShopDB 数据也需要提取媒体引用
        var shopDBOut = {};
        for (var sk in shopDBData) {
            if (!Object.prototype.hasOwnProperty.call(shopDBData, sk)) continue;
            shopDBOut[sk] = extractMediaTree(shopDBData[sk], state);
        }
        return {
            type: 'chatapp-backup-v4',
            formatVersion: 4,
            appName: 'ChatApp',
            timestamp: new Date().toISOString(),
            sessionId: typeof SESSION_ID !== 'undefined' ? SESSION_ID : null,
            appPrefix: typeof APP_PREFIX !== 'undefined' ? APP_PREFIX : 'CHAT_APP_V3_',
            modules: flags,
            mediaStore: state.store,
            localforage: lfOut,
            localStorage: lsOut,
            shopDB: shopDBOut
        };
    }

    function serializeBackupV4(payload) {
        var bom = '\uFEFF';
        return bom + JSON.stringify(payload);
    }

    function downloadBlob(blob, fileName) {
        if (typeof downloadFileFallback === 'function') {
            downloadFileFallback(blob, fileName);
            return;
        }
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    }

    /**
     * 从 ZIP 解析备份（v5）；若包内为旧版单 JSON（仅改扩展名等）则按其中 JSON 原样返回。
     */
    async function parseZipBackup(arrayBuffer) {
        if (typeof JSZip === 'undefined') throw new Error('JSZip 未加载，无法读取 ZIP 备份，请检查网络后刷新页面');
        var zip = await JSZip.loadAsync(arrayBuffer);
        var jsonFile = zip.file('backup.json');
        if (!jsonFile) {
            var names = Object.keys(zip.files).filter(function (n) {
                var e = zip.files[n];
                return e && !e.dir && /\.json$/i.test(n);
            });
            if (names.length === 1) jsonFile = zip.file(names[0]);
        }
        if (!jsonFile) throw new Error('ZIP 内未找到 backup.json');
        var raw = await jsonFile.async('string');
        if (raw.length && raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
        var data = JSON.parse(raw);
        var idx = data.mediaIndex;
        if (data.formatVersion === 5 && data.type === 'chatapp-backup-v5' && idx && typeof idx === 'object') {
            var built = {};
            var ids = Object.keys(idx);
            for (var i = 0; i < ids.length; i++) {
                var id = ids[i];
                var meta = idx[id];
                var path = (meta && meta.path) ? meta.path : ('media/' + id);
                var zf = zip.file(path);
                if (!zf) {
                    console.warn('[backup] ZIP 缺少媒体文件', path);
                    continue;
                }
                var mimeMeta = (meta && meta.mime) ? meta.mime : 'application/octet-stream';
                if (mimeMeta === 'text/plain+dataurl') {
                    built[id] = await zf.async('string');
                } else {
                    var ab = await zf.async('arraybuffer');
                    built[id] = binaryToDataUrl(mimeMeta, new Uint8Array(ab));
                }
            }
            var ms = data.mediaStore || {};
            for (var k in ms) {
                if (Object.prototype.hasOwnProperty.call(ms, k) && built[k] == null) built[k] = ms[k];
            }
            data.mediaStore = built;
        }
        return data;
    }

    async function loadBackupFromArrayBuffer(ab) {
        if (isZipArrayBuffer(ab)) return await parseZipBackup(ab);
        var text = new TextDecoder('utf-8', { fatal: false }).decode(ab);
        if (text.length && text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
        return JSON.parse(text);
    }

    async function loadBackupFromFile(file) {
        var ab = await file.arrayBuffer();
        return await loadBackupFromArrayBuffer(ab);
    }

    async function exportBackupToFile(flags) {
        if (typeof showNotification === 'function') showNotification('正在打包备份（ZIP：结构与媒体分离）…', 'info', 4000);
        var payload = await buildBackupPayload(flags);
        var dateStr = new Date().toISOString().slice(0, 10);
        var fileNameZip = 'chatapp-backup-' + dateStr + '.zip';

        if (typeof JSZip !== 'undefined') {
            try {
                var zip = new JSZip();
                var store = payload.mediaStore || {};
                var mediaIndex = {};
                for (var sid in store) {
                    if (!Object.prototype.hasOwnProperty.call(store, sid)) continue;
                    var url = store[sid];
                    var parts = dataUrlToBinary(url);
                    var path = 'media/' + sid;
                    if (parts && parts.bytes && parts.bytes.length) {
                        zip.file(path, parts.bytes, { binary: true });
                        mediaIndex[sid] = { path: path, mime: parts.mime };
                    } else {
                        var txtPath = path + '.txt';
                        zip.file(txtPath, String(url));
                        mediaIndex[sid] = { path: txtPath, mime: 'text/plain+dataurl' };
                    }
                }
                var jsonBody = {
                    type: 'chatapp-backup-v5',
                    formatVersion: 5,
                    appName: payload.appName || 'ChatApp',
                    timestamp: payload.timestamp,
                    sessionId: payload.sessionId,
                    appPrefix: payload.appPrefix,
                    modules: payload.modules,
                    localforage: payload.localforage,
                    localStorage: payload.localStorage,
                    shopDB: payload.shopDB,
                    mediaIndex: mediaIndex
                };
                zip.file('backup.json', '\uFEFF' + JSON.stringify(jsonBody));
                var zipBlob = await zip.generateAsync({
                    type: 'blob',
                    compression: 'DEFLATE',
                    compressionOptions: { level: 6 }
                });
                if (navigator.share && /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)) {
                    try {
                        var shareFile = new File([zipBlob], fileNameZip, { type: 'application/zip' });
                        if (navigator.canShare && navigator.canShare({ files: [shareFile] })) {
                            await navigator.share({
                                files: [shareFile],
                                title: '传讯全量备份',
                                text: 'ZIP 备份：' + new Date().toLocaleDateString()
                            });
                            if (typeof showNotification === 'function') showNotification('备份导出成功', 'success');
                            return;
                        }
                    } catch (e) { /* fall through */ }
                }
                downloadBlob(zipBlob, fileNameZip);
                if (typeof showNotification === 'function') {
                    showNotification('已导出 ZIP：主 JSON 不含大图，导入更不易失败', 'success', 3500);
                }
                return;
            } catch (zipErr) {
                console.error('[backup] ZIP 导出失败，回退单文件 JSON', zipErr);
                if (typeof showNotification === 'function') {
                    showNotification('ZIP 打包失败，已改为单文件 JSON（大备份可能较难解析）', 'warning', 4500);
                }
            }
        } else if (typeof showNotification === 'function') {
            showNotification('JSZip 未加载，将导出单文件 JSON', 'warning', 3000);
        }

        var str = serializeBackupV4(payload);
        var blob = new Blob([str], { type: 'application/json;charset=utf-8' });
        var fileName = 'chatapp-backup-' + dateStr + '.json';
        if (navigator.share && /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)) {
            try {
                var f = new File([blob], fileName, { type: 'application/json' });
                if (navigator.canShare && navigator.canShare({ files: [f] })) {
                    await navigator.share({ files: [f], title: '传讯全量备份', text: '备份日期：' + new Date().toLocaleDateString() });
                    if (typeof showNotification === 'function') showNotification('备份导出成功', 'success');
                    return;
                }
            } catch (e2) { /* fall through */ }
        }
        downloadBlob(blob, fileName);
        if (typeof showNotification === 'function') showNotification('备份导出成功（JSON）', 'success');
    }

    function getLfSource(data) {
        if (!data || typeof data !== 'object') return {};
        var a = data.indexedDB || {};
        var b = data.localforage || {};
        var out = {};
        for (var k in a) {
            if (Object.prototype.hasOwnProperty.call(a, k)) out[k] = a[k];
        }
        for (var k2 in b) {
            if (Object.prototype.hasOwnProperty.call(b, k2)) out[k2] = b[k2];
        }
        return out;
    }

    function matchAnyNeedles(key, needles) {
        if (!key || !needles || !needles.length) return false;
        for (var i = 0; i < needles.length; i++) {
            if (key.indexOf(needles[i]) !== -1) return true;
        }
        return false;
    }

    function matchLsKey(key, cat) {
        if (!cat) return false;
        if (cat.localStorageNeedles && matchAnyNeedles(key, cat.localStorageNeedles)) return true;
        if (cat.localStoragePrefixes && cat.localStoragePrefixes.some(function (p) { return key.indexOf(p) === 0; })) return true;
        return false;
    }

    function filterLfByCategories(lf, selectedIds, categories) {
        if (!selectedIds || !selectedIds.length) return {};
        var selected = categories.filter(function (c) { return selectedIds.indexOf(c.id) !== -1; });
        var out = {};
        for (var k in lf) {
            if (!Object.prototype.hasOwnProperty.call(lf, k)) continue;
            var ok = selected.some(function (c) { return matchAnyNeedles(k, c.indexedDBNeedles); });
            if (ok) out[k] = lf[k];
        }
        return out;
    }

    function filterLsByCategories(ls, selectedIds, categories) {
        if (!selectedIds || !selectedIds.length) return {};
        var selected = categories.filter(function (c) { return selectedIds.indexOf(c.id) !== -1; });
        var out = {};
        for (var k in ls) {
            if (!Object.prototype.hasOwnProperty.call(ls, k)) continue;
            var ok = selected.some(function (c) { return matchLsKey(k, c); });
            if (ok) out[k] = ls[k];
        }
        return out;
    }

    /**
     * 将备份写入存储（已解析的对象）
     * @param {object} data 原始备份 JSON
     * @param {{ selective?: boolean, selectedCategoryIds?: string[], categories?: array }} opt
     */
    async function applyBackupToStorage(data, opt) {
        opt = opt || {};
        var selective = !!opt.selective;
        var mediaStore = data.mediaStore || {};
        var lfRaw = getLfSource(data);
        var lsRaw = data.localStorage || {};

        console.log('[backup] 恢复开始, selective:', selective, 'lsKeys:', Object.keys(lsRaw).length, 'lfKeys:', Object.keys(lfRaw).length, 'shopDBKeys:', data.shopDB ? Object.keys(data.shopDB).length : 0, 'mediaStoreKeys:', Object.keys(mediaStore).length);

        if (selective && opt.selectedCategoryIds && opt.categories) {
            lfRaw = filterLfByCategories(lfRaw, opt.selectedCategoryIds, opt.categories);
            lsRaw = filterLsByCategories(lsRaw, opt.selectedCategoryIds, opt.categories);
            console.log('[backup] 过滤后 lsKeys:', Object.keys(lsRaw).length, 'lfKeys:', Object.keys(lfRaw).length, 'selectedIds:', opt.selectedCategoryIds);
        }

        var lfKeys = Object.keys(lfRaw);
        var backupSid = data.sessionId || inferBackupSessionId(lfKeys, data.appPrefix);
        var curSid = typeof SESSION_ID !== 'undefined' ? SESSION_ID : null;
        var appPfx = data.appPrefix || (typeof APP_PREFIX !== 'undefined' ? APP_PREFIX : 'CHAT_APP_V3_');
        var needRemap = backupSid && curSid && backupSid !== curSid;

        // 诊断日志：检查恢复的 diary / accounting 数据
        var diaryRestoreKeys = lfKeys.filter(function(k) { return k.indexOf('diary') !== -1; });
        var accountingRestoreKeys = lfKeys.filter(function(k) { return k.indexOf('accounting') !== -1; });
        console.log('[backup] 恢复 diary keys:', diaryRestoreKeys.length, diaryRestoreKeys);
        console.log('[backup] 恢复 accounting keys:', accountingRestoreKeys.length, accountingRestoreKeys);

        for (var i = 0; i < lfKeys.length; i++) {
            var lk = lfKeys[i];
            var targetKey = needRemap ? remapLfKey(lk, backupSid, curSid, appPfx) : lk;
            var val = inlineMediaTree(lfRaw[lk], mediaStore);
            try {
                await localforage.setItem(targetKey, val);
                if (lk.indexOf('diary') !== -1 || lk.indexOf('accounting') !== -1) {
                    console.log('[backup] 已恢复 localforage:', targetKey, '类型:', Array.isArray(val) ? 'array' : typeof val);
                }
            } catch (e) {
                console.warn('[backup] 写入失败', targetKey, e);
            }
        }

        for (var k in lsRaw) {
            if (!Object.prototype.hasOwnProperty.call(lsRaw, k)) continue;
            var targetLsKey = needRemap ? remapLfKey(k, backupSid, curSid, appPfx) : k;
            try {
                var rawVal = lsRaw[k];
                var lsv;
                // 对 moments_data 直接处理 __mRef，避免 JSON.parse/stringify 循环导致的问题
                if (targetLsKey === 'moments_data' || targetLsKey.indexOf('moments_data') !== -1) {
                    lsv = inlineMediaRefsInJson(rawVal, mediaStore);
                } else {
                    lsv = processLocalStorageValueForImport(rawVal, mediaStore);
                }
                // 检查是否还有未解析的 __mRef（mediaStore 缺失）
                if (typeof lsv === 'string' && lsv.indexOf('__mRef') !== -1) {
                    console.error('[backup] 恢复后仍包含未解析的 __mRef:', targetLsKey);
                }
                localStorage.setItem(targetLsKey, lsv);
                if (targetLsKey.indexOf('moments_') !== -1 || targetLsKey.indexOf('shop_') !== -1 || targetLsKey === 'home_avatar_me' || targetLsKey === 'profile_me') {
                    console.log('[backup] 已恢复 localStorage:', targetLsKey, '长度:', typeof lsv === 'string' ? lsv.length : 'non-string');
                }
            } catch (e2) {
                // moments_data 可能因为包含大图片导致 localStorage 容量不足
                // 尝试将大图片移入 IndexedDB 后再保存
                if (targetLsKey === 'moments_data' || targetLsKey.indexOf('moments_data') !== -1) {
                    try {
                        var fallbackVal = lsRaw[k];
                        if (typeof fallbackVal === 'string' && fallbackVal.indexOf('__mRef') !== -1) {
                            fallbackVal = inlineMediaRefsInJson(fallbackVal, mediaStore);
                        }
                        await saveMomentsDataWithIdbFallback(fallbackVal);
                        console.log('[backup] moments_data 已通过 IDB 降级保存');
                    } catch (e3) {
                        console.warn('[backup] moments_data 恢复失败（含 IDB 降级）', e3);
                    }
                } else {
                    console.warn('[backup] localStorage 恢复失败', targetLsKey, e2);
                }
            }
        }

        // 修复 sessionList 中的会话 ID：键已被 remap，但值里的 id 字段还是旧 sessionId
        if (needRemap) {
            try {
                var slKey = appPfx + 'sessionList';
                var sl = await localforage.getItem(slKey);
                if (Array.isArray(sl)) {
                    var remappedSl = sl.map(function(s) {
                        if (s && s.id === backupSid) {
                            var copy = {};
                            for (var p in s) { if (Object.prototype.hasOwnProperty.call(s, p)) copy[p] = s[p]; }
                            copy.id = curSid;
                            return copy;
                        }
                        return s;
                    });
                    await localforage.setItem(slKey, remappedSl);
                }
            } catch (e4) {}
        }

        if (typeof APP_PREFIX !== 'undefined' && typeof SESSION_ID !== 'undefined') {
            try { await localforage.setItem(APP_PREFIX + 'lastSessionId', SESSION_ID); } catch (e3) {}
        }

        // 恢复 ShopDB 数据（商城商品、购物车、订单等）
        var shopDBData = data.shopDB || {};
        if (Object.keys(shopDBData).length > 0) {
            // selective 模式下，只在选择了"商城"分类时恢复
            var shouldRestoreShop = !selective || (opt.selectedCategoryIds && opt.selectedCategoryIds.indexOf('shop') !== -1);
            if (shouldRestoreShop) {
                try {
                    // 先还原 __mRef 引用
                    for (var storeName in shopDBData) {
                        if (!Object.prototype.hasOwnProperty.call(shopDBData, storeName)) continue;
                        shopDBData[storeName] = inlineMediaTree(shopDBData[storeName], mediaStore);
                    }
                    await writeAllToShopDB(shopDBData);
                    console.log('[backup] ShopDB 恢复成功');
                } catch (e5) {
                    console.warn('[backup] ShopDB 恢复失败', e5);
                }
            }
        }
    }

    function isFullBackupShape(d) {
        if (!d || typeof d !== 'object') return false;
        if (d.formatVersion === 5 && d.type === 'chatapp-backup-v5') return true;
        if (d.formatVersion === 4 && d.type === 'chatapp-backup-v4') return true;
        if (d.type === 'full' || (typeof d.type === 'string' && d.type.indexOf('full-backup') !== -1)) return true;
        if (d.indexedDB && typeof d.indexedDB === 'object') return true;
        if (d.localforage && typeof d.localforage === 'object') return true;
        return false;
    }

    global.ChatBackup = {
        MIN_MEDIA_CHARS: MIN_MEDIA_CHARS,
        extractMediaTree: extractMediaTree,
        inlineMediaTree: inlineMediaTree,
        buildBackupPayload: buildBackupPayload,
        exportBackupToFile: exportBackupToFile,
        loadBackupFromFile: loadBackupFromFile,
        loadBackupFromArrayBuffer: loadBackupFromArrayBuffer,
        applyBackupToStorage: applyBackupToStorage,
        serializeBackupV4: serializeBackupV4,
        getLfSource: getLfSource,
        isFullBackupShape: isFullBackupShape,
        shouldSkipKeyGroupChat: shouldSkipKeyGroupChat,
        buildModuleSkipPatterns: buildModuleSkipPatterns
    };
})(typeof window !== 'undefined' ? window : this);
