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

    // ========== 伴侣自动发朋友圈 ==========
  let _partnerMomentTimer = null;

  function startPartnerMomentTimer() {
    stopPartnerMomentTimer();
    const enabled = localStorage.getItem('partner_moment_enabled') === 'true';
    if (!enabled) return;

    const intervalMin = parseInt(localStorage.getItem('partner_moment_interval_min')) || 30;
    const intervalMax = parseInt(localStorage.getItem('partner_moment_interval_max')) || 120;
    const countMax = parseInt(localStorage.getItem('partner_moment_count_max')) || 1;
    const interval = (intervalMin + Math.random() * (intervalMax - intervalMin)) * 60 * 1000;

    console.log('[Moments] Partner moment timer scheduled in', interval / 60000, 'min');

    _partnerMomentTimer = setTimeout(async () => {
      try {
        await publishPartnerMoment(countMax);
      } catch(e) {
        console.warn('[Moments] Partner moment publish error:', e);
      }
      startPartnerMomentTimer();
    }, interval);
  }

  function stopPartnerMomentTimer() {
    if (_partnerMomentTimer) {
      clearTimeout(_partnerMomentTimer);
      _partnerMomentTimer = null;
    }
  }

  async function publishPartnerMoment(countMax) {
    const customReplies = (window._customReplies || []).map(r => String(r || '').trim()).filter(Boolean);
    const kaomojiLibrary = (window._kaomojiLibrary || []).map(k => String(k || '').trim()).filter(Boolean);
    const customEmojis = (window._customEmojis || []).map(e => String(e || '').trim()).filter(Boolean);
    let _stickerLib = [];
    if (typeof window !== 'undefined' && window._stickerLibrary && Array.isArray(window._stickerLibrary)) {
      _stickerLib = window._stickerLibrary;
    } else if (typeof stickerLibrary !== 'undefined' && Array.isArray(stickerLibrary)) {
      _stickerLib = stickerLibrary;
    }
    const stickerLibraryFiltered = _stickerLib.filter(Boolean);

    const textPool = [...customReplies, ...kaomojiLibrary, ...customEmojis];
    if (textPool.length === 0 && stickerLibraryFiltered.length === 0) return;

    const textCount = Math.min(1 + Math.floor(Math.random() * 3), textPool.length);
    const shuffled = textPool.sort(() => Math.random() - 0.5);
    const selectedTexts = shuffled.slice(0, textCount);
    const text = selectedTexts.join(' ');

    let sticker = null;
    if (stickerLibraryFiltered.length > 0 && Math.random() < 0.3) {
      sticker = stickerLibraryFiltered[Math.floor(Math.random() * stickerLibraryFiltered.length)];
    }

    if (!text && !sticker) return;

    await loadPartnerInfo();
    const partnerName = getPartnerName();
    const partnerAvatar = getPartnerAvatar();

    const actualCount = Math.max(1, Math.floor(Math.random() * countMax) + 1);
    for (let i = 0; i < actualCount; i++) {
      let momentText = text;
      let momentSticker = sticker;
      if (i > 0) {
        const tc2 = Math.min(1 + Math.floor(Math.random() * 3), textPool.length);
        const sh2 = [...textPool].sort(() => Math.random() - 0.5);
        momentText = sh2.slice(0, tc2).join(' ');
        momentSticker = (stickerLibraryFiltered.length > 0 && Math.random() < 0.3)
          ? stickerLibraryFiltered[Math.floor(Math.random() * stickerLibraryFiltered.length)]
          : null;
        if (!momentText && !momentSticker) continue;
      }

      const newMoment = {
        id: Date.now() + i,
        avatar: partnerAvatar,
        nickname: partnerName,
        time: Date.now() + i,
        text: momentText || '',
        images: [],
        sticker: momentSticker,
        video: null,
        likes: [],
        likedByMe: false,
        collected: false,
        comments: [],
        mentions: [],
        location: ''
      };

      momentsData.unshift(newMoment);
    }

    saveMomentsToStorage();
    renderMoments();

    if (actualCount > 0 && momentsData.length > 0) {
      setTimeout(() => {
        triggerAutoReply(momentsData[0].id);
      }, 2000 + Math.random() * 3000);
    }

    console.log('[Moments] Partner published', actualCount, 'moment(s)');
  }

  return { avatar: userConfig.avatar, name: userConfig.name, signature: userConfig.signature };
  }

  // ========== Sample Data (从 localStorage 恢复，或初始化为空) ==========
  const momentsData = [];
  (function loadMomentsFromStorage() {
    try {
      const saved = localStorage.getItem('moments_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach(m => momentsData.push(m));
        }
      }
    } catch(e) {}
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
      tx.objectStore('videos').put(videoBase64, 'vid_' + momentId);
    } catch(e) { console.warn('视频存储失败:', e); }
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
      tx.objectStore('images').put(imageBase64, 'img_' + momentId + '_' + imageIndex);
    } catch(e) { console.warn('图片存储失败:', e); }
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

  // 保存朋友圈数据到 localStorage（视频和大图片存 IndexedDB，localStorage 只保留引用）
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
      for (let ii = 0; ii < m.images.length; ii++) {
        const img = m.images[ii];
        if (typeof img === 'string' && img.startsWith('__IDB_IMG__')) {
          // 解析 key: __IDB_IMG__{momentId}_{imageIndex}
          const parts = img.replace('__IDB_IMG__', '').split('_');
          if (parts.length >= 2) {
            const data = await getImageFromIDB(parseInt(parts[0]), parseInt(parts[1]));
            if (data) {
              m.images[ii] = data; // 恢复到内存
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
    m.images.forEach((img, i) => mediaItems.push({ type: 'image', src: img, index: i }));
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
      <div class="moment-sticker" onclick="MomentsApp.openStickerPreview('${m.sticker}')">
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
          <div class="comment-item" onclick="MomentsApp.replyToComment(${m.id}, ${idx}, '${c.name}')">
            <span class="comment-name">${c.name}</span>${c.replyTo ? `<span class="reply-arrow">回复</span><span class="reply-to">${c.replyTo}</span>` : ''}：<span class="comment-text">${c.text}</span>${c.sticker ? `<img class="comment-sticker-img" src="${c.sticker}" alt="表情包" style="max-width:80px;max-height:80px;border-radius:4px;vertical-align:middle;display:inline-block;margin-left:4px;">` : ''}
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

  function setupCardLongPress() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
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

    saveMomentsToStorage();
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
        saveMomentsToStorage();
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
    saveMomentsToStorage();
    renderMoments();
    closeCustomPanel();
  }

  // ========== Collect ==========
  function toggleCollect(momentId) {
    const m = momentsData.find(x => x.id === momentId);
    if (!m) return;
    m.collected = !m.collected;
    saveMomentsToStorage();
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

  // ========== Auto Reply (从字卡库/表情包/颜文字随机选取) ==========
  async function triggerAutoReply(momentId) {
    const m = momentsData.find(x => x.id === momentId);
    if (!m) return;

    // 刷新系统（伴侣）信息缓存
    await loadPartnerInfo();

    // 获取字卡库
    const customReplies = (window._customReplies || []).map(r => String(r || '').trim()).filter(Boolean);
    // 获取颜文字库
    const kaomojiLibrary = (window._kaomojiLibrary || []).map(k => String(k || '').trim()).filter(Boolean);
    // 获取自定义表情
    const customEmojis = (window._customEmojis || []).map(e => String(e || '').trim()).filter(Boolean);
    // 获取表情包库
    let _stickerLib = [];
    if (typeof window !== 'undefined' && window._stickerLibrary && Array.isArray(window._stickerLibrary)) {
      _stickerLib = window._stickerLibrary;
    } else if (typeof stickerLibrary !== 'undefined' && Array.isArray(stickerLibrary)) {
      _stickerLib = stickerLibrary;
    }
    const stickerLibraryFiltered = _stickerLib.filter(Boolean);

    const hasTextContent = customReplies.length > 0 || kaomojiLibrary.length > 0 || customEmojis.length > 0;
    const hasStickers = stickerLibraryFiltered.length > 0;

    if (!hasTextContent && !hasStickers) {
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
    const replyCount = countSetting === -1
      ? (Math.random() < 0.7 ? 1 : (Math.random() < 0.9 ? 2 : 3))
      : countSetting;

    // 自动互动使用缓存的伴侣（系统）信息
    let replierName = getPartnerName();
    let partnerAvatar = getPartnerAvatar();
    let didComment = false;  // 跟踪TA是否评论了

    for (let i = 0; i < replyCount; i++) {
      // 20% 概率发送表情包（如果有表情包库）
      const sendSticker = hasStickers && Math.random() < 0.2;

      if (sendSticker) {
        const sticker = stickerLibraryFiltered[Math.floor(Math.random() * stickerLibraryFiltered.length)];
        m.comments.push({
          name: replierName,
          text: '',
          sticker: sticker
        });
        showMomentsNotification(replierName, partnerAvatar, 'comment', 1, m.id, '[表情包]', getMomentPreviewImage(m));
        didComment = true;
        continue;
      }

      if (!hasTextContent) continue;

      let replyText = '';

      // 优先从字卡库选取（70%概率），否则从颜文字库选取
      const useKaomoji = customReplies.length === 0 || (kaomojiLibrary.length > 0 && Math.random() < 0.3);
      
      if (useKaomoji && kaomojiLibrary.length > 0) {
        replyText = kaomojiLibrary[Math.floor(Math.random() * kaomojiLibrary.length)];
      } else if (customReplies.length > 0) {
        replyText = customReplies[Math.floor(Math.random() * customReplies.length)];
      }

      if (!replyText) continue;

      // Emoji 混入（20%概率）
      if (customEmojis.length > 0 && Math.random() < 0.2) {
        const emoji = customEmojis[Math.floor(Math.random() * customEmojis.length)];
        replyText = Math.random() < 0.5 ? emoji + ' ' + replyText : replyText + ' ' + emoji;
      }

      // 颜文字混入（如果回复本身不是颜文字，25%概率额外混入）
      if (kaomojiLibrary.length > 0 && !useKaomoji && Math.random() < 0.25) {
        const kaomoji = kaomojiLibrary[Math.floor(Math.random() * kaomojiLibrary.length)];
        replyText = Math.random() < 0.5 ? kaomoji + ' ' + replyText : replyText + ' ' + kaomoji;
      }

      m.comments.push({
        name: replierName,
        text: replyText
      });
      showMomentsNotification(replierName, partnerAvatar, 'comment', 1, m.id, replyText, getMomentPreviewImage(m));
      didComment = true;
    }

    // 自动点赞（80%概率）
    let didLike = false;
    if (Math.random() < 0.8) {
      if (isFriendLikeEnabled()) {
        // 开启好友点赞：从好友列表中完全随机选取（不限数量）
        if (momentsFriends.length === 0) await loadMomentsFriends();
        // 每个好友独立判断是否点赞（50%概率）
        momentsFriends.forEach(function(friend) {
          if (Math.random() < 0.5 && !m.likes.includes(friend.name)) {
            m.likes.push(friend.name);
          }
        });
        // 系统（伴侣）也参与点赞，并标记需要通知
        if (!m.likes.includes(replierName)) {
          m.likes.push(replierName);
        }
        didLike = true;
      } else {
        // 关闭好友点赞：只有系统（伴侣）点赞
        if (!m.likes.includes(replierName)) {
          m.likes.push(replierName);
          didLike = true;
        }
      }
    }

    // 先保存并渲染，确保 DOM 更新后再发送通知
    saveMomentsToStorage();
    renderMoments();

    // 发送点赞通知（只有系统点赞才通知）
    if (didLike) {
      showMomentsNotification(replierName, partnerAvatar, 'like', 1, m.id, '', getMomentPreviewImage(m));
    }

    // 重新渲染通知卡片（确保评论通知也能正确显示）
    renderMomentsNotificationCard();

    // ── 访客记录：TA来互动了，留下足迹 ──
    if (didComment) {
      generateOneVisitorRecord(Date.now(), 'comment');
      console.log('[Moments] Partner commented - left visitor record (comment)');
    } else if (didLike) {
      generateOneVisitorRecord(Date.now(), 'like');
      console.log('[Moments] Partner liked - left visitor record (like)');
    }
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
    saveMomentsToStorage();
    renderMoments();
  }

  // ========== Comment Emoji/Sticker Panel ==========
  let commentEmojiPanelOpen = false;
  let commentEmojiTab = 'emoji';
  let pendingCommentSticker = null;

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

  function generateOneVisitorRecord(timestamp, action) {
    const ts = timestamp || Date.now();
    visitorRecords.unshift({ id: ts.toString(36) + Math.random().toString(36).substr(2,5), timestamp: ts, action: action || 'visit' });
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
        generateOneVisitorRecord(dayStart.getTime() + Math.random() * (dayEnd.getTime() - dayStart.getTime()), 'visit');
      }
    }
  }

  function startOnlineVisitorTimer() {
    if (visitorTimerInterval) clearInterval(visitorTimerInterval);
    localStorage.setItem(VISITOR_LAST_ONLINE_KEY, Date.now().toString());
    visitorTimerInterval = setInterval(() => {
      if (getTodayVisitorCount() >= VISITOR_MAX_PER_DAY) return;
      if (Math.random() < 0.20) generateOneVisitorRecord(Date.now(), 'visit');
      localStorage.setItem(VISITOR_LAST_ONLINE_KEY, Date.now().toString());
    }, 5 * 60 * 1000);
  }

  // ========== 伴侣偷偷看朋友圈 ==========
  let _partnerSneakTimer = null;

  function startPartnerSneakVisit() {
    stopPartnerSneakVisit();
    _partnerSneakTimer = setInterval(() => {
      // 3%概率偷偷看朋友圈（与拍一拍概率一致）
      if (Math.random() < 0.03) {
        generateOneVisitorRecord(Date.now(), 'visit');
        console.log('[Moments] Partner sneak visit - left visitor record');
      }
    }, 5 * 60 * 1000); // 每5分钟检查一次
  }

  function stopPartnerSneakVisit() {
    if (_partnerSneakTimer) {
      clearInterval(_partnerSneakTimer);
      _partnerSneakTimer = null;
    }
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
      const timeStr = formatMomentTime(record.timestamp);
      // 访客动作描述
      const actionMap = {
        like: '<span class="visitor-action-tag visitor-action-like">👍 赞了你的朋友圈</span>',
        comment: '<span class="visitor-action-tag visitor-action-comment">💬 评论了你的朋友圈</span>',
        visit: ''
      };
      const actionTag = actionMap[record.action] || '';
      html += `
        <div class="visitor-item" data-visitor-id="${record.id}">
          <div class="visitor-item-inner" ontouchstart="MomentsApp._visitorTouchStart(event,'${record.id}')" ontouchmove="MomentsApp._visitorTouchMove(event,'${record.id}')" ontouchend="MomentsApp._visitorTouchEnd(event,'${record.id}')">
            <img class="visitor-avatar" src="${partnerAvatar}" alt="${partnerName}" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=partner&backgroundColor=c0aede'">
            <div class="visitor-info">
              <div class="visitor-name">${partnerName}${streakTag}</div>
              <div class="visitor-time">${timeStr} ${actionTag}</div>
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
      body.classList.remove('sticker-mode');
      const customEmojis = (window._customEmojis || []).filter(Boolean);
      if (customEmojis.length === 0) {
        body.innerHTML = '<div class="comment-emoji-empty">暂无自定义表情，请在聊天设置中添加</div>';
        return;
      }
      items = customEmojis.map(e => `<div class="comment-emoji-item" onclick="MomentsApp.insertCommentEmoji('${e.replace(/'/g, "\\'")}')">${e}</div>`);
    } else if (commentEmojiTab === 'kaomoji') {
      body.classList.remove('sticker-mode');
      const kaomojiLibrary = (window._kaomojiLibrary || []).filter(Boolean);
      if (kaomojiLibrary.length === 0) {
        body.innerHTML = '<div class="comment-emoji-empty">暂无颜文字，请在字卡库中添加</div>';
        return;
      }
      items = kaomojiLibrary.map(k => `<div class="comment-emoji-item" onclick="MomentsApp.insertCommentEmoji('${k.replace(/'/g, "\\'")}')">${k}</div>`);
    } else if (commentEmojiTab === 'sticker') {
      body.classList.add('sticker-mode');
      // 我的表情包 - 从 window._stickerLibrary 读取
      let _stickerLib = [];
      if (typeof window !== 'undefined' && window._stickerLibrary && Array.isArray(window._stickerLibrary)) {
        _stickerLib = window._stickerLibrary;
      } else if (typeof stickerLibrary !== 'undefined' && Array.isArray(stickerLibrary)) {
        _stickerLib = stickerLibrary;
      }
      const stickerLibraryFiltered = _stickerLib.filter(Boolean);
      if (stickerLibraryFiltered.length === 0) {
        body.innerHTML = '<div class="comment-emoji-empty">暂无我的表情包，请在表情包管理中添加</div>';
        return;
      }
      items = stickerLibraryFiltered.map((s, i) => `<div class="comment-emoji-item sticker-item" onclick="MomentsApp.selectCommentSticker(${i})"><img src="${s}" alt="表情包"></div>`);
    } else if (commentEmojiTab === 'sticker-lib') {
      body.classList.add('sticker-mode');
      // 表情包库 - 从全局 getStickerLibForInsert() 或 stickerLib 获取
      let _libStickers = [];
      if (typeof window._getStickerLibForInsert === 'function') {
        _libStickers = window._getStickerLibForInsert();
      } else if (typeof window.stickerLib !== 'undefined' && Array.isArray(window.stickerLib)) {
        _libStickers = window.stickerLib;
      }
      const libFiltered = _libStickers.filter(Boolean);
      if (libFiltered.length === 0) {
        body.innerHTML = '<div class="comment-emoji-empty">暂无表情包库，请先在侧边栏添加</div>';
        return;
      }
      items = libFiltered.map((s, i) => `<div class="comment-emoji-item sticker-item" onclick="MomentsApp.selectCommentLibSticker(${i}, this)"><img src="${s}" alt="表情包库"></div>`);
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
      showCommentStickerPreview(pendingCommentSticker);
      closeCommentEmojiPanel();
    }
  }

  // 从表情包库选择表情包（用于评论）
  function selectCommentLibSticker(index, el) {
    let _libStickers = [];
    if (typeof window._getStickerLibForInsert === 'function') {
      _libStickers = window._getStickerLibForInsert();
    } else if (typeof window.stickerLib !== 'undefined' && Array.isArray(window.stickerLib)) {
      _libStickers = window.stickerLib;
    }
    const libFiltered = _libStickers.filter(Boolean);
    if (index >= 0 && index < libFiltered.length) {
      pendingCommentSticker = libFiltered[index];
      showCommentStickerPreview(pendingCommentSticker);
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
      saveMomentsToStorage();
      renderMoments();
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

  // ========== Album Panel ==========
  let albumExpanded = false;

  function openAlbumPanel() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    container.querySelector('#albumPanel').classList.add('active');
    albumExpanded = false;
    container.querySelector('#albumExpandBtn').classList.remove('active');
    container.querySelector('#albumDateFrom').value = '';
    container.querySelector('#albumDateTo').value = '';
    renderAlbum();
  }

  function closeAlbumPanel() {
    const container = document.getElementById('moments-container');
    if (container) {
      container.querySelector('#albumPanel').classList.remove('active');
    }
  }

  function toggleAlbumExpand() {
    albumExpanded = !albumExpanded;
    const container = document.getElementById('moments-container');
    if (container) {
      container.querySelector('#albumExpandBtn').classList.toggle('active', albumExpanded);
    }
    renderAlbum();
  }

  function setAlbumQuickTime(range) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let fromDate;
    switch (range) {
      case 'week': fromDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case 'month': fromDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      case 'year': fromDate = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000); break;
    }
    const y = fromDate.getFullYear();
    const mo = String(fromDate.getMonth() + 1).padStart(2, '0');
    const d = String(fromDate.getDate()).padStart(2, '0');
    
    const container = document.getElementById('moments-container');
    if (container) {
      container.querySelector('#albumDateFrom').value = `${y}-${mo}-${d}`;
      const yn = now.getFullYear();
      const mon = String(now.getMonth() + 1).padStart(2, '0');
      const dn = String(now.getDate()).padStart(2, '0');
      container.querySelector('#albumDateTo').value = `${yn}-${mon}-${dn}`;
    }
    renderAlbum();
  }

  function clearAlbumTimeFilter() {
    const container = document.getElementById('moments-container');
    if (container) {
      container.querySelector('#albumDateFrom').value = '';
      container.querySelector('#albumDateTo').value = '';
    }
    renderAlbum();
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

  function renderCollection() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const body = container.querySelector('#collectionBody');
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

  function renderAlbum() {
    const container = document.getElementById('moments-container');
    if (!container) return;
    
    const body = container.querySelector('#albumBody');
    const dateFrom = container.querySelector('#albumDateFrom').value;
    const dateTo = container.querySelector('#albumDateTo').value;

    // 按时间筛选朋友圈
    let filtered = momentsData;
    if (dateFrom || dateTo) {
      filtered = momentsData.filter(m => {
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

    // 收集图片
    const allImages = [];
    filtered.forEach(m => {
      m.images.forEach((img, idx) => {
        allImages.push({ src: img, momentId: m.id, index: idx, nickname: m.nickname, time: m.time, date: parseTimeString(m.time) });
      });
    });

    if (allImages.length === 0) {
      body.innerHTML = '<div class="album-empty">暂无照片</div>';
      return;
    }

    // 全部展开模式：网格排列所有图片
    if (albumExpanded) {
      body.innerHTML = `
        <div class="album-grid">
          ${allImages.map(img => `
            <div class="album-item" onclick="MomentsApp.openPreview(${img.momentId}, ${img.index}); MomentsApp.closeAlbumPanel();">
              <img src="${img.src}" alt="照片">
            </div>
          `).join('')}
        </div>
      `;
      return;
    }

    // 时间轴模式：按日期分组
    const groups = {};
    allImages.forEach(img => {
      let dateKey;
      if (img.date) {
        const y = img.date.getFullYear();
        const mo = String(img.date.getMonth() + 1).padStart(2, '0');
        const d = String(img.date.getDate()).padStart(2, '0');
        dateKey = `${y}-${mo}-${d}`;
      } else {
        dateKey = '未知日期';
      }
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(img);
    });

    // 按日期降序排列
    const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));

    body.innerHTML = `<div class="album-timeline">
      ${sortedKeys.map(dateKey => {
        const items = groups[dateKey];
        // 按朋友圈分组显示
        const momentGroups = {};
        items.forEach(img => {
          const key = `${img.momentId}`;
          if (!momentGroups[key]) momentGroups[key] = { nickname: img.nickname, time: img.time, images: [] };
          momentGroups[key].images.push(img);
        });

        return `
          <div class="album-timeline-group">
            <div class="album-timeline-date">${dateKey}</div>
            ${Object.values(momentGroups).map(mg => `
              <div class="album-timeline-moment">
                <div class="album-timeline-moment-info">
                  <span class="tl-nickname">${mg.nickname}</span> · ${mg.time}
                </div>
                <div class="album-timeline-grid">
                  ${mg.images.map(img => `
                    <div class="album-item" onclick="MomentsApp.openPreview(${img.momentId}, ${img.index}); MomentsApp.closeAlbumPanel();">
                      <img src="${img.src}" alt="照片">
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }).join('')}
    </div>`;
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
    
    const filtered = friendList.filter(f => f.name.toLowerCase().includes(search));
    
    list.innerHTML = filtered.map(f => `
      <div class="mention-item ${tempMentions.includes(f.name) ? 'selected' : ''}" onclick="MomentsApp.toggleMention('${f.name}')">
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
    
    body.innerHTML = stickerLibraryFiltered.map((s, i) => `
      <div class="publish-sticker-select-item" onclick="MomentsApp.selectPublishSticker(${i})">
        <img src="${s}" alt="表情包">
      </div>
    `).join('');
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

    const images = [...publishPhotoBase64List];

    const newMoment = {
      id: Date.now(),
      avatar: userConfig.avatar,
      nickname: userConfig.name,
      time: Date.now(),
      text: text,
      images: images,
      sticker: publishSticker || null,
      video: publishVideo ? { cover: publishVideo.cover, url: publishVideo.url, duration: publishVideo.duration } : null,
      likes: [],
      likedByMe: false,
      collected: false,
      comments: [],
      mentions: [...tempMentions],
      location: tempLocation
    };

    momentsData.unshift(newMoment);
    saveMomentsToStorage();
    renderMoments();
    closeAllPanels();
    container.scrollTo({ top: 0, behavior: 'smooth' });

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
    closeAlbumPanel();
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

  async function loadMomentsFriends() {
    try {
      // 先刷新伴侣信息缓存
      await loadPartnerInfo();
      const data = localStorage.getItem('moments_friends');
      if (data) {
        momentsFriends = JSON.parse(data);
        // 更新伴侣信息为最新值
        var partnerIdx = momentsFriends.findIndex(function(f) { return f.isPartner; });
        if (partnerIdx >= 0) {
          momentsFriends[partnerIdx].name = getPartnerName();
          momentsFriends[partnerIdx].avatar = getPartnerAvatar();
        } else {
          momentsFriends.unshift(getDefaultPartnerFriend()[0]);
        }
      } else {
        // 默认包含伴侣
        momentsFriends = getDefaultPartnerFriend();
        saveMomentsFriends();
      }
    } catch (e) {
      momentsFriends = getDefaultPartnerFriend();
    }
  }

  function getDefaultPartnerFriend() {
    return [{ id: 'partner', name: getPartnerName(), avatar: getPartnerAvatar(), isPartner: true }];
  }

  function saveMomentsFriends() {
    localStorage.setItem('moments_friends', JSON.stringify(momentsFriends));
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
      startPartnerSneakVisit();
      startPartnerMomentTimer();
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
    selectCommentLibSticker,
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
    
    // 相册
    openAlbumPanel,
    closeAlbumPanel,
    toggleAlbumExpand,
    renderAlbum,
    setAlbumQuickTime,
    clearAlbumTimeFilter,
    
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
    _visitorTouchStart,
    _visitorTouchMove,
    _visitorTouchEnd
  };

})();
