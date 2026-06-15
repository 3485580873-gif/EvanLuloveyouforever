/**
 * 朋友圈模块 - Moments Module
 * 与 Home 页头像同步
 */
(function() {
  'use strict';

  // ========== User Config (从 Home 页同步头像) ==========
  const userConfig = {
    name: '我',
    signature: '生活不止眼前的代码',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me&backgroundColor=b6e3f4',
    coverImage: 'https://picsum.photos/seed/cover123/800/400'
  };

  // ========== 读取表情包库（与自定义回复库同步） ==========
  async function getStickerLibrary() {
    // 优先从 window 全局变量读取（core.js 初始化时设置）
    if (typeof window !== 'undefined' && window._stickerLibrary && Array.isArray(window._stickerLibrary) && window._stickerLibrary.length > 0) {
      return window._stickerLibrary.filter(Boolean);
    }
    // 回退到全局 stickerLibrary 变量
    if (typeof stickerLibrary !== 'undefined' && Array.isArray(stickerLibrary) && stickerLibrary.length > 0) {
      return stickerLibrary.filter(Boolean);
    }
    // 如果都为空，尝试从 localforage 读取（兜底）
    if (typeof localforage !== 'undefined') {
      try {
        const saved = await localforage.getItem('stickerLibrary');
        if (saved && Array.isArray(saved) && saved.length > 0) {
          // 同步到 window，避免下次再读 localforage
          window._stickerLibrary = saved;
          return saved.filter(Boolean);
        }
      } catch(e) {}
    }
    return [];
  }

  // ========== 从 Home 页同步头像 ==========
  async function syncAvatarFromHome() {
    let avatarUrl = null;
    let userName = null;
    let userSignature = null;

    // 优先从 localStorage 读取（Home 页的 homeSetGlobal 同步写入 localStorage，
    // 而 localforage 是异步的，可能存在竞态条件，所以 localStorage 更可靠）
    const lsAvatar = localStorage.getItem('home_avatar_me');
    if (lsAvatar) avatarUrl = lsAvatar;
    const lsProfile = localStorage.getItem('profile_me');
    if (lsProfile) {
      try {
        const profile = JSON.parse(lsProfile);
        if (!userName) userName = profile.name || null;
        if (!userSignature) userSignature = profile.signature || null;
      } catch(e) {}
    }

    // 从 Home 页全局存储读取个人资料（homeGetGlobal 也读 localStorage）
    if (typeof homeGetGlobal === 'function') {
      if (!avatarUrl) avatarUrl = homeGetGlobal('home_avatar_me');
      if (!userName || !userSignature) {
        const profileStr = homeGetGlobal('profile_me');
        if (profileStr) {
          try {
            const profile = JSON.parse(profileStr);
            if (!userName) userName = profile.name || null;
            if (!userSignature) userSignature = profile.signature || null;
          } catch(e) {}
        }
      }
    }

    // 最后从 localforage 读取（作为兜底）
    if (typeof localforage !== 'undefined') {
      try {
        if (!avatarUrl) {
          var lfAvatar = await localforage.getItem('home_avatar_me');
          if (lfAvatar) avatarUrl = lfAvatar;
        }
        if (!userName || !userSignature) {
          var lfProfile = await localforage.getItem('profile_me');
          if (lfProfile) {
            var profile = JSON.parse(lfProfile);
            if (!userName) userName = profile.name || null;
            if (!userSignature) userSignature = profile.signature || null;
          }
        }
      } catch(e) {}
    }

    // 更新用户配置 - 与 Home 页保持同步
    // 只有当获取到新值时才更新，否则保持现有值（避免覆盖个性化设置）
    if (avatarUrl) {
      userConfig.avatar = avatarUrl;
    }
    if (userName) {
      userConfig.name = userName;
    }
    if (userSignature) {
      userConfig.signature = userSignature.replace(/^["']|["']$/g, '');
    }

    return { avatar: userConfig.avatar, name: userConfig.name, signature: userConfig.signature };
  }

  // ========== Sample Data (从 localStorage 恢复，或初始化为空) ==========
  const momentsData = [];
  // ========== moments_data 用 IndexedDB 持久化（避免 localStorage 5MB 限制）==========
  const MOMENTS_DB_NAME = 'MomentsDataDB';
  const MOMENTS_DB_STORE = 'moments';
  const MOMENTS_DB_KEY = 'moments_data';

  function openMomentsDataDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(MOMENTS_DB_NAME, 1);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(MOMENTS_DB_STORE)) {
          db.createObjectStore(MOMENTS_DB_STORE);
        }
      };
      req.onsuccess = e => resolve(e.target.result);
      req.onerror = e => reject(e);
    });
  }

  function saveMomentsToIDB(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await openMomentsDataDB();
        const tx = db.transaction(MOMENTS_DB_STORE, 'readwrite');
        tx.objectStore(MOMENTS_DB_STORE).put(JSON.stringify(data), MOMENTS_DB_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      } catch(e) { reject(e); }
    });
  }

  function loadMomentsFromIDB() {
    return new Promise(async (resolve) => {
      try {
        const db = await openMomentsDataDB();
        const tx = db.transaction(MOMENTS_DB_STORE, 'readonly');
        const req = tx.objectStore(MOMENTS_DB_STORE).get(MOMENTS_DB_KEY);
        req.onsuccess = () => {
          try {
            const parsed = JSON.parse(req.result || 'null');
            resolve(Array.isArray(parsed) ? parsed : null);
          } catch(e) { resolve(null); }
        };
        req.onerror = () => resolve(null);
      } catch(e) { resolve(null); }
    });
  }

  (async function loadMomentsFromStorage() {
    // 优先从 IndexedDB 读取
    let parsed = await loadMomentsFromIDB();
    if (parsed) {
      parsed.forEach(m => momentsData.push(m));
    } else {
      // 降级：从 localStorage 读取（兼容旧数据）
      try {
        const saved = localStorage.getItem('moments_data');
        if (saved) {
          parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            parsed.forEach(m => momentsData.push(m));
            // 读到旧数据后，写入 IndexedDB，然后清除 localStorage
            await saveMomentsToIDB(momentsData);
            try { localStorage.removeItem('moments_data'); } catch(e) {}
          }
        }
      } catch(e) {}
    }

    // 数据加载完成后，触发 TA的手机 历史扫描
    setTimeout(() => {
      if (typeof window.TaPhoneApp === 'object' && typeof window.TaPhoneApp.init === 'function') {
        window.TaPhoneApp.init();
      }
    }, 100);
  })();

  // ========== 大文件存储（IndexedDB）- 视频 + 图片 ==========
  // 图片压缩阈值：超过此大小的 base64 存入 IndexedDB
  const IDB_IMAGE_THRESHOLD = 50000; // ~50KB 的 base64 约 37KB 原始数据
  const COMPRESS_MAX_WIDTH = 1200; // 压缩后最大宽度
  const COMPRESS_QUALITY = 0.7; // JPEG 压缩质量

  function openMomentsDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('MomentsVideoDB', 2);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('videos')) db.createObjectStore('videos');
        if (!db.objectStoreNames.contains('images')) db.createObjectStore('images');
      };
      req.onsuccess = e => resolve(e.target.result);
      req.onerror = e => reject(e);
    });
  }

  async function saveVideoToIDB(momentId, videoBase64) {
    try {
      const db = await openMomentsDB();
      const tx = db.transaction('videos', 'readwrite');
      await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.objectStore('videos').put(videoBase64, 'vid_' + momentId);
      });
      console.log('[Moments] IDB 视频保存成功:', momentId);
    } catch(e) { console.warn('[Moments] 视频存储失败:', e); }
  }
  async function getVideoFromIDB(momentId) {
    try {
      const db = await openMomentsDB();
      return new Promise(resolve => {
        const tx = db.transaction('videos', 'readonly');
        const req = tx.objectStore('videos').get('vid_' + momentId);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch(e) { return null; }
  }

  // 图片存入 IndexedDB（key 格式: img_{momentId}_{imageIndex}）
  async function saveImageToIDB(momentId, imageIndex, imageBase64) {
    try {
      const db = await openMomentsDB();
      const tx = db.transaction('images', 'readwrite');
      await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.objectStore('images').put(imageBase64, 'img_' + momentId + '_' + imageIndex);
      });
      console.log('[Moments] IDB 图片保存成功:', momentId, imageIndex);
    } catch(e) { console.warn('[Moments] 图片存储失败:', e); }
  }
  async function getImageFromIDB(momentId, imageIndex) {
    try {
      const db = await openMomentsDB();
      return new Promise(resolve => {
        const tx = db.transaction('images', 'readonly');
        const req = tx.objectStore('images').get('img_' + momentId + '_' + imageIndex);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch(e) { return null; }
  }

  // 删除某条朋友圈在 IDB 中的所有图片和视频
  async function deleteMomentFromIDB(moment) {
    try {
      const db = await openMomentsDB();
      // 删除视频
      if (moment.video) {
        const tx1 = db.transaction('videos', 'readwrite');
        tx1.objectStore('videos').delete('vid_' + moment.id);
      }
      // 删除图片
      if (moment.images && moment.images.length > 0) {
        const tx2 = db.transaction('images', 'readwrite');
        moment.images.forEach((img, idx) => {
          if (typeof img === 'string' && img.startsWith('__IDB_IMG__')) {
            tx2.objectStore('images').delete('img_' + moment.id + '_' + idx);
          }
        });
      }
    } catch(e) { console.warn('IDB 清理失败:', e); }
  }

  // 压缩图片：缩小尺寸 + 降低质量
  function compressImage(base64, maxWidth, quality) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = function() {
        // 如果图片已经很小，不压缩
        if (img.width <= maxWidth && base64.length < IDB_IMAGE_THRESHOLD) {
          resolve(base64);
          return;
        }
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = function() { resolve(base64); };
      img.src = base64;
    });
  }

  // 同步保存朋友圈数据（优先存 IndexedDB，失败再降级 localStorage）
  async function saveMomentsToStorageSync() {
    const dataToSave = momentsData.map(m => ({
      ...m,
      images: [...m.images],
      comments: m.comments ? [...m.comments] : [],
      likes: m.likes ? [...m.likes] : []
    }));
    try {
      // 优先存 IndexedDB
      await saveMomentsToIDB(dataToSave);
      console.log('[Moments] IndexedDB 保存成功，共', momentsData.length, '条');
      // 同时写一份到 localStorage（兼容旧版），超大小就忽略
      try {
        localStorage.setItem('moments_data', JSON.stringify(dataToSave));
      } catch(e) { /* 忽略，IndexedDB 已成功 */ }
    } catch(e) {
      console.warn('[Moments] IndexedDB 保存失败，降级 localStorage:', e);
      // 降级：直接存 localStorage，超限则裁剪大图
      try {
        localStorage.setItem('moments_data', JSON.stringify(dataToSave));
      } catch(e2) {
        try {
          const reduced = dataToSave.map(m => {
            const saved = { ...m, images: [...m.images] };
            for (let ii = 0; ii < saved.images.length; ii++) {
              if (typeof saved.images[ii] === 'string' && saved.images[ii].length > IDB_IMAGE_THRESHOLD) {
                saved.images[ii] = '__IDB_IMG__' + m.id + '_' + ii;
              }
            }
            if (saved.video && saved.video.url && saved.video.url.length > 1000) {
              saveVideoToIDB(m.id, saved.video.url);
              saved.video = { ...saved.video, url: '__IDB__' + m.id };
            }
            return saved;
          });
          localStorage.setItem('moments_data', JSON.stringify(reduced));
          console.warn('[Moments] 已降级保存（大图片替换为IDB引用）');
        } catch(e3) {
          console.error('[Moments] 降级保存也失败:', e3);
        }
      }
    }
  }

  // 异步保存朋友圈数据到 localStorage（视频和大图片存 IndexedDB，localStorage 只保留引用）
  async function saveMomentsToStorage() {
    try {
      const dataToSave = [];
      for (let mi = 0; mi < momentsData.length; mi++) {
        const m = momentsData[mi];
        const saved = { ...m, images: [...m.images] };

        // 视频处理：大视频存 IndexedDB
        if (saved.video && saved.video.url && saved.video.url.length > 1000) {
          saveVideoToIDB(m.id, saved.video.url);
          saved.video = { ...saved.video, url: '__IDB__' + m.id };
        }

        // 图片处理：大图片压缩后存 IndexedDB，localStorage 只保留引用
        for (let ii = 0; ii < saved.images.length; ii++) {
          const img = saved.images[ii];
          if (typeof img === 'string' && img.length > IDB_IMAGE_THRESHOLD && !img.startsWith('__IDB_IMG__')) {
            // 先压缩再存 IDB
            const compressed = await compressImage(img, COMPRESS_MAX_WIDTH, COMPRESS_QUALITY);
            saveImageToIDB(m.id, ii, compressed);
            saved.images[ii] = '__IDB_IMG__' + m.id + '_' + ii;
          }
        }

        dataToSave.push(saved);
      }
      localStorage.setItem('moments_data', JSON.stringify(dataToSave));
    } catch(e) {
      console.warn('保存朋友圈数据失败（可能超出存储限制）:', e);
      // 存储超限时，尝试只保存文本数据（不含图片）
      try {
        const textOnly = momentsData.map(m => ({
          ...m,
          images: m.images.map(img => typeof img === 'string' && img.length > 100 ? '[图片]' : img)
        }));
        localStorage.setItem('moments_data', JSON.stringify(textOnly));
        console.warn('已降级保存（仅文本）');
      } catch(e2) {
        console.error('降级保存也失败:', e2);
      }
    }
  }

  // 可提醒的好友列表 - 只包含系统 partner，与 Home 页个人信息绑定
  const friendList = [];

  // 缓存系统（伴侣）信息，避免每次都异步读取
  let cachedPartnerName = '梦角';
  let cachedPartnerAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=partner&backgroundColor=c0aede';

  async function loadPartnerInfo() {
    let partnerName = '梦角';
    let partnerAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=partner&backgroundColor=c0aede';

    try {
      // 1. 从 settings 获取（最低优先级）
      if (window.settings) {
        if (window.settings.partnerName) partnerName = window.settings.partnerName;
        if (window.settings.partnerAvatar) partnerAvatar = window.settings.partnerAvatar;
      }

      // 2. 优先从 localStorage 读取（同步写入，最可靠）
      const partnerStr = localStorage.getItem('profile_partner');
      if (partnerStr) {
        const partner = JSON.parse(partnerStr);
        if (partner.name) partnerName = partner.name;
        if (partner.avatar) partnerAvatar = partner.avatar;
      }
      const savedAvatar = localStorage.getItem('home_avatar_partner');
      if (savedAvatar) partnerAvatar = savedAvatar;

      // 3. 从 homeGetGlobal 获取（也读 localStorage）
      if (typeof homeGetGlobal === 'function') {
        const hgProfile = homeGetGlobal('profile_partner');
        if (hgProfile) {
          const partner = JSON.parse(hgProfile);
          if (partner.name) partnerName = partner.name;
          if (partner.avatar) partnerAvatar = partner.avatar;
        }
        const hgAvatar = homeGetGlobal('home_avatar_partner');
        if (hgAvatar) partnerAvatar = hgAvatar;
      }

      // 4. 最后从 localforage 读取（异步，可能存在竞态条件）
      if (typeof localforage !== 'undefined') {
        var lfAvatar = await localforage.getItem('home_avatar_partner');
        if (lfAvatar) partnerAvatar = lfAvatar;
        var lfProfile = await localforage.getItem('profile_partner');
        if (lfProfile) {
          var profile = JSON.parse(lfProfile);
          if (profile.name) partnerName = profile.name;
          if (profile.avatar) partnerAvatar = profile.avatar;
        }
      }
    } catch(e) {}

    cachedPartnerName = partnerName;
    cachedPartnerAvatar = partnerAvatar;
  }

  function getPartnerName() { return cachedPartnerName; }
  function getPartnerAvatar() { return cachedPartnerAvatar; }

  async function initFriendList() {
    friendList.length = 0;
    await loadPartnerInfo();
    friendList.push({
      name: cachedPartnerName,
      avatar: cachedPartnerAvatar
    });
  }

  // 发表时临时存储
  let tempMentions = [];
  let tempLocation = '';

  // ========== 初始化用户信息 ==========
  async function initUserInfo() {
    // 每次打开都同步头像，确保与 Home 页保持一致
    await syncAvatarFromHome();
    
    // 恢复封面背景
    try {
      const savedCover = localStorage.getItem('moments_cover');
      if (savedCover) {
        userConfig.coverImage = savedCover;
      }
    } catch(e) {}
    
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const nameEl = container.querySelector('#userName');
    const sigEl = container.querySelector('#userSignature');
    const avatarEl = container.querySelector('#userAvatar');
    const coverEl = container.querySelector('#coverArea');
    
    if (nameEl) nameEl.textContent = userConfig.name;
    if (sigEl) sigEl.textContent = userConfig.signature;
    // 头像与 Home 页使用同一存储变量
    if (avatarEl) avatarEl.src = userConfig.avatar;
    if (coverEl) coverEl.style.backgroundImage = `url(${userConfig.coverImage})`;
  }

  // ========== Render ==========
  async function renderMoments() {
    const container = document.getElementById('moments-container');
    if (!container) return;

    // 每次渲染前同步最新头像（确保与 Home 页保持一致）
    await syncAvatarFromHome();
    const avatarEl = container.querySelector('#userAvatar');
    const nameEl = container.querySelector('#userName');
    if (avatarEl) avatarEl.src = userConfig.avatar;
    if (nameEl) nameEl.textContent = userConfig.name;

    const listEl = container.querySelector('#momentsList');
    if (!listEl) return;
    
    if (momentsData.length === 0) {
      listEl.innerHTML = `
        <div class="moments-empty-state" style="text-align:center;padding:60px 20px;color:#999;">
          <div style="font-size:48px;margin-bottom:16px;opacity:0.5;">📝</div>
          <div style="font-size:16px;margin-bottom:8px;">还没有朋友圈动态</div>
          <div style="font-size:13px;color:#ccc;">点击右下角 + 按钮发布第一条吧</div>
        </div>
      `;
      return;
    }

    // 从 IndexedDB 恢复大图片（异步加载）
    await restoreImagesFromIDB();

    listEl.innerHTML = momentsData.map(m => renderMomentCard(m)).join('');
    setupLongPress();
    setupCardLongPress();

    // 渲染后重新显示通知（renderMoments 重建 DOM 会销毁通知元素）
    if (momentsNotifications.length > 0) {
      renderMomentsNotificationCard();
    }
  }

  // 从 IndexedDB 恢复所有 __IDB_IMG__ 引用的图片
  async function restoreImagesFromIDB() {
    for (let mi = 0; mi < momentsData.length; mi++) {
      const m = momentsData[mi];
      if (!m.images || !Array.isArray(m.images)) { m.images = []; continue; }
      for (let ii = 0; ii < m.images.length; ii++) {
        const img = m.images[ii];
        if (typeof img === 'string' && img.startsWith('__IDB_IMG__')) {
          // 解析 key: __IDB_IMG__{momentId}_{imageIndex}
          const key = img.replace('__IDB_IMG__', '');
          const parts = key.split('_');
          if (parts.length >= 2) {
            const data = await getImageFromIDB(parseInt(parts[0]), parseInt(parts[1]));
            if (data) {
              m.images[ii] = data; // 恢复到内存
            } else {
              console.warn('[Moments] IDB 图片恢复失败:', key);
              m.images[ii] = ''; // 标记为空，避免重复尝试
            }
          }
        }
      }
      // 恢复视频
      if (m.video && m.video.url && m.video.url.startsWith('__IDB__')) {
        const momentId = parseInt(m.video.url.replace('__IDB__', ''));
        const data = await getVideoFromIDB(momentId);
        if (data) {
          m.video.url = data; // 恢复到内存
        }
      }
    }
  }

  // ========== Time Formatting ==========
  function formatMomentTime(timestamp) {
    if (typeof timestamp === 'string') return timestamp;
    
    const now = Date.now();
    const diff = now - timestamp;
    
    // 小于1分钟
    if (diff < 60000) {
      return '刚刚';
    }
    // 小于1小时
    if (diff < 3600000) {
      return Math.floor(diff / 60000) + '分钟前';
    }
    // 小于24小时
    if (diff < 86400000) {
      return Math.floor(diff / 3600000) + '小时前';
    }
    // 小于7天
    if (diff < 604800000) {
      return Math.floor(diff / 86400000) + '天前';
    }
    // 超过7天显示日期
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  }

  function renderMomentCard(m) {
    // 计算媒体总数（图片+视频）
    const mediaItems = [];
    const imgs = m.images || [];
    imgs.forEach((img, i) => {
      if (img && typeof img === 'string' && !img.startsWith('__IDB_IMG__') && img !== '[图片]') {
        mediaItems.push({ type: 'image', src: img, index: i });
      }
    });
    if (m.video) mediaItems.push({ type: 'video', src: m.video.cover, url: m.video.url, duration: m.video.duration });

    const totalMedia = mediaItems.length;
    const gridClass = totalMedia === 1 ? 'cols-1' :
                      totalMedia === 2 ? 'cols-2' : 'cols-3';

    const imagesHtml = totalMedia > 0 ? `
      <div class="nine-grid ${gridClass}">
        ${mediaItems.map((item, i) => {
          if (item.type === 'video') {
            return `
              <div class="grid-item video-item" onclick="MomentsApp.playVideo(${m.id})">
                <img src="${item.src}" alt="视频" loading="lazy">
                <span class="video-duration">${item.duration || ''}</span>
              </div>
            `;
          }
          return `
            <div class="grid-item" onclick="MomentsApp.openPreview(${m.id}, ${item.index})">
              <img src="${item.src}" alt="图片" loading="lazy">
            </div>
          `;
        }).join('')}
      </div>
    ` : '';

    const stickerHtml = m.sticker ? `
      <div class="moment-sticker" data-sticker-url="${encodeURIComponent(m.sticker)}">
        <img src="${m.sticker}" alt="表情包" loading="lazy">
      </div>
    ` : '';

    const likesHtml = m.likes.length > 0 ? `
      <div class="like-section">
        <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        <span class="like-names">${m.likes.join('，')}</span>
      </div>
    ` : '';

    const commentsHtml = m.comments.length > 0 ? `
      <div class="comment-section">
        ${m.comments.map((c, idx) => `
          <div class="comment-item${c.replyTo ? ' comment-nested' : ''}" onclick="MomentsApp.replyToComment(${m.id}, ${idx}, '${c.name}')">
            <div class="comment-item-inner">
              <span class="comment-name">${c.name}</span>${c.replyTo ? `<span class="reply-arrow">回复</span><span class="reply-to">${c.replyTo}</span>` : ''}：<span class="comment-text">${c.text}</span>${c.sticker ? `<img class="comment-sticker-img" src="${c.sticker}" alt="表情包" style="max-width:80px;max-height:80px;border-radius:4px;vertical-align:middle;display:inline-block;margin-left:4px;">` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    ` : '';

    const interactionHtml = (m.likes.length > 0 || m.comments.length > 0) ? `
      <div class="interaction-area">
        <div class="interaction-bubble">
          ${likesHtml}
          ${commentsHtml}
        </div>
      </div>
    ` : '';

    const likedClass = m.likedByMe ? 'liked' : '';
    const collectedClass = m.collected ? 'collected' : '';

    const mentionsHtml = m.mentions && m.mentions.length > 0 ? `
      <div class="moment-mentions">提到了：${m.mentions.join('、')}</div>
    ` : '';

    const locationHtml = m.location ? `
      <div class="moment-location">${m.location}</div>
    ` : '';

    return `
      <div class="moment-card" data-moment-id="${m.id}">
        <div class="moment-notification" id="momentNotification-${m.id}" style="display:none;">
          <div class="moment-notification-inner" onclick="MomentsApp.scrollToFirstNotifiedMoment && MomentsApp.scrollToFirstNotifiedMoment()">
            <img class="notification-avatar" src="" alt="">
            <span class="notification-text"></span>
          </div>
        </div>
        <div class="moment-header">
          <img class="moment-avatar" src="${m.avatar}" alt="${m.nickname}">
          <div class="moment-meta">
            <div class="moment-nickname">${m.nickname}</div>
            <div class="moment-time">${formatMomentTime(m.time)}</div>
          </div>
        </div>
        <div class="moment-content">
          <div class="moment-text ${m.text.length > 80 ? 'collapsed' : ''}" id="mt-${m.id}">${m.text}</div>
          ${m.text.length > 80 ? `<div class="moment-text-expand" onclick="MomentsApp.toggleTextExpand(${m.id})">展开</div>` : ''}
          ${mentionsHtml}
          ${locationHtml}
          ${imagesHtml}
          ${stickerHtml}
        </div>
        <div class="moment-actions">
          <button class="action-btn ${likedClass}" data-like-btn="${m.id}">
            <svg class="heart-icon" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </button>
          <button class="action-btn" data-comment-btn="${m.id}">
            <svg class="comment-icon" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"/></svg>
          </button>
          <button class="action-btn ${collectedClass}" data-collect-btn="${m.id}">
            <svg class="star-icon" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </button>
        </div>
        ${interactionHtml}
      </div>
    `;
  }

  // ========== Card Long Press for Edit ==========
  let cardLongPressTimer = null;

  let _stickerDelegateBound = false;
  function setupCardLongPress() {
    const container = document.getElementById('moments-container');
    if (!container) return;

    // sticker 点击事件委托（只绑定一次）
    if (!_stickerDelegateBound) {
      _stickerDelegateBound = true;
      container.addEventListener('click', function(e) {
        const stickerEl = e.target.closest('.moment-sticker');
        if (stickerEl && stickerEl.dataset.stickerUrl) {
          e.stopPropagation();
          openStickerPreview(decodeURIComponent(stickerEl.dataset.stickerUrl));
          return;
        }
      });
    }

    container.querySelectorAll('.moment-card').forEach(card => {
      card.addEventListener('touchstart', handleCardLongPressStart, { passive: true });
      card.addEventListener('touchend', handleCardLongPressEnd);
      card.addEventListener('mousedown', handleCardLongPressStart);
      card.addEventListener('mouseup', handleCardLongPressEnd);
      card.addEventListener('mouseleave', handleCardLongPressEnd);
    });
  }

  function handleCardLongPressStart(e) {
    const card = e.currentTarget;
    cardLongPressTimer = setTimeout(() => {
      const momentId = parseInt(card.dataset.momentId);
      openEditPanel(momentId);
    }, 800);
  }

  function handleCardLongPressEnd(e) {
    if (cardLongPressTimer) {
      clearTimeout(cardLongPressTimer);
      cardLongPressTimer = null;
    }
  }

  // ========== Edit Panel ==========
  let currentEditMomentId = null;
  let editImages = [];
  let editMentions = [];

  function openEditPanel(momentId) {
    currentEditMomentId = momentId;
    const m = momentsData.find(x => x.id === momentId);
    if (!m) return;

    const container = document.getElementById('moments-container');
    if (!container) return;

    container.querySelector('#editTextarea').value = m.text;
    container.querySelector('#editTime').textContent = `发布时间：${m.time}`;
    container.querySelector('#editLikes').textContent = `点赞：${m.likes.length}`;
    container.querySelector('#editComments').textContent = `评论：${m.comments.length}`;

    // 初始化位置和提到的人
    container.querySelector('#editLocationInput').value = m.location || '';
    editMentions = m.mentions ? [...m.mentions] : [];
    renderEditMentions();

    editImages = [...m.images];
    renderEditImages();

    container.querySelector('#editPanel').classList.add('active');
  }

  function renderEditImages() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const body = container.querySelector('#editPanelBody');
    // Remove old image grid if exists
    const old = body.querySelector('.edit-image-grid');
    if (old) old.remove();
    
    const grid = document.createElement('div');
    grid.className = 'edit-image-grid';
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:12px;';
    
    grid.innerHTML = editImages.map((img, i) => `
      <div style="position:relative;padding-top:100%;border-radius:4px;overflow:hidden;">
        <img src="${img}" alt="图片" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;">
        <div onclick="MomentsApp.removeEditImage(${i})" style="position:absolute;top:4px;right:4px;width:20px;height:20px;background:rgba(0,0,0,0.5);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;">
          <svg viewBox="0 0 24 24" style="width:12px;height:12px;fill:#fff;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </div>
      </div>
    `).join('') + `
      <div onclick="MomentsApp.addEditImage()" style="position:relative;padding-top:100%;border:1px dashed #ccc;border-radius:4px;cursor:pointer;background:#fafafa;">
        <span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:32px;color:#ccc;">+</span>
      </div>
    `;
    
    body.appendChild(grid);
  }

  function removeEditImage(idx) {
    editImages.splice(idx, 1);
    renderEditImages();
  }

  function addEditImage() {
    const fileInput = document.getElementById('momentsEditPhotoInput');
    if (fileInput) {
      fileInput.value = '';
      fileInput.click();
    }
  }

  function handleEditPhotoUpload(e) {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = function(ev) {
      editImages.push(ev.target.result);
      renderEditImages();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function closeEditPanel() {
    const container = document.getElementById('moments-container');
    if (container) {
      container.querySelector('#editPanel').classList.remove('active');
    }
    currentEditMomentId = null;
  }

  function saveEdit() {
    if (!currentEditMomentId) return;

    const m = momentsData.find(x => x.id === currentEditMomentId);
    if (!m) return;

    const container = document.getElementById('moments-container');
    if (!container) return;

    const newText = container.querySelector('#editTextarea').value.trim();
    if (newText) m.text = newText;
    m.images = [...editImages];

    // 保存位置和提到的人
    m.location = container.querySelector('#editLocationInput').value.trim();
    m.mentions = [...editMentions];

    saveMomentsToStorageSync();
    renderMoments();
    closeEditPanel();
  }

  function deleteMoment() {
    if (!currentEditMomentId) return;

    if (confirm('确定要删除这条朋友圈吗？')) {
      const idx = momentsData.findIndex(x => x.id === currentEditMomentId);
      if (idx >= 0) {
        const removed = momentsData.splice(idx, 1)[0];
        deleteMomentFromIDB(removed); // 清理 IDB 中的图片和视频
        saveMomentsToStorageSync();
        renderMoments();
      }
      closeEditPanel();
    }
  }

  // ========== Edit Panel Helper Functions ==========
  function renderEditMentions() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const display = container.querySelector('#editMentionDisplay');
    if (editMentions.length === 0) {
      display.innerHTML = '<span style="color:#999;">未选择</span>';
    } else {
      display.innerHTML = editMentions.map(name => `<span style="background:#e6f7ed;color:#07c160;padding:2px 8px;border-radius:4px;font-size:13px;">@${name}</span>`).join('');
    }
  }

  function openEditLocationPanel() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const currentLoc = container.querySelector('#editLocationInput').value;
    container.querySelector('#locationInput').value = currentLoc;
    container.querySelector('#locationPanel').classList.add('active');
    // 设置回调函数
    window.locationPanelCallback = (loc) => {
      container.querySelector('#editLocationInput').value = loc;
    };
  }

  function openEditMentionPanel() {
    // 初始化 tempMentions 为当前编辑的值
    tempMentions = [...editMentions];
    const container = document.getElementById('moments-container');
    if (container) {
      container.querySelector('#mentionPanel').classList.add('active');
    }
    renderMentionList();
    // 设置回调函数
    window.mentionPanelCallback = (selected) => {
      editMentions = [...selected];
      renderEditMentions();
    };
  }

  // ========== Long Press Setup ==========
  let longPressTimer = null;
  let currentLongPressTarget = null;

  function setupLongPress() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    container.querySelectorAll('[data-like-btn]').forEach(btn => {
      btn.addEventListener('touchstart', handleLongPressStart);
      btn.addEventListener('touchend', handleLongPressEnd);
      btn.addEventListener('mousedown', handleLongPressStart);
      btn.addEventListener('mouseup', handleLongPressEnd);
      btn.addEventListener('mouseleave', handleLongPressEnd);
      btn.addEventListener('click', (e) => {
        if (!btn.dataset.longPressed) {
          toggleLike(parseInt(btn.dataset.likeBtn));
        }
        delete btn.dataset.longPressed;
      });
    });

    container.querySelectorAll('[data-comment-btn]').forEach(btn => {
      btn.addEventListener('touchstart', handleCommentLongPressStart);
      btn.addEventListener('touchend', handleCommentLongPressEnd);
      btn.addEventListener('mousedown', handleCommentLongPressStart);
      btn.addEventListener('mouseup', handleCommentLongPressEnd);
      btn.addEventListener('mouseleave', handleCommentLongPressEnd);
      btn.addEventListener('click', (e) => {
        if (!btn.dataset.longPressed) {
          toggleComment(parseInt(btn.dataset.commentBtn));
        }
        delete btn.dataset.longPressed;
      });
    });

    container.querySelectorAll('[data-collect-btn]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCollect(parseInt(btn.dataset.collectBtn));
      });
    });
  }

  function handleLongPressStart(e) {
    e.stopPropagation();
    currentLongPressTarget = e.currentTarget;
    longPressTimer = setTimeout(() => {
      currentLongPressTarget.dataset.longPressed = 'true';
      showLongPressHint();
      setTimeout(() => {
        openCustomLikePanel(parseInt(currentLongPressTarget.dataset.likeBtn));
      }, 300);
    }, 800);
  }

  function handleLongPressEnd(e) {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }

  function handleCommentLongPressStart(e) {
    e.stopPropagation();
    currentLongPressTarget = e.currentTarget;
    longPressTimer = setTimeout(() => {
      currentLongPressTarget.dataset.longPressed = 'true';
      showLongPressHint();
      setTimeout(() => {
        openCustomCommentPanel(parseInt(currentLongPressTarget.dataset.commentBtn));
      }, 300);
    }, 800);
  }

  function handleCommentLongPressEnd(e) {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }

  function showLongPressHint() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const hint = container.querySelector('#longPressHint');
    hint.classList.add('active');
    setTimeout(() => {
      hint.classList.remove('active');
    }, 1000);
  }

  // ========== Custom Panel ==========
  let customMomentId = null;
  let customType = 'like';

  async function openCustomLikePanel(momentId) {
    customMomentId = momentId;
    customType = 'like';
    
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    container.querySelector('#customPanelTitle').textContent = '自定义点赞';
    container.querySelector('#customLabel').textContent = '点赞人名称（用逗号分隔）';
    container.querySelector('#customInput').placeholder = '例如：张三, 李四, 王五';
    container.querySelector('#customCommentGroup').style.display = 'none';
    
    const m = momentsData.find(x => x.id === momentId);
    container.querySelector('#customInput').value = m.likes.join(', ');
    
    // 渲染好友列表快捷选择
    await renderCustomFriendsShortcut(container, m.likes);
    
    container.querySelector('#customPanel').classList.add('active');
  }

  async function renderCustomFriendsShortcut(container, currentLikes) {
    var shortcutEl = container.querySelector('#customFriendsShortcut');
    if (!shortcutEl) return;
    
    // 加载好友列表（init 中已初始化，此处为兜底）
    if (momentsFriends.length === 0) await loadMomentsFriends();
    
    if (momentsFriends.length === 0) {
      shortcutEl.innerHTML = '';
      return;
    }
    
    var currentArr = currentLikes || [];
    var allSelected = momentsFriends.length > 0 && momentsFriends.every(function(f) { return currentArr.indexOf(f.name) !== -1; });
    
    var html = '<div class="friends-shortcut-header">';
    html += '<span class="friends-shortcut-title">好友列表</span>';
    html += '<button class="friends-select-all" onclick="MomentsApp.toggleSelectAllFriends(this)">' + (allSelected ? '取消全选' : '全选') + '</button>';
    html += '</div>';
    html += '<div class="friends-shortcut-chips">';
    html += momentsFriends.map(function(f) {
      var isSelected = currentArr.indexOf(f.name) !== -1;
      return '<span class="friend-chip' + (isSelected ? ' selected' : '') + '" data-name="' + f.name + '">' + f.name + '</span>';
    }).join('');
    html += '</div>';
    
    shortcutEl.innerHTML = html;
    
    shortcutEl.querySelectorAll('.friend-chip').forEach(function(chip) {
      chip.addEventListener('click', function() {
        var name = this.getAttribute('data-name');
        var input = container.querySelector('#customInput');
        var names = input.value.split(',').map(function(n) { return n.trim(); }).filter(Boolean);
        var idx = names.indexOf(name);
        if (idx === -1) {
          names.push(name);
          this.classList.add('selected');
        } else {
          names.splice(idx, 1);
          this.classList.remove('selected');
        }
        input.value = names.join(', ');
        // 更新全选按钮状态
        updateSelectAllButton(container);
      });
    });
  }

  function updateSelectAllButton(container) {
    var btn = container.querySelector('.friends-select-all');
    if (!btn) return;
    var input = container.querySelector('#customInput');
    var names = input.value.split(',').map(function(n) { return n.trim(); }).filter(Boolean);
    var allSelected = momentsFriends.length > 0 && momentsFriends.every(function(f) { return names.indexOf(f.name) !== -1; });
    btn.textContent = allSelected ? '取消全选' : '全选';
  }

  function toggleSelectAllFriends(btn) {
    var container = document.getElementById('moments-container');
    if (!container) return;
    var input = container.querySelector('#customInput');
    var chips = container.querySelectorAll('.friend-chip');
    var isAllSelected = btn.textContent === '取消全选';
    
    if (isAllSelected) {
      // 取消全选
      input.value = '';
      chips.forEach(function(chip) { chip.classList.remove('selected'); });
      btn.textContent = '全选';
    } else {
      // 全选
      var allNames = momentsFriends.map(function(f) { return f.name; });
      input.value = allNames.join(', ');
      chips.forEach(function(chip) { chip.classList.add('selected'); });
      btn.textContent = '取消全选';
    }
  }

  function openCustomCommentPanel(momentId) {
    customMomentId = momentId;
    customType = 'comment';
    
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    container.querySelector('#customPanelTitle').textContent = '自定义评论';
    container.querySelector('#customLabel').textContent = '评论人名称';
    container.querySelector('#customInput').placeholder = '例如：李四';
    container.querySelector('#customCommentGroup').style.display = 'block';
    
    container.querySelector('#customInput').value = '';
    container.querySelector('#customCommentInput').value = '';
    
    container.querySelector('#customPanel').classList.add('active');
  }

  function closeCustomPanel() {
    const container = document.getElementById('moments-container');
    if (container) {
      container.querySelector('#customPanel').classList.remove('active');
    }
    customMomentId = null;
  }

  function confirmCustom() {
    if (!customMomentId) return;
    
    const m = momentsData.find(x => x.id === customMomentId);
    if (!m) return;
    
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    if (customType === 'like') {
      const names = container.querySelector('#customInput').value.split(',').map(n => n.trim()).filter(n => n);
      m.likes = names;
      m.likedByMe = names.includes(userConfig.name);
    } else {
      const name = container.querySelector('#customInput').value.trim();
      const text = container.querySelector('#customCommentInput').value.trim();
      if (name && text) {
        m.comments.push({ name, text });
      }
    }
    saveMomentsToStorageSync();
    renderMoments();
    closeCustomPanel();
  }

  // ========== Collect ==========
  function toggleCollect(momentId) {
    const m = momentsData.find(x => x.id === momentId);
    if (!m) return;
    m.collected = !m.collected;
    saveMomentsToStorageSync();
    renderMoments();
  }

  // ========== Text Expand/Collapse ==========
  function toggleTextExpand(momentId) {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const textEl = container.querySelector('#mt-' + momentId);
    const expandBtn = textEl.nextElementSibling;
    if (textEl.classList.contains('collapsed')) {
      textEl.classList.remove('collapsed');
      expandBtn.textContent = '收起';
    } else {
      textEl.classList.add('collapsed');
      expandBtn.textContent = '展开';
    }
  }

  // ========== Auto Reply (从字卡库/表情包/颜文字随机选取，支持多会话) ==========
  async function triggerAutoReply(momentId, forceCurrent) {
    const m = momentsData.find(x => x.id === momentId);
    if (!m) return;

    // forceCurrent 时，找到"我"的最后一条评论作为回复引用目标
    let replyToUser = null;
    if (forceCurrent) {
      for (let i = m.comments.length - 1; i >= 0; i--) {
        if (m.comments[i].name === userConfig.name) {
          replyToUser = userConfig.name;
          break;
        }
      }
    }

    // 刷新系统（伴侣）信息缓存
    await loadPartnerInfo();

    // 确保好友列表已加载
    if (momentsFriends.length === 0) await loadMomentsFriends();

    // 获取当前会话的字卡库和公共资源
    const currentReplies = (window._customReplies || []).map(r => String(r || '').trim()).filter(Boolean);
    const kaomojiLibrary = (window._kaomojiLibrary || []).map(k => String(k || '').trim()).filter(Boolean);
    const customEmojis = (window._customEmojis || []).map(e => String(e || '').trim()).filter(Boolean);
    let _stickerLib = [];
    if (typeof window !== 'undefined' && window._stickerLibrary && Array.isArray(window._stickerLibrary)) {
      _stickerLib = window._stickerLibrary;
    } else if (typeof stickerLibrary !== 'undefined' && Array.isArray(stickerLibrary)) {
      _stickerLib = stickerLibrary;
    }
    const stickerLibraryFiltered = _stickerLib.filter(Boolean);

    const hasTextContent = currentReplies.length > 0 || kaomojiLibrary.length > 0 || customEmojis.length > 0;
    const hasStickers = stickerLibraryFiltered.length > 0;

    // 检查是否有任何会话有字卡库
    let anySessionHasReplies = hasTextContent;
    const sessionPartners = momentsFriends.filter(function(f) { return f.isSession && f.sessionId; });
    for (let i = 0; i < sessionPartners.length && !anySessionHasReplies; i++) {
      if (sessionPartners[i].sessionId !== window.SESSION_ID) {
        const replies = await getSessionReplies(sessionPartners[i].sessionId);
        if (replies.length > 0) anySessionHasReplies = true;
      }
    }

    if (!anySessionHasReplies && !hasStickers) {
      const container = document.getElementById('moments-container');
      if (container) {
        const hint = container.querySelector('#longPressHint');
        if (hint) {
          hint.textContent = '回复库为空，请先到字卡库添加内容';
          hint.classList.add('active');
          setTimeout(() => hint.classList.remove('active'), 2000);
        }
      }
      return;
    }

    // 选择回复数量
    var countSetting = getReplyCount();
    // forceCurrent 模式（你评论后对方回复）固定只回 1 条
    const replyCount = forceCurrent ? 1 : (countSetting === -1
      ? (Math.random() < 0.7 ? 1 : (Math.random() < 0.9 ? 2 : 3))
      : countSetting);

    // ========== 多会话回复逻辑 ==========
    // 每个会话伴侣独立判断是否回复（60%概率），但保证至少一个回复
    const currentSessionId = window.SESSION_ID;
    const repliers = []; // { name, avatar, sessionId, replies[] }

    if (forceCurrent) {
      // 强制当前会话伴侣回复（你评论/回复后对方必定回复）
      const currentPartner = sessionPartners.find(function(sp) { return sp.sessionId === currentSessionId; });
      if (currentPartner) {
        repliers.push({
          name: currentPartner.name,
          avatar: currentPartner.avatar,
          sessionId: currentPartner.sessionId,
          replies: currentReplies
        });
      }
    } else {
      // 打乱会话顺序
      const shuffled = sessionPartners.slice().sort(function() { return Math.random() - 0.5; });

      for (let i = 0; i < shuffled.length; i++) {
        const sp = shuffled[i];
        // 60% 概率该会话回复
        if (Math.random() < 0.6) {
          const replies = sp.sessionId === currentSessionId
            ? currentReplies
            : await getSessionReplies(sp.sessionId);
          if (replies.length > 0 || hasStickers) {
            repliers.push({
              name: sp.name,
              avatar: sp.avatar,
              sessionId: sp.sessionId,
              replies: replies
            });
          }
        }
      }
    }

    // 如果没有任何会话回复，强制当前会话回复
    if (repliers.length === 0 && sessionPartners.length > 0) {
      const currentPartner = sessionPartners.find(function(sp) { return sp.sessionId === currentSessionId; })
        || sessionPartners[0];
      repliers.push({
        name: currentPartner.name,
        avatar: currentPartner.avatar,
        sessionId: currentPartner.sessionId,
        replies: currentPartner.sessionId === currentSessionId ? currentReplies : await getSessionReplies(currentPartner.sessionId)
      });
    }

    // 分配回复数量给各个回复者
    let remainingReplies = replyCount;
    const replyPlan = []; // { name, avatar, count, replies[] }

    for (let i = 0; i < repliers.length && remainingReplies > 0; i++) {
      const count = i === repliers.length - 1 ? remainingReplies : (Math.random() < 0.5 ? 1 : Math.min(2, remainingReplies));
      replyPlan.push({
        name: repliers[i].name,
        avatar: repliers[i].avatar,
        sessionId: repliers[i].sessionId,
        count: count,
        replies: repliers[i].replies
      });
      remainingReplies -= count;
    }

    // 执行回复
    for (let r = 0; r < replyPlan.length; r++) {
      const plan = replyPlan[r];
      const planReplies = plan.replies;

      for (let i = 0; i < plan.count; i++) {
        // 20% 概率发送表情包
        const sendSticker = hasStickers && Math.random() < 0.2;

        if (sendSticker) {
          const sticker = stickerLibraryFiltered[Math.floor(Math.random() * stickerLibraryFiltered.length)];
          m.comments.push({
            name: plan.name,
            text: '',
            sticker: sticker,
            replyTo: replyToUser || undefined
          });
          showMomentsNotification(plan.name, plan.avatar, 'comment', 1, m.id, '[表情包]', getMomentPreviewImage(m));
          continue;
        }

        let replyText = '';

        if (forceCurrent) {
          // forceCurrent：只用字卡库回复，不混入颜文字/表情
          if (planReplies.length > 0) {
            replyText = planReplies[Math.floor(Math.random() * planReplies.length)];
          }
        } else {
          // 非强制模式：允许混合颜文字/表情库（原有逻辑）
          const useKaomoji = planReplies.length === 0 || (kaomojiLibrary.length > 0 && Math.random() < 0.3);

          if (useKaomoji && kaomojiLibrary.length > 0) {
            replyText = kaomojiLibrary[Math.floor(Math.random() * kaomojiLibrary.length)];
          } else if (planReplies.length > 0) {
            replyText = planReplies[Math.floor(Math.random() * planReplies.length)];
          }

          // Emoji 混入（20%概率）
          if (replyText && customEmojis.length > 0 && Math.random() < 0.2) {
            const emoji = customEmojis[Math.floor(Math.random() * customEmojis.length)];
            replyText = Math.random() < 0.5 ? emoji + ' ' + replyText : replyText + ' ' + emoji;
          }

          // 颜文字混入（25%概率）
          if (replyText && kaomojiLibrary.length > 0 && !useKaomoji && Math.random() < 0.25) {
            const kaomoji = kaomojiLibrary[Math.floor(Math.random() * kaomojiLibrary.length)];
            replyText = Math.random() < 0.5 ? kaomoji + ' ' + replyText : replyText + ' ' + kaomoji;
          }
        }

        m.comments.push({
          name: plan.name,
          text: replyText,
          replyTo: replyToUser || undefined
        });
        showMomentsNotification(plan.name, plan.avatar, 'comment', 1, m.id, replyText, getMomentPreviewImage(m));
      }
    }

    console.log('[DEBUG] 自动回复完成，共生成 ' + m.comments.length + ' 条评论');

    // 自动点赞（80%概率）
    let didLike = false;
    if (Math.random() < 0.8) {
      if (isFriendLikeEnabled()) {
        // 开启好友点赞：从好友列表中每个好友独立判断（50%概率）
        if (momentsFriends.length === 0) await loadMomentsFriends();
        momentsFriends.forEach(function(friend) {
          if (Math.random() < 0.5 && !m.likes.includes(friend.name)) {
            m.likes.push(friend.name);
          }
        });
        didLike = true;
      } else {
        // 关闭好友点赞：只有当前会话伴侣点赞
        const currentName = getPartnerName();
        if (!m.likes.includes(currentName)) {
          m.likes.push(currentName);
          didLike = true;
        }
      }
    }

    // 先保存并渲染，确保 DOM 更新后再发送通知
    saveMomentsToStorageSync();
    renderMoments();

    // 发送点赞通知（取最后一个回复者的信息）
    if (didLike) {
      const lastReplier = replyPlan.length > 0 ? replyPlan[replyPlan.length - 1] : { name: getPartnerName(), avatar: getPartnerAvatar() };
      showMomentsNotification(lastReplier.name, lastReplier.avatar, 'like', 1, m.id, '', getMomentPreviewImage(m));
    }

    // 重新渲染通知卡片（确保评论通知也能正确显示）
    renderMomentsNotificationCard();
  }

  // ========== Like ==========
  function toggleLike(momentId) {
    const m = momentsData.find(x => x.id === momentId);
    if (!m) return;
    const myName = userConfig.name;
    const idx = m.likes.indexOf(myName);
    if (idx >= 0) {
      m.likes.splice(idx, 1);
      m.likedByMe = false;
    } else {
      m.likes.push(myName);
      m.likedByMe = true;
    }
    saveMomentsToStorageSync();
    renderMoments();
  }

  // ========== Comment Emoji/Sticker Panel ==========
  let commentEmojiPanelOpen = false;
  let commentEmojiTab = 'emoji';
  let pendingCommentSticker = null;
  let _autoReplyCooldown = false;

  // ========== Visitor Records ==========
  const VISITOR_STORAGE_KEY = 'moments_visitor_records';
  const VISITOR_LAST_ONLINE_KEY = 'moments_visitor_last_online';
  const VISITOR_LAST_VIEWED_KEY = 'moments_visitor_last_viewed_count';
  const VISITOR_MAX_PER_DAY = 10;

  let visitorRecords = [];
  let visitorUnreadCount = 0;
  let visitorTimerInterval = null;

  function loadVisitorRecords() {
    try {
      const data = localStorage.getItem(VISITOR_STORAGE_KEY);
      if (data) visitorRecords = JSON.parse(data);
      const lastViewed = parseInt(localStorage.getItem(VISITOR_LAST_VIEWED_KEY) || '0');
      visitorUnreadCount = Math.max(0, visitorRecords.length - lastViewed);
    } catch (e) {
      visitorRecords = [];
      visitorUnreadCount = 0;
    }
  }

  function saveVisitorRecords() {
    try {
      localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(visitorRecords));
    } catch (e) { console.warn('保存访客记录失败:', e); }
  }

  function getTodayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function getRecordDateStr(ts) {
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function getTodayVisitorCount() {
    const today = getTodayStr();
    return visitorRecords.filter(r => getRecordDateStr(r.timestamp) === today).length;
  }

  function generateOneVisitorRecord(timestamp, type, content) {
    const ts = timestamp || Date.now();
    visitorRecords.unshift({
      id: ts.toString(36) + Math.random().toString(36).substr(2,5),
      timestamp: ts,
      type: type || 'visit',
      content: content || ''
    });
    visitorUnreadCount++;
    saveVisitorRecords();
    updateVisitorBadge();
  }

  function generateOfflineVisitors() {
    const now = Date.now();
    const lastOnline = parseInt(localStorage.getItem(VISITOR_LAST_ONLINE_KEY)) || now;
    localStorage.setItem(VISITOR_LAST_ONLINE_KEY, now.toString());
    if (now - lastOnline < 3600000) return;

    const lastDate = new Date(lastOnline); lastDate.setHours(0,0,0,0);
    const todayDate = new Date(now); todayDate.setHours(0,0,0,0);
    const offlineDays = Math.floor((todayDate - lastDate) / 86400000);
    if (offlineDays <= 0) return;

    for (let i = 0; i < Math.min(offlineDays, 30); i++) {
      if (Math.random() > 0.4) continue;
      const countForDay = Math.floor(Math.random() * 10) + 1;
      const dayStart = new Date(lastOnline);
      dayStart.setDate(dayStart.getDate() + i + 1);
      dayStart.setHours(0,0,0,0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23,59,59,999);
      for (let j = 0; j < countForDay; j++) {
        generateOneVisitorRecord(dayStart.getTime() + Math.random() * (dayEnd.getTime() - dayStart.getTime()));
      }
    }
  }

  function startOnlineVisitorTimer() {
    if (visitorTimerInterval) clearInterval(visitorTimerInterval);
    localStorage.setItem(VISITOR_LAST_ONLINE_KEY, Date.now().toString());
    visitorTimerInterval = setInterval(() => {
      if (getTodayVisitorCount() >= VISITOR_MAX_PER_DAY) return;
      if (Math.random() < 0.20) generateOneVisitorRecord(Date.now());
      localStorage.setItem(VISITOR_LAST_ONLINE_KEY, Date.now().toString());
    }, 5 * 60 * 1000);
  }

  function stopOnlineVisitorTimer() {
    if (visitorTimerInterval) { clearInterval(visitorTimerInterval); visitorTimerInterval = null; }
    localStorage.setItem(VISITOR_LAST_ONLINE_KEY, Date.now().toString());
  }

  function updateVisitorBadge() {
    const badge = document.getElementById('visitorBadge');
    if (!badge) return;
    if (visitorUnreadCount > 0) {
      badge.textContent = visitorUnreadCount > 99 ? '99+' : visitorUnreadCount;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  function clearVisitorBadge() {
    visitorUnreadCount = 0;
    localStorage.setItem(VISITOR_LAST_VIEWED_KEY, visitorRecords.length.toString());
    const badge = document.getElementById('visitorBadge');
    if (badge) badge.style.display = 'none';
  }

  function calcStreakDays(recordTimestamp) {
    const recordDate = new Date(recordTimestamp);
    recordDate.setHours(0,0,0,0);
    const dateSet = new Set(visitorRecords.map(r => getRecordDateStr(r.timestamp)));
    let streak = 0, checkDate = new Date(recordDate);
    while (dateSet.has(getRecordDateStr(checkDate.getTime()))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
      if (streak >= 365) break;
    }
    return streak;
  }

  function formatDateGroup(dateStr) {
    const today = getTodayStr();
    const yesterday = (() => { const d = new Date(); d.setDate(d.getDate()-1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();
    if (dateStr === today) return '今天';
    if (dateStr === yesterday) return '昨天';
    const parts = dateStr.split('-');
    return `${parseInt(parts[1])}月${parseInt(parts[2])}日`;
  }

  function openVisitorPanel() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    clearVisitorBadge();
    renderVisitorList();
    container.querySelector('#visitorPanel').classList.add('active');
  }

  function closeVisitorPanel() {
    const container = document.getElementById('moments-container');
    if (container) container.querySelector('#visitorPanel').classList.remove('active');
  }

  function renderVisitorList() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    const listEl = container.querySelector('#visitorList');
    const emptyEl = container.querySelector('#visitorEmpty');
    if (!listEl || !emptyEl) return;

    if (visitorRecords.length === 0) {
      listEl.innerHTML = '';
      listEl.style.display = 'none';
      emptyEl.style.display = 'block';
      return;
    }

    emptyEl.style.display = 'none';
    listEl.style.display = 'block';

    // 实时获取梦角最新头像和名字（与点赞通知同步）
    const partnerName = getPartnerName();
    const partnerAvatar = getPartnerAvatar();

    let html = '';
    let currentDate = '';
    visitorRecords.forEach((record) => {
      const dateStr = getRecordDateStr(record.timestamp);
      if (dateStr !== currentDate) {
        currentDate = dateStr;
        html += `<div class="visitor-date-group">${formatDateGroup(dateStr)}</div>`;
      }
      const streak = calcStreakDays(record.timestamp);
      const streakTag = streak >= 2 ? `<span class="visitor-streak-tag">连续来访${streak}天</span>` : '';
      // 显示具体访问时间（时分）
      const visitDate = new Date(record.timestamp);
      const visitTimeStr = `${String(visitDate.getHours()).padStart(2,'0')}:${String(visitDate.getMinutes()).padStart(2,'0')}`;
      
      // 根据类型显示不同行为描述
      const recordType = record.type || 'visit';
      let actionIcon = '', actionText = '';
      if (recordType === 'like') {
        actionIcon = '<i class="fas fa-heart" style="color:#ff6b81;font-size:11px;margin-right:4px;"></i>';
        actionText = '赞了你的朋友圈';
      } else if (recordType === 'comment') {
        actionIcon = '<i class="fas fa-comment-dots" style="color:#4a90e2;font-size:11px;margin-right:4px;"></i>';
        actionText = record.content || '评论了你的朋友圈';
      } else {
        actionIcon = '<i class="fas fa-eye" style="color:#999;font-size:11px;margin-right:4px;"></i>';
        actionText = '偷偷来访';
      }

      html += `
        <div class="visitor-item" data-visitor-id="${record.id}">
          <div class="visitor-item-inner" ontouchstart="MomentsApp._visitorTouchStart(event,'${record.id}')" ontouchmove="MomentsApp._visitorTouchMove(event,'${record.id}')" ontouchend="MomentsApp._visitorTouchEnd(event,'${record.id}')">
            <img class="visitor-avatar" src="${partnerAvatar}" alt="${partnerName}" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=partner&backgroundColor=c0aede'">
            <div class="visitor-info">
              <div class="visitor-name">${partnerName}${streakTag}</div>
              <div class="visitor-time">${actionIcon}${actionText} · ${visitTimeStr}</div>
            </div>
          </div>
          <div class="visitor-delete-btn" onclick="MomentsApp.deleteVisitorRecord('${record.id}')">删除</div>
        </div>
      `;
    });
    listEl.innerHTML = html;
  }

  let _visitorTouchStartX = 0, _visitorTouchStartY = 0, _visitorSwiping = false;

  function _visitorTouchStart(e, recordId) {
    _visitorTouchStartX = e.touches[0].clientX;
    _visitorTouchStartY = e.touches[0].clientY;
    _visitorSwiping = false;
    const container = document.getElementById('moments-container');
    if (container) {
      container.querySelectorAll('.visitor-item-inner.swiped').forEach(el => el.classList.remove('swiped'));
    }
  }

  function _visitorTouchMove(e, recordId) {
    const diffX = e.touches[0].clientX - _visitorTouchStartX;
    const diffY = e.touches[0].clientY - _visitorTouchStartY;
    if (diffX < -10 && Math.abs(diffX) > Math.abs(diffY)) {
      _visitorSwiping = true;
      const item = e.target.closest('.visitor-item');
      if (item) {
        const inner = item.querySelector('.visitor-item-inner');
        if (inner) {
          inner.style.transition = 'none';
          inner.style.transform = `translateX(${Math.max(diffX, -70)}px)`;
        }
      }
    }
  }

  function _visitorTouchEnd(e, recordId) {
    if (!_visitorSwiping) return;
    const item = e.target.closest('.visitor-item');
    if (item) {
      const inner = item.querySelector('.visitor-item-inner');
      if (inner) {
        inner.style.transition = 'transform 0.3s ease';
        const currentTransform = parseFloat((inner.style.transform || '').replace('translateX(','').replace('px)','')) || 0;
        if (currentTransform < -40) { inner.classList.add('swiped'); inner.style.transform = ''; }
        else { inner.classList.remove('swiped'); inner.style.transform = ''; }
      }
    }
    _visitorSwiping = false;
  }

  function deleteVisitorRecord(recordId) {
    visitorRecords = visitorRecords.filter(r => r.id !== recordId);
    saveVisitorRecords();
    renderVisitorList();
    updateVisitorBadge();
  }

  function clearAllVisitors() {
    if (!confirm('确定要清空所有访客记录吗？')) return;
    visitorRecords = [];
    visitorUnreadCount = 0;
    saveVisitorRecords();
    localStorage.setItem(VISITOR_LAST_VIEWED_KEY, '0');
    renderVisitorList();
    updateVisitorBadge();
  }

  // ========== Moments Notifications ==========
  let momentsNotifications = [];
  let momentsBadgeCount = 0;

  function updateMomentsBadge() {
    momentsBadgeCount++;
    // 更新 Home 页朋友圈图标小红点
    const badge = document.getElementById('moments-badge');
    if (badge) {
      badge.textContent = momentsBadgeCount;
      badge.style.display = 'flex';
    }
    // 同时更新底部栏朋友圈图标
    const bottomBadge = document.getElementById('bottom-moments-badge');
    if (bottomBadge) {
      bottomBadge.textContent = momentsBadgeCount;
      bottomBadge.style.display = 'flex';
    }
  }

  function clearMomentsBadge() {
    momentsBadgeCount = 0;
    const badge = document.getElementById('moments-badge');
    if (badge) badge.style.display = 'none';
    const bottomBadge = document.getElementById('bottom-moments-badge');
    if (bottomBadge) bottomBadge.style.display = 'none';
  }

  function getMomentPreviewImage(moment) {
    if (!moment) return '';
    if (moment.images && moment.images.length > 0) return moment.images[0];
    if (moment.sticker) return moment.sticker;
    return '';
  }

  function showMomentsNotification(name, avatar, type = 'comment', count = 1, momentId = null, content = '', previewImage = '') {
    // 添加到通知列表
    momentsNotifications.push({
      name,
      avatar,
      type,
      count,
      time: Date.now(),
      momentId,
      content,
      previewImage
    });

    // 评论/点赞时同时生成访客记录（带详细类型）
    if (type === 'comment') {
      const commentPreview = content || '发表了评论';
      const shortContent = commentPreview.length > 20 ? commentPreview.substring(0, 20) + '...' : commentPreview;
      generateOneVisitorRecord(Date.now(), 'comment', shortContent);
    } else if (type === 'like') {
      generateOneVisitorRecord(Date.now(), 'like', '赞了你的朋友圈');
    }

    // 更新小红点
    updateMomentsBadge();

    // 尝试渲染通知卡片（如果朋友圈页面可见）
    const container = document.getElementById('moments-container');
    if (container && container.style.display !== 'none') {
      renderMomentsNotificationCard();
    }
  }

  function renderMomentsNotificationCard() {
    try {
      const container = document.getElementById('moments-container');
      if (!container) return;

      // 累加所有通知的条数
      const totalCount = momentsNotifications.reduce((sum, n) => sum + (n.count || 1), 0);
      const latest = momentsNotifications[momentsNotifications.length - 1];
      if (!latest) return;

      // 找到最新一条朋友圈卡片，将通知渲染到其内部
      const firstCard = container.querySelector('.moment-card');
      if (!firstCard) return;
      const momentId = firstCard.dataset.momentId;
      const notificationWrapper = firstCard.querySelector('.moment-notification');
      const notificationInner = firstCard.querySelector('.moment-notification-inner');
      if (!notificationWrapper || !notificationInner) return;

      const avatar = notificationInner.querySelector('.notification-avatar');
      const text = notificationInner.querySelector('.notification-text');
      if (avatar) {
        // 实时获取系统（伴侣）最新头像，确保跟随 Home 页更新
        var displayAvatar = latest.avatar || '';
        var displayName = latest.name || '';
        // 如果是最新一条系统通知，使用缓存的最新值
        if (latest.name === getPartnerName() || (friendList.length > 0 && latest.name === friendList[0].name)) {
          displayAvatar = getPartnerAvatar();
          displayName = getPartnerName();
        }
        avatar.src = displayAvatar;
        avatar.alt = displayName;
      }
      if (text) text.textContent = totalCount + '条新消息';

      notificationInner.onclick = () => {
        openNotificationDetailPanel();
      };

      notificationWrapper.style.display = 'block';
      notificationInner.classList.add('active');

      // 同时隐藏封面下方的旧通知（如果存在）
      const oldWrapper = container.querySelector('#momentsNotificationWrapper');
      if (oldWrapper) oldWrapper.style.display = 'none';
    } catch (e) {
      console.error('renderMomentsNotificationCard error:', e);
    }
  }

  function hideMomentsNotificationCard() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    // 隐藏封面下方的旧通知
    const wrapper = container.querySelector('#momentsNotificationWrapper');
    const card = container.querySelector('#momentsNotificationCard');
    if (wrapper) wrapper.style.display = 'none';
    if (card) card.classList.remove('active');
    
    // 隐藏最新卡片内的通知
    const firstCard = container.querySelector('.moment-card');
    if (firstCard) {
      const notificationWrapper = firstCard.querySelector('.moment-notification');
      const notificationInner = firstCard.querySelector('.moment-notification-inner');
      if (notificationWrapper) notificationWrapper.style.display = 'none';
      if (notificationInner) notificationInner.classList.remove('active');
    }
  }

  function scrollToFirstNotifiedMoment() {
    // 清除通知状态
    momentsNotifications = [];
    hideMomentsNotificationCard();
  }

  // ========== Notification Detail Panel ==========
  function openNotificationDetailPanel() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    const panel = container.querySelector('#notificationDetailPanel');
    if (panel) {
      renderNotificationDetailList();
      panel.classList.add('active');
    }
  }

  function closeNotificationDetailPanel() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    const panel = container.querySelector('#notificationDetailPanel');
    if (panel) {
      panel.classList.remove('active');
    }
    // 关闭面板后清空通知
    momentsNotifications = [];
    hideMomentsNotificationCard();
    clearMomentsBadge();
  }

  function renderNotificationDetailList() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    const body = container.querySelector('#notificationDetailBody');
    if (!body) return;

    if (momentsNotifications.length === 0) {
      body.innerHTML = '<div class="notification-detail-empty">暂无消息</div>';
      return;
    }

    const sorted = [...momentsNotifications].sort((a, b) => b.time - a.time);

    const html = sorted.map(n => {
      const timeStr = formatMomentTime(n.time);
      const isLike = n.type === 'like';

      // 实时获取系统（伴侣）最新头像和昵称
      var displayAvatar = n.avatar || '';
      var displayName = n.name || '';
      if (n.name === getPartnerName() || (friendList.length > 0 && n.name === friendList[0].name)) {
        displayAvatar = getPartnerAvatar();
        displayName = getPartnerName();
      }

      let previewHtml = '';
      // 始终从朋友圈数据中获取预览
      var moment = momentsData.find(function(m) { return m.id === n.momentId; });
      if (n.previewImage) {
        previewHtml = '<img class="detail-preview" src="' + n.previewImage + '" alt="">';
      } else if (moment) {
        if (moment.images && moment.images.length > 0) {
          previewHtml = '<img class="detail-preview" src="' + moment.images[0] + '" alt="">';
        } else if (moment.text) {
          var t = moment.text.length > 8 ? moment.text.substring(0, 8) + '...' : moment.text;
          previewHtml = '<div class="detail-preview-text">' + t + '</div>';
        }
      }

      const actionHtml = isLike
        ? '<div class="detail-action"><svg class="heart-icon" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></div>'
        : '<div class="detail-action-text">' + (n.content || '') + '</div>';

      return '<div class="notification-detail-item" data-moment-id="' + (n.momentId || '') + '">'
        + '<img class="detail-avatar" src="' + displayAvatar + '" alt="' + displayName + '">'
        + '<div class="detail-content">'
        + '<div class="detail-name">' + displayName + '</div>'
        + actionHtml
        + '<div class="detail-time">' + timeStr + '</div>'
        + '</div>'
        + previewHtml
        + '</div>';
    }).join('');

    body.innerHTML = html;

    body.querySelectorAll('.notification-detail-item').forEach(function(item) {
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        var mid = this.getAttribute('data-moment-id');
        if (mid) {
          handleNotificationItemClick(mid);
        }
      });
    });
  }

  function clearAllNotifications() {
    momentsNotifications = [];
    hideMomentsNotificationCard();
    clearMomentsBadge();
    renderNotificationDetailList();
  }

  function handleNotificationItemClick(momentId) {
    if (!momentId) return;
    closeNotificationDetailPanel();
    setTimeout(function() {
      var card = document.querySelector('.moment-card[data-moment-id="' + momentId + '"]');
      if (!card) {
        card = document.querySelector('.moment-card[data-moment-id="' + Number(momentId) + '"]');
      }
      if (card) {
        // 使用 scrollIntoView 滚动到卡片位置
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // 高亮闪烁效果
        card.style.transition = 'background 0.3s ease';
        card.style.background = 'rgba(87, 107, 149, 0.15)';
        setTimeout(function() { card.style.background = ''; }, 1500);
      }
    }, 100);
  }

  function toggleCommentEmojiPanel() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const panel = container.querySelector('#commentEmojiPanel');
    const toggleBtn = container.querySelector('.emoji-toggle-btn');
    
    commentEmojiPanelOpen = !commentEmojiPanelOpen;
    if (commentEmojiPanelOpen) {
      panel.classList.add('active');
      toggleBtn.classList.add('active');
      renderCommentEmojiContent();
      // 延迟调整评论输入框位置（等面板渲染完成）
      requestAnimationFrame(() => {
        const popup = container.querySelector('#commentPopup');
        if (popup) popup.style.bottom = panel.offsetHeight + 'px';
      });
    } else {
      panel.classList.remove('active');
      toggleBtn.classList.remove('active');
      const popup = container.querySelector('#commentPopup');
      if (popup) popup.style.bottom = '0';
    }
  }

  function closeCommentEmojiPanel() {
    commentEmojiPanelOpen = false;
    const container = document.getElementById('moments-container');
    if (container) {
      container.querySelector('#commentEmojiPanel').classList.remove('active');
      const toggleBtn = container.querySelector('.emoji-toggle-btn');
      if (toggleBtn) toggleBtn.classList.remove('active');
      const popup = container.querySelector('#commentPopup');
      if (popup) popup.style.bottom = '0';
    }
  }

  function switchCommentEmojiTab(tab) {
    commentEmojiTab = tab;
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    container.querySelectorAll('.emoji-tab').forEach(t => t.classList.remove('active'));
    container.querySelector(`.emoji-tab[data-tab="${tab}"]`).classList.add('active');
    
    renderCommentEmojiContent();
  }

  function renderCommentEmojiContent() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const body = container.querySelector('#commentEmojiBody');
    let items = [];

    if (commentEmojiTab === 'emoji') {
      body.classList.remove('sticker-mode', 'kaomoji-mode');
      const customEmojis = (window._customEmojis || []).filter(Boolean);
      if (customEmojis.length === 0) {
        body.innerHTML = '<div class="comment-emoji-empty">暂无自定义表情，请在聊天设置中添加</div>';
        return;
      }
      items = customEmojis.map(e => `<div class="comment-emoji-item" onclick="MomentsApp.insertCommentEmoji('${e.replace(/'/g, "\\'")}')">${e}</div>`);
    } else if (commentEmojiTab === 'kaomoji') {
      body.classList.remove('sticker-mode');
      body.classList.add('kaomoji-mode');
      const kaomojiLibrary = (window._kaomojiLibrary || []).filter(Boolean);
      if (kaomojiLibrary.length === 0) {
        body.innerHTML = '<div class="comment-emoji-empty">暂无颜文字，请在字卡库中添加</div>';
        return;
      }
      items = kaomojiLibrary.map(k => `<div class="comment-emoji-item kaomoji-item" onclick="MomentsApp.insertCommentEmoji('${k.replace(/'/g, "\\'")}')">${k}</div>`);
    } else if (commentEmojiTab === 'sticker') {
      body.classList.remove('kaomoji-mode');
      body.classList.add('sticker-mode');
      let _stickerLib = [];
      if (typeof window !== 'undefined' && window._stickerLibrary && Array.isArray(window._stickerLibrary)) {
        _stickerLib = window._stickerLibrary;
      } else if (typeof stickerLibrary !== 'undefined' && Array.isArray(stickerLibrary)) {
        _stickerLib = stickerLibrary;
      }
      const stickerLibraryFiltered = _stickerLib.filter(Boolean);
      if (stickerLibraryFiltered.length === 0) {
        body.innerHTML = '<div class="comment-emoji-empty">暂无表情包，请在表情包管理中添加</div>';
        return;
      }
      
      // 获取表情包分组
      const groups = (window.customStickerGroups || []).filter(g => !g.disabled);
      const hasGroups = groups && groups.length > 0;
      
      if (hasGroups) {
        // 有分组时，渲染子标签栏 + 按选中分组显示表情包
        if (typeof MomentsApp._activeStickerGroup === 'undefined') MomentsApp._activeStickerGroup = 'all';
        const activeGroup = MomentsApp._activeStickerGroup;
        
        // 计算每个分组的数量
        const inGroup = new Set();
        groups.forEach(g => (g.items || []).forEach(t => { const i = stickerLibraryFiltered.indexOf(t); if (i >= 0) inGroup.add(i); }));
        const ungroupedCount = stickerLibraryFiltered.filter((_, i) => !inGroup.has(i)).length;
        
        let html = '<div class="moments-sticker-subtabs" style="display:flex;gap:4px;padding:6px 8px;overflow-x:auto;scrollbar-width:none;">';
        html += `<button class="moments-sticker-subtab ${activeGroup === 'all' ? 'active' : ''}" onclick="MomentsApp.switchStickerSubtab('all')" style="flex-shrink:0;padding:4px 10px;border-radius:14px;font-size:11px;border:1px solid var(--border-color);background:${activeGroup === 'all' ? 'var(--accent-color)' : 'var(--primary-bg)'};color:${activeGroup === 'all' ? '#fff' : 'var(--text-secondary)'};cursor:pointer;font-family:var(--font-family);">全部</button>`;
        groups.forEach(g => {
          const gId = String(g.id);
          const cnt = (g.items || []).filter(t => stickerLibraryFiltered.includes(t)).length;
          if (cnt > 0) {
            html += `<button class="moments-sticker-subtab ${activeGroup === gId ? 'active' : ''}" onclick="MomentsApp.switchStickerSubtab('${gId}')" style="flex-shrink:0;padding:4px 10px;border-radius:14px;font-size:11px;border:1px solid ${activeGroup === gId ? g.color : 'var(--border-color)'};background:${activeGroup === gId ? g.color : 'var(--primary-bg)'};color:${activeGroup === gId ? '#fff' : 'var(--text-secondary)'};cursor:pointer;font-family:var(--font-family);">${g.name}</button>`;
          }
        });
        if (ungroupedCount > 0) {
          html += `<button class="moments-sticker-subtab ${activeGroup === 'ungrouped' ? 'active' : ''}" onclick="MomentsApp.switchStickerSubtab('ungrouped')" style="flex-shrink:0;padding:4px 10px;border-radius:14px;font-size:11px;border:1px solid var(--border-color);background:${activeGroup === 'ungrouped' ? '#868E96' : 'var(--primary-bg)'};color:${activeGroup === 'ungrouped' ? '#fff' : 'var(--text-secondary)'};cursor:pointer;font-family:var(--font-family);">未分组</button>`;
        }
        html += '</div>';
        
        // 根据选中分组渲染表情包
        html += '<div class="moments-sticker-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:4px 8px 8px;">';
        let filteredItems = [];
        if (activeGroup === 'all') {
          filteredItems = stickerLibraryFiltered.map((text, idx) => ({ text, idx }));
        } else if (activeGroup === 'ungrouped') {
          filteredItems = stickerLibraryFiltered.map((text, idx) => ({ text, idx })).filter(x => !inGroup.has(x.idx));
        } else {
          const g = groups.find(g => String(g.id) === activeGroup);
          if (g) {
            filteredItems = (g.items || []).map(t => ({ text: t, idx: stickerLibraryFiltered.indexOf(t) })).filter(x => x.idx >= 0);
          }
        }
        filteredItems.forEach(({ text, idx }) => {
          html += `<div class="comment-emoji-item sticker-item" onclick="MomentsApp.selectCommentSticker(${idx})"><img src="${text}" alt="表情包"></div>`;
        });
        html += '</div>';
        
        body.innerHTML = html;
      } else {
        let html = '<div class="moments-sticker-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:4px 8px 8px;">';
        html += stickerLibraryFiltered.map((s, i) => `<div class="comment-emoji-item sticker-item" onclick="MomentsApp.selectCommentSticker(${i})"><img src="${s}" alt="表情包"></div>`).join('');
        html += '</div>';
        body.innerHTML = html;
      }
      return;
    }

    body.innerHTML = items.join('');
  }

  function insertCommentEmoji(emoji) {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const input = container.querySelector('#commentInput');
    if (input) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const val = input.value;
      input.value = val.substring(0, start) + emoji + val.substring(end);
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    }
  }

  function switchStickerSubtab(groupId) {
    MomentsApp._activeStickerGroup = groupId;
    renderCommentEmojiContent();
  }

  function selectCommentSticker(index) {
    let _stickerLib = [];
    if (typeof window !== 'undefined' && window._stickerLibrary && Array.isArray(window._stickerLibrary)) {
      _stickerLib = window._stickerLibrary;
    } else if (typeof stickerLibrary !== 'undefined' && Array.isArray(stickerLibrary)) {
      _stickerLib = stickerLibrary;
    }
    const stickerLibraryFiltered = _stickerLib.filter(Boolean);
    if (index >= 0 && index < stickerLibraryFiltered.length) {
      pendingCommentSticker = stickerLibraryFiltered[index];
      // 显示预览
      showCommentStickerPreview(pendingCommentSticker);
      // 关闭表情面板，用户可以继续输入文字后一起发送
      closeCommentEmojiPanel();
    }
  }

  function showCommentStickerPreview(stickerUrl) {
    const container = document.getElementById('moments-container');
    if (!container) return;
    const preview = container.querySelector('#commentStickerPreview');
    if (preview) {
      preview.querySelector('img').src = stickerUrl;
      preview.classList.add('active');
      preview.style.display = 'flex';
    }
  }

  function removePendingCommentSticker() {
    pendingCommentSticker = null;
    const container = document.getElementById('moments-container');
    if (!container) return;
    const preview = container.querySelector('#commentStickerPreview');
    if (preview) {
      preview.classList.remove('active');
      preview.style.display = 'none';
      preview.querySelector('img').src = '';
    }
  }

  // ========== Comment Toggle ==========
  let currentCommentMomentId = null;
  let replyToName = null;

  function toggleComment(momentId) {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const popup = container.querySelector('#commentPopup');
    if (currentCommentMomentId === momentId && popup.classList.contains('active')) {
      closeAllPanels();
    } else {
      openComment(momentId);
    }
  }

  function openComment(momentId) {
    currentCommentMomentId = momentId;
    replyToName = null;
    pendingCommentSticker = null;
    commentEmojiPanelOpen = false;
    
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const popup = container.querySelector('#commentPopup');
    const input = container.querySelector('#commentInput');
    // 重置输入框位置
    popup.style.bottom = '0';
    popup.classList.add('active');
    input.value = '';
    input.placeholder = '写评论...';
    input.focus();
    
    // 隐藏表情包预览
    const stickerPreview = container.querySelector('#commentStickerPreview');
    if (stickerPreview) {
      stickerPreview.classList.remove('active');
      stickerPreview.style.display = 'none';
      stickerPreview.querySelector('img').src = '';
    }
    // 关闭表情面板
    container.querySelector('#commentEmojiPanel').classList.remove('active');
    const toggleBtn = container.querySelector('.emoji-toggle-btn');
    if (toggleBtn) toggleBtn.classList.remove('active');
  }

  function replyToComment(momentId, commentIdx, name) {
    currentCommentMomentId = momentId;
    replyToName = name;
    
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const popup = container.querySelector('#commentPopup');
    const input = container.querySelector('#commentInput');
    popup.classList.add('active');
    input.value = '';
    input.placeholder = `回复 ${name}：`;
    input.focus();
  }

  function submitComment() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const input = container.querySelector('#commentInput');
    const text = input.value.trim();
    
    // 支持发送表情包
    if (!text && !pendingCommentSticker) return;
    if (!currentCommentMomentId) return;

    const m = momentsData.find(x => x.id === currentCommentMomentId);
    if (m) {
      // 支持文字+表情包同时发送
      m.comments.push({
        name: userConfig.name,
        text: text,
        sticker: pendingCommentSticker || undefined,
        replyTo: replyToName || undefined
      });
      pendingCommentSticker = null;
      saveMomentsToStorageSync();
      renderMoments();
      
      // 你发评论后对方自动回复（只要伴侣已配置，且不在冷却中）
      const partnerName = getPartnerName();
      if (partnerName && !_autoReplyCooldown) {
        _autoReplyCooldown = true;
        const replySpeed = getReplySpeed();
        const delay = Math.random() * replySpeed * 1000;
        setTimeout(() => {
          triggerAutoReply(currentCommentMomentId, true);
          // 冷却 3 秒后允许再次触发
          setTimeout(() => { _autoReplyCooldown = false; }, 3000);
        }, delay);
      }
    }
    closeCommentEmojiPanel();
    closeAllPanels();
  }

  // ========== Search ==========
  function openSearchPanel() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    container.querySelector('#searchPanel').classList.add('active');
    container.querySelector('#searchInput').value = '';
    container.querySelector('#searchClear').classList.remove('active');
    container.querySelector('#searchBody').innerHTML = '<div class="search-empty">输入关键词搜索朋友圈内容</div>';
    container.querySelector('#searchInput').focus();
  }

  function closeSearchPanel() {
    const container = document.getElementById('moments-container');
    if (container) {
      container.querySelector('#searchPanel').classList.remove('active');
    }
  }

  // 快捷时间按钮
  function setQuickTime(range) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let fromDate;

    switch (range) {
      case 'today':
        fromDate = today;
        break;
      case 'week':
        fromDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        fromDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        fromDate = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    const container = document.getElementById('moments-container');
    if (container) {
      container.querySelector('#searchDateFrom').value = formatDateValue(fromDate);
      container.querySelector('#searchDateTo').value = formatDateValue(now);
    }
    handleTimeFilterChange();
  }

  function clearTimeFilter() {
    const container = document.getElementById('moments-container');
    if (container) {
      container.querySelector('#searchDateFrom').value = '';
      container.querySelector('#searchDateTo').value = '';
    }
    handleTimeFilterChange();
  }

  function formatDateValue(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 时间筛选变化时：先显示该时间段内所有朋友圈
  function handleTimeFilterChange() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const keyword = container.querySelector('#searchInput').value.trim();
    performSearch(keyword);
  }

  // 输入搜索词时：从已有结果中筛选
  function handleSearchInput() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const keyword = container.querySelector('#searchInput').value.trim();
    const clearBtn = container.querySelector('#searchClear');

    if (keyword) {
      clearBtn.classList.add('active');
    } else {
      clearBtn.classList.remove('active');
    }

    performSearch(keyword);
  }

  function performSearch(keyword) {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const body = container.querySelector('#searchBody');
    const dateFrom = container.querySelector('#searchDateFrom').value;
    const dateTo = container.querySelector('#searchDateTo').value;

    // 第一步：按时间筛选
    let timeFiltered = momentsData;
    if (dateFrom || dateTo) {
      timeFiltered = momentsData.filter(m => {
        let momentDate = parseTimeString(m.time);
        if (!momentDate) return true;
        if (dateFrom) {
          const from = new Date(dateFrom + 'T00:00:00');
          if (momentDate < from) return false;
        }
        if (dateTo) {
          const to = new Date(dateTo + 'T23:59:59');
          if (momentDate > to) return false;
        }
        return true;
      });
    }

    // 如果没有关键词，直接显示时间筛选结果
    if (!keyword) {
      if (timeFiltered.length === 0) {
        body.innerHTML = '<div class="search-empty">该时间段内没有朋友圈</div>';
        return;
      }
      body.innerHTML = timeFiltered.map(m => renderSearchResultItem(m, '')).join('');
      return;
    }

    // 第二步：从时间筛选结果中按关键词过滤
    const results = timeFiltered.filter(m => {
      const textMatch = m.text.toLowerCase().includes(keyword.toLowerCase());
      const nameMatch = m.nickname.toLowerCase().includes(keyword.toLowerCase());
      const commentMatch = m.comments.some(c =>
        c.text.toLowerCase().includes(keyword.toLowerCase()) ||
        c.name.toLowerCase().includes(keyword.toLowerCase())
      );
      return textMatch || nameMatch || commentMatch;
    });

    if (results.length === 0) {
      body.innerHTML = '<div class="search-empty">没有找到相关内容</div>';
      return;
    }

    body.innerHTML = results.map(m => renderSearchResultItem(m, keyword)).join('');
  }

  function renderSearchResultItem(m, keyword) {
    const text = keyword ? highlightKeyword(m.text, keyword) : m.text;
    const name = keyword ? highlightKeyword(m.nickname, keyword) : m.nickname;
    return `
      <div class="search-result-item" onclick="MomentsApp.scrollToMoment(${m.id})">
        <div class="moment-header">
          <img class="moment-avatar" src="${m.avatar}" alt="${m.nickname}">
          <div class="moment-meta">
            <div class="moment-nickname">${name}</div>
            <div class="moment-time">${formatMomentTime(m.time)}</div>
          </div>
        </div>
        <div class="moment-content" style="padding-left:52px;margin-bottom:0">
          <div class="moment-text">${text}</div>
        </div>
      </div>
    `;
  }

  function highlightKeyword(text, keyword) {
    if (!keyword) return text;
    const regex = new RegExp(keyword, 'gi');
    return text.replace(regex, match => `<span class="search-highlight">${match}</span>`);
  }

  // 解析时间字符串为日期对象
  function parseTimeString(timeStr) {
    const now = new Date();

    // 处理 "X小时前"、"X分钟前"
    const hourMatch = timeStr.match(/(\d+)小时前/);
    if (hourMatch) {
      const hours = parseInt(hourMatch[1]);
      return new Date(now.getTime() - hours * 60 * 60 * 1000);
    }

    const minMatch = timeStr.match(/(\d+)分钟前/);
    if (minMatch) {
      const mins = parseInt(minMatch[1]);
      return new Date(now.getTime() - mins * 60 * 1000);
    }

    // 处理 "昨天"
    if (timeStr === '昨天') {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return yesterday;
    }

    // 处理 "X天前"
    const dayMatch = timeStr.match(/(\d+)天前/);
    if (dayMatch) {
      const days = parseInt(dayMatch[1]);
      return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    }

    // 处理 "X月X日"
    const monthDayMatch = timeStr.match(/(\d+)月(\d+)日/);
    if (monthDayMatch) {
      const month = parseInt(monthDayMatch[1]) - 1;
      const day = parseInt(monthDayMatch[2]);
      return new Date(now.getFullYear(), month, day);
    }

    // 处理完整日期 "2024-01-15" 或 "2024/01/15"
    const fullDateMatch = timeStr.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (fullDateMatch) {
      const year = parseInt(fullDateMatch[1]);
      const month = parseInt(fullDateMatch[2]) - 1;
      const day = parseInt(fullDateMatch[3]);
      return new Date(year, month, day);
    }

    return null;
  }

  function clearSearchInput() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    container.querySelector('#searchInput').value = '';
    container.querySelector('#searchDateFrom').value = '';
    container.querySelector('#searchDateTo').value = '';
    container.querySelector('#searchClear').classList.remove('active');
    container.querySelector('#searchBody').innerHTML = '<div class="search-empty">输入关键词搜索朋友圈内容</div>';
    container.querySelector('#searchInput').focus();
  }

  function scrollToMoment(momentId) {
    closeSearchPanel();
    
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const cards = container.querySelectorAll('.moment-card');
    const idx = momentsData.findIndex(m => m.id === momentId);
    if (idx >= 0 && cards[idx]) {
      cards[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
      cards[idx].style.background = '#fffbe6';
      setTimeout(() => {
        cards[idx].style.background = '#fff';
      }, 1500);
    }
  }

  // ========== Collection Panel ==========
  function openCollectionPanel() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    container.querySelector('#collectionPanel').classList.add('active');
    renderCollection();
  }

  function closeCollectionPanel() {
    const container = document.getElementById('moments-container');
    if (container) {
      container.querySelector('#collectionPanel').classList.remove('active');
    }
  }

  async function renderCollection() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const body = container.querySelector('#collectionBody');

    // 先恢复 IndexedDB 中的图片引用
    await restoreImagesFromIDB();

    const collected = momentsData.filter(m => m.collected);

    if (collected.length === 0) {
      body.innerHTML = '<div class="collection-empty">暂无收藏</div>';
      return;
    }

    body.innerHTML = collected.map(m => {
      const imagesHtml = m.images.length > 0 ? `
        <div class="moment-images">
          ${m.images.map((img, idx) => `<img src="${img}" alt="图片" onclick="MomentsApp.openPreview(${m.id}, ${idx}); MomentsApp.closeCollectionPanel();">`).join('')}
        </div>
      ` : '';
      const locationHtml = m.location ? `<div class="moment-location">📍 ${m.location}</div>` : '';
      const mentionsHtml = m.mentions && m.mentions.length > 0 ? `<div class="moment-mentions">提到了：${m.mentions.join('、')}</div>` : '';

      return `
        <div class="collection-item">
          <div class="moment-header">
            <img class="moment-avatar" src="${m.avatar}" alt="${m.nickname}">
            <div class="moment-meta">
              <div class="moment-nickname">${m.nickname}</div>
              <div class="moment-time">${formatMomentTime(m.time)}</div>
            </div>
          </div>
          <div class="moment-text">${m.text}</div>
          ${imagesHtml}
          ${locationHtml}
          ${mentionsHtml}
        </div>
      `;
    }).join('');
  }

  // ========== Mention Panel ==========
  function openMentionPanel() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    container.querySelector('#mentionPanel').classList.add('active');
    renderMentionList();
  }

  function closeMentionPanel() {
    const container = document.getElementById('moments-container');
    if (container) {
      container.querySelector('#mentionPanel').classList.remove('active');
    }
    window.mentionPanelCallback = null;
  }

  function renderMentionList() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const list = container.querySelector('#mentionList');
    const search = container.querySelector('#mentionSearch').value.toLowerCase();
    
    const filtered = momentsFriends.filter(f => f.name.toLowerCase().includes(search));
    
    list.innerHTML = filtered.map(f => `
      <div class="mention-item ${tempMentions.includes(f.name) ? 'selected' : ''}" onclick="MomentsApp.toggleMention('${f.name.replace(/'/g, "\\'")}')">
        <img src="${f.avatar}" alt="${f.name}">
        <span>${f.name}</span>
      </div>
    `).join('');
  }

  function filterMentions() {
    renderMentionList();
  }

  function toggleMention(name) {
    const idx = tempMentions.indexOf(name);
    if (idx >= 0) {
      tempMentions.splice(idx, 1);
    } else {
      tempMentions.push(name);
    }
    renderMentionList();
    updateMentionsDisplay();
  }

  function confirmMentions() {
    if (window.mentionPanelCallback) {
      window.mentionPanelCallback([...tempMentions]);
      window.mentionPanelCallback = null;
    } else {
      updateMentionsDisplay();
    }
    closeMentionPanel();
  }

  function updateMentionsDisplay() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const display = container.querySelector('#publishMentionsDisplay');
    const text = container.querySelector('#mentionsText');
    
    if (tempMentions.length > 0) {
      display.style.display = 'flex';
      text.textContent = `提到了：${tempMentions.join('、')}`;
    } else {
      display.style.display = 'none';
    }
  }

  // ========== Location Panel ==========
  function openLocationPanel() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    container.querySelector('#locationPanel').classList.add('active');
    container.querySelector('#locationInput').value = tempLocation;
  }

  function closeLocationPanel() {
    const container = document.getElementById('moments-container');
    if (container) {
      container.querySelector('#locationPanel').classList.remove('active');
    }
    window.locationPanelCallback = null;
  }

  function confirmLocation() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const loc = container.querySelector('#locationInput').value.trim();

    if (window.locationPanelCallback) {
      window.locationPanelCallback(loc);
      window.locationPanelCallback = null;
    } else {
      tempLocation = loc;
      const display = container.querySelector('#locationText');

      if (tempLocation) {
        display.textContent = tempLocation;
        display.style.color = '#576b95';
      } else {
        display.textContent = '所在位置';
        display.style.color = '#576b95';
      }
    }

    closeLocationPanel();
  }

  // ========== Partner Posts (对方主动发朋友圈) ==========
  const partnerPostTexts = [
    "今天天气真好呀 ☀️",
    "心情不错，分享一首歌 🎵",
    "忙碌的一天终于结束了 🌙",
    "刚看到一部超好看的电影 🎬",
    "分享今日份美食 🍜",
    "周末就要好好放松呀~",
    "最近在学新东西，好有趣！",
    "有人一起去旅行吗？✈️"
  ];

  function generateRandomImages(count) {
    const images = [];
    for (let i = 0; i < count; i++) {
      const seed = Math.random().toString(36).substring(2, 10);
      // 交替使用 picsum 和 dicebear
      if (Math.random() < 0.5) {
        images.push('https://picsum.photos/seed/' + seed + '/400/400');
      } else {
        images.push('https://api.dicebear.com/7.x/shapes/svg?seed=' + seed + '&backgroundColor=b6e3f4');
      }
    }
    return images;
  }

  function partnerPostMoment() {
    const partnerName = getPartnerName();
    const partnerAvatar = getPartnerAvatar();
    const text = partnerPostTexts[Math.floor(Math.random() * partnerPostTexts.length)];
    const imageCount = Math.floor(Math.random() * 4); // 0-3 张
    const now = Date.now();
    const randomOffset = Math.floor(Math.random() * 24 * 60 * 60 * 1000); // 过去24小时内
    const postTime = now - randomOffset;

    const newMoment = {
      id: postTime,
      avatar: partnerAvatar,
      nickname: partnerName,
      time: postTime,
      text: text,
      images: imageCount > 0 ? generateRandomImages(imageCount) : [],
      sticker: null,
      video: null,
      likes: [],
      likedByMe: false,
      collected: false,
      comments: [],
      mentions: [],
      location: ''
    };

    momentsData.unshift(newMoment);
    saveMomentsToStorageSync();
    renderMoments();

    // 通知用户：对方发了朋友圈
    showMomentsNotification(partnerName, partnerAvatar, 'comment', 1, newMoment.id, '发布了新朋友圈', getMomentPreviewImage(newMoment));
  }

  // ========== Trigger Moments Interaction (core.js calls this) ==========
  function triggerMomentsInteraction() {
    // 1. 3% 概率：偷偷看朋友圈
    if (Math.random() < 0.03) {
      generateOneVisitorRecord(Date.now());
      // 在朋友圈列表顶部显示通知
      showMomentsNotification(getPartnerName(), getPartnerAvatar(), 'comment', 1, null, '对方偷偷看了你的朋友圈', '');
    }

    // 找到最新一条"我"发的朋友圈
    const myLatestMoment = momentsData.find(m => m.nickname === userConfig.name);

    // 2. 10% 概率：对方评论最新一条我发的朋友圈
    if (myLatestMoment && Math.random() < 0.1) {
      const partnerName = getPartnerName();
      const randomComments = [
        '赞！',
        '好棒呀~',
        '不错不错',
        '哈哈',
        '太好看了',
        '我也想试试',
        '真有趣',
        '羡慕了',
        '下次一起呀',
        '记录生活真好'
      ];
      const commentText = randomComments[Math.floor(Math.random() * randomComments.length)];
      myLatestMoment.comments.push({
        name: partnerName,
        text: commentText
      });
      saveMomentsToStorageSync();
      renderMoments();
      showMomentsNotification(partnerName, getPartnerAvatar(), 'comment', 1, myLatestMoment.id, commentText, getMomentPreviewImage(myLatestMoment));
    }

    // 3. 10% 概率：对方点赞最新一条我发的朋友圈
    if (myLatestMoment && Math.random() < 0.1) {
      const partnerName = getPartnerName();
      if (!myLatestMoment.likes.includes(partnerName)) {
        myLatestMoment.likes.push(partnerName);
        saveMomentsToStorageSync();
        renderMoments();
        showMomentsNotification(partnerName, getPartnerAvatar(), 'like', 1, myLatestMoment.id, '', getMomentPreviewImage(myLatestMoment));
      }
    }

    // 4. 根据 settings.momentsPartnerPostChance 概率：对方发一条朋友圈
    const postChance = (window.settings && window.settings.momentsPartnerPostChance) || 0.05;
    if (Math.random() < postChance) {
      partnerPostMoment();
    }
  }

  // 挂载到 window
  window.triggerMomentsInteraction = triggerMomentsInteraction;

  // ========== Publish ==========
  let publishPhotoCount = 0;
  let publishPhotoBase64List = [];
  let publishVideo = null;
  let publishSticker = null;

  function openPublishPanel() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    container.querySelector('#mask').classList.add('active');
    container.querySelector('#publishPanel').classList.add('active');
    container.querySelector('#publishText').value = '';
    container.querySelector('#mentionsText').textContent = '提醒谁看';
    container.querySelector('#publishMentionsDisplay').style.display = 'none';
    container.querySelector('#locationText').textContent = '所在位置';
    publishPhotoCount = 0;
    publishPhotoBase64List = [];
    publishVideo = null;
    publishSticker = null;
    tempMentions = [];
    tempLocation = '';
    const photosContainer = container.querySelector('#publishPhotos');
    photosContainer.innerHTML = '<div class="add-photo-btn" onclick="MomentsApp.triggerAddPhoto()"></div>';
    container.querySelector('#publishVideoArea').style.display = 'none';
    container.querySelector('#publishStickers').style.display = 'none';
  }

  function triggerAddPhoto() {
    const fileInput = document.getElementById('momentsPhotoInput');
    if (fileInput) {
      fileInput.value = '';
      fileInput.click();
    }
  }

  function handlePhotoUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const container = document.getElementById('moments-container');
    if (!container) return;

    const photosContainer = container.querySelector('#publishPhotos');
    const addBtn = photosContainer.querySelector('.add-photo-btn');

    for (let i = 0; i < files.length; i++) {
      if (publishPhotoCount >= 9) break;
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const reader = new FileReader();
      reader.onload = async function(ev) {
        const base64 = ev.target.result;
        // 压缩图片后再存储，减少 localStorage/IndexedDB 压力
        const compressed = await compressImage(base64, COMPRESS_MAX_WIDTH, COMPRESS_QUALITY);
        publishPhotoBase64List.push(compressed);
        publishPhotoCount++;

        const div = document.createElement('div');
        div.className = 'publish-photo-item';
        div.innerHTML = `
          <img src="${compressed}" alt="照片">
          <div class="remove-photo" onclick="MomentsApp.removeDemoPhoto(this)">
            <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </div>
        `;
        photosContainer.insertBefore(div, addBtn);
        if (publishPhotoCount >= 9 && addBtn) addBtn.style.display = 'none';
      };
      reader.readAsDataURL(file);
    }

    // 清空 input 以便重复选择同一文件
    e.target.value = '';
  }

  function triggerAddVideo() {
    const fileInput = document.getElementById('momentsVideoInput');
    if (fileInput) {
      fileInput.value = '';
      fileInput.click();
    }
  }

  function handleVideoUpload(e) {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('video/')) return;

    const container = document.getElementById('moments-container');
    if (!container) return;

    // 用 video 元素获取封面和时长
    const videoUrl = URL.createObjectURL(file);
    const videoEl = document.createElement('video');
    videoEl.preload = 'metadata';
    videoEl.src = videoUrl;

    videoEl.onloadeddata = function() {
      // 生成封面
      const canvas = document.createElement('canvas');
      canvas.width = videoEl.videoWidth || 400;
      canvas.height = videoEl.videoHeight || 300;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      const coverBase64 = canvas.toDataURL('image/jpeg', 0.7);

      // 计算时长
      const duration = Math.round(videoEl.duration);
      const mins = Math.floor(duration / 60);
      const secs = duration % 60;
      const durationStr = `${mins}:${String(secs).padStart(2, '0')}`;

      // 将视频文件转为 base64 持久化保存
      const reader = new FileReader();
      reader.onload = function(ev) {
        publishVideo = {
          cover: coverBase64,
          url: ev.target.result,
          duration: durationStr,
          file: file
        };

        container.querySelector('#publishVideoCover').src = coverBase64;
        container.querySelector('#publishVideoDuration').textContent = durationStr;
        container.querySelector('#publishVideoArea').style.display = 'block';
      };
      reader.readAsDataURL(file);
    };

    e.target.value = '';
  }

  function removeDemoPhoto(el) {
    const imgSrc = el.parentElement.querySelector('img').src;
    // 从 base64 列表中移除
    const idx = publishPhotoBase64List.indexOf(imgSrc);
    if (idx >= 0) publishPhotoBase64List.splice(idx, 1);
    el.parentElement.remove();
    publishPhotoCount--;
    
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const photosContainer = container.querySelector('#publishPhotos');
    const addBtn = photosContainer.querySelector('.add-photo-btn');
    if (addBtn) addBtn.style.display = '';
  }

  function removePublishVideo() {
    if (publishVideo && publishVideo.url) {
      URL.revokeObjectURL(publishVideo.url);
    }
    publishVideo = null;
    
    const container = document.getElementById('moments-container');
    if (container) {
      container.querySelector('#publishVideoArea').style.display = 'none';
    }
  }

  // ========== Publish Sticker ==========
  function togglePublishStickerPanel() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const panel = container.querySelector('#publishStickerPanel');
    const body = container.querySelector('#publishStickerBody');
    
    panel.classList.toggle('active');
    
    if (panel.classList.contains('active')) {
      renderPublishStickerBody();
    }
  }

  function closePublishStickerPanel() {
    const container = document.getElementById('moments-container');
    if (container) {
      container.querySelector('#publishStickerPanel').classList.remove('active');
    }
  }

  function renderPublishStickerBody() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const body = container.querySelector('#publishStickerBody');
    let _stickerLib = [];
    if (typeof window !== 'undefined' && window._stickerLibrary && Array.isArray(window._stickerLibrary)) {
      _stickerLib = window._stickerLibrary;
    } else if (typeof stickerLibrary !== 'undefined' && Array.isArray(stickerLibrary)) {
      _stickerLib = stickerLibrary;
    }
    const stickerLibraryFiltered = _stickerLib.filter(Boolean);
    
    if (stickerLibraryFiltered.length === 0) {
      body.innerHTML = '<div class="publish-sticker-empty">暂无表情包，请在表情包管理中添加</div>';
      return;
    }
    
    // 获取表情包分组
    const groups = (window.customStickerGroups || []).filter(g => !g.disabled);
    const hasGroups = groups && groups.length > 0;
    
    if (hasGroups) {
      // 有分组时，渲染子标签栏 + 按选中分组显示表情包
      if (typeof MomentsApp._activePublishStickerGroup === 'undefined') MomentsApp._activePublishStickerGroup = 'all';
      const activeGroup = MomentsApp._activePublishStickerGroup;
      
      const inGroup = new Set();
      groups.forEach(g => (g.items || []).forEach(t => { const i = stickerLibraryFiltered.indexOf(t); if (i >= 0) inGroup.add(i); }));
      const ungroupedCount = stickerLibraryFiltered.filter((_, i) => !inGroup.has(i)).length;
      
      let html = '<div class="moments-sticker-subtabs" style="display:flex;gap:4px;padding:6px 8px;overflow-x:auto;scrollbar-width:none;">';
      html += `<button class="moments-sticker-subtab ${activeGroup === 'all' ? 'active' : ''}" onclick="MomentsApp.switchPublishStickerSubtab('all')" style="flex-shrink:0;padding:4px 10px;border-radius:14px;font-size:11px;border:1px solid var(--border-color);background:${activeGroup === 'all' ? 'var(--accent-color)' : 'var(--primary-bg)'};color:${activeGroup === 'all' ? '#fff' : 'var(--text-secondary)'};cursor:pointer;font-family:var(--font-family);">全部</button>`;
      groups.forEach(g => {
        const gId = String(g.id);
        const cnt = (g.items || []).filter(t => stickerLibraryFiltered.includes(t)).length;
        if (cnt > 0) {
          html += `<button class="moments-sticker-subtab ${activeGroup === gId ? 'active' : ''}" onclick="MomentsApp.switchPublishStickerSubtab('${gId}')" style="flex-shrink:0;padding:4px 10px;border-radius:14px;font-size:11px;border:1px solid ${activeGroup === gId ? g.color : 'var(--border-color)'};background:${activeGroup === gId ? g.color : 'var(--primary-bg)'};color:${activeGroup === gId ? '#fff' : 'var(--text-secondary)'};cursor:pointer;font-family:var(--font-family);">${g.name}</button>`;
        }
      });
      if (ungroupedCount > 0) {
        html += `<button class="moments-sticker-subtab ${activeGroup === 'ungrouped' ? 'active' : ''}" onclick="MomentsApp.switchPublishStickerSubtab('ungrouped')" style="flex-shrink:0;padding:4px 10px;border-radius:14px;font-size:11px;border:1px solid var(--border-color);background:${activeGroup === 'ungrouped' ? '#868E96' : 'var(--primary-bg)'};color:${activeGroup === 'ungrouped' ? '#fff' : 'var(--text-secondary)'};cursor:pointer;font-family:var(--font-family);">未分组</button>`;
      }
      html += '</div>';
      
      html += '<div class="moments-sticker-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:4px 8px 8px;">';
      let filteredItems = [];
      if (activeGroup === 'all') {
        filteredItems = stickerLibraryFiltered.map((text, idx) => ({ text, idx }));
      } else if (activeGroup === 'ungrouped') {
        filteredItems = stickerLibraryFiltered.map((text, idx) => ({ text, idx })).filter(x => !inGroup.has(x.idx));
      } else {
        const g = groups.find(g => String(g.id) === activeGroup);
        if (g) {
          filteredItems = (g.items || []).map(t => ({ text: t, idx: stickerLibraryFiltered.indexOf(t) })).filter(x => x.idx >= 0);
        }
      }
      filteredItems.forEach(({ text, idx }) => {
        html += `<div class="publish-sticker-select-item" onclick="MomentsApp.selectPublishSticker(${idx})"><img src="${text}" alt="表情包"></div>`;
      });
      html += '</div>';
      
      body.innerHTML = html;
    } else {
      let html = '<div class="moments-sticker-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:4px 8px 8px;">';
      html += stickerLibraryFiltered.map((s, i) => `
        <div class="publish-sticker-select-item" onclick="MomentsApp.selectPublishSticker(${i})">
          <img src="${s}" alt="表情包">
        </div>
      `).join('');
      html += '</div>';
      body.innerHTML = html;
    }
  }

  function switchPublishStickerSubtab(groupId) {
    MomentsApp._activePublishStickerGroup = groupId;
    renderPublishStickerBody();
  }

  function selectPublishSticker(index) {
    let _stickerLib = [];
    if (typeof window !== 'undefined' && window._stickerLibrary && Array.isArray(window._stickerLibrary)) {
      _stickerLib = window._stickerLibrary;
    } else if (typeof stickerLibrary !== 'undefined' && Array.isArray(stickerLibrary)) {
      _stickerLib = stickerLibrary;
    }
    const stickerLibraryFiltered = _stickerLib.filter(Boolean);
    if (index < 0 || index >= stickerLibraryFiltered.length) return;
    
    publishSticker = stickerLibraryFiltered[index];
    
    const container = document.getElementById('moments-container');
    if (container) {
      container.querySelector('#publishStickerImg').src = publishSticker;
      container.querySelector('#publishStickers').style.display = 'block';
    }
    
    closePublishStickerPanel();
  }

  function removePublishSticker() {
    publishSticker = null;
    const container = document.getElementById('moments-container');
    if (container) {
      container.querySelector('#publishStickers').style.display = 'none';
    }
  }

  function publishMoment() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const text = container.querySelector('#publishText').value.trim();
    // 支持纯表情包发布
    if (!text && !publishVideo && !publishSticker && publishPhotoBase64List.length === 0) return;

    const momentId = Date.now();

    // 处理图片：先保留原始 base64，后台异步压缩存 IndexedDB
    const images = [...publishPhotoBase64List];
    // 后台处理大图片：压缩后存 IndexedDB，然后更新为引用
    setTimeout(async () => {
      let hasLargeImage = false;
      const moment = momentsData.find(m => m.id === momentId);
      if (!moment) return;
      for (let i = 0; i < moment.images.length; i++) {
        const img = moment.images[i];
        if (typeof img === 'string' && img.length > IDB_IMAGE_THRESHOLD && !img.startsWith('__IDB_IMG__')) {
          const compressed = await compressImage(img, COMPRESS_MAX_WIDTH, COMPRESS_QUALITY);
          await saveImageToIDB(momentId, i, compressed);
          moment.images[i] = '__IDB_IMG__' + momentId + '_' + i;
          hasLargeImage = true;
        }
      }
      if (hasLargeImage) {
        saveMomentsToStorageSync();
      }
    }, 100);

    // 处理视频：大视频存 IndexedDB
    let videoData = null;
    if (publishVideo) {
      if (publishVideo.url && publishVideo.url.length > 1000) {
        saveVideoToIDB(momentId, publishVideo.url);
        videoData = { cover: publishVideo.cover, url: '__IDB__' + momentId, duration: publishVideo.duration };
      } else {
        videoData = { ...publishVideo };
      }
    }

    const newMoment = {
      id: momentId,
      avatar: userConfig.avatar,
      nickname: userConfig.name,
      time: Date.now(),
      text: text,
      images: images,
      sticker: publishSticker || null,
      video: videoData,
      likes: [],
      likedByMe: false,
      collected: false,
      comments: [],
      mentions: [...tempMentions],
      location: tempLocation
    };

    momentsData.unshift(newMoment);
    saveMomentsToStorageSync();
    renderMoments();
    closeAllPanels();
    container.scrollTo({ top: 0, behavior: 'smooth' });

    // TA的手机：实时收藏用户发布的朋友圈
    if (text) {
      const doCollect = () => {
        if (typeof window.TaPhoneApp === 'object' && typeof window.TaPhoneApp.tryCollectMoment === 'function') {
          window.TaPhoneApp.tryCollectMoment(text, newMoment.time, newMoment);
        }
      };
      if (typeof window.TaPhoneApp === 'object') {
        doCollect();
      } else {
        // 动态加载 ta-phone.js 后再收藏
        const script = document.createElement('script');
        script.src = (window.basePath || '') + 'js/ta-phone.js';
        script.onload = () => {
          if (typeof window.TaPhoneApp === 'object' && typeof window.TaPhoneApp.init === 'function') {
            window.TaPhoneApp.init();
          }
          doCollect();
        };
        document.head.appendChild(script);
      }
    }

    // 延迟后系统自动评论（在设定时间内随机回复）
    var baseSpeed = getReplySpeed(); // 秒
    var autoReplyDelay = Math.random() * baseSpeed * 1000; // 0 ~ baseSpeed秒之间随机
    setTimeout(() => {
      triggerAutoReply(newMoment.id);
    }, autoReplyDelay);
  }

  // ========== Image Preview ==========
  let previewData = { momentId: null, images: [], index: 0 };

  function openPreview(momentId, imgIndex) {
    const m = momentsData.find(x => x.id === momentId);
    if (!m || !m.images.length) return;
    
    previewData = { momentId, images: m.images, index: imgIndex };
    updatePreview();
    
    const container = document.getElementById('moments-container');
    if (container) {
      container.querySelector('#previewOverlay').classList.add('active');
    }
    document.body.style.overflow = 'hidden';
  }

  function openStickerPreview(stickerUrl) {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const overlay = container.querySelector('#previewOverlay');
    const img = container.querySelector('#previewImage');
    
    img.src = stickerUrl;
    overlay.classList.add('active');
    
    // 隐藏计数器
    const counter = container.querySelector('#previewCounter');
    if (counter) counter.style.display = 'none';
    
    document.body.style.overflow = 'hidden';
  }

  function updatePreview() {
    const { images, index } = previewData;
    
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    container.querySelector('#previewImage').src = images[index];
    container.querySelector('#previewCounter').textContent = `${index + 1} / ${images.length}`;
  }

  function closePreview() {
    const container = document.getElementById('moments-container');
    if (container) {
      container.querySelector('#previewOverlay').classList.remove('active');
      container.querySelector('#previewContainer').style.display = '';
      container.querySelector('#previewVideoContainer').style.display = 'none';
      container.querySelector('#previewCounter').style.display = '';
    }
    document.body.style.overflow = '';
    videoPlaying = false;
  }

  // ========== Video Play ==========
  let videoPlaying = false;

  async function playVideo(momentId) {
    const m = momentsData.find(x => x.id === momentId);
    if (!m || !m.video) return;

    previewData = { momentId, images: m.images, index: 0 };

    const container = document.getElementById('moments-container');
    if (!container) return;

    // 显示视频播放器
    container.querySelector('#previewContainer').style.display = 'none';
    container.querySelector('#previewVideoContainer').style.display = 'flex';
    container.querySelector('#previewVideoCover').src = m.video.cover;
    container.querySelector('#previewVideoCover').style.display = 'block';
    const videoPlayer = container.querySelector('#previewVideoPlayer');
    if (videoPlayer) {
      // 从 IndexedDB 加载视频数据
      let videoUrl = m.video.url;
      if (videoUrl && videoUrl.startsWith('__IDB__')) {
        const data = await getVideoFromIDB(momentId);
        if (data) {
          videoUrl = data;
          m.video.url = data; // 缓存到内存
        }
      }
      videoPlayer.src = videoUrl;
      videoPlayer.style.display = 'none';
      videoPlayer.pause();
      videoPlayer.currentTime = 0;
    }
    container.querySelector('#previewCounter').style.display = 'none';
    container.querySelector('#previewVideoInfo').textContent = '点击播放 · ' + (m.video.duration || '');
    videoPlaying = false;
    container.querySelector('.preview-video-play').classList.remove('playing');
    container.querySelector('.preview-video-play svg').innerHTML = '<path d="M8 5v14l11-7z"/>';
    container.querySelector('#previewOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function toggleVideoPlay() {
    const container = document.getElementById('moments-container');
    if (!container) return;

    const videoPlayer = container.querySelector('#previewVideoPlayer');
    const coverImg = container.querySelector('#previewVideoCover');
    const playBtn = container.querySelector('.preview-video-play');
    const info = container.querySelector('#previewVideoInfo');

    if (!videoPlayer) return;

    if (videoPlayer.paused || videoPlayer.ended) {
      // 开始播放
      videoPlayer.style.display = 'block';
      if (coverImg) coverImg.style.display = 'none';
      videoPlayer.play().catch(() => {});
      videoPlaying = true;
      playBtn.classList.add('playing');
      playBtn.querySelector('svg').innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
      info.textContent = '播放中...';
    } else {
      // 暂停
      videoPlayer.pause();
      videoPlaying = false;
      playBtn.classList.remove('playing');
      playBtn.querySelector('svg').innerHTML = '<path d="M8 5v14l11-7z"/>';
      info.textContent = '已暂停 · ' + (previewData && previewData.momentId ? (momentsData.find(x => x.id === previewData.momentId)?.video?.duration || '') : '');
    }

    // 视频结束时重置
    videoPlayer.onended = function() {
      videoPlaying = false;
      playBtn.classList.remove('playing');
      playBtn.querySelector('svg').innerHTML = '<path d="M8 5v14l11-7z"/>';
      info.textContent = '播放结束 · 点击重播';
      if (coverImg) coverImg.style.display = 'block';
      videoPlayer.style.display = 'none';
    };
  }

  function goToMomentDetail() {
    const momentId = previewData.momentId;
    if (!momentId) return;
    closePreview();
    // 关闭所有面板
    closeCollectionPanel();
    closeSearchPanel();
    // 滚动到对应朋友圈并高亮
    scrollToMoment(momentId);
  }

  function prevImage() {
    if (previewData.index > 0) {
      previewData.index--;
      updatePreview();
    }
  }

  function nextImage() {
    if (previewData.index < previewData.images.length - 1) {
      previewData.index++;
      updatePreview();
    }
  }

  // ========== Close Panels ==========
  function closeAllPanels() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    container.querySelector('#mask').classList.remove('active');
    container.querySelector('#publishPanel').classList.remove('active');
    container.querySelector('#commentPopup').classList.remove('active');
    container.querySelector('#commentEmojiPanel').classList.remove('active');
    container.querySelector('#publishStickerPanel').classList.remove('active');
    container.querySelector('#customPanel').classList.remove('active');
    container.querySelector('#mentionPanel').classList.remove('active');
    container.querySelector('#locationPanel').classList.remove('active');
    container.querySelector('#editPanel').classList.remove('active');
    container.querySelector('#beautifyPanel').classList.remove('active');
    container.querySelector('#visitorPanel').classList.remove('active');
    // 隐藏评论表情包预览
    const stickerPreview = container.querySelector('#commentStickerPreview');
    if (stickerPreview) {
      stickerPreview.classList.remove('active');
      stickerPreview.style.display = 'none';
      stickerPreview.querySelector('img').src = '';
    }
    currentCommentMomentId = null;
    replyToName = null;
    currentEditMomentId = null;
    pendingCommentSticker = null;
    commentEmojiPanelOpen = false;
  }

  // ========== Beautify Panel ==========
  function openBeautifyPanel() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    container.querySelector('#mask').classList.add('active');
    container.querySelector('#beautifyPanel').classList.add('active');
    container.querySelector('#beautifyName').value = userConfig.name;
    container.querySelector('#beautifySignature').value = userConfig.signature.replace(/^["']|["']$/g, '');
    const avatarPreview = container.querySelector('#beautifyAvatarPreview');
    avatarPreview.src = userConfig.avatar;
    avatarPreview.dataset.base64 = userConfig.avatar;
    const coverPreview = container.querySelector('#beautifyCoverPreview');
    coverPreview.src = userConfig.coverImage;
    coverPreview.dataset.base64 = userConfig.coverImage;
    renderBeautifyFriendsList();
    // 恢复好友点赞开关状态
    var toggleEl = container.querySelector('#toggleFriendLike');
    if (toggleEl) {
      var friendLikeEnabled = localStorage.getItem('moments_friend_like') === 'true';
      toggleEl.classList.toggle('active', friendLikeEnabled);
    }
    // 恢复互动设置
    var speedSlider = container.querySelector('#beautifyReplySpeed');
    var countMinInput = container.querySelector('#beautifyReplyCountMin');
    var countMaxInput = container.querySelector('#beautifyReplyCountMax');
    if (speedSlider) speedSlider.value = localStorage.getItem('moments_reply_speed') || '5';
    if (countMinInput) countMinInput.value = localStorage.getItem('moments_reply_count_min') || '';
    if (countMaxInput) countMaxInput.value = localStorage.getItem('moments_reply_count_max') || '';
    updateSpeedLabel();
    updateCountLabel();
  }

  function closeBeautifyPanel() {
    const container = document.getElementById('moments-container');
    if (container) {
      container.querySelector('#mask').classList.remove('active');
      container.querySelector('#beautifyPanel').classList.remove('active');
    }
  }

  // ========== Friends List ==========
  let momentsFriends = [];
  // 其他会话的字卡库缓存 { sessionId: string[] }
  let _sessionRepliesCache = {};

  // 从所有会话中读取伴侣信息，生成好友列表
  async function loadAllSessionPartners() {
    const partners = [];
    try {
      const sessions = window.sessionList || [];
      const APP_PREFIX = window.APP_PREFIX || 'CHAT_APP_V3_';
      const currentSessionId = window.SESSION_ID;

      for (let i = 0; i < sessions.length; i++) {
        const sid = sessions[i].id;
        try {
          // 读取该会话的 chatSettings 获取 partnerName
          const settingsKey = APP_PREFIX + sid + '_chatSettings';
          const chatSettings = typeof localforage !== 'undefined' ? await localforage.getItem(settingsKey) : null;
          let name = '梦角';
          let avatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(sid) + '&backgroundColor=c0aede';

          if (chatSettings && typeof chatSettings === 'object') {
            if (chatSettings.partnerName) name = chatSettings.partnerName;
            if (chatSettings.partnerAvatar) avatar = chatSettings.partnerAvatar;
          }

          // 尝试从 localStorage 读取更可靠的伴侣信息
          try {
            const lsProfile = localStorage.getItem('profile_partner');
            if (lsProfile && sid === currentSessionId) {
              const p = JSON.parse(lsProfile);
              if (p.name) name = p.name;
              if (p.avatar) avatar = p.avatar;
            }
          } catch(e) {}

          // 尝试读取该会话的头像
          if (typeof localforage !== 'undefined') {
            try {
              const savedAvatar = await localforage.getItem(APP_PREFIX + sid + '_partnerAvatar');
              if (savedAvatar) avatar = savedAvatar;
            } catch(e) {}
          }

          partners.push({
            id: 'session_' + sid,
            sessionId: sid,
            name: name,
            avatar: avatar,
            isPartner: true,
            isSession: true
          });
        } catch(e) {
          console.warn('[Moments] 读取会话', sid, '信息失败:', e);
        }
      }
    } catch(e) {
      console.warn('[Moments] loadAllSessionPartners 失败:', e);
    }
    return partners;
  }

  // 获取某个会话的字卡库（带缓存）
  async function getSessionReplies(sessionId) {
    // 当前会话直接用全局变量
    if (sessionId === window.SESSION_ID) {
      return (window._customReplies || []).map(r => String(r || '').trim()).filter(Boolean);
    }
    // 检查缓存
    if (_sessionRepliesCache[sessionId]) {
      return _sessionRepliesCache[sessionId];
    }
    // 从 localforage 读取
    try {
      const APP_PREFIX = window.APP_PREFIX || 'CHAT_APP_V3_';
      const key = APP_PREFIX + sessionId + '_customReplies';
      const data = typeof localforage !== 'undefined' ? await localforage.getItem(key) : null;
      const replies = (data || []).map(r => String(r || '').trim()).filter(Boolean);
      _sessionRepliesCache[sessionId] = replies;
      return replies;
    } catch(e) {
      return [];
    }
  }

  // 刷新字卡库缓存（当前会话数据变更时调用）
  function invalidateSessionRepliesCache(sessionId) {
    if (sessionId) {
      delete _sessionRepliesCache[sessionId];
    } else {
      _sessionRepliesCache = {};
    }
  }

  async function loadMomentsFriends() {
    try {
      // 先刷新伴侣信息缓存
      await loadPartnerInfo();

      // 从所有会话自动读取伴侣
      const sessionPartners = await loadAllSessionPartners();

      // 读取手动添加的好友
      let manualFriends = [];
      const data = localStorage.getItem('moments_friends');
      if (data) {
        const allFriends = JSON.parse(data);
        manualFriends = allFriends.filter(function(f) { return !f.isPartner; });
      }

      // 合并：会话伴侣 + 手动好友
      momentsFriends = sessionPartners.concat(manualFriends);

      // 刷新字卡库缓存
      invalidateSessionRepliesCache();
    } catch (e) {
      console.warn('[Moments] loadMomentsFriends 失败:', e);
      // 降级：使用当前伴侣
      momentsFriends = getDefaultPartnerFriend();
    }
  }

  function getDefaultPartnerFriend() {
    return [{ id: 'partner', name: getPartnerName(), avatar: getPartnerAvatar(), isPartner: true }];
  }

  function saveMomentsFriends() {
    // 只保存手动添加的好友（不含会话自动生成的伴侣）
    const manualFriends = momentsFriends.filter(function(f) { return !f.isSession; });
    localStorage.setItem('moments_friends', JSON.stringify(manualFriends));
  }

  function renderBeautifyFriendsList() {
    var container = document.getElementById('moments-container');
    if (!container) return;
    var listEl = container.querySelector('#beautifyFriendsList');
    if (!listEl) return;

    if (momentsFriends.length === 0) {
      listEl.innerHTML = '<div style="color:#999;font-size:13px;padding:8px 0;">暂无好友</div>';
      return;
    }

    listEl.innerHTML = momentsFriends.map(function(f) {
      return '<div class="beautify-friend-item">'
        + '<span class="friend-name">' + (f.name || '') + '</span>'
        + (f.isPartner ? '<span class="friend-tag">伴侣</span>' : '')
        + (!f.isPartner ? '<button class="friend-remove" onclick="MomentsApp.removeFriend(\'' + f.id + '\')">删除</button>' : '')
        + '</div>';
    }).join('');
  }

  function formatSpeed(seconds) {
    seconds = Number(seconds);
    if (seconds < 60) return seconds + '秒';
    if (seconds < 3600) return Math.floor(seconds / 60) + '分钟';
    var h = Math.floor(seconds / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    return m > 0 ? h + '小时' + m + '分' : h + '小时';
  }

  function updateSpeedLabel() {
    var container = document.getElementById('moments-container');
    if (!container) return;
    var slider = container.querySelector('#beautifyReplySpeed');
    var label = container.querySelector('#speedLabel');
    if (slider && label) {
      label.textContent = formatSpeed(slider.value);
      localStorage.setItem('moments_reply_speed', slider.value);
    }
  }

  function updateCountLabel() {
    var container = document.getElementById('moments-container');
    if (!container) return;
    var minInput = container.querySelector('#beautifyReplyCountMin');
    var maxInput = container.querySelector('#beautifyReplyCountMax');
    var label = container.querySelector('#countLabel');
    if (!minInput || !maxInput || !label) return;

    var minVal = minInput.value.trim();
    var maxVal = maxInput.value.trim();

    // 两个都为空 = 随机
    if (!minVal && !maxVal) {
      label.textContent = '随机';
      localStorage.removeItem('moments_reply_count_min');
      localStorage.removeItem('moments_reply_count_max');
      return;
    }

    var min = minVal !== '' ? Math.max(0, Math.min(20, Number(minVal))) : 0;
    var max = maxVal !== '' ? Math.max(0, Math.min(20, Number(maxVal))) : 20;

    // 确保 min <= max
    if (min > max) { var tmp = min; min = max; max = tmp; }

    label.textContent = min + '~' + max + '条';
    localStorage.setItem('moments_reply_count_min', String(min));
    localStorage.setItem('moments_reply_count_max', String(max));
  }

  function getReplySpeed() {
    var saved = localStorage.getItem('moments_reply_speed');
    return saved ? Number(saved) : 5;
  }

  function getReplyCount() {
    var minSaved = localStorage.getItem('moments_reply_count_min');
    var maxSaved = localStorage.getItem('moments_reply_count_max');
    // 都没有设置 = 随机（返回 -1）
    if (!minSaved && !maxSaved) return -1;
    var min = minSaved ? Number(minSaved) : 0;
    var max = maxSaved ? Number(maxSaved) : 20;
    if (min > max) { var tmp = min; min = max; max = tmp; }
    // 在区间内随机
    if (min === max) return min;
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function toggleFriendLikeSwitch() {
    var container = document.getElementById('moments-container');
    if (!container) return;
    var toggleEl = container.querySelector('#toggleFriendLike');
    if (!toggleEl) return;
    var isActive = toggleEl.classList.toggle('active');
    localStorage.setItem('moments_friend_like', isActive ? 'true' : 'false');
  }

  function isFriendLikeEnabled() {
    return localStorage.getItem('moments_friend_like') === 'true';
  }

  function addFriend() {
    var container = document.getElementById('moments-container');
    if (!container) return;
    var input = container.querySelector('#beautifyFriendName');
    var name = input ? input.value.trim() : '';
    if (!name) return;

    // 检查是否已存在
    var exists = momentsFriends.some(function(f) { return f.name === name; });
    if (exists) {
      alert('该好友已存在');
      return;
    }

    momentsFriends.push({
      id: 'friend_' + Date.now(),
      name: name,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(name) + '&backgroundColor=c0aede',
      isPartner: false
    });
    saveMomentsFriends();
    renderBeautifyFriendsList();
    if (input) input.value = '';
  }

  function removeFriend(friendId) {
    momentsFriends = momentsFriends.filter(function(f) { return f.id !== friendId; });
    saveMomentsFriends();
    renderBeautifyFriendsList();
  }

  async function getRandomFriendForLike() {
    if (momentsFriends.length === 0) await loadMomentsFriends();
    if (momentsFriends.length === 0) return null;
    var idx = Math.floor(Math.random() * momentsFriends.length);
    return momentsFriends[idx];
  }

  function updateBeautifyAvatar() {
    const fileInput = document.getElementById('momentsAvatarInput');
    if (fileInput) {
      fileInput.value = '';
      fileInput.click();
    }
  }

  function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = function(ev) {
      const base64 = ev.target.result;
      const container = document.getElementById('moments-container');
      if (container) {
        container.querySelector('#beautifyAvatarPreview').src = base64;
        container.querySelector('#beautifyAvatarPreview').dataset.base64 = base64;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function updateBeautifyCover() {
    const fileInput = document.getElementById('momentsCoverInput');
    if (fileInput) {
      fileInput.value = '';
      fileInput.click();
    }
  }

  function handleCoverUpload(e) {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = function(ev) {
      const base64 = ev.target.result;
      const container = document.getElementById('moments-container');
      if (container) {
        container.querySelector('#beautifyCoverPreview').src = base64;
        container.querySelector('#beautifyCoverPreview').dataset.base64 = base64;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  async function saveBeautify() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const name = container.querySelector('#beautifyName').value.trim();
    const signature = container.querySelector('#beautifySignature').value.trim();
    const avatarPreview = container.querySelector('#beautifyAvatarPreview');
    const coverPreview = container.querySelector('#beautifyCoverPreview');
    
    if (name) userConfig.name = name;
    if (signature) userConfig.signature = signature;
    if (avatarPreview && avatarPreview.dataset.base64) {
      userConfig.avatar = avatarPreview.dataset.base64;
      // 同步更新 Home 页的头像存储
      if (typeof homeSetGlobal === 'function') {
        homeSetGlobal('home_avatar_me', avatarPreview.dataset.base64);
      }
      localStorage.setItem('home_avatar_me', avatarPreview.dataset.base64);
      
      // 同步更新 Home 页的 profile_me
      const profileStr = localStorage.getItem('profile_me');
      if (profileStr) {
        try {
          const profile = JSON.parse(profileStr);
          profile.avatar = avatarPreview.dataset.base64;
          if (name) profile.name = name;
          if (signature) profile.signature = signature;
          localStorage.setItem('profile_me', JSON.stringify(profile));
          if (typeof homeSetGlobal === 'function') {
            homeSetGlobal('profile_me', JSON.stringify(profile));
          }
        } catch(e) {}
      }
    }
    if (coverPreview && coverPreview.dataset.base64) {
      userConfig.coverImage = coverPreview.dataset.base64;
      // 持久化封面背景
      localStorage.setItem('moments_cover', coverPreview.dataset.base64);
    }
    
    await initUserInfo();
    await renderMoments();
    closeBeautifyPanel();
  }

  // ========== Virtual Keyboard Adaptation ==========
  function setupVirtualKeyboardAdaptation() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const popup = container.querySelector('#commentPopup');
    const emojiPanel = container.querySelector('#commentEmojiPanel');
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        const offset = window.innerHeight - window.visualViewport.height;
        if (offset > 100) {
          // 虚拟键盘弹出
          if (popup && popup.classList.contains('active')) {
            popup.style.bottom = offset + 'px';
          }
          if (emojiPanel && emojiPanel.classList.contains('active')) {
            emojiPanel.style.bottom = offset + 'px';
          }
        } else {
          // 虚拟键盘收起
          if (popup) popup.style.bottom = '0';
          if (emojiPanel) emojiPanel.style.bottom = '0';
        }
      });
    }
  }

  // ========== Init ==========
  async function init() {
    try {
      // 同步头像并初始化
      await initUserInfo();
      await loadMomentsFriends();  // 初始化好友列表（包含伴侣和自定义好友）
      await renderMoments();
      
      // 如果有待显示的通知，渲染它们
      if (momentsNotifications.length > 0) {
        renderMomentsNotificationCard();
      }

      // 初始化访客记录系统
      await loadPartnerInfo();
      loadVisitorRecords();
      generateOfflineVisitors();
      startOnlineVisitorTimer();
      updateVisitorBadge();
    } catch (e) {
      console.error('MomentsApp init error:', e);
    }
    
    // 同步日夜模式
    const momentsContainer = document.getElementById('moments-container');
    if (momentsContainer) {
      const savedBg = typeof window.homeGetItem === 'function' ? window.homeGetItem('home_card_bg') : localStorage.getItem('home_card_bg');
      const isDark = savedBg === 'night';
      console.log('[Moments] dark mode sync:', { savedBg, isDark, hasClass: momentsContainer.classList.contains('dark-mode'), homeGetItemExists: typeof window.homeGetItem === 'function' });
      // 直接检查 localStorage 中的所有相关 key
      const allKeys = Object.keys(localStorage).filter(k => k.includes('card_bg'));
      console.log('[Moments] localStorage keys:', allKeys.map(k => ({ key: k, value: localStorage.getItem(k) })));
      momentsContainer.classList.toggle('dark-mode', isDark);
      // 强制应用深色模式样式（调试用）
      if (isDark) {
        momentsContainer.style.background = '#1a1a1a';
        momentsContainer.style.color = '#e0e0e0';
      }
    }
    
    // 设置虚拟键盘适配
    setupVirtualKeyboardAdaptation();
    
    // 监听 Home 页数据更新事件，实时同步头像和昵称
    window.addEventListener('homeGlobalUpdated', async function(e) {
      const key = e.detail.key;
      console.log('[Moments] homeGlobalUpdated received:', key);
      if (key === 'home_avatar_me' || key === 'profile_me') {
        const syncResult = await syncAvatarFromHome();
        console.log('[Moments] syncAvatarFromHome result:', syncResult.name);
        // 更新 DOM 中的头像和昵称
        const container = document.getElementById('moments-container');
        if (container) {
          const avatarEl = container.querySelector('#userAvatar');
          const nameEl = container.querySelector('#userName');
          const sigEl = container.querySelector('#userSignature');
          console.log('[Moments] Updating DOM, nameEl exists:', !!nameEl, 'userConfig.name:', userConfig.name);
          if (avatarEl) avatarEl.src = userConfig.avatar;
          if (nameEl) nameEl.textContent = userConfig.name;
          if (sigEl) sigEl.textContent = userConfig.signature;
        }
      }
      // 当 partner 数据变化时，更新好友列表
      if (key === 'home_avatar_partner' || key === 'profile_partner') {
        await initFriendList();
      }
    });

    // 监听表情包库更新事件（从自定义回复库同步）
    window.addEventListener('stickerLibraryUpdated', function(e) {
      console.log('[Moments] stickerLibraryUpdated received, count:', e.detail?.count);
      // 如果当前正在显示评论表情包面板，刷新它
      const container = document.getElementById('moments-container');
      if (container && container.querySelector('#commentEmojiPanel')?.classList.contains('active')) {
        renderCommentEmojiContent();
      }
      // 如果当前正在显示发布朋友圈的表情包选择面板，刷新它
      const publishPanel = container?.querySelector('#publishStickerPanel');
      if (publishPanel && publishPanel.style.display !== 'none') {
        renderPublishStickerPanel();
      }
    });

    // 兜底：监听 localStorage 变化（跨页面同步）
    window.addEventListener('storage', async function(e) {
      if (e.key === 'home_avatar_me' || e.key === 'profile_me') {
        await syncAvatarFromHome();
        const container = document.getElementById('moments-container');
        if (container) {
          const avatarEl = container.querySelector('#userAvatar');
          const nameEl = container.querySelector('#userName');
          const sigEl = container.querySelector('#userSignature');
          if (avatarEl) avatarEl.src = userConfig.avatar;
          if (nameEl) nameEl.textContent = userConfig.name;
          if (sigEl) sigEl.textContent = userConfig.signature;
        }
      }
      if (e.key === 'home_avatar_partner' || e.key === 'profile_partner') {
        await initFriendList();
      }
    });
    
    // 绑定触摸滑动事件
    const container = document.getElementById('moments-container');
    if (container) {
      const previewEl = container.querySelector('#previewOverlay');
      if (previewEl) {
        let touchStartX = 0;
        previewEl.addEventListener('touchstart', e => {
          touchStartX = e.touches[0].clientX;
        }, { passive: true });
        previewEl.addEventListener('touchend', e => {
          const diff = touchStartX - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 50) {
            if (diff > 0) nextImage();
            else prevImage();
          }
        }, { passive: true });
      }
    }
  }

  // ========== 朋友圈互动触发（由 core.js simulateReply 调用） ==========
  function triggerMomentsInteraction() {
    const partnerName = getPartnerName();
    const partnerAvatar = getPartnerAvatar();

    // 1. 偷偷看朋友圈（概率3%，和拍一拍相同）
    if (Math.random() < 0.03) {
      generateOneVisitorRecord(Date.now());
      showMomentsNotification(partnerName, partnerAvatar, 'visit', 1, null, '偷偷看了你的朋友圈');
    }

    // 2. 对方评论最新一条我发的朋友圈（10%概率）
    const myMoments = momentsData.filter(m => m.nickname === userConfig.name);
    if (myMoments.length > 0 && Math.random() < 0.10) {
      const latestMyMoment = myMoments[0];
      const commentTexts = [
        '好棒呀！', '太厉害了！', '好喜欢这条~', '真的吗？', '哈哈哈哈', '可爱！',
        '说得真好', '我也这么觉得', '太真实了', '好治愈', '赞赞赞', '好看！',
        '这也太美了吧', '羡慕了', '学到了', 'mark一下', '期待后续！', '这也太会了'
      ];
      const randomComment = commentTexts[Math.floor(Math.random() * commentTexts.length)];
      latestMyMoment.comments.push({
        name: partnerName,
        text: randomComment,
        sticker: undefined,
        replyTo: undefined
      });
      saveMomentsToStorageSync();
      showMomentsNotification(partnerName, partnerAvatar, 'comment', 1, latestMyMoment.id, randomComment);
    }

    // 3. 对方点赞最新一条我发的朋友圈（10%概率）
    if (myMoments.length > 0 && Math.random() < 0.10) {
      const latestMyMoment = myMoments[0];
      if (!latestMyMoment.likes.includes(partnerName)) {
        latestMyMoment.likes.push(partnerName);
        saveMomentsToStorageSync();
        showMomentsNotification(partnerName, partnerAvatar, 'like', 1, latestMyMoment.id);
      }
    }

    // 4. 对方主动发朋友圈（时长驱动，在最短~最长小时区间内随机触发）
    const autoPostEnabled = (typeof settings !== 'undefined' && settings.momentsAutoPostEnabled !== false);
    if (!autoPostEnabled) return;

    const now = Date.now();
    const lastPostTime = parseInt(localStorage.getItem('moments_last_partner_post') || '0');
    const minH = (typeof settings !== 'undefined' && settings.momentsPostMinInterval) ? settings.momentsPostMinInterval : 1;
    const maxH = (typeof settings !== 'undefined' && settings.momentsPostMaxInterval) ? settings.momentsPostMaxInterval : 3;
    const minMs = minH * 3600000;
    const maxMs = maxH * 3600000;

    // 距离上次发帖不足最小时长，跳过
    if (now - lastPostTime < minMs) return;

    // 在最短~最长区间内，随机判断是否触发（越接近最长时长概率越高）
    if (now - lastPostTime < maxMs) {
      const progress = (now - lastPostTime - minMs) / (maxMs - minMs);
      if (Math.random() > progress * 0.9 + 0.1) return;
    }

    localStorage.setItem('moments_last_partner_post', now.toString());

    // 从字卡、表情、颜文字、表情包中随机抽取组合
    const allCards = [];
    if (window._customReplies && window._customReplies.length > 0) {
      allCards.push(...window._customReplies.map(r => ({ type: 'text', value: String(r || '').trim() })).filter(c => c.value));
    }
    if (window._kaomojiLibrary && window._kaomojiLibrary.length > 0) {
      allCards.push(...window._kaomojiLibrary.map(k => ({ type: 'kaomoji', value: String(k || '').trim() })).filter(c => c.value));
    }
    if (window._customEmojis && window._customEmojis.length > 0) {
      allCards.push(...window._customEmojis.map(e => ({ type: 'emoji', value: String(e || '').trim() })).filter(c => c.value));
    }
    if (window._stickerLibrary && window._stickerLibrary.length > 0) {
      allCards.push(...window._stickerLibrary.map(s => ({ type: 'sticker', value: s })).filter(c => c.value));
    }

    const minCards = (typeof settings !== 'undefined' && settings.momentsPostMinCards) ? settings.momentsPostMinCards : 1;
    const maxCards = (typeof settings !== 'undefined' && settings.momentsPostMaxCards) ? settings.momentsPostMaxCards : 3;
    const cardCount = Math.min(allCards.length, minCards + Math.floor(Math.random() * (maxCards - minCards + 1)));

    const shuffled = [...allCards].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.max(1, cardCount));

    const textParts = [];
    const stickerParts = [];
    selected.forEach(c => {
      if (c.type === 'sticker') {
        stickerParts.push(c.value);
      } else {
        textParts.push(c.value);
      }
    });

    const randomText = textParts.length > 0 ? textParts.join(' ') : '分享今日份好心情 ✨';
    const mainSticker = stickerParts.length > 0 ? stickerParts[0] : undefined;

    // 随机时间在过去 maxH 小时内
    const randomTime = new Date(now - Math.random() * maxMs);
    const timeStr = `${randomTime.getFullYear()}-${String(randomTime.getMonth()+1).padStart(2,'0')}-${String(randomTime.getDate()).padStart(2,'0')} ${String(randomTime.getHours()).padStart(2,'0')}:${String(randomTime.getMinutes()).padStart(2,'0')}`;

    const newMoment = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      nickname: partnerName,
      avatar: partnerAvatar,
      text: randomText,
      images: [],
      sticker: mainSticker,
      time: timeStr,
      likes: [],
      comments: [],
      likedByMe: false,
      collected: false
    };
    momentsData.unshift(newMoment);
    saveMomentsToStorageSync();
    const container = document.getElementById('moments-container');
    if (container && container.style.display !== 'none') {
      renderMoments();
    }
    showMomentsNotification(partnerName, partnerAvatar, 'post', 1, newMoment.id, randomText);
  }

  window.triggerMomentsInteraction = triggerMomentsInteraction;

  // ========== 暴露全局 API ==========
  window.MomentsApp = {
    // 初始化
    init,
    initUserInfo,
    syncAvatarFromHome,
    
    // 渲染
    renderMoments,
    
    // 时间格式化
    formatMomentTime,
    
    // 交互
    toggleTextExpand,
    toggleLike,
    toggleComment,
    toggleCollect,
    replyToComment,
    submitComment,
    toggleCommentEmojiPanel,
    closeCommentEmojiPanel,
    switchCommentEmojiTab,
    insertCommentEmoji,
    selectCommentSticker,
    removePendingCommentSticker,
    triggerAutoReply,
    
    // 通知
    updateMomentsBadge,
    clearMomentsBadge,
    showMomentsNotification,
    hideMomentsNotificationCard,
    scrollToFirstNotifiedMoment,
    renderMomentsNotificationCard,
    openNotificationDetailPanel,
    closeNotificationDetailPanel,
    renderNotificationDetailList,
    clearAllNotifications,
    
    // 搜索
    openSearchPanel,
    closeSearchPanel,
    handleSearchInput,
    clearSearchInput,
    handleTimeFilterChange,
    setQuickTime,
    clearTimeFilter,
    scrollToMoment,
    
    // 收藏
    openCollectionPanel,
    closeCollectionPanel,
    
    // 发布
    openPublishPanel,
    triggerAddPhoto,
    removeDemoPhoto,
    triggerAddVideo,
    removePublishVideo,
    publishMoment,
    handlePhotoUpload,
    handleVideoUpload,
    handleEditPhotoUpload,
    
    // 评论
    openComment,
    
    // 自定义
    openCustomLikePanel,
    openCustomCommentPanel,
    closeCustomPanel,
    confirmCustom,
    toggleSelectAllFriends,
    
    // 编辑
    openEditPanel,
    closeEditPanel,
    saveEdit,
    deleteMoment,
    addEditImage,
    removeEditImage,
    openEditLocationPanel,
    openEditMentionPanel,
    
    // 提醒
    openMentionPanel,
    closeMentionPanel,
    renderMentionList,
    filterMentions,
    toggleMention,
    confirmMentions,
    
    // 位置
    openLocationPanel,
    closeLocationPanel,
    confirmLocation,
    
    // 预览
    openPreview,
    openStickerPreview,
    closePreview,
    prevImage,
    nextImage,
    togglePublishStickerPanel,
    closePublishStickerPanel,
    selectPublishSticker,
    removePublishSticker,
    switchPublishStickerSubtab,
    switchStickerSubtab,
    playVideo,
    toggleVideoPlay,
    goToMomentDetail,
    
    // 面板
    closeAllPanels,
    
    // 个性化
    openBeautifyPanel,
    closeBeautifyPanel,
    updateBeautifyAvatar,
    updateBeautifyCover,
    handleAvatarUpload,
    handleCoverUpload,
    saveBeautify,
    
    // 好友列表
    toggleFriendLikeSwitch,
    updateSpeedLabel,
    updateCountLabel,
    addFriend,
    removeFriend,
    renderBeautifyFriendsList,

    // 访客记录
    openVisitorPanel,
    closeVisitorPanel,
    deleteVisitorRecord,
    clearAllVisitors,
    updateVisitorBadge,
    clearVisitorBadge,
    stopOnlineVisitorTimer,
    generateOneVisitorRecord,
    _visitorTouchStart,
    _visitorTouchMove,
    _visitorTouchEnd,

    // 互动触发
    triggerMomentsInteraction
  };

})();
