// 像素宠物伙伴 - 可爱简约梦幻风格

// ===== 配置 =====
const PET_TYPES = {
    cat: { name: '像素猫', desc: '傲娇独立', emoji: '🐱', img: 'https://picui.ogmua.cn/s1/2026/05/28/6a180ba611f4d.webp' },
    dog: { name: '像素狗', desc: '忠诚活泼', emoji: '🐕', img: 'https://picui.ogmua.cn/s1/2026/05/28/6a180ba611f4d.webp' },
    rabbit: { name: '像素兔', desc: '胆小温顺', emoji: '🐰', img: 'https://picui.ogmua.cn/s1/2026/05/28/6a180ba611f4d.webp' },
    fox: { name: '像素狐', desc: '机灵调皮', emoji: '🦊', img: 'https://picui.ogmua.cn/s1/2026/05/28/6a180ba611f4d.webp' },
    hamster: { name: '像素仓鼠', desc: '贪吃囤积', emoji: '🐹', img: 'https://picui.ogmua.cn/s1/2026/05/28/6a180ba611f4d.webp' },
    bird: { name: '像素鸟', desc: '机灵可爱', emoji: '🐦', img: 'https://picui.ogmua.cn/s1/2026/05/28/6a180ba611f4d.webp' }
};

// ===== 宠物子品种 =====
const PET_BREEDS = {
    cat: [
        { id: 'siamese', name: '暹罗猫', desc: '优雅高贵，爱说话', favoriteFood: 'fish', toy: '🧶', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1aadab1789f.webp' },
        { id: 'brown_cat', name: '棕猫', desc: '温暖毛色，沉稳内敛', favoriteFood: 'meat', toy: '🧶', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1aadab3523e.webp' },
        { id: 'tuxedo', name: '奶牛猫', desc: '聪明调皮，黑白分明', favoriteFood: 'meat', toy: '🐟', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1aadab7a89a.webp' },
        { id: 'orange', name: '橘猫', desc: '贪吃慵懒，圆润可爱', favoriteFood: 'fish', toy: '🧶', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1aadb355db5.webp' },
        { id: 'gray_cat', name: '灰猫', desc: '神秘优雅，气质独特', favoriteFood: 'fish', toy: '🪮', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1aadab4ccc2.webp' },
        { id: 'ragdoll', name: '布偶猫', desc: '温顺粘人，蓝眼美人', favoriteFood: 'cake', toy: '🧸', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1aadab94c5c.webp' }
    ],
    dog: [
        { id: 'cocker', name: '可卡犬', desc: '活泼友善，长耳可爱', favoriteFood: 'meat', toy: '🦴', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1acd38aa233.webp' },
        { id: 'husky', name: '哈士奇', desc: '拆家能手，精力旺盛', favoriteFood: 'meat', toy: '🎡', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1acd386a089.webp' },
        { id: 'corgi', name: '柯基', desc: '短腿可爱，屁股迷人', favoriteFood: 'cheese', toy: '🦴', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1acd38926e5.webp' },
        { id: 'shiba', name: '柴犬', desc: '表情丰富，倔强可爱', favoriteFood: 'fish', toy: '🦴', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1acd38bf4cd.webp' },
        { id: 'poodle', name: '贵宾', desc: '聪明优雅，不掉毛', favoriteFood: 'cake', toy: '🧸', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1acd40b41aa.webp' },
        { id: 'samoyed', name: '萨摩耶', desc: '微笑天使，毛茸茸', favoriteFood: 'meat', toy: '🎪', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1acd383dfca.webp' }
    ],
    rabbit: [
        { id: 'holland_lop', name: '垂耳兔', desc: '垂耳温顺，超可爱', favoriteFood: 'carrot', toy: '🧸', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1acfe59cd6a.webp' },
        { id: 'white_rabbit', name: '小白兔', desc: '经典可爱，红眼睛', favoriteFood: 'carrot', toy: '🧸', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1acfe5870ed.webp' },
        { id: 'gray_lop', name: '灰耳兔', desc: '灰色垂耳，温柔安静', favoriteFood: 'berry', toy: '🎪', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1acfe59d1a9.webp' },
        { id: 'dutch', name: '熊猫兔', desc: '黑白花纹，像小熊猫', favoriteFood: 'carrot', toy: '🧶', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1acfe56bac0.webp' }
    ],
    fox: [
        { id: 'red_fox', name: '赤狐', desc: '经典火红，机灵狡猾', favoriteFood: 'berry', toy: '🎪', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1ad90327b52.webp' },
        { id: 'blue_silver_fox', name: '蓝银狐', desc: '蓝银毛色，神秘高贵', favoriteFood: 'fish', toy: '🧸', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1ad9031bdb8.webp' },
        { id: 'ice_fox', name: '冰仙狐', desc: '冰雪精灵，晶莹剔透', favoriteFood: 'honey', toy: '❄️', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1ad9031bee8.webp' },
        { id: 'heart_fox', name: '心狐', desc: '温柔善良，心灵相通', favoriteFood: 'berry', toy: '💕', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1ad90343132.webp' }
    ],
    hamster: [
        { id: 'syrian', name: '金丝熊', desc: '体型最大，性格温顺', favoriteFood: 'cheese', toy: '🎡', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1ad19e0d4c8.webp' },
        { id: 'winter_white', name: '三线仓鼠', desc: '小巧可爱，背上有线', favoriteFood: 'honey', toy: '🎡', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1ad19e097ba.webp' },
        { id: 'white_mouse', name: '小白鼠', desc: '雪白可爱，活泼好动', favoriteFood: 'berry', toy: '🧸', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1ad19e18ed6.webp' },
        { id: 'pudding', name: '布丁鼠', desc: '淡金色毛，超级甜美', favoriteFood: 'cheese', toy: '🧸', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1ad19e0d8ef.webp' }
    ],
    bird: [
        { id: 'crow', name: '乌鸦', desc: '聪明机灵，喜欢亮闪闪的东西', favoriteFood: 'meat', toy: '✨', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1ad505762fd.webp' },
        { id: 'parrot', name: '鹦鹉', desc: '能说会道，色彩斑斓', favoriteFood: 'berry', toy: '🪮', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1ad50584e37.webp' },
        { id: 'magpie', name: '喜鹊', desc: '报喜使者，黑白分明', favoriteFood: 'berry', toy: '🎪', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1ad5056d14a.webp' },
        { id: 'sparrow', name: '麻雀', desc: '活泼好动，自由奔放', favoriteFood: 'berry', toy: '🧶', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1ad50581466.webp' },
        { id: 'long_tailed_tit', name: '北长尾山雀', desc: '圆润可爱，长尾飘飘', favoriteFood: 'honey', toy: '🧸', img: 'https://picui.ogmua.cn/s1/2026/05/30/6a1ad505e22ef.webp' }
    ]
};

// 随机性格列表
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

// 宠物技能系统
const PET_SKILLS = {
    // 外出触发技能
    explorer: { id: 'explorer', name: '探险家', icon: '🧭', desc: '外出带回更多宝藏', trigger: 'goOut', effect: { treasureBonus: 0.3 } },
    hunter: { id: 'hunter', name: '猎手', icon: '🎯', desc: '外出带回更多金币', trigger: 'goOut', effect: { coinBonus: 0.5 } },
    social: { id: 'social', name: '社交达人', icon: '💬', desc: '外出时更容易遇到其他宠物', trigger: 'goOut', effect: { eventBonus: 0.4 } },
    // 等级触发技能
    glutton: { id: 'glutton', name: '大胃王', icon: '🍖', desc: '饱食度下降速度-20%', trigger: 'level', level: 5, effect: { hungerDecay: -0.2 } },
    optimistic: { id: 'optimistic', name: '乐天派', icon: '😊', desc: '心情下降速度-20%', trigger: 'level', level: 5, effect: { moodDecay: -0.2 } },
    energetic: { id: 'energetic', name: '精力充沛', icon: '⚡', desc: '精力下降速度-20%', trigger: 'level', level: 5, effect: { energyDecay: -0.2 } },
    lucky: { id: 'lucky', name: '幸运星', icon: '🍀', desc: '金币产出+30%', trigger: 'level', level: 10, effect: { coinProduction: 0.3 } },
    charming: { id: 'charming', name: '魅力四射', icon: '✨', desc: '好感度获取+50%', trigger: 'level', level: 10, effect: { affectionGain: 0.5 } },
    clever: { id: 'clever', name: '聪明伶俐', icon: '📚', desc: '经验获取+30%', trigger: 'level', level: 15, effect: { expGain: 0.3 } },
    healthy: { id: 'healthy', name: '强健体魄', icon: '💪', desc: '不容易生病', trigger: 'level', level: 15, effect: { sickResist: 0.5 } },
    master: { id: 'master', name: '大师', icon: '👑', desc: '所有状态数值上限+10', trigger: 'level', level: 20, effect: { statCap: 10 } }
};

// 宠物颜色
const PET_COLORS = {
    cat: ['橘色', '白色', '黑色', '灰色', '三花色', '奶牛色', '暹罗色', '虎斑色'],
    dog: ['金色', '白色', '黑色', '棕色', '灰色', '花色', '奶油色', '红色'],
    rabbit: ['白色', '灰色', '棕色', '黑色', '花色', '黄色', '蓝色', '巧克力色'],
    fox: ['红色', '白色', '银色', '黑色', '十字纹', '茶色', '灰色', '金色'],
    hamster: ['金色', '白色', '灰色', '棕色', '黑色', '奶油色', '花色', '黄色'],
    bird: ['黑色', '白色', '灰色', '棕色', '绿色', '蓝色', '黄色', '红色']
};

// 随机事件配置
const RANDOM_EVENTS = {
    // 宠物与主人的互动
    pet: [
        { id: 'pet_1', title: '🎾 玩耍时间', desc: '你的宠物叼着球来找你玩，你们度过了一段快乐的时光！', effect: { mood: 15, affection: 5 } },
        { id: 'pet_2', title: '😺 撒娇时刻', desc: '宠物蹭了蹭你的手，发出舒服的呼噜声。', effect: { affection: 8 } },
        { id: 'pet_3', title: '🎁 惊喜礼物', desc: '宠物从角落里叼来一个小东西送给你，原来是它珍藏的宝贝！', effect: { mood: 10, affection: 5 }, item: { icon: '🎀', name: '宠物的礼物' } },
        { id: 'pet_4', title: '💤 午睡时光', desc: '宠物蜷缩在你的腿上睡着了，看起来好安心。', effect: { energy: 20, affection: 5 } },
        { id: 'pet_5', title: '🍖 肚子饿了', desc: '宠物眼巴巴地看着你，好像在说"我饿了"。', effect: { hunger: -10 } },
        { id: 'pet_6', title: '🎵 音乐天赋', desc: '宠物跟着音乐的节奏摇摆，好可爱！', effect: { mood: 20 } },
        { id: 'pet_7', title: '🌟 意外发现', desc: '宠物在角落里发现了一些金币，开心地叼给你！', effect: { coins: 30 } },
        { id: 'pet_8', title: '📸 拍照时刻', desc: '宠物摆出了可爱的姿势，让你给你拍照。', effect: { mood: 10, affection: 5 } }
    ],
    // 梦角与宠物的互动
    dream: [
        { id: 'dream_1', title: '💕 梦角的礼物', desc: '梦角给宠物带来了特别的零食，宠物吃得很开心！', effect: { hunger: 20, mood: 15 } },
        { id: 'dream_2', title: '🎮 一起玩耍', desc: '梦角陪宠物玩游戏，你们三个玩得很开心。', effect: { mood: 20, affection: 8, energy: -10 } },
        { id: 'dream_3', title: '🛁 洗澡时间', desc: '梦角帮宠物洗了个澡，现在它香喷喷的！', effect: { mood: 10, affection: 5 } },
        { id: 'dream_4', title: '📖 故事时间', desc: '梦角给宠物讲睡前故事，宠物听得入迷。', effect: { energy: 15, affection: 5 } },
        { id: 'dream_5', title: '🎪 训练课程', desc: '梦角教宠物学习新技能，宠物学得很认真！', effect: { exp: 50, affection: 5 } },
        { id: 'dream_6', title: '🌙 晚安吻', desc: '梦角轻轻吻了宠物的额头，祝它好梦。', effect: { mood: 15, affection: 8 } },
        { id: 'dream_7', title: '💰 幸运发现', desc: '梦角和宠物一起找到了一些金币！', effect: { coins: 50 } },
        { id: 'dream_8', title: '🎁 神秘礼物', desc: '梦角和宠物一起为你准备了一份惊喜！', effect: { affection: 10, mood: 20 } }
    ]
};

// 繁育图谱 - 特殊品种只能通过繁育获得
const BREEDING_CHART = {
    cat: [
        { id: 'brown_cat', name: '棕猫', icon: '🐱', unlock: 'base', parents: [] },
        { id: 'tuxedo', name: '奶牛猫', icon: '🐱', unlock: 'base', parents: [] },
        { id: 'orange', name: '橘猫', icon: '🐱', unlock: 'base', parents: [] },
        { id: 'gray_cat', name: '灰猫', icon: '🐱', unlock: 'base', parents: [] },
        { id: 'ragdoll', name: '布偶猫', icon: '🐱', unlock: 'base', parents: [] },
        { id: 'siamese', name: '暹罗猫', icon: '🐱', unlock: 'breed', parents: ['brown_cat', 'gray_cat'], special: true, rare: true, chance: 0.1, ability: 'talkative', abilityName: '话痨', abilityDesc: '更容易触发随机事件' }
    ],
    dog: [
        { id: 'husky', name: '哈士奇', icon: '🐕', unlock: 'base', parents: [] },
        { id: 'corgi', name: '柯基', icon: '🐕', unlock: 'base', parents: [] },
        { id: 'shiba', name: '柴犬', icon: '🐕', unlock: 'base', parents: [] },
        { id: 'poodle', name: '贵宾', icon: '🐕', unlock: 'base', parents: [] },
        { id: 'samoyed', name: '萨摩耶', icon: '🐕', unlock: 'base', parents: [] },
        { id: 'cocker', name: '可卡犬', icon: '🐕', unlock: 'breed', parents: ['poodle', 'shiba'], special: true, rare: true, chance: 0.1, ability: 'lucky', abilityName: '幸运', abilityDesc: '金币获取+50%' }
    ],
    rabbit: [
        { id: 'holland_lop', name: '垂耳兔', icon: '🐰', unlock: 'base', parents: [] },
        { id: 'white_rabbit', name: '小白兔', icon: '🐰', unlock: 'base', parents: [] },
        { id: 'gray_lop', name: '灰耳兔', icon: '🐰', unlock: 'base', parents: [] },
        { id: 'dutch', name: '熊猫兔', icon: '🐰', unlock: 'breed', parents: ['white_rabbit', 'gray_lop'], special: true, rare: true, chance: 0.1, ability: 'cute', abilityName: '萌力', abilityDesc: '好感度获取+100%' }
    ],
    fox: [
        { id: 'red_fox', name: '赤狐', icon: '🦊', unlock: 'base', parents: [] },
        { id: 'blue_silver_fox', name: '蓝银狐', icon: '🦊', unlock: 'base', parents: [] },
        { id: 'heart_fox', name: '心狐', icon: '🦊', unlock: 'base', parents: [] },
        { id: 'ice_fox', name: '冰仙狐', icon: '🦊', unlock: 'breed', parents: ['blue_silver_fox', 'heart_fox'], special: true, rare: true, chance: 0.1, ability: 'ice', abilityName: '冰霜', abilityDesc: '状态下降速度-30%' }
    ],
    hamster: [
        { id: 'winter_white', name: '三线仓鼠', icon: '🐹', unlock: 'base', parents: [] },
        { id: 'white_mouse', name: '小白鼠', icon: '🐹', unlock: 'base', parents: [] },
        { id: 'pudding', name: '布丁鼠', icon: '🐹', unlock: 'base', parents: [] },
        { id: 'syrian', name: '金丝熊', icon: '🐹', unlock: 'breed', parents: ['winter_white', 'pudding'], special: true, rare: true, chance: 0.1, ability: 'hoard', abilityName: '囤积', abilityDesc: '饱食度下降速度-50%' }
    ],
    bird: [
        { id: 'crow', name: '乌鸦', icon: '🐦', unlock: 'base', parents: [] },
        { id: 'parrot', name: '鹦鹉', icon: '🐦', unlock: 'base', parents: [] },
        { id: 'magpie', name: '喜鹊', icon: '🐦', unlock: 'base', parents: [] },
        { id: 'sparrow', name: '麻雀', icon: '🐦', unlock: 'base', parents: [] },
        { id: 'long_tailed_tit', name: '北长尾山雀', icon: '🐦', unlock: 'breed', parents: ['magpie', 'sparrow'], special: true, rare: true, chance: 0.1, ability: 'fly', abilityName: '飞翔', abilityDesc: '外出带回双倍奖励' }
    ]
};

const STAGES = {
    baby: { name: '幼年期', minLevel: 1, expPerLevel: 50 },
    child: { name: '成长期', minLevel: 10, expPerLevel: 100 },
    adult: { name: '成年期', minLevel: 30, expPerLevel: 200 }
};

// 状态描述词
const STATUS_WORDS = {
    hunger: {
        100: '吃撑啦', 80: '肚子饱饱的', 60: '有点饱了',
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
        40: '有点亲近', 20: '有点陌生', 0: '你是谁'
    }
};

// 成就配置
const ACHIEVEMENTS = [
    // 基础互动成就
    { id: 'first_feed', icon: '🍽️', name: '第一餐', desc: '第一次喂食宠物', check: (p, s) => s.totalFeeds >= 1 },
    { id: 'feed_10', icon: '👨‍🍳', name: '小厨师', desc: '累计喂食10次', check: (p, s) => s.totalFeeds >= 10 },
    { id: 'feed_50', icon: '👩‍🍳', name: '大厨', desc: '累计喂食50次', check: (p, s) => s.totalFeeds >= 50 },
    { id: 'feed_100', icon: '🍳', name: '美食家', desc: '累计喂食100次', check: (p, s) => s.totalFeeds >= 100 },
    { id: 'pet_10', icon: '🤗', name: '温柔之手', desc: '累计抚摸10次', check: (p, s) => s.totalPets >= 10 },
    { id: 'pet_50', icon: '💕', name: '抚摸达人', desc: '累计抚摸50次', check: (p, s) => s.totalPets >= 50 },
    { id: 'pet_100', icon: '🤲', name: '抚摸大师', desc: '累计抚摸100次', check: (p, s) => s.totalPets >= 100 },
    { id: 'play_5', icon: '🎮', name: '游戏伙伴', desc: '累计玩耍5次', check: (p, s) => s.totalPlays >= 5 },
    { id: 'play_20', icon: '🏅', name: '游戏高手', desc: '累计玩耍20次', check: (p, s) => s.totalPlays >= 20 },
    { id: 'play_50', icon: '🎪', name: '游戏大师', desc: '累计玩耍50次', check: (p, s) => s.totalPlays >= 50 },
    { id: 'clean_10', icon: '🧼', name: '爱干净', desc: '累计清洁10次', check: (p, s) => s.totalCleans >= 10 },
    { id: 'clean_50', icon: '🛁', name: '洁癖患者', desc: '累计清洁50次', check: (p, s) => s.totalCleans >= 50 },

    // 等级成长成就
    { id: 'level_5', icon: '⭐', name: '成长中', desc: '宠物达到5级', check: (p) => p.level >= 5 },
    { id: 'level_10', icon: '🌟', name: '成长期', desc: '宠物达到10级', check: (p) => p.level >= 10 },
    { id: 'level_20', icon: '✨', name: '茁壮成长', desc: '宠物达到20级', check: (p) => p.level >= 20 },
    { id: 'level_30', icon: '👑', name: '成年啦', desc: '宠物达到30级', check: (p) => p.level >= 30 },
    { id: 'level_50', icon: '🏆', name: '满级大佬', desc: '宠物达到50级', check: (p) => p.level >= 50 },

    // 状态成就
    { id: 'affection_max', icon: '💖', name: '最好的朋友', desc: '好感度达到100', check: (p) => p.stats.affection >= 100 },
    { id: 'all_stats_high', icon: '🌈', name: '幸福满满', desc: '所有状态达到80以上', check: (p) => p.stats.hunger >= 80 && p.stats.mood >= 80 && p.stats.energy >= 80 && p.stats.affection >= 80 },
    { id: 'perfect_status', icon: '💎', name: '完美状态', desc: '所有状态达到100', check: (p) => p.stats.hunger >= 100 && p.stats.mood >= 100 && p.stats.energy >= 100 && p.stats.affection >= 100 },

    // 宠物收集成就
    { id: 'multi_pet', icon: '🐾', name: '宠物大家族', desc: '拥有3只以上宠物', check: (p, s) => Object.keys(gameState.pets).length >= 3 },
    { id: 'pet_collector', icon: '🏘️', name: '宠物收藏家', desc: '拥有5只以上宠物', check: (p, s) => Object.keys(gameState.pets).length >= 5 },
    { id: 'pet_hoarder', icon: '🏰', name: '宠物王国', desc: '拥有10只以上宠物', check: (p, s) => Object.keys(gameState.pets).length >= 10 },

    // 任务成就
    { id: 'task_complete', icon: '📋', name: '任务达人', desc: '完成所有每日任务', check: (p, s) => gameState.dailyTasks.every(t => t.current >= t.target) },
    { id: 'task_master', icon: '📜', name: '任务大师', desc: '累计完成30个每日任务', check: (p, s) => s.totalTasksCompleted >= 30 },

    // 外出探索成就
    { id: 'first_goout', icon: '🚪', name: '第一次外出', desc: '第一次带宠物外出', check: (p, s) => s.totalGoOuts >= 1 },
    { id: 'goout_10', icon: '🌳', name: '探险家', desc: '累计外出10次', check: (p, s) => s.totalGoOuts >= 10 },
    { id: 'goout_50', icon: '🗺️', name: '旅行家', desc: '累计外出50次', check: (p, s) => s.totalGoOuts >= 50 },
    { id: 'treasure_10', icon: '💎', name: '寻宝猎人', desc: '累计获得10个宝藏', check: (p, s) => s.totalTreasures >= 10 },
    { id: 'treasure_50', icon: '👑', name: '宝藏大师', desc: '累计获得50个宝藏', check: (p, s) => s.totalTreasures >= 50 },

    // 金币成就
    { id: 'rich', icon: '💰', name: '小富翁', desc: '拥有500金币', check: (p, s) => gameState.coins >= 500 },
    { id: 'richer', icon: '💵', name: '大富翁', desc: '拥有2000金币', check: (p, s) => gameState.coins >= 2000 },
    { id: 'richest', icon: '🏦', name: '金币大亨', desc: '拥有5000金币', check: (p, s) => gameState.coins >= 5000 },

    // 繁育成就
    { id: 'first_breed', icon: '💕', name: '第一次繁育', desc: '成功繁育第一只宠物', check: (p, s) => s.totalBreeds >= 1 },
    { id: 'breed_5', icon: '🍼', name: '繁育专家', desc: '成功繁育5只宠物', check: (p, s) => s.totalBreeds >= 5 },
    { id: 'breed_10', icon: '👨‍👩‍👧‍👦', name: '大家族', desc: '成功繁育10只宠物', check: (p, s) => s.totalBreeds >= 10 },
    { id: 'special_breed', icon: '✨', name: '稀有品种', desc: '繁育出特殊品种', check: (p, s) => s.hasSpecialBreed },

    // 技能成就
    { id: 'first_skill', icon: '📚', name: '初识技能', desc: '宠物学会第一个技能', check: (p) => p.skills && p.skills.length >= 1 },
    { id: 'skill_master', icon: '🎓', name: '技能大师', desc: '宠物学会5个技能', check: (p) => p.skills && p.skills.length >= 5 },

    // 购物成就
    { id: 'first_shop', icon: '🛒', name: '第一次购物', desc: '第一次在商场购买物品', check: (p, s) => s.totalPurchases >= 1 },
    { id: 'shopaholic', icon: '🛍️', name: '购物狂', desc: '累计购买20次', check: (p, s) => s.totalPurchases >= 20 },

    // 生病与治疗成就
    { id: 'first_sick', icon: '🤒', name: '第一次生病', desc: '宠物第一次生病', check: (p, s) => s.totalSick >= 1 },
    { id: 'doctor', icon: '💊', name: '宠物医生', desc: '累计治疗宠物5次', check: (p, s) => s.totalCured >= 5 },

    // 随机事件成就
    { id: 'first_event', icon: '🎲', name: '意外惊喜', desc: '第一次触发随机事件', check: (p, s) => s.totalEvents >= 1 },
    { id: 'event_master', icon: '🎪', name: '事件达人', desc: '累计触发20次随机事件', check: (p, s) => s.totalEvents >= 20 },

    // 家具收集成就
    { id: 'furniture_3', icon: '🪑', name: '家具收集者', desc: '拥有3件家具', check: (p, s) => gameState.houseFurniture.length >= 3 },
    { id: 'furniture_6', icon: '🏠', name: '室内设计师', desc: '拥有6件家具', check: (p, s) => gameState.houseFurniture.length >= 6 },

    // 服饰收集成就
    { id: 'clothes_5', icon: '👔', name: '时尚达人', desc: '拥有5件服饰', check: (p, s) => gameState.wardrobe.length >= 5 },
    { id: 'clothes_10', icon: '👗', name: '时装收藏家', desc: '拥有10件服饰', check: (p, s) => gameState.wardrobe.length >= 10 }
];

// 食物数据库
const FOODS = {
    carrot: { id: 'carrot', icon: '🥕', name: '胡萝卜', desc: '+10饱食度', hunger: 10, exp: 5 },
    fish: { id: 'fish', icon: '🐟', name: '小鱼干', desc: '+20饱食度', hunger: 20, exp: 10 },
    cake: { id: 'cake', icon: '🍰', name: '小蛋糕', desc: '+30饱食度 +心情', hunger: 30, mood: 10, exp: 15 },
    meat: { id: 'meat', icon: '🥩', name: '鲜肉', desc: '+25饱食度', hunger: 25, exp: 12 },
    berry: { id: 'berry', icon: '🫐', name: '浆果', desc: '+15饱食度 +心情', hunger: 15, mood: 5, exp: 8 },
    cheese: { id: 'cheese', icon: '🧀', name: '奶酪', desc: '+20饱食度', hunger: 20, exp: 10 },
    apple: { id: 'apple', icon: '🍎', name: '苹果', desc: '+12饱食度', hunger: 12, exp: 6 },
    cookie: { id: 'cookie', icon: '🍪', name: '饼干', desc: '+15饱食度 +心情', hunger: 15, mood: 8, exp: 8 },
    milk: { id: 'milk', icon: '🥛', name: '牛奶', desc: '+10饱食度 +精力', hunger: 10, energy: 5, exp: 6 },
    honey: { id: 'honey', icon: '🍯', name: '蜂蜜', desc: '+20饱食度 +心情', hunger: 20, mood: 10, exp: 12 }
};

// 每种宠物最喜欢的食物
const PET_FAVORITE_FOODS = {
    cat: 'fish',
    dog: 'meat',
    rabbit: 'carrot',
    fox: 'berry',
    hamster: 'cheese',
    bird: 'meat'
};

// 互动选项配置
const INTERACTION_OPTIONS = {
    feed: {
        icon: '🍖', title: '给宠物吃什么？', headerColor: 'yellow',
        getOptions: () => {
            // 从食物库获取食物
            const foods = (gameState.foodStorage || []).map(f => ({
                id: f.id,
                icon: f.icon,
                name: `${f.name} x${f.count}`,
                desc: f.desc,
                hunger: f.hunger,
                count: f.count
            }));
            if (foods.length === 0) {
                foods.push({ id: 'empty', icon: '😢', name: '没有食物了', desc: '去商场买点食物吧', disabled: true });
            }
            return foods;
        }
    },
    pet: {
        icon: '👋', title: '摸摸哪里？', headerColor: 'pink',
        options: [
            { id: 'head', icon: '😊', name: '摸摸头', desc: '心情+12 好感+2', mood: 12, affection: 2, exp: 5 },
            { id: 'belly', icon: '🤗', name: '揉揉肚子', desc: '心情+15 好感+1', mood: 15, affection: 1, exp: 8 },
            { id: 'chin', icon: '😌', name: '挠挠下巴', desc: '心情+8 好感+3', mood: 8, affection: 3, exp: 6 },
            { id: 'back', icon: '😴', name: '拍拍背', desc: '心情+5 精力+10', mood: 5, energy: 10, exp: 4 }
        ]
    },
    play: {
        icon: '🎮', title: '玩什么游戏？', headerColor: 'mint',
        options: [
            { id: 'click', icon: '⚡', name: '快速点击', desc: '10秒点击星星', exp: 20 },
            { id: 'memory', icon: '🧠', name: '记忆翻牌', desc: '找出相同图案', exp: 25 },
            { id: 'rps', icon: '✊', name: '猜拳', desc: '石头剪刀布', exp: 15 }
        ]
    },
    sleep: {
        icon: '🌙', title: '睡多久？', headerColor: 'purple',
        options: [
            { id: 'nap', icon: '😴', name: '小憩一会儿', desc: '精力+30', energy: 30, exp: 5 },
            { id: 'sleep', icon: '💤', name: '睡个好觉', desc: '精力+60', energy: 60, exp: 10 },
            { id: 'deep', icon: '🛌', name: '深度睡眠', desc: '精力+100', energy: 100, exp: 15 }
        ]
    },
    clean: {
        icon: '🛁', title: '清洁方式', headerColor: 'mint',
        getOptions: () => {
            const options = [];
            const supplies = (gameState.locker && gameState.locker.supplies) || [];

            // 擦擦脸 - 默认可用
            options.push({ id: 'wipe', icon: '🧽', name: '擦擦脸', desc: '心情+5 好感+2', mood: 5, affection: 2, exp: 6 });

            // 梳梳毛 - 需要梳子
            const hasBrush = supplies.some(s => s.id === 's1');
            if (hasBrush) {
                options.push({ id: 'brush', icon: '🪮', name: '梳梳毛', desc: '心情+10', mood: 10, exp: 8 });
            } else {
                options.push({ id: 'brush', icon: '🪮', name: '梳梳毛（未解锁）', desc: '需要购买宠物梳子', disabled: true });
            }

            // 洗个澡 - 需要沐浴露（初始3份）
            const bathItem = supplies.find(s => s.id === 's2');
            if (bathItem && bathItem.count > 0) {
                options.push({ id: 'bath', icon: '🧴', name: `洗个澡 (剩余${bathItem.count}次)`, desc: '心情+20 精力-5', mood: 20, energy: -5, exp: 12 });
            } else if (bathItem) {
                options.push({ id: 'bath', icon: '🧴', name: '洗个澡（未解锁）', desc: '沐浴露用完了，去商场补货吧', disabled: true });
            } else {
                options.push({ id: 'bath', icon: '🧴', name: '洗个澡（未解锁）', desc: '需要购买沐浴露', disabled: true });
            }

            return options;
        }
    }
};

// ===== 金币生产系统 =====
let coinProductionTimer = null;
const COIN_PRODUCTION_INTERVAL = 5 * 60 * 1000; // 5分钟生产一次

// 计算宠物金币产出
function calculateCoinProduction(pet) {
    if (!pet || !pet.stats) return 0;
    // 基础产出：等级 * 2
    let baseAmount = pet.level * 2;

    // 获取技能效果
    const effects = getSkillEffects(pet);

    // 心情加成：心情越高产出越多
    const moodBonus = (pet.stats.mood / 100) * 0.5;

    // 总产出（应用技能效果）
    const totalAmount = Math.floor(baseAmount * (1 + moodBonus) * effects.coinProduction);

    return Math.max(1, totalAmount);
}

// 生产金币
function produceCoins() {
    if (!gameState.pets) return;
    Object.values(gameState.pets).forEach(pet => {
        if (!pet) return;
        if (!pet.pendingCoins) pet.pendingCoins = 0;
        try {
            pet.pendingCoins += calculateCoinProduction(pet);
        } catch(e) { console.error('produceCoins error:', e); }
    });
    Storage.save();
    updatePetUI();
}

// 手动收取金币
window.collectCoins = function() {
    const pet = getCurrentPet();
    if (!pet || !pet.pendingCoins || pet.pendingCoins <= 0) {
        showToast('💰 还没有金币可以收取哦~');
        return;
    }

    const amount = pet.pendingCoins;
    gameState.coins += amount;
    pet.pendingCoins = 0;

    Storage.save();
    updatePetUI();
    showToast(`💰 收取了${amount}金币！`);
};

// 检查是否有招财猫
function hasLuckyCat() {
    return (gameState.houseFurniture || []).some(f => f.id === 'fu7');
}

// 自动收取所有宠物金币
function autoCollectCoins() {
    if (!hasLuckyCat()) return;
    if (!gameState.pets) return;

    let totalCollected = 0;
    Object.values(gameState.pets).forEach(pet => {
        if (pet.pendingCoins && pet.pendingCoins > 0) {
            totalCollected += pet.pendingCoins;
            pet.pendingCoins = 0;
        }
    });

    if (totalCollected > 0) {
        gameState.coins += totalCollected;
        Storage.save();
        updatePetUI();
        showToast(`🐱 招财猫帮你收取了${totalCollected}金币！`);
    }
}

// ===== 游戏状态 =====
// 数据结构说明：
// - 全局互通：coins、locker、wardrobe、houseFurniture、foodStorage、achievements、dailyTasks、stats
// - 每宠独立：pets[petId] 中包含 stats、currentOutfits、外出状态、活动状态等
let gameState = {
    currentPet: null,  // 当前宠物ID
    petIdCounter: 0,

    // ===== 全局互通数据 =====
    coins: 500,  // 萌宠币初始500
    locker: {
        treasure: [],    // 宝藏（外出获得）
        supplies: [       // 宠物用具（初始3份沐浴露）
            { id: 's2', icon: '🧴', name: '沐浴露', desc: '香喷喷', price: 60, count: 3 }
        ]
    },
    wardrobe: [],       // 衣柜服饰列表（互通）
    houseFurniture: [], // 小屋家具
    foodStorage: [      // 食物库，初始5份猫粮
        { id: 'catfood', icon: '🐟', name: '猫粮', desc: '基础猫粮，营养均衡', hunger: 20, count: 5 }
    ],

    // ===== 全局进度数据 =====
    achievements: [],
    dailyTasks: [],
    lastTaskReset: null,
    dailyExp: 0,
    dailyTaskExp: 0,
    lastExpReset: null,
    loginStreak: 0,
    lastLogin: null,
    lastOnlineTime: null,  // 上次在线时间戳
    stats: {
        totalFeeds: 0, totalPets: 0, totalPlays: 0, totalCleans: 0, totalSleeps: 0,
        totalGoOuts: 0, totalTreasures: 0, totalBreeds: 0, hasSpecialBreed: false,
        totalTasksCompleted: 0, totalPurchases: 0, totalSick: 0, totalCured: 0, totalEvents: 0
    },

    // ===== 每个宠物的独立数据 =====
    // pets[petId] 结构：
    // {
    //   id, name, type,
    //   level, exp,
    //   stats: { hunger, mood, energy, affection },
    //   currentOutfits: [],      // 当前穿戴（独立）
    //   currentActivity: null,   // 当前活动
    //   lastActivityCheck: null,
    //   goOutEndTime: null,      // 外出结束时间
    //   goOutWithOwner: false,
    //   goOutDestination: null,
    //   dailyGoOutCount: 0,
    //   lastGoOutReset: null
    // }
    pets: {}
};

let currentInteraction = null;

// ===== 工具函数 =====
function getStatusText(type, value) {
    const words = STATUS_WORDS[type];
    for (let threshold = 100; threshold >= 0; threshold -= 20) {
        if (value >= threshold && words[threshold]) return words[threshold];
    }
    return words[0];
}

function getBarColor(value) {
    if (value >= 80) return 'green';
    if (value >= 60) return 'yellow';
    if (value >= 40) return 'orange';
    return 'red';
}

function getCurrentPet() {
    return gameState.pets[gameState.currentPet];
}

// 获取宠物头像（优先品种图片，其次类型图片）
function getPetImg(pet) {
    if (pet.breed && pet.breed.img) return pet.breed.img;
    return PET_TYPES[pet.type] ? PET_TYPES[pet.type].img : '';
}

// 获取宠物emoji
function getPetEmoji(type) {
    return PET_TYPES[type] ? PET_TYPES[type].emoji : '🐾';
}

// ===== 存储 =====
const Storage = {
    save() { localStorage.setItem('pixelPetGame', JSON.stringify(gameState)); },
    load() {
        const data = localStorage.getItem('pixelPetGame');
        if (data) {
            try {
                const parsed = JSON.parse(data);
                // 合并数据，确保数组字段有默认值
                gameState = { 
                    ...gameState, 
                    ...parsed,
                    // 确保数组字段存在
                    foodStorage: parsed.foodStorage || gameState.foodStorage,
                    wardrobe: parsed.wardrobe || gameState.wardrobe,
                    houseFurniture: parsed.houseFurniture || gameState.houseFurniture,
                    achievements: parsed.achievements || gameState.achievements,
                    dailyTasks: parsed.dailyTasks || gameState.dailyTasks,
                    stats: { ...gameState.stats, ...(parsed.stats || {}) }
                };
                if (!gameState.locker) gameState.locker = { treasure: [], supplies: [] };
                if (!gameState.locker.treasure) gameState.locker.treasure = [];
                if (!gameState.locker.supplies) gameState.locker.supplies = [];
                // 确保每个宠物有完整的字段
                Object.values(gameState.pets || {}).forEach(pet => {
                    if (!pet.stats) pet.stats = { hunger: 50, mood: 50, energy: 50, affection: 0 };
                    if (!pet.skills) pet.skills = [];
                    if (!pet.currentOutfits) pet.currentOutfits = [];
                    if (!pet.children) pet.children = [];
                    if (!pet.goOutEndTime) pet.goOutEndTime = null;
                    if (!pet.dailyGoOutCount) pet.dailyGoOutCount = 0;
                    if (!pet.pendingCoins) pet.pendingCoins = 0;
                    if (!pet.expToNext) pet.expToNext = 50;
                });
                return true;
            } catch(e) {
                console.error('Storage.load parse error:', e);
                return false;
            }
        }
        return false;
    }
};

// ===== 剧情文本 =====
const STORY_TEXTS = [
    "在一个阳光明媚的下午，你和爱人走在回家的路上...",
    "路过街角时，你听到一阵细微的叫声从草丛中传来",
    "拨开枝叶，你发现了几只毛茸茸的小家伙正眨着眼睛看着你",
    "它们看起来又饿又累，似乎是被遗弃在这里",
    "你蹲下身，轻轻伸出手...",
    "小家伙们犹豫了一下，然后慢慢靠近你",
    "那一刻，你决定给它们一个温暖的家"
];

let currentStoryIndex = 0;
let storyClickListener = null;

// ===== 剧情引导 =====
function initStory() {
    const storyBox = document.getElementById('story-box');
    const storyText = document.getElementById('story-text');

    // 重置索引
    currentStoryIndex = 0;

    // 显示故事界面
    document.getElementById('story-screen').classList.add('active');

    // 移除旧的监听器，避免重复绑定
    if (storyClickListener) {
        storyBox.removeEventListener('click', storyClickListener);
    }

    // 显示第一段
    storyText.textContent = STORY_TEXTS[0];

    // 点击切换
    storyClickListener = function() {
        currentStoryIndex++;
        if (currentStoryIndex < STORY_TEXTS.length) {
            // 淡出效果
            storyText.style.opacity = '0';
            setTimeout(() => {
                storyText.textContent = STORY_TEXTS[currentStoryIndex];
                storyText.style.opacity = '1';
            }, 200);
        } else {
            // 剧情结束，显示过渡页
            document.getElementById('story-screen').classList.remove('active');
            document.getElementById('transition-screen').classList.add('active');
        }
    };
    storyBox.addEventListener('click', storyClickListener);
}

// 显示宠物选择界面
window.showPetSelection = function() {
    document.getElementById('transition-screen').classList.remove('active');
    document.getElementById('start-screen').classList.add('active');
};

// ===== 初始化 =====
function init() {
    console.log('init() called');
    
    // 事件绑定只执行一次
    if (!window._petGameInitialized) {
        console.log('init - binding events');
        window._petGameInitialized = true;
        
        // 事件绑定
        function bindEvent(id, event, handler) {
            const el = document.getElementById(id);
            if (el) el.addEventListener(event, handler);
        }

        // 宠物选择（限定在pet-container内）
        document.querySelectorAll('.pet-container .pet-card').forEach(card => {
            card.addEventListener('click', () => selectPet(card.dataset.pet));
        });

        bindEvent('start-btn', 'click', startGame);
        bindEvent('tasks-toggle', 'click', toggleTasks);
        bindEvent('status-toggle', 'click', toggleStatus);
        bindEvent('activity-btn', 'click', showActivityModal);
        bindEvent('go-out-btn', 'click', goOut);
        bindEvent('locker-btn', 'click', showLocker);
        bindEvent('house-btn', 'click', showHouse);
        bindEvent('shop-btn', 'click', showShop);
        bindEvent('wardrobe-btn', 'click', showWardrobe);
        bindEvent('pet-sprite', 'click', () => { const pet = getCurrentPet(); if (pet) randomSpeak(); });
        bindEvent('music-toggle', 'click', toggleMusic);
        bindEvent('switch-pet-btn', 'click', showSwitchPetModal);
        bindEvent('achievements-btn', 'click', showAchievements);
        bindEvent('pet-settings-btn', 'click', showSettings);

        // 互动按钮（限定在pet-container内）
        document.querySelectorAll('.pet-container .action-btn').forEach(btn => {
            btn.addEventListener('click', () => showInteractionModal(btn.dataset.action));
        });
    }
    
    // 首次初始化：加载数据、显示界面、启动定时器
    if (!window._petGameFirstInit) {
        window._petGameFirstInit = true;
        console.log('init - first init, loading data');
        try {
            const loaded = Storage.load();
            console.log('init - Storage.load result:', loaded, 'currentPet:', gameState.currentPet);
            
            if (loaded && gameState.currentPet) {
                checkDailyReset();
                showGameScreen();
                updatePetUI();
            } else {
                checkDailyReset();
                initStory();
            }
        } catch (e) {
            console.error('Pet init load error:', e);
            try { showGameScreen(); updatePetUI(); } catch(e2) {}
        }
    } else {
        // 后续调用：只刷新UI数据，不重新显示界面、不启动定时器
        console.log('init - subsequent call, only refreshing UI');
        try {
            const pet = getCurrentPet();
            if (pet) {
                updatePetUI();
            }
        } catch (e) {
            console.error('Pet UI refresh error:', e);
        }
    }
}

function checkDailyReset() {
    const today = new Date().toDateString();
    if (gameState.lastTaskReset !== today) {
        gameState.dailyTasks = generateDailyTasks();
        gameState.lastTaskReset = today;
        gameState.dailyExp = 0;
        Storage.save();
    }
}

// ===== 任务折叠 =====
function toggleTasks() {
    const toggle = document.getElementById('tasks-toggle');
    const content = document.getElementById('task-list');
    toggle.classList.toggle('collapsed');
    content.classList.toggle('collapsed');
}

function toggleStatus() {
    const toggle = document.getElementById('status-toggle');
    const content = document.getElementById('status-content');
    toggle.classList.toggle('collapsed');
    content.classList.toggle('collapsed');
}

// ===== 正在做什么和随机说话 =====
// ===== 宠物活动（按种类）=====
const PET_ACTIVITIES = {
    cat: ['正在舔毛梳洗~', '趴在窗台晒太阳', '追着尾巴转圈圈', '在纸箱里打盹', '盯着飞虫发呆', '伸懒腰打哈欠', '用爪子洗脸', '在键盘上踩来踩去','打翻了水杯','开心地咕噜咕噜'],
    dog: ['趴在门口等主人', '追着球跑来跑去', '摇着尾巴发呆', '在窝里打呼噜', '啃着骨头', '对着空气汪汪叫', '用爪子刨地', '在草地上打滚','呲牙','露出肚皮','歪头看着你'],
    rabbit: ['嚼着胡萝卜', '在窝里蹦蹦跳跳', '竖着耳朵听声音', '用爪子洗脸', '缩成一团休息', '啃着干草', '在角落里发呆', '鼻子一耸一耸的','收集筑巢材料','绕圈并发出咕噜声'],
    fox: ['在树林里溜达', '盯着远处的动静', '在雪地里刨坑', '甩着尾巴发呆', '眯着眼打盹', '悄悄地潜行', '在岩石上晒太阳', '耳朵转来转去','竖起耳朵'],
    hamster: ['在跑轮上狂奔', '腮帮子塞满食物', '在木屑里打洞', '抱着瓜子啃', '缩成一团睡觉', '用爪子洗脸', '在笼子里探险', '把食物藏起来','磨牙','企图越狱'],
    bird: ['在枝头唱歌', '梳理羽毛', '啄着亮闪闪的东西', '扑腾翅膀', '歪着头看你', '在窝里咕咕叫', '飞来飞去', '用喙敲敲桌子','盯着草地','摆动尾羽']
};

// ===== 宠物对话系统（按种类 + 性格）=====
const PET_DIALOGUES = {
    // 猫
    cat: {
        // 傲娇
        傲娇: {
            normal: ['哼，才不是特意来找你的呢', '喵...别摸那里！', '勉强陪你玩一下吧', '我只是路过而已', '才不想你呢，喵'],
            feed: ['这还差不多...喵', '哼，算你识相', '勉为其难地吃吧', '看在食物的份上...', '下次要更好吃的！'],
            pet: ['别、别碰我！...呼噜呼噜', '哼，就一下哦', '谁允许你摸我的？', '...还、还挺舒服的', '别停...我是说，随便你啦'],
            play: ['哼，陪你玩玩吧', '别得意忘形了！', '我、我才不兴奋呢', '勉强承认你很有趣', '下次要更好玩的！'],
            sleep: ['哼...才不想睡', 'ZZZ...别吵', '勉强睡', '才不是因为困', '...呼噜...'],
            clean: ['哼...还行', '勉强让你洗', '别弄湿我的毛', '...还挺干净', '下次换沐浴露'],
            sleep: ['哼...才不想睡', 'ZZZ...别吵', '勉强睡', '才不是因为困', '...呼噜...'],
            clean: ['哼...还行', '勉强让你洗', '别弄湿我的毛', '...还挺干净', '下次换沐浴露'],
            sleep: ['哼...才不想睡', 'ZZZ...别吵', '勉强睡', '才不是因为困', '...呼噜...'],
            clean: ['哼...还行', '勉强让你洗', '别弄湿我的毛', '...还挺干净', '下次换沐浴露'],
            sleep: ['哼...才不想睡呢...', 'ZZZ...别吵我...', '勉强睡一下...', '才不是因为困...', '...呼噜...'],
            clean: ['哼...还算舒服...', '勉强让你洗...', '别弄湿我的毛！', '...还、还挺干净的', '下次要更好闻的沐浴露！'],
            feed_full: ['哼...不饿啦', '才不想吃呢', '放着吧...', '吃太饱了...', '勉强闻一下'],
            feed_normal: ['哼...还行吧', '勉为其难吃一点', '看在食物份上...', '也就那样吧', '还算可以'],
            feed_hungry: ['终于知道喂我了！', '饿死我了...', '算你有良心', '快给我吃的！', '等好久了...'],
            sleep_energetic: ['哼...才不想睡呢', '精神好着呢', '不想睡...', '还早呢...', '勉强躺一下...'],
            sleep_normal: ['有点困了...', '勉强睡一下吧', '哼...睡就睡', '别吵我...', 'ZZZ...'],
            sleep_tired: ['终于知道让我睡了...', '累死了...', '别吵我...', '要睡很久...', '哼...好困...'],
            pet_happy: ['哼...还行吧', '就...就这样吧', '别停...', '勉为其难让你摸', '...呼噜...'],
            pet_normal: ['哼...', '随便你啦', '就一下哦', '别摸太久...', '...还行...'],
            pet_sad: ['...不想被摸', '别碰我...', '没心情...', '...走开', '让我静静...'],
            play_excited: ['哼...才没有兴奋呢', '也就一般般啦', '别得意忘形！', '勉强陪你玩', '我、我才不激动呢'],
            play_normal: ['随便玩玩吧', '还行吧...', '就这样？', '勉为其难', '哼...'],
            play_tired: ['累了...不玩了', '没力气了...', '你自己玩吧', '...要休息', '玩不动了...'],
            clean_willing: ['哼...还算舒服', '勉强配合你', '...还行吧', '轻一点...', '快一点...'],
            clean_unwilling: ['不想洗...', '别碰我！', '...好可怕', '轻一点啦！', '...讨厌...']
        },
        // 温顺
        温顺: {
            normal: ['主人~好想你呀', '喵~要抱抱', '最喜欢主人了', '可以摸摸我吗？', '主人去哪里了呀'],
            feed: ['谢谢主人~喵', '好好吃~最喜欢主人了', '主人最好了~', '喵呜~好幸福', '每一口都是爱的味道'],
            pet: ['呼噜呼噜~好舒服', '主人的手好温暖', '再多摸一摸嘛', '最喜欢被主人摸了', '喵~好幸福呀'],
            play: ['喵！好开心！', '主人陪我玩~', '最喜欢和主人玩了', '玩多久都可以哦', '主人最棒了！'],
            sleep: ['晚安主人~', '好舒服的床~', '梦里见~', '呼噜呼噜...', '好安心...'],
            clean: ['谢谢主人~', '变得好香~', '好舒服~', '最喜欢洗澡了~', '干干净净~'],
            feed_full: ['谢谢主人~但我不饿', '已经吃得很饱了~', '想留给下次吃~', '主人真好~', '好幸福~'],
            feed_normal: ['谢谢主人~', '好好吃~', '最喜欢主人了~', '啾啾~', '好美味~'],
            feed_hungry: ['太好吃了！', '谢谢主人！', '饿坏了...', '好幸福！', '还想吃！'],
            sleep_energetic: ['还想和主人玩呢~', '不困呢~', '精神很好~', '再陪陪我嘛~', '不想睡呢~'],
            sleep_normal: ['有点困了~', '晚安主人~', '想睡觉了~', '好舒服~', '要睡了~'],
            sleep_tired: ['好困好困...', '终于能睡了...', '晚安...', '好累...', '要睡很久...'],
            pet_happy: ['舒服~', '最喜欢主人了~', '好幸福~', '再多摸摸~', '啾啾~'],
            pet_normal: ['好舒服~', '谢谢主人~', '啾啾~', '喜欢~', '温暖~'],
            pet_sad: ['...谢谢主人', '好温柔...', '感觉好多了...', '...喜欢', '...被关心'],
            play_excited: ['好开心！', '最喜欢和主人玩了！', '玩不够！', '太棒了！', '耶！'],
            play_normal: ['好玩~', '谢谢主人陪我~', '开心~', '喜欢~', '啾啾~'],
            play_tired: ['累了...', '想休息了...', '玩不动了...', '好困...', '下次再玩...'],
            clean_willing: ['谢谢主人~', '好舒服~', '变得好香~', '喜欢洗澡~', '干净~'],
            clean_unwilling: ['...有点怕', '轻一点...', '...好', '谢谢主人...', '...乖'],
            feed_full: ['谢谢主人~但我不饿', '已经吃得很饱了~', '想留给下次吃~', '主人真好~', '好幸福~'],
            feed_normal: ['谢谢主人~', '好好吃~', '最喜欢主人了~', '吱~', '好美味~'],
            feed_hungry: ['太好吃了！', '谢谢主人！', '饿坏了...', '好幸福！', '还想吃！'],
            sleep_energetic: ['还想和主人玩呢~', '不困呢~', '精神很好~', '再陪陪我嘛~', '不想睡呢~'],
            sleep_normal: ['有点困了~', '晚安主人~', '想睡觉了~', '好舒服~', '要睡了~'],
            sleep_tired: ['好困好困...', '终于能睡了...', '晚安...', '好累...', '要睡很久...'],
            pet_happy: ['舒服~', '最喜欢主人了~', '好幸福~', '再多摸摸~', '吱~'],
            pet_normal: ['好舒服~', '谢谢主人~', '吱~', '喜欢~', '温暖~'],
            pet_sad: ['...谢谢主人', '好温柔...', '感觉好多了...', '...喜欢', '...被关心'],
            play_excited: ['好开心！', '最喜欢和主人玩了！', '玩不够！', '太棒了！', '耶！'],
            play_normal: ['好玩~', '谢谢主人陪我~', '开心~', '喜欢~', '吱~'],
            play_tired: ['累了...', '想休息了...', '玩不动了...', '好困...', '下次再玩...'],
            clean_willing: ['谢谢主人~', '好舒服~', '变得好香~', '喜欢洗澡~', '干净~'],
            clean_unwilling: ['...有点怕', '轻一点...', '...好', '谢谢主人...', '...乖'],
            feed_full: ['谢谢主人~但我不饿', '已经吃得很饱了~', '想留给下次吃~', '主人真好~', '好幸福~'],
            feed_normal: ['谢谢主人~', '好好吃~', '最喜欢主人了~', '啾啾~', '好美味~'],
            feed_hungry: ['太好吃了！', '谢谢主人！', '饿坏了...', '好幸福！', '还想吃！'],
            sleep_energetic: ['还想和主人玩呢~', '不困呢~', '精神很好~', '再陪陪我嘛~', '不想睡呢~'],
            sleep_normal: ['有点困了~', '晚安主人~', '想睡觉了~', '好舒服~', '要睡了~'],
            sleep_tired: ['好困好困...', '终于能睡了...', '晚安...', '好累...', '要睡很久...'],
            pet_happy: ['舒服~', '最喜欢主人了~', '好幸福~', '再多摸摸~', '啾啾~'],
            pet_normal: ['好舒服~', '谢谢主人~', '啾啾~', '喜欢~', '温暖~'],
            pet_sad: ['...谢谢主人', '好温柔...', '感觉好多了...', '...喜欢', '...被关心'],
            play_excited: ['好开心！', '最喜欢和主人玩了！', '玩不够！', '太棒了！', '耶！'],
            play_normal: ['好玩~', '谢谢主人陪我~', '开心~', '喜欢~', '啾啾~'],
            play_tired: ['累了...', '想休息了...', '玩不动了...', '好困...', '下次再玩...'],
            clean_willing: ['谢谢主人~', '好舒服~', '变得好香~', '喜欢洗澡~', '干净~'],
            clean_unwilling: ['...有点怕', '轻一点...', '...好', '谢谢主人...', '...乖'],
            feed_full: ['谢谢主人~但我不饿', '已经吃得很饱了~', '想留给下次吃~', '主人真好~', '好幸福~'],
            feed_normal: ['谢谢主人~', '好好吃~', '最喜欢主人了~', '吱~', '好美味~'],
            feed_hungry: ['太好吃了！', '谢谢主人！', '饿坏了...', '好幸福！', '还想吃！'],
            sleep_energetic: ['还想和主人玩呢~', '不困呢~', '精神很好~', '再陪陪我嘛~', '不想睡呢~'],
            sleep_normal: ['有点困了~', '晚安主人~', '想睡觉了~', '好舒服~', '要睡了~'],
            sleep_tired: ['好困好困...', '终于能睡了...', '晚安...', '好累...', '要睡很久...'],
            pet_happy: ['舒服~', '最喜欢主人了~', '好幸福~', '再多摸摸~', '吱~'],
            pet_normal: ['好舒服~', '谢谢主人~', '吱~', '喜欢~', '温暖~'],
            pet_sad: ['...谢谢主人', '好温柔...', '感觉好多了...', '...喜欢', '...被关心'],
            play_excited: ['好开心！', '最喜欢和主人玩了！', '玩不够！', '太棒了！', '耶！'],
            play_normal: ['好玩~', '谢谢主人陪我~', '开心~', '喜欢~', '吱~'],
            play_tired: ['累了...', '想休息了...', '玩不动了...', '好困...', '下次再玩...'],
            clean_willing: ['谢谢主人~', '好舒服~', '变得好香~', '喜欢洗澡~', '干净~'],
            clean_unwilling: ['...有点怕', '轻一点...', '...好', '谢谢主人...', '...乖'],
            feed_full: ['谢谢主人~但我不饿', '已经吃得很饱了~', '想留给下次吃~', '主人真好~', '好幸福~'],
            feed_normal: ['谢谢主人~', '好好吃~', '最喜欢主人了~', '啾啾~', '好美味~'],
            feed_hungry: ['太好吃了！', '谢谢主人！', '饿坏了...', '好幸福！', '还想吃！'],
            sleep_energetic: ['还想和主人玩呢~', '不困呢~', '精神很好~', '再陪陪我嘛~', '不想睡呢~'],
            sleep_normal: ['有点困了~', '晚安主人~', '想睡觉了~', '好舒服~', '要睡了~'],
            sleep_tired: ['好困好困...', '终于能睡了...', '晚安...', '好累...', '要睡很久...'],
            pet_happy: ['舒服~', '最喜欢主人了~', '好幸福~', '再多摸摸~', '啾啾~'],
            pet_normal: ['好舒服~', '谢谢主人~', '啾啾~', '喜欢~', '温暖~'],
            pet_sad: ['...谢谢主人', '好温柔...', '感觉好多了...', '...喜欢', '...被关心'],
            play_excited: ['好开心！', '最喜欢和主人玩了！', '玩不够！', '太棒了！', '耶！'],
            play_normal: ['好玩~', '谢谢主人陪我~', '开心~', '喜欢~', '啾啾~'],
            play_tired: ['累了...', '想休息了...', '玩不动了...', '好困...', '下次再玩...'],
            clean_willing: ['谢谢主人~', '好舒服~', '变得好香~', '喜欢洗澡~', '干净~'],
            clean_unwilling: ['...有点怕', '轻一点...', '...好', '谢谢主人...', '...乖'],
            feed_full: ['谢谢主人~但我不饿', '已经吃得很饱了~', '想留给下次吃~', '主人真好~', '好幸福~'],
            feed_normal: ['谢谢主人~', '好好吃~', '最喜欢主人了~', '吱~', '好美味~'],
            feed_hungry: ['太好吃了！', '谢谢主人！', '饿坏了...', '好幸福！', '还想吃！'],
            sleep_energetic: ['还想和主人玩呢~', '不困呢~', '精神很好~', '再陪陪我嘛~', '不想睡呢~'],
            sleep_normal: ['有点困了~', '晚安主人~', '想睡觉了~', '好舒服~', '要睡了~'],
            sleep_tired: ['好困好困...', '终于能睡了...', '晚安...', '好累...', '要睡很久...'],
            pet_happy: ['舒服~', '最喜欢主人了~', '好幸福~', '再多摸摸~', '吱~'],
            pet_normal: ['好舒服~', '谢谢主人~', '吱~', '喜欢~', '温暖~'],
            pet_sad: ['...谢谢主人', '好温柔...', '感觉好多了...', '...喜欢', '...被关心'],
            play_excited: ['好开心！', '最喜欢和主人玩了！', '玩不够！', '太棒了！', '耶！'],
            play_normal: ['好玩~', '谢谢主人陪我~', '开心~', '喜欢~', '吱~'],
            play_tired: ['累了...', '想休息了...', '玩不动了...', '好困...', '下次再玩...'],
            clean_willing: ['谢谢主人~', '好舒服~', '变得好香~', '喜欢洗澡~', '干净~'],
            clean_unwilling: ['...有点怕', '轻一点...', '...好', '谢谢主人...', '...乖'],
            feed_full: ['谢谢主人~但我不饿呢', '已经吃得很饱了~', '想留给下次吃~', '主人真好~', '好幸福~'],
            feed_normal: ['谢谢主人~', '好好吃~', '最喜欢主人了~', '喵呜~', '好美味~'],
            feed_hungry: ['太好吃了！', '谢谢主人！', '饿坏了...', '好幸福！', '还想吃！'],
            sleep_energetic: ['还想和主人玩呢~', '不困呢~', '精神很好~', '再陪陪我嘛~', '不想睡呢~'],
            sleep_normal: ['有点困了~', '晚安主人~', '想睡觉了~', '好舒服~', '要睡了~'],
            sleep_tired: ['好困好困...', '终于能睡了...', '晚安...', '好累...', '要睡很久...'],
            pet_happy: ['呼噜呼噜~', '好舒服~', '最喜欢主人了~', '好幸福~', '再多摸摸~'],
            pet_normal: ['好舒服~', '谢谢主人~', '喵~', '喜欢~', '温暖~'],
            pet_sad: ['...谢谢主人', '好温柔...', '感觉好多了...', '...喜欢', '...被关心'],
            play_excited: ['好开心！', '最喜欢和主人玩了！', '玩不够！', '太棒了！', '耶！'],
            play_normal: ['好玩~', '谢谢主人陪我~', '开心~', '喜欢~', '喵~'],
            play_tired: ['累了...', '想休息了...', '玩不动了...', '好困...', '下次再玩...'],
            clean_willing: ['谢谢主人~', '好舒服~', '变得好香~', '喜欢洗澡~', '干净~'],
            clean_unwilling: ['...有点怕', '轻一点...', '...好', '谢谢主人...', '...乖']
        },
        // 活泼
        活泼: {
            normal: ['喵！来玩吧！', '那边有什么？', '追追追！', '跳来跳去真开心', '主人快看我！'],
            feed: ['哇！好吃的！', '吃吃吃！', '再来一份！', '这个好好吃！', '吃完继续玩！'],
            pet: ['蹭来蹭去~', '转圈圈~', '跳上来！', '摸摸摸！', '好兴奋呀！'],
            play: ['耶！玩球！', '追追追！', '我抓到啦！', '再来一次！', '玩不够！'],
            sleep: ['明天还要玩！', '睡饱饱继续嗨！', '梦里也在跑！', 'ZZZ...冲啊！', '好梦~'],
            clean: ['水花四溅！', '洗澡也好玩！', '甩甩毛！', '泡泡好好玩！', '香喷喷！'],
            feed_full: ['还能再吃！', '肚子还有空位！', '再来一口嘛！', '不饱不饱！', '想吃想吃！'],
            feed_normal: ['好吃好吃！', '吃完继续玩！', '啾啾！', '美味！', '能量补充！'],
            feed_hungry: ['狼吞虎咽！', '太好吃了！', '饿坏了饿坏了！', '还要还要！', '好吃到飞起！'],
            sleep_energetic: ['不想睡！还要玩！', '精神百倍！', '睡不着！', '再玩一会儿！', '活力满满！'],
            sleep_normal: ['有点困了...', '睡一会儿继续嗨！', 'ZZZ...明天玩...', '先睡为敬！', '充电中...'],
            sleep_tired: ['终于能睡了...', '累趴了...', '呼呼...', '玩不动了...', '需要充电...'],
            pet_happy: ['好兴奋！', '转圈圈！', '飞高高！', '最喜欢了！', '好开心！'],
            pet_normal: ['蹭蹭~', '开心~', '啾啾！', '好玩~', '兴奋~'],
            pet_sad: ['...好一点了', '谢谢主人...', '...开心一点了', '啾啾...', '...好点了'],
            play_excited: ['太棒了！', '玩不够！', '最开心了！', '啾啾啾！', '超级好玩！'],
            play_normal: ['好玩！', '开心！', '继续！', '啾啾！', '兴奋！'],
            play_tired: ['累了...', '飞不动了...', '歇一会儿...', '呼...呼...', '没电了...'],
            clean_willing: ['洗澡也好玩！', '水花四溅！', '泡泡攻击！', '甩甩毛！', '香喷喷！'],
            clean_unwilling: ['不想洗...', '还要玩...', '...好吧', '快点结束！', '...勉强'],
            feed_full: ['还能再吃！', '肚子还有空位！', '再来一口嘛！', '不饱不饱！', '想吃想吃！'],
            feed_normal: ['好吃好吃！', '吃完继续玩！', '吱！', '美味！', '能量补充！'],
            feed_hungry: ['狼吞虎咽！', '太好吃了！', '饿坏了饿坏了！', '还要还要！', '好吃到飞起！'],
            sleep_energetic: ['不想睡！还要玩！', '精神百倍！', '睡不着！', '再玩一会儿！', '活力满满！'],
            sleep_normal: ['有点困了...', '睡一会儿继续嗨！', 'ZZZ...明天玩...', '先睡为敬！', '充电中...'],
            sleep_tired: ['终于能睡了...', '累趴了...', '呼呼...', '玩不动了...', '需要充电...'],
            pet_happy: ['好兴奋！', '转圈圈！', '跳高高！', '最喜欢了！', '好开心！'],
            pet_normal: ['蹭蹭~', '开心~', '吱！', '好玩~', '兴奋~'],
            pet_sad: ['...好一点了', '谢谢主人...', '...开心一点了', '吱...', '...好点了'],
            play_excited: ['太棒了！', '玩不够！', '最开心了！', '吱吱吱！', '超级好玩！'],
            play_normal: ['好玩！', '开心！', '继续！', '吱！', '兴奋！'],
            play_tired: ['累了...', '跑不动了...', '歇一会儿...', '呼...呼...', '没电了...'],
            clean_willing: ['洗澡也好玩！', '水花四溅！', '泡泡攻击！', '甩甩毛！', '香喷喷！'],
            clean_unwilling: ['不想洗...', '还要玩...', '...好吧', '快点结束！', '...勉强'],
            feed_full: ['还能再吃！', '肚子还有空位！', '再来一口嘛！', '不饱不饱！', '想吃想吃！'],
            feed_normal: ['好吃好吃！', '吃完继续玩！', '啾啾！', '美味！', '能量补充！'],
            feed_hungry: ['狼吞虎咽！', '太好吃了！', '饿坏了饿坏了！', '还要还要！', '好吃到飞起！'],
            sleep_energetic: ['不想睡！还要玩！', '精神百倍！', '睡不着！', '再玩一会儿！', '活力满满！'],
            sleep_normal: ['有点困了...', '睡一会儿继续嗨！', 'ZZZ...明天玩...', '先睡为敬！', '充电中...'],
            sleep_tired: ['终于能睡了...', '累趴了...', '呼呼...', '玩不动了...', '需要充电...'],
            pet_happy: ['好兴奋！', '转圈圈！', '飞高高！', '最喜欢了！', '好开心！'],
            pet_normal: ['蹭蹭~', '开心~', '啾啾！', '好玩~', '兴奋~'],
            pet_sad: ['...好一点了', '谢谢主人...', '...开心一点了', '啾啾...', '...好点了'],
            play_excited: ['太棒了！', '玩不够！', '最开心了！', '啾啾啾！', '超级好玩！'],
            play_normal: ['好玩！', '开心！', '继续！', '啾啾！', '兴奋！'],
            play_tired: ['累了...', '飞不动了...', '歇一会儿...', '呼...呼...', '没电了...'],
            clean_willing: ['洗澡也好玩！', '水花四溅！', '泡泡攻击！', '甩甩毛！', '香喷喷！'],
            clean_unwilling: ['不想洗...', '还要玩...', '...好吧', '快点结束！', '...勉强'],
            feed_full: ['还能再吃！', '肚子还有空位！', '再来一口嘛！', '不饱不饱！', '想吃想吃！'],
            feed_normal: ['好吃好吃！', '吃完继续玩！', '吱！', '美味！', '能量补充！'],
            feed_hungry: ['狼吞虎咽！', '太好吃了！', '饿坏了饿坏了！', '还要还要！', '好吃到飞起！'],
            sleep_energetic: ['不想睡！还要玩！', '精神百倍！', '睡不着！', '再玩一会儿！', '活力满满！'],
            sleep_normal: ['有点困了...', '睡一会儿继续嗨！', 'ZZZ...明天玩...', '先睡为敬！', '充电中...'],
            sleep_tired: ['终于能睡了...', '累趴了...', '呼呼...', '玩不动了...', '需要充电...'],
            pet_happy: ['好兴奋！', '转圈圈！', '跳高高！', '最喜欢了！', '好开心！'],
            pet_normal: ['蹭蹭~', '开心~', '吱！', '好玩~', '兴奋~'],
            pet_sad: ['...好一点了', '谢谢主人...', '...开心一点了', '吱...', '...好点了'],
            play_excited: ['太棒了！', '玩不够！', '最开心了！', '吱吱吱！', '超级好玩！'],
            play_normal: ['好玩！', '开心！', '继续！', '吱！', '兴奋！'],
            play_tired: ['累了...', '跑不动了...', '歇一会儿...', '呼...呼...', '没电了...'],
            clean_willing: ['洗澡也好玩！', '水花四溅！', '泡泡攻击！', '甩甩毛！', '香喷喷！'],
            clean_unwilling: ['不想洗...', '还要玩...', '...好吧', '快点结束！', '...勉强'],
            feed_full: ['还能再吃！', '肚子还有空位！', '再来一口嘛！', '不饱不饱！', '想吃想吃！'],
            feed_normal: ['好吃好吃！', '吃完继续玩！', '啾啾！', '美味！', '能量补充！'],
            feed_hungry: ['狼吞虎咽！', '太好吃了！', '饿坏了饿坏了！', '还要还要！', '好吃到飞起！'],
            sleep_energetic: ['不想睡！还要玩！', '精神百倍！', '睡不着！', '再玩一会儿！', '活力满满！'],
            sleep_normal: ['有点困了...', '睡一会儿继续嗨！', 'ZZZ...明天玩...', '先睡为敬！', '充电中...'],
            sleep_tired: ['终于能睡了...', '累趴了...', '呼呼...', '玩不动了...', '需要充电...'],
            pet_happy: ['好兴奋！', '转圈圈！', '飞高高！', '最喜欢了！', '好开心！'],
            pet_normal: ['蹭蹭~', '开心~', '啾啾！', '好玩~', '兴奋~'],
            pet_sad: ['...好一点了', '谢谢主人...', '...开心一点了', '啾啾...', '...好点了'],
            play_excited: ['太棒了！', '玩不够！', '最开心了！', '啾啾啾！', '超级好玩！'],
            play_normal: ['好玩！', '开心！', '继续！', '啾啾！', '兴奋！'],
            play_tired: ['累了...', '飞不动了...', '歇一会儿...', '呼...呼...', '没电了...'],
            clean_willing: ['洗澡也好玩！', '水花四溅！', '泡泡攻击！', '甩甩毛！', '香喷喷！'],
            clean_unwilling: ['不想洗...', '还要玩...', '...好吧', '快点结束！', '...勉强'],
            feed_full: ['还能再吃！', '肚子还有空位！', '再来一口嘛！', '不饱不饱！', '想吃想吃！'],
            feed_normal: ['好吃好吃！', '吃完继续玩！', '吱！', '美味！', '能量补充！'],
            feed_hungry: ['狼吞虎咽！', '太好吃了！', '饿坏了饿坏了！', '还要还要！', '好吃到飞起！'],
            sleep_energetic: ['不想睡！还要玩！', '精神百倍！', '睡不着！', '再玩一会儿！', '活力满满！'],
            sleep_normal: ['有点困了...', '睡一会儿继续嗨！', 'ZZZ...明天玩...', '先睡为敬！', '充电中...'],
            sleep_tired: ['终于能睡了...', '累趴了...', '呼呼...', '玩不动了...', '需要充电...'],
            pet_happy: ['好兴奋！', '转圈圈！', '跳高高！', '最喜欢了！', '好开心！'],
            pet_normal: ['蹭蹭~', '开心~', '吱！', '好玩~', '兴奋~'],
            pet_sad: ['...好一点了', '谢谢主人...', '...开心一点了', '吱...', '...好点了'],
            play_excited: ['太棒了！', '玩不够！', '最开心了！', '吱吱吱！', '超级好玩！'],
            play_normal: ['好玩！', '开心！', '继续！', '吱！', '兴奋！'],
            play_tired: ['累了...', '跑不动了...', '歇一会儿...', '呼...呼...', '没电了...'],
            clean_willing: ['洗澡也好玩！', '水花四溅！', '泡泡攻击！', '甩甩毛！', '香喷喷！'],
            clean_unwilling: ['不想洗...', '还要玩...', '...好吧', '快点结束！', '...勉强'],
            feed_full: ['还能再吃！', '肚子还有空位！', '再来一口嘛！', '不饱不饱！', '想吃想吃！'],
            feed_normal: ['好吃好吃！', '吃完继续玩！', '耶！', '美味！', '能量补充！'],
            feed_hungry: ['狼吞虎咽！', '太好吃了！', '饿坏了饿坏了！', '还要还要！', '好吃到飞起！'],
            sleep_energetic: ['不想睡！还要玩！', '精神百倍！', '睡不着！', '再玩一会儿！', '活力满满！'],
            sleep_normal: ['有点困了...', '睡一会儿继续嗨！', 'ZZZ...明天玩...', '先睡为敬！', '充电中...'],
            sleep_tired: ['终于能睡了...', '累趴了...', '呼呼...', '玩不动了...', '需要充电...'],
            pet_happy: ['好兴奋！', '转圈圈！', '跳高高！', '最喜欢了！', '好开心！'],
            pet_normal: ['蹭蹭~', '开心~', '喵！', '好玩~', '兴奋~'],
            pet_sad: ['...好一点了', '谢谢主人...', '...开心一点了', '喵...', '...好点了'],
            play_excited: ['太棒了！', '玩不够！', '最开心了！', '耶耶耶！', '超级好玩！'],
            play_normal: ['好玩！', '开心！', '继续！', '喵！', '兴奋！'],
            play_tired: ['累了...', '跑不动了...', '歇一会儿...', '呼...呼...', '没电了...'],
            clean_willing: ['洗澡也好玩！', '水花四溅！', '泡泡攻击！', '甩甩毛！', '香喷喷！'],
            clean_unwilling: ['不想洗...', '还要玩...', '...好吧', '快点结束！', '...勉强']
        },
        // 慵懒
        慵懒: {
            normal: ['好困啊...喵', '再睡一会儿...', '不想动...', '阳光好舒服...', 'ZZZ...'],
            feed: ['嗯...好吃...', '吃完再睡...', '放那儿吧...', '嚼嚼...好困...', '谢谢...ZZZ'],
            pet: ['呼噜...舒服...', '继续...别停...', '好困但好舒服...', 'ZZZ...呼噜...', '嗯...再摸会儿...'],
            play: ['好累...', '不想动...', '你自己玩吧...', '我躺着看...', '玩完我要睡觉...'],
            sleep: ['终于能睡了...', '床好软...', '不要叫醒我...', '睡到天荒地老...', '呼噜呼噜...'],
            clean: ['好麻烦...', '洗完能睡吗...', '嗯...还行...', '快结束吧...', 'ZZZ...'],
            feed_full: ['吃不下了...', '好饱...', '想睡觉...', 'ZZZ...', '放那儿吧...'],
            feed_normal: ['嗯...吃...', '还行...', '嚼嚼...', '谢谢...', '...'],
            feed_hungry: ['终于...', '饿死了...', '好吃...', '还要...', '谢谢...'],
            sleep_energetic: ['不想睡...才怪', '还是困...', '再躺会儿...', 'ZZZ...', '动不了...'],
            sleep_normal: ['该睡了...', '好困...', '晚安...', '呼噜...', '睡觉...'],
            sleep_tired: ['终于...', '累死了...', '要睡很久...', '别吵我...', 'ZZZ...'],
            pet_happy: ['呼噜...', '好舒服...', '别停...', 'ZZZ...', '嗯...'],
            pet_normal: ['嗯...', '还行...', '继续...', '呼噜...', '...'],
            pet_sad: ['...', '没心情...', 'ZZZ...', '...', '想睡觉...'],
            play_excited: ['还行吧...', '有点累...', '随便...', '...', '想睡觉...'],
            play_normal: ['累...', '不想飞...', '你玩...', '...', 'ZZZ...'],
            play_tired: ['不玩...', '累...', '睡觉...', '...', '动不了...'],
            clean_willing: ['嗯...还行...', '快结束...', 'ZZZ...', '...', '随便...'],
            clean_unwilling: ['不想动...', '好麻烦...', '...', 'ZZZ...', '别碰我...'],
            feed_full: ['吃不下了...', '好饱...', '想睡觉...', 'ZZZ...', '放那儿吧...'],
            feed_normal: ['嗯...吃...', '还行...', '嚼嚼...', '谢谢...', '...'],
            feed_hungry: ['终于...', '饿死了...', '好吃...', '还要...', '谢谢...'],
            sleep_energetic: ['不想睡...才怪', '还是困...', '再躺会儿...', 'ZZZ...', '动不了...'],
            sleep_normal: ['该睡了...', '好困...', '晚安...', '呼噜...', '睡觉...'],
            sleep_tired: ['终于...', '累死了...', '要睡很久...', '别吵我...', 'ZZZ...'],
            pet_happy: ['呼噜...', '好舒服...', '别停...', 'ZZZ...', '嗯...'],
            pet_normal: ['嗯...', '还行...', '继续...', '呼噜...', '...'],
            pet_sad: ['...', '没心情...', 'ZZZ...', '...', '想睡觉...'],
            play_excited: ['还行吧...', '有点累...', '随便...', '...', '想睡觉...'],
            play_normal: ['累...', '不想跑...', '你玩...', '...', 'ZZZ...'],
            play_tired: ['不玩...', '累...', '睡觉...', '...', '动不了...'],
            clean_willing: ['嗯...还行...', '快结束...', 'ZZZ...', '...', '随便...'],
            clean_unwilling: ['不想动...', '好麻烦...', '...', 'ZZZ...', '别碰我...'],
            feed_full: ['吃不下了...', '好饱...', '想睡觉...', 'ZZZ...', '放那儿吧...'],
            feed_normal: ['嗯...吃...', '还行...', '嚼嚼...', '谢谢...', '...'],
            feed_hungry: ['终于...', '饿死了...', '好吃...', '还要...', '谢谢...'],
            sleep_energetic: ['不想睡...才怪', '还是困...', '再躺会儿...', 'ZZZ...', '动不了...'],
            sleep_normal: ['该睡了...', '好困...', '晚安...', '呼噜...', '睡觉...'],
            sleep_tired: ['终于...', '累死了...', '要睡很久...', '别吵我...', 'ZZZ...'],
            pet_happy: ['呼噜...', '好舒服...', '别停...', 'ZZZ...', '嗯...'],
            pet_normal: ['嗯...', '还行...', '继续...', '呼噜...', '...'],
            pet_sad: ['...', '没心情...', 'ZZZ...', '...', '想睡觉...'],
            play_excited: ['还行吧...', '有点累...', '随便...', '...', '想睡觉...'],
            play_normal: ['累...', '不想飞...', '你玩...', '...', 'ZZZ...'],
            play_tired: ['不玩...', '累...', '睡觉...', '...', '动不了...'],
            clean_willing: ['嗯...还行...', '快结束...', 'ZZZ...', '...', '随便...'],
            clean_unwilling: ['不想动...', '好麻烦...', '...', 'ZZZ...', '别碰我...'],
            feed_full: ['吃不下了...', '好饱...', '想睡觉...', 'ZZZ...', '放那儿吧...'],
            feed_normal: ['嗯...吃...', '还行...', '嚼嚼...', '谢谢...', '...'],
            feed_hungry: ['终于...', '饿死了...', '好吃...', '还要...', '谢谢...'],
            sleep_energetic: ['不想睡...才怪', '还是困...', '再躺会儿...', 'ZZZ...', '动不了...'],
            sleep_normal: ['该睡了...', '好困...', '晚安...', '呼噜...', '睡觉...'],
            sleep_tired: ['终于...', '累死了...', '要睡很久...', '别吵我...', 'ZZZ...'],
            pet_happy: ['呼噜...', '好舒服...', '别停...', 'ZZZ...', '嗯...'],
            pet_normal: ['嗯...', '还行...', '继续...', '呼噜...', '...'],
            pet_sad: ['...', '没心情...', 'ZZZ...', '...', '想睡觉...'],
            play_excited: ['还行吧...', '有点累...', '随便...', '...', '想睡觉...'],
            play_normal: ['累...', '不想跑...', '你玩...', '...', 'ZZZ...'],
            play_tired: ['不玩...', '累...', '睡觉...', '...', '动不了...'],
            clean_willing: ['嗯...还行...', '快结束...', 'ZZZ...', '...', '随便...'],
            clean_unwilling: ['不想动...', '好麻烦...', '...', 'ZZZ...', '别碰我...'],
            feed_full: ['吃不下了...', '好饱...', '想睡觉...', 'ZZZ...', '放那儿吧...'],
            feed_normal: ['嗯...吃...', '还行...', '嚼嚼...', '谢谢...', '...'],
            feed_hungry: ['终于...', '饿死了...', '好吃...', '还要...', '谢谢...'],
            sleep_energetic: ['不想睡...才怪', '还是困...', '再躺会儿...', 'ZZZ...', '动不了...'],
            sleep_normal: ['该睡了...', '好困...', '晚安...', '呼噜...', '睡觉...'],
            sleep_tired: ['终于...', '累死了...', '要睡很久...', '别吵我...', 'ZZZ...'],
            pet_happy: ['呼噜...', '好舒服...', '别停...', 'ZZZ...', '嗯...'],
            pet_normal: ['嗯...', '还行...', '继续...', '呼噜...', '...'],
            pet_sad: ['...', '没心情...', 'ZZZ...', '...', '想睡觉...'],
            play_excited: ['还行吧...', '有点累...', '随便...', '...', '想睡觉...'],
            play_normal: ['累...', '不想飞...', '你玩...', '...', 'ZZZ...'],
            play_tired: ['不玩...', '累...', '睡觉...', '...', '动不了...'],
            clean_willing: ['嗯...还行...', '快结束...', 'ZZZ...', '...', '随便...'],
            clean_unwilling: ['不想动...', '好麻烦...', '...', 'ZZZ...', '别碰我...'],
            feed_full: ['吃不下了...', '好饱...', '想睡觉...', 'ZZZ...', '放那儿吧...'],
            feed_normal: ['嗯...吃...', '还行...', '嚼嚼...', '谢谢...', '...'],
            feed_hungry: ['终于...', '饿死了...', '好吃...', '还要...', '谢谢...'],
            sleep_energetic: ['不想睡...才怪', '还是困...', '再躺会儿...', 'ZZZ...', '动不了...'],
            sleep_normal: ['该睡了...', '好困...', '晚安...', '呼噜...', '睡觉...'],
            sleep_tired: ['终于...', '累死了...', '要睡很久...', '别吵我...', 'ZZZ...'],
            pet_happy: ['呼噜...', '好舒服...', '别停...', 'ZZZ...', '嗯...'],
            pet_normal: ['嗯...', '还行...', '继续...', '呼噜...', '...'],
            pet_sad: ['...', '没心情...', 'ZZZ...', '...', '想睡觉...'],
            play_excited: ['还行吧...', '有点累...', '随便...', '...', '想睡觉...'],
            play_normal: ['累...', '不想跑...', '你玩...', '...', 'ZZZ...'],
            play_tired: ['不玩...', '累...', '睡觉...', '...', '动不了...'],
            clean_willing: ['嗯...还行...', '快结束...', 'ZZZ...', '...', '随便...'],
            clean_unwilling: ['不想动...', '好麻烦...', '...', 'ZZZ...', '别碰我...'],
            feed_full: ['吃不下了...', '好饱...', '想睡觉...', 'ZZZ...', '放那儿吧...'],
            feed_normal: ['嗯...吃...', '还行...', '嚼嚼...', '谢谢...', '...'],
            feed_hungry: ['终于...', '饿死了...', '好吃...', '还要...', '谢谢...'],
            sleep_energetic: ['不想睡...才怪', '还是困...', '再躺会儿...', 'ZZZ...', '动不了...'],
            sleep_normal: ['该睡了...', '好困...', '晚安...', '呼噜...', '睡觉...'],
            sleep_tired: ['终于...', '累死了...', '要睡很久...', '别吵我...', 'ZZZ...'],
            pet_happy: ['呼噜...', '好舒服...', '别停...', 'ZZZ...', '嗯...'],
            pet_normal: ['嗯...', '还行...', '继续...', '呼噜...', '...'],
            pet_sad: ['...', '没心情...', 'ZZZ...', '...', '想睡觉...'],
            play_excited: ['还行吧...', '有点累...', '随便...', '...', '想睡觉...'],
            play_normal: ['累...', '不想动...', '你玩...', '...', 'ZZZ...'],
            play_tired: ['不玩...', '累...', '睡觉...', '...', '动不了...'],
            clean_willing: ['嗯...还行...', '快结束...', 'ZZZ...', '...', '随便...'],
            clean_unwilling: ['不想动...', '好麻烦...', '...', 'ZZZ...', '别碰我...']
        },
        // 贪吃
        贪吃: {
            normal: ['饿了...喵', '有吃的吗？', '什么时候开饭？', '闻到香味了！', '给我小鱼干！'],
            feed: ['好吃！还要！', '再来一份！', '最美味的时刻！', '不够不够！', '舔盘子！'],
            pet: ['摸我可以，给吃的吗？', '舒服...但有吃的更好', '摸完给奖励吗？', '嗯...饿了...', '好吃的在哪里？'],
            play: ['玩完有吃的吗？', '累了，要补充能量', '能吃的玩具吗？', '玩不如吃...', '主人，我饿了！'],
            sleep: ['梦里也有吃的...', '睡醒了要吃...', 'ZZZ...小鱼干...', '好饿...先睡...', '梦里吃大餐...'],
            clean: ['洗完有吃的吗？', '香喷喷...想吃...', '好饿...快结束...', '洗澡不如吃饭...', '干净了好饿...'],
            feed_full: ['还能再吃！', '肚子还有空位', '再来一口嘛', '不饱不饱', '想吃！'],
            feed_normal: ['好吃！', '再来点！', '美味！', '还要！', '不错！'],
            feed_hungry: ['太好吃了！', '饿死了！', '狼吞虎咽！', '还要还要！', '终于！'],
            sleep_energetic: ['吃饱了想睡...', 'ZZZ...食物...', '梦里吃...', '困...', '想吃...'],
            sleep_normal: ['睡醒了吃...', 'ZZZ...', '梦里大餐...', '先睡...', '饿了...'],
            sleep_tired: ['累饿了...', '睡...吃...', 'ZZZ...', '要吃东西...', '饿...'],
            pet_happy: ['舒服~给吃的吗？', '开心~饿了~', '好~要吃的~', '啾啾~食物~', '喜欢~饿了~'],
            pet_normal: ['饿了...', '给吃的？', '嗯...', '食物...', '啾啾...'],
            pet_sad: ['...饿了', '没心情吃...', '...', '想吃...', '...'],
            play_excited: ['玩！然后吃！', '开心！饿了！', '好玩！要吃的！', '啾啾！食物！', '兴奋！饿了！'],
            play_normal: ['玩...饿了...', '累...吃...', '还行...饿了...', '...食物...', '啾啾...'],
            play_tired: ['累了...饿了...', '不玩...要吃...', '饿...', '...吃...', '没力气...'],
            clean_willing: ['洗完吃吗？', '快结束...饿了...', '...好', '想吃...', '...'],
            clean_unwilling: ['不想洗...想吃...', '饿了...不洗...', '...', '要吃...', '...'],
            feed_full: ['还能再吃！', '肚子还有空位', '再来一口嘛', '不饱不饱', '想吃！'],
            feed_normal: ['好吃！', '再来点！', '美味！', '还要！', '不错！'],
            feed_hungry: ['太好吃了！', '饿死了！', '狼吞虎咽！', '还要还要！', '终于！'],
            sleep_energetic: ['吃饱了想睡...', 'ZZZ...食物...', '梦里吃...', '困...', '想吃...'],
            sleep_normal: ['睡醒了吃...', 'ZZZ...', '梦里大餐...', '先睡...', '饿了...'],
            sleep_tired: ['累饿了...', '睡...吃...', 'ZZZ...', '要吃东西...', '饿...'],
            pet_happy: ['舒服~给吃的吗？', '开心~饿了~', '好~要吃的~', '吱~食物~', '喜欢~饿了~'],
            pet_normal: ['饿了...', '给吃的？', '嗯...', '食物...', '吱...'],
            pet_sad: ['...饿了', '没心情吃...', '...', '想吃...', '...'],
            play_excited: ['玩！然后吃！', '开心！饿了！', '好玩！要吃的！', '吱！食物！', '兴奋！饿了！'],
            play_normal: ['玩...饿了...', '累...吃...', '还行...饿了...', '...食物...', '吱...'],
            play_tired: ['累了...饿了...', '不玩...要吃...', '饿...', '...吃...', '没力气...'],
            clean_willing: ['洗完吃吗？', '快结束...饿了...', '...好', '想吃...', '...'],
            clean_unwilling: ['不想洗...想吃...', '饿了...不洗...', '...', '要吃...', '...'],
            feed_full: ['还能再吃！', '肚子还有空位', '再来一口嘛', '不饱不饱', '想吃！'],
            feed_normal: ['好吃！', '再来点！', '美味！', '还要！', '不错！'],
            feed_hungry: ['太好吃了！', '饿死了！', '狼吞虎咽！', '还要还要！', '终于！'],
            sleep_energetic: ['吃饱了想睡...', 'ZZZ...食物...', '梦里吃...', '困...', '想吃...'],
            sleep_normal: ['睡醒了吃...', 'ZZZ...', '梦里大餐...', '先睡...', '饿了...'],
            sleep_tired: ['累饿了...', '睡...吃...', 'ZZZ...', '要吃东西...', '饿...'],
            pet_happy: ['舒服~给吃的吗？', '开心~饿了~', '好~要吃的~', '啾啾~食物~', '喜欢~饿了~'],
            pet_normal: ['饿了...', '给吃的？', '嗯...', '食物...', '啾啾...'],
            pet_sad: ['...饿了', '没心情吃...', '...', '想吃...', '...'],
            play_excited: ['玩！然后吃！', '开心！饿了！', '好玩！要吃的！', '啾啾！食物！', '兴奋！饿了！'],
            play_normal: ['玩...饿了...', '累...吃...', '还行...饿了...', '...食物...', '啾啾...'],
            play_tired: ['累了...饿了...', '不玩...要吃...', '饿...', '...吃...', '没力气...'],
            clean_willing: ['洗完吃吗？', '快结束...饿了...', '...好', '想吃...', '...'],
            clean_unwilling: ['不想洗...想吃...', '饿了...不洗...', '...', '要吃...', '...'],
            feed_full: ['还能再吃！', '肚子还有空位', '再来一口嘛', '不饱不饱', '想吃！'],
            feed_normal: ['好吃！', '再来点！', '美味！', '还要！', '不错！'],
            feed_hungry: ['太好吃了！', '饿死了！', '狼吞虎咽！', '还要还要！', '终于！'],
            sleep_energetic: ['吃饱了想睡...', 'ZZZ...食物...', '梦里吃...', '困...', '想吃...'],
            sleep_normal: ['睡醒了吃...', 'ZZZ...', '梦里大餐...', '先睡...', '饿了...'],
            sleep_tired: ['累饿了...', '睡...吃...', 'ZZZ...', '要吃东西...', '饿...'],
            pet_happy: ['舒服~给吃的吗？', '开心~饿了~', '好~要吃的~', '吱~食物~', '喜欢~饿了~'],
            pet_normal: ['饿了...', '给吃的？', '嗯...', '食物...', '吱...'],
            pet_sad: ['...饿了', '没心情吃...', '...', '想吃...', '...'],
            play_excited: ['玩！然后吃！', '开心！饿了！', '好玩！要吃的！', '吱！食物！', '兴奋！饿了！'],
            play_normal: ['玩...饿了...', '累...吃...', '还行...饿了...', '...食物...', '吱...'],
            play_tired: ['累了...饿了...', '不玩...要吃...', '饿...', '...吃...', '没力气...'],
            clean_willing: ['洗完吃吗？', '快结束...饿了...', '...好', '想吃...', '...'],
            clean_unwilling: ['不想洗...想吃...', '饿了...不洗...', '...', '要吃...', '...'],
            feed_full: ['还能再吃！', '肚子还有空位', '再来一口嘛', '不饱不饱', '想吃！'],
            feed_normal: ['好吃！', '再来点！', '美味！', '还要！', '不错！'],
            feed_hungry: ['太好吃了！', '饿死了！', '狼吞虎咽！', '还要还要！', '终于！'],
            sleep_energetic: ['吃饱了想睡...', 'ZZZ...食物...', '梦里吃...', '困...', '想吃...'],
            sleep_normal: ['睡醒了吃...', 'ZZZ...', '梦里大餐...', '先睡...', '饿了...'],
            sleep_tired: ['累饿了...', '睡...吃...', 'ZZZ...', '要吃东西...', '饿...'],
            pet_happy: ['舒服~给吃的吗？', '开心~饿了~', '好~要吃的~', '啾啾~食物~', '喜欢~饿了~'],
            pet_normal: ['饿了...', '给吃的？', '嗯...', '食物...', '啾啾...'],
            pet_sad: ['...饿了', '没心情吃...', '...', '想吃...', '...'],
            play_excited: ['玩！然后吃！', '开心！饿了！', '好玩！要吃的！', '啾啾！食物！', '兴奋！饿了！'],
            play_normal: ['玩...饿了...', '累...吃...', '还行...饿了...', '...食物...', '啾啾...'],
            play_tired: ['累了...饿了...', '不玩...要吃...', '饿...', '...吃...', '没力气...'],
            clean_willing: ['洗完吃吗？', '快结束...饿了...', '...好', '想吃...', '...'],
            clean_unwilling: ['不想洗...想吃...', '饿了...不洗...', '...', '要吃...', '...'],
            feed_full: ['还能再吃！', '肚子还有空位', '再来一口嘛', '不饱不饱', '想吃！'],
            feed_normal: ['好吃！', '再来点！', '美味！', '还要！', '不错！'],
            feed_hungry: ['太好吃了！', '饿死了！', '狼吞虎咽！', '还要还要！', '终于！'],
            sleep_energetic: ['吃饱了想睡...', 'ZZZ...食物...', '梦里吃...', '困...', '想吃...'],
            sleep_normal: ['睡醒了吃...', 'ZZZ...', '梦里大餐...', '先睡...', '饿了...'],
            sleep_tired: ['累饿了...', '睡...吃...', 'ZZZ...', '要吃东西...', '饿...'],
            pet_happy: ['舒服~给吃的吗？', '开心~饿了~', '好~要吃的~', '吱~食物~', '喜欢~饿了~'],
            pet_normal: ['饿了...', '给吃的？', '嗯...', '食物...', '吱...'],
            pet_sad: ['...饿了', '没心情吃...', '...', '想吃...', '...'],
            play_excited: ['玩！然后吃！', '开心！饿了！', '好玩！要吃的！', '吱！食物！', '兴奋！饿了！'],
            play_normal: ['玩...饿了...', '累...吃...', '还行...饿了...', '...食物...', '吱...'],
            play_tired: ['累了...饿了...', '不玩...要吃...', '饿...', '...吃...', '没力气...'],
            clean_willing: ['洗完吃吗？', '快结束...饿了...', '...好', '想吃...', '...'],
            clean_unwilling: ['不想洗...想吃...', '饿了...不洗...', '...', '要吃...', '...'],
            feed_full: ['还能再吃！', '肚子还有空位', '再来一口嘛', '不饱不饱', '想吃！'],
            feed_normal: ['好吃！', '再来点！', '美味！', '还要！', '不错！'],
            feed_hungry: ['太好吃了！', '饿死了！', '狼吞虎咽！', '还要还要！', '终于！'],
            sleep_energetic: ['吃饱了想睡...', 'ZZZ...食物...', '梦里吃...', '困...', '想吃...'],
            sleep_normal: ['睡醒了吃...', 'ZZZ...', '梦里大餐...', '先睡...', '饿了...'],
            sleep_tired: ['累饿了...', '睡...吃...', 'ZZZ...', '要吃东西...', '饿...'],
            pet_happy: ['舒服~给吃的吗？', '开心~饿了~', '好~要吃的~', '喵~食物~', '喜欢~饿了~'],
            pet_normal: ['饿了...', '给吃的？', '嗯...', '食物...', '喵...'],
            pet_sad: ['...饿了', '没心情吃...', '...', '想吃...', '...'],
            play_excited: ['玩！然后吃！', '开心！饿了！', '好玩！要吃的！', '耶！食物！', '兴奋！饿了！'],
            play_normal: ['玩...饿了...', '累...吃...', '还行...饿了...', '...食物...', '喵...'],
            play_tired: ['累了...饿了...', '不玩...要吃...', '饿...', '...吃...', '没力气...'],
            clean_willing: ['洗完吃吗？', '快结束...饿了...', '...好', '想吃...', '...'],
            clean_unwilling: ['不想洗...想吃...', '饿了...不洗...', '...', '要吃...', '...']
        },
        // 调皮
        调皮: {
            normal: ['那个杯子会掉吗？', '窗帘好好玩~', '沙发抓起来不错', '主人找不到我~', '捣乱真开心~'],
            feed: ['先玩再吃！', '食物也可以玩！', '打翻！舔干净！', '边吃边玩~', '把食物藏起来~'],
            pet: ['咬你手指！', '抓你衣服！', '突然跑掉！', '再追过来！', '哈哈抓不到我！'],
            play: ['破坏玩具！', '撕碎！撕碎！', '球飞到沙发底了！', '玩捉迷藏！', '你抓不到我！'],
            sleep: ['睡前再捣乱一下~', 'ZZZ...梦里捣乱...', '明天继续玩~', '睡觉也动来动去~', '呼噜...再玩...'],
            clean: ['水花飞溅！', '泡泡攻击！', '甩你一身水！', '洗澡也捣乱~', '抓抓抓！'],
            feed_full: ['打翻食物！', '玩食物！', '藏起来！', '不吃也要玩！', '打翻！'],
            feed_normal: ['边吃边玩！', '玩一会儿吃！', '打翻！', '藏起来！', '好玩！'],
            feed_hungry: ['狼吞虎咽！', '边吃边捣乱！', '打翻再吃！', '好吃！还要！', '饿坏了！'],
            sleep_energetic: ['不想睡！捣乱！', '还要玩！', '睡前捣乱！', 'ZZZ...捣乱...', '睡不着！'],
            sleep_normal: ['睡一会儿...', 'ZZZ...捣乱...', '明天玩...', '梦里捣乱...', '睡...'],
            sleep_tired: ['累也要捣乱...', '睡...明天捣乱...', 'ZZZ...', '最后捣乱一下...', '呼...'],
            pet_happy: ['啄！扑！', '飞！追！', '捣乱！', '哈哈！', '好玩！'],
            pet_normal: ['啄一下~', '扑一下~', '飞~', '捣乱~', '啾啾~'],
            pet_sad: ['...捣乱', '...啄', '...', '想捣乱...', '...'],
            play_excited: ['啄玩具！', '飞！', '捣乱！', '好玩！', '啾啾！'],
            play_normal: ['玩！', '捣乱！', '啄！', '飞！', '扑！'],
            play_tired: ['累了...捣乱...', '没力气...也要...', '...', '最后一下...', '呼...'],
            clean_willing: ['水花！', '泡泡！', '甩水！', '捣乱！', '扑！'],
            clean_unwilling: ['不想洗！', '甩你水！', '飞！', '躲！', '不要！'],
            feed_full: ['打翻食物！', '玩食物！', '藏起来！', '不吃也要玩！', '打翻！'],
            feed_normal: ['边吃边玩！', '玩一会儿吃！', '打翻！', '藏起来！', '好玩！'],
            feed_hungry: ['狼吞虎咽！', '边吃边捣乱！', '打翻再吃！', '好吃！还要！', '饿坏了！'],
            sleep_energetic: ['不想睡！捣乱！', '还要玩！', '睡前捣乱！', 'ZZZ...捣乱...', '睡不着！'],
            sleep_normal: ['睡一会儿...', 'ZZZ...捣乱...', '明天玩...', '梦里捣乱...', '睡...'],
            sleep_tired: ['累也要捣乱...', '睡...明天捣乱...', 'ZZZ...', '最后捣乱一下...', '呼...'],
            pet_happy: ['啄！扑！', '飞！追！', '捣乱！', '哈哈！', '好玩！'],
            pet_normal: ['啄一下~', '扑一下~', '飞~', '捣乱~', '啾啾~'],
            pet_sad: ['...捣乱', '...啄', '...', '想捣乱...', '...'],
            play_excited: ['啄玩具！', '飞！', '捣乱！', '好玩！', '啾啾！'],
            play_normal: ['玩！', '捣乱！', '啄！', '飞！', '扑！'],
            play_tired: ['累了...捣乱...', '没力气...也要...', '...', '最后一下...', '呼...'],
            clean_willing: ['水花！', '泡泡！', '甩水！', '捣乱！', '扑！'],
            clean_unwilling: ['不想洗！', '甩你水！', '飞！', '躲！', '不要！'],
            feed_full: ['打翻食物！', '玩食物！', '藏起来！', '不吃也要玩！', '打翻！'],
            feed_normal: ['边吃边玩！', '玩一会儿吃！', '打翻！', '藏起来！', '好玩！'],
            feed_hungry: ['狼吞虎咽！', '边吃边捣乱！', '打翻再吃！', '好吃！还要！', '饿坏了！'],
            sleep_energetic: ['不想睡！捣乱！', '还要玩！', '睡前捣乱！', 'ZZZ...捣乱...', '睡不着！'],
            sleep_normal: ['睡一会儿...', 'ZZZ...捣乱...', '明天玩...', '梦里捣乱...', '睡...'],
            sleep_tired: ['累也要捣乱...', '睡...明天捣乱...', 'ZZZ...', '最后捣乱一下...', '呼...'],
            pet_happy: ['咬！扑！', '跑！追！', '捣乱！', '哈哈！', '好玩！'],
            pet_normal: ['咬一下~', '扑一下~', '跑~', '捣乱~', '吱~'],
            pet_sad: ['...捣乱', '...咬', '...', '想捣乱...', '...'],
            play_excited: ['咬玩具！', '挖！', '捣乱！', '好玩！', '吱！'],
            play_normal: ['玩！', '捣乱！', '咬！', '跑！', '扑！'],
            play_tired: ['累了...捣乱...', '没力气...也要...', '...', '最后一下...', '呼...'],
            clean_willing: ['水花！', '泡泡！', '甩水！', '捣乱！', '扑！'],
            clean_unwilling: ['不想洗！', '甩你水！', '跑！', '躲！', '不要！'],
            feed_full: ['打翻食物！', '玩食物！', '藏起来！', '不吃也要玩！', '打翻！'],
            feed_normal: ['边吃边玩！', '玩一会儿吃！', '打翻！', '藏起来！', '好玩！'],
            feed_hungry: ['狼吞虎咽！', '边吃边捣乱！', '打翻再吃！', '好吃！还要！', '饿坏了！'],
            sleep_energetic: ['不想睡！捣乱！', '还要玩！', '睡前捣乱！', 'ZZZ...捣乱...', '睡不着！'],
            sleep_normal: ['睡一会儿...', 'ZZZ...捣乱...', '明天玩...', '梦里捣乱...', '睡...'],
            sleep_tired: ['累也要捣乱...', '睡...明天捣乱...', 'ZZZ...', '最后捣乱一下...', '呼...'],
            pet_happy: ['啄！扑！', '飞！追！', '捣乱！', '哈哈！', '好玩！'],
            pet_normal: ['啄一下~', '扑一下~', '飞~', '捣乱~', '啾啾~'],
            pet_sad: ['...捣乱', '...啄', '...', '想捣乱...', '...'],
            play_excited: ['啄玩具！', '飞！', '捣乱！', '好玩！', '啾啾！'],
            play_normal: ['玩！', '捣乱！', '啄！', '飞！', '扑！'],
            play_tired: ['累了...捣乱...', '没力气...也要...', '...', '最后一下...', '呼...'],
            clean_willing: ['水花！', '泡泡！', '甩水！', '捣乱！', '扑！'],
            clean_unwilling: ['不想洗！', '甩你水！', '飞！', '躲！', '不要！'],
            feed_full: ['打翻食物！', '玩食物！', '藏起来！', '不吃也要玩！', '打翻！'],
            feed_normal: ['边吃边玩！', '玩一会儿吃！', '打翻！', '藏起来！', '好玩！'],
            feed_hungry: ['狼吞虎咽！', '边吃边捣乱！', '打翻再吃！', '好吃！还要！', '饿坏了！'],
            sleep_energetic: ['不想睡！捣乱！', '还要玩！', '睡前捣乱！', 'ZZZ...捣乱...', '睡不着！'],
            sleep_normal: ['睡一会儿...', 'ZZZ...捣乱...', '明天玩...', '梦里捣乱...', '睡...'],
            sleep_tired: ['累也要捣乱...', '睡...明天捣乱...', 'ZZZ...', '最后捣乱一下...', '呼...'],
            pet_happy: ['咬！扑！', '跑！追！', '捣乱！', '哈哈！', '好玩！'],
            pet_normal: ['咬一下~', '扑一下~', '跑~', '捣乱~', '吱~'],
            pet_sad: ['...捣乱', '...咬', '...', '想捣乱...', '...'],
            play_excited: ['咬玩具！', '挖！', '捣乱！', '好玩！', '吱！'],
            play_normal: ['玩！', '捣乱！', '咬！', '跑！', '扑！'],
            play_tired: ['累了...捣乱...', '没力气...也要...', '...', '最后一下...', '呼...'],
            clean_willing: ['水花！', '泡泡！', '甩水！', '捣乱！', '扑！'],
            clean_unwilling: ['不想洗！', '甩你水！', '跑！', '躲！', '不要！'],
            feed_full: ['打翻食物！', '玩食物！', '藏起来！', '不吃也要玩！', '打翻！'],
            feed_normal: ['边吃边玩！', '玩一会儿吃！', '打翻！', '藏起来！', '好玩！'],
            feed_hungry: ['狼吞虎咽！', '边吃边捣乱！', '打翻再吃！', '好吃！还要！', '饿坏了！'],
            sleep_energetic: ['不想睡！捣乱！', '还要玩！', '睡前捣乱！', 'ZZZ...捣乱...', '睡不着！'],
            sleep_normal: ['睡一会儿...', 'ZZZ...捣乱...', '明天玩...', '梦里捣乱...', '睡...'],
            sleep_tired: ['累也要捣乱...', '睡...明天捣乱...', 'ZZZ...', '最后捣乱一下...', '呼...'],
            pet_happy: ['啄！扑！', '飞！追！', '捣乱！', '哈哈！', '好玩！'],
            pet_normal: ['啄一下~', '扑一下~', '飞~', '捣乱~', '啾啾~'],
            pet_sad: ['...捣乱', '...啄', '...', '想捣乱...', '...'],
            play_excited: ['啄玩具！', '飞！', '捣乱！', '好玩！', '啾啾！'],
            play_normal: ['玩！', '捣乱！', '啄！', '飞！', '扑！'],
            play_tired: ['累了...捣乱...', '没力气...也要...', '...', '最后一下...', '呼...'],
            clean_willing: ['水花！', '泡泡！', '甩水！', '捣乱！', '扑！'],
            clean_unwilling: ['不想洗！', '甩你水！', '飞！', '躲！', '不要！'],
            feed_full: ['打翻食物！', '玩食物！', '藏起来！', '不吃也要玩！', '打翻！'],
            feed_normal: ['边吃边玩！', '玩一会儿吃！', '打翻！', '藏起来！', '好玩！'],
            feed_hungry: ['狼吞虎咽！', '边吃边捣乱！', '打翻再吃！', '好吃！还要！', '饿坏了！'],
            sleep_energetic: ['不想睡！捣乱！', '还要玩！', '睡前捣乱！', 'ZZZ...捣乱...', '睡不着！'],
            sleep_normal: ['睡一会儿...', 'ZZZ...捣乱...', '明天玩...', '梦里捣乱...', '睡...'],
            sleep_tired: ['累也要捣乱...', '睡...明天捣乱...', 'ZZZ...', '最后捣乱一下...', '呼...'],
            pet_happy: ['咬！扑！', '跑！追！', '捣乱！', '哈哈！', '好玩！'],
            pet_normal: ['咬一下~', '扑一下~', '跑~', '捣乱~', '吱~'],
            pet_sad: ['...捣乱', '...咬', '...', '想捣乱...', '...'],
            play_excited: ['咬玩具！', '挖！', '捣乱！', '好玩！', '吱！'],
            play_normal: ['玩！', '捣乱！', '咬！', '跑！', '扑！'],
            play_tired: ['累了...捣乱...', '没力气...也要...', '...', '最后一下...', '呼...'],
            clean_willing: ['水花！', '泡泡！', '甩水！', '捣乱！', '扑！'],
            clean_unwilling: ['不想洗！', '甩你水！', '跑！', '躲！', '不要！'],
            feed_full: ['打翻食物！', '玩食物！', '藏起来！', '不吃也要玩！', '打翻！'],
            feed_normal: ['边吃边玩！', '玩一会儿吃！', '打翻！', '藏起来！', '好玩！'],
            feed_hungry: ['狼吞虎咽！', '边吃边捣乱！', '打翻再吃！', '好吃！还要！', '饿坏了！'],
            sleep_energetic: ['不想睡！捣乱！', '还要玩！', '睡前捣乱！', 'ZZZ...捣乱...', '睡不着！'],
            sleep_normal: ['睡一会儿...', 'ZZZ...捣乱...', '明天玩...', '梦里捣乱...', '睡...'],
            sleep_tired: ['累也要捣乱...', '睡...明天捣乱...', 'ZZZ...', '最后捣乱一下...', '呼...'],
            pet_happy: ['咬！抓！', '跑！追！', '捣乱！', '哈哈！', '好玩！'],
            pet_normal: ['咬一下~', '抓一下~', '跑~', '捣乱~', '喵~'],
            pet_sad: ['...捣乱', '...咬', '...', '想捣乱...', '...'],
            play_excited: ['破坏！', '撕碎！', '捣乱！', '好玩！', '耶！'],
            play_normal: ['玩！', '捣乱！', '撕！', '跑！', '抓！'],
            play_tired: ['累了...捣乱...', '没力气...也要...', '...', '最后一下...', '呼...'],
            clean_willing: ['水花！', '泡泡！', '甩水！', '捣乱！', '抓！'],
            clean_unwilling: ['不想洗！', '甩你水！', '跑！', '躲！', '不要！']
        },
        // 胆小
        胆小: {
            normal: ['...有人吗', '好可怕...', '躲起来...', '别吓我...喵', '...想主人'],
            feed: ['...谢谢', '偷偷吃...', '没人看见我吧', '...好吃', '安心了...'],
            pet: ['...可以摸', '好温柔...', '不怕了...', '呼噜...安全', '...喜欢'],
            play: ['...轻一点', '害怕但想玩', '...慢慢来', '主人保护我', '...好玩'],
            sleep: ['...晚安', '黑暗好可怕...', '主人陪着...', '蜷缩起来...', '...安全了'],
            clean: ['...水好可怕', '轻一点...', '别弄疼我...', '...好可怕', '...谢谢主人'],
            feed_full: ['...不饿', '放着...', '...', '偷偷吃...', '...'],
            feed_normal: ['...谢谢', '...好吃', '...', '安心...', '...'],
            feed_hungry: ['...终于', '...好吃', '饿...', '谢谢...', '...'],
            sleep_energetic: ['...不想睡', '...怕', '...躲起来', '...', '...'],
            sleep_normal: ['...晚安', '...怕', '...蜷缩', '...', '...'],
            sleep_tired: ['...终于', '...累', '...睡', '...', '...'],
            pet_happy: ['...舒服', '...不怕', '...喜欢', '...安全', '...'],
            pet_normal: ['...可以', '...好', '...', '...嗯', '...'],
            pet_sad: ['...怕', '...别', '...', '...', '...'],
            play_excited: ['...开心', '...怕但想', '...好玩', '...', '...'],
            play_normal: ['...轻', '...怕', '...', '...', '...'],
            play_tired: ['...累', '...怕', '...', '...', '...'],
            clean_willing: ['...轻', '...好', '...', '...', '...'],
            clean_unwilling: ['...怕', '...不要', '...水', '...', '...'],
            feed_full: ['...不饿', '放着...', '...', '偷偷吃...', '...'],
            feed_normal: ['...谢谢', '...好吃', '...', '安心...', '...'],
            feed_hungry: ['...终于', '...好吃', '饿...', '谢谢...', '...'],
            sleep_energetic: ['...不想睡', '...怕', '...躲起来', '...', '...'],
            sleep_normal: ['...晚安', '...怕', '...蜷缩', '...', '...'],
            sleep_tired: ['...终于', '...累', '...睡', '...', '...'],
            pet_happy: ['...舒服', '...不怕', '...喜欢', '...安全', '...'],
            pet_normal: ['...可以', '...好', '...', '...嗯', '...'],
            pet_sad: ['...怕', '...别', '...', '...', '...'],
            play_excited: ['...开心', '...怕但想', '...好玩', '...', '...'],
            play_normal: ['...轻', '...怕', '...', '...', '...'],
            play_tired: ['...累', '...怕', '...', '...', '...'],
            clean_willing: ['...轻', '...好', '...', '...', '...'],
            clean_unwilling: ['...怕', '...不要', '...水', '...', '...'],
            feed_full: ['...不饿', '放着...', '...', '偷偷吃...', '...'],
            feed_normal: ['...谢谢', '...好吃', '...', '安心...', '...'],
            feed_hungry: ['...终于', '...好吃', '饿...', '谢谢...', '...'],
            sleep_energetic: ['...不想睡', '...怕', '...躲起来', '...', '...'],
            sleep_normal: ['...晚安', '...怕', '...蜷缩', '...', '...'],
            sleep_tired: ['...终于', '...累', '...睡', '...', '...'],
            pet_happy: ['...舒服', '...不怕', '...喜欢', '...安全', '...'],
            pet_normal: ['...可以', '...好', '...', '...嗯', '...'],
            pet_sad: ['...怕', '...别', '...', '...', '...'],
            play_excited: ['...开心', '...怕但想', '...好玩', '...', '...'],
            play_normal: ['...轻', '...怕', '...', '...', '...'],
            play_tired: ['...累', '...怕', '...', '...', '...'],
            clean_willing: ['...轻', '...好', '...', '...', '...'],
            clean_unwilling: ['...怕', '...不要', '...水', '...', '...'],
            feed_full: ['...不饿', '放着...', '...', '偷偷吃...', '...'],
            feed_normal: ['...谢谢', '...好吃', '...', '安心...', '...'],
            feed_hungry: ['...终于', '...好吃', '饿...', '谢谢...', '...'],
            sleep_energetic: ['...不想睡', '...怕', '...躲起来', '...', '...'],
            sleep_normal: ['...晚安', '...怕', '...蜷缩', '...', '...'],
            sleep_tired: ['...终于', '...累', '...睡', '...', '...'],
            pet_happy: ['...舒服', '...不怕', '...喜欢', '...安全', '...'],
            pet_normal: ['...可以', '...好', '...', '...嗯', '...'],
            pet_sad: ['...怕', '...别', '...', '...', '...'],
            play_excited: ['...开心', '...怕但想', '...好玩', '...', '...'],
            play_normal: ['...轻', '...怕', '...', '...', '...'],
            play_tired: ['...累', '...怕', '...', '...', '...'],
            clean_willing: ['...轻', '...好', '...', '...', '...'],
            clean_unwilling: ['...怕', '...不要', '...水', '...', '...'],
            feed_full: ['...不饿', '放着...', '...', '偷偷吃...', '...'],
            feed_normal: ['...谢谢', '...好吃', '...', '安心...', '...'],
            feed_hungry: ['...终于', '...好吃', '饿...', '谢谢...', '...'],
            sleep_energetic: ['...不想睡', '...怕', '...躲起来', '...', '...'],
            sleep_normal: ['...晚安', '...怕', '...蜷缩', '...', '...'],
            sleep_tired: ['...终于', '...累', '...睡', '...', '...'],
            pet_happy: ['...舒服', '...不怕', '...喜欢', '...安全', '...'],
            pet_normal: ['...可以', '...好', '...', '...嗯', '...'],
            pet_sad: ['...怕', '...别', '...', '...', '...'],
            play_excited: ['...开心', '...怕但想', '...好玩', '...', '...'],
            play_normal: ['...轻', '...怕', '...', '...', '...'],
            play_tired: ['...累', '...怕', '...', '...', '...'],
            clean_willing: ['...轻', '...好', '...', '...', '...'],
            clean_unwilling: ['...怕', '...不要', '...水', '...', '...'],
            feed_full: ['...不饿', '放着...', '...', '偷偷吃...', '...'],
            feed_normal: ['...谢谢', '...好吃', '...', '安心...', '...'],
            feed_hungry: ['...终于', '...好吃', '饿...', '谢谢...', '...'],
            sleep_energetic: ['...不想睡', '...怕', '...躲起来', '...', '...'],
            sleep_normal: ['...晚安', '...怕', '...蜷缩', '...', '...'],
            sleep_tired: ['...终于', '...累', '...睡', '...', '...'],
            pet_happy: ['...舒服', '...不怕', '...喜欢', '...安全', '...'],
            pet_normal: ['...可以', '...好', '...', '...嗯', '...'],
            pet_sad: ['...怕', '...别', '...', '...', '...'],
            play_excited: ['...开心', '...怕但想', '...好玩', '...', '...'],
            play_normal: ['...轻', '...怕', '...', '...', '...'],
            play_tired: ['...累', '...怕', '...', '...', '...'],
            clean_willing: ['...轻', '...好', '...', '...', '...'],
            clean_unwilling: ['...怕', '...不要', '...水', '...', '...'],
            feed_full: ['...不饿', '放着...', '...', '偷偷吃...', '...'],
            feed_normal: ['...谢谢', '...好吃', '...', '安心...', '...'],
            feed_hungry: ['...终于', '...好吃', '饿...', '谢谢...', '...'],
            sleep_energetic: ['...不想睡', '...怕', '...躲起来', '...', '...'],
            sleep_normal: ['...晚安', '...怕', '...蜷缩', '...', '...'],
            sleep_tired: ['...终于', '...累', '...睡', '...', '...'],
            pet_happy: ['...舒服', '...不怕', '...喜欢', '...安全', '...'],
            pet_normal: ['...可以', '...好', '...', '...嗯', '...'],
            pet_sad: ['...怕', '...别', '...', '...', '...'],
            play_excited: ['...开心', '...怕但想', '...好玩', '...', '...'],
            play_normal: ['...轻', '...怕', '...', '...', '...'],
            play_tired: ['...累', '...怕', '...', '...', '...'],
            clean_willing: ['...轻', '...好', '...', '...', '...'],
            clean_unwilling: ['...怕', '...不要', '...水', '...', '...'],
            feed_full: ['...不饿', '放着...', '...', '偷偷吃...', '...'],
            feed_normal: ['...谢谢', '...好吃', '...', '安心...', '...'],
            feed_hungry: ['...终于', '...好吃', '饿...', '谢谢...', '...'],
            sleep_energetic: ['...不想睡', '...怕', '...躲起来', '...', '...'],
            sleep_normal: ['...晚安', '...怕', '...蜷缩', '...', '...'],
            sleep_tired: ['...终于', '...累', '...睡', '...', '...'],
            pet_happy: ['...舒服', '...不怕', '...喜欢', '...安全', '...'],
            pet_normal: ['...可以', '...好', '...', '...嗯', '...'],
            pet_sad: ['...怕', '...别', '...', '...', '...'],
            play_excited: ['...开心', '...怕但想', '...好玩', '...', '...'],
            play_normal: ['...轻', '...怕', '...', '...', '...'],
            play_tired: ['...累', '...怕', '...', '...', '...'],
            clean_willing: ['...轻', '...好', '...', '...', '...'],
            clean_unwilling: ['...怕', '...不要', '...水', '...', '...']
        },
        // 忠诚
        忠诚: {
            normal: ['主人，我在这儿', '一直陪着你', '等你回来', '守护这个家', '永远跟着你'],
            feed: ['感谢主人', '不会浪费的', '主人的恩情', '吃饱了更有力气', '为了主人'],
            pet: ['主人的认可', '很荣幸', '永远忠诚', '只属于你', '我的主人'],
            play: ['服从命令', '全力以赴', '保护主人', '并肩作战', '永远在一起'],
            sleep: ['守护主人入睡...', '随时待命...', 'ZZZ...保护...', '晚安主人...', '忠诚守护...'],
            clean: ['感谢主人清洗', '为主人保持干净', '忠诚地接受', '干干净净守护你', '谢谢主人'],
            feed_full: ['感谢', '已饱', '留着', '为主人省着', '忠诚'],
            feed_normal: ['感谢', '好吃', '感恩', '有力气', '忠诚'],
            feed_hungry: ['感谢', '终于', '饿坏了', '有力气了', '感恩'],
            sleep_energetic: ['守护', '待命', '不困', '警觉', '忠诚'],
            sleep_normal: ['守护', '待命', 'ZZZ...', '警觉', '忠诚'],
            sleep_tired: ['终于', '累', '守护', '待命', '忠诚'],
            pet_happy: ['荣幸', '忠诚', '感恩', '守护', '主人'],
            pet_normal: ['感谢', '忠诚', '守护', '主人', '荣幸'],
            pet_sad: ['...', '忠诚', '守护', '...', '主人'],
            play_excited: ['全力', '保护', '忠诚', '并肩', '永远'],
            play_normal: ['服从', '全力', '保护', '忠诚', '并肩'],
            play_tired: ['累', '但忠诚', '守护', '...', '坚持'],
            clean_willing: ['感谢', '忠诚', '干净', '守护', '主人'],
            clean_unwilling: ['...', '服从', '忠诚', '...', '接受'],
            feed_full: ['感谢', '已饱', '留着', '为主人省着', '忠诚'],
            feed_normal: ['感谢', '好吃', '感恩', '有力气', '忠诚'],
            feed_hungry: ['感谢', '终于', '饿坏了', '有力气了', '感恩'],
            sleep_energetic: ['守护', '待命', '不困', '警觉', '忠诚'],
            sleep_normal: ['守护', '待命', 'ZZZ...', '警觉', '忠诚'],
            sleep_tired: ['终于', '累', '守护', '待命', '忠诚'],
            pet_happy: ['荣幸', '忠诚', '感恩', '守护', '主人'],
            pet_normal: ['感谢', '忠诚', '守护', '主人', '荣幸'],
            pet_sad: ['...', '忠诚', '守护', '...', '主人'],
            play_excited: ['全力', '保护', '忠诚', '并肩', '永远'],
            play_normal: ['服从', '全力', '保护', '忠诚', '并肩'],
            play_tired: ['累', '但忠诚', '守护', '...', '坚持'],
            clean_willing: ['感谢', '忠诚', '干净', '守护', '主人'],
            clean_unwilling: ['...', '服从', '忠诚', '...', '接受'],
            feed_full: ['感谢', '已饱', '留着', '为主人省着', '忠诚'],
            feed_normal: ['感谢', '好吃', '感恩', '有力气', '忠诚'],
            feed_hungry: ['感谢', '终于', '饿坏了', '有力气了', '感恩'],
            sleep_energetic: ['守护', '待命', '不困', '警觉', '忠诚'],
            sleep_normal: ['守护', '待命', 'ZZZ...', '警觉', '忠诚'],
            sleep_tired: ['终于', '累', '守护', '待命', '忠诚'],
            pet_happy: ['荣幸', '忠诚', '感恩', '守护', '主人'],
            pet_normal: ['感谢', '忠诚', '守护', '主人', '荣幸'],
            pet_sad: ['...', '忠诚', '守护', '...', '主人'],
            play_excited: ['全力', '保护', '忠诚', '并肩', '永远'],
            play_normal: ['服从', '全力', '保护', '忠诚', '并肩'],
            play_tired: ['累', '但忠诚', '守护', '...', '坚持'],
            clean_willing: ['感谢', '忠诚', '干净', '守护', '主人'],
            clean_unwilling: ['...', '服从', '忠诚', '...', '接受'],
            feed_full: ['感谢', '已饱', '留着', '为主人省着', '忠诚'],
            feed_normal: ['感谢', '好吃', '感恩', '有力气', '忠诚'],
            feed_hungry: ['感谢', '终于', '饿坏了', '有力气了', '感恩'],
            sleep_energetic: ['守护', '待命', '不困', '警觉', '忠诚'],
            sleep_normal: ['守护', '待命', 'ZZZ...', '警觉', '忠诚'],
            sleep_tired: ['终于', '累', '守护', '待命', '忠诚'],
            pet_happy: ['荣幸', '忠诚', '感恩', '守护', '主人'],
            pet_normal: ['感谢', '忠诚', '守护', '主人', '荣幸'],
            pet_sad: ['...', '忠诚', '守护', '...', '主人'],
            play_excited: ['全力', '保护', '忠诚', '并肩', '永远'],
            play_normal: ['服从', '全力', '保护', '忠诚', '并肩'],
            play_tired: ['累', '但忠诚', '守护', '...', '坚持'],
            clean_willing: ['感谢', '忠诚', '干净', '守护', '主人'],
            clean_unwilling: ['...', '服从', '忠诚', '...', '接受'],
            feed_full: ['感谢', '已饱', '留着', '为主人省着', '忠诚'],
            feed_normal: ['感谢', '好吃', '感恩', '有力气', '忠诚'],
            feed_hungry: ['感谢', '终于', '饿坏了', '有力气了', '感恩'],
            sleep_energetic: ['守护', '待命', '不困', '警觉', '忠诚'],
            sleep_normal: ['守护', '待命', 'ZZZ...', '警觉', '忠诚'],
            sleep_tired: ['终于', '累', '守护', '待命', '忠诚'],
            pet_happy: ['荣幸', '忠诚', '感恩', '守护', '主人'],
            pet_normal: ['感谢', '忠诚', '守护', '主人', '荣幸'],
            pet_sad: ['...', '忠诚', '守护', '...', '主人'],
            play_excited: ['全力', '保护', '忠诚', '并肩', '永远'],
            play_normal: ['服从', '全力', '保护', '忠诚', '并肩'],
            play_tired: ['累', '但忠诚', '守护', '...', '坚持'],
            clean_willing: ['感谢', '忠诚', '干净', '守护', '主人'],
            clean_unwilling: ['...', '服从', '忠诚', '...', '接受'],
            feed_full: ['感谢', '已饱', '留着', '为主人省着', '忠诚'],
            feed_normal: ['感谢', '好吃', '感恩', '有力气', '忠诚'],
            feed_hungry: ['感谢', '终于', '饿坏了', '有力气了', '感恩'],
            sleep_energetic: ['守护', '待命', '不困', '警觉', '忠诚'],
            sleep_normal: ['守护', '待命', 'ZZZ...', '警觉', '忠诚'],
            sleep_tired: ['终于', '累', '守护', '待命', '忠诚'],
            pet_happy: ['荣幸', '忠诚', '感恩', '守护', '主人'],
            pet_normal: ['感谢', '忠诚', '守护', '主人', '荣幸'],
            pet_sad: ['...', '忠诚', '守护', '...', '主人'],
            play_excited: ['全力', '保护', '忠诚', '并肩', '永远'],
            play_normal: ['服从', '全力', '保护', '忠诚', '并肩'],
            play_tired: ['累', '但忠诚', '守护', '...', '坚持'],
            clean_willing: ['感谢', '忠诚', '干净', '守护', '主人'],
            clean_unwilling: ['...', '服从', '忠诚', '...', '接受'],
            feed_full: ['感谢', '已饱', '留着', '为主人省着', '忠诚'],
            feed_normal: ['感谢', '好吃', '感恩', '有力气', '忠诚'],
            feed_hungry: ['感谢', '终于', '饿坏了', '有力气了', '感恩'],
            sleep_energetic: ['守护', '待命', '不困', '警觉', '忠诚'],
            sleep_normal: ['守护', '待命', 'ZZZ...', '警觉', '忠诚'],
            sleep_tired: ['终于', '累', '守护', '待命', '忠诚'],
            pet_happy: ['荣幸', '忠诚', '感恩', '守护', '主人'],
            pet_normal: ['感谢', '忠诚', '守护', '主人', '荣幸'],
            pet_sad: ['...', '忠诚', '守护', '...', '主人'],
            play_excited: ['全力', '保护', '忠诚', '并肩', '永远'],
            play_normal: ['服从', '全力', '保护', '忠诚', '并肩'],
            play_tired: ['累', '但忠诚', '守护', '...', '坚持'],
            clean_willing: ['感谢', '忠诚', '干净', '守护', '主人'],
            clean_unwilling: ['...', '服从', '忠诚', '...', '接受'],
            feed_full: ['感谢主人', '已饱', '留着', '为主人省着', '忠诚'],
            feed_normal: ['感谢', '好吃', '感恩', '有力气', '忠诚'],
            feed_hungry: ['感谢主人', '终于', '饿坏了', '有力气了', '感恩'],
            sleep_energetic: ['守护', '待命', '不困', '警觉', '忠诚'],
            sleep_normal: ['守护', '待命', 'ZZZ...', '警觉', '忠诚'],
            sleep_tired: ['终于', '累', '守护', '待命', '忠诚'],
            pet_happy: ['荣幸', '忠诚', '感恩', '守护', '主人'],
            pet_normal: ['感谢', '忠诚', '守护', '主人', '荣幸'],
            pet_sad: ['...', '忠诚', '守护', '...', '主人'],
            play_excited: ['全力', '保护', '忠诚', '并肩', '永远'],
            play_normal: ['服从', '全力', '保护', '忠诚', '并肩'],
            play_tired: ['累', '但忠诚', '守护', '...', '坚持'],
            clean_willing: ['感谢', '忠诚', '干净', '守护', '主人'],
            clean_unwilling: ['...', '服从', '忠诚', '...', '接受']
        },
        // 高冷
        高冷: {
            normal: ['...', '有事？', '别烦我', '我自己很好', '不需要你'],
            feed: ['...还行', '放那儿', '勉强接受', '...谢谢', '下次换口味'],
            pet: ['...可以', '别太久', '...还行', '够了', '...'],
            play: ['无聊', '幼稚', '...随便', '陪你一下', '结束了吗'],
            sleep: ['...ZZZ', '别吵', '...睡了', '...', '晚安'],
            clean: ['...还行', '快结束', '...可以', '...', '好了吗'],
            feed_full: ['...不饿', '拿走', '...', '不需要', '...'],
            feed_normal: ['...还行', '...', '一般', '...', '凑合'],
            feed_hungry: ['...终于', '...饿', '...吃', '...', '...'],
            sleep_energetic: ['...不困', '...', '别烦', '...', '...'],
            sleep_normal: ['...睡了', '...', '别吵', '...', '...'],
            sleep_tired: ['...终于', '...累', '...', '...', '...'],
            pet_happy: ['...可以', '...还行', '...', '...', '...'],
            pet_normal: ['...', '...行', '...', '...', '...'],
            pet_sad: ['...', '...', '...', '...', '...'],
            play_excited: ['...无聊', '...稚', '...', '...', '...'],
            play_normal: ['...无聊', '...', '...', '...', '...'],
            play_tired: ['...累', '...', '...', '...', '...'],
            clean_willing: ['...还行', '...', '...', '...', '...'],
            clean_unwilling: ['...', '...烦', '...', '...', '...'],
            feed_full: ['...不饿', '拿走', '...', '不需要', '...'],
            feed_normal: ['...还行', '...', '一般', '...', '凑合'],
            feed_hungry: ['...终于', '...饿', '...吃', '...', '...'],
            sleep_energetic: ['...不困', '...', '别烦', '...', '...'],
            sleep_normal: ['...睡了', '...', '别吵', '...', '...'],
            sleep_tired: ['...终于', '...累', '...', '...', '...'],
            pet_happy: ['...可以', '...还行', '...', '...', '...'],
            pet_normal: ['...', '...行', '...', '...', '...'],
            pet_sad: ['...', '...', '...', '...', '...'],
            play_excited: ['...无聊', '...稚', '...', '...', '...'],
            play_normal: ['...无聊', '...', '...', '...', '...'],
            play_tired: ['...累', '...', '...', '...', '...'],
            clean_willing: ['...还行', '...', '...', '...', '...'],
            clean_unwilling: ['...', '...烦', '...', '...', '...'],
            feed_full: ['...不饿', '拿走', '...', '不需要', '...'],
            feed_normal: ['...还行', '...', '一般', '...', '凑合'],
            feed_hungry: ['...终于', '...饿', '...吃', '...', '...'],
            sleep_energetic: ['...不困', '...', '别烦', '...', '...'],
            sleep_normal: ['...睡了', '...', '别吵', '...', '...'],
            sleep_tired: ['...终于', '...累', '...', '...', '...'],
            pet_happy: ['...可以', '...还行', '...', '...', '...'],
            pet_normal: ['...', '...行', '...', '...', '...'],
            pet_sad: ['...', '...', '...', '...', '...'],
            play_excited: ['...无聊', '...稚', '...', '...', '...'],
            play_normal: ['...无聊', '...', '...', '...', '...'],
            play_tired: ['...累', '...', '...', '...', '...'],
            clean_willing: ['...还行', '...', '...', '...', '...'],
            clean_unwilling: ['...', '...烦', '...', '...', '...'],
            feed_full: ['...不饿', '拿走', '...', '不需要', '...'],
            feed_normal: ['...还行', '...', '一般', '...', '凑合'],
            feed_hungry: ['...终于', '...饿', '...吃', '...', '...'],
            sleep_energetic: ['...不困', '...', '别烦', '...', '...'],
            sleep_normal: ['...睡了', '...', '别吵', '...', '...'],
            sleep_tired: ['...终于', '...累', '...', '...', '...'],
            pet_happy: ['...可以', '...还行', '...', '...', '...'],
            pet_normal: ['...', '...行', '...', '...', '...'],
            pet_sad: ['...', '...', '...', '...', '...'],
            play_excited: ['...无聊', '...稚', '...', '...', '...'],
            play_normal: ['...无聊', '...', '...', '...', '...'],
            play_tired: ['...累', '...', '...', '...', '...'],
            clean_willing: ['...还行', '...', '...', '...', '...'],
            clean_unwilling: ['...', '...烦', '...', '...', '...'],
            feed_full: ['...不饿', '拿走', '...', '不需要', '...'],
            feed_normal: ['...还行', '...', '一般', '...', '凑合'],
            feed_hungry: ['...终于', '...饿', '...吃', '...', '...'],
            sleep_energetic: ['...不困', '...', '别烦', '...', '...'],
            sleep_normal: ['...睡了', '...', '别吵', '...', '...'],
            sleep_tired: ['...终于', '...累', '...', '...', '...'],
            pet_happy: ['...可以', '...还行', '...', '...', '...'],
            pet_normal: ['...', '...行', '...', '...', '...'],
            pet_sad: ['...', '...', '...', '...', '...'],
            play_excited: ['...无聊', '...稚', '...', '...', '...'],
            play_normal: ['...无聊', '...', '...', '...', '...'],
            play_tired: ['...累', '...', '...', '...', '...'],
            clean_willing: ['...还行', '...', '...', '...', '...'],
            clean_unwilling: ['...', '...烦', '...', '...', '...'],
            feed_full: ['...不饿', '拿走', '...', '不需要', '...'],
            feed_normal: ['...还行', '...', '一般', '...', '凑合'],
            feed_hungry: ['...终于', '...饿', '...吃', '...', '...'],
            sleep_energetic: ['...不困', '...', '别烦', '...', '...'],
            sleep_normal: ['...睡了', '...', '别吵', '...', '...'],
            sleep_tired: ['...终于', '...累', '...', '...', '...'],
            pet_happy: ['...可以', '...还行', '...', '...', '...'],
            pet_normal: ['...', '...行', '...', '...', '...'],
            pet_sad: ['...', '...', '...', '...', '...'],
            play_excited: ['...无聊', '...稚', '...', '...', '...'],
            play_normal: ['...无聊', '...', '...', '...', '...'],
            play_tired: ['...累', '...', '...', '...', '...'],
            clean_willing: ['...还行', '...', '...', '...', '...'],
            clean_unwilling: ['...', '...烦', '...', '...', '...'],
            feed_full: ['...不饿', '拿走', '...', '不需要', '...'],
            feed_normal: ['...还行', '...', '一般', '...', '凑合'],
            feed_hungry: ['...终于', '...饿', '...吃', '...', '...'],
            sleep_energetic: ['...不困', '...', '别烦', '...', '...'],
            sleep_normal: ['...睡了', '...', '别吵', '...', '...'],
            sleep_tired: ['...终于', '...累', '...', '...', '...'],
            pet_happy: ['...可以', '...还行', '...', '...', '...'],
            pet_normal: ['...', '...行', '...', '...', '...'],
            pet_sad: ['...', '...', '...', '...', '...'],
            play_excited: ['...无聊', '...稚', '...', '...', '...'],
            play_normal: ['...无聊', '...', '...', '...', '...'],
            play_tired: ['...累', '...', '...', '...', '...'],
            clean_willing: ['...还行', '...', '...', '...', '...'],
            clean_unwilling: ['...', '...烦', '...', '...', '...'],
            feed_full: ['...不饿', '拿走', '...', '不需要', '...'],
            feed_normal: ['...还行', '...', '一般', '...', '凑合'],
            feed_hungry: ['...终于', '...饿', '...吃', '...', '...'],
            sleep_energetic: ['...不困', '...', '别烦', '...', '...'],
            sleep_normal: ['...睡了', '...', '别吵', '...', '...'],
            sleep_tired: ['...终于', '...累', '...', '...', '...'],
            pet_happy: ['...可以', '...还行', '...', '...', '...'],
            pet_normal: ['...', '...行', '...', '...', '...'],
            pet_sad: ['...', '...', '...', '...', '...'],
            play_excited: ['...无聊', '...幼稚', '...', '...', '...'],
            play_normal: ['...无聊', '...', '...', '...', '...'],
            play_tired: ['...累', '...', '...', '...', '...'],
            clean_willing: ['...还行', '...', '...', '...', '...'],
            clean_unwilling: ['...', '...烦', '...', '...', '...']
        },
        // 粘人
        粘人: {
            normal: ['不要走！', '抱抱我！', '去哪里都跟着', '不要离开我', '贴贴~'],
            feed: ['一起吃嘛', '喂我~', '看着你吃', '吃完还要抱', '不要走嘛'],
            pet: ['永远这样好嘛', '不要停~', '最喜欢这样了', '只对你这样', '永远在一起'],
            play: ['玩一辈子', '不要结束', '再玩一次', '一直陪着我', '最开心了'],
            sleep: ['抱着我睡...', '别离开我...', '一起睡嘛...', '梦里也要一起...', '贴贴睡...'],
            clean: ['陪着我洗...', '别走...', '一起洗澡...', '洗完抱抱...', '不要离开我...'],
            feed_full: ['不饿...但要陪', '一起吃嘛', '别走...', '贴贴...', '陪着我...'],
            feed_normal: ['一起吃~', '喂我~', '别走~', '贴贴~', '陪着我~'],
            feed_hungry: ['终于...', '饿...别走', '好吃...陪我', '谢谢...贴贴', '饿坏了...'],
            sleep_energetic: ['不想睡...要陪', '别走...', '一起...', '贴贴...', '陪着我...'],
            sleep_normal: ['一起睡...', '别离开...', '贴贴...', '陪着我...', '梦里一起...'],
            sleep_tired: ['终于...一起', '累...别走', '贴贴睡...', '陪着我...', '一起...'],
            pet_happy: ['永远...', '别停...', '贴贴...', '陪着我...', '最喜欢...'],
            pet_normal: ['陪着我...', '别走...', '贴贴...', '一起...', '永远...'],
            pet_sad: ['...别走', '...陪着我', '...', '...贴贴', '...'],
            play_excited: ['一辈子！', '别完！', '陪着我！', '最开心！', '永远！'],
            play_normal: ['陪着我！', '别走！', '一起！', '永远！', '贴贴！'],
            play_tired: ['累了...陪着', '别走...', '...一起', '...贴贴', '...'],
            clean_willing: ['陪着我...', '一起...', '贴贴...', '别走...', '永远...'],
            clean_unwilling: ['...别走', '...陪着我', '...', '...一起', '...'],
            feed_full: ['不饿...但要陪', '一起吃嘛', '别走...', '贴贴...', '陪着我...'],
            feed_normal: ['一起吃~', '喂我~', '别走~', '贴贴~', '陪着我~'],
            feed_hungry: ['终于...', '饿...别走', '好吃...陪我', '谢谢...贴贴', '饿坏了...'],
            sleep_energetic: ['不想睡...要陪', '别走...', '一起...', '贴贴...', '陪着我...'],
            sleep_normal: ['一起睡...', '别离开...', '贴贴...', '陪着我...', '梦里一起...'],
            sleep_tired: ['终于...一起', '累...别走', '贴贴睡...', '陪着我...', '一起...'],
            pet_happy: ['永远...', '别停...', '贴贴...', '陪着我...', '最喜欢...'],
            pet_normal: ['陪着我...', '别走...', '贴贴...', '一起...', '永远...'],
            pet_sad: ['...别走', '...陪着我', '...', '...贴贴', '...'],
            play_excited: ['一辈子！', '别完！', '陪着我！', '最开心！', '永远！'],
            play_normal: ['陪着我！', '别走！', '一起！', '永远！', '贴贴！'],
            play_tired: ['累了...陪着', '别走...', '...一起', '...贴贴', '...'],
            clean_willing: ['陪着我...', '一起...', '贴贴...', '别走...', '永远...'],
            clean_unwilling: ['...别走', '...陪着我', '...', '...一起', '...'],
            feed_full: ['不饿...但要陪', '一起吃嘛', '别走...', '贴贴...', '陪着我...'],
            feed_normal: ['一起吃~', '喂我~', '别走~', '贴贴~', '陪着我~'],
            feed_hungry: ['终于...', '饿...别走', '好吃...陪我', '谢谢...贴贴', '饿坏了...'],
            sleep_energetic: ['不想睡...要陪', '别走...', '一起...', '贴贴...', '陪着我...'],
            sleep_normal: ['一起睡...', '别离开...', '贴贴...', '陪着我...', '梦里一起...'],
            sleep_tired: ['终于...一起', '累...别走', '贴贴睡...', '陪着我...', '一起...'],
            pet_happy: ['永远...', '别停...', '贴贴...', '陪着我...', '最喜欢...'],
            pet_normal: ['陪着我...', '别走...', '贴贴...', '一起...', '永远...'],
            pet_sad: ['...别走', '...陪着我', '...', '...贴贴', '...'],
            play_excited: ['一辈子！', '别完！', '陪着我！', '最开心！', '永远！'],
            play_normal: ['陪着我！', '别走！', '一起！', '永远！', '贴贴！'],
            play_tired: ['累了...陪着', '别走...', '...一起', '...贴贴', '...'],
            clean_willing: ['陪着我...', '一起...', '贴贴...', '别走...', '永远...'],
            clean_unwilling: ['...别走', '...陪着我', '...', '...一起', '...'],
            feed_full: ['不饿...但要陪', '一起吃嘛', '别走...', '贴贴...', '陪着我...'],
            feed_normal: ['一起吃~', '喂我~', '别走~', '贴贴~', '陪着我~'],
            feed_hungry: ['终于...', '饿...别走', '好吃...陪我', '谢谢...贴贴', '饿坏了...'],
            sleep_energetic: ['不想睡...要陪', '别走...', '一起...', '贴贴...', '陪着我...'],
            sleep_normal: ['一起睡...', '别离开...', '贴贴...', '陪着我...', '梦里一起...'],
            sleep_tired: ['终于...一起', '累...别走', '贴贴睡...', '陪着我...', '一起...'],
            pet_happy: ['永远...', '别停...', '贴贴...', '陪着我...', '最喜欢...'],
            pet_normal: ['陪着我...', '别走...', '贴贴...', '一起...', '永远...'],
            pet_sad: ['...别走', '...陪着我', '...', '...贴贴', '...'],
            play_excited: ['一辈子！', '别完！', '陪着我！', '最开心！', '永远！'],
            play_normal: ['陪着我！', '别走！', '一起！', '永远！', '贴贴！'],
            play_tired: ['累了...陪着', '别走...', '...一起', '...贴贴', '...'],
            clean_willing: ['陪着我...', '一起...', '贴贴...', '别走...', '永远...'],
            clean_unwilling: ['...别走', '...陪着我', '...', '...一起', '...'],
            feed_full: ['不饿...但要陪', '一起吃嘛', '别走...', '贴贴...', '陪着我...'],
            feed_normal: ['一起吃~', '喂我~', '别走~', '贴贴~', '陪着我~'],
            feed_hungry: ['终于...', '饿...别走', '好吃...陪我', '谢谢...贴贴', '饿坏了...'],
            sleep_energetic: ['不想睡...要陪', '别走...', '一起...', '贴贴...', '陪着我...'],
            sleep_normal: ['一起睡...', '别离开...', '贴贴...', '陪着我...', '梦里一起...'],
            sleep_tired: ['终于...一起', '累...别走', '贴贴睡...', '陪着我...', '一起...'],
            pet_happy: ['永远...', '别停...', '贴贴...', '陪着我...', '最喜欢...'],
            pet_normal: ['陪着我...', '别走...', '贴贴...', '一起...', '永远...'],
            pet_sad: ['...别走', '...陪着我', '...', '...贴贴', '...'],
            play_excited: ['一辈子！', '别完！', '陪着我！', '最开心！', '永远！'],
            play_normal: ['陪着我！', '别走！', '一起！', '永远！', '贴贴！'],
            play_tired: ['累了...陪着', '别走...', '...一起', '...贴贴', '...'],
            clean_willing: ['陪着我...', '一起...', '贴贴...', '别走...', '永远...'],
            clean_unwilling: ['...别走', '...陪着我', '...', '...一起', '...'],
            feed_full: ['不饿...但要陪', '一起吃嘛', '别走...', '贴贴...', '陪着我...'],
            feed_normal: ['一起吃~', '喂我~', '别走~', '贴贴~', '陪着我~'],
            feed_hungry: ['终于...', '饿...别走', '好吃...陪我', '谢谢...贴贴', '饿坏了...'],
            sleep_energetic: ['不想睡...要陪', '别走...', '一起...', '贴贴...', '陪着我...'],
            sleep_normal: ['一起睡...', '别离开...', '贴贴...', '陪着我...', '梦里一起...'],
            sleep_tired: ['终于...一起', '累...别走', '贴贴睡...', '陪着我...', '一起...'],
            pet_happy: ['永远...', '别停...', '贴贴...', '陪着我...', '最喜欢...'],
            pet_normal: ['陪着我...', '别走...', '贴贴...', '一起...', '永远...'],
            pet_sad: ['...别走', '...陪着我', '...', '...贴贴', '...'],
            play_excited: ['一辈子！', '别完！', '陪着我！', '最开心！', '永远！'],
            play_normal: ['陪着我！', '别走！', '一起！', '永远！', '贴贴！'],
            play_tired: ['累了...陪着', '别走...', '...一起', '...贴贴', '...'],
            clean_willing: ['陪着我...', '一起...', '贴贴...', '别走...', '永远...'],
            clean_unwilling: ['...别走', '...陪着我', '...', '...一起', '...'],
            feed_full: ['不饿...但要陪', '一起吃嘛', '别走...', '贴贴...', '陪着我...'],
            feed_normal: ['一起吃~', '喂我~', '别走~', '贴贴~', '陪着我~'],
            feed_hungry: ['终于...', '饿...别走', '好吃...陪我', '谢谢...贴贴', '饿坏了...'],
            sleep_energetic: ['不想睡...要陪', '别走...', '一起...', '贴贴...', '陪着我...'],
            sleep_normal: ['一起睡...', '别离开...', '贴贴...', '陪着我...', '梦里一起...'],
            sleep_tired: ['终于...一起', '累...别走', '贴贴睡...', '陪着我...', '一起...'],
            pet_happy: ['永远...', '别停...', '贴贴...', '陪着我...', '最喜欢...'],
            pet_normal: ['陪着我...', '别走...', '贴贴...', '一起...', '永远...'],
            pet_sad: ['...别走', '...陪着我', '...', '...贴贴', '...'],
            play_excited: ['一辈子！', '别完！', '陪着我！', '最开心！', '永远！'],
            play_normal: ['陪着我！', '别走！', '一起！', '永远！', '贴贴！'],
            play_tired: ['累了...陪着', '别走...', '...一起', '...贴贴', '...'],
            clean_willing: ['陪着我...', '一起...', '贴贴...', '别走...', '永远...'],
            clean_unwilling: ['...别走', '...陪着我', '...', '...一起', '...'],
            feed_full: ['不饿...但要陪', '一起吃嘛', '别走...', '贴贴...', '陪着我...'],
            feed_normal: ['一起吃~', '喂我~', '别走~', '贴贴~', '陪着我~'],
            feed_hungry: ['终于...', '饿...别走', '好吃...陪我', '谢谢...贴贴', '饿坏了...'],
            sleep_energetic: ['不想睡...要陪', '别走...', '一起...', '贴贴...', '陪着我...'],
            sleep_normal: ['一起睡...', '别离开...', '贴贴...', '陪着我...', '梦里一起...'],
            sleep_tired: ['终于...一起', '累...别走', '贴贴睡...', '陪着我...', '一起...'],
            pet_happy: ['永远...', '别停...', '贴贴...', '陪着我...', '最喜欢...'],
            pet_normal: ['陪着我...', '别走...', '贴贴...', '一起...', '永远...'],
            pet_sad: ['...别走', '...陪着我', '...', '...贴贴', '...'],
            play_excited: ['一辈子！', '别结束！', '陪着我！', '最开心！', '永远！'],
            play_normal: ['陪着我！', '别走！', '一起！', '永远！', '贴贴！'],
            play_tired: ['累了...陪着', '别走...', '...一起', '...贴贴', '...'],
            clean_willing: ['陪着我...', '一起...', '贴贴...', '别走...', '永远...'],
            clean_unwilling: ['...别走', '...陪着我', '...', '...一起', '...']
        },
        // 好奇
        好奇: {
            normal: ['这是什么？', '那个呢？', '让我看看', '闻闻~', '新世界！'],
            feed: ['这是什么味道？', '尝尝看~', '好吃吗？', '再闻闻', '有趣的味道'],
            pet: ['这是什么手法？', '好神奇~', '再摸摸', '感觉不一样', '好奇妙'],
            play: ['新玩具！', '怎么玩？', '试试看~', '发现新玩法！', '真有趣！'],
            sleep: ['梦里探索...', 'ZZZ...那是什么...', '明天去发现...', '好奇梦里有什么...', '睡醒了去探索...'],
            clean: ['这是什么沐浴露？', '水为什么是湿的？', '泡泡好奇妙！', '洗干净去探索！', '发现新感觉！'],
            feed_full: ['什么？不饿', '闻闻...', '看看...', '不饿但好奇', '...'],
            feed_normal: ['什么味道？', '尝尝~', '好吃~', '有趣~', '再来~'],
            feed_hungry: ['终于！', '什么味道？', '好吃！', '饿坏了！', '有趣！'],
            sleep_energetic: ['不想睡！探索！', '那是什么？', '再看看...', '好奇...', '...'],
            sleep_normal: ['梦里探索...', 'ZZZ...', '明天...', '好奇...', '睡...'],
            sleep_tired: ['终于...', '累...', '梦里...', '...', '探索...'],
            pet_happy: ['神奇！', '什么手法？', '再摸摸！', '好奇妙！', '有趣！'],
            pet_normal: ['什么？', '好奇...', '再试试...', '...', '嗯...'],
            pet_sad: ['...', '好奇...', '...', '...', '...'],
            play_excited: ['新玩法！', '怎么玩？', '有趣！', '发现！', '真棒！'],
            play_normal: ['怎么玩？', '试试...', '有趣...', '...', '嗯...'],
            play_tired: ['累了...', '但好奇...', '...', '...', '...'],
            clean_willing: ['什么沐浴露？', '泡泡！', '水！', '干净！', '有趣！'],
            clean_unwilling: ['...', '水...', '...', '...', '...'],
            feed_full: ['什么？不饿', '闻闻...', '看看...', '不饿但好奇', '...'],
            feed_normal: ['什么味道？', '尝尝~', '好吃~', '有趣~', '再来~'],
            feed_hungry: ['终于！', '什么味道？', '好吃！', '饿坏了！', '有趣！'],
            sleep_energetic: ['不想睡！探索！', '那是什么？', '再看看...', '好奇...', '...'],
            sleep_normal: ['梦里探索...', 'ZZZ...', '明天...', '好奇...', '睡...'],
            sleep_tired: ['终于...', '累...', '梦里...', '...', '探索...'],
            pet_happy: ['神奇！', '什么手法？', '再摸摸！', '好奇妙！', '有趣！'],
            pet_normal: ['什么？', '好奇...', '再试试...', '...', '嗯...'],
            pet_sad: ['...', '好奇...', '...', '...', '...'],
            play_excited: ['新玩法！', '怎么玩？', '有趣！', '发现！', '真棒！'],
            play_normal: ['怎么玩？', '试试...', '有趣...', '...', '嗯...'],
            play_tired: ['累了...', '但好奇...', '...', '...', '...'],
            clean_willing: ['什么沐浴露？', '泡泡！', '水！', '干净！', '有趣！'],
            clean_unwilling: ['...', '水...', '...', '...', '...'],
            feed_full: ['什么？不饿', '闻闻...', '看看...', '不饿但好奇', '...'],
            feed_normal: ['什么味道？', '尝尝~', '好吃~', '有趣~', '再来~'],
            feed_hungry: ['终于！', '什么味道？', '好吃！', '饿坏了！', '有趣！'],
            sleep_energetic: ['不想睡！探索！', '那是什么？', '再看看...', '好奇...', '...'],
            sleep_normal: ['梦里探索...', 'ZZZ...', '明天...', '好奇...', '睡...'],
            sleep_tired: ['终于...', '累...', '梦里...', '...', '探索...'],
            pet_happy: ['神奇！', '什么手法？', '再摸摸！', '好奇妙！', '有趣！'],
            pet_normal: ['什么？', '好奇...', '再试试...', '...', '嗯...'],
            pet_sad: ['...', '好奇...', '...', '...', '...'],
            play_excited: ['新玩法！', '怎么玩？', '有趣！', '发现！', '真棒！'],
            play_normal: ['怎么玩？', '试试...', '有趣...', '...', '嗯...'],
            play_tired: ['累了...', '但好奇...', '...', '...', '...'],
            clean_willing: ['什么沐浴露？', '泡泡！', '水！', '干净！', '有趣！'],
            clean_unwilling: ['...', '水...', '...', '...', '...'],
            feed_full: ['什么？不饿', '闻闻...', '看看...', '不饿但好奇', '...'],
            feed_normal: ['什么味道？', '尝尝~', '好吃~', '有趣~', '再来~'],
            feed_hungry: ['终于！', '什么味道？', '好吃！', '饿坏了！', '有趣！'],
            sleep_energetic: ['不想睡！探索！', '那是什么？', '再看看...', '好奇...', '...'],
            sleep_normal: ['梦里探索...', 'ZZZ...', '明天...', '好奇...', '睡...'],
            sleep_tired: ['终于...', '累...', '梦里...', '...', '探索...'],
            pet_happy: ['神奇！', '什么手法？', '再摸摸！', '好奇妙！', '有趣！'],
            pet_normal: ['什么？', '好奇...', '再试试...', '...', '嗯...'],
            pet_sad: ['...', '好奇...', '...', '...', '...'],
            play_excited: ['新玩法！', '怎么玩？', '有趣！', '发现！', '真棒！'],
            play_normal: ['怎么玩？', '试试...', '有趣...', '...', '嗯...'],
            play_tired: ['累了...', '但好奇...', '...', '...', '...'],
            clean_willing: ['什么沐浴露？', '泡泡！', '水！', '干净！', '有趣！'],
            clean_unwilling: ['...', '水...', '...', '...', '...'],
            feed_full: ['什么？不饿', '闻闻...', '看看...', '不饿但好奇', '...'],
            feed_normal: ['什么味道？', '尝尝~', '好吃~', '有趣~', '再来~'],
            feed_hungry: ['终于！', '什么味道？', '好吃！', '饿坏了！', '有趣！'],
            sleep_energetic: ['不想睡！探索！', '那是什么？', '再看看...', '好奇...', '...'],
            sleep_normal: ['梦里探索...', 'ZZZ...', '明天...', '好奇...', '睡...'],
            sleep_tired: ['终于...', '累...', '梦里...', '...', '探索...'],
            pet_happy: ['神奇！', '什么手法？', '再摸摸！', '好奇妙！', '有趣！'],
            pet_normal: ['什么？', '好奇...', '再试试...', '...', '嗯...'],
            pet_sad: ['...', '好奇...', '...', '...', '...'],
            play_excited: ['新玩法！', '怎么玩？', '有趣！', '发现！', '真棒！'],
            play_normal: ['怎么玩？', '试试...', '有趣...', '...', '嗯...'],
            play_tired: ['累了...', '但好奇...', '...', '...', '...'],
            clean_willing: ['什么沐浴露？', '泡泡！', '水！', '干净！', '有趣！'],
            clean_unwilling: ['...', '水...', '...', '...', '...'],
            feed_full: ['什么？不饿', '闻闻...', '看看...', '不饿但好奇', '...'],
            feed_normal: ['什么味道？', '尝尝~', '好吃~', '有趣~', '再来~'],
            feed_hungry: ['终于！', '什么味道？', '好吃！', '饿坏了！', '有趣！'],
            sleep_energetic: ['不想睡！探索！', '那是什么？', '再看看...', '好奇...', '...'],
            sleep_normal: ['梦里探索...', 'ZZZ...', '明天...', '好奇...', '睡...'],
            sleep_tired: ['终于...', '累...', '梦里...', '...', '探索...'],
            pet_happy: ['神奇！', '什么手法？', '再摸摸！', '好奇妙！', '有趣！'],
            pet_normal: ['什么？', '好奇...', '再试试...', '...', '嗯...'],
            pet_sad: ['...', '好奇...', '...', '...', '...'],
            play_excited: ['新玩法！', '怎么玩？', '有趣！', '发现！', '真棒！'],
            play_normal: ['怎么玩？', '试试...', '有趣...', '...', '嗯...'],
            play_tired: ['累了...', '但好奇...', '...', '...', '...'],
            clean_willing: ['什么沐浴露？', '泡泡！', '水！', '干净！', '有趣！'],
            clean_unwilling: ['...', '水...', '...', '...', '...'],
            feed_full: ['什么？不饿', '闻闻...', '看看...', '不饿但好奇', '...'],
            feed_normal: ['什么味道？', '尝尝~', '好吃~', '有趣~', '再来~'],
            feed_hungry: ['终于！', '什么味道？', '好吃！', '饿坏了！', '有趣！'],
            sleep_energetic: ['不想睡！探索！', '那是什么？', '再看看...', '好奇...', '...'],
            sleep_normal: ['梦里探索...', 'ZZZ...', '明天...', '好奇...', '睡...'],
            sleep_tired: ['终于...', '累...', '梦里...', '...', '探索...'],
            pet_happy: ['神奇！', '什么手法？', '再摸摸！', '好奇妙！', '有趣！'],
            pet_normal: ['什么？', '好奇...', '再试试...', '...', '嗯...'],
            pet_sad: ['...', '好奇...', '...', '...', '...'],
            play_excited: ['新玩法！', '怎么玩？', '有趣！', '发现！', '真棒！'],
            play_normal: ['怎么玩？', '试试...', '有趣...', '...', '嗯...'],
            play_tired: ['累了...', '但好奇...', '...', '...', '...'],
            clean_willing: ['什么沐浴露？', '泡泡！', '水！', '干净！', '有趣！'],
            clean_unwilling: ['...', '水...', '...', '...', '...'],
            feed_full: ['这是什么？不饿', '闻闻...', '看看...', '不饿但好奇', '...'],
            feed_normal: ['什么味道？', '尝尝~', '好吃~', '有趣~', '再来~'],
            feed_hungry: ['终于！', '什么味道？', '好吃！', '饿坏了！', '有趣！'],
            sleep_energetic: ['不想睡！探索！', '那是什么？', '再看看...', '好奇...', '...'],
            sleep_normal: ['梦里探索...', 'ZZZ...', '明天...', '好奇...', '睡...'],
            sleep_tired: ['终于...', '累...', '梦里...', '...', '探索...'],
            pet_happy: ['神奇！', '什么手法？', '再摸摸！', '好奇妙！', '有趣！'],
            pet_normal: ['什么？', '好奇...', '再试试...', '...', '嗯...'],
            pet_sad: ['...', '好奇...', '...', '...', '...'],
            play_excited: ['新玩法！', '怎么玩？', '有趣！', '发现！', '真棒！'],
            play_normal: ['怎么玩？', '试试...', '有趣...', '...', '嗯...'],
            play_tired: ['累了...', '但好奇...', '...', '...', '...'],
            clean_willing: ['什么沐浴露？', '泡泡！', '水！', '干净！', '有趣！'],
            clean_unwilling: ['...', '水...', '...', '...', '...']
        },
        // 优雅
        优雅: {
            normal: ['午安，主人', '今日阳光正好', '保持优雅', '从容不迫', '风度翩翩'],
            feed: ['品味不错', '恰到好处', '优雅地享用', '感谢款待', '美味佳肴'],
            pet: ['手法尚可', '请继续', '优雅的时刻', '令人愉悦', '恰到好处'],
            play: ['有格调的游戏', '优雅地玩耍', '不失风度', '从容应对', '愉快的时光'],
            sleep: ['优雅地入睡', '晚安，主人', '好梦', '从容地休息', '安详的睡眠'],
            clean: ['优雅地沐浴', '保持洁净', '感谢清洗', '焕然一新', '清爽宜人'],
            feed_full: ['已饱，谢了', '无需更多', '恰到好处', '优雅地拒绝', '谢了'],
            feed_normal: ['味好', '恰到好处', '雅', '谢', '美味'],
            feed_hungry: ['终于', '恰到好处', '雅吃', '谢', '美味'],
            sleep_energetic: ['尚不困', '容', '雅', '再等等', '度'],
            sleep_normal: ['该休息了', '雅入睡', '晚安', '容', '安详'],
            sleep_tired: ['终于', '累了', '雅入睡', '安详', '休息'],
            pet_happy: ['悦', '恰到好处', '雅', '继', '适'],
            pet_normal: ['尚可', '继', '雅', '...', '嗯'],
            pet_sad: ['...', '雅', '...', '...', '...'],
            play_excited: ['快', '格调', '雅', '容', '度'],
            play_normal: ['尚可', '雅', '容', '...', '嗯'],
            play_tired: ['累了', '但雅', '容', '...', '度'],
            clean_willing: ['雅', '谢', '洁净', '爽', '适'],
            clean_unwilling: ['...', '容', '...', '...', '...'],
            feed_full: ['已饱，谢了', '无需更多', '恰到好处', '优雅地拒绝', '谢了'],
            feed_normal: ['味好', '恰到好处', '雅', '谢', '美味'],
            feed_hungry: ['终于', '恰到好处', '雅吃', '谢', '美味'],
            sleep_energetic: ['尚不困', '容', '雅', '再等等', '度'],
            sleep_normal: ['该休息了', '雅入睡', '晚安', '容', '安详'],
            sleep_tired: ['终于', '累了', '雅入睡', '安详', '休息'],
            pet_happy: ['悦', '恰到好处', '雅', '继', '适'],
            pet_normal: ['尚可', '继', '雅', '...', '嗯'],
            pet_sad: ['...', '雅', '...', '...', '...'],
            play_excited: ['快', '格调', '雅', '容', '度'],
            play_normal: ['尚可', '雅', '容', '...', '嗯'],
            play_tired: ['累了', '但雅', '容', '...', '度'],
            clean_willing: ['雅', '谢', '洁净', '爽', '适'],
            clean_unwilling: ['...', '容', '...', '...', '...'],
            feed_full: ['已饱，谢了', '无需更多', '恰到好处', '优雅地拒绝', '谢了'],
            feed_normal: ['味好', '恰到好处', '雅', '谢', '美味'],
            feed_hungry: ['终于', '恰到好处', '雅吃', '谢', '美味'],
            sleep_energetic: ['尚不困', '容', '雅', '再等等', '度'],
            sleep_normal: ['该休息了', '雅入睡', '晚安', '容', '安详'],
            sleep_tired: ['终于', '累了', '雅入睡', '安详', '休息'],
            pet_happy: ['悦', '恰到好处', '雅', '继', '适'],
            pet_normal: ['尚可', '继', '雅', '...', '嗯'],
            pet_sad: ['...', '雅', '...', '...', '...'],
            play_excited: ['快', '格调', '雅', '容', '度'],
            play_normal: ['尚可', '雅', '容', '...', '嗯'],
            play_tired: ['累了', '但雅', '容', '...', '度'],
            clean_willing: ['雅', '谢', '洁净', '爽', '适'],
            clean_unwilling: ['...', '容', '...', '...', '...'],
            feed_full: ['已饱，谢了', '无需更多', '恰到好处', '优雅地拒绝', '谢了'],
            feed_normal: ['味好', '恰到好处', '雅', '谢', '美味'],
            feed_hungry: ['终于', '恰到好处', '雅吃', '谢', '美味'],
            sleep_energetic: ['尚不困', '容', '雅', '再等等', '度'],
            sleep_normal: ['该休息了', '雅入睡', '晚安', '容', '安详'],
            sleep_tired: ['终于', '累了', '雅入睡', '安详', '休息'],
            pet_happy: ['悦', '恰到好处', '雅', '继', '适'],
            pet_normal: ['尚可', '继', '雅', '...', '嗯'],
            pet_sad: ['...', '雅', '...', '...', '...'],
            play_excited: ['快', '格调', '雅', '容', '度'],
            play_normal: ['尚可', '雅', '容', '...', '嗯'],
            play_tired: ['累了', '但雅', '容', '...', '度'],
            clean_willing: ['雅', '谢', '洁净', '爽', '适'],
            clean_unwilling: ['...', '容', '...', '...', '...'],
            feed_full: ['已饱，谢了', '无需更多', '恰到好处', '优雅地拒绝', '谢了'],
            feed_normal: ['味好', '恰到好处', '雅', '谢', '美味'],
            feed_hungry: ['终于', '恰到好处', '雅吃', '谢', '美味'],
            sleep_energetic: ['尚不困', '容', '雅', '再等等', '度'],
            sleep_normal: ['该休息了', '雅入睡', '晚安', '容', '安详'],
            sleep_tired: ['终于', '累了', '雅入睡', '安详', '休息'],
            pet_happy: ['悦', '恰到好处', '雅', '继', '适'],
            pet_normal: ['尚可', '继', '雅', '...', '嗯'],
            pet_sad: ['...', '雅', '...', '...', '...'],
            play_excited: ['快', '格调', '雅', '容', '度'],
            play_normal: ['尚可', '雅', '容', '...', '嗯'],
            play_tired: ['累了', '但雅', '容', '...', '度'],
            clean_willing: ['雅', '谢', '洁净', '爽', '适'],
            clean_unwilling: ['...', '容', '...', '...', '...'],
            feed_full: ['已饱，谢了', '无需更多', '恰到好处', '优雅地拒绝', '谢了'],
            feed_normal: ['味好', '恰到好处', '雅', '谢', '美味'],
            feed_hungry: ['终于', '恰到好处', '雅吃', '谢', '美味'],
            sleep_energetic: ['尚不困', '容', '雅', '再等等', '度'],
            sleep_normal: ['该休息了', '雅入睡', '晚安', '容', '安详'],
            sleep_tired: ['终于', '累了', '雅入睡', '安详', '休息'],
            pet_happy: ['悦', '恰到好处', '雅', '继', '适'],
            pet_normal: ['尚可', '继', '雅', '...', '嗯'],
            pet_sad: ['...', '雅', '...', '...', '...'],
            play_excited: ['快', '格调', '雅', '容', '度'],
            play_normal: ['尚可', '雅', '容', '...', '嗯'],
            play_tired: ['累了', '但雅', '容', '...', '度'],
            clean_willing: ['雅', '谢', '洁净', '爽', '适'],
            clean_unwilling: ['...', '容', '...', '...', '...'],
            feed_full: ['已饱，谢了', '无需更多', '恰到好处', '优雅地拒绝', '谢了'],
            feed_normal: ['味好', '恰到好处', '雅', '谢', '美味'],
            feed_hungry: ['终于', '恰到好处', '雅吃', '谢', '美味'],
            sleep_energetic: ['尚不困', '容', '雅', '再等等', '度'],
            sleep_normal: ['该休息了', '雅入睡', '晚安', '容', '安详'],
            sleep_tired: ['终于', '累了', '雅入睡', '安详', '休息'],
            pet_happy: ['悦', '恰到好处', '雅', '继', '适'],
            pet_normal: ['尚可', '继', '雅', '...', '嗯'],
            pet_sad: ['...', '雅', '...', '...', '...'],
            play_excited: ['快', '格调', '雅', '容', '度'],
            play_normal: ['尚可', '雅', '容', '...', '嗯'],
            play_tired: ['累了', '但雅', '容', '...', '度'],
            clean_willing: ['雅', '谢', '洁净', '爽', '适'],
            clean_unwilling: ['...', '容', '...', '...', '...'],
            feed_full: ['已饱，谢了', '无需更多', '恰到好处', '优雅地拒绝', '谢了'],
            feed_normal: ['品味不错', '恰到好处', '优雅', '感谢', '美味'],
            feed_hungry: ['终于', '恰到好处', '优雅地享用', '感谢', '美味'],
            sleep_energetic: ['尚不困', '从容', '优雅', '再等等', '风度'],
            sleep_normal: ['该休息了', '优雅入睡', '晚安', '从容', '安详'],
            sleep_tired: ['终于', '累了', '优雅入睡', '安详', '休息'],
            pet_happy: ['令人愉悦', '恰到好处', '优雅', '请继续', '舒适'],
            pet_normal: ['尚可', '请继续', '优雅', '...', '嗯'],
            pet_sad: ['...', '优雅', '...', '...', '...'],
            play_excited: ['愉快', '有格调', '优雅', '从容', '风度'],
            play_normal: ['尚可', '优雅', '从容', '...', '嗯'],
            play_tired: ['累了', '但优雅', '从容', '...', '风度'],
            clean_willing: ['优雅', '感谢', '洁净', '清爽', '舒适'],
            clean_unwilling: ['...', '从容', '...', '...', '...']
        }
    },
    // 狗
    dog: {
        傲娇: {
            normal: ['哼，才不想你呢', '汪！别误会！', '只是路过！', '才不是等你！', '汪...'],
            feed: ['哼，还行吧', '勉为其难吃', '下次要更好', '看在食物份上', '汪！谢谢...'],
            pet: ['汪！别停...', '哼，舒服...', '谁让你停的？', '再摸一下...', '汪~'],
            play: ['汪！接球！', '我不会输的！', '哼，好玩...', '再来！', '汪！'],
            sleep: ['哼...才不想睡...', 'ZZZ...别吵...', '勉强睡...', '才不是因为困...', '...呼噜...'],
            clean: ['哼...还行...', '勉强让你洗...', '别弄湿我的毛！', '...还挺干净', '下次换沐浴露！'],
            feed_full: ['哼...不饿', '才不想吃', '放着吧...', '吃太饱了...', '勉强闻一下'],
            feed_normal: ['哼...还行', '勉为其难吃', '看在食物份上...', '也就那样', '还算可以'],
            feed_hungry: ['终于知道喂我了！', '饿死我了...', '算你有良心', '快给我吃的！', '等好久了...'],
            sleep_energetic: ['哼...才不想睡', '精神好着呢', '不想睡...', '还早呢...', '勉强躺一下...'],
            sleep_normal: ['有点困了...', '勉强睡一下', '哼...睡就睡', '别吵我...', 'ZZZ...'],
            sleep_tired: ['终于知道让我睡了...', '累死了...', '别吵我...', '要睡很久...', '哼...好困...'],
            pet_happy: ['哼...还行', '就...就这样', '别停...', '勉为其难让你摸', '...呼噜...'],
            pet_normal: ['哼...', '随便你', '就一下', '别摸太久...', '...还行...'],
            pet_sad: ['...不想被摸', '别碰我...', '没心情...', '...走开', '让我静静...'],
            play_excited: ['哼...才没兴奋', '也就一般般', '别得意忘形！', '勉强陪你玩', '我才不激动'],
            play_normal: ['随便玩玩', '还行...', '就这样？', '勉为其难', '哼...'],
            play_tired: ['累了...不玩了', '没力气了...', '你自己玩', '...要休息', '玩不动了...'],
            clean_willing: ['哼...还算舒服', '勉强配合', '...还行', '轻一点...', '快一点...'],
            clean_unwilling: ['不想洗...', '别碰我！', '...好可怕', '轻一点！', '...讨厌...']
        },
        温顺: {
            normal: ['主人~', '好想你~', '汪汪！', '最爱你了！', '等你好久了~'],
            feed: ['谢谢主人！', '好好吃！', '主人最好！', '汪汪！', '幸福~'],
            pet: ['呼噜呼噜~', '好舒服~', '主人的手~', '最喜欢了！', '汪汪！'],
            play: ['汪！玩！', '好开心！', '主人最棒！', '永远玩不够！', '耶！'],
            sleep: ['晚安主人~', '好舒服~', '梦里见~', '呼噜呼噜...', '好安心...'],
            clean: ['谢谢主人~', '变得好香~', '好舒服~', '最喜欢洗澡了~', '干干净净~'],
            feed_full: ['谢谢主人~但我不饿', '已经吃得很饱了~', '想留给下次吃~', '主人真好~', '好幸福~'],
            feed_normal: ['谢谢主人~', '好好吃~', '最喜欢主人了~', '汪汪~', '好美味~'],
            feed_hungry: ['太好吃了！', '谢谢主人！', '饿坏了...', '好幸福！', '还想吃！'],
            sleep_energetic: ['还想和主人玩呢~', '不困呢~', '精神很好~', '再陪陪我嘛~', '不想睡呢~'],
            sleep_normal: ['有点困了~', '晚安主人~', '想睡觉了~', '好舒服~', '要睡了~'],
            sleep_tired: ['好困好困...', '终于能睡了...', '晚安...', '好累...', '要睡很久...'],
            pet_happy: ['呼噜呼噜~', '好舒服~', '最喜欢主人了~', '好幸福~', '再多摸摸~'],
            pet_normal: ['好舒服~', '谢谢主人~', '汪~', '喜欢~', '温暖~'],
            pet_sad: ['...谢谢主人', '好温柔...', '感觉好多了...', '...喜欢', '...被关心'],
            play_excited: ['好开心！', '最喜欢和主人玩了！', '玩不够！', '太棒了！', '耶！'],
            play_normal: ['好玩~', '谢谢主人陪我~', '开心~', '喜欢~', '汪~'],
            play_tired: ['累了...', '想休息了...', '玩不动了...', '好困...', '下次再玩...'],
            clean_willing: ['谢谢主人~', '好舒服~', '变得好香~', '喜欢洗澡~', '干净~'],
            clean_unwilling: ['...有点怕', '轻一点...', '...好', '谢谢主人...', '...乖']
        },
        活泼: {
            normal: ['汪！玩！', '跑跑跑！', '追追追！', '主人看！', '跳跳跳！'],
            feed: ['吃吃吃！', '好香！', '再来！', '汪汪！', '舔干净！'],
            pet: ['蹭蹭蹭！', '转转转！', '舔舔舔！', '汪汪！', '兴奋！'],
            play: ['球！球！', '追到了！', '再扔！', '汪！', '玩不够！'],
            sleep: ['明天还要玩！', '睡饱饱继续嗨！', '梦里也在跑！', 'ZZZ...冲啊！', '好梦~'],
            clean: ['水花四溅！', '洗澡也好玩！', '甩甩毛！', '泡泡好好玩！', '香喷喷！'],
            feed_full: ['还能再吃！', '肚子还有空位！', '再来一口嘛！', '不饱不饱！', '想吃想吃！'],
            feed_normal: ['好吃好吃！', '吃完继续玩！', '汪！', '美味！', '能量补充！'],
            feed_hungry: ['狼吞虎咽！', '太好吃了！', '饿坏了饿坏了！', '还要还要！', '好吃到飞起！'],
            sleep_energetic: ['不想睡！还要玩！', '精神百倍！', '睡不着！', '再玩一会儿！', '活力满满！'],
            sleep_normal: ['有点困了...', '睡一会儿继续嗨！', 'ZZZ...明天玩...', '先睡为敬！', '充电中...'],
            sleep_tired: ['终于能睡了...', '累趴了...', '呼呼...', '玩不动了...', '需要充电...'],
            pet_happy: ['好兴奋！', '转圈圈！', '跳高高！', '最喜欢了！', '好开心！'],
            pet_normal: ['蹭蹭~', '开心~', '汪！', '好玩~', '兴奋~'],
            pet_sad: ['...好一点了', '谢谢主人...', '...开心一点了', '汪...', '...好点了'],
            play_excited: ['太棒了！', '玩不够！', '最开心了！', '汪汪汪！', '超级好玩！'],
            play_normal: ['好玩！', '开心！', '继续！', '汪！', '兴奋！'],
            play_tired: ['累了...', '跑不动了...', '歇一会儿...', '呼...呼...', '没电了...'],
            clean_willing: ['洗澡也好玩！', '水花四溅！', '泡泡攻击！', '甩甩毛！', '香喷喷！'],
            clean_unwilling: ['不想洗...', '还要玩...', '...好吧', '快点结束！', '...勉强']
        },
        慵懒: {
            normal: ['汪...困...', '不想动...', '睡觉中...', '好舒服...', 'ZZZ...'],
            feed: ['嗯...吃...', '吃完睡...', '放那儿...', '嚼嚼...', '谢谢...'],
            pet: ['呼噜...', '好舒服...', '继续...', 'ZZZ...', '嗯...'],
            play: ['好累...', '不想跑...', '你自己玩...', '我看着...', '汪...'],
            sleep: ['终于能睡了...', '床好软...', '不要叫醒我...', '睡到天荒地老...', '呼噜呼噜...'],
            clean: ['好麻烦...', '洗完能睡吗...', '嗯...还行...', '快结束吧...', 'ZZZ...'],
            feed_full: ['吃不下了...', '好饱...', '想睡觉...', 'ZZZ...', '放那儿吧...'],
            feed_normal: ['嗯...吃...', '还行...', '嚼嚼...', '谢谢...', '...'],
            feed_hungry: ['终于...', '饿死了...', '好吃...', '还要...', '谢谢...'],
            sleep_energetic: ['不想睡...才怪', '还是困...', '再躺会儿...', 'ZZZ...', '动不了...'],
            sleep_normal: ['该睡了...', '好困...', '晚安...', '呼噜...', '睡觉...'],
            sleep_tired: ['终于...', '累死了...', '要睡很久...', '别吵我...', 'ZZZ...'],
            pet_happy: ['呼噜...', '好舒服...', '别停...', 'ZZZ...', '嗯...'],
            pet_normal: ['嗯...', '还行...', '继续...', '呼噜...', '...'],
            pet_sad: ['...', '没心情...', 'ZZZ...', '...', '想睡觉...'],
            play_excited: ['还行吧...', '有点累...', '随便...', '...', '想睡觉...'],
            play_normal: ['累...', '不想跑...', '你玩...', '...', 'ZZZ...'],
            play_tired: ['不玩...', '累...', '睡觉...', '...', '动不了...'],
            clean_willing: ['嗯...还行...', '快结束...', 'ZZZ...', '...', '随便...'],
            clean_unwilling: ['不想动...', '好麻烦...', '...', 'ZZZ...', '别碰我...']
        },
        贪吃: {
            normal: ['饿了！汪！', '要吃的！', '闻到香味！', '给我！', '什么时候吃饭？'],
            feed: ['好吃！', '还要！', '舔干净！', '再来一碗！', '汪汪！'],
            pet: ['摸我，给吃的？', '舒服...但饿了', '有奖励吗？', '嗯...', '饿了！'],
            play: ['玩完吃吗？', '饿了...', '能吃吗？', '不如吃饭...', '主人！饭！'],
            sleep: ['梦里也有吃的...', '睡醒了要吃...', 'ZZZ...骨头...', '好饿...先睡...', '梦里吃大餐...'],
            clean: ['洗完有吃的吗？', '香喷喷...想吃...', '好饿...快结束...', '洗澡不如吃饭...', '干净了好饿...'],
            feed_full: ['还能再吃！', '肚子还有空位', '再来一口嘛', '不饱不饱', '想吃！'],
            feed_normal: ['好吃！', '再来点！', '美味！', '还要！', '不错！'],
            feed_hungry: ['太好吃了！', '饿死了！', '狼吞虎咽！', '还要还要！', '终于！'],
            sleep_energetic: ['吃饱了想睡...', 'ZZZ...食物...', '梦里吃...', '困...', '想吃...'],
            sleep_normal: ['睡醒了吃...', 'ZZZ...', '梦里大餐...', '先睡...', '饿了...'],
            sleep_tired: ['累饿了...', '睡...吃...', 'ZZZ...', '要吃东西...', '饿...'],
            pet_happy: ['舒服~给吃的吗？', '开心~饿了~', '好~要吃的~', '汪~食物~', '喜欢~饿了~'],
            pet_normal: ['饿了...', '给吃的？', '嗯...', '食物...', '汪...'],
            pet_sad: ['...饿了', '没心情吃...', '...', '想吃...', '...'],
            play_excited: ['玩！然后吃！', '开心！饿了！', '好玩！要吃的！', '汪！食物！', '兴奋！饿了！'],
            play_normal: ['玩...饿了...', '累...吃...', '还行...饿了...', '...食物...', '汪...'],
            play_tired: ['累了...饿了...', '不玩...要吃...', '饿...', '...吃...', '没力气...'],
            clean_willing: ['洗完吃吗？', '快结束...饿了...', '...好', '想吃...', '...'],
            clean_unwilling: ['不想洗...想吃...', '饿了...不洗...', '...', '要吃...', '...']
        },
        调皮: {
            normal: ['咬你鞋子！', '撕纸巾！', '挖洞！', '追尾巴！', '捣乱！'],
            feed: ['打翻！吃！', '玩食物！', '藏起来！', '边吃边玩！', '有趣！'],
            pet: ['咬手！', '跳身上！', '舔脸！', '扑倒！', '汪！'],
            play: ['撕碎玩具！', '球弄丢！', '追猫！', '挖沙发！', '汪！'],
            sleep: ['睡前再捣乱一下~', 'ZZZ...梦里捣乱...', '明天继续玩~', '睡觉也动来动去~', '呼噜...再玩...'],
            clean: ['水花飞溅！', '泡泡攻击！', '甩你一身水！', '洗澡也捣乱~', '抓抓抓！'],
            feed_full: ['打翻食物！', '玩食物！', '藏起来！', '不吃也要玩！', '打翻！'],
            feed_normal: ['边吃边玩！', '玩一会儿吃！', '打翻！', '藏起来！', '好玩！'],
            feed_hungry: ['狼吞虎咽！', '边吃边捣乱！', '打翻再吃！', '好吃！还要！', '饿坏了！'],
            sleep_energetic: ['不想睡！捣乱！', '还要玩！', '睡前捣乱！', 'ZZZ...捣乱...', '睡不着！'],
            sleep_normal: ['睡一会儿...', 'ZZZ...捣乱...', '明天玩...', '梦里捣乱...', '睡...'],
            sleep_tired: ['累也要捣乱...', '睡...明天捣乱...', 'ZZZ...', '最后捣乱一下...', '呼...'],
            pet_happy: ['咬！扑！', '跑！追！', '捣乱！', '哈哈！', '好玩！'],
            pet_normal: ['咬一下~', '扑一下~', '跑~', '捣乱~', '汪~'],
            pet_sad: ['...捣乱', '...咬', '...', '想捣乱...', '...'],
            play_excited: ['撕碎！', '挖！', '捣乱！', '好玩！', '汪！'],
            play_normal: ['玩！', '捣乱！', '撕！', '跑！', '扑！'],
            play_tired: ['累了...捣乱...', '没力气...也要...', '...', '最后一下...', '呼...'],
            clean_willing: ['水花！', '泡泡！', '甩水！', '捣乱！', '扑！'],
            clean_unwilling: ['不想洗！', '甩你水！', '跑！', '躲！', '不要！']
        },
        胆小: {
            normal: ['...呜', '害怕...', '躲起来...', '别吓我...', '...主人'],
            feed: ['...谢谢', '偷偷吃', '没人吧', '...好吃', '安心...'],
            pet: ['...可以', '温柔...', '不怕了', '呼噜', '...喜欢'],
            play: ['...轻点', '害怕但想', '...慢点', '保护我', '...好'],
            sleep: ['...晚安', '黑暗好可怕...', '主人陪着...', '蜷缩起来...', '...安全了'],
            clean: ['...水好可怕', '轻一点...', '别弄疼我...', '...好可怕', '...谢谢主人'],
            feed_full: ['...不饿', '放着...', '...', '偷偷吃...', '...'],
            feed_normal: ['...谢谢', '...好吃', '...', '安心...', '...'],
            feed_hungry: ['...终于', '...好吃', '饿...', '谢谢...', '...'],
            sleep_energetic: ['...不想睡', '...怕', '...躲起来', '...', '...'],
            sleep_normal: ['...晚安', '...怕', '...蜷缩', '...', '...'],
            sleep_tired: ['...终于', '...累', '...睡', '...', '...'],
            pet_happy: ['...舒服', '...不怕', '...喜欢', '...安全', '...'],
            pet_normal: ['...可以', '...好', '...', '...嗯', '...'],
            pet_sad: ['...怕', '...别', '...', '...', '...'],
            play_excited: ['...开心', '...怕但想', '...好玩', '...', '...'],
            play_normal: ['...轻', '...怕', '...', '...', '...'],
            play_tired: ['...累', '...怕', '...', '...', '...'],
            clean_willing: ['...轻', '...好', '...', '...', '...'],
            clean_unwilling: ['...怕', '...不要', '...水', '...', '...']
        },
        忠诚: {
            normal: ['守护主人', '永远跟随', '等你回家', '保护你', '我的使命'],
            feed: ['感谢', '不浪费', '主人的爱', '有力气了', '为了主人'],
            pet: ['主人的奖赏', '荣幸', '忠诚', '属于你', '我的主人'],
            play: ['命令我', '全力', '保护', '并肩', '永远'],
            sleep: ['守护主人入睡...', '随时待命...', 'ZZZ...保护...', '晚安主人...', '忠诚守护...'],
            clean: ['感谢主人清洗', '为主人保持干净', '忠诚地接受', '干干净净守护你', '谢谢主人'],
            feed_full: ['感谢', '已饱', '留着', '为主人省着', '忠诚'],
            feed_normal: ['感谢', '好吃', '感恩', '有力气', '忠诚'],
            feed_hungry: ['感谢', '终于', '饿坏了', '有力气了', '感恩'],
            sleep_energetic: ['守护', '待命', '不困', '警觉', '忠诚'],
            sleep_normal: ['守护', '待命', 'ZZZ...', '警觉', '忠诚'],
            sleep_tired: ['终于', '累', '守护', '待命', '忠诚'],
            pet_happy: ['荣幸', '忠诚', '感恩', '守护', '主人'],
            pet_normal: ['感谢', '忠诚', '守护', '主人', '荣幸'],
            pet_sad: ['...', '忠诚', '守护', '...', '主人'],
            play_excited: ['全力', '保护', '忠诚', '并肩', '永远'],
            play_normal: ['服从', '全力', '保护', '忠诚', '并肩'],
            play_tired: ['累', '但忠诚', '守护', '...', '坚持'],
            clean_willing: ['感谢', '忠诚', '干净', '守护', '主人'],
            clean_unwilling: ['...', '服从', '忠诚', '...', '接受']
        },
        高冷: {
            normal: ['...', '有事？', '别烦', '我很好', '不需要'],
            feed: ['...还行', '放那', '接受', '...谢', '换口味'],
            pet: ['...行', '别久', '...可以', '够了', '...'],
            play: ['无聊', '幼稚', '...随便', '陪你', '完了吗'],
            sleep: ['...ZZZ', '别吵', '...睡了', '...', '晚安'],
            clean: ['...还行', '快结束', '...可以', '...', '好了吗'],
            feed_full: ['...不饿', '拿走', '...', '不需要', '...'],
            feed_normal: ['...还行', '...', '一般', '...', '凑合'],
            feed_hungry: ['...终于', '...饿', '...吃', '...', '...'],
            sleep_energetic: ['...不困', '...', '别烦', '...', '...'],
            sleep_normal: ['...睡了', '...', '别吵', '...', '...'],
            sleep_tired: ['...终于', '...累', '...', '...', '...'],
            pet_happy: ['...可以', '...还行', '...', '...', '...'],
            pet_normal: ['...', '...行', '...', '...', '...'],
            pet_sad: ['...', '...', '...', '...', '...'],
            play_excited: ['...无聊', '...幼稚', '...', '...', '...'],
            play_normal: ['...无聊', '...', '...', '...', '...'],
            play_tired: ['...累', '...', '...', '...', '...'],
            clean_willing: ['...还行', '...', '...', '...', '...'],
            clean_unwilling: ['...', '...烦', '...', '...', '...']
        },
        粘人: {
            normal: ['别走！', '抱抱！', '跟着你', '别离开', '贴贴'],
            feed: ['一起吃', '喂我', '看着你', '还要抱', '别走'],
            pet: ['永远这样', '别停', '只对你', '永远', '一起'],
            play: ['一辈子', '别结束', '再来', '陪我', '开心'],
            sleep: ['抱着我睡...', '别离开我...', '一起睡嘛...', '梦里也要一起...', '贴贴睡...'],
            clean: ['陪着我洗...', '别走...', '一起洗澡...', '洗完抱抱...', '不要离开我...'],
            feed_full: ['不饿...但要陪', '一起吃嘛', '别走...', '贴贴...', '陪着我...'],
            feed_normal: ['一起吃~', '喂我~', '别走~', '贴贴~', '陪着我~'],
            feed_hungry: ['终于...', '饿...别走', '好吃...陪我', '谢谢...贴贴', '饿坏了...'],
            sleep_energetic: ['不想睡...要陪', '别走...', '一起...', '贴贴...', '陪着我...'],
            sleep_normal: ['一起睡...', '别离开...', '贴贴...', '陪着我...', '梦里一起...'],
            sleep_tired: ['终于...一起', '累...别走', '贴贴睡...', '陪着我...', '一起...'],
            pet_happy: ['永远...', '别停...', '贴贴...', '陪着我...', '最喜欢...'],
            pet_normal: ['陪着我...', '别走...', '贴贴...', '一起...', '永远...'],
            pet_sad: ['...别走', '...陪着我', '...', '...贴贴', '...'],
            play_excited: ['一辈子！', '别结束！', '陪着我！', '最开心！', '永远！'],
            play_normal: ['陪着我！', '别走！', '一起！', '永远！', '贴贴！'],
            play_tired: ['累了...陪着', '别走...', '...一起', '...贴贴', '...'],
            clean_willing: ['陪着我...', '一起...', '贴贴...', '别走...', '永远...'],
            clean_unwilling: ['...别走', '...陪着我', '...', '...一起', '...']
        },
        好奇: {
            normal: ['这是什么？', '那个呢？', '闻闻', '看看', '新世界'],
            feed: ['什么味？', '尝尝', '好吃？', '闻闻', '有趣'],
            pet: ['什么手法？', '神奇', '再摸', '不一样', '奇妙'],
            play: ['新玩具', '怎么玩', '试试', '新玩法', '有趣'],
            sleep: ['梦里探索...', 'ZZZ...那是什么...', '明天去发现...', '好奇梦里有什么...', '睡醒了去探索...'],
            clean: ['这是什么沐浴露？', '水为什么是湿的？', '泡泡好奇妙！', '洗干净去探索！', '发现新感觉！'],
            feed_full: ['这是什么？不饿', '闻闻...', '看看...', '不饿但好奇', '...'],
            feed_normal: ['什么味道？', '尝尝~', '好吃~', '有趣~', '再来~'],
            feed_hungry: ['终于！', '什么味道？', '好吃！', '饿坏了！', '有趣！'],
            sleep_energetic: ['不想睡！探索！', '那是什么？', '再看看...', '好奇...', '...'],
            sleep_normal: ['梦里探索...', 'ZZZ...', '明天...', '好奇...', '睡...'],
            sleep_tired: ['终于...', '累...', '梦里...', '...', '探索...'],
            pet_happy: ['神奇！', '什么手法？', '再摸摸！', '好奇妙！', '有趣！'],
            pet_normal: ['什么？', '好奇...', '再试试...', '...', '嗯...'],
            pet_sad: ['...', '好奇...', '...', '...', '...'],
            play_excited: ['新玩法！', '怎么玩？', '有趣！', '发现！', '真棒！'],
            play_normal: ['怎么玩？', '试试...', '有趣...', '...', '嗯...'],
            play_tired: ['累了...', '但好奇...', '...', '...', '...'],
            clean_willing: ['什么沐浴露？', '泡泡！', '水！', '干净！', '有趣！'],
            clean_unwilling: ['...', '水...', '...', '...', '...']
        },
        优雅: {
            normal: ['午安', '阳光好', '优雅', '从容', '风度'],
            feed: ['品味好', '恰好', '优雅吃', '感谢', '佳肴'],
            pet: ['手法好', '请继续', '优雅', '愉悦', '恰好'],
            play: ['有格调', '优雅玩', '风度', '从容', '愉快'],
            sleep: ['优雅地入睡', '晚安，主人', '好梦', '从容地休息', '安详的睡眠'],
            clean: ['优雅地沐浴', '保持洁净', '感谢清洗', '焕然一新', '清爽宜人'],
            feed_full: ['已饱，谢了', '无需更多', '恰到好处', '优雅地拒绝', '谢了'],
            feed_normal: ['品味好', '恰到好处', '优雅', '感谢', '美味'],
            feed_hungry: ['终于', '恰到好处', '优雅地享用', '感谢', '美味'],
            sleep_energetic: ['尚不困', '从容', '优雅', '再等等', '风度'],
            sleep_normal: ['该休息了', '优雅入睡', '晚安', '从容', '安详'],
            sleep_tired: ['终于', '累了', '优雅入睡', '安详', '休息'],
            pet_happy: ['令人愉悦', '恰到好处', '优雅', '请继续', '舒适'],
            pet_normal: ['尚可', '请继续', '优雅', '...', '嗯'],
            pet_sad: ['...', '优雅', '...', '...', '...'],
            play_excited: ['愉快', '有格调', '优雅', '从容', '风度'],
            play_normal: ['尚可', '优雅', '从容', '...', '嗯'],
            play_tired: ['累了', '但优雅', '从容', '...', '风度'],
            clean_willing: ['优雅', '感谢', '洁净', '清爽', '舒适'],
            clean_unwilling: ['...', '从容', '...', '...', '...']
        }
    },
    // 兔子
    rabbit: {
        傲娇: {
            normal: ['哼...', '才不想你', '只是路过', '蹦走', '吱...'],
            feed: ['哼...还行', '勉强吃', '下次更好', '看食物份上', '吱...'],
            pet: ['吱...别停', '哼...舒服', '谁让你停', '再摸', '吱~'],
            play: ['吱！玩！', '不会输', '哼...好玩', '再来', '吱！'],
            sleep: ['哼...才不想睡', 'ZZZ...别吵', '勉强睡', '才不是因为困', '...呼噜...'],
            clean: ['哼...还行', '勉强让你洗', '别弄湿我的毛', '...还挺干净', '下次换沐浴露'],
            feed_full: ['哼...不饿', '才不想吃', '放着吧...', '吃太饱了...', '勉强闻一下'],
            feed_normal: ['哼...还行', '勉为其难吃', '看在食物份上...', '也就那样', '还算可以'],
            feed_hungry: ['终于知道喂我了！', '饿死我了...', '算你有良心', '快给我吃的！', '等好久了...'],
            sleep_energetic: ['哼...才不想睡', '精神好着呢', '不想睡...', '还早呢...', '勉强躺一下...'],
            sleep_normal: ['有点困了...', '勉强睡一下', '哼...睡就睡', '别吵我...', 'ZZZ...'],
            sleep_tired: ['终于知道让我睡了...', '累死了...', '别吵我...', '要睡很久...', '哼...好困...'],
            pet_happy: ['哼...还行', '就...就这样', '别停...', '勉为其难让你摸', '...呼噜...'],
            pet_normal: ['哼...', '随便你', '就一下', '别摸太久...', '...还行...'],
            pet_sad: ['...不想被摸', '别碰我...', '没心情...', '...走开', '让我静静...'],
            play_excited: ['哼...才没兴奋', '也就一般般', '别得意忘形！', '勉强陪你玩', '我才不激动'],
            play_normal: ['随便玩玩', '还行...', '就这样？', '勉为其难', '哼...'],
            play_tired: ['累了...不玩了', '没力气了...', '你自己玩', '...要休息', '玩不动了...'],
            clean_willing: ['哼...还算舒服', '勉强配合', '...还行', '轻一点...', '快一点...'],
            clean_unwilling: ['不想洗...', '别碰我！', '...好可怕', '轻一点！', '...讨厌...']
        },
        温顺: {
            normal: ['主人~', '想你~', '吱吱', '爱你', '等好久'],
            feed: ['谢谢', '好吃', '主人好', '吱吱', '幸福'],
            pet: ['舒服', '温暖', '多摸摸', '最喜欢', '吱吱'],
            play: ['玩！', '开心', '主人棒', '玩不够', '耶'],
            sleep: ['晚安主人~', '好舒服~', '梦里见~', '呼噜呼噜...', '好安心...'],
            clean: ['谢谢主人~', '变得好香~', '好舒服~', '最喜欢洗澡了~', '干干净净~'],
            feed_full: ['谢谢主人~但我不饿', '已经吃得很饱了~', '想留给下次吃~', '主人真好~', '好幸福~'],
            feed_normal: ['谢谢主人~', '好好吃~', '最喜欢主人了~', '吱吱~', '好美味~'],
            feed_hungry: ['太好吃了！', '谢谢主人！', '饿坏了...', '好幸福！', '还想吃！'],
            sleep_energetic: ['还想和主人玩呢~', '不困呢~', '精神很好~', '再陪陪我嘛~', '不想睡呢~'],
            sleep_normal: ['有点困了~', '晚安主人~', '想睡觉了~', '好舒服~', '要睡了~'],
            sleep_tired: ['好困好困...', '终于能睡了...', '晚安...', '好累...', '要睡很久...'],
            pet_happy: ['舒服~', '最喜欢主人了~', '好幸福~', '再多摸摸~', '吱吱~'],
            pet_normal: ['好舒服~', '谢谢主人~', '吱吱~', '喜欢~', '温暖~'],
            pet_sad: ['...谢谢主人', '好温柔...', '感觉好多了...', '...喜欢', '...被关心'],
            play_excited: ['好开心！', '最喜欢和主人玩了！', '玩不够！', '太棒了！', '耶！'],
            play_normal: ['好玩~', '谢谢主人陪我~', '开心~', '喜欢~', '吱吱~'],
            play_tired: ['累了...', '想休息了...', '玩不动了...', '好困...', '下次再玩...'],
            clean_willing: ['谢谢主人~', '好舒服~', '变得好香~', '喜欢洗澡~', '干净~'],
            clean_unwilling: ['...有点怕', '轻一点...', '...好', '谢谢主人...', '...乖']
        },
        活泼: {
            normal: ['蹦！', '跳跳', '追追', '看！', '蹦蹦'],
            feed: ['吃！', '香！', '再来', '吱吱', '舔'],
            pet: ['蹭蹭', '转转', '舔舔', '吱吱', '兴奋'],
            play: ['球！', '追到', '再扔', '吱', '不够'],
            sleep: ['明天还要玩！', '睡饱饱继续嗨！', '梦里也在跳！', 'ZZZ...冲啊！', '好梦~'],
            clean: ['水花四溅！', '洗澡也好玩！', '甩甩毛！', '泡泡好好玩！', '香喷喷！'],
            feed_full: ['还能再吃！', '肚子还有空位！', '再来一口嘛！', '不饱不饱！', '想吃想吃！'],
            feed_normal: ['好吃好吃！', '吃完继续玩！', '吱！', '美味！', '能量补充！'],
            feed_hungry: ['狼吞虎咽！', '太好吃了！', '饿坏了饿坏了！', '还要还要！', '好吃到飞起！'],
            sleep_energetic: ['不想睡！还要玩！', '精神百倍！', '睡不着！', '再玩一会儿！', '活力满满！'],
            sleep_normal: ['有点困了...', '睡一会儿继续嗨！', 'ZZZ...明天玩...', '先睡为敬！', '充电中...'],
            sleep_tired: ['终于能睡了...', '累趴了...', '呼呼...', '玩不动了...', '需要充电...'],
            pet_happy: ['好兴奋！', '转圈圈！', '跳高高！', '最喜欢了！', '好开心！'],
            pet_normal: ['蹭蹭~', '开心~', '吱！', '好玩~', '兴奋~'],
            pet_sad: ['...好一点了', '谢谢主人...', '...开心一点了', '吱...', '...好点了'],
            play_excited: ['太棒了！', '玩不够！', '最开心了！', '吱吱吱！', '超级好玩！'],
            play_normal: ['好玩！', '开心！', '继续！', '吱！', '兴奋！'],
            play_tired: ['累了...', '跑不动了...', '歇一会儿...', '呼...呼...', '没电了...'],
            clean_willing: ['洗澡也好玩！', '水花四溅！', '泡泡攻击！', '甩甩毛！', '香喷喷！'],
            clean_unwilling: ['不想洗...', '还要玩...', '...好吧', '快点结束！', '...勉强']
        },
        慵懒: {
            normal: ['吱...困', '不想动', '睡觉', '舒服', 'ZZZ'],
            feed: ['嗯...吃', '吃完睡', '放那', '嚼嚼', '谢'],
            pet: ['呼噜', '舒服', '继续', 'ZZZ', '嗯'],
            play: ['累', '不想跑', '你看', '我看', '吱'],
            sleep: ['终于能睡了...', '窝好软...', '不要叫醒我...', '睡到天荒地老...', '呼噜呼噜...'],
            clean: ['好麻烦...', '洗完能睡吗...', '嗯...还行...', '快结束吧...', 'ZZZ...'],
            feed_full: ['吃不下了...', '好饱...', '想睡觉...', 'ZZZ...', '放那儿吧...'],
            feed_normal: ['嗯...吃...', '还行...', '嚼嚼...', '谢谢...', '...'],
            feed_hungry: ['终于...', '饿死了...', '好吃...', '还要...', '谢谢...'],
            sleep_energetic: ['不想睡...才怪', '还是困...', '再躺会儿...', 'ZZZ...', '动不了...'],
            sleep_normal: ['该睡了...', '好困...', '晚安...', '呼噜...', '睡觉...'],
            sleep_tired: ['终于...', '累死了...', '要睡很久...', '别吵我...', 'ZZZ...'],
            pet_happy: ['呼噜...', '好舒服...', '别停...', 'ZZZ...', '嗯...'],
            pet_normal: ['嗯...', '还行...', '继续...', '呼噜...', '...'],
            pet_sad: ['...', '没心情...', 'ZZZ...', '...', '想睡觉...'],
            play_excited: ['还行吧...', '有点累...', '随便...', '...', '想睡觉...'],
            play_normal: ['累...', '不想跑...', '你玩...', '...', 'ZZZ...'],
            play_tired: ['不玩...', '累...', '睡觉...', '...', '动不了...'],
            clean_willing: ['嗯...还行...', '快结束...', 'ZZZ...', '...', '随便...'],
            clean_unwilling: ['不想动...', '好麻烦...', '...', 'ZZZ...', '别碰我...']
        },
        贪吃: {
            normal: ['饿了吱', '要吃的', '闻到', '给我', '吃饭？'],
            feed: ['好吃', '还要', '舔净', '再来', '吱吱'],
            pet: ['摸给吃？', '舒服但饿', '奖励？', '嗯', '饿了'],
            play: ['玩完吃？', '饿了', '能吃？', '不如吃', '主人饭'],
            sleep: ['梦里也有吃的...', '睡醒了要吃...', 'ZZZ...胡萝卜...', '好饿...先睡...', '梦里吃大餐...'],
            clean: ['洗完有吃的吗？', '香喷喷...想吃...', '好饿...快结束...', '洗澡不如吃饭...', '干净了好饿...'],
            feed_full: ['还能再吃！', '肚子还有空位', '再来一口嘛', '不饱不饱', '想吃！'],
            feed_normal: ['好吃！', '再来点！', '美味！', '还要！', '不错！'],
            feed_hungry: ['太好吃了！', '饿死了！', '狼吞虎咽！', '还要还要！', '终于！'],
            sleep_energetic: ['吃饱了想睡...', 'ZZZ...食物...', '梦里吃...', '困...', '想吃...'],
            sleep_normal: ['睡醒了吃...', 'ZZZ...', '梦里大餐...', '先睡...', '饿了...'],
            sleep_tired: ['累饿了...', '睡...吃...', 'ZZZ...', '要吃东西...', '饿...'],
            pet_happy: ['舒服~给吃的吗？', '开心~饿了~', '好~要吃的~', '吱~食物~', '喜欢~饿了~'],
            pet_normal: ['饿了...', '给吃的？', '嗯...', '食物...', '吱...'],
            pet_sad: ['...饿了', '没心情吃...', '...', '想吃...', '...'],
            play_excited: ['玩！然后吃！', '开心！饿了！', '好玩！要吃的！', '吱！食物！', '兴奋！饿了！'],
            play_normal: ['玩...饿了...', '累...吃...', '还行...饿了...', '...食物...', '吱...'],
            play_tired: ['累了...饿了...', '不玩...要吃...', '饿...', '...吃...', '没力气...'],
            clean_willing: ['洗完吃吗？', '快结束...饿了...', '...好', '想吃...', '...'],
            clean_unwilling: ['不想洗...想吃...', '饿了...不洗...', '...', '要吃...', '...']
        },
        调皮: {
            normal: ['咬线！', '挖洞', '跳桌上', '藏东西', '捣乱'],
            feed: ['打翻吃', '玩食物', '藏起', '边吃玩', '有趣'],
            pet: ['咬手', '跳身', '舔脸', '扑倒', '吱'],
            play: ['咬玩具', '球丢', '追猫', '挖沙', '吱'],
            sleep: ['睡前再捣乱一下~', 'ZZZ...梦里捣乱...', '明天继续玩~', '睡觉也动来动去~', '呼噜...再玩...'],
            clean: ['水花飞溅！', '泡泡攻击！', '甩你一身水！', '洗澡也捣乱~', '抓抓抓！'],
            feed_full: ['打翻食物！', '玩食物！', '藏起来！', '不吃也要玩！', '打翻！'],
            feed_normal: ['边吃边玩！', '玩一会儿吃！', '打翻！', '藏起来！', '好玩！'],
            feed_hungry: ['狼吞虎咽！', '边吃边捣乱！', '打翻再吃！', '好吃！还要！', '饿坏了！'],
            sleep_energetic: ['不想睡！捣乱！', '还要玩！', '睡前捣乱！', 'ZZZ...捣乱...', '睡不着！'],
            sleep_normal: ['睡一会儿...', 'ZZZ...捣乱...', '明天玩...', '梦里捣乱...', '睡...'],
            sleep_tired: ['累也要捣乱...', '睡...明天捣乱...', 'ZZZ...', '最后捣乱一下...', '呼...'],
            pet_happy: ['咬！扑！', '跑！追！', '捣乱！', '哈哈！', '好玩！'],
            pet_normal: ['咬一下~', '扑一下~', '跑~', '捣乱~', '吱~'],
            pet_sad: ['...捣乱', '...咬', '...', '想捣乱...', '...'],
            play_excited: ['咬玩具！', '挖！', '捣乱！', '好玩！', '吱！'],
            play_normal: ['玩！', '捣乱！', '咬！', '跑！', '扑！'],
            play_tired: ['累了...捣乱...', '没力气...也要...', '...', '最后一下...', '呼...'],
            clean_willing: ['水花！', '泡泡！', '甩水！', '捣乱！', '扑！'],
            clean_unwilling: ['不想洗！', '甩你水！', '跑！', '躲！', '不要！']
        },
        胆小: {
            normal: ['...吱', '怕', '躲起', '别吓', '...主人'],
            feed: ['...谢', '偷吃', '没人', '...好吃', '安心'],
            pet: ['...可以', '温柔', '不怕', '呼噜', '...喜'],
            play: ['...轻', '怕但想', '...慢', '保护', '...好'],
            sleep: ['...晚安', '黑暗好可怕...', '主人陪着...', '蜷缩起来...', '...安全了'],
            clean: ['...水好可怕', '轻一点...', '别弄疼我...', '...好可怕', '...谢谢主人'],
            feed_full: ['...不饿', '放着...', '...', '偷偷吃...', '...'],
            feed_normal: ['...谢谢', '...好吃', '...', '安心...', '...'],
            feed_hungry: ['...终于', '...好吃', '饿...', '谢谢...', '...'],
            sleep_energetic: ['...不想睡', '...怕', '...躲起来', '...', '...'],
            sleep_normal: ['...晚安', '...怕', '...蜷缩', '...', '...'],
            sleep_tired: ['...终于', '...累', '...睡', '...', '...'],
            pet_happy: ['...舒服', '...不怕', '...喜欢', '...安全', '...'],
            pet_normal: ['...可以', '...好', '...', '...嗯', '...'],
            pet_sad: ['...怕', '...别', '...', '...', '...'],
            play_excited: ['...开心', '...怕但想', '...好玩', '...', '...'],
            play_normal: ['...轻', '...怕', '...', '...', '...'],
            play_tired: ['...累', '...怕', '...', '...', '...'],
            clean_willing: ['...轻', '...好', '...', '...', '...'],
            clean_unwilling: ['...怕', '...不要', '...水', '...', '...']
        },
        忠诚: {
            normal: ['守护', '跟随', '等你', '保护', '使命'],
            feed: ['感谢', '不浪费', '爱', '力气', '为主人'],
            pet: ['奖赏', '荣幸', '忠诚', '属于', '主人'],
            play: ['命令', '全力', '保护', '并肩', '永远'],
            sleep: ['守护主人入睡...', '随时待命...', 'ZZZ...保护...', '晚安主人...', '忠诚守护...'],
            clean: ['感谢主人清洗', '为主人保持干净', '忠诚地接受', '干干净净守护你', '谢谢主人'],
            feed_full: ['感谢', '已饱', '留着', '为主人省着', '忠诚'],
            feed_normal: ['感谢', '好吃', '感恩', '有力气', '忠诚'],
            feed_hungry: ['感谢', '终于', '饿坏了', '有力气了', '感恩'],
            sleep_energetic: ['守护', '待命', '不困', '警觉', '忠诚'],
            sleep_normal: ['守护', '待命', 'ZZZ...', '警觉', '忠诚'],
            sleep_tired: ['终于', '累', '守护', '待命', '忠诚'],
            pet_happy: ['荣幸', '忠诚', '感恩', '守护', '主人'],
            pet_normal: ['感谢', '忠诚', '守护', '主人', '荣幸'],
            pet_sad: ['...', '忠诚', '守护', '...', '主人'],
            play_excited: ['全力', '保护', '忠诚', '并肩', '永远'],
            play_normal: ['服从', '全力', '保护', '忠诚', '并肩'],
            play_tired: ['累', '但忠诚', '守护', '...', '坚持'],
            clean_willing: ['感谢', '忠诚', '干净', '守护', '主人'],
            clean_unwilling: ['...', '服从', '忠诚', '...', '接受']
        },
        高冷: {
            normal: ['...', '事？', '烦', '我好', '不要'],
            feed: ['...行', '那', '受', '...谢', '换'],
            pet: ['...可', '久', '...行', '够', '...'],
            play: ['无聊', '稚', '...随', '陪', '完？'],
            sleep: ['...ZZZ', '别吵', '...睡了', '...', '晚安'],
            clean: ['...还行', '快结束', '...可以', '...', '好了吗'],
            feed_full: ['...不饿', '拿走', '...', '不需要', '...'],
            feed_normal: ['...还行', '...', '一般', '...', '凑合'],
            feed_hungry: ['...终于', '...饿', '...吃', '...', '...'],
            sleep_energetic: ['...不困', '...', '别烦', '...', '...'],
            sleep_normal: ['...睡了', '...', '别吵', '...', '...'],
            sleep_tired: ['...终于', '...累', '...', '...', '...'],
            pet_happy: ['...可以', '...还行', '...', '...', '...'],
            pet_normal: ['...', '...行', '...', '...', '...'],
            pet_sad: ['...', '...', '...', '...', '...'],
            play_excited: ['...无聊', '...稚', '...', '...', '...'],
            play_normal: ['...无聊', '...', '...', '...', '...'],
            play_tired: ['...累', '...', '...', '...', '...'],
            clean_willing: ['...还行', '...', '...', '...', '...'],
            clean_unwilling: ['...', '...烦', '...', '...', '...']
        },
        粘人: {
            normal: ['别走', '抱', '跟', '别离', '贴'],
            feed: ['一起', '喂', '看', '还要', '别走'],
            pet: ['永远', '别停', '只对', '永远', '一起'],
            play: ['辈子', '别完', '再来', '陪我', '开心'],
            sleep: ['抱着我睡...', '别离开我...', '一起睡嘛...', '梦里也要一起...', '贴贴睡...'],
            clean: ['陪着我洗...', '别走...', '一起洗澡...', '洗完抱抱...', '不要离开我...'],
            feed_full: ['不饿...但要陪', '一起吃嘛', '别走...', '贴贴...', '陪着我...'],
            feed_normal: ['一起吃~', '喂我~', '别走~', '贴贴~', '陪着我~'],
            feed_hungry: ['终于...', '饿...别走', '好吃...陪我', '谢谢...贴贴', '饿坏了...'],
            sleep_energetic: ['不想睡...要陪', '别走...', '一起...', '贴贴...', '陪着我...'],
            sleep_normal: ['一起睡...', '别离开...', '贴贴...', '陪着我...', '梦里一起...'],
            sleep_tired: ['终于...一起', '累...别走', '贴贴睡...', '陪着我...', '一起...'],
            pet_happy: ['永远...', '别停...', '贴贴...', '陪着我...', '最喜欢...'],
            pet_normal: ['陪着我...', '别走...', '贴贴...', '一起...', '永远...'],
            pet_sad: ['...别走', '...陪着我', '...', '...贴贴', '...'],
            play_excited: ['一辈子！', '别完！', '陪着我！', '最开心！', '永远！'],
            play_normal: ['陪着我！', '别走！', '一起！', '永远！', '贴贴！'],
            play_tired: ['累了...陪着', '别走...', '...一起', '...贴贴', '...'],
            clean_willing: ['陪着我...', '一起...', '贴贴...', '别走...', '永远...'],
            clean_unwilling: ['...别走', '...陪着我', '...', '...一起', '...']
        },
        好奇: {
            normal: ['什么？', '那呢？', '闻', '看', '世界'],
            feed: ['味？', '尝', '吃？', '闻', '趣'],
            pet: ['手法？', '神', '再', '不同', '妙'],
            play: ['新', '怎玩', '试', '新法', '趣'],
            sleep: ['梦里探索...', 'ZZZ...那是什么...', '明天去发现...', '好奇梦里有什么...', '睡醒了去探索...'],
            clean: ['这是什么沐浴露？', '水为什么是湿的？', '泡泡好奇妙！', '洗干净去探索！', '发现新感觉！'],
            feed_full: ['什么？不饿', '闻闻...', '看看...', '不饿但好奇', '...'],
            feed_normal: ['什么味道？', '尝尝~', '好吃~', '有趣~', '再来~'],
            feed_hungry: ['终于！', '什么味道？', '好吃！', '饿坏了！', '有趣！'],
            sleep_energetic: ['不想睡！探索！', '那是什么？', '再看看...', '好奇...', '...'],
            sleep_normal: ['梦里探索...', 'ZZZ...', '明天...', '好奇...', '睡...'],
            sleep_tired: ['终于...', '累...', '梦里...', '...', '探索...'],
            pet_happy: ['神奇！', '什么手法？', '再摸摸！', '好奇妙！', '有趣！'],
            pet_normal: ['什么？', '好奇...', '再试试...', '...', '嗯...'],
            pet_sad: ['...', '好奇...', '...', '...', '...'],
            play_excited: ['新玩法！', '怎么玩？', '有趣！', '发现！', '真棒！'],
            play_normal: ['怎么玩？', '试试...', '有趣...', '...', '嗯...'],
            play_tired: ['累了...', '但好奇...', '...', '...', '...'],
            clean_willing: ['什么沐浴露？', '泡泡！', '水！', '干净！', '有趣！'],
            clean_unwilling: ['...', '水...', '...', '...', '...']
        },
        优雅: {
            normal: ['安', '光好', '雅', '容', '度'],
            feed: ['味好', '恰', '雅吃', '谢', '肴'],
            pet: ['法好', '继', '雅', '悦', '恰'],
            play: ['格调', '雅玩', '度', '容', '快'],
            sleep: ['优雅地入睡', '晚安，主人', '好梦', '从容地休息', '安详的睡眠'],
            clean: ['优雅地沐浴', '保持洁净', '感谢清洗', '焕然一新', '清爽宜人'],
            feed_full: ['已饱，谢了', '无需更多', '恰到好处', '优雅地拒绝', '谢了'],
            feed_normal: ['味好', '恰到好处', '雅', '谢', '美味'],
            feed_hungry: ['终于', '恰到好处', '雅吃', '谢', '美味'],
            sleep_energetic: ['尚不困', '容', '雅', '再等等', '度'],
            sleep_normal: ['该休息了', '雅入睡', '晚安', '容', '安详'],
            sleep_tired: ['终于', '累了', '雅入睡', '安详', '休息'],
            pet_happy: ['悦', '恰到好处', '雅', '继', '适'],
            pet_normal: ['尚可', '继', '雅', '...', '嗯'],
            pet_sad: ['...', '雅', '...', '...', '...'],
            play_excited: ['快', '格调', '雅', '容', '度'],
            play_normal: ['尚可', '雅', '容', '...', '嗯'],
            play_tired: ['累了', '但雅', '容', '...', '度'],
            clean_willing: ['雅', '谢', '洁净', '爽', '适'],
            clean_unwilling: ['...', '容', '...', '...', '...']
        }
    },
    // 狐狸
    fox: {
        傲娇: {
            normal: ['哼...', '才不想你', '只是路过', '走开', '呦...'],
            feed: ['哼...还行', '勉强吃', '下次更好', '看食物份上', '呦...'],
            pet: ['呦...别停', '哼...舒服', '谁让你停', '再摸', '呦~'],
            play: ['呦！玩！', '不会输', '哼...好玩', '再来', '呦！'],
            sleep: ['哼...才不想睡', 'ZZZ...别吵', '勉强睡', '才不是因为困', '...呼噜...'],
            clean: ['哼...还行', '勉强让你洗', '别弄湿我的毛', '...还挺干净', '下次换沐浴露'],
            feed_full: ['哼...不饿', '才不想吃', '放着吧...', '吃太饱了...', '勉强闻一下'],
            feed_normal: ['哼...还行', '勉为其难吃', '看在食物份上...', '也就那样', '还算可以'],
            feed_hungry: ['终于知道喂我了！', '饿死我了...', '算你有良心', '快给我吃的！', '等好久了...'],
            sleep_energetic: ['哼...才不想睡', '精神好着呢', '不想睡...', '还早呢...', '勉强躺一下...'],
            sleep_normal: ['有点困了...', '勉强睡一下', '哼...睡就睡', '别吵我...', 'ZZZ...'],
            sleep_tired: ['终于知道让我睡了...', '累死了...', '别吵我...', '要睡很久...', '哼...好困...'],
            pet_happy: ['哼...还行', '就...就这样', '别停...', '勉为其难让你摸', '...呼噜...'],
            pet_normal: ['哼...', '随便你', '就一下', '别摸太久...', '...还行...'],
            pet_sad: ['...不想被摸', '别碰我...', '没心情...', '...走开', '让我静静...'],
            play_excited: ['哼...才没兴奋', '也就一般般', '别得意忘形！', '勉强陪你玩', '我才不激动'],
            play_normal: ['随便玩玩', '还行...', '就这样？', '勉为其难', '哼...'],
            play_tired: ['累了...不玩了', '没力气了...', '你自己玩', '...要休息', '玩不动了...'],
            clean_willing: ['哼...还算舒服', '勉强配合', '...还行', '轻一点...', '快一点...'],
            clean_unwilling: ['不想洗...', '别碰我！', '...好可怕', '轻一点！', '...讨厌...']
        },
        温顺: {
            normal: ['主人~', '想你~', '呦呦', '爱你', '等好久'],
            feed: ['谢谢', '好吃', '主人好', '呦呦', '幸福'],
            pet: ['舒服', '温暖', '多摸摸', '最喜欢', '呦呦'],
            play: ['玩！', '开心', '主人棒', '玩不够', '耶'],
            sleep: ['晚安主人~', '好舒服~', '梦里见~', '呼噜呼噜...', '好安心...'],
            clean: ['谢谢主人~', '变得好香~', '好舒服~', '最喜欢洗澡了~', '干干净净~'],
            feed_full: ['谢谢主人~但我不饿', '已经吃得很饱了~', '想留给下次吃~', '主人真好~', '好幸福~'],
            feed_normal: ['谢谢主人~', '好好吃~', '最喜欢主人了~', '呦呦~', '好美味~'],
            feed_hungry: ['太好吃了！', '谢谢主人！', '饿坏了...', '好幸福！', '还想吃！'],
            sleep_energetic: ['还想和主人玩呢~', '不困呢~', '精神很好~', '再陪陪我嘛~', '不想睡呢~'],
            sleep_normal: ['有点困了~', '晚安主人~', '想睡觉了~', '好舒服~', '要睡了~'],
            sleep_tired: ['好困好困...', '终于能睡了...', '晚安...', '好累...', '要睡很久...'],
            pet_happy: ['舒服~', '最喜欢主人了~', '好幸福~', '再多摸摸~', '呦呦~'],
            pet_normal: ['好舒服~', '谢谢主人~', '呦呦~', '喜欢~', '温暖~'],
            pet_sad: ['...谢谢主人', '好温柔...', '感觉好多了...', '...喜欢', '...被关心'],
            play_excited: ['好开心！', '最喜欢和主人玩了！', '玩不够！', '太棒了！', '耶！'],
            play_normal: ['好玩~', '谢谢主人陪我~', '开心~', '喜欢~', '呦呦~'],
            play_tired: ['累了...', '想休息了...', '玩不动了...', '好困...', '下次再玩...'],
            clean_willing: ['谢谢主人~', '好舒服~', '变得好香~', '喜欢洗澡~', '干净~'],
            clean_unwilling: ['...有点怕', '轻一点...', '...好', '谢谢主人...', '...乖']
        },
        活泼: {
            normal: ['跑！', '跳跳', '追追', '看！', '蹦蹦'],
            feed: ['吃！', '香！', '再来', '呦呦', '舔'],
            pet: ['蹭蹭', '转转', '舔舔', '呦呦', '兴奋'],
            play: ['球！', '追到', '再扔', '呦', '不够'],
            sleep: ['明天还要玩！', '睡饱饱继续嗨！', '梦里也在跑！', 'ZZZ...冲啊！', '好梦~'],
            clean: ['水花四溅！', '洗澡也好玩！', '甩甩毛！', '泡泡好好玩！', '香喷喷！'],
            feed_full: ['还能再吃！', '肚子还有空位！', '再来一口嘛！', '不饱不饱！', '想吃想吃！'],
            feed_normal: ['好吃好吃！', '吃完继续玩！', '呦！', '美味！', '能量补充！'],
            feed_hungry: ['狼吞虎咽！', '太好吃了！', '饿坏了饿坏了！', '还要还要！', '好吃到飞起！'],
            sleep_energetic: ['不想睡！还要玩！', '精神百倍！', '睡不着！', '再玩一会儿！', '活力满满！'],
            sleep_normal: ['有点困了...', '睡一会儿继续嗨！', 'ZZZ...明天玩...', '先睡为敬！', '充电中...'],
            sleep_tired: ['终于能睡了...', '累趴了...', '呼呼...', '玩不动了...', '需要充电...'],
            pet_happy: ['好兴奋！', '转圈圈！', '跳高高！', '最喜欢了！', '好开心！'],
            pet_normal: ['蹭蹭~', '开心~', '呦！', '好玩~', '兴奋~'],
            pet_sad: ['...好一点了', '谢谢主人...', '...开心一点了', '呦...', '...好点了'],
            play_excited: ['太棒了！', '玩不够！', '最开心了！', '呦呦呦！', '超级好玩！'],
            play_normal: ['好玩！', '开心！', '继续！', '呦！', '兴奋！'],
            play_tired: ['累了...', '跑不动了...', '歇一会儿...', '呼...呼...', '没电了...'],
            clean_willing: ['洗澡也好玩！', '水花四溅！', '泡泡攻击！', '甩甩毛！', '香喷喷！'],
            clean_unwilling: ['不想洗...', '还要玩...', '...好吧', '快点结束！', '...勉强']
        },
        慵懒: {
            normal: ['呦...困', '不想动', '睡觉', '舒服', 'ZZZ'],
            feed: ['嗯...吃', '吃完睡', '放那', '嚼嚼', '谢'],
            pet: ['呼噜', '舒服', '继续', 'ZZZ', '嗯'],
            play: ['累', '不想跑', '你看', '我看', '呦'],
            sleep: ['终于能睡了...', '窝好软...', '不要叫醒我...', '睡到天荒地老...', '呼噜呼噜...'],
            clean: ['好麻烦...', '洗完能睡吗...', '嗯...还行...', '快结束吧...', 'ZZZ...'],
            feed_full: ['吃不下了...', '好饱...', '想睡觉...', 'ZZZ...', '放那儿吧...'],
            feed_normal: ['嗯...吃...', '还行...', '嚼嚼...', '谢谢...', '...'],
            feed_hungry: ['终于...', '饿死了...', '好吃...', '还要...', '谢谢...'],
            sleep_energetic: ['不想睡...才怪', '还是困...', '再躺会儿...', 'ZZZ...', '动不了...'],
            sleep_normal: ['该睡了...', '好困...', '晚安...', '呼噜...', '睡觉...'],
            sleep_tired: ['终于...', '累死了...', '要睡很久...', '别吵我...', 'ZZZ...'],
            pet_happy: ['呼噜...', '好舒服...', '别停...', 'ZZZ...', '嗯...'],
            pet_normal: ['嗯...', '还行...', '继续...', '呼噜...', '...'],
            pet_sad: ['...', '没心情...', 'ZZZ...', '...', '想睡觉...'],
            play_excited: ['还行吧...', '有点累...', '随便...', '...', '想睡觉...'],
            play_normal: ['累...', '不想跑...', '你玩...', '...', 'ZZZ...'],
            play_tired: ['不玩...', '累...', '睡觉...', '...', '动不了...'],
            clean_willing: ['嗯...还行...', '快结束...', 'ZZZ...', '...', '随便...'],
            clean_unwilling: ['不想动...', '好麻烦...', '...', 'ZZZ...', '别碰我...']
        },
        贪吃: {
            normal: ['饿了呦', '要吃的', '闻到', '给我', '吃饭？'],
            feed: ['好吃', '还要', '舔净', '再来', '呦呦'],
            pet: ['摸给吃？', '舒服但饿', '奖励？', '嗯', '饿了'],
            play: ['玩完吃？', '饿了', '能吃？', '不如吃', '主人饭'],
            sleep: ['梦里也有吃的...', '睡醒了要吃...', 'ZZZ...肉...', '好饿...先睡...', '梦里吃大餐...'],
            clean: ['洗完有吃的吗？', '香喷喷...想吃...', '好饿...快结束...', '洗澡不如吃饭...', '干净了好饿...'],
            feed_full: ['还能再吃！', '肚子还有空位', '再来一口嘛', '不饱不饱', '想吃！'],
            feed_normal: ['好吃！', '再来点！', '美味！', '还要！', '不错！'],
            feed_hungry: ['太好吃了！', '饿死了！', '狼吞虎咽！', '还要还要！', '终于！'],
            sleep_energetic: ['吃饱了想睡...', 'ZZZ...食物...', '梦里吃...', '困...', '想吃...'],
            sleep_normal: ['睡醒了吃...', 'ZZZ...', '梦里大餐...', '先睡...', '饿了...'],
            sleep_tired: ['累饿了...', '睡...吃...', 'ZZZ...', '要吃东西...', '饿...'],
            pet_happy: ['舒服~给吃的吗？', '开心~饿了~', '好~要吃的~', '呦~食物~', '喜欢~饿了~'],
            pet_normal: ['饿了...', '给吃的？', '嗯...', '食物...', '呦...'],
            pet_sad: ['...饿了', '没心情吃...', '...', '想吃...', '...'],
            play_excited: ['玩！然后吃！', '开心！饿了！', '好玩！要吃的！', '呦！食物！', '兴奋！饿了！'],
            play_normal: ['玩...饿了...', '累...吃...', '还行...饿了...', '...食物...', '呦...'],
            play_tired: ['累了...饿了...', '不玩...要吃...', '饿...', '...吃...', '没力气...'],
            clean_willing: ['洗完吃吗？', '快结束...饿了...', '...好', '想吃...', '...'],
            clean_unwilling: ['不想洗...想吃...', '饿了...不洗...', '...', '要吃...', '...']
        },
        调皮: {
            normal: ['咬！', '挖', '跳', '藏', '捣乱'],
            feed: ['打翻吃', '玩食物', '藏起', '边吃玩', '有趣'],
            pet: ['咬手', '跳身', '舔脸', '扑倒', '呦'],
            play: ['咬玩具', '球丢', '追', '挖', '呦'],
            sleep: ['睡前再捣乱一下~', 'ZZZ...梦里捣乱...', '明天继续玩~', '睡觉也动来动去~', '呼噜...再玩...'],
            clean: ['水花飞溅！', '泡泡攻击！', '甩你一身水！', '洗澡也捣乱~', '抓抓抓！'],
            feed_full: ['打翻食物！', '玩食物！', '藏起来！', '不吃也要玩！', '打翻！'],
            feed_normal: ['边吃边玩！', '玩一会儿吃！', '打翻！', '藏起来！', '好玩！'],
            feed_hungry: ['狼吞虎咽！', '边吃边捣乱！', '打翻再吃！', '好吃！还要！', '饿坏了！'],
            sleep_energetic: ['不想睡！捣乱！', '还要玩！', '睡前捣乱！', 'ZZZ...捣乱...', '睡不着！'],
            sleep_normal: ['睡一会儿...', 'ZZZ...捣乱...', '明天玩...', '梦里捣乱...', '睡...'],
            sleep_tired: ['累也要捣乱...', '睡...明天捣乱...', 'ZZZ...', '最后捣乱一下...', '呼...'],
            pet_happy: ['咬！扑！', '跑！追！', '捣乱！', '哈哈！', '好玩！'],
            pet_normal: ['咬一下~', '扑一下~', '跑~', '捣乱~', '呦~'],
            pet_sad: ['...捣乱', '...咬', '...', '想捣乱...', '...'],
            play_excited: ['咬玩具！', '挖！', '捣乱！', '好玩！', '呦！'],
            play_normal: ['玩！', '捣乱！', '咬！', '跑！', '扑！'],
            play_tired: ['累了...捣乱...', '没力气...也要...', '...', '最后一下...', '呼...'],
            clean_willing: ['水花！', '泡泡！', '甩水！', '捣乱！', '扑！'],
            clean_unwilling: ['不想洗！', '甩你水！', '跑！', '躲！', '不要！']
        },
        胆小: {
            normal: ['...呦', '怕', '躲起', '别吓', '...主人'],
            feed: ['...谢', '偷吃', '没人', '...好吃', '安心'],
            pet: ['...可以', '温柔', '不怕', '呼噜', '...喜'],
            play: ['...轻', '怕但想', '...慢', '保护', '...好'],
            sleep: ['...晚安', '黑暗好可怕...', '主人陪着...', '蜷缩起来...', '...安全了'],
            clean: ['...水好可怕', '轻一点...', '别弄疼我...', '...好可怕', '...谢谢主人'],
            feed_full: ['...不饿', '放着...', '...', '偷偷吃...', '...'],
            feed_normal: ['...谢谢', '...好吃', '...', '安心...', '...'],
            feed_hungry: ['...终于', '...好吃', '饿...', '谢谢...', '...'],
            sleep_energetic: ['...不想睡', '...怕', '...躲起来', '...', '...'],
            sleep_normal: ['...晚安', '...怕', '...蜷缩', '...', '...'],
            sleep_tired: ['...终于', '...累', '...睡', '...', '...'],
            pet_happy: ['...舒服', '...不怕', '...喜欢', '...安全', '...'],
            pet_normal: ['...可以', '...好', '...', '...嗯', '...'],
            pet_sad: ['...怕', '...别', '...', '...', '...'],
            play_excited: ['...开心', '...怕但想', '...好玩', '...', '...'],
            play_normal: ['...轻', '...怕', '...', '...', '...'],
            play_tired: ['...累', '...怕', '...', '...', '...'],
            clean_willing: ['...轻', '...好', '...', '...', '...'],
            clean_unwilling: ['...怕', '...不要', '...水', '...', '...']
        },
        忠诚: {
            normal: ['守护', '跟随', '等你', '保护', '使命'],
            feed: ['感谢', '不浪费', '爱', '力气', '为主人'],
            pet: ['奖赏', '荣幸', '忠诚', '属于', '主人'],
            play: ['命令', '全力', '保护', '并肩', '永远'],
            sleep: ['守护主人入睡...', '随时待命...', 'ZZZ...保护...', '晚安主人...', '忠诚守护...'],
            clean: ['感谢主人清洗', '为主人保持干净', '忠诚地接受', '干干净净守护你', '谢谢主人'],
            feed_full: ['感谢', '已饱', '留着', '为主人省着', '忠诚'],
            feed_normal: ['感谢', '好吃', '感恩', '有力气', '忠诚'],
            feed_hungry: ['感谢', '终于', '饿坏了', '有力气了', '感恩'],
            sleep_energetic: ['守护', '待命', '不困', '警觉', '忠诚'],
            sleep_normal: ['守护', '待命', 'ZZZ...', '警觉', '忠诚'],
            sleep_tired: ['终于', '累', '守护', '待命', '忠诚'],
            pet_happy: ['荣幸', '忠诚', '感恩', '守护', '主人'],
            pet_normal: ['感谢', '忠诚', '守护', '主人', '荣幸'],
            pet_sad: ['...', '忠诚', '守护', '...', '主人'],
            play_excited: ['全力', '保护', '忠诚', '并肩', '永远'],
            play_normal: ['服从', '全力', '保护', '忠诚', '并肩'],
            play_tired: ['累', '但忠诚', '守护', '...', '坚持'],
            clean_willing: ['感谢', '忠诚', '干净', '守护', '主人'],
            clean_unwilling: ['...', '服从', '忠诚', '...', '接受']
        },
        高冷: {
            normal: ['...', '事？', '烦', '我好', '不要'],
            feed: ['...行', '那', '受', '...谢', '换'],
            pet: ['...可', '久', '...行', '够', '...'],
            play: ['无聊', '稚', '...随', '陪', '完？'],
            sleep: ['...ZZZ', '别吵', '...睡了', '...', '晚安'],
            clean: ['...还行', '快结束', '...可以', '...', '好了吗'],
            feed_full: ['...不饿', '拿走', '...', '不需要', '...'],
            feed_normal: ['...还行', '...', '一般', '...', '凑合'],
            feed_hungry: ['...终于', '...饿', '...吃', '...', '...'],
            sleep_energetic: ['...不困', '...', '别烦', '...', '...'],
            sleep_normal: ['...睡了', '...', '别吵', '...', '...'],
            sleep_tired: ['...终于', '...累', '...', '...', '...'],
            pet_happy: ['...可以', '...还行', '...', '...', '...'],
            pet_normal: ['...', '...行', '...', '...', '...'],
            pet_sad: ['...', '...', '...', '...', '...'],
            play_excited: ['...无聊', '...稚', '...', '...', '...'],
            play_normal: ['...无聊', '...', '...', '...', '...'],
            play_tired: ['...累', '...', '...', '...', '...'],
            clean_willing: ['...还行', '...', '...', '...', '...'],
            clean_unwilling: ['...', '...烦', '...', '...', '...']
        },
        粘人: {
            normal: ['别走', '抱', '跟', '别离', '贴'],
            feed: ['一起', '喂', '看', '还要', '别走'],
            pet: ['永远', '别停', '只对', '永远', '一起'],
            play: ['辈子', '别完', '再来', '陪我', '开心'],
            sleep: ['抱着我睡...', '别离开我...', '一起睡嘛...', '梦里也要一起...', '贴贴睡...'],
            clean: ['陪着我洗...', '别走...', '一起洗澡...', '洗完抱抱...', '不要离开我...'],
            feed_full: ['不饿...但要陪', '一起吃嘛', '别走...', '贴贴...', '陪着我...'],
            feed_normal: ['一起吃~', '喂我~', '别走~', '贴贴~', '陪着我~'],
            feed_hungry: ['终于...', '饿...别走', '好吃...陪我', '谢谢...贴贴', '饿坏了...'],
            sleep_energetic: ['不想睡...要陪', '别走...', '一起...', '贴贴...', '陪着我...'],
            sleep_normal: ['一起睡...', '别离开...', '贴贴...', '陪着我...', '梦里一起...'],
            sleep_tired: ['终于...一起', '累...别走', '贴贴睡...', '陪着我...', '一起...'],
            pet_happy: ['永远...', '别停...', '贴贴...', '陪着我...', '最喜欢...'],
            pet_normal: ['陪着我...', '别走...', '贴贴...', '一起...', '永远...'],
            pet_sad: ['...别走', '...陪着我', '...', '...贴贴', '...'],
            play_excited: ['一辈子！', '别完！', '陪着我！', '最开心！', '永远！'],
            play_normal: ['陪着我！', '别走！', '一起！', '永远！', '贴贴！'],
            play_tired: ['累了...陪着', '别走...', '...一起', '...贴贴', '...'],
            clean_willing: ['陪着我...', '一起...', '贴贴...', '别走...', '永远...'],
            clean_unwilling: ['...别走', '...陪着我', '...', '...一起', '...']
        },
        好奇: {
            normal: ['什么？', '那呢？', '闻', '看', '世界'],
            feed: ['味？', '尝', '吃？', '闻', '趣'],
            pet: ['手法？', '神', '再', '不同', '妙'],
            play: ['新', '怎玩', '试', '新法', '趣'],
            sleep: ['梦里探索...', 'ZZZ...那是什么...', '明天去发现...', '好奇梦里有什么...', '睡醒了去探索...'],
            clean: ['这是什么沐浴露？', '水为什么是湿的？', '泡泡好奇妙！', '洗干净去探索！', '发现新感觉！'],
            feed_full: ['什么？不饿', '闻闻...', '看看...', '不饿但好奇', '...'],
            feed_normal: ['什么味道？', '尝尝~', '好吃~', '有趣~', '再来~'],
            feed_hungry: ['终于！', '什么味道？', '好吃！', '饿坏了！', '有趣！'],
            sleep_energetic: ['不想睡！探索！', '那是什么？', '再看看...', '好奇...', '...'],
            sleep_normal: ['梦里探索...', 'ZZZ...', '明天...', '好奇...', '睡...'],
            sleep_tired: ['终于...', '累...', '梦里...', '...', '探索...'],
            pet_happy: ['神奇！', '什么手法？', '再摸摸！', '好奇妙！', '有趣！'],
            pet_normal: ['什么？', '好奇...', '再试试...', '...', '嗯...'],
            pet_sad: ['...', '好奇...', '...', '...', '...'],
            play_excited: ['新玩法！', '怎么玩？', '有趣！', '发现！', '真棒！'],
            play_normal: ['怎么玩？', '试试...', '有趣...', '...', '嗯...'],
            play_tired: ['累了...', '但好奇...', '...', '...', '...'],
            clean_willing: ['什么沐浴露？', '泡泡！', '水！', '干净！', '有趣！'],
            clean_unwilling: ['...', '水...', '...', '...', '...']
        },
        优雅: {
            normal: ['安', '光好', '雅', '容', '度'],
            feed: ['味好', '恰', '雅吃', '谢', '肴'],
            pet: ['法好', '继', '雅', '悦', '恰'],
            play: ['格调', '雅玩', '度', '容', '快'],
            sleep: ['优雅地入睡', '晚安，主人', '好梦', '从容地休息', '安详的睡眠'],
            clean: ['优雅地沐浴', '保持洁净', '感谢清洗', '焕然一新', '清爽宜人'],
            feed_full: ['已饱，谢了', '无需更多', '恰到好处', '优雅地拒绝', '谢了'],
            feed_normal: ['味好', '恰到好处', '雅', '谢', '美味'],
            feed_hungry: ['终于', '恰到好处', '雅吃', '谢', '美味'],
            sleep_energetic: ['尚不困', '容', '雅', '再等等', '度'],
            sleep_normal: ['该休息了', '雅入睡', '晚安', '容', '安详'],
            sleep_tired: ['终于', '累了', '雅入睡', '安详', '休息'],
            pet_happy: ['悦', '恰到好处', '雅', '继', '适'],
            pet_normal: ['尚可', '继', '雅', '...', '嗯'],
            pet_sad: ['...', '雅', '...', '...', '...'],
            play_excited: ['快', '格调', '雅', '容', '度'],
            play_normal: ['尚可', '雅', '容', '...', '嗯'],
            play_tired: ['累了', '但雅', '容', '...', '度'],
            clean_willing: ['雅', '谢', '洁净', '爽', '适'],
            clean_unwilling: ['...', '容', '...', '...', '...']
        }
    },
    // 仓鼠
    hamster: {
        傲娇: {
            normal: ['哼...', '才不想你', '只是路过', '走开', '吱...'],
            feed: ['哼...还行', '勉强吃', '下次更好', '看食物份上', '吱...'],
            pet: ['吱...别停', '哼...舒服', '谁让你停', '再摸', '吱~'],
            play: ['吱！玩！', '不会输', '哼...好玩', '再来', '吱！'],
            sleep: ['哼...才不想睡', 'ZZZ...别吵', '勉强睡', '才不是因为困', '...呼噜...'],
            clean: ['哼...还行', '勉强让你洗', '别弄湿我的毛', '...还挺干净', '下次换沐浴露'],
            feed_full: ['哼...不饿', '才不想吃', '放着吧...', '吃太饱了...', '勉强闻一下'],
            feed_normal: ['哼...还行', '勉为其难吃', '看在食物份上...', '也就那样', '还算可以'],
            feed_hungry: ['终于知道喂我了！', '饿死我了...', '算你有良心', '快给我吃的！', '等好久了...'],
            sleep_energetic: ['哼...才不想睡', '精神好着呢', '不想睡...', '还早呢...', '勉强躺一下...'],
            sleep_normal: ['有点困了...', '勉强睡一下', '哼...睡就睡', '别吵我...', 'ZZZ...'],
            sleep_tired: ['终于知道让我睡了...', '累死了...', '别吵我...', '要睡很久...', '哼...好困...'],
            pet_happy: ['哼...还行', '就...就这样', '别停...', '勉为其难让你摸', '...呼噜...'],
            pet_normal: ['哼...', '随便你', '就一下', '别摸太久...', '...还行...'],
            pet_sad: ['...不想被摸', '别碰我...', '没心情...', '...走开', '让我静静...'],
            play_excited: ['哼...才没兴奋', '也就一般般', '别得意忘形！', '勉强陪你玩', '我才不激动'],
            play_normal: ['随便玩玩', '还行...', '就这样？', '勉为其难', '哼...'],
            play_tired: ['累了...不玩了', '没力气了...', '你自己玩', '...要休息', '玩不动了...'],
            clean_willing: ['哼...还算舒服', '勉强配合', '...还行', '轻一点...', '快一点...'],
            clean_unwilling: ['不想洗...', '别碰我！', '...好可怕', '轻一点！', '...讨厌...']
        },
        温顺: {
            normal: ['主人~', '想你~', '吱吱', '爱你', '等好久'],
            feed: ['谢谢', '好吃', '主人好', '吱吱', '幸福'],
            pet: ['舒服', '温暖', '多摸摸', '最喜欢', '吱吱'],
            play: ['玩！', '开心', '主人棒', '玩不够', '耶'],
            sleep: ['晚安主人~', '好舒服~', '梦里见~', '呼噜呼噜...', '好安心...'],
            clean: ['谢谢主人~', '变得好香~', '好舒服~', '最喜欢洗澡了~', '干干净净~']
        },
        活泼: {
            normal: ['跑！', '跳跳', '追追', '看！', '蹦蹦'],
            feed: ['吃！', '香！', '再来', '吱吱', '舔'],
            pet: ['蹭蹭', '转转', '舔舔', '吱吱', '兴奋'],
            play: ['球！', '追到', '再扔', '吱', '不够'],
            sleep: ['明天还要玩！', '睡饱饱继续嗨！', '梦里也在跑！', 'ZZZ...冲啊！', '好梦~'],
            clean: ['水花四溅！', '洗澡也好玩！', '甩甩毛！', '泡泡好好玩！', '香喷喷！']
        },
        慵懒: {
            normal: ['吱...困', '不想动', '睡觉', '舒服', 'ZZZ'],
            feed: ['嗯...吃', '吃完睡', '放那', '嚼嚼', '谢'],
            pet: ['呼噜', '舒服', '继续', 'ZZZ', '嗯'],
            play: ['累', '不想跑', '你看', '我看', '吱'],
            sleep: ['终于能睡了...', '窝好软...', '不要叫醒我...', '睡到天荒地老...', '呼噜呼噜...'],
            clean: ['好麻烦...', '洗完能睡吗...', '嗯...还行...', '快结束吧...', 'ZZZ...']
        },
        贪吃: {
            normal: ['饿了吱', '要吃的', '闻到', '给我', '吃饭？'],
            feed: ['好吃', '还要', '舔净', '再来', '吱吱'],
            pet: ['摸给吃？', '舒服但饿', '奖励？', '嗯', '饿了'],
            play: ['玩完吃？', '饿了', '能吃？', '不如吃', '主人饭'],
            sleep: ['梦里也有吃的...', '睡醒了要吃...', 'ZZZ...瓜子...', '好饿...先睡...', '梦里吃大餐...'],
            clean: ['洗完有吃的吗？', '香喷喷...想吃...', '好饿...快结束...', '洗澡不如吃饭...', '干净了好饿...']
        },
        调皮: {
            normal: ['咬！', '挖', '跳', '藏', '捣乱'],
            feed: ['打翻吃', '玩食物', '藏起', '边吃玩', '有趣'],
            pet: ['咬手', '跳身', '舔脸', '扑倒', '吱'],
            play: ['咬玩具', '球丢', '追', '挖', '吱'],
            sleep: ['睡前再捣乱一下~', 'ZZZ...梦里捣乱...', '明天继续玩~', '睡觉也动来动去~', '呼噜...再玩...'],
            clean: ['水花飞溅！', '泡泡攻击！', '甩你一身水！', '洗澡也捣乱~', '抓抓抓！']
        },
        胆小: {
            normal: ['...吱', '怕', '躲起', '别吓', '...主人'],
            feed: ['...谢', '偷吃', '没人', '...好吃', '安心'],
            pet: ['...可以', '温柔', '不怕', '呼噜', '...喜'],
            play: ['...轻', '怕但想', '...慢', '保护', '...好'],
            sleep: ['...晚安', '黑暗好可怕...', '主人陪着...', '蜷缩起来...', '...安全了'],
            clean: ['...水好可怕', '轻一点...', '别弄疼我...', '...好可怕', '...谢谢主人']
        },
        忠诚: {
            normal: ['守护', '跟随', '等你', '保护', '使命'],
            feed: ['感谢', '不浪费', '爱', '力气', '为主人'],
            pet: ['奖赏', '荣幸', '忠诚', '属于', '主人'],
            play: ['命令', '全力', '保护', '并肩', '永远'],
            sleep: ['守护主人入睡...', '随时待命...', 'ZZZ...保护...', '晚安主人...', '忠诚守护...'],
            clean: ['感谢主人清洗', '为主人保持干净', '忠诚地接受', '干干净净守护你', '谢谢主人']
        },
        高冷: {
            normal: ['...', '事？', '烦', '好', '不要'],
            feed: ['...行', '那', '受', '...谢', '换'],
            pet: ['...可', '久', '...行', '够', '...'],
            play: ['无聊', '稚', '...随', '陪', '完？'],
            sleep: ['...ZZZ', '别吵', '...睡了', '...', '晚安'],
            clean: ['...还行', '快结束', '...可以', '...', '好了吗']
        },
        粘人: {
            normal: ['别走', '抱', '跟', '别离', '贴'],
            feed: ['一起', '喂', '看着你', '还要', '别走'],
            pet: ['永远', '别走', '只对你好', '永远', '一起'],
            play: ['一辈子', '别完', '再来', '陪我', '开心'],
            sleep: ['抱着我睡...', '别离开我...', '一起睡嘛...', '梦里也要一起...', '贴贴睡...'],
            clean: ['陪着我洗...', '别走...', '一起洗澡...', '洗完抱抱...', '不要离开我...']
        },
        好奇: {
            normal: ['什么？', '那儿呢？', '闻闻闻', '那个是什么', '世界到底有多大'],
            feed: ['味道？', '尝', '吃？', '闻', '很有趣味'],
            pet: ['手法？', '神', '再来一次！', '不同诶', '妙不可言'],
            play: ['新游戏', '怎么玩', '试一下', '新的方法', '趣'],
            sleep: ['梦里探索...', 'ZZZ...那是什么...', '明天去发现...', '好奇梦里有什么...', '睡醒了去探索...'],
            clean: ['这是什么沐浴露？', '水为什么是湿的？', '泡泡好奇妙！', '洗干净去探索！', '发现新感觉！']
        },
        优雅: {
            normal: ['安好', '雅', '容', '度'],
            feed: ['好吃', '恰', '雅吃', '谢', '肴'],
            pet: ['舒服', '继续', '雅', '悦', '恰好'],
            play: ['怡人', '雅趣', '愉快地度过了', '包容', '快乐'],
            sleep: ['优雅地入睡', '晚安，主人', '好梦', '从容地休息', '安详的睡眠'],
            clean: ['优雅地沐浴', '保持洁净', '感谢清洗', '焕然一新', '清爽宜人']
        }
    },
    // 鸟
    bird: {
        傲娇: {
            normal: ['哼...', '才不想你', '只是路过', '飞走', '啾...'],
            feed: ['哼...还行', '勉强吃', '下次更好', '看食物份上', '啾...'],
            pet: ['啾...别停', '哼...舒服', '谁让你停', '再摸', '啾~'],
            play: ['啾！玩！', '不会输', '哼...好玩', '再来', '啾！'],
            sleep: ['哼...才不想睡', 'ZZZ...别吵', '勉强睡', '才不是因为困', '...呼噜...'],
            clean: ['哼...还行', '勉强让你洗', '别弄湿我的毛', '...还挺干净', '下次换沐浴露']
        },
        温顺: {
            normal: ['主人~', '想你~', '啾啾', '爱你', '等好久'],
            feed: ['谢谢', '好吃', '主人好', '啾啾', '幸福'],
            pet: ['舒服', '温暖', '多摸摸', '最喜欢', '啾啾'],
            play: ['玩！', '开心', '主人棒', '玩不够', '耶'],
            sleep: ['晚安主人~', '好舒服~', '梦里见~', '呼噜呼噜...', '好安心...'],
            clean: ['谢谢主人~', '变得好香~', '好舒服~', '最喜欢洗澡了~', '干干净净~']
        },
        活泼: {
            normal: ['飞！', '跳跳', '追追', '看！', '蹦蹦'],
            feed: ['吃！', '香！', '再来', '啾啾', '舔'],
            pet: ['蹭蹭', '转转', '舔舔', '啾啾', '兴奋'],
            play: ['球！', '追到', '再扔', '啾', '不够'],
            sleep: ['明天还要玩！', '睡饱饱继续嗨！', '梦里也在飞！', 'ZZZ...冲啊！', '好梦~'],
            clean: ['水花四溅！', '洗澡也好玩！', '甩甩毛！', '泡泡好好玩！', '香喷喷！']
        },
        慵懒: {
            normal: ['啾...困', '不想动', '睡觉', '舒服', 'ZZZ'],
            feed: ['嗯...吃', '吃完睡', '放那', '嚼嚼', '谢'],
            pet: ['呼噜', '舒服', '继续', 'ZZZ', '嗯'],
            play: ['累', '不想飞', '你看', '我看', '啾'],
            sleep: ['终于能睡了...', '窝好软...', '不要叫醒我...', '睡到天荒地老...', '呼噜呼噜...'],
            clean: ['好麻烦...', '洗完能睡吗...', '嗯...还行...', '快结束吧...', 'ZZZ...']
        },
        贪吃: {
            normal: ['饿了啾', '要吃的', '闻到', '给我', '吃饭？'],
            feed: ['好吃', '还要', '舔净', '再来', '啾啾'],
            pet: ['摸给吃？', '舒服但饿', '奖励？', '嗯', '饿了'],
            play: ['玩完吃？', '饿了', '能吃？', '不如吃', '主人饭'],
            sleep: ['梦里也有吃的...', '睡醒了要吃...', 'ZZZ...种子...', '好饿...先睡...', '梦里吃大餐...'],
            clean: ['洗完有吃的吗？', '香喷喷...想吃...', '好饿...快结束...', '洗澡不如吃饭...', '干净了好饿...']
        },
        调皮: {
            normal: ['啄！', '飞', '跳', '藏', '捣乱'],
            feed: ['打翻吃', '玩食物', '藏起', '边吃玩', '有趣'],
            pet: ['啄手', '跳身', '舔脸', '扑倒', '啾'],
            play: ['啄玩具', '球丢', '追', '飞', '啾'],
            sleep: ['睡前再捣乱一下~', 'ZZZ...梦里捣乱...', '明天继续玩~', '睡觉也动来动去~', '呼噜...再玩...'],
            clean: ['水花飞溅！', '泡泡攻击！', '甩你一身水！', '洗澡也捣乱~', '抓抓抓！']
        },
        胆小: {
            normal: ['...啾', '怕', '躲起', '别吓', '...主人'],
            feed: ['...谢', '偷吃', '没人', '...好吃', '安心'],
            pet: ['...可以', '温柔', '不怕', '呼噜', '...喜'],
            play: ['...轻', '怕但想', '...慢', '保护', '...好'],
            sleep: ['...晚安', '黑暗好可怕...', '主人陪着...', '蜷缩起来...', '...安全了'],
            clean: ['...水好可怕', '轻一点...', '别弄疼我...', '...好可怕', '...谢谢主人']
        },
        忠诚: {
            normal: ['守护', '跟随', '等你', '保护', '使命'],
            feed: ['感谢', '不浪费', '爱', '力气', '为主人'],
            pet: ['奖赏', '荣幸', '忠诚', '属于', '主人'],
            play: ['命令', '全力', '保护', '并肩', '永远'],
            sleep: ['守护主人入睡...', '随时待命...', 'ZZZ...保护...', '晚安主人...', '忠诚守护...'],
            clean: ['感谢主人清洗', '为主人保持干净', '忠诚地接受', '干干净净守护你', '谢谢主人']
        },
        高冷: {
            normal: ['...', '事？', '烦', '我好着呢', '不要'],
            feed: ['...行', '那行', '受累了', '...谢谢', '不用换，就这样'],
            pet: ['...可', '久', '...行', '够', '...'],
            play: ['无聊', '幼稚的游戏', '...随便你', '勉为其难陪你', '结束了？'],
            sleep: ['...ZZZ', '别吵', '...睡了', '...', '晚安'],
            clean: ['...还行', '快结束', '...可以', '...', '好了吗']
        },
        粘人: {
            normal: ['别走', '抱', '跟着你！', '别离开我', '贴贴！'],
            feed: ['一起', '喂', '看', '还要', '别走'],
            pet: ['永远', '别停', '只对', '永远', '一起'],
            play: ['一辈子', '别完', '再来', '陪我', '开心'],
            sleep: ['抱着我睡...', '别离开我...', '一起睡嘛...', '梦里也要一起...', '贴贴睡...'],
            clean: ['陪着我洗...', '别走...', '一起洗澡...', '洗完抱抱...', '不要离开我...']
        },
        好奇: {
            normal: ['什么？', '那呢？', '闻', '看', '世界'],
            feed: ['味？', '尝', '吃？', '闻', '趣'],
            pet: ['手法？', '神', '再', '不同', '妙'],
            play: ['新', '怎玩', '试', '新法', '趣'],
            sleep: ['梦里探索...', 'ZZZ...那是什么...', '明天去发现...', '好奇梦里有什么...', '睡醒了去探索...'],
            clean: ['这是什么沐浴露？', '水为什么是湿的？', '泡泡好奇妙！', '洗干净去探索！', '发现新感觉！']
        },
        优雅: {
            normal: ['安', '光好', '雅', '容', '度'],
            feed: ['味好', '恰', '雅吃', '谢', '肴'],
            pet: ['法好', '继', '雅', '悦', '恰'],
            play: ['格调', '雅玩', '度', '容', '快'],
            sleep: ['优雅地入睡', '晚安，主人', '好梦', '从容地休息', '安详的睡眠'],
            clean: ['优雅地沐浴', '保持洁净', '感谢清洗', '焕然一新', '清爽宜人']
        }
    }
};

// 旧版简单对话（保留兼容）
const PET_SPEECHES = {
    cat: ['喵~', '呼噜呼噜~', '喵呜？', '咪呜~', '喵喵！', '哈欠~', '喵~我想吃鱼', '咕噜咕噜'],
    dog: ['汪汪！', '呜~汪！', '汪汪汪~', '嗷呜~', '哼哼~', '汪！主人！', '呜呜~求摸摸', '汪汪！球！'],
    rabbit: ['吱吱~', '蹦蹦跳跳~', '嗅嗅~', '吱？', '蹦~', '嚼嚼嚼~', '吱吱吱！', '嗅嗅嗅~'],
    fox: ['呦~', '嗷~', '呦呦~', '嗷呜~', '嘻嘻~', '呦？', '嗷嗷~', '呦呦呦！'],
    hamster: ['吱吱~', '咕叽咕叽~', '吱？', '吱吱吱！', '咕~', '吱吱~吃的！', '咕叽~', '吱！'],
    bird: ['啾啾~', '咕咕~', '啾？', '啾啾啾！', '咕噜咕噜~', '啾~亮闪闪！', '咕~', '啾！好开心~']
};

function updateActivity() {
    const pet = getCurrentPet();
    if (!pet) return;
    const activities = PET_ACTIVITIES[pet.type] || PET_ACTIVITIES.cat;
    const activity = activities[Math.floor(Math.random() * activities.length)];
    document.getElementById('activity-text').textContent = activity;
}

function showActivityModal() {
    try {
        const pet = getCurrentPet();
        if (!pet) return;

    // 检查是否正在外出
    if (isPetOut()) {
        showToast(`👀 ${pet.name}正在外出，不在家哦~`);
        return;
    }

    const now = Date.now();
    const lastCheck = pet.lastActivityCheck;
    const tenMinutes = 10 * 60 * 1000; // 10分钟

    // 设置弹窗内容
    document.getElementById('activity-modal-img').src = getPetImg(pet);
    document.getElementById('activity-modal-pet-name').textContent = pet.name;

    const activities = PET_ACTIVITIES[pet.type] || PET_ACTIVITIES.cat;
    let activity;

    const cooldownDiv = document.getElementById('activity-modal-cooldown');

    if (lastCheck && (now - lastCheck) < tenMinutes) {
        // 10分钟内，使用固定活动
        activity = pet.currentActivity || activities[Math.floor(Math.random() * activities.length)];
        // 显示冷却提示
        const remaining = Math.ceil((tenMinutes - (now - lastCheck)) / 60000);
        cooldownDiv.style.display = 'block';
        cooldownDiv.textContent = `${pet.name}说：待会再来看我吧~还有${remaining}分钟`;
    } else {
        // 超过10分钟，随机新活动并固定
        activity = activities[Math.floor(Math.random() * activities.length)];
        pet.lastActivityCheck = now;
        pet.currentActivity = activity;
        cooldownDiv.style.display = 'none';
        Storage.save();
    }

    document.getElementById('activity-modal-text').textContent = activity;
    document.getElementById('activity-modal').classList.add('show');
    } catch(e) { console.error('showActivityModal error:', e); }
}

// 判断宠物是否正在外出
function isPetOut() {
    const pet = getCurrentPet();
    return pet && pet.goOutEndTime && Date.now() < pet.goOutEndTime;
}

function goOut() {
    try {
        const pet = getCurrentPet();
        if (!pet) return;

    // 检查是否正在外出中
    if (isPetOut()) {
        const remaining = Math.ceil((pet.goOutEndTime - Date.now()) / 60000);
        document.getElementById('recall-pet-name').textContent = pet.name;
        document.getElementById('recall-destination').textContent = `正在${pet.goOutDestination || '外面'}玩（还有${remaining}分钟回来）`;
        document.getElementById('recall-modal').classList.add('show');
        return;
    }

    // 检查每日外出次数
    const today = new Date().toDateString();
    if (pet.lastGoOutReset !== today) {
        pet.dailyGoOutCount = 0;
        pet.lastGoOutReset = today;
    }

    if (pet.dailyGoOutCount >= 3) {
        showToast(`🚪 ${pet.name}今日已经玩够了，明天再出去吧~`);
        return;
    }

    // 检查饱食度和精力
    if (pet.stats.hunger < 20) {
        showToast(`🚪 ${pet.name}太饿了，先喂点东西再出门吧~`);
        return;
    }
    if (pet.stats.energy < 20) {
        showToast(`🚪 ${pet.name}太累了，先休息一下再出门吧~`);
        return;
    }

    const destinations = ['公园', '海边', '森林', '商场', '朋友家', '宠物店'];
    const destination = destinations[Math.floor(Math.random() * destinations.length)];

    // 消耗饱食度和精力
    const hungerCost = 15 + Math.floor(Math.random() * 10);
    const energyCost = 20 + Math.floor(Math.random() * 10);
    pet.stats.hunger = Math.max(0, pet.stats.hunger - hungerCost);
    pet.stats.energy = Math.max(0, pet.stats.energy - energyCost);

    // 设置外出结束时间（1小时）
    pet.goOutEndTime = Date.now() + 60 * 60 * 1000;
    pet.dailyGoOutCount = (pet.dailyGoOutCount || 0) + 1;
    pet.goOutDestination = destination;

    showToast(`🚪 ${pet.name}去${destination}玩了！1小时后回来~`);
    showSpeech(`出门啦！${destination}见~`);

    // 重置邀请状态
    pet.goOutWithOwner = false;

    Storage.save();
    updatePetUI();

    // 1小时后自动回来
    const returnDelay = 60 * 60 * 1000;
    setTimeout(() => petReturnFromOuting(), returnDelay);

    // 外出期间有概率触发邀请一同外出（30%概率，外出后5-15分钟触发）
    if (Math.random() < 0.3) {
        const inviteDelay = (5 + Math.floor(Math.random() * 10)) * 60 * 1000;
        setTimeout(() => triggerGoOutInvite(pet, destination), inviteDelay);
    }
    } catch(e) { console.error('goOut error:', e); }
}

function triggerGoOutInvite(pet, destination) {
    try {
        // 确认宠物还在外出中
        if (!isPetOut()) return;

        pet.goOutWithOwner = true;

        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <div class="achievement-popup-content" style="border-color: var(--mint);">
                <div style="font-size:2.5rem;margin-bottom:8px;">💌</div>
                <div style="font-weight:700;font-size:1rem;color:var(--text);margin-bottom:4px;">${pet.name}邀请你！</div>
                <div style="font-size:0.85rem;color:var(--text-light);">${pet.name}在${destination}想和你一起玩~</div>
                <div style="font-size:0.8rem;color:var(--mint);margin-top:8px;">现在可以和${pet.name}互动啦！</div>
            </div>
        `;
        // 添加到 pet-container 内
        const petContainer = document.querySelector('.pet-container');
        if (petContainer) {
            petContainer.appendChild(popup);
        } else {
            document.body.appendChild(popup);
        }
        setTimeout(() => popup.classList.add('show'), 50);
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => popup.remove(), 400);
        }, 4000);

        showToast(`💌 ${pet.name}邀请你一起去${destination}玩！`);
    } catch(e) { console.error('triggerGoOutInvite error:', e); }
}

// 强制召回确认
window.confirmRecall = function() {
    const pet = getCurrentPet();
    if (!pet || !isPetOut()) {
        closeModal('recall-modal');
        return;
    }

    const destination = pet.goOutDestination || '外面';
    pet.goOutEndTime = null;
    pet.goOutWithOwner = false;

    closeModal('recall-modal');
    showToast(`🏠 ${pet.name}被你召回啦！下次玩开心再回来~`);
    showSpeech(`呜...还没玩够呢`);

    Storage.save();
    updatePetUI();
};

function petReturnFromOuting() {
    const pet = getCurrentPet();
    if (!pet) return;

    const destination = pet.goOutDestination || '外面';
    pet.goOutEndTime = null;

    // 增加心情
    const moodGain = 10 + Math.floor(Math.random() * 15);
    pet.stats.mood = Math.min(100, pet.stats.mood + moodGain);

    // 随机获得金币（30%概率）
    let coinGain = 0;
    if (Math.random() < 0.3) {
        coinGain = 10 + Math.floor(Math.random() * 20);
        gameState.coins += coinGain;
    }

    // 随机获得战利品（50%概率）
    const loot = Math.random() < 0.5 ? generateLoot() : null;
    if (loot) {
        gameState.locker.treasure.push(loot);
        if (coinGain > 0) {
            showToast(`🎉 ${pet.name}从${destination}回来了！心情+${moodGain}，带回了${loot.icon}${loot.name}和${coinGain}金币！`);
        } else {
            showToast(`🎉 ${pet.name}从${destination}回来了！心情+${moodGain}，带回了${loot.icon}${loot.name}！`);
        }
    } else if (coinGain > 0) {
        showToast(`🎉 ${pet.name}从${destination}回来了！心情+${moodGain}，带回了${coinGain}金币！`);
    } else {
        showToast(`🎉 ${pet.name}从${destination}回来了！心情+${moodGain}`);
    }

    showSpeech(`${destination}真好玩~`);

    Storage.save();
    updatePetUI();
}

// 战利品库
const LOOT_TABLE = [
    { icon: '💎', name: '小宝石', desc: '闪闪发光的小石头', type: 'treasure' },
    { icon: '🌸', name: '干花标本', desc: '漂亮的压花', type: 'treasure' },
    { icon: '🐚', name: '漂亮贝壳', desc: '海边捡到的贝壳', type: 'treasure' },
    { icon: '🍂', name: '红枫叶', desc: '秋天的礼物', type: 'treasure' },
    { icon: '⭐', name: '幸运星', desc: '闪闪的星星', type: 'treasure' },
    { icon: '🪨', name: '奇石', desc: '形状奇特的小石头', type: 'treasure' },
    { icon: '🧸', name: '小毛绒玩具', desc: '柔软的玩偶', type: 'supplies' },
    { icon: '🎾', name: '小皮球', desc: '弹弹弹', type: 'supplies' },
    { icon: '🪮', name: '精致梳子', desc: '梳毛专用', type: 'supplies' },
    { icon: '🎀', name: '可爱蝴蝶结', desc: '戴在头上', type: 'supplies' },
    { icon: '🧣', name: '小围巾', desc: '保暖好物', type: 'supplies' },
    { icon: '🪣', name: '小水桶', desc: '玩沙子用', type: 'supplies' }
];

function generateLoot() {
    const loot = LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)];
    return {
        ...loot,
        id: 'loot_' + Date.now(),
        obtainedAt: new Date().toISOString()
    };
}

// ===== 置物柜 =====
function showLocker() {
    try {
        renderLockerContent('treasure');
        document.getElementById('locker-modal').classList.add('show');
    } catch(e) { console.error('showLocker error:', e); }
}

window.switchLockerTab = function(tab) {
    document.querySelectorAll('.locker-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.locker-tab[data-tab="${tab}"]`).classList.add('active');
    renderLockerContent(tab);
};

function renderLockerContent(tab) {
    const container = document.getElementById('locker-content');
    const items = gameState.locker[tab] || [];

    if (items.length === 0) {
        container.innerHTML = '<div class="locker-empty">还没有物品哦~外出探索可以获取！</div>';
        return;
    }

    // 统计宝藏数量
    const itemCounts = {};
    items.forEach(item => {
        const key = item.name;
        if (!itemCounts[key]) {
            itemCounts[key] = { item, count: 0, ids: [] };
        }
        itemCounts[key].count++;
        itemCounts[key].ids.push(item.id);
    });

    container.innerHTML = Object.values(itemCounts).map(({ item, count, ids }) => {
        let actionBtn = '';
        if (tab === 'treasure' && count > 1) {
            actionBtn = `<button class="locker-sell-btn" onclick="sellTreasure('${item.name}', ${count})">卖出 💰${count * 5}</button>`;
        } else if (tab === 'supplies' && item.id === 's5') {
            // 宠物药显示使用按钮
            actionBtn = `<button class="locker-sell-btn" onclick="useMedicine()">使用</button>`;
        }
        return `
        <div class="locker-item">
            <div class="locker-item-icon">${item.icon}</div>
            <div class="locker-item-info">
                <div class="locker-item-name">${item.name}${count > 1 ? ` x${count}` : ''}</div>
                <div class="locker-item-desc">${item.desc}</div>
            </div>
            ${actionBtn}
        </div>
    `}).join('');
}

// 卖出宝藏
window.sellTreasure = function(itemName, count) {
    const treasure = gameState.locker.treasure;
    const toSell = [];

    // 找出要卖出的物品
    for (let i = treasure.length - 1; i >= 0; i--) {
        if (treasure[i].name === itemName && toSell.length < count) {
            toSell.push(i);
        }
    }

    // 删除并计算金币
    const sellCount = toSell.length;
    const coinGain = sellCount * 5;

    toSell.forEach(index => {
        treasure.splice(index, 1);
    });

    gameState.coins += coinGain;
    Storage.save();
    updatePetUI();
    renderLockerContent('treasure');

    showToast(`💰 卖出了${sellCount}个${itemName}，获得${coinGain}金币！`);
};

// 使用宠物药治疗
window.useMedicine = function() {
    const pet = getCurrentPet();
    if (!pet) return;

    if (!pet.isSick) {
        showToast(`${pet.name}很健康，不需要吃药~`);
        return;
    }

    // 检查是否有药
    const medicineIndex = gameState.locker.supplies.findIndex(s => s.id === 's5');
    if (medicineIndex === -1 || gameState.locker.supplies[medicineIndex].count <= 0) {
        showToast('😢 没有宠物药了，去商场购买吧！');
        return;
    }

    // 消耗药品
    gameState.locker.supplies[medicineIndex].count--;
    if (gameState.locker.supplies[medicineIndex].count === 0) {
        gameState.locker.supplies.splice(medicineIndex, 1);
    }

    // 治愈
    pet.isSick = false;
    pet.stats.mood = Math.min(100, pet.stats.mood + 10);

    Storage.save();
    updatePetUI();
    showToast(`💊 ${pet.name}吃药后恢复健康了！心情+10`);
};

// ===== 小屋家具数据 =====
const HOUSE_FURNITURE = {
    feeder: { id: 'feeder', icon: '🥣', name: '自动喂食器', desc: '装满了新鲜的食物', state: '满的' },
    toy: { id: 'toy', icon: '🐟', name: '玩偶', desc: '毛茸茸的玩具', state: '摆在地上' },
    bed: { id: 'bed', icon: '🛏️', name: '小窝', desc: '软软的小床', state: '很整洁' },
    window: { id: 'window', icon: '🪟', name: '窗户', desc: '阳光照进来', state: '阳光明媚' },
    bowl: { id: 'bowl', icon: '🥛', name: '水碗', desc: '干净的水', state: '满满的' },
    cushion: { id: 'cushion', icon: '🧸', name: '靠垫', desc: '软软的靠垫', state: '放在角落' }
};

// ===== 小屋 =====
function showHouse() {
    try {
        const pet = getCurrentPet();
        if (!pet) return;

    // 生成小屋描述
    const desc = `你正待在${pet.name}的小屋中。${HOUSE_FURNITURE.feeder.name}是${HOUSE_FURNITURE.feeder.state}的。${HOUSE_FURNITURE.toy.name}${HOUSE_FURNITURE.toy.state}。`;
    document.getElementById('house-desc').textContent = desc;

    // 生成家具列表
    const furnitureList = Object.values(HOUSE_FURNITURE);
    document.getElementById('house-furniture').innerHTML = furnitureList.map(item => `
        <div class="furniture-item" onclick="interactFurniture('${item.id}')">
            <div class="furniture-item-icon">${item.icon}</div>
            <div class="furniture-item-info">
                <div class="furniture-item-name">${item.name}</div>
                <div class="furniture-item-desc">${item.desc} · ${item.state}</div>
            </div>
        </div>
    `).join('');

    // 显示/隐藏繁育标签
    const breedingTabBtn = document.getElementById('breeding-tab-btn');
    if (hasBreedingBox()) {
        breedingTabBtn.style.display = 'inline-block';
    } else {
        breedingTabBtn.style.display = 'none';
    }

    // 默认显示概况页
    switchHouseTab('overview');

    document.getElementById('house-modal').classList.add('show');
    } catch(e) { console.error('showHouse error:', e); }
}

// 显示宠物名片
window.showPetCard = function() {
    try {
        const pet = getCurrentPet();
        if (!pet) return;

    document.getElementById('pet-card-img').src = getPetImg(pet);
    document.getElementById('pet-card-name').textContent = pet.name;
    document.getElementById('pet-card-breed').textContent = pet.breed ? pet.breed.name : PET_TYPES[pet.type].name;
    document.getElementById('pet-card-gender').textContent = pet.gender === 'male' ? '♂️ 公' : '♀️ 母';
    document.getElementById('pet-card-personality').textContent = pet.personality ? pet.personality.name : '未知';
    document.getElementById('pet-card-level').textContent = `LV.${pet.level}`;

    // 健康状态
    const healthEl = document.getElementById('pet-card-health');
    if (pet.isSick) {
        healthEl.textContent = '生病 😷';
        healthEl.className = 'pet-card-value sick';
    } else {
        healthEl.textContent = '健康 ✨';
        healthEl.className = 'pet-card-value';
    }

    // 状态条
    document.getElementById('pet-card-hunger').style.width = pet.stats.hunger + '%';
    document.getElementById('pet-card-hunger-val').textContent = pet.stats.hunger;
    document.getElementById('pet-card-mood').style.width = pet.stats.mood + '%';
    document.getElementById('pet-card-mood-val').textContent = pet.stats.mood;
    document.getElementById('pet-card-energy').style.width = pet.stats.energy + '%';
    document.getElementById('pet-card-energy-val').textContent = pet.stats.energy;
    document.getElementById('pet-card-affection').style.width = pet.stats.affection + '%';
    document.getElementById('pet-card-affection-val').textContent = pet.stats.affection;

    // 子女信息
    const childrenEl = document.getElementById('pet-card-children');
    if (pet.children && pet.children.length > 0) {
        const childrenNames = pet.children.map(childId => {
            const child = gameState.pets[childId];
            return child ? child.name : '未知';
        }).join('、');
        childrenEl.textContent = childrenNames;
    } else {
        childrenEl.textContent = '暂无';
    }

    // 颜色
    document.getElementById('pet-card-color').textContent = pet.color || '普通色';

    // 特殊能力显示
    const abilityEl = document.getElementById('pet-card-ability');
    if (pet.specialAbility) {
        abilityEl.innerHTML = `<span class="ability-tag rare" title="${pet.specialAbility.desc}">✨ ${pet.specialAbility.name}</span>`;
    } else {
        abilityEl.innerHTML = '<span style="color:var(--text-light);">无</span>';
    }

    // 技能显示
    const skillsEl = document.getElementById('pet-card-skills');
    if (pet.skills && pet.skills.length > 0) {
        const skillsHtml = pet.skills.map(skillId => {
            const skill = PET_SKILLS[skillId];
            return skill ? `<span class="skill-tag" title="${skill.desc}">${skill.icon} ${skill.name}</span>` : '';
        }).join('');
        skillsEl.innerHTML = skillsHtml || '<span style="color:var(--text-light);">暂无技能</span>';
    } else {
        skillsEl.innerHTML = '<span style="color:var(--text-light);">暂无技能</span>';
    }

    document.getElementById('pet-card-modal').classList.add('show');
    } catch(e) { console.error('showPetCard error:', e); }
};

window.interactFurniture = function(id) {
    const pet = getCurrentPet();
    if (!pet) return;

    const furniture = HOUSE_FURNITURE[id];
    const interactions = {
        feeder: `${pet.name}开心地吃着${furniture.name}里的食物~饱食度+10`,
        toy: `你和${pet.name}一起玩${furniture.name}！心情+10`,
        bed: `${pet.name}在${furniture.name}里打了个滚，看起来很满足~`,
        window: `${pet.name}趴在${furniture.name}边晒太阳，好舒服~`,
        bowl: `${pet.name}喝了${furniture.name}里的水，精力+5`,
        cushion: `${pet.name}把${furniture.name}当成了玩具，咬来咬去~`
    };

    showToast(interactions[id] || `${pet.name}对${furniture.name}很感兴趣~`);

    // 实际效果
    if (id === 'feeder') {
        pet.stats.hunger = Math.min(100, pet.stats.hunger + 10);
    } else if (id === 'toy') {
        pet.stats.mood = Math.min(100, pet.stats.mood + 10);
    } else if (id === 'bowl') {
        pet.stats.energy = Math.min(100, pet.stats.energy + 5);
    }

    Storage.save();
    updatePetUI();
};

// ===== 放生功能 =====
window.showReleaseConfirm = function() {
    try {
        const pet = getCurrentPet();
        if (!pet) return;
        document.getElementById('release-pet-name').textContent = pet.name;
        document.getElementById('release-modal').classList.add('show');
    } catch(e) { console.error('showReleaseConfirm error:', e); }
};

window.confirmRelease = function() {
    const pet = getCurrentPet();
    if (!pet) return;

    const petId = pet.id;
    const petName = pet.name;

    // 删除宠物数据
    delete gameState.pets[petId];

    // 如果没有其他宠物，返回选择界面
    const remainingPets = Object.keys(gameState.pets);
    if (remainingPets.length === 0) {
        gameState.currentPet = null;
        closeModal('release-modal');
        closeModal('switch-pet-modal');
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('start-screen').classList.add('active');
        showToast(`😢 ${petName}已回归自然...`);
    } else {
        // 切换到下一个宠物
        gameState.currentPet = remainingPets[0];
        closeModal('release-modal');
        closeModal('switch-pet-modal');
        updatePetUI();
        showToast(`😢 ${petName}已回归自然...`);
    }

    Storage.save();
};

// ===== 繁育系统 =====
function hasBreedingBox() {
    return gameState.houseFurniture.some(f => f.id === 'fu6');
}

// 检查宠物是否成年
function isAdult(pet) {
    return pet.level >= 30 || pet.stage === 'adult';
}

// 小屋标签切换
window.switchHouseTab = function(tab) {
    document.querySelectorAll('.house-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.house-tab[data-tab="${tab}"]`).classList.add('active');

    document.querySelectorAll('.house-content').forEach(c => c.style.display = 'none');
    if (tab === 'overview') {
        document.getElementById('house-overview').style.display = 'block';
    } else if (tab === 'furniture') {
        document.getElementById('house-furniture-page').style.display = 'block';
    } else if (tab === 'breeding') {
        document.getElementById('house-breeding-page').style.display = 'block';
        renderBreedingMateList();
    }
};

// 繁育子标签切换
window.switchBreedingTab = function(tab) {
    document.querySelectorAll('.breeding-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.breeding-tab[data-tab="${tab}"]`).classList.add('active');

    document.querySelectorAll('.breeding-content').forEach(c => c.style.display = 'none');
    document.getElementById('breeding-' + tab).style.display = 'block';

    if (tab === 'mate') {
        renderBreedingMateList();
    } else if (tab === 'pregnant') {
        renderPregnantList();
    } else if (tab === 'chart') {
        renderBreedingChart();
    }
};

// 渲染配对列表
function renderBreedingMateList() {
    const container = document.getElementById('mate-pet-list');
    const currentPet = getCurrentPet();
    if (!currentPet) return;

    // 找出同类型、成年、异性、未怀孕的宠物
    const matePets = Object.values(gameState.pets).filter(pet =>
        pet.id !== currentPet.id &&
        pet.type === currentPet.type &&
        pet.gender !== currentPet.gender &&
        isAdult(pet) &&
        !pet.isPregnant &&
        isAdult(currentPet) &&
        !currentPet.isPregnant
    );

    if (matePets.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:var(--text-light);padding:20px;">没有可配对的宠物<br><small>需要两只成年、同类型、异性且未怀孕的宠物</small></div>';
        return;
    }

    container.innerHTML = matePets.map(pet => `
        <div class="mate-pet-item" onclick="selectMate('${pet.id}')">
            <img src="${getPetImg(pet)}" class="mate-pet-avatar">
            <div class="mate-pet-info">
                <div class="mate-pet-name">${pet.name} ${pet.gender === 'male' ? '♂️' : '♀️'}</div>
                <div class="mate-pet-detail">${pet.breed ? pet.breed.name : ''} · ${pet.color || ''} · LV.${pet.level}</div>
            </div>
            <span class="mate-pet-status adult">成年</span>
        </div>
    `).join('') + `
        <div style="margin-top:15px;text-align:center;">
            <button class="dreamy-btn primary" onclick="confirmBreeding()" id="confirm-breed-btn" disabled>选择宠物进行配对</button>
        </div>
    `;
}

// 选中的配偶
let selectedMateId = null;
window.selectMate = function(mateId) {
    selectedMateId = mateId;
    document.querySelectorAll('.mate-pet-item').forEach(el => el.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    document.getElementById('confirm-breed-btn').disabled = false;
    document.getElementById('confirm-breed-btn').textContent = '确认配对';
};

// 确认繁育
window.confirmBreeding = function() {
    const currentPet = getCurrentPet();
    const partner = gameState.pets[selectedMateId];
    if (!currentPet || !partner) return;

    // 检查好感度
    if (currentPet.stats.affection < 50 || partner.stats.affection < 50) {
        showToast('💕 两只宠物的好感度都需要达到50以上才能繁育！');
        return;
    }

    // 确定母体（雌性）
    const mother = currentPet.gender === 'female' ? currentPet : partner;
    const father = currentPet.gender === 'male' ? currentPet : partner;

    // 设置怀孕状态
    mother.isPregnant = true;
    mother.pregnantStartTime = Date.now();
    mother.pregnantWith = father.id;

    // 降低好感度
    currentPet.stats.affection = Math.max(0, currentPet.stats.affection - 20);
    partner.stats.affection = Math.max(0, partner.stats.affection - 20);

    selectedMateId = null;
    Storage.save();
    updatePetUI();

    showToast(`🎉 ${mother.name}怀孕了！5天后会生下宝宝~`);
    switchBreedingTab('pregnant');
};

// 渲染怀孕列表
function renderPregnantList() {
    const container = document.getElementById('pregnant-list');
    const pregnantPets = Object.values(gameState.pets).filter(pet => pet.isPregnant);

    if (pregnantPets.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:var(--text-light);padding:20px;">没有怀孕的宠物</div>';
        return;
    }

    container.innerHTML = pregnantPets.map(pet => {
        const daysPassed = Math.floor((Date.now() - pet.pregnantStartTime) / (24 * 60 * 60 * 1000));
        const daysLeft = Math.max(0, 5 - daysPassed);
        const progress = Math.min(100, (daysPassed / 5) * 100);
        const father = gameState.pets[pet.pregnantWith];

        return `
            <div class="pregnant-item">
                <div class="pregnant-header">
                    <span class="pregnant-name">🤰 ${pet.name}</span>
                    <span class="pregnant-days">${daysLeft > 0 ? `还有${daysLeft}天` : '即将生产！'}</span>
                </div>
                <div style="font-size:0.75rem;color:var(--text-light);margin-bottom:8px;">
                    父亲: ${father ? father.name : '未知'}
                </div>
                <div class="pregnant-progress">
                    <div class="pregnant-progress-bar" style="width:${progress}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

// 渲染繁育图谱
function renderBreedingChart() {
    const container = document.getElementById('breeding-chart-content');
    const currentPet = getCurrentPet();
    if (!currentPet) return;

    const chart = BREEDING_CHART[currentPet.type] || [];

    container.innerHTML = chart.map(breed => {
        // 检查是否已解锁
        const hasBreed = Object.values(gameState.pets).some(p => p.breed && p.breed.id === breed.id);
        const unlocked = breed.unlock === 'base' || hasBreed;
        const specialClass = breed.special ? 'special' : (unlocked ? 'unlocked' : '');

        return `
            <div class="chart-item ${specialClass}">
                <div class="chart-icon">${breed.icon}</div>
                <div class="chart-name">${breed.name}</div>
                <div class="chart-desc">${breed.special ? '特殊品种' : '基础品种'}</div>
                ${breed.parents.length > 0 ? `<div class="chart-desc">${breed.parents.map(p => PET_BREEDS[currentPet.type].find(b => b.id === p)?.name || p).join('+')}</div>` : ''}
            </div>
        `;
    }).join('');
}

// 检查并处理怀孕生产
function checkPregnancy() {
    try {
        const now = Date.now();
        if (!gameState.pets) return;
        const pregnantPets = Object.values(gameState.pets).filter(pet => pet.isPregnant);

        pregnantPets.forEach(mother => {
            const daysPassed = Math.floor((now - mother.pregnantStartTime) / (24 * 60 * 60 * 1000));
            if (daysPassed >= 5) {
                // 生产！
                const father = gameState.pets[mother.pregnantWith];
                if (father) {
                    // 打开命名弹窗
                    showBabyNamingModal(mother, father);
                }
            }
        });
    } catch(e) { console.error('checkPregnancy error:', e); }
}

// 显示宝宝命名弹窗
function showBabyNamingModal(mother, father) {
    // 临时存储父母信息
    gameState.pendingBaby = {
        motherId: mother.id,
        fatherId: father.id,
        type: mother.type
    };

    document.getElementById('baby-mother-name').textContent = mother.name;
    document.getElementById('baby-father-name').textContent = father.name;
    document.getElementById('baby-name-input').value = '';
    document.getElementById('naming-modal').classList.add('show');
}

// 确认宝宝名字
window.confirmBabyName = function() {
    const name = document.getElementById('baby-name-input').value.trim();
    if (!name) {
        showToast('请给宝宝取个名字~');
        return;
    }

    const pending = gameState.pendingBaby;
    if (!pending) return;

    const mother = gameState.pets[pending.motherId];
    const father = gameState.pets[pending.fatherId];

    // 创建宝宝
    const baby = createPetData(pending.type, name, mother.ownerName, {
        father: father,
        mother: mother
    });

    // 添加到父母的子女列表
    if (!mother.children) mother.children = [];
    if (!father.children) father.children = [];
    mother.children.push(baby.id);
    father.children.push(baby.id);

    // 清除怀孕状态
    mother.isPregnant = false;
    mother.pregnantStartTime = null;
    mother.pregnantWith = null;

    delete gameState.pendingBaby;

    closeModal('naming-modal');
    Storage.save();
    updatePetUI();

    showToast(`🎉 ${name}出生了！是个${baby.gender === 'male' ? '男孩' : '女孩'}~`);
};

// ===== 商场商品数据 =====
const SHOP_ITEMS = {
    food: [
        { id: 'f1', icon: '🥕', name: '高级胡萝卜', desc: '营养丰富的胡萝卜', price: 5 },
        { id: 'f2', icon: '🐟', name: '鲜鱼干', desc: '新鲜美味的小鱼干', price: 8 },
        { id: 'f3', icon: '🥩', name: '优质肉干', desc: '高蛋白肉干', price: 100 },
        { id: 'f4', icon: '🍰', name: '宠物蛋糕', desc: '生日必备甜点', price: 150 },
        { id: 'berry', icon: '🫐', name: '浆果', desc: '红色的酸甜果子', price: 15},
        { id: 'cheese', icon: '🧀', name: '奶酪', desc: '奶香四溢', price: 20 },
        { id: 'apple', icon: '🍎', name: '苹果', desc: '熟透了', price: 5 },
        { id: 'cookie', icon: '🍪', name: '饼干', desc: '吃多了会口渴吧？', price: 15 },
        { id: 'milk', icon: '🥛', name: '牛奶', desc: '喝完会长高高', price: 20 },
        { id: 'honey', icon: '🍯', name: '蜂蜜', desc: '+感谢勤劳的蜜蜂们', price: 30 }
    ],
    furniture: [
        { id: 'fu1', icon: '🏰', name: '猫爬架', desc: '多层攀爬架', price: 300 },
        { id: 'fu2', icon: '🎡', name: '跑轮', desc: '仓鼠专用', price: 80 },
        { id: 'fu3', icon: '🎪', name: '帐篷', desc: '私密小空间', price: 200 },
        { id: 'fu4', icon: '🧶', name: '毛线球', desc: '猫咪最爱', price: 30 },
        { id: 'fu5', icon: '🦴', name: '咬咬骨', desc: '狗狗玩具', price: 40 },
        { id: 'fu6', icon: '🏠', name: '繁育箱', desc: '解锁繁育功能', price: 500 },
        { id: 'fu7', icon: '🐱', name: '招财猫', desc: '自动收取金币', price: 800 }
    ],
    clothes: [
        { id: 'c1', icon: '🎀', name: '蝴蝶结', desc: '可爱装饰', price: 60 },
        { id: 'c2', icon: '👑', name: '小皇冠', desc: '贵族气质', price: 120 },
        { id: 'c3', icon: '🧣', name: '围巾', desc: '保暖又时尚', price: 80 },
        { id: 'c4', icon: '🕶️', name: '墨镜', desc: '酷酷的风格', price: 100 },
        { id: 'c5', icon: '🔔', name: '铃铛', desc: '属于你的证明', price: 30 },
        { id: 'c6', icon: '🔔', name: '翅膀', desc: '属于它的天使已经遇到', price: 150 },
        { id: 'c7', icon: '🔔', name: '项圈', desc: '柔软的皮质项圈', price: 50 }
    ],
    supplies: [
        { id: 's1', icon: '🪮', name: '宠物梳子', desc: '梳毛神器', price: 50 },
        { id: 's2', icon: '🧴', name: '沐浴露', desc: '香喷喷', price: 60 },
        { id: 's3', icon: '🧼', name: '宠物香皂', desc: '温和不刺激', price: 40 },
        { id: 's4', icon: '✂️', name: '指甲剪', desc: '修剪专用', price: 70 },
        { id: 's5', icon: '💊', name: '宠物药', desc: '治疗生病的宠物', price: 100 }
    ]
};

// ===== 商场 =====
function showShop() {
    try {
        renderShopContent('food');
        document.getElementById('pet-shop-modal').classList.add('show');
    } catch(e) { console.error('showShop error:', e); }
}

window.switchShopTab = function(tab) {
    document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.shop-tab[data-tab="${tab}"]`).classList.add('active');
    renderShopContent(tab);
};

function renderShopContent(tab) {
    const container = document.getElementById('pet-shop-content');
    const items = SHOP_ITEMS[tab] || [];

    container.innerHTML = items.map(item => `
        <div class="shop-item" onclick="buyItem('${tab}', '${item.id}')">
            <div class="shop-item-icon">${item.icon}</div>
            <div class="shop-item-info">
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-desc">${item.desc}</div>
            </div>
            <div class="shop-item-price">💰${item.price}</div>
        </div>
    `).join('');
}

// 当前待购买商品
let pendingPurchase = null;

window.buyItem = function(tab, itemId) {
    const pet = getCurrentPet();
    if (!pet) return;

    const item = SHOP_ITEMS[tab].find(i => i.id === itemId);
    if (!item) return;

    // 保存待购买信息
    pendingPurchase = { tab, item };

    // 显示购买确认弹窗
    document.getElementById('pet-shop-buy-name').textContent = item.name;
    document.getElementById('pet-shop-buy-icon').textContent = item.icon;
    document.getElementById('pet-shop-buy-price').textContent = item.price;
    document.getElementById('pet-shop-buy-total').textContent = item.price;
    document.getElementById('pet-shop-buy-quantity').value = 1;

    document.getElementById('pet-shop-buy-modal').classList.add('show');
};

// 更新购买总价
window.updateBuyTotal = function() {
    if (!pendingPurchase) return;
    const quantity = parseInt(document.getElementById('pet-shop-buy-quantity').value) || 1;
    const total = pendingPurchase.item.price * quantity;
    document.getElementById('pet-shop-buy-total').textContent = total;
};

// 确认购买
window.confirmBuy = function() {
    if (!pendingPurchase) return;

    const pet = getCurrentPet();
    const { tab, item } = pendingPurchase;
    const quantity = parseInt(document.getElementById('pet-shop-buy-quantity').value) || 1;
    const totalPrice = item.price * quantity;

    if (gameState.coins < totalPrice) {
        showToast('💰 萌宠币不足，外出探索可以获得更多哦~');
        closeModal('pet-shop-buy-modal');
        return;
    }

    // 扣除萌宠币
    gameState.coins -= totalPrice;

    // 按类别放入不同位置
    if (tab === 'food') {
        // 食物存入食物库
        const existingFood = gameState.foodStorage.find(f => f.id === item.id);
        if (existingFood) {
            existingFood.count += quantity;
        } else {
            gameState.foodStorage.push({
                id: item.id,
                icon: item.icon,
                name: item.name,
                desc: item.desc,
                hunger: 20,
                count: quantity
            });
        }
        showToast(`🍖 购买了${quantity}份${item.name}！已存入食物库`);
    } else if (tab === 'furniture') {
        // 家具放入小屋
        for (let i = 0; i < quantity; i++) {
            gameState.houseFurniture.push({ ...item, obtainedAt: new Date().toISOString() });
        }
        showToast(`🪑 购买了${quantity}个${item.name}！已放入小屋`);
    } else if (tab === 'clothes') {
        // 服饰放入衣柜
        for (let i = 0; i < quantity; i++) {
            gameState.wardrobe.push({ ...item, obtainedAt: new Date().toISOString() });
        }
        showToast(`👔 购买了${quantity}件${item.name}！已放入衣柜`);
    } else if (tab === 'supplies') {
        // 宠物用具放入置物柜（可叠加数量）
        const existing = gameState.locker.supplies.find(s => s.id === item.id);
        if (existing) {
            existing.count = (existing.count || 1) + quantity;
        } else {
            gameState.locker.supplies.push({ ...item, count: quantity, obtainedAt: new Date().toISOString() });
        }
        showToast(`🧸 购买了${quantity}个${item.name}！已放入置物柜`);
    }

    // 更新萌宠币显示
    document.getElementById('coin-amount').textContent = gameState.coins;

    pendingPurchase = null;
    closeModal('pet-shop-buy-modal');
    saveGame();Storage.save();
    updatePetUI();
};

// ===== 衣柜 =====
function showWardrobe() {
    try {
        const pet = getCurrentPet();
        if (!pet) return;

    // 更新顶部穿搭显示
    updateOutfitDisplay();

    // 渲染衣服列表
    renderWardrobeList();

    document.getElementById('wardrobe-modal').classList.add('show');
    } catch(e) { console.error('showWardrobe error:', e); }
}

function updateOutfitDisplay() {
    const pet = getCurrentPet();
    const outfitContent = document.getElementById('outfit-content');

    if (!pet) return;

    // 确保currentOutfits存在
    if (!pet.currentOutfits) pet.currentOutfits = [];

    if (pet.currentOutfits.length === 0) {
        outfitContent.textContent = `${pet.name}没有穿戴任何饰品`;
    } else {
        const outfitNames = pet.currentOutfits.map(o => o.name).join('、');
        outfitContent.textContent = `${pet.name}正戴着：${outfitNames}`;
    }
}

function renderWardrobeList() {
    const container = document.getElementById('wardrobe-list');
    const items = gameState.wardrobe || [];
    const pet = getCurrentPet();

    if (!pet) return;
    if (!pet.currentOutfits) pet.currentOutfits = [];

    if (items.length === 0) {
        container.innerHTML = '<div class="wardrobe-empty">衣柜还是空的~去商场买点衣服吧！</div>';
        return;
    }

    container.innerHTML = items.map(item => {
        const isWearing = pet.currentOutfits.some(o => o.id === item.id);
        const btnClass = isWearing ? 'remove' : 'wear';
        const btnText = isWearing ? '脱下' : '穿戴';

        return `
            <div class="wardrobe-item">
                <div class="wardrobe-item-icon">${item.icon}</div>
                <div class="wardrobe-item-info">
                    <div class="wardrobe-item-name">${item.name}</div>
                    <div class="wardrobe-item-desc">${item.desc}</div>
                </div>
                <button class="wardrobe-item-btn ${btnClass}" onclick="toggleOutfit('${item.id}')">${btnText}</button>
            </div>
        `;
    }).join('');
}

window.toggleOutfit = function(itemId) {
    const item = gameState.wardrobe.find(i => i.id === itemId);
    if (!item) return;

    const pet = getCurrentPet();
    if (!pet) return;
    if (!pet.currentOutfits) pet.currentOutfits = [];

    const index = pet.currentOutfits.findIndex(o => o.id === itemId);

    if (index > -1) {
        // 已穿戴，脱下
        pet.currentOutfits.splice(index, 1);
        showToast(`👔 ${pet.name}脱下了${item.name}`);
    } else {
        // 未穿戴，穿上
        pet.currentOutfits.push(item);
        showToast(`👔 ${pet.name}戴上了${item.name}！好可爱~`);
    }

    // 更新显示
    updateOutfitDisplay();
    renderWardrobeList();

    Storage.save();
};

function randomSpeak(context = 'normal') {
    try {
        const pet = getCurrentPet();
        if (!pet || !pet.stats) return;
    
    // 根据状态确定子上下文
    let stateContext = context;
    
    // 喂食时根据饱食度选择不同对话
    if (context === 'feed') {
        if (pet.stats.hunger >= 80) {
            stateContext = 'feed_full';  // 饱食度高 - 不饿
        } else if (pet.stats.hunger >= 40) {
            stateContext = 'feed_normal'; // 饱食度中等
        } else {
            stateContext = 'feed_hungry'; // 饱食度低 - 很饿
        }
    }
    
    // 睡觉时根据精力选择不同对话
    if (context === 'sleep') {
        if (pet.stats.energy >= 70) {
            stateContext = 'sleep_energetic'; // 精力充沛 - 不想睡
        } else if (pet.stats.energy >= 30) {
            stateContext = 'sleep_normal';    // 精力一般
        } else {
            stateContext = 'sleep_tired';     // 精力低 - 很累
        }
    }
    
    // 抚摸时根据心情选择不同对话
    if (context === 'pet') {
        if (pet.stats.mood >= 70) {
            stateContext = 'pet_happy';    // 心情好
        } else if (pet.stats.mood >= 30) {
            stateContext = 'pet_normal';   // 心情一般
        } else {
            stateContext = 'pet_sad';      // 心情差
        }
    }
    
    // 玩耍时根据精力和心情综合选择
    if (context === 'play') {
        if (pet.stats.energy >= 60 && pet.stats.mood >= 60) {
            stateContext = 'play_excited';  // 状态好 - 兴奋
        } else if (pet.stats.energy < 30) {
            stateContext = 'play_tired';    // 累了
        } else {
            stateContext = 'play_normal';   // 一般
        }
    }
    
    // 清洁时根据心情选择
    if (context === 'clean') {
        if (pet.stats.mood >= 60) {
            stateContext = 'clean_willing';  // 心情好 - 配合
        } else {
            stateContext = 'clean_unwilling'; // 心情不好 - 不配合
        }
    }
    
    // 优先使用性格+种类对话系统
    const typeDialogues = PET_DIALOGUES[pet.type];
    if (typeDialogues && pet.personality) {
        const personalityDialogues = typeDialogues[pet.personality.name];
        if (personalityDialogues) {
            // 先尝试状态特定对话，如果没有则回退到基础对话
            const contextDialogues = personalityDialogues[stateContext] || personalityDialogues[context] || personalityDialogues.normal;
            if (contextDialogues && contextDialogues.length > 0) {
                const speech = contextDialogues[Math.floor(Math.random() * contextDialogues.length)];
                showSpeech(speech);
                return;
            }
        }
    }
    
    // 回退到旧版简单对话
    const speeches = PET_SPEECHES[pet.type] || PET_SPEECHES.cat;
    const speech = speeches[Math.floor(Math.random() * speeches.length)];
    showSpeech(speech);
    } catch(e) { console.error('randomSpeak error:', e); }
}

// ===== 宠物选择 =====
function selectPet(type) {
    gameState.currentPet = type;
    document.querySelectorAll('.pet-card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`.pet-card[data-pet="${type}"]`).classList.add('selected');
    // 弹出取名弹窗
    document.getElementById('name-modal-img').textContent = getPetEmoji(type);
    document.getElementById('name-modal-pet-type').textContent = PET_TYPES[type].name;
    // 显示可能的品种
    const breeds = PET_BREEDS[type] || [];
    const breedNames = breeds.map(b => b.name).join('、');
    document.getElementById('name-modal-pet-desc').textContent = breedNames ? `可能是：${breedNames}` : '';
    document.getElementById('pet-name-input').value = '';
    document.getElementById('owner-name-input').value = '';
    document.getElementById('name-modal').classList.add('show');
}

// 取消命名，回到宠物选择
window.cancelNaming = function() {
    closeModal('name-modal');
    // 取消选中状态
    document.querySelectorAll('.pet-card').forEach(c => c.classList.remove('selected'));
    gameState.currentPet = null;
};

// ===== 开始游戏 =====
function startGame() {
    const name = document.getElementById('pet-name-input').value.trim();
    if (!name) { showToast('请输入一个可爱的名字~'); return; }
    const ownerName = document.getElementById('owner-name-input').value.trim() || '主人';

    const type = gameState.currentPet;
    const pet = createPetData(type, name, ownerName);
    gameState.currentPet = pet.id;

    if (!gameState.dailyTasks.length || gameState.lastTaskReset !== new Date().toDateString()) {
        gameState.dailyTasks = generateDailyTasks();
        gameState.lastTaskReset = new Date().toDateString();
    }

    Storage.save();
    closeModal('name-modal');
    showGameScreen();
    updatePetUI();
    // 显示品种信息
    if (pet.breed) {
        showToast(`${name}（${pet.breed.name}）：你好呀，${ownerName}~`);
    } else {
        showToast(`${name}：你好呀，${ownerName}~`);
    }

    // 启动状态衰减定时器
    startStatusDecay();

    // 启动随机事件
    startRandomEvents();

    // 检测后台离开时间
    checkOfflineTime();
}

function createPetData(type, name, ownerName = '主人', parentData = null) {
    // 固定为幼年阶段
    const petId = 'pet_' + (++gameState.petIdCounter);

    // 随机性格
    const personality = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];

    // 随机子品种（如果有父母数据，可能遗传或变异）
    let breed = null;
    if (parentData && parentData.father && parentData.mother) {
        // 繁育获得，可能获得特殊品种
        breed = determineBreedFromParents(type, parentData.father, parentData.mother);
    } else {
        // 领养获得基础品种
        const breeds = PET_BREEDS[type] || [];
        breed = breeds.length > 0 ? breeds[Math.floor(Math.random() * breeds.length)] : null;
    }

    // 随机性别
    const gender = Math.random() < 0.5 ? 'male' : 'female';

    // 随机颜色（如果有父母，可能遗传）
    const colors = PET_COLORS[type] || ['普通色'];
    let color = colors[Math.floor(Math.random() * colors.length)];
    if (parentData && parentData.father && parentData.mother) {
        // 50%概率继承父亲或母亲的颜色
        const parentColor = Math.random() < 0.5 ? parentData.father.color : parentData.mother.color;
        if (Math.random() < 0.7) {
            color = parentColor; // 70%概率继承
        }
    }

    const petData = {
        id: petId, type, name, ownerName, level: 1, exp: 0, expToNext: 50, stage: 'baby',
        personality: personality,  // 随机性格
        breed: breed,  // 品种
        color: color,  // 颜色
        gender: gender,  // 性别：male/female
        favoriteFood: breed ? breed.favoriteFood : null,  // 品种最爱食物
        favoriteFoodBonusDate: null,  // 今天是否已经触发过最喜欢食物的额外奖励
        stats: {
            hunger: 50 + Math.floor(Math.random() * 40),
            mood: 50 + Math.floor(Math.random() * 40),
            energy: 50 + Math.floor(Math.random() * 40),
            affection: 30 + Math.floor(Math.random() * 30)
        },
        // 每宠独立的状态
        currentOutfits: [],       // 当前穿戴的饰品
        currentActivity: null,    // 当前活动
        lastActivityCheck: null,  // 上次查看活动时间
        goOutEndTime: null,       // 外出结束时间
        goOutWithOwner: false,    // 是否邀请主人同行
        goOutDestination: null,   // 外出目的地
        dailyGoOutCount: 0,       // 今日外出次数
        lastGoOutReset: null,     // 外出次数重置日期
        // 繁育相关
        children: [],             // 子女ID列表
        parents: parentData ? { father: parentData.father.id, mother: parentData.mother.id } : null,  // 父母ID
        isPregnant: false,        // 是否怀孕
        pregnantStartTime: null,  // 怀孕开始时间
        pregnantWith: null,       // 与谁怀孕
        // 技能系统
        skills: [],               // 已学会的技能ID列表
        // 特殊能力（稀有品种自带）
        specialAbility: breed && breed.rare ? {
            id: breed.ability,
            name: breed.abilityName,
            desc: breed.abilityDesc
        } : null,
        createdAt: new Date().toISOString()
    };

    // 检查并学习等级触发的技能
    checkAndLearnSkills(petData);

    gameState.pets[petId] = petData;
    return petData;
}

// 检查并学习技能
function checkAndLearnSkills(pet) {
    if (!pet.skills) pet.skills = [];
    let newSkillLearned = false;

    Object.values(PET_SKILLS || {}).forEach(skill => {
        // 检查是否已学会
        if (pet.skills.includes(skill.id)) return;

        // 检查触发条件
        if (skill.trigger === 'level' && pet.level >= skill.level) {
            pet.skills.push(skill.id);
            newSkillLearned = true;
        }
    });

    if (newSkillLearned) {
        Storage.save();
    }
}

// 获取宠物技能效果
function getSkillEffects(pet) {
    const effects = {
        hungerDecay: 1,      // 饱食度下降倍率
        moodDecay: 1,        // 心情下降倍率
        energyDecay: 1,      // 精力下降倍率
        coinProduction: 1,   // 金币产出倍率
        treasureBonus: 0,    // 宝藏额外概率
        coinBonus: 0,        // 金币额外概率
        affectionGain: 1,    // 好感度获取倍率
        expGain: 1,          // 经验获取倍率
        sickResist: 0,       // 抗病概率
        statCap: 0,          // 状态上限加成
        eventBonus: 0,       // 随机事件触发概率
        goOutBonus: 1        // 外出奖励倍率
    };

    // 应用技能效果
    if (pet.skills) {
        pet.skills.forEach(skillId => {
            const skill = PET_SKILLS[skillId];
            if (skill && skill.effect) {
                Object.keys(skill.effect).forEach(key => {
                    effects[key] += skill.effect[key];
                });
            }
        });
    }

    // 应用稀有品种特殊能力
    if (pet.specialAbility) {
        switch (pet.specialAbility.id) {
            case 'talkative': // 话痨 - 更容易触发随机事件
                effects.eventBonus += 0.5;
                break;
            case 'lucky': // 幸运 - 金币获取+50%
                effects.coinBonus += 0.5;
                effects.coinProduction += 0.5;
                break;
            case 'cute': // 萌力 - 好感度获取+100%
                effects.affectionGain += 1.0;
                break;
            case 'ice': // 冰霜 - 状态下降速度-30%
                effects.hungerDecay -= 0.3;
                effects.moodDecay -= 0.3;
                effects.energyDecay -= 0.3;
                break;
            case 'hoard': // 囤积 - 饱食度下降速度-50%
                effects.hungerDecay -= 0.5;
                break;
            case 'fly': // 飞翔 - 外出带回双倍奖励
                effects.goOutBonus += 1.0;
                effects.treasureBonus += 0.5;
                break;
        }
    }

    return effects;
}

// 根据父母决定子代品种
function determineBreedFromParents(type, father, mother) {
    const chart = BREEDING_CHART[type] || [];

    // 检查是否能获得特殊品种（包括稀有品种）
    for (const breed of chart) {
        if (breed.special && breed.parents.length === 2) {
            const [p1, p2] = breed.parents;
            // 检查父母组合是否匹配（顺序不重要）
            const parentIds = [father.breed.id, mother.breed.id];
            if ((parentIds[0] === p1 && parentIds[1] === p2) ||
                (parentIds[0] === p2 && parentIds[1] === p1)) {
                // 稀有品种使用指定概率，其他特殊品种默认30%
                const chance = breed.rare ? (breed.chance || 0.1) : 0.3;
                if (Math.random() < chance) {
                    return breed;
                }
            }
        }
    }

    // 否则随机继承父母之一
    return Math.random() < 0.5 ? father.breed : mother.breed;
}

// ===== 状态衰减系统 =====
let decayTimer = null;

function startStatusDecay() {
    // 记录当前在线时间
    gameState.lastOnlineTime = Date.now();
    Storage.save();

    // 每分钟衰减一次
    if (decayTimer) clearInterval(decayTimer);
    decayTimer = setInterval(() => {
        const now = Date.now();
        gameState.lastOnlineTime = now;

        if (!gameState.pets) return;
        Object.values(gameState.pets).forEach(pet => {
            if (!pet.stats) return;

            // 获取技能效果
            const effects = getSkillEffects(pet);

            // 每分钟衰减（应用技能效果）
            pet.stats.hunger = Math.max(0, pet.stats.hunger - (1 * effects.hungerDecay));
            pet.stats.mood = Math.max(0, pet.stats.mood - (1 * effects.moodDecay));
            pet.stats.energy = Math.max(0, pet.stats.energy - (1 * effects.energyDecay));

            // 患病检测：状态过低时概率患病（应用抗病技能）
            if (!pet.isSick) {
                const lowStats = (pet.stats.hunger < 20 ? 1 : 0) +
                                 (pet.stats.mood < 20 ? 1 : 0) +
                                 (pet.stats.energy < 20 ? 1 : 0);
                // 每有一个状态低于20，5%概率患病（减去抗病概率）
                const sickChance = Math.max(0, 0.05 - effects.sickResist);
                for (let i = 0; i < lowStats; i++) {
                    if (Math.random() < sickChance) {
                        pet.isSick = true;
                        showToast(`😷 ${pet.name}生病了！快去买药治疗~`);
                        break;
                    }
                }
            }

            // 检查并学习新技能
            checkAndLearnSkills(pet);
        });

        // 检查怀孕
        checkPregnancy();

        Storage.save();
        updatePetUI();
    }, 60 * 1000); // 1分钟

    // 启动金币生产定时器
    if (coinProductionTimer) clearInterval(coinProductionTimer);
    coinProductionTimer = setInterval(() => {
        produceCoins();
        // 如果有招财猫，自动收取
        autoCollectCoins();
    }, COIN_PRODUCTION_INTERVAL);
}

function checkOfflineTime() {
    const now = Date.now();
    const lastOnline = gameState.lastOnlineTime;

    // 没有上次在线记录，说明是第一次，跳过
    if (!lastOnline) return;

    const offlineMinutes = Math.floor((now - lastOnline) / (60 * 1000));

    // 离开不超过1分钟，不处理
    if (offlineMinutes < 1) return;

    const SIX_HOURS = 6 * 60; // 360分钟

    if (!gameState.pets) return;
    
    // 计算离线期间可以生产的金币次数（每5分钟一次）
    const productionCycles = Math.floor(offlineMinutes / 5);
    
    Object.values(gameState.pets).forEach(pet => {
        if (!pet.stats) return;

        // 补偿离线期间的金币（最多补偿6小时的量）
        if (productionCycles > 0 && pet.stats.hunger > 0) {
            // 饥饿度大于0才能生产金币
            const maxCycles = Math.min(productionCycles, 72); // 最多72个周期（6小时）
            if (!pet.pendingCoins) pet.pendingCoins = 0;
            try {
                const productionPerCycle = calculateCoinProduction(pet);
                const offlineCoins = productionPerCycle * maxCycles;
                pet.pendingCoins += offlineCoins;
            } catch(e) { console.error('offline coin production error:', e); }
        }

        if (offlineMinutes > SIX_HOURS) {
            // 超过6小时：小幅度下降（最多降15点）
            const decay = Math.min(15, Math.floor(offlineMinutes / 60));
            pet.stats.hunger = Math.max(0, pet.stats.hunger - decay);
            pet.stats.mood = Math.max(0, pet.stats.mood - decay);
            pet.stats.energy = Math.max(0, pet.stats.energy - decay);
        } else {
            // 6小时内：按实际离开时间衰减（每分钟-1）
            pet.stats.hunger = Math.max(0, pet.stats.hunger - offlineMinutes);
            pet.stats.mood = Math.max(0, pet.stats.mood - offlineMinutes);
            pet.stats.energy = Math.max(0, pet.stats.energy - offlineMinutes);
        }
    });

    Storage.save();
    updatePetUI();

    // 超过6小时弹窗提示
    if (offlineMinutes > SIX_HOURS) {
        try {
            const hours = Math.floor(offlineMinutes / 60);
            const pet = getCurrentPet();
            const petName = pet ? pet.name : '宠物';

            const popup = document.createElement('div');
            popup.className = 'achievement-popup';
            popup.innerHTML = `
                <div class="achievement-popup-content" style="border-color: var(--lavender);">
                    <div style="font-size:2.5rem;margin-bottom:8px;">😴</div>
                    <div style="font-weight:700;font-size:1rem;color:var(--text);margin-bottom:4px;">欢迎回来！</div>
                    <div style="font-size:0.85rem;color:var(--text-light);">你不在的这段时间内，梦角帮你照顾了${petName}</div>
                    <div style="font-size:0.75rem;color:var(--lavender);margin-top:8px;">离开了约${hours}小时</div>
                </div>
            `;
            // 添加到 pet-container 内
            const petContainer = document.querySelector('.pet-container');
            if (petContainer) {
                petContainer.appendChild(popup);
            } else {
                document.body.appendChild(popup);
            }
            setTimeout(() => popup.classList.add('show'), 50);
            setTimeout(() => {
                popup.classList.remove('show');
                setTimeout(() => popup.remove(), 400);
            }, 4000);
        } catch(e) { console.error('offline popup error:', e); }
    }
}

function generateDailyTasks() {
    const allTasks = [
        { id: 'feed', text: '喂宠物吃饭', target: 3, current: 0, reward: 20, action: 'feed' },
        { id: 'feed5', text: '喂宠物5次', target: 5, current: 0, reward: 35, action: 'feed' },
        { id: 'pet', text: '摸摸宠物', target: 5, current: 0, reward: 15, action: 'pet' },
        { id: 'pet8', text: '抚摸宠物8次', target: 8, current: 0, reward: 25, action: 'pet' },
        { id: 'play', text: '和宠物玩耍', target: 2, current: 0, reward: 30, action: 'play' },
        { id: 'play3', text: '玩游戏3次', target: 3, current: 0, reward: 45, action: 'play' },
        { id: 'clean', text: '给宠物洗澡', target: 1, current: 0, reward: 25, action: 'clean' },
        { id: 'clean2', text: '清洁宠物2次', target: 2, current: 0, reward: 40, action: 'clean' },
        { id: 'sleep', text: '让宠物休息', target: 1, current: 0, reward: 15, action: 'sleep' },
        { id: 'sleep2', text: '让宠物睡个好觉', target: 2, current: 0, reward: 30, action: 'sleep' },
        { id: 'custom_food', text: '喂一次自定义食物', target: 1, current: 0, reward: 20, action: 'feed' },
        { id: 'win_game', text: '赢一场小游戏', target: 1, current: 0, reward: 35, action: 'play' }
    ];
    // 随机选5个不重复的任务
    const shuffled = allTasks.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5).map(t => ({ ...t, current: 0 }));
}

function showGameScreen() {
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    startRandomSpeak();

    // 启动状态衰减定时器
    startStatusDecay();

    // 启动随机事件
    startRandomEvents();

    // 检测后台离开时间
    checkOfflineTime();
}

// ===== 互动弹窗 =====
function showInteractionModal(action) {
    try {
        const pet = getCurrentPet();
        if (!pet) return;

        // 检查是否正在外出（且未被邀请）
        if (isPetOut() && !pet.goOutWithOwner) {
            showToast(`🚪 ${pet.name}正在外出，不在家哦~`);
            return;
        }

        const config = INTERACTION_OPTIONS[action];
        if (!config) return;

        currentInteraction = action;

        // 获取DOM元素并检查
        const header = document.getElementById('modal-header');
        const modalIcon = document.getElementById('modal-icon');
        const modalTitle = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        const interactionModal = document.getElementById('interaction-modal');
        
        if (!header || !modalIcon || !modalTitle || !body || !interactionModal) {
            console.error('showInteractionModal: 缺少必要的DOM元素');
            return;
        }

        header.className = 'modal-header ' + config.headerColor;
        modalIcon.textContent = config.icon;
        modalTitle.textContent = config.title;

        body.innerHTML = '<div class="interaction-options"></div>';
        const container = body.querySelector('.interaction-options');
        if (!container) {
            console.error('showInteractionModal: 无法创建interaction-options容器');
            return;
        }

        // 获取选项（支持静态数组或动态函数）
        const options = config.getOptions ? config.getOptions() : config.options;
        if (!options || !Array.isArray(options)) {
            console.error('showInteractionModal: 选项无效', options);
            return;
        }

        options.forEach(option => {
            const card = document.createElement('div');
            card.className = 'option-card' + (option.disabled ? ' disabled' : '');
            card.innerHTML = `
                <div class="option-icon">${option.icon || '❓'}</div>
                <div class="option-info">
                    <div class="option-title">${option.name || '未知'}</div>
                    <div class="option-desc">${option.desc || ''}</div>
                </div>
            `;
            if (!option.disabled) {
                card.addEventListener('click', () => {
                    if (option.id === 'click') {
                        startClickGame();
                    } else if (option.id === 'memory') {
                        startMemoryGame();
                    } else if (option.id === 'rps') {
                        startRPSGame();
                    } else {
                        doInteraction(action, option);
                    }
                });
            }
            container.appendChild(card);
        });

        interactionModal.classList.add('show');
    } catch(e) {
        console.error('showInteractionModal error:', e);
    }
}

function showCustomFeedDialog() {
    const body = document.getElementById('modal-body');
    body.innerHTML = `
        <div class="custom-input-group">
            <label>✨ 食物名称</label>
            <input type="text" id="custom-food-name" class="dreamy-input" placeholder="输入食物名字...">
        </div>
        <div class="custom-input-group">
            <label>🎯 效果选择</label>
            <div style="display:flex;gap:10px;flex-direction:column;">
                <label class="radio-option" style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:10px;background:var(--cream);border-radius:12px;">
                    <input type="radio" name="food-effect" value="10" checked>
                    <span>普通 (+10饱食度)</span>
                </label>
                <label class="radio-option" style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:10px;background:var(--cream);border-radius:12px;">
                    <input type="radio" name="food-effect" value="20">
                    <span>好吃 (+20饱食度)</span>
                </label>
                <label class="radio-option" style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:10px;background:var(--cream);border-radius:12px;">
                    <input type="radio" name="food-effect" value="30">
                    <span>超级好吃 (+30饱食度 +心情)</span>
                </label>
            </div>
        </div>
        <button class="dreamy-btn primary" style="width:100%;margin-top:10px;" onclick="doCustomFeed()">喂食 ✨</button>
    `;
}

function doCustomFeed() {
    const name = document.getElementById('custom-food-name').value.trim();
    if (!name) { showToast('请输入食物名称~'); return; }
    const effect = parseInt(document.querySelector('input[name="food-effect"]:checked').value);
    const option = {
        name: name, hunger: effect,
        mood: effect >= 30 ? 10 : 0,
        exp: effect >= 30 ? 15 : effect >= 20 ? 10 : 5
    };
    doInteraction('feed', option);
}

// ===== 小游戏 =====
function startClickGame() {
    const body = document.getElementById('modal-body');
    let score = 0;
    let timeLeft = 10;
    body.innerHTML = `
        <div style="text-align:center;">
            <div style="font-size:1.2rem;font-weight:700;margin-bottom:10px;">⚡ 点击星星！</div>
            <div style="font-size:0.9rem;color:var(--text-light);margin-bottom:15px;">得分: <span id="click-score">0</span> | 剩余: <span id="click-time">10</span>秒</div>
            <div id="click-area" style="width:100%;height:200px;background:var(--cream);border-radius:16px;position:relative;cursor:pointer;overflow:hidden;"></div>
        </div>
    `;

    const area = document.getElementById('click-area');
    const timer = setInterval(() => {
        timeLeft--;
        document.getElementById('click-time').textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            area.onclick = null;
            const pet = getCurrentPet();
            if (pet) {
                pet.stats.mood = Math.min(100, pet.stats.mood + score * 2);
                addExp(pet, score >= 10 ? 20 : 10);
                gameState.stats.totalPlays++;
                updateTask('play');
                checkAchievements();
                Storage.save();
                updatePetUI();
            }
            body.innerHTML = `
                <div style="text-align:center;padding:20px;">
                    <div style="font-size:3rem;margin-bottom:10px;">${score >= 10 ? '🎉' : '😊'}</div>
                    <div style="font-size:1.2rem;font-weight:700;margin-bottom:5px;">游戏结束！</div>
                    <div style="color:var(--text-light);margin-bottom:15px;">你点击了 ${score} 颗星星！</div>
                    <button class="dreamy-btn primary" onclick="closeModal()">太棒了 ✨</button>
                </div>
            `;
        }
    }, 1000);

    area.onclick = (e) => {
        const star = document.createElement('span');
        star.textContent = '⭐';
        star.style.cssText = `position:absolute;font-size:1.5rem;pointer-events:none;transition:all 0.5s;`;
        const rect = area.getBoundingClientRect();
        star.style.left = (e.clientX - rect.left - 12) + 'px';
        star.style.top = (e.clientY - rect.top - 12) + 'px';
        area.appendChild(star);
        setTimeout(() => { star.style.opacity = '0'; star.style.transform = 'scale(2) translateY(-30px)'; }, 50);
        setTimeout(() => star.remove(), 500);
        score++;
        document.getElementById('click-score').textContent = score;
    };

    // 自动生成星星
    const starGen = setInterval(() => {
        if (timeLeft <= 0) { clearInterval(starGen); return; }
        const star = document.createElement('span');
        star.textContent = '⭐';
        const x = Math.random() * (area.offsetWidth - 30);
        const y = Math.random() * (area.offsetHeight - 30);
        star.style.cssText = `position:absolute;left:${x}px;top:${y}px;font-size:1.5rem;cursor:pointer;animation:gentle-bounce 1s ease-in-out infinite;pointer-events:auto;`;
        star.onclick = (e) => {
            e.stopPropagation();
            score++;
            document.getElementById('click-score').textContent = score;
            star.style.transition = 'all 0.3s';
            star.style.opacity = '0';
            star.style.transform = 'scale(2)';
            setTimeout(() => star.remove(), 300);
        };
        area.appendChild(star);
        setTimeout(() => { if (star.parentNode) star.remove(); }, 2000);
    }, 800);
}

function startMemoryGame() {
    const emojis = ['🌸', '⭐', '🌙', '💖', '🌈', '🦋'];
    const pairs = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    let flipped = [];
    let matched = 0;
    let moves = 0;

    const body = document.getElementById('modal-body');
    body.innerHTML = `
        <div style="text-align:center;margin-bottom:10px;">
            <span style="font-weight:700;">🧠 记忆翻牌</span>
            <span style="color:var(--text-light);margin-left:10px;">翻牌: <span id="memory-moves">0</span></span>
        </div>
        <div id="memory-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;"></div>
    `;

    const grid = document.getElementById('memory-grid');
    pairs.forEach((emoji, i) => {
        const card = document.createElement('div');
        card.style.cssText = 'aspect-ratio:1;background:var(--lavender-light);border:2px solid var(--lavender);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;cursor:pointer;transition:all 0.3s;user-select:none;';
        card.textContent = '?';
        card.dataset.index = i;
        card.dataset.emoji = emoji;
        card.dataset.flipped = 'false';
        card.addEventListener('click', () => flipCard(card));
        grid.appendChild(card);
    });

    function flipCard(card) {
        if (card.dataset.flipped === 'true' || flipped.length >= 2) return;
        card.dataset.flipped = 'true';
        card.textContent = card.dataset.emoji;
        card.style.background = 'var(--pink-light)';
        card.style.borderColor = 'var(--pink)';
        flipped.push(card);

        if (flipped.length === 2) {
            moves++;
            document.getElementById('memory-moves').textContent = moves;
            if (flipped[0].dataset.emoji === flipped[1].dataset.emoji) {
                matched++;
                flipped[0].style.opacity = '0.6';
                flipped[1].style.opacity = '0.6';
                flipped = [];
                if (matched === 6) {
                    setTimeout(() => {
                        const pet = getCurrentPet();
                        if (pet) {
                            pet.stats.mood = Math.min(100, pet.stats.mood + 15);
                            addExp(pet, 25);
                            gameState.stats.totalPlays++;
                            updateTask('play');
                            checkAchievements();
                            Storage.save();
                            updatePetUI();
                        }
                        body.innerHTML = `
                            <div style="text-align:center;padding:20px;">
                                <div style="font-size:3rem;margin-bottom:10px;">🎉</div>
                                <div style="font-size:1.2rem;font-weight:700;margin-bottom:5px;">全部找到啦！</div>
                                <div style="color:var(--text-light);margin-bottom:15px;">用了 ${moves} 次翻牌</div>
                                <button class="dreamy-btn primary" onclick="closeModal()">太棒了 ✨</button>
                            </div>
                        `;
                    }, 500);
                }
            } else {
                setTimeout(() => {
                    flipped.forEach(c => {
                        c.dataset.flipped = 'false';
                        c.textContent = '?';
                        c.style.background = 'var(--lavender-light)';
                        c.style.borderColor = 'var(--lavender)';
                    });
                    flipped = [];
                }, 600);
            }
        }
    }
}

function startRPSGame() {
    const body = document.getElementById('modal-body');
    let wins = 0;
    const choices = ['✊', '✌️', '🖐️'];

    body.innerHTML = `
        <div style="text-align:center;">
            <div style="font-size:1.1rem;font-weight:700;margin-bottom:15px;">✊ 石头剪刀布</div>
            <div style="font-size:0.9rem;color:var(--text-light);margin-bottom:15px;">胜场: <span id="rps-wins">0</span>/3</div>
            <div id="rps-result" style="font-size:2rem;margin-bottom:15px;min-height:50px;"></div>
            <div style="display:flex;gap:15px;justify-content:center;">
                <button class="rps-btn" onclick="playRPS('✊')" style="font-size:2.5rem;background:var(--cream);border:2px solid var(--border);border-radius:16px;padding:15px 20px;cursor:pointer;transition:all 0.3s;">✊</button>
                <button class="rps-btn" onclick="playRPS('✌️')" style="font-size:2.5rem;background:var(--cream);border:2px solid var(--border);border-radius:16px;padding:15px 20px;cursor:pointer;transition:all 0.3s;">✌️</button>
                <button class="rps-btn" onclick="playRPS('🖐️')" style="font-size:2.5rem;background:var(--cream);border:2px solid var(--border);border-radius:16px;padding:15px 20px;cursor:pointer;transition:all 0.3s;">🖐️</button>
            </div>
        </div>
    `;

    window.playRPS = function(player) {
        const cpu = choices[Math.floor(Math.random() * 3)];
        const resultEl = document.getElementById('rps-result');
        let result = '';

        if (player === cpu) {
            result = `${player} vs ${cpu} 平局！`;
        } else if (
            (player === '✊' && cpu === '✌️') ||
            (player === '✌️' && cpu === '🖐️') ||
            (player === '🖐️' && cpu === '✊')
        ) {
            wins++;
            result = `${player} vs ${cpu} 你赢了！🎉`;
        } else {
            result = `${player} vs ${cpu} 你输了~`;
        }

        resultEl.textContent = result;
        document.getElementById('rps-wins').textContent = wins;

        if (wins >= 3) {
            setTimeout(() => {
                const pet = getCurrentPet();
                if (pet) {
                    pet.stats.mood = Math.min(100, pet.stats.mood + 10);
                    addExp(pet, 15);
                    gameState.stats.totalPlays++;
                    updateTask('play');
                    checkAchievements();
                    Storage.save();
                    updatePetUI();
                }
                body.innerHTML = `
                    <div style="text-align:center;padding:20px;">
                        <div style="font-size:3rem;margin-bottom:10px;">🏆</div>
                        <div style="font-size:1.2rem;font-weight:700;margin-bottom:5px;">猜拳胜利！</div>
                        <div style="color:var(--text-light);margin-bottom:15px;">赢了3局！</div>
                        <button class="dreamy-btn primary" onclick="closeModal()">太棒了 ✨</button>
                    </div>
                `;
            }, 800);
        }
    };
}

// ===== 互动执行 =====
function doInteraction(action, option) {
    try {
        const pet = getCurrentPet();
        if (!pet) return;
        if (!pet.stats) {
            pet.stats = { hunger: 50, mood: 50, energy: 50, affection: 0 };
        }

    // 喂食时检查并消耗食物
    if (action === 'feed') {
        const foodIndex = gameState.foodStorage.findIndex(f => f.id === option.id);
        if (foodIndex === -1 || gameState.foodStorage[foodIndex].count <= 0) {
            showToast('😢 没有这种食物了，去商场买点吧！');
            closeModal('interaction-modal');
            return;
        }
        // 消耗一份食物
        gameState.foodStorage[foodIndex].count--;
        // 如果数量为0，从库中移除
        if (gameState.foodStorage[foodIndex].count === 0) {
            gameState.foodStorage.splice(foodIndex, 1);
        }
    }

    // 洗澡时消耗沐浴露
    if (action === 'clean' && option.id === 'bath') {
        const bathItem = gameState.locker.supplies.find(s => s.id === 's2');
        if (!bathItem || bathItem.count <= 0) {
            showToast('😢 沐浴露用完了，去商场补货吧！');
            closeModal('interaction-modal');
            return;
        }
        bathItem.count--;
    }

    // 收集状态变化
    const changes = [];
    
    // 应用效果
    if (option.hunger && option.hunger > 0) {
        pet.stats.hunger = Math.min(100, pet.stats.hunger + option.hunger);
        changes.push({ label: '饱食度', value: option.hunger });
    }
    if (option.mood && option.mood > 0) {
        pet.stats.mood = Math.min(100, pet.stats.mood + option.mood);
        changes.push({ label: '心情', value: option.mood });
    }
    if (option.energy && option.energy > 0) {
        pet.stats.energy = Math.min(100, pet.stats.energy + option.energy);
        changes.push({ label: '精力', value: option.energy });
    }
    if (option.affection && option.affection > 0) {
        pet.stats.affection = Math.min(100, pet.stats.affection + option.affection);
        changes.push({ label: '好感', value: option.affection });
    }

    // 增加经验
    let expGain = option.exp || 0;

    // 统计
    if (action === 'feed') gameState.stats.totalFeeds++;
    if (action === 'pet') gameState.stats.totalPets++;
    if (action === 'clean') gameState.stats.totalCleans++;
    if (action === 'sleep') gameState.stats.totalSleeps++;

    // 喂食特殊处理：最喜欢食物
    if (action === 'feed' && option.id && option.id !== 'custom') {
        const favoriteFoodId = PET_FAVORITE_FOODS[pet.type];
        
        // 第一次喂食确定最喜欢食物
        if (!pet.favoriteFood) {
            pet.favoriteFood = favoriteFoodId;
        }
        
        // 喂的是最喜欢食物
        if (option.id === pet.favoriteFood) {
            // 第一次喂最喜欢食物，弹窗提示
            if (!pet.hasShownFavoriteFoodPopup) {
                pet.hasShownFavoriteFoodPopup = true;
                showFavoriteFoodPopup(pet.name, option.name);
            }
            
            // 检查今天是否已经触发过额外奖励
            const today = new Date().toDateString();
            if (pet.favoriteFoodBonusDate !== today) {
                pet.favoriteFoodBonusDate = today;
                expGain += 20;  // 额外20经验
                pet.stats.affection = Math.min(100, pet.stats.affection + 5);  // +5好感
                changes.push({ label: '好感', value: 5 });
                showToast(`💕 ${pet.name}超喜欢${option.name}！额外+20经验 +5好感`);
            } else {
                showToast(`💕 ${pet.name}很喜欢${option.name}~`);
            }
        }
    }

    // 增加经验（包含可能的额外奖励）
    if (expGain > 0) {
        addExp(pet, expGain);
        changes.push({ label: '经验', value: expGain });
    }

    // 更新任务
    updateTask(action);

    // 检查成就
    checkAchievements();

    // 显示反馈
    const petName = pet.name;
    const feedbacks = {
        feed: `吃了${option.name}，很满足~`,
        pet: `被${option.name}了，好舒服~`,
        sleep: `睡了${option.name}，精神焕发！`,
        clean: `${option.name}后变得香喷喷~`
    };
    if (action !== 'feed' || (option.id && option.id !== pet.favoriteFood)) {
        showToast(`${petName} ${feedbacks[action] || '感觉很好~'}`);
    }

    // 使用性格+种类对话系统显示互动反馈
    const contextMap = { feed: 'feed', pet: 'pet', sleep: 'sleep', clean: 'clean' };
    randomSpeak(contextMap[action] || 'normal');

    // 添加特效（向上箭头显示状态提升）
    addEffect(changes);

    Storage.save();
    updatePetUI();
    closeModal('interaction-modal');
    } catch(e) {
        console.error('doInteraction error:', e);
        showToast('操作出了点小问题~');
    }
}

function showFavoriteFoodPopup(petName, foodName) {
    try {
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <div class="achievement-popup-content" style="border-color: var(--pink);">
                <div style="font-size:2.5rem;margin-bottom:8px;">😋</div>
                <div style="font-weight:700;font-size:1.1rem;color:var(--pink-dark);margin-bottom:4px;">${petName}很喜欢这个食物！</div>
                <div style="font-size:0.85rem;color:var(--text-light);">${foodName}是${petName}的最爱~</div>
            </div>
        `;
        // 添加到 pet-container 内而不是 document.body
        const petContainer = document.querySelector('.pet-container');
        if (petContainer) {
            petContainer.appendChild(popup);
        } else {
            document.body.appendChild(popup);
        }
        setTimeout(() => popup.classList.add('show'), 50);
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => popup.remove(), 400);
        }, 3000);
    } catch(e) {
        console.error('showFavoriteFoodPopup error:', e);
    }
}

function addExp(pet, amount, isTaskExp = false) {
    if (!pet) return;
    if (!pet.expToNext) pet.expToNext = 50;
    // 检查每日经验上限（任务经验不计入）
    if (!isTaskExp) {
        const today = new Date().toDateString();
        if (gameState.lastExpReset !== today) {
            gameState.dailyExp = 0;
            gameState.lastExpReset = today;
        }
        
        const remaining = 500 - gameState.dailyExp;
        if (remaining <= 0) {
            showToast('今日经验已达上限，明天再来吧~');
            return;
        }
        
        const actualAmount = Math.min(amount, remaining);
        gameState.dailyExp += actualAmount;
        amount = actualAmount;
    }
    
    pet.exp += amount;
    if (!pet.expToNext || pet.expToNext <= 0) pet.expToNext = 50;
    while (pet.exp >= pet.expToNext) {
        pet.exp -= pet.expToNext;
        pet.level++;
        pet.expToNext = pet.level < 10 ? 50 : pet.level < 30 ? 100 : 200;
        if (pet.level >= 30) pet.stage = 'adult';
        else if (pet.level >= 10) pet.stage = 'child';
        showToast(`🎉 ${pet.name}升到 ${pet.level} 级了！`);
        // 每升5级返还50金币
        if (pet.level % 5 === 0) {
            gameState.coins += 50;
            showToast(`💰 ${pet.name}升到了${pet.level}级，奖励你50金币！`);
            Storage.save();
        }
    }
}

function addEffect(changes) {
    const effects = document.getElementById('pet-effects');
    if (!effects || !changes || changes.length === 0) return;

    changes.forEach((change, i) => {
        const el = document.createElement('span');
        el.className = 'effect-arrow';
        el.innerHTML = `↑${change.label}+${change.value}`;
        el.style.left = (30 + i * 50) + 'px';
        el.style.animationDelay = (i * 0.15) + 's';
        effects.appendChild(el);
        setTimeout(() => el.remove(), 2000);
    });
}

function updateTask(action) {
    if (!gameState.dailyTasks) gameState.dailyTasks = [];
    gameState.dailyTasks.forEach(task => {
        if (task.action === action && task.current < task.target) {
            task.current++;
            if (task.current >= task.target) {
                const pet = getCurrentPet();
                if (pet) addExp(pet, task.reward, true); // 标记为任务经验，不计入每日上限
                showToast(`📋 任务完成！+${task.reward}经验`);
            }
        }
    });
}

// ===== 成就系统 =====
function checkAchievements() {
    const pet = getCurrentPet();
    if (!pet) return;
    if (!gameState.achievements) gameState.achievements = [];
    ACHIEVEMENTS.forEach(ach => {
        if (!gameState.achievements.includes(ach.id) && ach.check(pet, gameState.stats)) {
            gameState.achievements.push(ach.id);
            showAchievementPopup(ach);
        }
    });
}

function showAchievementPopup(ach) {
    try {
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <div class="achievement-popup-content">
                <div style="font-size:2.5rem;margin-bottom:8px;">${ach.icon}</div>
                <div style="font-weight:700;font-size:1rem;color:var(--text);margin-bottom:4px;">成就解锁！</div>
                <div style="font-weight:700;font-size:1.1rem;color:var(--pink-dark);">${ach.name}</div>
                <div style="font-size:0.8rem;color:var(--text-light);margin-top:4px;">${ach.desc}</div>
            </div>
        `;
        // 添加到 pet-container 内
        const petContainer = document.querySelector('.pet-container');
        if (petContainer) {
            petContainer.appendChild(popup);
        } else {
            document.body.appendChild(popup);
        }
        setTimeout(() => popup.classList.add('show'), 50);
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => popup.remove(), 400);
        }, 3000);
    } catch(e) { console.error('showAchievementPopup error:', e); }
}

function showAchievements() {
    try {
        const grid = document.getElementById('achievements-grid');
        grid.innerHTML = '';
        ACHIEVEMENTS.forEach(ach => {
            const unlocked = gameState.achievements.includes(ach.id);
            const item = document.createElement('div');
            item.className = 'achievement-item' + (unlocked ? ' unlocked' : '');
            item.innerHTML = `
                <div class="achievement-icon">${unlocked ? ach.icon : '🔒'}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${ach.name}</div>
                    <div class="achievement-desc">${ach.desc}</div>
                </div>
            `;
            grid.appendChild(item);
        });
        document.getElementById('achievements-modal').classList.add('show');
    } catch(e) { console.error('showAchievements error:', e); }
}

// ===== UI更新 =====
function updatePetUI() {
    try {
        const pet = getCurrentPet();
        if (!pet) return;

        // 安全获取元素并更新
        const safeSetText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };
        const safeSetWidth = (id, width) => {
            const el = document.getElementById(id);
            if (el) el.style.width = width;
        };
        const safeSetClass = (id, className) => {
            const el = document.getElementById(id);
            if (el) el.className = className;
        };

        // 顶部信息
        safeSetText('display-pet-name', pet.name);
        safeSetText('pet-stage', pet.breed ? pet.breed.name : (STAGES[pet.stage] ? STAGES[pet.stage].name : '幼年期'));
        safeSetText('status-pet-name', pet.name);

        // 性格显示
        if (pet.personality) {
            safeSetText('personality-badge', pet.personality.name);
        }

        // 等级经验
        safeSetText('level-num', pet.level);
        safeSetWidth('exp-fill', (pet.exp / (pet.expToNext || 50) * 100) + '%');
        safeSetText('exp-current', pet.exp);
        safeSetText('exp-total', pet.expToNext || 50);

        // 宠物图片（优先使用品种图片）
        const petImgEl = document.getElementById('game-pet-img');
        if (petImgEl) {
            const imgSrc = getPetImg(pet);
            petImgEl.src = imgSrc;
            // 图片加载失败时显示 emoji
            petImgEl.onerror = function() {
                this.style.display = 'none';
                if (this.parentElement) {
                    this.parentElement.innerHTML = `<span style="font-size: 80px;">${getPetEmoji(pet.type)}</span>`;
                }
            };
            petImgEl.onload = function() {
                this.style.display = 'block';
            };
        }

        // 状态文字 + 数值条
        const stats = [
            { key: 'hunger', value: pet.stats?.hunger || 0 },
            { key: 'mood', value: pet.stats?.mood || 0 },
            { key: 'energy', value: pet.stats?.energy || 0 },
            { key: 'affection', value: pet.stats?.affection || 0 }
        ];
        stats.forEach(s => {
            safeSetText(s.key + '-text', getStatusText(s.key, s.value));
            safeSetWidth(s.key + '-bar', s.value + '%');
            safeSetClass(s.key + '-bar', 'status-bar-fill ' + getBarColor(s.value));
        });

        // 任务列表
        renderTasks();

        // 更新萌宠币显示
        safeSetText('coin-amount', gameState.coins || 0);

        // 更新待收金币显示
        const pendingCoinsEl = document.getElementById('pending-coins');
        if (pendingCoinsEl) {
            const totalPending = Object.values(gameState.pets || {}).reduce((sum, p) => sum + (p.pendingCoins || 0), 0);
            if (totalPending > 0) {
                pendingCoinsEl.textContent = `+${totalPending}`;
                pendingCoinsEl.style.display = 'inline-block';
            } else {
                pendingCoinsEl.style.display = 'none';
            }
        }
    } catch (e) {
        console.error('updatePetUI error:', e);
    }
}

// 随机说话定时器
let speakInterval = null;
function startRandomSpeak() {
    if (speakInterval) clearInterval(speakInterval);
    speakInterval = setInterval(() => {
        try {
            const gs = document.getElementById('game-screen');
            if (gs && gs.classList.contains('active')) {
                randomSpeak();
            }
        } catch(e) { console.error('randomSpeak timer error:', e); }
    }, 15000); // 每15秒随机说一次
}

// 随机事件定时器
let eventInterval = null;
function startRandomEvents() {
    if (eventInterval) clearInterval(eventInterval);
    // 每3-5分钟触发一次随机事件
    const scheduleNextEvent = () => {
        const delay = (3 + Math.random() * 2) * 60 * 1000; // 3-5分钟
        eventInterval = setTimeout(() => {
            try {
                const gs = document.getElementById('game-screen');
                if (gs && gs.classList.contains('active')) {
                    triggerRandomEvent();
                }
            } catch(e) { console.error('randomEvent timer error:', e); }
            scheduleNextEvent();
        }, delay);
    };
    scheduleNextEvent();
}

// 触发随机事件
function triggerRandomEvent() {
    try {
        const pet = getCurrentPet();
        if (!pet) return;

    // 随机选择事件类型 (70%宠物互动, 30%梦角互动)
    const eventType = Math.random() < 0.7 ? 'pet' : 'dream';
    const events = RANDOM_EVENTS[eventType];
    const event = events[Math.floor(Math.random() * events.length)];

    // 应用效果
    let effectText = [];
    if (event.effect) {
        if (event.effect.mood) {
            pet.stats.mood = Math.min(100, Math.max(0, pet.stats.mood + event.effect.mood));
            effectText.push(`心情${event.effect.mood > 0 ? '+' : ''}${event.effect.mood}`);
        }
        if (event.effect.affection) {
            pet.stats.affection = Math.min(100, Math.max(0, pet.stats.affection + event.effect.affection));
            effectText.push(`好感${event.effect.affection > 0 ? '+' : ''}${event.effect.affection}`);
        }
        if (event.effect.hunger) {
            pet.stats.hunger = Math.min(100, Math.max(0, pet.stats.hunger + event.effect.hunger));
            effectText.push(`饱食度${event.effect.hunger > 0 ? '+' : ''}${event.effect.hunger}`);
        }
        if (event.effect.energy) {
            pet.stats.energy = Math.min(100, Math.max(0, pet.stats.energy + event.effect.energy));
            effectText.push(`精力${event.effect.energy > 0 ? '+' : ''}${event.effect.energy}`);
        }
        if (event.effect.exp) {
            pet.exp += event.effect.exp;
            effectText.push(`经验+${event.effect.exp}`);
        }
        if (event.effect.coins) {
            gameState.coins += event.effect.coins;
            effectText.push(`金币+${event.effect.coins}`);
        }
    }

    // 如果有物品奖励
    if (event.item) {
        gameState.locker.treasure.push({
            id: 'gift_' + Date.now(),
            icon: event.item.icon,
            name: event.item.name,
            desc: '随机事件获得的礼物'
        });
        effectText.push(`获得${event.item.name}`);
    }

    // 显示弹窗
    document.getElementById('event-icon').textContent = eventType === 'pet' ? '🐾' : '💕';
    document.getElementById('event-title').textContent = event.title;
    document.getElementById('event-emoji').textContent = eventType === 'pet' ? '🐱' : '💕';
    document.getElementById('event-desc').textContent = event.desc;
    document.getElementById('event-effect').textContent = effectText.join(' · ');
    document.getElementById('event-modal').classList.add('show');

    Storage.save();
    updatePetUI();
    } catch(e) { console.error('triggerRandomEvent error:', e); }
}

function renderTasks() {
    if (!container) return;
    container.innerHTML = '';
    (gameState.dailyTasks || []).forEach(task => {
        const done = task.current >= task.target;
        const div = document.createElement('div');
        div.className = 'task-item' + (done ? ' completed' : '');
        div.innerHTML = `
            <div class="task-checkbox">${done ? '✓' : ''}</div>
            <span class="task-text">${task.text} (${task.current}/${task.target})</span>
            <span class="task-reward">+${task.reward}xp</span>
        `;
        container.appendChild(div);
    });
}

// ===== 弹窗控制 =====
window.closeModal = function(modalId) {
    try {
        if (modalId) {
            const el = document.getElementById(modalId);
            if (el) el.classList.remove('show');
        } else {
            document.querySelectorAll('.modal.show').forEach(m => m.classList.remove('show'));
        }
    } catch(e) { console.error('closeModal error:', e); }
};

function showSwitchPetModal() {
    try {
        const grid = document.getElementById('switch-pet-grid');
        grid.innerHTML = '';

        const petList = Object.values(gameState.pets || {});
    
    // 显示已有宠物
    petList.forEach(pet => {
        const genderIcon = pet.gender === 'male' ? '♂️' : '♀️';
        const card = document.createElement('div');
        card.className = 'switch-pet-card' + (pet.id === gameState.currentPet ? ' current' : '');
        card.innerHTML = `
            <img src="${getPetImg(pet)}" style="width:50px;height:50px;border-radius:50%;margin-bottom:5px;object-fit:cover;">
            <div style="font-size:0.8rem;font-weight:700;">${pet.name} ${genderIcon}</div>
            <div style="font-size:0.7rem;color:var(--text-light);">${pet.breed ? pet.breed.name : PET_TYPES[pet.type].name} LV.${pet.level}</div>
        `;
        card.addEventListener('click', () => {
            gameState.currentPet = pet.id;
            Storage.save();
            updatePetUI();
            closeModal('switch-pet-modal');
            showToast(`切换到 ${pet.name}`);
        });
        grid.appendChild(card);
    });

    // 添加"领养新宠物"按钮
    const addCard = document.createElement('div');
    addCard.className = 'switch-pet-card new';
    addCard.innerHTML = `
        <div style="font-size:2rem;margin-bottom:5px;">➕</div>
        <div style="font-size:0.8rem;font-weight:700;">领养新宠物</div>
    `;
    addCard.addEventListener('click', () => {
        closeModal('switch-pet-modal');
        showAdoptDialog();
    });
    grid.appendChild(addCard);

    document.getElementById('switch-pet-modal').classList.add('show');
    } catch(e) { console.error('showSwitchPetModal error:', e); }
}

function showAdoptDialog() {
    const body = document.getElementById('modal-body');
    const header = document.getElementById('modal-header');
    header.className = 'modal-header pink';
    document.getElementById('modal-icon').textContent = '🐾';
    document.getElementById('modal-title').textContent = '选择宠物种类';

    let html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:15px;">';
    Object.keys(PET_TYPES).forEach(type => {
        html += `
            <div class="adopt-type-card" data-type="${type}" style="text-align:center;padding:12px 8px;background:var(--cream);border:2px solid var(--border);border-radius:14px;cursor:pointer;transition:all 0.2s;">
                <div style="font-size:2.5rem;margin-bottom:5px;">${PET_TYPES[type].emoji}</div>
                <div style="font-size:0.75rem;font-weight:700;">${PET_TYPES[type].name}</div>
                <div style="font-size:0.65rem;color:var(--text-light);"></div>
            </div>
        `;
    });
    html += '</div>';
    html += '<div id="adopt-name-section" style="display:none;"></div>';
    body.innerHTML = html;

    // 绑定点击事件
    body.querySelectorAll('.adopt-type-card').forEach(card => {
        card.addEventListener('click', () => {
            body.querySelectorAll('.adopt-type-card').forEach(c => c.style.borderColor = 'var(--border)');
            card.style.borderColor = 'var(--pink)';
            const type = card.dataset.type;
            const section = document.getElementById('adopt-name-section');
            section.style.display = 'block';
            section.innerHTML = `
                <div style="margin-bottom:10px;">
                    <label style="display:block;font-weight:600;margin-bottom:6px;font-size:0.85rem;">宠物名字</label>
                    <input type="text" id="adopt-pet-name" class="dreamy-input" maxlength="8" placeholder="给它取个名字...">
                </div>
                <div style="margin-bottom:10px;">
                    <label style="display:block;font-weight:600;margin-bottom:6px;font-size:0.85rem;">宠物怎么称呼你</label>
                    <input type="text" id="adopt-owner-name" class="dreamy-input" maxlength="8" placeholder="主人、铲屎官...">
                </div>
                <button class="dreamy-btn primary" style="width:100%;" onclick="confirmAdopt('${type}')">领养 ✨</button>
            `;
        });
    });

    document.getElementById('interaction-modal').classList.add('show');
}

window.confirmAdopt = function(type) {
    const name = document.getElementById('adopt-pet-name').value.trim();
    if (!name) { showToast('请输入一个可爱的名字~'); return; }
    const ownerName = document.getElementById('adopt-owner-name').value.trim() || '主人';
    const pet = createPetData(type, name, ownerName);
    gameState.currentPet = pet.id;
    Storage.save();
    updatePetUI();
    closeModal();
    showToast(`领养了 ${name}！欢迎新成员~`);
};

function showNewPetDialog(type) {
    const body = document.getElementById('modal-body');
    const header = document.getElementById('modal-header');
    header.className = 'modal-header pink';
    document.getElementById('modal-icon').textContent = '🐾';
    document.getElementById('modal-title').textContent = '领养新宠物';

    body.innerHTML = `
        <div style="text-align:center;padding:10px;display:flex;flex-direction:column;min-height:350px;">
            <div style="flex:1;">
                <div style="font-size:4rem;margin-bottom:10px;">${PET_TYPES[type].emoji}</div>
                <div style="font-weight:700;margin-bottom:5px;">${PET_TYPES[type].name}</div>
                <div style="color:var(--text-light);font-size:0.85rem;margin-bottom:15px;">${PET_TYPES[type].desc}</div>
                <input type="text" id="new-pet-name" class="dreamy-input" maxlength="8" placeholder="给它取个名字..." style="margin-bottom:15px;width:100%;">
            </div>
            <div style="display:flex;flex-direction:column-reverse;gap:8px;margin-top:20px;">
                <button class="dreamy-btn secondary" style="width:100%;" onclick="closeModal()">取消</button>
                <button class="dreamy-btn primary" style="width:100%;" onclick="confirmNewPet('${type}')">领养 ✨</button>
            </div>
        </div>
    `;
    document.getElementById('interaction-modal').classList.add('show');
}

window.confirmNewPet = function(type) {
    const name = document.getElementById('new-pet-name').value.trim();
    if (!name) { showToast('请输入一个可爱的名字~'); return; }
    gameState.pets[type] = createPetData(type, name);
    gameState.currentPet = type;
    Storage.save();
    updatePetUI();
    closeModal();
    showToast(`领养了 ${name}！欢迎新成员~`);
};

// ===== 辅助功能 =====
function showToast(message) {
    try {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => { try { toast.classList.remove('show'); } catch(e){} }, 3000);
    } catch(e) { console.error('showToast error:', e); }
}

function showSpeech(text) {
    try {
        const bubble = document.getElementById('pet-speech');
        if (!bubble) return;
        const bubbleText = bubble.querySelector('.bubble-text');
        if (bubbleText) bubbleText.textContent = text;
        bubble.classList.add('show');
        clearTimeout(bubble._timeout);
        bubble._timeout = setTimeout(() => { try { bubble.classList.remove('show'); } catch(e){} }, 2500);
    } catch(e) { console.error('showSpeech error:', e); }
}

// ===== BGM音乐 =====
let bgmContext = null;
let bgmPlaying = false;
let bgmInterval = null;
let bgmChordInterval = null;

function toggleMusic() {
    if (!bgmContext) {
        bgmContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // 确保AudioContext处于运行状态
    if (bgmContext.state === 'suspended') {
        bgmContext.resume();
    }
    
    if (bgmPlaying) {
        clearInterval(bgmInterval);
        clearInterval(bgmChordInterval);
        bgmPlaying = false;
        showToast('🎵 音乐已暂停');
        document.getElementById('music-toggle').textContent = '🎵';
    } else {
        playBGM();
        bgmPlaying = true;
        showToast('🎵 音乐播放中~');
        document.getElementById('music-toggle').textContent = '🔊';
    }
}

function playBGM() {
    if (!bgmContext) return;
    
    // 轻松欢快的电子音乐旋律
    const melody = [
        523.25, 587.33, 659.25, 523.25,  // C D E C
        783.99, 659.25, 587.33, 523.25,  // G E D C
        698.46, 783.99, 880.00, 783.99,  // F G A G
        659.25, 587.33, 523.25, 587.33   // E D C D
    ];
    
    let noteIndex = 0;
    const noteDuration = 250; // 每个音符250ms
    
    const playNote = () => {
        if (!bgmPlaying || !bgmContext) return;
        
        const freq = melody[noteIndex % melody.length];
        const osc = bgmContext.createOscillator();
        const gain = bgmContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0.3, bgmContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, bgmContext.currentTime + 0.2);
        
        osc.connect(gain);
        gain.connect(bgmContext.destination);
        
        osc.start();
        osc.stop(bgmContext.currentTime + 0.25);
        
        noteIndex++;
    };
    
    // 立即播放第一个音符
    playNote();
    bgmInterval = setInterval(playNote, noteDuration);
    
    // 背景和弦
    const chords = [
        [261.63, 329.63, 392.00], // C major
        [349.23, 440.00, 523.25], // F major  
        [392.00, 493.88, 587.33], // G major
        [261.63, 329.63, 392.00], // C major
    ];
    let chordIndex = 0;
    
    const playChord = () => {
        if (!bgmPlaying || !bgmContext) return;
        
        const chord = chords[chordIndex % chords.length];
        chord.forEach(freq => {
            const osc = bgmContext.createOscillator();
            const gain = bgmContext.createGain();
            
            osc.type = 'triangle';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0.12, bgmContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, bgmContext.currentTime + 1.5);
            
            osc.connect(gain);
            gain.connect(bgmContext.destination);
            
            osc.start();
            osc.stop(bgmContext.currentTime + 1.8);
        });
        
        chordIndex++;
    };
    
    playChord();
    bgmChordInterval = setInterval(playChord, 2000);
}

function showSettings() {
    try {
        const pet = getCurrentPet();
        const body = document.getElementById('modal-body');
    const header = document.getElementById('modal-header');
    header.className = 'modal-header purple';
    document.getElementById('modal-icon').textContent = '⚙️';
    document.getElementById('modal-title').textContent = '设置';

    body.innerHTML = `
        <div style="padding:8px 10px;">
            <div class="settings-section">
                <div class="settings-section-title">✏️ 重命名</div>
                <div style="display:flex;gap:8px;margin-bottom:8px;">
                    <div style="flex:1;">
                        <label style="font-size:0.7rem;color:var(--text-light);display:block;margin-bottom:3px;">宠物名字</label>
                        <input type="text" id="settings-pet-name" class="dreamy-input" maxlength="8" value="${pet ? pet.name : ''}" style="padding:8px 10px;font-size:0.85rem;">
                    </div>
                    <div style="flex:1;">
                        <label style="font-size:0.7rem;color:var(--text-light);display:block;margin-bottom:3px;">宠物对你的称呼</label>
                        <input type="text" id="settings-owner-name" class="dreamy-input" maxlength="8" value="${pet ? pet.ownerName : '主人'}" style="padding:8px 10px;font-size:0.85rem;">
                    </div>
                </div>
                <button class="dreamy-btn primary" style="width:100%;padding:8px;font-size:0.85rem;" onclick="saveRename()">保存 ✨</button>
            </div>
            <div class="settings-section">
                <div class="settings-section-title">📊 数据统计</div>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">
                    <div style="background:var(--cream);padding:8px 4px;border-radius:10px;text-align:center;">
                        <div style="font-size:1rem;">🍽️${gameState.stats.totalFeeds}</div>
                        <div style="font-size:0.65rem;color:var(--text-light);">喂食</div>
                    </div>
                    <div style="background:var(--cream);padding:8px 4px;border-radius:10px;text-align:center;">
                        <div style="font-size:1rem;">🤗${gameState.stats.totalPets}</div>
                        <div style="font-size:0.65rem;color:var(--text-light);">抚摸</div>
                    </div>
                    <div style="background:var(--cream);padding:8px 4px;border-radius:10px;text-align:center;">
                        <div style="font-size:1rem;">🎮${gameState.stats.totalPlays}</div>
                        <div style="font-size:0.65rem;color:var(--text-light);">玩耍</div>
                    </div>
                    <div style="background:var(--cream);padding:8px 4px;border-radius:10px;text-align:center;">
                        <div style="font-size:1rem;">🧼${gameState.stats.totalCleans}</div>
                        <div style="font-size:0.65rem;color:var(--text-light);">清洁</div>
                    </div>
                </div>
            </div>
            <div style="display:flex;gap:8px;margin-top:4px;">
                <button class="dreamy-btn secondary" style="flex:1;padding:8px;font-size:0.85rem;" onclick="closeModal()">返回</button>
                <button class="dreamy-btn primary" style="flex:1;padding:8px;font-size:0.85rem;background:linear-gradient(135deg,#FF6B6B,#ee5a24);" onclick="resetGame()">重置数据</button>
            </div>
        </div>
    `;
    document.getElementById('interaction-modal').classList.add('show');
    } catch(e) { console.error('showSettings error:', e); }
}

window.saveRename = function() {
    const pet = getCurrentPet();
    if (!pet) return;
    const newName = document.getElementById('settings-pet-name').value.trim();
    const newOwner = document.getElementById('settings-owner-name').value.trim();
    if (!newName) { showToast('宠物名字不能为空~'); return; }
    pet.name = newName;
    pet.ownerName = newOwner || '主人';
    Storage.save();
    updatePetUI();
    showToast('名字已保存~');
    closeModal();
};

window.resetGame = function() {
    closeModal();
    if (confirm('确定要清除所有数据重新开始吗？')) {
        localStorage.removeItem('pixelPetGame');
        location.reload();
    }
};

// ===== 启动 =====
// 将 init 暴露为全局函数，供 showPetPage() 调用
window.initPetGame = init;
// 注意：init() 由 showPetPage() 在用户点击萌宠屋时调用，不在这里自动执行
// document.addEventListener('DOMContentLoaded', init);
