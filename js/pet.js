// 略略略 - 宠物游戏模块 (简化版)
// 一个可爱的宠物养成小游戏

// ===== 配置常量 =====
const PET_TYPES = {
    cat: { name: '猫咪', desc: '傲娇独立', emoji: '🐱' },
    dog: { name: '狗狗', desc: '忠诚活泼', emoji: '🐕' },
    rabbit: { name: '兔子', desc: '胆小温顺', emoji: '🐰' },
    fox: { name: '狐狸', desc: '机灵调皮', emoji: '🦊' },
    hamster: { name: '仓鼠', desc: '贪吃囤积', emoji: '🐹' },
    bird: { name: '小鸟', desc: '机灵可爱', emoji: '🐦' }
};

// 宠物品种（简化版，使用emoji）
const PET_BREEDS = {
    cat: [
        { id: 'orange', name: '橘猫', desc: '贪吃慵懒，圆润可爱', emoji: '🐱', toy: '🧶' },
        { id: 'black', name: '黑猫', desc: '神秘优雅，幸运象征', emoji: '🐈‍⬛', toy: '🐟' },
        { id: 'white', name: '白猫', desc: '纯洁可爱，温顺粘人', emoji: '🐱', toy: '🧸' }
    ],
    dog: [
        { id: 'corgi', name: '柯基', desc: '短腿可爱，屁股迷人', emoji: '🐕', toy: '🦴' },
        { id: 'shiba', name: '柴犬', desc: '表情丰富，倔强可爱', emoji: '🐕', toy: '🎾' },
        { id: 'poodle', name: '贵宾', desc: '聪明优雅，活泼好动', emoji: '🐩', toy: '🧸' }
    ],
    rabbit: [
        { id: 'white', name: '小白兔', desc: '经典可爱，红眼睛', emoji: '🐰', toy: '🥕' },
        { id: 'gray', name: '灰兔子', desc: '灰色软萌，温柔安静', emoji: '🐇', toy: '🧸' }
    ],
    fox: [
        { id: 'red', name: '赤狐', desc: '经典火红，机灵狡猾', emoji: '🦊', toy: '🎪' },
        { id: 'arctic', name: '北极狐', desc: '雪白纯净，优雅高贵', emoji: '🦊', toy: '❄️' }
    ],
    hamster: [
        { id: 'golden', name: '金丝熊', desc: '体型圆润，性格温顺', emoji: '🐹', toy: '🎡' },
        { id: 'white', name: '小白鼠', desc: '雪白可爱，活泼好动', emoji: '🐁', toy: '🧀' }
    ],
    bird: [
        { id: 'parrot', name: '鹦鹉', desc: '能说会道，色彩斑斓', emoji: '🦜', toy: '🪞' },
        { id: 'sparrow', name: '麻雀', desc: '活泼好动，自由奔放', emoji: '🐦', toy: '🧶' }
    ]
};

// 12种性格
const PERSONALITIES = [
    { name: '傲娇', desc: '嘴硬心软，其实很在乎你' },
    { name: '温顺', desc: '乖巧听话，从不闹脾气' },
    { name: '活泼', desc: '精力充沛，总想玩耍' },
    { name: '慵懒', desc: '喜欢睡觉，慢悠悠的' },
    { name: '贪吃', desc: '看到食物就走不动道' },
    { name: '调皮', desc: '爱恶作剧，古灵精怪' },
    { name: '胆小', desc: '容易受惊，需要保护' },
    { name: '忠诚', desc: '永远陪伴在你身边' },
    { name: '高冷', desc: '独来独往，偶尔撒娇' },
    { name: '粘人', desc: '离不开你，时刻跟随' },
    { name: '好奇', desc: '对一切都充满兴趣' },
    { name: '优雅', desc: '举止从容，气质出众' }
];

// 食物配置
const FOODS = {
    basic: { name: '普通饲料', price: 10, hunger: 15, emoji: '🥣' },
    premium: { name: '高级罐头', price: 30, hunger: 30, mood: 5, emoji: '🥫' },
    luxury: { name: '豪华大餐', price: 80, hunger: 50, mood: 15, affection: 5, emoji: '🍱' },
    treat: { name: '美味零食', price: 20, hunger: 5, mood: 20, emoji: '🍪' }
};

// 状态描述词
const STATUS_WORDS = {
    hunger: {
        100: '肚子圆滚滚', 80: '肚子饱饱的', 60: '有点饱了',
        40: '有点饿了', 20: '饿扁了', 0: '要饿晕了'
    },
    mood: {
        100: '开心到飞起', 80: '超开心', 60: '还不错',
        40: '一般般', 20: '不太开心', 0: '很难过'
    },
    energy: {
        100: '精神爆棚', 80: '精神满满', 60: '有点困',
        40: '累了', 20: '精疲力尽', 0: '睡着了'
    },
    affection: {
        100: '离不开你了', 80: '超喜欢你', 60: '很喜欢你',
        40: '有点亲近', 20: '有点陌生', 0: '不理你了'
    }
};

// ===== 游戏状态 =====
let petGameState = {
    hasPet: false,
    pet: null,
    coins: 100,
    foods: { basic: 5, premium: 2, luxury: 0, treat: 3 },
    lastSave: null
};

let petDecayTimer = null;
let currentPetView = 'selection'; // selection, game

// ===== 本地存储 =====
const PET_STORAGE_KEY = 'luelue_pet_game';

function savePetGame() {
    petGameState.lastSave = Date.now();
    localStorage.setItem(PET_STORAGE_KEY, JSON.stringify(petGameState));
}

function loadPetGame() {
    try {
        const saved = localStorage.getItem(PET_STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            petGameState = { ...petGameState, ...data };
            
            // 计算离线时间并衰减状态
            if (petGameState.pet && petGameState.lastSave) {
                const offlineTime = Date.now() - petGameState.lastSave;
                const offlineMinutes = Math.floor(offlineTime / 60000);
                if (offlineMinutes > 0) {
                    applyOfflineDecay(offlineMinutes);
                }
            }
            return true;
        }
    } catch (e) {
        console.error('加载宠物游戏存档失败:', e);
    }
    return false;
}

// ===== 宠物类 =====
class Pet {
    constructor(type, breedId, name) {
        const breed = PET_BREEDS[type].find(b => b.id === breedId) || PET_BREEDS[type][0];
        const personality = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
        
        this.id = Date.now().toString(36);
        this.type = type;
        this.breed = breed;
        this.name = name;
        this.personality = personality;
        this.level = 1;
        this.exp = 0;
        this.expToNext = 100;
        
        // 状态值 (0-100)
        this.hunger = 80;      // 饱食度
        this.mood = 80;        // 心情
        this.energy = 100;     // 精力
        this.affection = 50;   // 好感度
        this.cleanliness = 100; // 清洁度
        
        this.birthDate = Date.now();
        this.lastInteraction = Date.now();
    }
    
    // 增加经验值
    addExp(amount) {
        this.exp += amount;
        if (this.exp >= this.expToNext) {
            this.levelUp();
        }
    }
    
    // 升级
    levelUp() {
        this.level++;
        this.exp -= this.expToNext;
        this.expToNext = Math.floor(this.expToNext * 1.2);
        this.showFloatingText(`升级！Lv.${this.level}`, '🎉');
        
        // 升级恢复部分状态
        this.hunger = Math.min(100, this.hunger + 10);
        this.mood = Math.min(100, this.mood + 20);
        this.energy = Math.min(100, this.energy + 15);
    }
    
    // 获取状态描述
    getStatusDesc(type) {
        const value = this[type];
        const words = STATUS_WORDS[type];
        for (let threshold of [100, 80, 60, 40, 20, 0]) {
            if (value >= threshold) return words[threshold];
        }
        return words[0];
    }
    
    // 显示浮动文字效果
    showFloatingText(text, emoji = '') {
        const petArea = document.getElementById('pet-display-area');
        if (!petArea) return;
        
        const float = document.createElement('div');
        float.className = 'pet-float-text';
        float.textContent = emoji ? `${emoji} ${text}` : text;
        float.style.cssText = `
            position: absolute;
            left: 50%;
            top: 30%;
            transform: translateX(-50%);
            background: rgba(255,255,255,0.95);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            color: var(--accent-color);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: floatUp 1.5s ease-out forwards;
            pointer-events: none;
            z-index: 100;
        `;
        petArea.appendChild(float);
        setTimeout(() => float.remove(), 1500);
    }
}

// ===== 核心功能函数 =====

// 初始化宠物游戏
function initPetGame() {
    loadPetGame();
    renderPetUI();
    startDecayTimer();
}

// 开始状态衰减定时器
function startDecayTimer() {
    if (petDecayTimer) clearInterval(petDecayTimer);
    petDecayTimer = setInterval(() => {
        if (petGameState.pet) {
            decayPetStats();
        }
    }, 30000); // 每30秒衰减一次
}

// 状态衰减
function decayPetStats() {
    const pet = petGameState.pet;
    if (!pet) return;
    
    pet.hunger = Math.max(0, pet.hunger - 2);
    pet.mood = Math.max(0, pet.mood - 1);
    pet.energy = Math.max(0, pet.energy - 1);
    pet.cleanliness = Math.max(0, pet.cleanliness - 1);
    
    // 状态过低影响其他状态
    if (pet.hunger < 20) pet.mood = Math.max(0, pet.mood - 2);
    if (pet.cleanliness < 30) pet.mood = Math.max(0, pet.mood - 1);
    
    updatePetUI();
    savePetGame();
}

// 离线状态衰减
function applyOfflineDecay(minutes) {
    const pet = petGameState.pet;
    if (!pet) return;
    
    // 最多计算8小时的离线时间
    const cappedMinutes = Math.min(minutes, 480);
    const decayFactor = Math.floor(cappedMinutes / 2);
    
    pet.hunger = Math.max(10, pet.hunger - decayFactor);
    pet.mood = Math.max(10, pet.mood - Math.floor(decayFactor / 2));
    pet.energy = Math.max(20, pet.energy - Math.floor(decayFactor / 2));
    pet.cleanliness = Math.max(10, pet.cleanliness - Math.floor(decayFactor / 2));
}

// 创建新宠物
function createPet(type, breedId, name) {
    if (!type || !name.trim()) {
        showPetToast('请选择宠物类型并输入名字', 'error');
        return false;
    }
    
    petGameState.pet = new Pet(type, breedId, name.trim());
    petGameState.hasPet = true;
    petGameState.coins = 100; // 初始金币
    petGameState.foods = { basic: 5, premium: 2, luxury: 0, treat: 3 };
    
    savePetGame();
    currentPetView = 'game';
    renderPetUI();
    showPetToast(`欢迎 ${name} 来到新家！`, 'success');
    return true;
}

// 喂食
function feedPet(foodType = 'basic') {
    const pet = petGameState.pet;
    if (!pet) return;
    
    const food = FOODS[foodType];
    if (!food) return;
    
    if (petGameState.foods[foodType] <= 0) {
        showPetToast('食物不足，请去商店购买', 'warning');
        return;
    }
    
    if (pet.hunger >= 100) {
        showPetToast(`${pet.name} 已经吃饱了`, 'info');
        return;
    }
    
    petGameState.foods[foodType]--;
    pet.hunger = Math.min(100, pet.hunger + food.hunger);
    if (food.mood) pet.mood = Math.min(100, pet.mood + food.mood);
    if (food.affection) pet.affection = Math.min(100, pet.affection + food.affection);
    
    pet.addExp(5);
    pet.lastInteraction = Date.now();
    
    pet.showFloatingText(`+${food.hunger} 饱食度`, food.emoji);
    updatePetUI();
    savePetGame();
    
    // 播放喂食动画
    playPetAnimation('eat');
}

// 抚摸
function petPet() {
    const pet = petGameState.pet;
    if (!pet) return;
    
    pet.mood = Math.min(100, pet.mood + 10);
    pet.affection = Math.min(100, pet.affection + 5);
    pet.addExp(3);
    pet.lastInteraction = Date.now();
    
    pet.showFloatingText('好舒服~', '💕');
    updatePetUI();
    savePetGame();
    playPetAnimation('happy');
}

// 玩耍
function playWithPet() {
    const pet = petGameState.pet;
    if (!pet) return;
    
    if (pet.energy < 20) {
        showPetToast(`${pet.name} 太累了，需要休息`, 'warning');
        return;
    }
    
    if (pet.hunger < 20) {
        showPetToast(`${pet.name} 饿了，先喂点吃的吧`, 'warning');
        return;
    }
    
    pet.mood = Math.min(100, pet.mood + 15);
    pet.affection = Math.min(100, pet.affection + 3);
    pet.energy = Math.max(0, pet.energy - 15);
    pet.hunger = Math.max(0, pet.hunger - 10);
    pet.addExp(8);
    pet.lastInteraction = Date.now();
    
    pet.showFloatingText('好开心！', '🎮');
    updatePetUI();
    savePetGame();
    playPetAnimation('play');
}

// 清洁
function cleanPet() {
    const pet = petGameState.pet;
    if (!pet) return;
    
    if (pet.cleanliness >= 100) {
        showPetToast(`${pet.name} 已经很干净了`, 'info');
        return;
    }
    
    pet.cleanliness = 100;
    pet.mood = Math.min(100, pet.mood + 5);
    pet.affection = Math.min(100, pet.affection + 2);
    pet.addExp(5);
    pet.lastInteraction = Date.now();
    
    pet.showFloatingText('香喷喷~', '🛁');
    updatePetUI();
    savePetGame();
    playPetAnimation('clean');
}

// 睡觉
function sleepPet() {
    const pet = petGameState.pet;
    if (!pet) return;
    
    if (pet.energy >= 90) {
        showPetToast(`${pet.name} 还不困呢`, 'info');
        return;
    }
    
    pet.energy = Math.min(100, pet.energy + 40);
    pet.mood = Math.max(0, pet.mood - 5); // 睡觉有点无聊
    pet.addExp(5);
    pet.lastInteraction = Date.now();
    
    pet.showFloatingText('Zzz...', '💤');
    updatePetUI();
    savePetGame();
    playPetAnimation('sleep');
}

// 购买食物
function buyFood(foodType) {
    const food = FOODS[foodType];
    if (!food) return;
    
    if (petGameState.coins < food.price) {
        showPetToast('金币不足', 'error');
        return;
    }
    
    petGameState.coins -= food.price;
    petGameState.foods[foodType]++;
    
    showPetToast(`购买了 ${food.name}`, 'success');
    updatePetUI();
    savePetGame();
}

// 重置宠物（调试用）
function resetPet() {
    if (confirm('确定要重新开始吗？当前宠物数据会丢失。')) {
        petGameState = {
            hasPet: false,
            pet: null,
            coins: 100,
            foods: { basic: 5, premium: 2, luxury: 0, treat: 3 },
            lastSave: null
        };
        currentPetView = 'selection';
        savePetGame();
        renderPetUI();
        showPetToast('已重置游戏', 'info');
    }
}

// ===== UI 渲染 =====

function renderPetUI() {
    const container = document.getElementById('pet-game-container');
    if (!container) return;
    
    if (!petGameState.hasPet || currentPetView === 'selection') {
        container.innerHTML = renderPetSelection();
        attachSelectionListeners();
    } else {
        container.innerHTML = renderPetGame();
        updatePetUI();
        attachGameListeners();
    }
}

// 渲染选择界面
function renderPetSelection() {
    let html = `
        <div class="pet-selection">
            <div class="pet-header">
                <h3>🐾 选择你的宠物伙伴</h3>
                <p>选择一只可爱的宠物陪伴你吧~</p>
            </div>
            <div class="pet-type-grid">
    `;
    
    for (let [key, type] of Object.entries(PET_TYPES)) {
        html += `
            <div class="pet-type-card" data-type="${key}">
                <div class="pet-emoji">${type.emoji}</div>
                <div class="pet-name">${type.name}</div>
                <div class="pet-desc">${type.desc}</div>
            </div>
        `;
    }
    
    html += `
            </div>
            <div class="pet-create-form" style="display:none;">
                <div class="breed-selection"></div>
                <input type="text" id="pet-name-input" placeholder="给宠物起个名字..." maxlength="10">
                <button id="create-pet-btn" class="pet-btn-primary">开始养成</button>
                <button id="back-selection-btn" class="pet-btn-secondary">返回</button>
            </div>
        </div>
    `;
    
    return html;
}

// 渲染游戏界面
function renderPetGame() {
    const pet = petGameState.pet;
    if (!pet) return '';
    
    return `
        <div class="pet-game">
            <div class="pet-header">
                <div class="pet-info">
                    <span class="pet-level">Lv.${pet.level}</span>
                    <span class="pet-title">${pet.name}</span>
                    <span class="pet-personality">${pet.personality.name}</span>
                </div>
                <div class="pet-coins">💰 ${petGameState.coins}</div>
            </div>
            
            <div class="pet-exp-bar">
                <div class="exp-fill" style="width: ${(pet.exp / pet.expToNext * 100)}%"></div>
                <span class="exp-text">${pet.exp}/${pet.expToNext}</span>
            </div>
            
            <div id="pet-display-area" class="pet-display">
                <div class="pet-avatar">${pet.breed.emoji}</div>
                <div class="pet-breed-name">${pet.breed.name}</div>
            </div>
            
            <div class="pet-status-bars">
                <div class="status-bar">
                    <span class="status-icon">🍖</span>
                    <div class="bar-bg">
                        <div class="bar-fill hunger" style="width: ${pet.hunger}%"></div>
                    </div>
                    <span class="status-value">${pet.hunger}</span>
                </div>
                <div class="status-desc">${pet.getStatusDesc('hunger')}</div>
                
                <div class="status-bar">
                    <span class="status-icon">😊</span>
                    <div class="bar-bg">
                        <div class="bar-fill mood" style="width: ${pet.mood}%"></div>
                    </div>
                    <span class="status-value">${pet.mood}</span>
                </div>
                <div class="status-desc">${pet.getStatusDesc('mood')}</div>
                
                <div class="status-bar">
                    <span class="status-icon">⚡</span>
                    <div class="bar-bg">
                        <div class="bar-fill energy" style="width: ${pet.energy}%"></div>
                    </div>
                    <span class="status-value">${pet.energy}</span>
                </div>
                <div class="status-desc">${pet.getStatusDesc('energy')}</div>
                
                <div class="status-bar">
                    <span class="status-icon">❤️</span>
                    <div class="bar-bg">
                        <div class="bar-fill affection" style="width: ${pet.affection}%"></div>
                    </div>
                    <span class="status-value">${pet.affection}</span>
                </div>
                <div class="status-desc">${pet.getStatusDesc('affection')}</div>
                
                <div class="status-bar">
                    <span class="status-icon">✨</span>
                    <div class="bar-bg">
                        <div class="bar-fill cleanliness" style="width: ${pet.cleanliness}%"></div>
                    </div>
                    <span class="status-value">${pet.cleanliness}</span>
                </div>
            </div>
            
            <div class="pet-actions">
                <button class="pet-action-btn" data-action="feed">
                    <span class="action-icon">🍖</span>
                    <span>喂食</span>
                </button>
                <button class="pet-action-btn" data-action="pet">
                    <span class="action-icon">💕</span>
                    <span>抚摸</span>
                </button>
                <button class="pet-action-btn" data-action="play">
                    <span class="action-icon">🎮</span>
                    <span>玩耍</span>
                </button>
                <button class="pet-action-btn" data-action="clean">
                    <span class="action-icon">🛁</span>
                    <span>清洁</span>
                </button>
                <button class="pet-action-btn" data-action="sleep">
                    <span class="action-icon">💤</span>
                    <span>睡觉</span>
                </button>
            </div>
            
            <div class="pet-food-inventory">
                <div class="food-title">食物库存</div>
                <div class="food-list">
                    <div class="food-item" data-food="basic">
                        <span class="food-emoji">🥣</span>
                        <span class="food-count">${petGameState.foods.basic}</span>
                    </div>
                    <div class="food-item" data-food="premium">
                        <span class="food-emoji">🥫</span>
                        <span class="food-count">${petGameState.foods.premium}</span>
                    </div>
                    <div class="food-item" data-food="luxury">
                        <span class="food-emoji">🍱</span>
                        <span class="food-count">${petGameState.foods.luxury}</span>
                    </div>
                    <div class="food-item" data-food="treat">
                        <span class="food-emoji">🍪</span>
                        <span class="food-count">${petGameState.foods.treat}</span>
                    </div>
                </div>
                <button id="pet-shop-btn" class="pet-btn-small">🛒 商店</button>
            </div>
            
            <button id="reset-pet-btn" class="pet-btn-text">重新开始</button>
        </div>
        
        <div id="pet-shop-modal" class="pet-modal" style="display:none;">
            <div class="pet-modal-content">
                <h4>🛒 食物商店</h4>
                <div class="shop-items">
                    ${renderShopItems()}
                </div>
                <button class="pet-btn-secondary close-modal">关闭</button>
            </div>
        </div>
        
        <div id="pet-food-menu" class="pet-modal" style="display:none;">
            <div class="pet-modal-content">
                <h4>🍖 选择食物</h4>
                <div class="food-menu-items">
                    ${renderFoodMenu()}
                </div>
                <button class="pet-btn-secondary close-food-menu">取消</button>
            </div>
        </div>
    `;
}

function renderShopItems() {
    let html = '';
    for (let [key, food] of Object.entries(FOODS)) {
        html += `
            <div class="shop-item" data-food="${key}">
                <span class="shop-emoji">${food.emoji}</span>
                <div class="shop-info">
                    <div class="shop-name">${food.name}</div>
                    <div class="shop-effect">饱食度 +${food.hunger}${food.mood ? ', 心情 +' + food.mood : ''}</div>
                </div>
                <button class="shop-buy-btn">💰 ${food.price}</button>
            </div>
        `;
    }
    return html;
}

function renderFoodMenu() {
    let html = '';
    for (let [key, food] of Object.entries(FOODS)) {
        const count = petGameState.foods[key] || 0;
        html += `
            <div class="food-menu-item ${count === 0 ? 'disabled' : ''}" data-food="${key}">
                <span class="food-menu-emoji">${food.emoji}</span>
                <div class="food-menu-info">
                    <div class="food-menu-name">${food.name}</div>
                    <div class="food-menu-count">库存: ${count}</div>
                </div>
            </div>
        `;
    }
    return html;
}

function updatePetUI() {
    const pet = petGameState.pet;
    if (!pet) return;
    
    // 更新状态条
    const hungerBar = document.querySelector('.bar-fill.hunger');
    const moodBar = document.querySelector('.bar-fill.mood');
    const energyBar = document.querySelector('.bar-fill.energy');
    const affectionBar = document.querySelector('.bar-fill.affection');
    const cleanlinessBar = document.querySelector('.bar-fill.cleanliness');
    
    if (hungerBar) hungerBar.style.width = `${pet.hunger}%`;
    if (moodBar) moodBar.style.width = `${pet.mood}%`;
    if (energyBar) energyBar.style.width = `${pet.energy}%`;
    if (affectionBar) affectionBar.style.width = `${pet.affection}%`;
    if (cleanlinessBar) cleanlinessBar.style.width = `${pet.cleanliness}%`;
    
    // 更新数值显示
    const statusValues = document.querySelectorAll('.status-value');
    if (statusValues[0]) statusValues[0].textContent = pet.hunger;
    if (statusValues[1]) statusValues[1].textContent = pet.mood;
    if (statusValues[2]) statusValues[2].textContent = pet.energy;
    if (statusValues[3]) statusValues[3].textContent = pet.affection;
    
    // 更新状态描述
    const statusDescs = document.querySelectorAll('.status-desc');
    if (statusDescs[0]) statusDescs[0].textContent = pet.getStatusDesc('hunger');
    if (statusDescs[1]) statusDescs[1].textContent = pet.getStatusDesc('mood');
    if (statusDescs[2]) statusDescs[2].textContent = pet.getStatusDesc('energy');
    if (statusDescs[3]) statusDescs[3].textContent = pet.getStatusDesc('affection');
    
    // 更新经验条
    const expFill = document.querySelector('.exp-fill');
    const expText = document.querySelector('.exp-text');
    if (expFill) expFill.style.width = `${(pet.exp / pet.expToNext * 100)}%`;
    if (expText) expText.textContent = `${pet.exp}/${pet.expToNext}`;
    
    // 更新等级和金币
    const levelEl = document.querySelector('.pet-level');
    const coinsEl = document.querySelector('.pet-coins');
    if (levelEl) levelEl.textContent = `Lv.${pet.level}`;
    if (coinsEl) coinsEl.textContent = `💰 ${petGameState.coins}`;
    
    // 更新食物库存
    const foodCounts = document.querySelectorAll('.food-count');
    if (foodCounts[0]) foodCounts[0].textContent = petGameState.foods.basic;
    if (foodCounts[1]) foodCounts[1].textContent = petGameState.foods.premium;
    if (foodCounts[2]) foodCounts[2].textContent = petGameState.foods.luxury;
    if (foodCounts[3]) foodCounts[3].textContent = petGameState.foods.treat;
}

// ===== 事件监听 =====

function attachSelectionListeners() {
    let selectedType = null;
    let selectedBreed = null;
    
    // 选择宠物类型
    document.querySelectorAll('.pet-type-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.pet-type-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedType = card.dataset.type;
            
            // 显示品种选择
            showBreedSelection(selectedType);
        });
    });
    
    // 返回按钮
    const backBtn = document.getElementById('back-selection-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            document.querySelector('.pet-create-form').style.display = 'none';
            document.querySelector('.pet-type-grid').style.display = 'grid';
            selectedType = null;
            selectedBreed = null;
        });
    }
    
    // 创建宠物按钮
    const createBtn = document.getElementById('create-pet-btn');
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            const nameInput = document.getElementById('pet-name-input');
            const name = nameInput?.value.trim();
            if (selectedType && selectedBreed && name) {
                createPet(selectedType, selectedBreed, name);
            } else {
                showPetToast('请完整填写信息', 'warning');
            }
        });
    }
}

function showBreedSelection(type) {
    const breeds = PET_BREEDS[type];
    const container = document.querySelector('.breed-selection');
    
    let html = '<div class="breed-title">选择品种</div><div class="breed-grid">';
    breeds.forEach(breed => {
        html += `
            <div class="breed-card" data-breed="${breed.id}">
                <span class="breed-emoji">${breed.emoji}</span>
                <span class="breed-name">${breed.name}</span>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
    document.querySelector('.pet-type-grid').style.display = 'none';
    document.querySelector('.pet-create-form').style.display = 'block';
    
    // 品种选择事件
    document.querySelectorAll('.breed-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.breed-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedBreed = card.dataset.breed;
        });
    });
}

function attachGameListeners() {
    // 互动按钮
    document.querySelectorAll('.pet-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action === 'feed') {
                showFoodMenu();
            } else if (action === 'pet') {
                petPet();
            } else if (action === 'play') {
                playWithPet();
            } else if (action === 'clean') {
                cleanPet();
            } else if (action === 'sleep') {
                sleepPet();
            }
        });
    });
    
    // 商店按钮
    const shopBtn = document.getElementById('pet-shop-btn');
    if (shopBtn) {
        shopBtn.addEventListener('click', () => {
            document.getElementById('pet-shop-modal').style.display = 'flex';
        });
    }
    
    // 关闭商店
    document.querySelector('#pet-shop-modal .close-modal')?.addEventListener('click', () => {
        document.getElementById('pet-shop-modal').style.display = 'none';
    });
    
    // 购买食物
    document.querySelectorAll('.shop-item').forEach(item => {
        item.querySelector('.shop-buy-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            buyFood(item.dataset.food);
        });
    });
    
    // 重置按钮
    const resetBtn = document.getElementById('reset-pet-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetPet);
    }
}

function showFoodMenu() {
    const modal = document.getElementById('pet-food-menu');
    const itemsContainer = modal.querySelector('.food-menu-items');
    itemsContainer.innerHTML = renderFoodMenu();
    modal.style.display = 'flex';
    
    // 选择食物
    itemsContainer.querySelectorAll('.food-menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const foodType = item.dataset.food;
            if (!item.classList.contains('disabled')) {
                feedPet(foodType);
                modal.style.display = 'none';
            }
        });
    });
    
    // 关闭菜单
    modal.querySelector('.close-food-menu')?.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

// 播放宠物动画
function playPetAnimation(type) {
    const avatar = document.querySelector('.pet-avatar');
    if (!avatar) return;
    
    avatar.classList.remove('anim-eat', 'anim-happy', 'anim-play', 'anim-clean', 'anim-sleep');
    void avatar.offsetWidth; // 触发重排
    avatar.classList.add(`anim-${type}`);
    
    setTimeout(() => {
        avatar.classList.remove(`anim-${type}`);
    }, 1000);
}

// 显示提示
function showPetToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `pet-toast ${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        border-radius: 24px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        animation: fadeInOut 2s ease forwards;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : type === 'warning' ? '#fff3cd' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#0c5460'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : type === 'warning' ? '#ffeeba' : '#bee5eb'};
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// ===== CSS 样式 =====
const petStyles = `
<style id="pet-game-styles">
/* 宠物游戏样式 */
#pet-game-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 16px;
    font-family: inherit;
}

/* 选择界面 */
.pet-selection {
    text-align: center;
}

.pet-header {
    margin-bottom: 20px;
}

.pet-header h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    color: var(--text-primary);
}

.pet-header p {
    margin: 0;
    font-size: 13px;
    color: var(--text-secondary);
}

.pet-type-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 20px;
}

.pet-type-card {
    background: var(--card-bg);
    border: 2px solid var(--border-color);
    border-radius: 16px;
    padding: 16px 8px;
    cursor: pointer;
    transition: all 0.2s;
}

.pet-type-card:hover {
    border-color: var(--accent-color);
    transform: translateY(-2px);
}

.pet-type-card.selected {
    border-color: var(--accent-color);
    background: rgba(var(--accent-color-rgb), 0.1);
}

.pet-emoji {
    font-size: 40px;
    margin-bottom: 8px;
}

.pet-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
}

.pet-desc {
    font-size: 11px;
    color: var(--text-secondary);
    margin-top: 4px;
}

/* 创建表单 */
.pet-create-form {
    background: var(--card-bg);
    border-radius: 16px;
    padding: 20px;
}

.breed-selection {
    margin-bottom: 16px;
}

.breed-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--text-primary);
}

.breed-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 16px;
}

.breed-card {
    background: var(--primary-bg);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    padding: 12px 4px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.breed-card:hover, .breed-card.selected {
    border-color: var(--accent-color);
    background: rgba(var(--accent-color-rgb), 0.1);
}

.breed-emoji {
    font-size: 28px;
    margin-bottom: 4px;
}

.breed-name {
    font-size: 12px;
    color: var(--text-primary);
}

#pet-name-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid var(--border-color);
    border-radius: 12px;
    font-size: 14px;
    margin-bottom: 12px;
    background: var(--primary-bg);
    color: var(--text-primary);
    box-sizing: border-box;
}

#pet-name-input:focus {
    outline: none;
    border-color: var(--accent-color);
}

.pet-btn-primary {
    width: 100%;
    padding: 12px;
    background: var(--accent-color);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 8px;
}

.pet-btn-secondary {
    width: 100%;
    padding: 12px;
    background: var(--primary-bg);
    color: var(--text-primary);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    font-size: 14px;
    cursor: pointer;
}

/* 游戏界面 */
.pet-game {
    background: var(--card-bg);
    border-radius: 20px;
    padding: 20px;
}

.pet-game .pet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.pet-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.pet-level {
    background: var(--accent-color);
    color: white;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.pet-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
}

.pet-personality {
    font-size: 11px;
    color: var(--text-secondary);
    background: var(--primary-bg);
    padding: 2px 8px;
    border-radius: 10px;
}

.pet-coins {
    font-size: 14px;
    font-weight: 600;
    color: #f59e0b;
}

.pet-exp-bar {
    height: 20px;
    background: var(--primary-bg);
    border-radius: 10px;
    margin-bottom: 16px;
    position: relative;
    overflow: hidden;
}

.exp-fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981, #34d399);
    border-radius: 10px;
    transition: width 0.3s;
}

.exp-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 11px;
    color: var(--text-primary);
    font-weight: 600;
}

/* 宠物展示区 */
.pet-display {
    text-align: center;
    padding: 24px;
    background: linear-gradient(135deg, rgba(var(--accent-color-rgb), 0.1), rgba(var(--accent-color-rgb), 0.05));
    border-radius: 20px;
    margin-bottom: 20px;
    position: relative;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.pet-avatar {
    font-size: 80px;
    line-height: 1;
    transition: transform 0.3s;
}

.pet-avatar.anim-eat { animation: bounce 0.5s ease 2; }
.pet-avatar.anim-happy { animation: wiggle 0.5s ease; }
.pet-avatar.anim-play { animation: jump 0.6s ease; }
.pet-avatar.anim-clean { animation: shake 0.5s ease; }
.pet-avatar.anim-sleep { animation: pulse 1s ease infinite; }

.pet-breed-name {
    margin-top: 8px;
    font-size: 14px;
    color: var(--text-secondary);
}

/* 状态条 */
.pet-status-bars {
    margin-bottom: 20px;
}

.status-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
}

.status-icon {
    font-size: 16px;
    width: 24px;
    text-align: center;
}

.bar-bg {
    flex: 1;
    height: 10px;
    background: var(--primary-bg);
    border-radius: 5px;
    overflow: hidden;
}

.bar-fill {
    height: 100%;
    border-radius: 5px;
    transition: width 0.3s;
}

.bar-fill.hunger { background: linear-gradient(90deg, #f97316, #fb923c); }
.bar-fill.mood { background: linear-gradient(90deg, #ec4899, #f472b6); }
.bar-fill.energy { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
.bar-fill.affection { background: linear-gradient(90deg, #ef4444, #f87171); }
.bar-fill.cleanliness { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }

.status-value {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
    width: 28px;
    text-align: right;
}

.status-desc {
    font-size: 11px;
    color: var(--text-secondary);
    margin-left: 32px;
    margin-bottom: 12px;
}

.status-desc:last-of-type {
    margin-bottom: 0;
}

/* 互动按钮 */
.pet-actions {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    margin-bottom: 20px;
}

.pet-action-btn {
    background: var(--primary-bg);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    padding: 12px 4px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.pet-action-btn:hover {
    border-color: var(--accent-color);
    background: rgba(var(--accent-color-rgb), 0.1);
}

.pet-action-btn:active {
    transform: scale(0.95);
}

.action-icon {
    font-size: 24px;
}

.pet-action-btn span:last-child {
    font-size: 11px;
    color: var(--text-primary);
}

/* 食物库存 */
.pet-food-inventory {
    background: var(--primary-bg);
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 12px;
}

.food-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 8px;
}

.food-list {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
}

.food-item {
    display: flex;
    align-items: center;
    gap: 4px;
    background: var(--card-bg);
    padding: 6px 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
}

.food-item:hover {
    transform: translateY(-2px);
}

.food-emoji {
    font-size: 20px;
}

.food-count {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
}

.pet-btn-small {
    width: 100%;
    padding: 8px;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 12px;
    cursor: pointer;
    color: var(--text-primary);
}

.pet-btn-text {
    width: 100%;
    padding: 8px;
    background: transparent;
    border: none;
    font-size: 12px;
    color: var(--text-secondary);
    cursor: pointer;
    text-decoration: underline;
}

/* 模态框 */
.pet-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.pet-modal-content {
    background: var(--card-bg);
    border-radius: 20px;
    padding: 20px;
    width: 90%;
    max-width: 320px;
    max-height: 80vh;
    overflow-y: auto;
}

.pet-modal-content h4 {
    margin: 0 0 16px 0;
    text-align: center;
    color: var(--text-primary);
}

.shop-items, .food-menu-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
}

.shop-item, .food-menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--primary-bg);
    border-radius: 12px;
}

.food-menu-item.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.shop-emoji, .food-menu-emoji {
    font-size: 32px;
}

.shop-info, .food-menu-info {
    flex: 1;
}

.shop-name, .food-menu-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
}

.shop-effect, .food-menu-count {
    font-size: 11px;
    color: var(--text-secondary);
}

.shop-buy-btn {
    padding: 8px 16px;
    background: var(--accent-color);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 12px;
    cursor: pointer;
}

/* 动画 */
@keyframes floatUp {
    0% { opacity: 1; transform: translateX(-50%) translateY(0); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-40px); }
}

@keyframes fadeInOut {
    0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
    15% { opacity: 1; transform: translateX(-50%) translateY(0); }
    85% { opacity: 1; transform: translateX(-50%) translateY(0); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

@keyframes wiggle {
    0%, 100% { transform: rotate(0); }
    25% { transform: rotate(-10deg); }
    75% { transform: rotate(10deg); }
}

@keyframes jump {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-20px) scale(1.1); }
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

@keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(0.95); opacity: 0.8; }
}
</style>
`;

// 添加样式到页面
if (!document.getElementById('pet-game-styles')) {
    document.head.insertAdjacentHTML('beforeend', petStyles);
}

// ===== 导出 =====
window.PetGame = {
    init: initPetGame,
    create: createPet,
    feed: feedPet,
    pet: petPet,
    play: playWithPet,
    clean: cleanPet,
    sleep: sleepPet,
    buyFood: buyFood,
    reset: resetPet,
    getState: () => petGameState,
    save: savePetGame,
    load: loadPetGame
};

// 自动初始化（如果容器存在）
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('pet-game-container')) {
        initPetGame();
    }
});
