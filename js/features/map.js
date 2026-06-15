/**
 * map.js - Zmilk地图模块
 * 像素/卡通风格地图，支持位置标记、子地图、路线绘制、地形编辑
 * 依赖：localforage, APP_PREFIX, SESSION_ID, getStorageKey, showNotification
 */

(function () {
    'use strict';

    // ==================== 常量与配置 ====================
    var MAP_STORAGE_KEY = 'mapData';
    var MAP_DATA_VERSION = 2; // 数据版本号，变更默认数据时递增
    var CANVAS_BG = '#f0ebe3';
    var GRID_SIZE = 20;
    var PIXEL_SIZE = 10;
    var MARKER_SIZE = 32;
    var AVATAR_RADIUS = 18;
    var BOUNCE_AMPLITUDE = 4;
    var BOUNCE_SPEED = 0.003;
    var SCALE_AMPLITUDE = 0.08;
    var SCALE_SPEED = 0.002;

    // 地形类型颜色（像素风格 - 与 preview 一致）
    var TERRAIN_COLORS = {
        grass: { base: '#d4e6c3', color: '#d4e6c3' },
        water: { base: '#b8d4e3', color: '#b8d4e3' },
        sand: { base: '#e8e0d4', color: '#e8e0d4' },
        building: { base: '#d4c8b0', color: '#d4c8b0' }
    };

    // 路线颜色（与 preview 一致，棕色为主）
    var ROUTE_COLORS = ['#c4a882', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];

    // 地点分类（与 preview 一致，默认蓝色）
    var LOCATION_CATEGORIES = [
        { id: 'home', name: '家', icon: 'fa-home', color: '#7FA6CD' },
        { id: 'work', name: '工作', icon: 'fa-briefcase', color: '#7FA6CD' },
        { id: 'food', name: '美食', icon: 'fa-utensils', color: '#7FA6CD' },
        { id: 'fun', name: '娱乐', icon: 'fa-gamepad', color: '#7FA6CD' },
        { id: 'shop', name: '购物', icon: 'fa-shopping-bag', color: '#7FA6CD' },
        { id: 'nature', name: '自然', icon: 'fa-tree', color: '#7FA6CD' },
        { id: 'other', name: '其他', icon: 'fa-map-pin', color: '#7FA6CD' }
    ];

    // ==================== 状态变量 ====================
    var overlay = null;
    var canvas = null;
    var ctx = null;
    var animFrameId = null;
    var isVisible = false;

    // 地图导航栈
    var mapStack = ['root'];

    // 地图数据（按mapKey存储）
    var allMapData = {};

    // 当前地图数据引用
    function currentMapKey() {
        return mapStack[mapStack.length - 1];
    }

    function currentData() {
        var key = currentMapKey();
        if (!allMapData[key] || !allMapData[key].locations || allMapData[key].locations.length === 0) {
            allMapData[key] = createDefaultMapData(key);
        }
        var data = allMapData[key];
        // 同步 myPosition 与 locations 中 type: 'me' 的项
        if (!data.myPosition) {
            var meLoc = null;
            if (data.locations) {
                for (var i = 0; i < data.locations.length; i++) {
                    if (data.locations[i].type === 'me') {
                        meLoc = data.locations[i];
                        break;
                    }
                }
            }
            if (meLoc) {
                data.myPosition = { x: meLoc.x, y: meLoc.y };
            }
        }
        return data;
    }

    // 更新我的位置，同步 myPosition 和 locations 中 type: 'me' 的项
    function updateMyPosition(data, x, y) {
        data.myPosition = { x: Math.round(x), y: Math.round(y) };
        if (data.locations) {
            var found = false;
            for (var i = 0; i < data.locations.length; i++) {
                if (data.locations[i].type === 'me') {
                    data.locations[i].x = data.myPosition.x;
                    data.locations[i].y = data.myPosition.y;
                    found = true;
                    break;
                }
            }
            // 如果当前地图没有"我的位置"，自动添加
            if (!found) {
                data.locations.unshift({
                    id: 'me',
                    x: data.myPosition.x,
                    y: data.myPosition.y,
                    name: '我的位置',
                    type: 'me',
                    icon: 'fa-location-dot',
                    color: '#7BC8A4',
                    hasSubmap: false
                });
            }
        }
    }

    function createDefaultMapData(key) {
        // 与 map-preview.html 的默认数据完全一致
        console.log('[MapApp] createDefaultMapData called for key=' + key);
        var defaults = {
            root: {
                key: 'root',
                locations: [
                    { id: 'me', x: 200, y: 180, name: '我的位置', type: 'me', icon: 'fa-location-dot', color: '#7BC8A4', hasSubmap: false },
                    { id: 'ta', x: 340, y: 120, name: 'TA的位置', type: 'ta', icon: 'fa-heart', color: '#c5a47e', hasSubmap: false },
                    { id: 'work', x: 130, y: 320, name: '工作地点', type: 'work', icon: 'fa-briefcase', color: '#7BC8A4', hasSubmap: false },
                    { id: 'home', x: 280, y: 280, name: '我们的家', type: 'place', icon: 'fa-house', color: '#7FA6CD', hasSubmap: true, submapId: 'loc_home' },
                    { id: 'park', x: 420, y: 250, name: '城市公园', type: 'place', icon: 'fa-tree', color: '#7FA6CD', hasSubmap: false },
                    { id: 'cafe', x: 160, y: 130, name: '那家咖啡馆', type: 'place', icon: 'fa-mug-hot', color: '#7FA6CD', hasSubmap: false }
                ],
                routes: [
                    { type: 'manual', points: [{x:200,y:180},{x:160,y:130},{x:130,y:320},{x:280,y:280},{x:340,y:120}], color: '#BB9EC7', dash: true },
                    { type: 'auto', points: [{x:200,y:180},{x:160,y:130},{x:130,y:320},{x:280,y:280},{x:420,y:250},{x:340,y:120}], color: '#c5a47e', dash: false }
                ],
                submaps: [
                    { id: 'campus', x: 80, y: 60, w: 120, h: 100, name: '校园', color: 'rgba(123,200,164,0.2)', borderColor: '#7BC8A4' },
                    { id: 'mall', x: 380, y: 320, w: 110, h: 90, name: '商场', color: 'rgba(187,158,199,0.2)', borderColor: '#BB9EC7' }
                ],
                terrain: [
                    { x: 0, y: 0, w: 550, h: 100, color: '#d4e6c3' },
                    { x: 0, y: 350, w: 550, h: 150, color: '#c8dcc0' },
                    { x: 0, y: 100, w: 550, h: 250, color: '#e8e0d4' },
                    { x: 450, y: 200, w: 100, h: 80, color: '#b8d4e3' },
                    { x: 30, y: 200, w: 60, h: 60, color: '#a8c8a0' },
                    { x: 480, y: 100, w: 70, h: 50, color: '#a8c8a0' }
                ],
                roads: [
                    { x1: 130, y1: 130, x2: 420, y2: 130, w: 8 },
                    { x1: 280, y1: 80, x2: 280, y2: 350, w: 8 },
                    { x1: 130, y1: 320, x2: 420, y2: 320, w: 8 }
                ],
                sharingEnabled: false,
                privacyShowMe: true,
                privacyShowTa: true,
                privacyShowRoutes: true
            },
            campus: {
                key: 'campus',
                locations: [
                    { id: 'lib', x: 150, y: 150, name: '图书馆', type: 'place', icon: 'fa-book', color: '#7FA6CD', hasSubmap: false },
                    { id: 'canteen', x: 350, y: 150, name: '食堂', type: 'food', icon: 'fa-utensils', color: '#F4A6B3', hasSubmap: false },
                    { id: 'dorm', x: 250, y: 300, name: '宿舍楼', type: 'place', icon: 'fa-bed', color: '#BB9EC7', hasSubmap: false },
                    { id: 'playground', x: 400, y: 300, name: '操场', type: 'place', icon: 'fa-running', color: '#7BC8A4', hasSubmap: false }
                ],
                routes: [],
                submaps: [],
                terrain: [
                    { x: 0, y: 0, w: 550, h: 500, color: '#e8e0d4' },
                    { x: 100, y: 80, w: 80, h: 60, color: '#d4c8b0' },
                    { x: 300, y: 80, w: 80, h: 60, color: '#d4c8b0' },
                    { x: 200, y: 230, w: 80, h: 60, color: '#d4c8b0' },
                    { x: 350, y: 230, w: 80, h: 60, color: '#d4c8b0' },
                    { x: 50, y: 350, w: 120, h: 80, color: '#c8dcc0' }
                ],
                roads: [
                    { x1: 100, y1: 110, x2: 450, y2: 110, w: 6 },
                    { x1: 250, y1: 60, x2: 250, y2: 380, w: 6 },
                    { x1: 100, y1: 260, x2: 450, y2: 260, w: 6 }
                ],
                sharingEnabled: false,
                privacyShowMe: true,
                privacyShowTa: true,
                privacyShowRoutes: true
            },
            mall: {
                key: 'mall',
                locations: [
                    { id: 'cinema', x: 150, y: 150, name: '电影院', type: 'fun', icon: 'fa-film', color: '#BB9EC7', hasSubmap: false },
                    { id: 'shop1', x: 350, y: 130, name: '奶茶店', type: 'food', icon: 'fa-mug-hot', color: '#F4A6B3', hasSubmap: false },
                    { id: 'shop2', x: 250, y: 280, name: '书店', type: 'place', icon: 'fa-book', color: '#7FA6CD', hasSubmap: false },
                    { id: 'shop3', x: 400, y: 280, name: '游戏厅', type: 'fun', icon: 'fa-gamepad', color: '#c5a47e', hasSubmap: false }
                ],
                routes: [],
                submaps: [],
                terrain: [
                    { x: 0, y: 0, w: 550, h: 500, color: '#e8e0d4' },
                    { x: 100, y: 80, w: 80, h: 60, color: '#ddd0c0' },
                    { x: 300, y: 80, w: 80, h: 60, color: '#ddd0c0' },
                    { x: 200, y: 230, w: 80, h: 60, color: '#ddd0c0' },
                    { x: 350, y: 230, w: 80, h: 60, color: '#ddd0c0' }
                ],
                roads: [
                    { x1: 100, y1: 110, x2: 450, y2: 110, w: 6 },
                    { x1: 250, y1: 60, x2: 250, y2: 380, w: 6 },
                    { x1: 100, y1: 260, x2: 450, y2: 260, w: 6 }
                ],
                sharingEnabled: false,
                privacyShowMe: true,
                privacyShowTa: true,
                privacyShowRoutes: true
            },
            loc_home: {
                key: 'loc_home',
                locations: [
                    { id: 'livingroom', x: 150, y: 150, name: '客厅', type: 'place', icon: 'fa-couch', color: '#7FA6CD', hasSubmap: false },
                    { id: 'bedroom', x: 350, y: 150, name: '卧室', type: 'place', icon: 'fa-bed', color: '#BB9EC7', hasSubmap: false },
                    { id: 'kitchen', x: 150, y: 300, name: '厨房', type: 'food', icon: 'fa-utensils', color: '#F4A6B3', hasSubmap: false },
                    { id: 'balcony', x: 350, y: 300, name: '阳台', type: 'nature', icon: 'fa-sun', color: '#7BC8A4', hasSubmap: false }
                ],
                routes: [],
                submaps: [],
                terrain: [
                    { x: 0, y: 0, w: 550, h: 500, color: '#f0ebe3' },
                    { x: 80, y: 100, w: 120, h: 80, color: '#e0d8cc' },
                    { x: 280, y: 100, w: 120, h: 80, color: '#e0d8cc' },
                    { x: 80, y: 250, w: 120, h: 80, color: '#e0d8cc' },
                    { x: 280, y: 250, w: 120, h: 80, color: '#e0d8cc' }
                ],
                roads: [
                    { x1: 140, y1: 140, x2: 340, y2: 140, w: 5 },
                    { x1: 240, y1: 90, x2: 240, y2: 370, w: 5 },
                    { x1: 140, y1: 290, x2: 340, y2: 290, w: 5 }
                ],
                sharingEnabled: false,
                privacyShowMe: true,
                privacyShowTa: true,
                privacyShowRoutes: true
            }
        };
        return defaults[key] || {
            key: key,
            locations: [],
            routes: [],
            submaps: [],
            terrain: [],
            roads: [],
            sharingEnabled: false,
            privacyShowMe: true,
            privacyShowTa: true,
            privacyShowRoutes: true
        };
    }

    // 交互状态
    var isDraggingMyPos = false;
    var isDraggingTerrain = false;
    var terrainDragStart = null;
    var terrainDragCurrent = null;
    var activeTool = null; // 'mypos', 'addplace', 'addsubmap', 'drawroute', 'terrainedit'
    var currentTab = 'locations'; // 'locations', 'routes', 'footprints', 'privacy'
    var currentTerrainType = 'grass';
    var currentRoutePoints = [];
    var currentRouteColor = ROUTE_COLORS[0];

    // 地形编辑历史记录（撤销/重做）
    var terrainHistory = [];
    var terrainHistoryIndex = -1;
    var MAX_TERRAIN_HISTORY = 50;

    // 保存地形编辑历史
    function pushTerrainHistory() {
        var data = currentData();
        var snapshot = JSON.stringify(data.terrain || []);
        // 如果当前不是最后一条，删除后面的历史
        if (terrainHistoryIndex < terrainHistory.length - 1) {
            terrainHistory = terrainHistory.slice(0, terrainHistoryIndex + 1);
        }
        terrainHistory.push(snapshot);
        terrainHistoryIndex++;
        if (terrainHistory.length > MAX_TERRAIN_HISTORY) {
            terrainHistory.shift();
            terrainHistoryIndex--;
        }
        updateUndoRedoButtons();
    }

    // 撤销
    function undoTerrainEdit() {
        if (terrainHistoryIndex > 0) {
            terrainHistoryIndex--;
            var data = currentData();
            data.terrain = JSON.parse(terrainHistory[terrainHistoryIndex]);
            saveMapData();
            updateUndoRedoButtons();
            if (typeof showNotification === 'function') {
                showNotification('已撤销', 'info');
            }
        }
    }

    // 恢复
    function redoTerrainEdit() {
        if (terrainHistoryIndex < terrainHistory.length - 1) {
            terrainHistoryIndex++;
            var data = currentData();
            data.terrain = JSON.parse(terrainHistory[terrainHistoryIndex]);
            saveMapData();
            updateUndoRedoButtons();
            if (typeof showNotification === 'function') {
                showNotification('已恢复', 'info');
            }
        }
    }

    // 初始化地形历史（进入地形编辑时）
    function initTerrainHistory() {
        var data = currentData();
        terrainHistory = [JSON.stringify(data.terrain || [])];
        terrainHistoryIndex = 0;
        updateUndoRedoButtons();
    }

    // 更新撤销/重做按钮状态
    function updateUndoRedoButtons() {
        var undoBtn = document.getElementById('terrain-undo-btn');
        var redoBtn = document.getElementById('terrain-redo-btn');
        if (undoBtn) {
            undoBtn.style.opacity = terrainHistoryIndex > 0 ? '1' : '0.3';
            undoBtn.style.pointerEvents = terrainHistoryIndex > 0 ? 'auto' : 'none';
        }
        if (redoBtn) {
            redoBtn.style.opacity = terrainHistoryIndex < terrainHistory.length - 1 ? '1' : '0.3';
            redoBtn.style.pointerEvents = terrainHistoryIndex < terrainHistory.length - 1 ? 'auto' : 'none';
        }
    }

    // 头像图片缓存
    var _meAvatarImg = null;
    var _taAvatarImg = null;

    // 加载头像图片
    function loadAvatars() {
        try {
            var meUrl = null;
            var taUrl = null;

            // 我的头像：从 Home 页全局存储读取
            if (typeof window.homeGetGlobal === 'function') {
                meUrl = window.homeGetGlobal('home_avatar_me');
            }

            // TA/梦角头像：从 Home 页全局存储读取
            if (typeof window.homeGetGlobal === 'function') {
                taUrl = window.homeGetGlobal('home_avatar_partner');
            }

            if (meUrl && meUrl !== _meAvatarSrc) {
                _meAvatarSrc = meUrl;
                (function (url) {
                    var img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = function () { _meAvatarImg = img; };
                    img.src = url;
                })(meUrl);
            }
            if (taUrl && taUrl !== _taAvatarSrc) {
                _taAvatarSrc = taUrl;
                (function (url) {
                    var img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = function () { _taAvatarImg = img; };
                    img.src = url;
                })(taUrl);
            }
        } catch (e) {
            // 头像加载失败不影响地图功能
        }
    }
    var _meAvatarSrc = null;
    var _taAvatarSrc = null;

    // document 级别的拖拽事件处理（防止鼠标移出 canvas 后丢失事件）
    var _docMoveHandler = null;
    var _docUpHandler = null;

    function startDocumentDrag() {
        _docMoveHandler = function(e) { onCanvasMouseMove(e); };
        _docUpHandler = function(e) { onCanvasMouseUp(e); stopDocumentDrag(); };
        document.addEventListener('mousemove', _docMoveHandler);
        document.addEventListener('mouseup', _docUpHandler);
    }

    function stopDocumentDrag() {
        if (_docMoveHandler) { document.removeEventListener('mousemove', _docMoveHandler); _docMoveHandler = null; }
        if (_docUpHandler) { document.removeEventListener('mouseup', _docUpHandler); _docUpHandler = null; }
    }
    var searchQuery = '';
    var zoomLevel = 1;
    var panOffset = { x: 0, y: 0 };
    var isPanning = false;
    var panStart = { x: 0, y: 0 };
    var hoverInfo = '';
    var terrainEditVisible = false;
    var hasFitView = false; // 是否已执行过自适应

    // 足迹记录
    var footprints = [];

    // ==================== 工具函数 ====================
    function getMapStorageKey() {
        var prefix = typeof APP_PREFIX !== 'undefined' ? APP_PREFIX : 'MAP_';
        var sid = typeof SESSION_ID !== 'undefined' ? SESSION_ID : 'default';
        return prefix + sid + '_' + MAP_STORAGE_KEY;
    }

    function generateId() {
        return 'map_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    function distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    }

    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    function roundRect(ctxRef, x, y, w, h, r) {
        ctxRef.beginPath();
        ctxRef.moveTo(x + r, y);
        ctxRef.lineTo(x + w - r, y);
        ctxRef.quadraticCurveTo(x + w, y, x + w, y + r);
        ctxRef.lineTo(x + w, y + h - r);
        ctxRef.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctxRef.lineTo(x + r, y + h);
        ctxRef.quadraticCurveTo(x, y + h, x, y + h - r);
        ctxRef.lineTo(x, y + r);
        ctxRef.quadraticCurveTo(x, y, x + r, y);
        ctxRef.closePath();
    }

    function screenToCanvas(sx, sy) {
        var rect = canvas.getBoundingClientRect();
        var cx = (sx - rect.left - panOffset.x) / zoomLevel;
        var cy = (sy - rect.top - panOffset.y) / zoomLevel;
        return { x: cx, y: cy };
    }

    // ==================== 数据持久化 ====================
    function loadMapData() {
        return new Promise(function (resolve) {
            if (typeof localforage === 'undefined') {
                // 无 localforage，直接用默认数据
                allMapData = {};
                allMapData['root'] = createDefaultMapData('root');
                footprints = [];
                mapStack = ['root'];
                resolve(false);
                return;
            }
            localforage.getItem(getMapStorageKey()).then(function (saved) {
                if (saved && saved.version === MAP_DATA_VERSION) {
                    allMapData = saved.allMapData || {};
                    footprints = saved.footprints || [];
                    mapStack = saved.mapStack || ['root'];
                    // 确保当前mapKey有数据
                    if (!allMapData[currentMapKey()]) {
                        allMapData[currentMapKey()] = createDefaultMapData(currentMapKey());
                    }
                } else {
                    // 版本不匹配或无数据，重置为默认
                    console.log('[MapApp] 数据版本不匹配或无数据，重置为默认地图');
                    allMapData = {};
                    allMapData['root'] = createDefaultMapData('root');
                    footprints = [];
                    mapStack = ['root'];
                    // 立即保存默认数据
                    saveMapData();
                }
                resolve(true);
            }).catch(function () {
                allMapData = {};
                allMapData['root'] = createDefaultMapData('root');
                footprints = [];
                mapStack = ['root'];
                resolve(false);
            });
        });
    }

    function saveMapData() {
        if (typeof localforage === 'undefined') return;
        localforage.setItem(getMapStorageKey(), {
            version: MAP_DATA_VERSION,
            allMapData: allMapData,
            footprints: footprints,
            mapStack: mapStack
        }).catch(function (e) {
            console.error('[MapApp] 保存地图数据失败:', e);
        });
    }

    // ==================== 摸鱼位置同步 ====================
    function syncMoyuLocation(locationName) {
        if (!locationName || typeof locationName !== 'string') return;

        var data = currentData();
        var trimmedName = locationName.trim();

        // 在所有地图中搜索匹配的地点
        var foundLocation = null;
        var foundMapKey = null;
        var allKeys = Object.keys(allMapData);
        for (var i = 0; i < allKeys.length; i++) {
            var mk = allKeys[i];
            var md = allMapData[mk];
            if (md && md.locations) {
                for (var j = 0; j < md.locations.length; j++) {
                    if (md.locations[j].name === trimmedName) {
                        foundLocation = md.locations[j];
                        foundMapKey = mk;
                        break;
                    }
                }
            }
            if (foundLocation) break;
        }

        if (foundLocation) {
            // 找到匹配地点，移动TA位置到该坐标
            data.taPosition = { x: foundLocation.x, y: foundLocation.y };
            // 如果不在当前地图，切换过去
            if (foundMapKey && foundMapKey !== currentMapKey()) {
                mapStack.push(foundMapKey);
                updateBreadcrumb();
            }
            if (typeof showNotification === 'function') {
                showNotification('TA的位置已更新: ' + trimmedName, 'success');
            }
        } else {
            // 未找到，在当前地图中心附近创建新地点
            var centerX = 400 + (Math.random() - 0.5) * 100;
            var centerY = 300 + (Math.random() - 0.5) * 100;
            var newLoc = {
                id: generateId(),
                name: trimmedName,
                x: Math.round(centerX),
                y: Math.round(centerY),
                category: 'other',
                shared: false
            };
            data.locations.push(newLoc);
            data.taPosition = { x: newLoc.x, y: newLoc.y };
            if (typeof showNotification === 'function') {
                showNotification('已为TA创建新地点: ' + trimmedName, 'info');
            }
        }

        saveMapData();
    }

    // ==================== UI 构建 ====================
    function buildOverlay() {
        if (overlay) return;

        // 防止重复创建：检查 DOM 中是否已存在
        var existing = document.getElementById('map-app-overlay');
        if (existing) {
            overlay = existing;
            return;
        }

        overlay = document.createElement('div');
        overlay.id = 'map-app-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:var(--primary-bg);display:none;flex-direction:column;font-family:var(--font-family);overflow:hidden;';

        overlay.innerHTML = ''
            // ---- 头部 ----
            + '<div style="display:flex;align-items:center;padding:12px 16px;background:var(--header-bg);border-bottom:1px solid var(--border-color);gap:10px;flex-shrink:0;">'
            +   '<button id="map-back-btn" style="width:36px;height:36px;border:none;border-radius:50%;background:var(--toolbar-btn-bg);color:var(--toolbar-btn-color);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;"><i class="fas fa-arrow-left"></i></button>'
            +   '<span style="font-size:17px;font-weight:700;color:var(--text-primary);flex:1;">Zmilk地图</span>'
            +   '<button id="map-search-btn" style="width:36px;height:36px;border:none;border-radius:50%;background:var(--toolbar-btn-bg);color:var(--toolbar-btn-color);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;"><i class="fas fa-search"></i></button>'
            +   '<button id="map-settings-btn" style="width:36px;height:36px;border:none;border-radius:50%;background:var(--toolbar-btn-bg);color:var(--toolbar-btn-color);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;"><i class="fas fa-cog"></i></button>'
            + '</div>'

            // ---- 搜索栏（默认隐藏）----
            + '<div id="map-search-bar" style="display:none;padding:8px 16px;background:var(--secondary-bg);border-bottom:1px solid var(--border-color);flex-shrink:0;">'
            +   '<div style="display:flex;align-items:center;gap:8px;background:var(--primary-bg);border-radius:var(--radius-xs);padding:8px 12px;">'
            +     '<i class="fas fa-search" style="color:var(--text-secondary);font-size:13px;"></i>'
            +     '<input id="map-search-input" type="text" placeholder="搜索地点..." style="flex:1;border:none;background:none;outline:none;font-size:14px;color:var(--text-primary);font-family:var(--font-family);" />'
            +     '<button id="map-search-close" style="border:none;background:none;color:var(--text-secondary);cursor:pointer;font-size:14px;"><i class="fas fa-times"></i></button>'
            +   '</div>'
            + '</div>'

            // ---- Canvas 区域 ----
            + '<div id="map-canvas-area" style="flex:1;position:relative;overflow:hidden;background:#e8f0e0;">'

            // 面包屑导航
            +   '<div id="map-breadcrumb" style="position:absolute;top:8px;left:50%;transform:translateX(-50%);z-index:10;display:flex;align-items:center;gap:4px;background:rgba(255,255,255,0.92);border-radius:20px;padding:4px 12px;font-size:12px;color:var(--text-secondary);box-shadow:0 2px 8px rgba(0,0,0,0.08);backdrop-filter:blur(4px);"></div>'

            // 地形编辑面板（左侧，默认隐藏）
            +   '<div id="map-terrain-panel" style="display:none;position:absolute;top:50px;left:8px;z-index:10;background:rgba(255,255,255,0.95);border-radius:var(--radius-xs);padding:10px;box-shadow:0 2px 12px rgba(0,0,0,0.1);backdrop-filter:blur(4px);width:140px;">'
            +     '<div style="font-size:11px;font-weight:600;color:var(--text-primary);margin-bottom:8px;">地形类型</div>'
            +     '<div id="terrain-type-grass" class="terrain-type-btn" data-type="grass" style="display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:8px;cursor:pointer;margin-bottom:4px;font-size:12px;color:var(--text-primary);background:rgba(126,200,80,0.2);border:2px solid #7ec850;">'
            +       '<span style="width:16px;height:16px;border-radius:4px;background:#7ec850;display:inline-block;"></span>草地'
            +     '</div>'
            +     '<div id="terrain-type-water" class="terrain-type-btn" data-type="water" style="display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:8px;cursor:pointer;margin-bottom:4px;font-size:12px;color:var(--text-primary);background:transparent;border:2px solid transparent;">'
            +       '<span style="width:16px;height:16px;border-radius:4px;background:#4a9bd9;display:inline-block;"></span>水域'
            +     '</div>'
            +     '<div id="terrain-type-sand" class="terrain-type-btn" data-type="sand" style="display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:8px;cursor:pointer;margin-bottom:4px;font-size:12px;color:var(--text-primary);background:transparent;border:2px solid transparent;">'
            +       '<span style="width:16px;height:16px;border-radius:4px;background:#e8d48a;display:inline-block;"></span>沙地'
            +     '</div>'
            +     '<div id="terrain-type-building" class="terrain-type-btn" data-type="building" style="display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:8px;cursor:pointer;margin-bottom:4px;font-size:12px;color:var(--text-primary);background:transparent;border:2px solid transparent;">'
            +       '<span style="width:16px;height:16px;border-radius:4px;background:#b8a090;display:inline-block;"></span>建筑'
            +     '</div>'
            +     '<div style="border-top:1px solid var(--border-color);margin:8px 0;"></div>'
            +     '<div id="terrain-type-road" class="terrain-type-btn" data-type="road" style="display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:8px;cursor:pointer;margin-bottom:4px;font-size:12px;color:var(--text-primary);background:transparent;border:2px solid transparent;">'
            +       '<i class="fas fa-road" style="width:16px;text-align:center;color:#888;"></i>道路'
            +     '</div>'
            +     '<div style="border-top:1px solid var(--border-color);margin:8px 0;"></div>'
            +     '<button id="terrain-delete-btn" style="width:100%;padding:6px;border:1px solid rgba(255,80,80,0.3);border-radius:8px;background:rgba(255,80,80,0.08);color:#e74c3c;font-size:12px;cursor:pointer;font-family:var(--font-family);margin-bottom:8px;"><i class="fas fa-eraser"></i> 擦除模式</button>'
            +     '<div style="display:flex;gap:6px;">'
            +       '<button id="terrain-undo-btn" title="撤销 (Ctrl+Z)" style="flex:1;padding:6px;border:1px solid var(--border-color);border-radius:8px;background:var(--primary-bg);color:var(--text-primary);font-size:12px;cursor:pointer;font-family:var(--font-family);opacity:0.3;pointer-events:none;"><i class="fas fa-undo"></i> 撤销</button>'
            +       '<button id="terrain-redo-btn" title="恢复 (Ctrl+Y)" style="flex:1;padding:6px;border:1px solid var(--border-color);border-radius:8px;background:var(--primary-bg);color:var(--text-primary);font-size:12px;cursor:pointer;font-family:var(--font-family);opacity:0.3;pointer-events:none;"><i class="fas fa-redo"></i> 恢复</button>'
            +     '</div>'
            +   '</div>'

            // 右侧工具栏
            +   '<div id="map-toolbar" style="position:absolute;top:50px;right:8px;z-index:10;display:flex;flex-direction:column;gap:6px;">'
            +     '<button class="map-tool-btn" data-tool="mypos" title="我的位置" style="width:40px;height:40px;border:none;border-radius:12px;background:rgba(255,255,255,0.92);color:#4caf50;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.1);backdrop-filter:blur(4px);"><i class="fas fa-map-marker-alt"></i></button>'
            +     '<button id="map-locate-ta" title="定位TA的位置" style="width:40px;height:40px;border:none;border-radius:12px;background:rgba(255,255,255,0.92);color:#c5a47e;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.1);backdrop-filter:blur(4px);"><i class="fas fa-heart"></i></button>'
            +     '<button class="map-tool-btn" data-tool="addplace" title="添加地点" style="width:40px;height:40px;border:none;border-radius:12px;background:rgba(255,255,255,0.92);color:var(--accent-color);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.1);backdrop-filter:blur(4px);"><i class="fas fa-map-pin"></i></button>'
            +     '<button class="map-tool-btn" data-tool="addsubmap" title="添加子地图" style="width:40px;height:40px;border:none;border-radius:12px;background:rgba(255,255,255,0.92);color:#9b59b6;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.1);backdrop-filter:blur(4px);"><i class="fas fa-layer-group"></i></button>'
            +     '<button class="map-tool-btn" data-tool="drawroute" title="画路线" style="width:40px;height:40px;border:none;border-radius:12px;background:rgba(255,255,255,0.92);color:#e74c3c;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.1);backdrop-filter:blur(4px);"><i class="fas fa-route"></i></button>'
            +     '<button class="map-tool-btn" data-tool="terrainedit" title="地形编辑" style="width:40px;height:40px;border:none;border-radius:12px;background:rgba(255,255,255,0.92);color:#2ecc71;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.1);backdrop-filter:blur(4px);"><i class="fas fa-paint-brush"></i></button>'
            +   '</div>'

            // 缩放控件（左下）
            +   '<div style="position:absolute;bottom:12px;left:12px;z-index:10;display:flex;flex-direction:column;gap:4px;">'
            +     '<button id="map-zoom-in" style="width:36px;height:36px;border:none;border-radius:10px;background:rgba(255,255,255,0.92);color:var(--text-primary);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.1);"><i class="fas fa-plus"></i></button>'
            +     '<button id="map-zoom-out" style="width:36px;height:36px;border:none;border-radius:10px;background:rgba(255,255,255,0.92);color:var(--text-primary);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.1);"><i class="fas fa-minus"></i></button>'
            +   '</div>'

            // 悬浮提示（右下）
            +   '<div id="map-hover-hint" style="position:absolute;bottom:12px;right:12px;z-index:10;background:rgba(255,255,255,0.92);border-radius:20px;padding:6px 14px;font-size:11px;color:var(--text-secondary);box-shadow:0 2px 8px rgba(0,0,0,0.08);backdrop-filter:blur(4px);pointer-events:none;max-width:200px;text-align:center;"></div>'

            // Canvas
            +   '<canvas id="map-canvas" style="width:100%;height:100%;display:block;cursor:grab;"></canvas>'
            + '</div>'

            // ---- 底部面板 ----
            // 位置共享开关栏
            + '<div id="map-sharing-bar" style="display:flex;align-items:center;padding:8px 16px;background:var(--secondary-bg);border-top:1px solid var(--border-color);flex-shrink:0;gap:10px;">'
            +   '<i class="fas fa-location-arrow" style="color:var(--accent-color);font-size:14px;"></i>'
            +   '<span style="font-size:13px;color:var(--text-primary);flex:1;">位置共享</span>'
            +   '<div id="map-sharing-toggle" style="width:44px;height:24px;border-radius:12px;background:#4caf50;cursor:pointer;position:relative;transition:background 0.3s;">'
            +     '<div id="map-sharing-knob" style="width:20px;height:20px;border-radius:50%;background:#fff;position:absolute;top:2px;left:22px;transition:left 0.3s;box-shadow:0 1px 4px rgba(0,0,0,0.2);"></div>'
            +   '</div>'
            + '</div>'

            // 标签栏
            + '<div style="display:flex;background:var(--secondary-bg);border-top:1px solid var(--border-color);flex-shrink:0;">'
            +   '<button class="map-tab-btn active" data-tab="locations" style="flex:1;padding:10px 0;border:none;background:rgba(var(--accent-color-rgb),0.16);color:var(--accent-color);font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font-family);transition:all 0.2s;border-bottom:2px solid var(--accent-color);">地点</button>'
            +   '<button class="map-tab-btn" data-tab="routes" style="flex:1;padding:10px 0;border:none;background:transparent;color:var(--text-secondary);font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font-family);transition:all 0.2s;border-bottom:2px solid transparent;">路线</button>'
            +   '<button class="map-tab-btn" data-tab="footprints" style="flex:1;padding:10px 0;border:none;background:transparent;color:var(--text-secondary);font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font-family);transition:all 0.2s;border-bottom:2px solid transparent;">足迹</button>'
            +   '<button class="map-tab-btn" data-tab="privacy" style="flex:1;padding:10px 0;border:none;background:transparent;color:var(--text-secondary);font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font-family);transition:all 0.2s;border-bottom:2px solid transparent;">隐私</button>'
            + '</div>'

            // 标签内容面板
            + '<div id="map-tab-content" style="flex-shrink:0;max-height:160px;overflow-y:auto;background:var(--secondary-bg);border-top:1px solid var(--border-color);"></div>';

        document.body.appendChild(overlay);
    }

    // ==================== 面包屑更新 ====================
    function updateBreadcrumb() {
        var bc = document.getElementById('map-breadcrumb');
        if (!bc) return;
        var html = '';
        for (var i = 0; i < mapStack.length; i++) {
            if (i > 0) {
                html += '<i class="fas fa-chevron-right" style="font-size:10px;opacity:0.5;"></i>';
            }
            var key = mapStack[i];
            var name = key === 'root' ? '主地图' : key;
            // 如果有地图数据且有名称为自定义名称，使用自定义名称
            if (key !== 'root' && allMapData[key] && allMapData[key].name) {
                name = allMapData[key].name;
            }
            if (i === mapStack.length - 1) {
                html += '<span style="color:var(--accent-color);font-weight:600;">' + escapeHtml(name) + '</span>';
            } else {
                html += '<span style="cursor:pointer;" data-nav-index="' + i + '">' + escapeHtml(name) + '</span>';
            }
        }
        bc.innerHTML = html;

        // 绑定面包屑点击
        var spans = bc.querySelectorAll('[data-nav-index]');
        spans.forEach(function (span) {
            span.addEventListener('click', function () {
                var idx = parseInt(this.getAttribute('data-nav-index'));
                mapStack = mapStack.slice(0, idx + 1);
                updateBreadcrumb();
                saveMapData();
            });
        });
    }

    // ==================== 标签内容渲染 ====================
    function renderTabContent() {
        var container = document.getElementById('map-tab-content');
        if (!container) return;

        if (currentTab === 'locations') {
            renderLocationsTab(container);
        } else if (currentTab === 'routes') {
            renderRoutesTab(container);
        } else if (currentTab === 'footprints') {
            renderFootprintsTab(container);
        } else if (currentTab === 'privacy') {
            renderPrivacyTab(container);
        }
    }

    function renderLocationsTab(container) {
        var data = currentData();
        var locs = data.locations || [];
        var filteredLocs = locs;
        if (searchQuery) {
            filteredLocs = locs.filter(function (l) {
                return l.name.toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0;
            });
        }

        var html = '';

        // 地点列表
        if (filteredLocs.length > 0) {
            html += '<div style="padding:10px 12px 6px;font-size:12px;font-weight:600;color:var(--text-secondary);">地点</div>';
            html += '<div style="padding:0 12px 8px;">';
            for (var i = 0; i < filteredLocs.length; i++) {
                var loc = filteredLocs[i];
                var cat = LOCATION_CATEGORIES.find(function (c) { return c.id === loc.category; }) || LOCATION_CATEGORIES[6];
                html += '<div class="map-loc-item" data-loc-id="' + loc.id + '" style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:var(--radius-xs);margin-bottom:4px;background:var(--primary-bg);cursor:pointer;transition:background 0.2s;">'
                    + '<div style="width:32px;height:32px;border-radius:8px;background:' + cat.color + '22;display:flex;align-items:center;justify-content:center;"><i class="fas ' + cat.icon + '" style="color:' + cat.color + ';font-size:14px;"></i></div>'
                    + '<div style="flex:1;">'
                    +   '<div style="font-size:13px;font-weight:600;color:var(--text-primary);">' + loc.name + '</div>'
                    +   '<div style="font-size:11px;color:var(--text-secondary);">' + cat.name + ' · (' + loc.x + ', ' + loc.y + ')</div>'
                    + '</div>'
                    + (loc.hasSubmap ? '<i class="fas fa-sitemap" style="color:#9b59b6;font-size:12px;margin-right:4px;"></i>' : '')
                    + '<button class="map-loc-edit" data-loc-id="' + loc.id + '" style="width:28px;height:28px;border:none;border-radius:50%;background:transparent;color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;opacity:0.5;"><i class="fas fa-pen"></i></button>'
                    + '<button class="map-loc-delete" data-loc-id="' + loc.id + '" style="width:28px;height:28px;border:none;border-radius:50%;background:transparent;color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;opacity:0.5;"><i class="fas fa-trash-alt"></i></button>'
                    + '</div>';
            }
            html += '</div>';
        }

        // 子地图列表
        var submaps = data.submaps || [];
        if (submaps.length > 0) {
            html += '<div style="padding:10px 12px 6px;font-size:12px;font-weight:600;color:var(--text-secondary);">子地图</div>';
            html += '<div style="padding:0 12px 12px;">';
            for (var i = 0; i < submaps.length; i++) {
                var sm = submaps[i];
                var smData = allMapData[sm.key];
                var smName = smData && smData.name ? smData.name : sm.name;
                html += '<div class="map-submap-item" data-submap-key="' + sm.key + '" style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:var(--radius-xs);margin-bottom:4px;background:var(--primary-bg);cursor:pointer;transition:background 0.2s;">'
                    + '<div style="width:32px;height:32px;border-radius:8px;background:rgba(155,89,182,0.15);display:flex;align-items:center;justify-content:center;"><i class="fas fa-layer-group" style="color:#9b59b6;font-size:14px;"></i></div>'
                    + '<div style="flex:1;">'
                    +   '<div style="font-size:13px;font-weight:600;color:var(--text-primary);">' + escapeHtml(smName) + '</div>'
                    +   '<div style="font-size:11px;color:var(--text-secondary);">(' + Math.round(sm.x) + ', ' + Math.round(sm.y) + ') · ' + Math.round(sm.w) + '×' + Math.round(sm.h) + '</div>'
                    + '</div>'
                    + '<button class="map-submap-edit" data-submap-key="' + sm.key + '" style="width:28px;height:28px;border:none;border-radius:50%;background:transparent;color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;opacity:0.5;"><i class="fas fa-pen"></i></button>'
                    + '<button class="map-submap-delete" data-submap-key="' + sm.key + '" style="width:28px;height:28px;border:none;border-radius:50%;background:transparent;color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;opacity:0.5;"><i class="fas fa-trash-alt"></i></button>'
                    + '</div>';
            }
            html += '</div>';
        }

        if (filteredLocs.length === 0 && submaps.length === 0) {
            html += '<div style="text-align:center;padding:20px;color:var(--text-secondary);font-size:13px;">'
                + '<i class="fas fa-map-marker-alt" style="font-size:24px;opacity:0.3;margin-bottom:8px;display:block;"></i>'
                + (searchQuery ? '没有找到匹配的地点' : '暂无地点，点击右侧工具添加')
                + '</div>';
        }

        container.innerHTML = html;

        // 绑定地点点击（定位到地图上）
        container.querySelectorAll('.map-loc-item').forEach(function (item) {
            item.addEventListener('click', function (e) {
                if (e.target.closest('.map-loc-delete') || e.target.closest('.map-loc-edit')) return;
                var locId = this.getAttribute('data-loc-id');
                var loc = data.locations.find(function (l) { return l.id === locId; });
                if (loc) {
                    panOffset.x = canvas.width / 2 / zoomLevel - loc.x;
                    panOffset.y = canvas.height / 2 / zoomLevel - loc.y;
                }
            });
        });

        // 绑定地点编辑按钮
        container.querySelectorAll('.map-loc-edit').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var locId = this.getAttribute('data-loc-id');
                var loc = data.locations.find(function (l) { return l.id === locId; });
                if (loc) {
                    showEditPlaceDialog(loc);
                }
            });
        });

        // 绑定地点删除按钮
        container.querySelectorAll('.map-loc-delete').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var locId = this.getAttribute('data-loc-id');
                data.locations = data.locations.filter(function (l) { return l.id !== locId; });
                saveMapData();
                renderTabContent();
                if (typeof showNotification === 'function') {
                    showNotification('地点已删除', 'info');
                }
            });
        });

        // 绑定子地图点击（进入子地图）
        container.querySelectorAll('.map-submap-item').forEach(function (item) {
            item.addEventListener('click', function (e) {
                if (e.target.closest('.map-submap-delete') || e.target.closest('.map-submap-edit')) return;
                var submapKey = this.getAttribute('data-submap-key');
                if (!allMapData[submapKey]) {
                    allMapData[submapKey] = createDefaultMapData(submapKey);
                }
                mapStack.push(submapKey);
                updateBreadcrumb();
                saveMapData();
                renderTabContent();
            });
        });

        // 绑定子地图编辑按钮
        container.querySelectorAll('.map-submap-edit').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var submapKey = this.getAttribute('data-submap-key');
                showEditSubmapDialog(submapKey);
            });
        });

        // 绑定子地图删除按钮
        container.querySelectorAll('.map-submap-delete').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var submapKey = this.getAttribute('data-submap-key');
                if (!confirm('确定要删除这个子地图吗？')) return;
                // 从 submaps 中移除
                data.submaps = data.submaps.filter(function (s) { return s.key !== submapKey; });
                // 清除关联的地点 hasSubmap
                data.locations.forEach(function (loc) {
                    if (loc.submapId === submapKey) {
                        loc.hasSubmap = false;
                        delete loc.submapId;
                    }
                });
                saveMapData();
                renderTabContent();
                if (typeof showNotification === 'function') {
                    showNotification('子地图已删除', 'info');
                }
            });
        });
    }

    // 编辑子地图对话框
    function showEditSubmapDialog(submapKey) {
        var data = currentData();
        var submap = data.submaps.find(function (s) { return s.key === submapKey; });
        if (!submap) return;
        var smData = allMapData[submapKey];
        var currentName = smData && smData.name ? smData.name : submap.name;

        var overlay = document.createElement('div');
        overlay.className = 'modal show';
        overlay.innerHTML = ''
            + '<div class="modal-content" style="max-width:320px;">'
            +   '<div class="modal-header" style="background:var(--accent-color);"><span class="modal-icon">🗺️</span><span class="modal-title-text">编辑子地图</span></div>'
            +   '<div class="modal-body" style="padding:20px;">'
            +     '<label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">子地图名称</label>'
            +     '<input id="map-edit-submap-name-input" type="text" value="' + escapeHtml(currentName) + '" placeholder="输入子地图名称" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius-xs);font-size:14px;color:var(--text-primary);background:var(--primary-bg);outline:none;font-family:var(--font-family);margin-bottom:12px;" />'
            +     '<label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">X 坐标</label>'
            +     '<input id="map-edit-submap-x" type="number" value="' + Math.round(submap.x) + '" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius-xs);font-size:14px;color:var(--text-primary);background:var(--primary-bg);outline:none;font-family:var(--font-family);margin-bottom:12px;" />'
            +     '<label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">Y 坐标</label>'
            +     '<input id="map-edit-submap-y" type="number" value="' + Math.round(submap.y) + '" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius-xs);font-size:14px;color:var(--text-primary);background:var(--primary-bg);outline:none;font-family:var(--font-family);margin-bottom:12px;" />'
            +     '<label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">宽度</label>'
            +     '<input id="map-edit-submap-w" type="number" value="' + Math.round(submap.w) + '" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius-xs);font-size:14px;color:var(--text-primary);background:var(--primary-bg);outline:none;font-family:var(--font-family);margin-bottom:12px;" />'
            +     '<label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">高度</label>'
            +     '<input id="map-edit-submap-h" type="number" value="' + Math.round(submap.h) + '" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius-xs);font-size:14px;color:var(--text-primary);background:var(--primary-bg);outline:none;font-family:var(--font-family);margin-bottom:12px;" />'
            +   '</div>'
            +   '<div class="modal-footer">'
            +     '<button class="dreamy-btn secondary" onclick="this.closest(\'.modal\').remove()">取消</button>'
            +     '<button class="dreamy-btn primary" id="map-edit-submap-confirm">保存</button>'
            +   '</div>'
            + '</div>';
        document.body.appendChild(overlay);

        document.getElementById('map-edit-submap-confirm').addEventListener('click', function () {
            var newName = document.getElementById('map-edit-submap-name-input').value.trim();
            var newX = parseInt(document.getElementById('map-edit-submap-x').value) || submap.x;
            var newY = parseInt(document.getElementById('map-edit-submap-y').value) || submap.y;
            var newW = parseInt(document.getElementById('map-edit-submap-w').value) || submap.w;
            var newH = parseInt(document.getElementById('map-edit-submap-h').value) || submap.h;

            if (newName) {
                submap.name = newName;
                if (smData) smData.name = newName;
            }
            submap.x = newX;
            submap.y = newY;
            submap.w = newW;
            submap.h = newH;

            saveMapData();
            renderTabContent();
            overlay.remove();
            if (typeof showNotification === 'function') {
                showNotification('子地图信息已更新', 'success');
            }
        });
    }

    function renderRoutesTab(container) {
        var data = currentData();
        var routes = data.routes || [];

        var html = '<div style="padding:10px 16px 4px;font-size:12px;color:var(--text-secondary);">共 ' + routes.length + ' 条路线</div>';

        if (routes.length === 0) {
            html += '<div style="text-align:center;padding:20px;color:var(--text-secondary);font-size:13px;">'
                + '<i class="fas fa-route" style="font-size:24px;opacity:0.3;margin-bottom:8px;display:block;"></i>'
                + '暂无路线，使用工具栏绘制'
                + '</div>';
        } else {
            html += '<div style="padding:0 12px 12px;">';
            for (var i = 0; i < routes.length; i++) {
                var route = routes[i];
                var pts = route.points || [];
                var dist = 0;
                for (var j = 1; j < pts.length; j++) {
                    dist += distance(pts[j - 1].x, pts[j - 1].y, pts[j].x, pts[j].y);
                }
                html += '<div style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:var(--radius-xs);margin-bottom:4px;background:var(--primary-bg);">'
                    + '<div style="width:4px;height:32px;border-radius:2px;background:' + (route.color || '#e74c3c') + ';"></div>'
                    + '<div style="flex:1;">'
                    +   '<div style="font-size:13px;font-weight:600;color:var(--text-primary);">' + (route.name || '路线 ' + (i + 1)) + '</div>'
                    +   '<div style="font-size:11px;color:var(--text-secondary);">' + pts.length + ' 个点 · 距离 ' + Math.round(dist) + '</div>'
                    + '</div>'
                    + '<button class="map-route-delete" data-route-index="' + i + '" style="width:28px;height:28px;border:none;border-radius:50%;background:transparent;color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;opacity:0.5;"><i class="fas fa-trash-alt"></i></button>'
                    + '</div>';
            }
            html += '</div>';
        }

        container.innerHTML = html;

        container.querySelectorAll('.map-route-delete').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var idx = parseInt(this.getAttribute('data-route-index'));
                data.routes.splice(idx, 1);
                saveMapData();
                renderTabContent();
            });
        });
    }

    // 足迹查询状态
    var _footprintSearchQuery = '';

    function renderFootprintsTab(container) {
        // 只显示梦角（TA）的移动记录
        var taFootprints = footprints.filter(function (fp) { return fp.type === 'ta'; });

        // 搜索过滤
        if (_footprintSearchQuery) {
            var q = _footprintSearchQuery.toLowerCase();
            taFootprints = taFootprints.filter(function (fp) {
                return (fp.locationName || '').toLowerCase().indexOf(q) !== -1;
            });
        }

        var partnerName = getPartnerName() || '梦角';
        var html = '<div style="padding:10px 16px 4px;font-size:12px;color:var(--text-secondary);">共 ' + taFootprints.length + ' 次移动</div>';

        // 搜索框
        html += '<div style="padding:4px 12px 8px;">'
            + '<div style="display:flex;align-items:center;gap:6px;background:var(--primary-bg);border-radius:var(--radius-xs);padding:6px 10px;border:1px solid var(--border-color);">'
            + '<i class="fas fa-search" style="color:var(--text-secondary);font-size:11px;"></i>'
            + '<input id="map-footprint-search" type="text" placeholder="搜索地点..." value="' + escapeHtml(_footprintSearchQuery) + '" style="flex:1;border:none;background:none;font-size:12px;color:var(--text-primary);outline:none;font-family:var(--font-family);">'
            + '</div></div>';

        if (taFootprints.length === 0) {
            html += '<div style="text-align:center;padding:20px;color:var(--text-secondary);font-size:13px;">'
                + '<i class="fas fa-heart" style="font-size:24px;opacity:0.3;margin-bottom:8px;display:block;"></i>'
                + (_footprintSearchQuery ? '没有找到匹配的足迹' : partnerName + ' 移动后会自动记录足迹')
                + '</div>';
        } else {
            // 按日期分组
            var groups = {};
            for (var i = 0; i < taFootprints.length; i++) {
                var fp = taFootprints[i];
                var d = new Date(fp.time);
                var dateKey = d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0');
                if (!groups[dateKey]) groups[dateKey] = [];
                groups[dateKey].push(fp);
            }

            // 按日期倒序
            var dateKeys = Object.keys(groups).sort().reverse();

            html += '<div style="padding:0 12px 12px;">';
            for (var di = 0; di < dateKeys.length; di++) {
                var dateKey = dateKeys[di];
                var items = groups[dateKey];

                // 日期标题
                var today = new Date();
                var todayStr = today.getFullYear() + '-' + (today.getMonth() + 1).toString().padStart(2, '0') + '-' + today.getDate().toString().padStart(2, '0');
                var yesterday = new Date(today.getTime() - 86400000);
                var yesterdayStr = yesterday.getFullYear() + '-' + (yesterday.getMonth() + 1).toString().padStart(2, '0') + '-' + yesterday.getDate().toString().padStart(2, '0');

                var dateLabel = dateKey;
                if (dateKey === todayStr) dateLabel = '今天';
                else if (dateKey === yesterdayStr) dateLabel = '昨天';
                else {
                    var parts = dateKey.split('-');
                    dateLabel = parseInt(parts[1]) + '月' + parseInt(parts[2]) + '日';
                }

                html += '<div style="font-size:11px;color:var(--text-secondary);font-weight:600;padding:8px 10px 4px;">' + dateLabel + ' (' + items.length + ')</div>';

                for (var j = items.length - 1; j >= 0; j--) {
                    var fp = items[j];
                    var d = new Date(fp.time);
                    var timeStr = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
                    html += '<div style="display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:var(--radius-xs);margin-bottom:1px;background:var(--primary-bg);">'
                        + '<i class="fas fa-heart" style="color:#c5a47e;font-size:11px;width:16px;text-align:center;flex-shrink:0;"></i>'
                        + '<div style="flex:1;min-width:0;">'
                        +   '<div style="font-size:12px;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + partnerName + ' 到达了 ' + escapeHtml(fp.locationName || '(' + fp.x + ', ' + fp.y + ')') + '</div>'
                        + '</div>'
                        + '<span style="font-size:10px;color:var(--text-secondary);flex-shrink:0;">' + timeStr + '</span>'
                        + '</div>';
                }
            }
            html += '</div>';
        }

        container.innerHTML = html;

        // 绑定搜索事件
        var searchInput = document.getElementById('map-footprint-search');
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                _footprintSearchQuery = this.value;
                renderFootprintsTab(container);
            });
        }
    }

    function renderPrivacyTab(container) {
        var data = currentData();
        var html = '<div style="padding:12px 16px;">'
            + '<div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:12px;">隐私设置</div>'
            + '<div style="display:flex;flex-direction:column;gap:10px;">';

        // 显示我的位置
        html += renderPrivacyToggle('privacy-show-me', '显示我的位置', '对方可以看到你在地图上的位置', data.privacyShowMe !== false);
        // 显示TA的位置
        html += renderPrivacyToggle('privacy-show-ta', '显示TA的位置', '你可以看到TA在地图上的位置', data.privacyShowTa !== false);
        // 显示路线
        html += renderPrivacyToggle('privacy-show-routes', '显示共享路线', '对方可以看到你绘制的路线', data.privacyShowRoutes !== false);

        html += '</div></div>';
        container.innerHTML = html;

        // 绑定开关
        container.querySelectorAll('.map-privacy-toggle').forEach(function (toggle) {
            toggle.addEventListener('click', function () {
                var key = this.getAttribute('data-key');
                var isOn = this.classList.contains('on');
                if (isOn) {
                    this.classList.remove('on');
                    this.style.background = '#ccc';
                    this.querySelector('.map-privacy-knob').style.left = '2px';
                } else {
                    this.classList.add('on');
                    this.style.background = 'var(--accent-color)';
                    this.querySelector('.map-privacy-knob').style.left = '22px';
                }
                if (key === 'privacy-show-me') data.privacyShowMe = isOn ? false : true;
                else if (key === 'privacy-show-ta') data.privacyShowTa = isOn ? false : true;
                else if (key === 'privacy-show-routes') data.privacyShowRoutes = isOn ? false : true;
                saveMapData();
            });
        });
    }

    function renderPrivacyToggle(key, title, desc, isOn) {
        return '<div style="display:flex;align-items:center;gap:12px;">'
            + '<div style="flex:1;">'
            +   '<div style="font-size:13px;font-weight:600;color:var(--text-primary);">' + title + '</div>'
            +   '<div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">' + desc + '</div>'
            + '</div>'
            + '<div class="map-privacy-toggle ' + (isOn ? 'on' : '') + '" data-key="' + key + '" style="width:44px;height:24px;border-radius:12px;background:' + (isOn ? 'var(--accent-color)' : '#ccc') + ';cursor:pointer;position:relative;transition:background 0.3s;flex-shrink:0;">'
            +   '<div class="map-privacy-knob" style="width:20px;height:20px;border-radius:50%;background:#fff;position:absolute;top:2px;left:' + (isOn ? '22px' : '2px') + ';transition:left 0.3s;box-shadow:0 1px 4px rgba(0,0,0,0.2);"></div>'
            + '</div>'
            + '</div>';
    }

    // ==================== Canvas 绘制 ====================
    function resizeCanvas() {
        if (!canvas) return;
        var area = document.getElementById('map-canvas-area');
        if (!area) return;
        var dpr = window.devicePixelRatio || 1;
        var cw = area.clientWidth;
        var ch = area.clientHeight;
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
        canvas.style.width = cw + 'px';
        canvas.style.height = ch + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // 居中视图到地图内容中心（与 preview 一致）
    function centerView() {
        var area = document.getElementById('map-canvas-area');
        if (!area) return;
        var cw = area.clientWidth;
        var ch = area.clientHeight;
        // preview 中默认居中到 (275, 250)
        panOffset.x = cw / 2 - 275;
        panOffset.y = ch / 2 - 250;
        zoomLevel = 1;
        hasFitView = true;
    }

    function render(time) {
        if (!isVisible || !ctx || !canvas) return;

        // 首次渲染时居中视图
        if (!hasFitView) centerView();

        var area = document.getElementById('map-canvas-area');
        if (!area) return;

        // 使用 canvas 的实际像素尺寸（已考虑 DPR）
        var w = canvas.width;
        var h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        // 背景
        ctx.fillStyle = CANVAS_BG;
        ctx.fillRect(0, 0, w, h);

        // 应用变换
        ctx.save();
        ctx.translate(panOffset.x, panOffset.y);
        ctx.scale(zoomLevel, zoomLevel);

        var mapKey = currentMapKey();

        // 调试：输出数据状态
        var dbgData = allMapData[mapKey];
        if (dbgData) {
            console.log('render mapKey=' + mapKey + ', locs=' + (dbgData.locations ? dbgData.locations.length : 0) + ', routes=' + (dbgData.routes ? dbgData.routes.length : 0) + ', terrain=' + (dbgData.terrain ? dbgData.terrain.length : 0));
        } else {
            console.log('render mapKey=' + mapKey + ', NO DATA');
        }

        // 绘制网格
        drawGrid(w, h);

        // 绘制地形
        drawTerrain(mapKey);

        // 绘制道路
        drawRoads(mapKey);

        // 绘制子地图区域
        drawSubmaps(mapKey);

        // 绘制路线
        drawRoutes(mapKey);

        // 绘制地点标记
        drawLocations(mapKey, time);

        // 绘制地形预览（拖拽中）
        drawTerrainPreview();

        // 绘制路线预览（画路线中）
        drawRoutePreview();

        ctx.restore();

        animFrameId = requestAnimationFrame(render);
    }

    function drawGrid(w, h) {
        ctx.strokeStyle = 'rgba(0,0,0,0.04)';
        ctx.lineWidth = 0.5;
        var startX = Math.floor(-panOffset.x / zoomLevel / GRID_SIZE) * GRID_SIZE - GRID_SIZE;
        var startY = Math.floor(-panOffset.y / zoomLevel / GRID_SIZE) * GRID_SIZE - GRID_SIZE;
        var endX = startX + w / zoomLevel + GRID_SIZE * 2;
        var endY = startY + h / zoomLevel + GRID_SIZE * 2;

        ctx.beginPath();
        for (var x = startX; x < endX; x += GRID_SIZE) {
            ctx.moveTo(x, startY);
            ctx.lineTo(x, endY);
        }
        for (var y = startY; y < endY; y += GRID_SIZE) {
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
        }
        ctx.stroke();
    }

    function drawTerrain(mapKey) {
        var data = allMapData[mapKey];
        if (!data || !data.terrain) return;

        for (var i = 0; i < data.terrain.length; i++) {
            var t = data.terrain[i];
            // 优先使用直接指定的 color，其次按 type 查表
            var color = t.color || (TERRAIN_COLORS[t.type] && TERRAIN_COLORS[t.type].color);
            if (!color) continue;

            // 像素风格：与 preview 一致的 sin 抖动方块
            var step = 12;
            ctx.fillStyle = color;
            for (var px = t.x; px < t.x + t.w; px += step) {
                for (var py = t.y; py < t.y + t.h; py += step) {
                    var jitter = Math.sin(px * 0.1 + py * 0.1) * 1.5;
                    ctx.fillRect(
                        Math.floor(px + jitter),
                        Math.floor(py + jitter),
                        step - 1,
                        step - 1
                    );
                }
            }
        }
    }

    function drawRoads(mapKey) {
        var data = allMapData[mapKey];
        if (!data || !data.roads) return;

        for (var i = 0; i < data.roads.length; i++) {
            var r = data.roads[i];

            // 支持两种格式：points 数组 或 x1,y1,x2,y2 两点
            var x1, y1, x2, y2, rw;
            if (r.points && r.points.length >= 2) {
                x1 = r.points[0].x; y1 = r.points[0].y;
                x2 = r.points[r.points.length - 1].x; y2 = r.points[r.points.length - 1].y;
                rw = r.w || 6;
            } else if (r.x1 !== undefined) {
                x1 = r.x1; y1 = r.y1; x2 = r.x2; y2 = r.y2; rw = r.w || 6;
            } else {
                continue;
            }

            // 路面（与 preview 一致：简单线条）
            ctx.strokeStyle = '#d5cbbf';
            ctx.lineWidth = rw;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            // 路边框（destination-over）
            ctx.strokeStyle = '#c8bfb3';
            ctx.lineWidth = rw + 2;
            ctx.globalCompositeOperation = 'destination-over';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.globalCompositeOperation = 'source-over';
        }
    }

    function drawSubmaps(mapKey) {
        var data = allMapData[mapKey];
        if (!data || !data.submaps) return;

        for (var i = 0; i < data.submaps.length; i++) {
            var sm = data.submaps[i];
            var color = sm.color || 'rgba(187,158,199,0.15)';
            var borderColor = sm.borderColor || '#BB9EC7';

            // 填充底色
            ctx.fillStyle = color;
            roundRect(ctx, sm.x, sm.y, sm.w, sm.h, 8);
            ctx.fill();

            // 虚线边框
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            roundRect(ctx, sm.x, sm.y, sm.w, sm.h, 8);
            ctx.stroke();
            ctx.setLineDash([]);

            // 名称居中
            ctx.fillStyle = borderColor;
            ctx.font = '600 13px "Noto Serif SC", serif';
            ctx.textAlign = 'center';
            ctx.fillText(sm.name, sm.x + sm.w / 2, sm.y + sm.h / 2 + 4);

            // 进入箭头图标
            ctx.fillStyle = borderColor;
            ctx.globalAlpha = 0.6;
            drawExpandIcon(ctx, sm.x + sm.w / 2, sm.y + sm.h / 2 + 22, 8);
            ctx.globalAlpha = 1;
        }
    }

    function drawExpandIcon(ctxRef, cx, cy, size) {
        ctxRef.strokeStyle = ctxRef.fillStyle;
        ctxRef.lineWidth = 1.5;
        ctxRef.lineCap = 'round';
        var s = size;
        // 左上
        ctxRef.beginPath(); ctxRef.moveTo(cx - s, cy - s + 3); ctxRef.lineTo(cx - s, cy - s); ctxRef.lineTo(cx - s + 3, cy - s); ctxRef.stroke();
        // 右上
        ctxRef.beginPath(); ctxRef.moveTo(cx + s - 3, cy - s); ctxRef.lineTo(cx + s, cy - s); ctxRef.lineTo(cx + s, cy - s + 3); ctxRef.stroke();
        // 右下
        ctxRef.beginPath(); ctxRef.moveTo(cx + s, cy + s - 3); ctxRef.lineTo(cx + s, cy + s); ctxRef.lineTo(cx + s - 3, cy + s); ctxRef.stroke();
        // 左下
        ctxRef.beginPath(); ctxRef.moveTo(cx - s + 3, cy + s); ctxRef.lineTo(cx - s, cy + s); ctxRef.lineTo(cx - s, cy + s - 3); ctxRef.stroke();
    }

    function drawRoutes(mapKey) {
        var data = allMapData[mapKey];
        if (!data || !data.routes) return;

        for (var i = 0; i < data.routes.length; i++) {
            var route = data.routes[i];
            var pts = route.points;
            if (!pts || pts.length < 2) continue;

            var color = route.color || '#e74c3c';

            // 路线线条
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            if (route.dash) ctx.setLineDash([8, 5]);
            else ctx.setLineDash([]);

            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            for (var j = 1; j < pts.length; j++) {
                ctx.lineTo(pts[j].x, pts[j].y);
            }
            ctx.stroke();
            ctx.setLineDash([]);

            // 绘制方向箭头（在每段线段的中点）
            for (var j = 0; j < pts.length - 1; j++) {
                var mx = (pts[j].x + pts[j + 1].x) / 2;
                var my = (pts[j].y + pts[j + 1].y) / 2;
                var angle = Math.atan2(pts[j + 1].y - pts[j].y, pts[j + 1].x - pts[j].x);
                drawArrow(ctx, mx, my, angle, color);
            }

            // 路线节点小圆点
            for (var j = 0; j < pts.length; j++) {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(pts[j].x, pts[j].y, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(pts[j].x, pts[j].y, 2, 0, Math.PI * 2);
                ctx.fill();

                // 起点标序号
                if (j === 0) {
                    ctx.fillStyle = color;
                    ctx.font = 'bold 9px "Nunito", sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('1', pts[j].x, pts[j].y - 10);
                }
            }
        }
    }

    function drawArrow(ctxRef, x, y, angle, color) {
        var size = 7;
        ctxRef.save();
        ctxRef.translate(x, y);
        ctxRef.rotate(angle);

        // 箭头背景（白色圆）
        ctxRef.fillStyle = '#fff';
        ctxRef.beginPath();
        ctxRef.arc(0, 0, size + 2, 0, Math.PI * 2);
        ctxRef.fill();

        // 箭头三角形
        ctxRef.fillStyle = color;
        ctxRef.beginPath();
        ctxRef.moveTo(size, 0);
        ctxRef.lineTo(-size * 0.5, -size * 0.6);
        ctxRef.lineTo(-size * 0.5, size * 0.6);
        ctxRef.closePath();
        ctxRef.fill();

        ctxRef.restore();
    }

    function drawLocations(mapKey, time) {
        var data = allMapData[mapKey];
        if (!data) return;

        var locs = data.locations || [];
        var t = time || Date.now();

        // 第一遍：绘制普通地点（确保在底层）
        for (var i = 0; i < locs.length; i++) {
            var loc = locs[i];
            var x = loc.x, y = loc.y;

            // 跳过 me/ta，第二遍再画
            if (loc.type === 'me' || loc.type === 'ta') continue;

            // 普通地点：使用 loc.color 或分类颜色
            var color = loc.color || '#7FA6CD';

            // 阴影
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.beginPath();
            ctx.ellipse(x, y + 22, 10, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // 底座
            ctx.fillStyle = color;
            roundRect(ctx, x - 14, y - 14, 28, 28, 6);
            ctx.fill();

            // 白色内圈
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(x, y, 9, 0, Math.PI * 2);
            ctx.fill();

            // 彩色内圈
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();

            // 名称标签
            ctx.fillStyle = '#1a1a1a';
            ctx.font = '500 11px "Noto Serif SC", serif';
            ctx.textAlign = 'center';
            ctx.fillText(loc.name, x, y + 36);

            // 有附地图的地点：右上角小标记
            if (loc.hasSubmap) {
                ctx.fillStyle = '#BB9EC7';
                ctx.beginPath();
                ctx.arc(x + 12, y - 12, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 8px "Font Awesome 6 Free"';
                ctx.textAlign = 'center';
                ctx.fillText('\uf067', x + 12, y - 9);
            }
        }

        // 第二遍：绘制 me/ta 位置图标（确保在最上层）
        for (var i = 0; i < locs.length; i++) {
            var loc = locs[i];
            var x = loc.x, y = loc.y;

            if (loc.type === 'ta' && !data.sharingEnabled) continue;

            if (loc.type === 'me' || loc.type === 'ta') {
                var isMe = (loc.type === 'me');
                var color = loc.color || (isMe ? '#7BC8A4' : '#c5a47e');
                drawPinMarker(x, y - 8, color, isMe, !isMe, t);

                // 绘制名称标签
                var label = loc.name;
                if (!isMe) {
                    // TA 位置使用梦角昵称
                    var partnerName = getPartnerName();
                    if (partnerName) label = partnerName;
                }
                ctx.fillStyle = '#1a1a1a';
                ctx.font = '500 11px "Noto Serif SC", serif';
                ctx.textAlign = 'center';
                ctx.fillText(label, x, y + 28);
            }
        }
    }

    // 获取梦角昵称
    function getPartnerName() {
        try {
            // 优先从 Home 全局存储读取
            if (typeof window.homeGetGlobal === 'function') {
                var profileJson = window.homeGetGlobal('profile_partner');
                if (profileJson) {
                    var parsed = JSON.parse(profileJson);
                    if (parsed.name) return parsed.name;
                }
            }
            // 其次从 settings 读取
            if (window.settings && window.settings.partnerName) {
                return window.settings.partnerName;
            }
        } catch (e) {}
        return null;
    }

    // 绘制路线预览（画路线工具拖拽中）
    function drawRoutePreview() {
        if (activeTool !== 'drawroute' || currentRoutePoints.length < 1) return;

        ctx.strokeStyle = currentRouteColor || '#e74c3c';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.setLineDash([6, 4]);
        ctx.globalAlpha = 0.7;

        ctx.beginPath();
        ctx.moveTo(currentRoutePoints[0].x, currentRoutePoints[0].y);
        for (var i = 1; i < currentRoutePoints.length; i++) {
            ctx.lineTo(currentRoutePoints[i].x, currentRoutePoints[i].y);
        }
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.globalAlpha = 1;

        // 绘制节点圆点
        for (var i = 0; i < currentRoutePoints.length; i++) {
            ctx.fillStyle = currentRouteColor || '#e74c3c';
            ctx.beginPath();
            ctx.arc(currentRoutePoints[i].x, currentRoutePoints[i].y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(currentRoutePoints[i].x, currentRoutePoints[i].y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawPinMarker(x, y, color, isMe, isTa, time) {
        // 动画：轻微缩放 + 小弧度上下跳动（与 preview 一致）
        var bounce = Math.sin(time * 0.003) * 2;
        var scale = 1 + Math.sin(time * 0.002) * 0.05;

        ctx.save();
        ctx.translate(x, y + bounce);
        ctx.scale(scale, scale);
        ctx.translate(-x, -y);

        // 阴影
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.beginPath();
        ctx.ellipse(x, y + 18, 10, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // 头像底色圆
        var r = 16;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        // 裁剪为圆形，绘制头像
        var avatarImg = isMe ? _meAvatarImg : _taAvatarImg;
        if (avatarImg) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, r - 1, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(avatarImg, x - r + 1, y - r + 1, (r - 1) * 2, (r - 1) * 2);
            ctx.restore();
        } else {
            // 头像内部：人物剪影占位（无头像时）
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(x, y - 4, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(x, y + 10, 9, 7, 0, Math.PI, 0);
            ctx.fill();
        }

        ctx.restore();
    }

    function drawTerrainPreview() {
        if (!isDraggingTerrain || !terrainDragStart || !terrainDragCurrent) return;

        var x = Math.min(terrainDragStart.x, terrainDragCurrent.x);
        var y = Math.min(terrainDragStart.y, terrainDragCurrent.y);
        var w = Math.abs(terrainDragCurrent.x - terrainDragStart.x);
        var h = Math.abs(terrainDragCurrent.y - terrainDragStart.y);

        var colorMap = {
            grass: 'rgba(212,230,195,0.6)',
            water: 'rgba(184,212,227,0.6)',
            sand: 'rgba(232,224,212,0.6)',
            building: 'rgba(212,200,176,0.6)'
        };

        ctx.fillStyle = colorMap[currentTerrainType] || colorMap.grass;
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = 'rgba(197,164,126,0.8)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(x, y, w, h);
        ctx.setLineDash([]);
    }

    // ==================== 事件处理 ====================
    function bindEvents() {
        // 返回按钮
        var backBtn = document.getElementById('map-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', function () {
                window.MapApp.hide();
            });
        }

        // 搜索按钮
        var searchBtn = document.getElementById('map-search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', function () {
                var bar = document.getElementById('map-search-bar');
                if (bar) {
                    bar.style.display = bar.style.display === 'none' ? 'block' : 'none';
                    if (bar.style.display === 'block') {
                        document.getElementById('map-search-input').focus();
                    }
                }
            });
        }

        // 搜索关闭
        var searchClose = document.getElementById('map-search-close');
        if (searchClose) {
            searchClose.addEventListener('click', function () {
                var bar = document.getElementById('map-search-bar');
                if (bar) bar.style.display = 'none';
                searchQuery = '';
                renderTabContent();
            });
        }

        // 搜索输入
        var searchInput = document.getElementById('map-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                searchQuery = this.value;
                renderTabContent();
            });
        }

        // 设置按钮
        var settingsBtn = document.getElementById('map-settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', function () {
                // 切换到隐私标签
                switchTab('privacy');
            });
        }

        // 缩放按钮
        var zoomIn = document.getElementById('map-zoom-in');
        var zoomOut = document.getElementById('map-zoom-out');
        if (zoomIn) {
            zoomIn.addEventListener('click', function () {
                zoomLevel = Math.min(3, zoomLevel + 0.2);
            });
        }
        if (zoomOut) {
            zoomOut.addEventListener('click', function () {
                zoomLevel = Math.max(0.3, zoomLevel - 0.2);
            });
        }

        // 位置共享开关
        var sharingToggle = document.getElementById('map-sharing-toggle');
        if (sharingToggle) {
            sharingToggle.addEventListener('click', function () {
                var data = currentData();
                data.sharingEnabled = !data.sharingEnabled;
                var knob = document.getElementById('map-sharing-knob');
                if (data.sharingEnabled) {
                    this.style.background = '#4caf50';
                    knob.style.left = '22px';
                } else {
                    this.style.background = '#ccc';
                    knob.style.left = '2px';
                }
                saveMapData();
            });
        }

        // 定位TA按钮
        var locateTaBtn = document.getElementById('map-locate-ta');
        if (locateTaBtn) {
            locateTaBtn.addEventListener('click', function () {
                try {
                    // 查找TA当前所在地图
                    var taKey = null;
                    var taLoc = null;
                    for (var key in allMapData) {
                        var mapData = allMapData[key];
                        if (!mapData || !mapData.locations) continue;
                        for (var i = 0; i < mapData.locations.length; i++) {
                            if (mapData.locations[i].type === 'ta') {
                                taKey = key;
                                taLoc = mapData.locations[i];
                                break;
                            }
                        }
                        if (taLoc) break;
                    }
                    if (!taLoc) {
                        if (typeof showNotification === 'function') {
                            showNotification('TA的位置未找到', 'warning');
                        }
                        return;
                    }

                    // 如果TA在附地图，切换到该地图
                    if (taKey !== currentMapKey()) {
                        mapStack = ['root'];
                        if (taKey !== 'root') {
                            mapStack.push(taKey);
                        }
                        updateBreadcrumb();
                        renderTabContent();
                    }

                    // 缩放到一个合适的级别，确保TA位置清晰可见
                    zoomLevel = 1.5;
                    // 将视图居中到TA位置（使用CSS尺寸而非像素尺寸）
                    var area = document.getElementById('map-canvas-area');
                    var cw = area ? area.clientWidth : canvas.width;
                    var ch = area ? area.clientHeight : canvas.height;
                    panOffset.x = cw / 2 / zoomLevel - taLoc.x;
                    panOffset.y = ch / 2 / zoomLevel - taLoc.y;
                    // 标记已自适应，防止 render 中的 centerView 覆盖定位结果
                    hasFitView = true;

                    if (typeof showNotification === 'function') {
                        var partnerName = getPartnerName() || '梦角';
                        showNotification('已定位到 ' + partnerName + ' 的位置', 'success');
                    }
                } catch (e) {}
            });
        }

        // 工具栏按钮
        document.querySelectorAll('.map-tool-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var tool = this.getAttribute('data-tool');
                if (activeTool === tool) {
                    activeTool = null;
                    this.style.background = 'rgba(255,255,255,0.92)';
                    this.style.transform = 'scale(1)';
                    if (canvas) canvas.style.cursor = 'grab';
                    // 隐藏地形面板
                    if (tool === 'terrainedit') {
                        var panel = document.getElementById('map-terrain-panel');
                        if (panel) panel.style.display = 'none';
                        terrainEditVisible = false;
                    }
                } else {
                    // 取消之前选中的工具
                    document.querySelectorAll('.map-tool-btn').forEach(function (b) {
                        b.style.background = 'rgba(255,255,255,0.92)';
                        b.style.transform = 'scale(1)';
                    });
                    activeTool = tool;
                    this.style.background = 'rgba(var(--accent-color-rgb),0.3)';
                    this.style.transform = 'scale(1.1)';
                    if (canvas) canvas.style.cursor = 'crosshair';

                    // 显示地形编辑面板
                    if (tool === 'terrainedit') {
                        var panel = document.getElementById('map-terrain-panel');
                        if (panel) panel.style.display = 'block';
                        terrainEditVisible = true;
                        initTerrainHistory();
                    } else {
                        var panel = document.getElementById('map-terrain-panel');
                        if (panel) panel.style.display = 'none';
                        terrainEditVisible = false;
                    }

                    // 路线绘制模式
                    if (tool === 'drawroute') {
                        currentRoutePoints = [];
                        if (typeof showNotification === 'function') {
                            showNotification('点击地图添加路线节点，双击完成', 'info');
                        }
                    }

                    updateHoverHint();
                }
            });
        });

        // 地形类型选择
        document.querySelectorAll('.terrain-type-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                currentTerrainType = this.getAttribute('data-type');
                document.querySelectorAll('.terrain-type-btn').forEach(function (b) {
                    b.style.background = 'transparent';
                    b.style.border = '2px solid transparent';
                });
                this.style.background = 'rgba(126,200,80,0.2)';
                this.style.border = '2px solid ' + (TERRAIN_COLORS[currentTerrainType] ? TERRAIN_COLORS[currentTerrainType].base : '#888');
            });
        });

        // 地形擦除按钮
        var terrainDeleteBtn = document.getElementById('terrain-delete-btn');
        if (terrainDeleteBtn) {
            terrainDeleteBtn.addEventListener('click', function () {
                currentTerrainType = 'delete';
                document.querySelectorAll('.terrain-type-btn').forEach(function (b) {
                    b.style.background = 'transparent';
                    b.style.border = '2px solid transparent';
                });
                this.style.background = 'rgba(255,80,80,0.2)';
                this.style.border = '2px solid #e74c3c';
                if (typeof showNotification === 'function') {
                    showNotification('擦除模式：点击地形区域删除', 'info');
                }
            });
        }

        // 撤销/重做按钮
        var terrainUndoBtn = document.getElementById('terrain-undo-btn');
        if (terrainUndoBtn) {
            terrainUndoBtn.addEventListener('click', function () {
                undoTerrainEdit();
            });
        }
        var terrainRedoBtn = document.getElementById('terrain-redo-btn');
        if (terrainRedoBtn) {
            terrainRedoBtn.addEventListener('click', function () {
                redoTerrainEdit();
            });
        }

        // 键盘快捷键（Ctrl+Z 撤销，Ctrl+Y 恢复）
        document.addEventListener('keydown', function (e) {
            if (!isVisible || activeTool !== 'terrainedit') return;
            if (e.ctrlKey && (e.key === 'z' || e.key === 'Z')) {
                e.preventDefault();
                undoTerrainEdit();
            } else if (e.ctrlKey && (e.key === 'y' || e.key === 'Y')) {
                e.preventDefault();
                redoTerrainEdit();
            }
        });

        // 标签栏切换
        document.querySelectorAll('.map-tab-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                switchTab(this.getAttribute('data-tab'));
            });
        });

        // 窗口大小变化
        window.addEventListener('resize', function () {
            if (isVisible) resizeCanvas();
        });
    }

    // 单独绑定Canvas事件（必须在canvas元素获取后调用）
    var _canvasEventsBound = false;
    function bindCanvasEvents() {
        if (!canvas || _canvasEventsBound) return;
        _canvasEventsBound = true;
        canvas.addEventListener('mousedown', onCanvasMouseDown);
        canvas.addEventListener('mousemove', onCanvasMouseMove);
        canvas.addEventListener('mouseup', onCanvasMouseUp);
        canvas.addEventListener('dblclick', onCanvasDblClick);
        canvas.addEventListener('wheel', onCanvasWheel, { passive: false });

        // 触摸事件
        canvas.addEventListener('touchstart', onTouchStart, { passive: false });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });
        canvas.addEventListener('touchend', onTouchEnd);
    }

    function switchTab(tab) {
        currentTab = tab;
        document.querySelectorAll('.map-tab-btn').forEach(function (btn) {
            var isActive = btn.getAttribute('data-tab') === tab;
            btn.style.background = isActive ? 'rgba(var(--accent-color-rgb),0.16)' : 'transparent';
            btn.style.color = isActive ? 'var(--accent-color)' : 'var(--text-secondary)';
            btn.style.borderBottom = isActive ? '2px solid var(--accent-color)' : '2px solid transparent';
        });
        renderTabContent();
    }

    function updateHoverHint() {
        var hint = document.getElementById('map-hover-hint');
        if (!hint) return;

        var hints = {
            'mypos': '点击地图设置我的位置',
            'addplace': '点击地图添加新地点',
            'addsubmap': '在地图上拖拽创建子地图区域',
            'drawroute': '点击添加路线节点，双击完成',
            'terrainedit': '拖拽绘制地形区域'
        };

        hint.textContent = hints[activeTool] || '滚轮缩放，拖拽平移';
    }

    // ==================== Canvas 交互处理 ====================
    function onCanvasMouseDown(e) {
        var pos = screenToCanvas(e.clientX, e.clientY);

        // 检查是否点击了我的位置（拖拽）
        var data = currentData();
        if (data.myPosition && distance(pos.x, pos.y, data.myPosition.x, data.myPosition.y) < AVATAR_RADIUS + 5) {
            isDraggingMyPos = true;
            canvas.style.cursor = 'grabbing';
            startDocumentDrag();
            return;
        }

        // 工具处理
        if (activeTool === 'mypos') {
            updateMyPosition(data, pos.x, pos.y);
            addFootprint('me', data.myPosition.x, data.myPosition.y);
            saveMapData();
            return;
        }

        if (activeTool === 'addplace') {
            showAddPlaceDialog(pos.x, pos.y);
            return;
        }

        if (activeTool === 'addsubmap') {
            isDraggingTerrain = true;
            terrainDragStart = { x: pos.x, y: pos.y };
            terrainDragCurrent = { x: pos.x, y: pos.y };
            startDocumentDrag();
            return;
        }

        if (activeTool === 'drawroute') {
            currentRoutePoints.push({ x: pos.x, y: pos.y });
            return;
        }

        if (activeTool === 'terrainedit') {
            // 检查是否点击了已有地形（删除模式）
            if (currentTerrainType === 'delete') {
                deleteTerrainAt(pos.x, pos.y);
                return;
            }
            isDraggingTerrain = true;
            terrainDragStart = { x: pos.x, y: pos.y };
            terrainDragCurrent = { x: pos.x, y: pos.y };
            startDocumentDrag();
            return;
        }

        // 检查是否点击了地点（进入附地图或创建附地图）
        if (data.locations && !activeTool) {
            for (var i = 0; i < data.locations.length; i++) {
                var loc = data.locations[i];
                if (distance(pos.x, pos.y, loc.x, loc.y) < 20) {
                    if (loc.hasSubmap && loc.submapId) {
                        // 已有附地图，直接进入
                        if (!allMapData[loc.submapId]) {
                            allMapData[loc.submapId] = createDefaultMapData(loc.submapId);
                        }
                        mapStack.push(loc.submapId);
                        hasFitView = false;
                        updateBreadcrumb();
                        saveMapData();
                        return;
                    } else if (loc.type !== 'ta') {
                        // 没有附地图且不是TA位置，弹出创建对话框
                        showCreateSubmapDialog(loc);
                        return;
                    }
                }
            }
        }

        // 检查是否点击了子地图区域（进入）
        if (data.submaps) {
            for (var i = 0; i < data.submaps.length; i++) {
                var sm = data.submaps[i];
                if (pos.x >= sm.x && pos.x <= sm.x + sm.w && pos.y >= sm.y && pos.y <= sm.y + sm.h) {
                    if (!allMapData[sm.key]) {
                        allMapData[sm.key] = createDefaultMapData(sm.key);
                    }
                    mapStack.push(sm.key);
                    hasFitView = false; // 重置自适应
                    updateBreadcrumb();
                    saveMapData();
                    return;
                }
            }
        }

        // 默认：平移
        isPanning = true;
        panStart = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
        canvas.style.cursor = 'grabbing';
        startDocumentDrag();
    }

    function onCanvasMouseMove(e) {
        var pos = screenToCanvas(e.clientX, e.clientY);

        // 拖拽我的位置
        if (isDraggingMyPos) {
            var data = currentData();
            updateMyPosition(data, pos.x, pos.y);
            return;
        }

        // 地形拖拽预览
        if (isDraggingTerrain) {
            terrainDragCurrent = { x: pos.x, y: pos.y };
            return;
        }

        // 平移
        if (isPanning) {
            panOffset.x = e.clientX - panStart.x;
            panOffset.y = e.clientY - panStart.y;
            return;
        }

        // 悬浮提示
        var data = currentData();
        var hint = document.getElementById('map-hover-hint');
        if (hint && !activeTool) {
            var found = false;
            // 检查地点
            if (data.locations) {
                for (var i = 0; i < data.locations.length; i++) {
                    var loc = data.locations[i];
                    if (distance(pos.x, pos.y, loc.x, loc.y) < 20) {
                        hint.textContent = loc.name;
                        found = true;
                        break;
                    }
                }
            }
            // 检查子地图
            if (!found && data.submaps) {
                for (var i = 0; i < data.submaps.length; i++) {
                    var sm = data.submaps[i];
                    if (pos.x >= sm.x && pos.x <= sm.x + sm.w && pos.y >= sm.y && pos.y <= sm.y + sm.h) {
                        hint.textContent = sm.name + '（点击进入）';
                        found = true;
                        break;
                    }
                }
            }
            if (!found) {
                hint.textContent = '滚轮缩放，拖拽平移';
            }
        }
    }

    function onCanvasMouseUp(e) {
        // 拖拽我的位置结束
        if (isDraggingMyPos) {
            isDraggingMyPos = false;
            canvas.style.cursor = activeTool ? 'crosshair' : 'grab';
            var data = currentData();
            addFootprint('me', data.myPosition.x, data.myPosition.y);
            saveMapData();
            return;
        }

        // 地形拖拽结束
        if (isDraggingTerrain && terrainDragStart && terrainDragCurrent) {
            var x = Math.min(terrainDragStart.x, terrainDragCurrent.x);
            var y = Math.min(terrainDragStart.y, terrainDragCurrent.y);
            var w = Math.abs(terrainDragCurrent.x - terrainDragStart.x);
            var h = Math.abs(terrainDragCurrent.y - terrainDragStart.y);

            if (w > 5 && h > 5) {
                var data = currentData();

                if (activeTool === 'addsubmap') {
                    // 创建子地图
                    var submapName = '子地图 ' + (data.submaps.length + 1);
                    var submapKey = 'submap_' + Date.now();
                    data.submaps.push({
                        key: submapKey,
                        name: submapName,
                        x: Math.round(x),
                        y: Math.round(y),
                        w: Math.round(w),
                        h: Math.round(h)
                    });
                    allMapData[submapKey] = createDefaultMapData(submapKey);
                    if (typeof showNotification === 'function') {
                        showNotification('子地图 "' + submapName + '" 已创建', 'success');
                    }
                } else if (activeTool === 'terrainedit' && currentTerrainType !== 'delete') {
                    // 添加地形
                    if (!data.terrain) data.terrain = [];
                    data.terrain.push({
                        type: currentTerrainType,
                        x: Math.round(x),
                        y: Math.round(y),
                        w: Math.round(w),
                        h: Math.round(h)
                    });
                    // 操作后保存历史
                    pushTerrainHistory();
                }

                saveMapData();
            }

            isDraggingTerrain = false;
            terrainDragStart = null;
            terrainDragCurrent = null;
            return;
        }

        // 平移结束
        if (isPanning) {
            isPanning = false;
            canvas.style.cursor = activeTool ? 'crosshair' : 'grab';
        }
    }

    function onCanvasDblClick(e) {
        if (activeTool === 'drawroute' && currentRoutePoints.length >= 2) {
            var data = currentData();
            if (!data.routes) data.routes = [];
            data.routes.push({
                id: generateId(),
                name: '路线 ' + (data.routes.length + 1),
                points: currentRoutePoints.slice(),
                color: currentRouteColor
            });
            currentRoutePoints = [];
            saveMapData();
            renderTabContent();
            if (typeof showNotification === 'function') {
                showNotification('路线已保存', 'success');
            }
        }
    }

    function onCanvasWheel(e) {
        e.preventDefault();
        var delta = e.deltaY > 0 ? -0.1 : 0.1;
        zoomLevel = clamp(zoomLevel + delta, 0.3, 3);
    }

    // 触摸事件处理
    function onTouchStart(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            var touch = e.touches[0];
            onCanvasMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
        }
    }

    function onTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            var touch = e.touches[0];
            onCanvasMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
        }
    }

    function onTouchEnd(e) {
        onCanvasMouseUp({});
    }

    // ==================== 辅助操作 ====================
    function showAddPlaceDialog(x, y) {
        var dialog = document.createElement('div');
        dialog.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;animation:fadeIn 0.2s ease;';

        var catOptions = '';
        for (var i = 0; i < LOCATION_CATEGORIES.length; i++) {
            var cat = LOCATION_CATEGORIES[i];
            catOptions += '<option value="' + cat.id + '">' + cat.name + '</option>';
        }

        dialog.innerHTML = ''
            + '<div style="background:var(--secondary-bg);border-radius:var(--radius);padding:24px;width:85%;max-width:320px;box-shadow:0 20px 60px rgba(0,0,0,0.3);animation:modalContentSlideIn 0.3s ease;">'
            +   '<div style="font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:16px;">添加地点</div>'
            +   '<div style="margin-bottom:12px;">'
            +     '<label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">地点名称</label>'
            +     '<input id="map-new-place-name" type="text" placeholder="输入地点名称" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius-xs);font-size:14px;color:var(--text-primary);background:var(--primary-bg);outline:none;font-family:var(--font-family);" />'
            +   '</div>'
            +   '<div style="margin-bottom:16px;">'
            +     '<label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">分类</label>'
            +     '<select id="map-new-place-cat" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius-xs);font-size:14px;color:var(--text-primary);background:var(--primary-bg);outline:none;font-family:var(--font-family);">' + catOptions + '</select>'
            +   '</div>'
            +   '<div style="display:flex;gap:10px;">'
            +     '<button id="map-place-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:var(--radius-xs);background:var(--primary-bg);color:var(--text-primary);font-size:14px;cursor:pointer;font-family:var(--font-family);">取消</button>'
            +     '<button id="map-place-confirm" style="flex:1;padding:10px;border:none;border-radius:var(--radius-xs);background:var(--accent-color);color:#fff;font-size:14px;cursor:pointer;font-family:var(--font-family);">添加</button>'
            +   '</div>'
            + '</div>';

        document.body.appendChild(dialog);

        dialog.addEventListener('click', function (e) {
            if (e.target === dialog) dialog.remove();
        });

        document.getElementById('map-place-cancel').addEventListener('click', function () {
            dialog.remove();
        });

        document.getElementById('map-place-confirm').addEventListener('click', function () {
            var name = document.getElementById('map-new-place-name').value.trim();
            var cat = document.getElementById('map-new-place-cat').value;
            if (!name) {
                if (typeof showNotification === 'function') {
                    showNotification('请输入地点名称', 'warning');
                }
                return;
            }
            var data = currentData();
            data.locations.push({
                id: generateId(),
                name: name,
                x: Math.round(x),
                y: Math.round(y),
                category: cat,
                shared: false
            });
            saveMapData();
            renderTabContent();
            dialog.remove();
            if (typeof showNotification === 'function') {
                showNotification('地点 "' + name + '" 已添加', 'success');
            }
        });

        document.getElementById('map-new-place-name').focus();
    }

    // 编辑地点信息的对话框
    function showEditPlaceDialog(loc) {
        var dialog = document.createElement('div');
        dialog.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;animation:fadeIn 0.2s ease;';

        var catOptions = '';
        for (var i = 0; i < LOCATION_CATEGORIES.length; i++) {
            var cat = LOCATION_CATEGORIES[i];
            var selected = (loc.category === cat.id || (!loc.category && cat.id === 'place')) ? ' selected' : '';
            catOptions += '<option value="' + cat.id + '"' + selected + '>' + cat.name + '</option>';
        }

        var submapSection = '';
        if (loc.hasSubmap && loc.submapId) {
            var submapData = allMapData[loc.submapId];
            var submapName = submapData && submapData.name ? submapData.name : '附地图';
            submapSection = '<div style="margin-bottom:16px;padding:12px;background:rgba(155,89,182,0.08);border-radius:var(--radius-xs);">'
                + '<div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;">附地图信息</div>'
                + '<div style="display:flex;gap:8px;align-items:center;">'
                +   '<input id="map-edit-submap-name" type="text" value="' + escapeHtml(submapName) + '" placeholder="附地图名称" style="flex:1;padding:8px 10px;border:1px solid var(--border-color);border-radius:var(--radius-xs);font-size:13px;color:var(--text-primary);background:var(--primary-bg);outline:none;font-family:var(--font-family);" />'
                +   '<button id="map-edit-enter-submap" style="padding:8px 12px;border:none;border-radius:var(--radius-xs);background:#9b59b6;color:#fff;font-size:12px;cursor:pointer;font-family:var(--font-family);white-space:nowrap;">进入</button>'
                + '</div>'
                + '</div>';
        }

        dialog.innerHTML = ''
            + '<div style="background:var(--secondary-bg);border-radius:var(--radius);padding:24px;width:85%;max-width:340px;box-shadow:0 20px 60px rgba(0,0,0,0.3);animation:modalContentSlideIn 0.3s ease;">'
            +   '<div style="font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:16px;">编辑地点</div>'
            +   '<div style="margin-bottom:12px;">'
            +     '<label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">地点名称</label>'
            +     '<input id="map-edit-place-name" type="text" value="' + escapeHtml(loc.name) + '" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius-xs);font-size:14px;color:var(--text-primary);background:var(--primary-bg);outline:none;font-family:var(--font-family);" />'
            +   '</div>'
            +   '<div style="margin-bottom:12px;">'
            +     '<label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">分类</label>'
            +     '<select id="map-edit-place-cat" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius-xs);font-size:14px;color:var(--text-primary);background:var(--primary-bg);outline:none;font-family:var(--font-family);">' + catOptions + '</select>'
            +   '</div>'
            +   '<div style="margin-bottom:16px;">'
            +     '<label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">坐标</label>'
            +     '<div style="display:flex;gap:6px;">'
            +       '<input id="map-edit-place-x" type="number" value="' + loc.x + '" placeholder="X" style="width:0;padding:8px 6px;border:1px solid var(--border-color);border-radius:var(--radius-xs);font-size:13px;color:var(--text-primary);background:var(--primary-bg);outline:none;font-family:var(--font-family);flex:1;min-width:0;" />'
            +       '<input id="map-edit-place-y" type="number" value="' + loc.y + '" placeholder="Y" style="width:0;padding:8px 6px;border:1px solid var(--border-color);border-radius:var(--radius-xs);font-size:13px;color:var(--text-primary);background:var(--primary-bg);outline:none;font-family:var(--font-family);flex:1;min-width:0;" />'
            +     '</div>'
            +   '</div>'
            +   submapSection
            +   '<div style="display:flex;gap:10px;">'
            +     '<button id="map-edit-place-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:var(--radius-xs);background:var(--primary-bg);color:var(--text-primary);font-size:14px;cursor:pointer;font-family:var(--font-family);">取消</button>'
            +     '<button id="map-edit-place-confirm" style="flex:1;padding:10px;border:none;border-radius:var(--radius-xs);background:var(--accent-color);color:#fff;font-size:14px;cursor:pointer;font-family:var(--font-family);">保存</button>'
            +   '</div>'
            + '</div>';

        document.body.appendChild(dialog);

        dialog.addEventListener('click', function (e) {
            if (e.target === dialog) dialog.remove();
        });

        document.getElementById('map-edit-place-cancel').addEventListener('click', function () {
            dialog.remove();
        });

        document.getElementById('map-edit-place-confirm').addEventListener('click', function () {
            var name = document.getElementById('map-edit-place-name').value.trim();
            var cat = document.getElementById('map-edit-place-cat').value;
            var x = parseInt(document.getElementById('map-edit-place-x').value, 10);
            var y = parseInt(document.getElementById('map-edit-place-y').value, 10);
            if (!name) {
                if (typeof showNotification === 'function') {
                    showNotification('请输入地点名称', 'warning');
                }
                return;
            }
            loc.name = name;
            loc.category = cat;
            loc.x = isNaN(x) ? loc.x : x;
            loc.y = isNaN(y) ? loc.y : y;

            // 同步更新附地图名称
            if (loc.hasSubmap && loc.submapId) {
                var submapNameInput = document.getElementById('map-edit-submap-name');
                if (submapNameInput) {
                    var newSubmapName = submapNameInput.value.trim();
                    if (newSubmapName && allMapData[loc.submapId]) {
                        allMapData[loc.submapId].name = newSubmapName;
                    }
                }
            }

            // 同步更新 myPosition（如果是"我的位置"）
            if (loc.type === 'me') {
                updateMyPosition(currentData(), loc.x, loc.y);
            }

            saveMapData();
            renderTabContent();
            dialog.remove();
            if (typeof showNotification === 'function') {
                showNotification('地点信息已更新', 'success');
            }
        });

        // 进入附地图
        var enterSubmapBtn = document.getElementById('map-edit-enter-submap');
        if (enterSubmapBtn) {
            enterSubmapBtn.addEventListener('click', function () {
                dialog.remove();
                if (!allMapData[loc.submapId]) {
                    allMapData[loc.submapId] = createDefaultMapData(loc.submapId);
                }
                mapStack.push(loc.submapId);
                hasFitView = false;
                updateBreadcrumb();
                saveMapData();
            });
        }

        document.getElementById('map-edit-place-name').focus();
    }

    // 为地点创建附地图的对话框
    function showCreateSubmapDialog(loc) {
        var dialog = document.createElement('div');
        dialog.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;animation:fadeIn 0.2s ease;';

        dialog.innerHTML = ''
            + '<div style="background:var(--secondary-bg);border-radius:var(--radius);padding:24px;width:85%;max-width:320px;box-shadow:0 20px 60px rgba(0,0,0,0.3);animation:modalContentSlideIn 0.3s ease;">'
            +   '<div style="font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:12px;">创建附地图</div>'
            +   '<div style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">为地点 <strong style="color:var(--accent-color);">' + escapeHtml(loc.name) + '</strong> 创建内部地图</div>'
            +   '<div style="margin-bottom:16px;">'
            +     '<label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">附地图名称</label>'
            +     '<input id="map-new-submap-name" type="text" value="' + escapeHtml(loc.name + ' 内部') + '" placeholder="输入附地图名称" style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:var(--radius-xs);font-size:14px;color:var(--text-primary);background:var(--primary-bg);outline:none;font-family:var(--font-family);" />'
            +   '</div>'
            +   '<div style="display:flex;gap:10px;">'
            +     '<button id="map-submap-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:var(--radius-xs);background:var(--primary-bg);color:var(--text-primary);font-size:14px;cursor:pointer;font-family:var(--font-family);">取消</button>'
            +     '<button id="map-submap-confirm" style="flex:1;padding:10px;border:none;border-radius:var(--radius-xs);background:var(--accent-color);color:#fff;font-size:14px;cursor:pointer;font-family:var(--font-family);">创建</button>'
            +   '</div>'
            + '</div>';

        document.body.appendChild(dialog);

        dialog.addEventListener('click', function (e) {
            if (e.target === dialog) dialog.remove();
        });

        document.getElementById('map-submap-cancel').addEventListener('click', function () {
            dialog.remove();
        });

        document.getElementById('map-submap-confirm').addEventListener('click', function () {
            var submapName = document.getElementById('map-new-submap-name').value.trim();
            if (!submapName) {
                if (typeof showNotification === 'function') {
                    showNotification('请输入附地图名称', 'warning');
                }
                return;
            }
            var submapId = 'submap_' + loc.id + '_' + Date.now();
            loc.hasSubmap = true;
            loc.submapId = submapId;
            if (!allMapData[submapId]) {
                allMapData[submapId] = createDefaultMapData(submapId);
            }
            allMapData[submapId].name = submapName;
            mapStack.push(submapId);
            hasFitView = false;
            updateBreadcrumb();
            saveMapData();
            dialog.remove();
            if (typeof showNotification === 'function') {
                showNotification('已为 "' + loc.name + '" 创建附地图 "' + submapName + '"', 'success');
            }
        });

        document.getElementById('map-new-submap-name').focus();
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function deleteTerrainAt(x, y) {
        var data = currentData();
        if (!data.terrain) return;

        for (var i = data.terrain.length - 1; i >= 0; i--) {
            var t = data.terrain[i];
            if (x >= t.x && x <= t.x + (t.w || PIXEL_SIZE) && y >= t.y && y <= t.y + (t.h || PIXEL_SIZE)) {
                data.terrain.splice(i, 1);
                // 操作后保存历史
                pushTerrainHistory();
                saveMapData();
                if (typeof showNotification === 'function') {
                    showNotification('地形已删除', 'info');
                }
                return;
            }
        }
    }

    function addFootprint(type, x, y) {
        footprints.push({
            type: type,
            x: x,
            y: y,
            time: Date.now(),
            mapKey: currentMapKey()
        });
        // 限制足迹数量
        if (footprints.length > 500) {
            footprints = footprints.slice(-300);
        }
    }

    // ==================== 初始化摸鱼同步监听 ====================
    function initMoyuSync() {
        // 定期检查摸鱼数据变化
        var lastMoyuLocation = '';

        setInterval(function () {
            try {
                var locName = '';
                if (typeof currentMoyuRecord !== 'undefined' && currentMoyuRecord && currentMoyuRecord.location) {
                    locName = currentMoyuRecord.location;
                } else if (typeof moyuWorkSession !== 'undefined' && moyuWorkSession && moyuWorkSession.location) {
                    locName = moyuWorkSession.location;
                }

                if (locName && locName !== lastMoyuLocation) {
                    lastMoyuLocation = locName;
                    syncMoyuLocation(locName);
                }
            } catch (e) {
                // 忽略错误
            }
        }, 3000);
    }

    // ==================== 公开 API ====================
    function init() {
        buildOverlay();
        bindEvents();
        initMoyuSync();
        // Canvas 在 show() 时才获取，所以 Canvas 事件在 show() 中绑定

        // 启动TA位置自动移动（后台运行，不随地图关闭停止）
        // 每次移动后使用随机间隔重新设置定时器
        scheduleNextTaMove();
    }

    /**
     * 安排下一次TA移动（使用随机时间间隔）
     */
    function scheduleNextTaMove() {
        if (_taMoveTimer) clearTimeout(_taMoveTimer);
        var nextInterval = getNextMoveInterval();
        _taMoveTimer = setTimeout(function () {
            moveTaLocationRandomly();
            // 移动完成后，再次安排下一次移动
            scheduleNextTaMove();
        }, nextInterval);
    }

    function show() {
        if (!overlay) init();

        // 加载头像
        loadAvatars();

        loadMapData().then(function () {
            // 确保当前地图有数据（创建默认数据）
            currentData();

            // 同步摸鱼位置
            try {
                var locName = '';
                if (typeof currentMoyuRecord !== 'undefined' && currentMoyuRecord && currentMoyuRecord.location) {
                    locName = currentMoyuRecord.location;
                } else if (typeof moyuWorkSession !== 'undefined' && moyuWorkSession && moyuWorkSession.location) {
                    locName = moyuWorkSession.location;
                }
                if (locName) {
                    syncMoyuLocation(locName);
                }
            } catch (e) {
                // 忽略
            }

            // 先显示 overlay，让容器能计算尺寸
            overlay.style.display = 'flex';
            isVisible = true;

            // 初始化Canvas（必须在 overlay 显示后，否则 clientWidth/Height 为 0）
            canvas = document.getElementById('map-canvas');
            if (canvas) {
                ctx = canvas.getContext('2d');
                resizeCanvas();
                // 绑定Canvas事件（必须在canvas获取后）
                bindCanvasEvents();
            }

            // 更新UI状态
            updateBreadcrumb();
            updateSharingToggle();
            switchTab('locations');
            updateHoverHint();

            // 启动渲染循环
            if (animFrameId) cancelAnimationFrame(animFrameId);
            animFrameId = requestAnimationFrame(render);

            // 定时检查头像更新（每3秒）
            if (_avatarCheckTimer) clearInterval(_avatarCheckTimer);
            _avatarCheckTimer = setInterval(function () {
                if (!isVisible) { clearInterval(_avatarCheckTimer); return; }
                loadAvatars();
            }, 3000);
        }).catch(function (err) {
            console.error('[MapApp] loadMapData failed:', err);
            // 即使加载失败，也显示地图（使用默认数据）
            overlay.style.display = 'flex';
            isVisible = true;
            canvas = document.getElementById('map-canvas');
            if (canvas) {
                ctx = canvas.getContext('2d');
                resizeCanvas();
                bindCanvasEvents();
            }
            updateBreadcrumb();
            switchTab('locations');
            if (animFrameId) cancelAnimationFrame(animFrameId);
            animFrameId = requestAnimationFrame(render);
        });
    }

    var _avatarCheckTimer = null;
    var _taMoveTimer = null;

    function getNextMoveInterval() {
        var MIN_MS = 30 * 60 * 1000;        // 30分钟
        var MAX_MS = 12 * 60 * 60 * 1000;   // 12小时
        return MIN_MS + Math.random() * (MAX_MS - MIN_MS);
    }

    // 自动随机移动TA位置
    function moveTaLocationRandomly() {
        try {
            console.log('[MapApp] moveTaLocationRandomly called');
            // 收集所有地图中可移动的目标地点
            var targets = [];
            for (var key in allMapData) {
                var mapData = allMapData[key];
                if (!mapData || !mapData.locations) continue;
                for (var i = 0; i < mapData.locations.length; i++) {
                    var loc = mapData.locations[i];
                    // 排除 me/ta 自身，只选普通地点
                    if (loc.type !== 'me' && loc.type !== 'ta') {
                        targets.push({
                            name: loc.name,
                            x: loc.x,
                            y: loc.y,
                            mapKey: key
                        });
                    }
                }
            }
            if (targets.length === 0) { console.log('[MapApp] no targets'); return; }

            // 随机选择一个目标
            var target = targets[Math.floor(Math.random() * targets.length)];
            console.log('[MapApp] target:', target.name, 'at', target.mapKey);

            // 找到当前包含TA位置的地图
            var sourceKey = null;
            var sourceData = null;
            var taLoc = null;
            for (var k in allMapData) {
                var mapData = allMapData[k];
                if (!mapData || !mapData.locations) continue;
                for (var i = 0; i < mapData.locations.length; i++) {
                    if (mapData.locations[i].type === 'ta') {
                        sourceKey = k;
                        sourceData = mapData;
                        taLoc = mapData.locations[i];
                        break;
                    }
                }
                if (taLoc) break;
            }
            if (!taLoc || !sourceData) { console.log('[MapApp] ta not found'); return; }
            console.log('[MapApp] ta currently at', sourceKey, taLoc.x, taLoc.y);

            // 目标地图数据
            var targetData = allMapData[target.mapKey];
            if (!targetData || !targetData.locations) { console.log('[MapApp] target data missing'); return; }

            // 从源地图移除TA
            sourceData.locations = sourceData.locations.filter(function (l) { return l.type !== 'ta'; });

            // 在目标地图添加TA（复制到目标地点坐标）
            var newTaLoc = {
                id: taLoc.id,
                x: target.x,
                y: target.y,
                name: taLoc.name,
                type: 'ta',
                icon: taLoc.icon,
                color: taLoc.color,
                hasSubmap: false
            };
            targetData.locations.push(newTaLoc);
            console.log('[MapApp] ta moved to', target.mapKey, target.x, target.y);

            // 记录TA当前所在地图（用于定位功能）
            _taCurrentMapKey = target.mapKey;
            _taCurrentLocationName = target.name;

            // 记录移动路程
            footprints.push({
                type: 'ta',
                x: target.x,
                y: target.y,
                locationName: target.name,
                mapKey: target.mapKey,
                time: Date.now()
            });
            // 限制路程记录数量
            if (footprints.length > 500) {
                footprints = footprints.slice(-300);
            }

            saveMapData();

            // 如果用户当前正在查看目标地图，更新视图
            if (currentMapKey() === target.mapKey) {
                updateBreadcrumb();
                renderTabContent();
            }

            // 弹出全局消息卡片通知
            var partnerName = getPartnerName() || '梦角';
            showTaMoveNotification(partnerName, target.name);
        } catch (e) {
            console.error('[MapApp] moveTaLocationRandomly error:', e);
        }
    }

    // 显示TA移动的全局消息卡片通知
    function showTaMoveNotification(partnerName, locationName) {
        try {
            // 移除已有的TA移动通知
            var existing = document.getElementById('map-ta-move-notification');
            if (existing) existing.remove();

            // 获取梦角头像
            var avatarUrl = _taAvatarImg ? _taAvatarImg.src : '';
            if (!avatarUrl && typeof window.homeGetGlobal === 'function') {
                avatarUrl = window.homeGetGlobal('home_avatar_partner') || '';
            }

            var now = new Date();
            var timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

            var card = document.createElement('div');
            card.id = 'map-ta-move-notification';
            card.style.cssText = 'position:fixed;top:76px;left:50%;transform:translateX(-50%) translateY(-20px);z-index:10002;background:var(--secondary-bg);color:var(--text-primary);border-radius:50px;padding:10px 18px 10px 14px;box-shadow:0 6px 24px rgba(0,0,0,0.13),0 1px 4px rgba(0,0,0,0.07);border:1px solid var(--border-color);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);display:flex;align-items:center;gap:8px;max-width:min(320px,88vw);font-size:13.5px;line-height:1.4;letter-spacing:0.2px;opacity:0;animation:taNotifySlideIn 0.38s cubic-bezier(0.25,0.46,0.45,0.94) forwards;font-family:var(--font-family);';

            var avatarHtml = avatarUrl
                ? '<img src="' + avatarUrl + '" style="width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;">'
                : '<div style="width:32px;height:32px;border-radius:50%;background:#c5a47e22;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fas fa-heart" style="color:#c5a47e;font-size:12px;"></i></div>';

            card.innerHTML = ''
                + avatarHtml
                + '<div style="flex:1;min-width:0;">'
                +   '<div style="display:flex;justify-content:space-between;align-items:center;">'
                +     '<span style="font-size:13.5px;color:var(--text-primary);">' + escapeHtml(partnerName) + ' 到达了 ' + escapeHtml(locationName) + '</span>'
                +     '<span style="font-size:11px;color:var(--text-secondary);flex-shrink:0;margin-left:8px;">' + timeStr + '</span>'
                +   '</div>'
                + '</div>';

            document.body.appendChild(card);

            // 5秒后自动消失
            setTimeout(function () {
                card.style.animation = 'taNotifySlideOut 0.4s ease-in forwards';
                card.addEventListener('animationend', function () {
                    if (card.parentNode) card.remove();
                });
            }, 5000);
        } catch (e) {}
    }

    // TA当前所在地图和地点（用于定位）
    var _taCurrentMapKey = null;
    var _taCurrentLocationName = null;

    function hide() {
        isVisible = false;

        // 清理 document 级别拖拽事件
        stopDocumentDrag();

        // 清理头像检查定时器
        if (_avatarCheckTimer) { clearInterval(_avatarCheckTimer); _avatarCheckTimer = null; }

        // TA移动定时器不在hide时清理，保持后台运行

        // 保存数据
        saveMapData();

        // 停止动画
        if (animFrameId) {
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
        }

        // 隐藏
        if (overlay) {
            overlay.style.display = 'none';
        }

        // 重置工具状态
        activeTool = null;
        isDraggingMyPos = false;
        isDraggingTerrain = false;
        isPanning = false;
        currentRoutePoints = [];
        searchQuery = '';

        // 隐藏搜索栏
        var searchBar = document.getElementById('map-search-bar');
        if (searchBar) searchBar.style.display = 'none';

        // 隐藏地形面板
        var terrainPanel = document.getElementById('map-terrain-panel');
        if (terrainPanel) terrainPanel.style.display = 'none';
    }

    function updateSharingToggle() {
        var data = currentData();
        var toggle = document.getElementById('map-sharing-toggle');
        var knob = document.getElementById('map-sharing-knob');
        if (toggle && knob) {
            if (data.sharingEnabled) {
                toggle.style.background = '#4caf50';
                knob.style.left = '22px';
            } else {
                toggle.style.background = '#ccc';
                knob.style.left = '2px';
            }
        }
    }

    // ==================== 导出到 window ====================
    window.MapApp = {
        show: show,
        hide: hide,
        init: init,
        syncMoyuLocation: syncMoyuLocation
    };

})();
