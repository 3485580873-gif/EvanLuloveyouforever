// ============================================
// 塔罗 & 雷诺曼占卜功能
// ============================================

// ==================== 自定义塔罗牌面 ====================
// 用户导入的自定义牌面，优先于默认牌面使用
let customTarotCards = [];

// 获取实际使用的塔罗牌组（自定义优先）
function getTarotDeck() {
    if (customTarotCards && customTarotCards.length > 0) {
        return customTarotCards;
    }
    return tarotDeck;
}

// ==================== 塔罗牌数据 ====================

// 标准 22 张大阿卡纳
const majorArcana = [
    { id: 0, name: '愚者', en: 'The Fool', icon: 'fa-person-walking', keywords: ['新开始', '冒险', '天真', '自由'], upright: '新的开始，充满无限可能，勇敢踏出第一步', reversed: '鲁莽行事，缺乏计划，逃避责任' },
    { id: 1, name: '魔术师', en: 'The Magician', icon: 'fa-wand-magic-sparkles', keywords: ['创造', '意志', '技能', '专注'], upright: '拥有实现目标的一切资源，展现才华与能力', reversed: '欺骗，操纵，才能浪费，缺乏方向' },
    { id: 2, name: '女祭司', en: 'The High Priestess', icon: 'fa-moon', keywords: ['直觉', '神秘', '智慧', '潜意识'], upright: '倾听内心的声音，直觉敏锐，隐藏的知识', reversed: '忽视直觉，表面化，秘密被揭露' },
    { id: 3, name: '女皇', en: 'The Empress', icon: 'fa-crown', keywords: ['丰饶', '母性', '创造', '自然'], upright: '丰盛与富足，创造力旺盛，孕育新生', reversed: '依赖他人，创造力受阻，过度放纵' },
    { id: 4, name: '皇帝', en: 'The Emperor', icon: 'fa-chess-king', keywords: ['权威', '结构', '控制', '父亲'], upright: '领导力，秩序与稳定，承担责任', reversed: '专制，过度控制，缺乏纪律' },
    { id: 5, name: '教皇', en: 'The Hierophant', icon: 'fa-church', keywords: ['传统', '信仰', '教导', '群体'], upright: '遵循传统，寻求指引，精神成长', reversed: '打破常规，叛逆，挑战权威' },
    { id: 6, name: '恋人', en: 'The Lovers', icon: 'fa-heart', keywords: ['爱情', '选择', '和谐', '价值观'], upright: '重要的选择，和谐的关系，真诚的爱', reversed: '价值观冲突，错误的选择，关系失衡' },
    { id: 7, name: '战车', en: 'The Chariot', icon: 'fa-chess-knight', keywords: ['胜利', '意志', '决心', '行动'], upright: '克服障碍，坚定前行，掌控局势', reversed: '失去方向，缺乏控制，受挫' },
    { id: 8, name: '力量', en: 'Strength', icon: 'fa-hand-fist', keywords: ['勇气', '耐心', '内在力量', '慈悲'], upright: '以柔克刚，内在的勇气，自我控制', reversed: '自我怀疑，缺乏信心，软弱' },
    { id: 9, name: '隐士', en: 'The Hermit', icon: 'fa-lightbulb', keywords: ['内省', '智慧', '孤独', '指引'], upright: '寻求内在智慧，独处反思，精神探索', reversed: '孤立，逃避现实，拒绝帮助' },
    { id: 10, name: '命运之轮', en: 'Wheel of Fortune', icon: 'fa-circle-notch', keywords: ['命运', '转变', '机遇', '循环'], upright: '命运的转折，新的机遇，顺势而为', reversed: '运势低迷，抗拒改变，厄运' },
    { id: 11, name: '正义', en: 'Justice', icon: 'fa-scale-balanced', keywords: ['公正', '真相', '因果', '法律'], upright: '公平公正，真相大白，因果报应', reversed: '不公正，逃避责任，偏见' },
    { id: 12, name: '倒吊人', en: 'The Hanged Man', icon: 'fa-arrows-rotate', keywords: ['牺牲', '等待', '新视角', '放下'], upright: '以退为进，换位思考，暂时的停滞', reversed: '无谓的牺牲，拖延，抗拒改变' },
    { id: 13, name: '死神', en: 'Death', icon: 'fa-skull', keywords: ['结束', '转化', '重生', '放下'], upright: '旧事物的终结，深刻的转变，新生', reversed: '抗拒改变，停滞不前，恐惧' },
    { id: 14, name: '节制', en: 'Temperance', icon: 'fa-droplet', keywords: ['平衡', '调和', '耐心', '中庸'], upright: '平衡与和谐，适度节制，融合', reversed: '失衡，过度，缺乏耐心' },
    { id: 15, name: '恶魔', en: 'The Devil', icon: 'fa-pentagram', keywords: ['束缚', '欲望', '物质', '诱惑'], upright: '被欲望束缚，物质依赖，不健康的关系', reversed: '解脱束缚，面对阴影，重获自由' },
    { id: 16, name: '塔', en: 'The Tower', icon: 'fa-bolt', keywords: ['突变', '毁灭', '觉醒', '重建'], upright: '突如其来的改变，旧结构的崩塌，觉醒', reversed: '抗拒改变，恐惧变革，延迟的灾难' },
    { id: 17, name: '星星', en: 'The Star', icon: 'fa-star', keywords: ['希望', '灵感', '治愈', '信心'], upright: '希望与启示，心灵的治愈，美好的未来', reversed: '失去希望，悲观失望，缺乏信心' },
    { id: 18, name: '月亮', en: 'The Moon', icon: 'fa-cloud-moon', keywords: ['幻觉', '恐惧', '潜意识', '迷惑'], upright: '直觉与梦境，面对内心的恐惧，不确定性', reversed: '走出迷惘，真相显现，克服恐惧' },
    { id: 19, name: '太阳', en: 'The Sun', icon: 'fa-sun', keywords: ['成功', '喜悦', '活力', '光明'], upright: '成功与喜悦，光明正大，充满活力', reversed: '暂时的挫折，过度乐观，缺乏热情' },
    { id: 20, name: '审判', en: 'Judgement', icon: 'fa-ear-listen', keywords: ['觉醒', '重生', '召唤', '抉择'], upright: '重要的抉择，精神觉醒，新的召唤', reversed: '拒绝改变，自我怀疑，逃避审判' },
    { id: 21, name: '世界', en: 'The World', icon: 'fa-globe', keywords: ['完成', '圆满', '成就', '整合'], upright: '圆满完成，达成目标，人生的巅峰', reversed: '未完成的循环，缺乏闭合，延迟的成功' }
];

// 小阿卡纳花色
const suits = ['权杖', '圣杯', '宝剑', '星币'];
const suitIcons = ['fa-fire', 'fa-glass-water', 'fa-sword', 'fa-coins'];
const suitEn = ['Wands', 'Cups', 'Swords', 'Pentacles'];

// 生成 56 张小阿卡纳
const minorArcana = [];
const courtCards = ['侍从', '骑士', '王后', '国王'];
const courtKeywords = {
    '侍从': ['消息', '学习', '好奇', '年轻'],
    '骑士': ['行动', '追求', '热情', '冲动'],
    '王后': ['成熟', '滋养', '直觉', '理解'],
    '国王': ['掌控', '权威', '领导', '稳定']
};

for (let s = 0; s < 4; s++) {
    // 数字牌 1-10
    for (let n = 1; n <= 10; n++) {
        minorArcana.push({
            id: 22 + s * 14 + n - 1,
            name: `${suits[s]}${n}`,
            en: `${n} of ${suitEn[s]}`,
            icon: suitIcons[s],
            suit: suits[s],
            num: n,
            keywords: getMinorKeywords(suits[s], n),
            upright: getMinorUpright(suits[s], n),
            reversed: getMinorReversed(suits[s], n)
        });
    }
    // 宫廷牌
    for (let c = 0; c < 4; c++) {
        minorArcana.push({
            id: 22 + s * 14 + 10 + c,
            name: `${suits[s]}${courtCards[c]}`,
            en: `${courtCards[c]} of ${suitEn[s]}`,
            icon: suitIcons[s],
            suit: suits[s],
            court: courtCards[c],
            keywords: courtKeywords[courtCards[c]],
            upright: getCourtUpright(suits[s], courtCards[c]),
            reversed: getCourtReversed(suits[s], courtCards[c])
        });
    }
}

// 完整塔罗牌组
const tarotDeck = [...majorArcana, ...minorArcana];

// 小阿卡纳牌义辅助函数
function getMinorKeywords(suit, num) {
    const base = {
        '权杖': ['行动', '创造', '热情', '能量'],
        '圣杯': ['情感', '关系', '直觉', '流动'],
        '宝剑': ['思想', '冲突', '真相', '决断'],
        '星币': ['物质', '财富', '实际', '稳定']
    };
    return base[suit] || [];
}

function getMinorUpright(suit, num) {
    const meanings = {
        '权杖': {
            1: '新的开始，创造力的火花，灵感迸发',
            2: '规划未来，做出选择，展望远方',
            3: '进展顺利，团队合作，初步成功',
            4: '庆祝成就，稳定与和谐，家庭团聚',
            5: '竞争与冲突，意见分歧，挑战',
            6: '胜利与荣耀，公众认可，自信',
            7: '坚守立场，面对挑战，勇气',
            8: '迅速行动，改变来临，突破',
            9: '坚持不懈，最后的考验，力量',
            10: '圆满完成，责任与负担,传承'
        },
        '圣杯': {
            1: '新的情感，爱的开始，情感充沛',
            2: '合作关系，心灵契合，吸引',
            3: '欢庆与友谊，社交喜悦，分享',
            4: '厌倦与冷漠，错失机会，不满',
            5: '失落与悲伤，情感创伤，遗憾',
            6: '美好回忆，怀旧，童年',
            7: '幻想与选择，迷惑，不切实际',
            8: '放弃与离开，寻找更深的意义，转变',
            9: '愿望成真，情感满足，丰盛',
            10: '家庭幸福，情感圆满，和谐'
        },
        '宝剑': {
            1: '新的想法，清晰的决断，真相',
            2: '僵持与选择，犹豫不决，平衡',
            3: '心碎与悲伤，痛苦，分离',
            4: '休息与恢复，静思，暂缓',
            5: '冲突与失败，自私，伤害',
            6: '过渡与转变，离开，平静',
            7: '欺骗与策略，偷偷摸摸，机智',
            8: '困境与束缚，无力感，限制',
            9: '焦虑与恐惧，噩梦，痛苦',
            10: '结束与新生，痛苦的终结，解脱'
        },
        '星币': {
            1: '新的机会，财富的开始，实际成果',
            2: '平衡与灵活，多任务处理，适应',
            3: '技能发展，团队合作，学习',
            4: '稳定与控制，保守，占有',
            5: '困境与贫困，物质困难，孤立',
            6: '慷慨与分享，互惠，帮助',
            7: '耐心与投资，长远规划，收获',
            8: '专注与精进，技能提升，工匠精神',
            9: '独立与富足，自给自足，成就',
            10: '家族财富，传承，稳定繁荣'
        }
    };
    return meanings[suit]?.[num] || '正位含义';
}

function getMinorReversed(suit, num) {
    const meanings = {
        '权杖': {
            1: '延迟的开始，缺乏方向，创意受阻',
            2: '优柔寡断，缺乏计划，恐惧改变',
            3: '阻碍与延迟，缺乏合作',
            4: '不稳定，缺乏和谐，家庭问题',
            5: '避免冲突，和解，内心挣扎',
            6: '骄傲自满，缺乏认可，失败',
            7: '放弃立场，妥协，失去勇气',
            8: '延迟与阻碍，停滞不前',
            9: '疲惫与挫折，放弃，无力',
            10: '负担过重，责任压身，失败'
        },
        '圣杯': {
            1: '情感阻塞，压抑，空虚',
            2: '关系破裂，不和谐，分离',
            3: '过度享乐，孤立，缺乏分享',
            4: '新的机会，重新积极，觉醒',
            5: '接受与放下，走出悲伤，和解',
            6: '活在当下，放下过去，不切实际',
            7: '看清现实，做出选择，清醒',
            8: '回归现实，结束逃避，面对',
            9: '贪婪与不满，愿望落空',
            10: '家庭问题，情感破裂，不和谐'
        },
        '宝剑': {
            1: '混乱与困惑，错误的决定',
            2: '做出决定，打破僵局，行动',
            3: '愈合与恢复，走出痛苦，原谅',
            4: '过度休息，懒惰，缺乏行动',
            5: '和解，放下争执，宽容',
            6: '回归，重新面对，恢复',
            7: '坦白与诚实，放弃欺骗',
            8: '解脱与自由，走出困境',
            9: '走出恐惧，疗愈，希望',
            10: '拒绝接受，无法放手，痛苦延续'
        },
        '星币': {
            1: '错失机会，缺乏计划，损失',
            2: '失衡与混乱，过度分散',
            3: '缺乏技能，工作问题，学习困难',
            4: '贪婪与吝啬，过度保守',
            5: '恢复与改善，走出困境',
            6: '自私与吝啬，不平等',
            7: '缺乏耐心，短视，失败',
            8: '缺乏专注，技能停滞',
            9: '依赖他人，缺乏独立',
            10: '家庭问题，失去根基，不稳定'
        }
    };
    return meanings[suit]?.[num] || '逆位含义';
}

function getCourtUpright(suit, court) {
    const meanings = {
        '权杖': {
            '侍从': '新的机会，热情的学习者，好消息',
            '骑士': '行动与冒险，热情的追求，冲动',
            '王后': '自信与独立，创造性的女性，热情',
            '国王': '领导与远见，成功的男性，掌控'
        },
        '圣杯': {
            '侍从': '情感消息，新的关系，敏感',
            '骑士': '浪漫的追求，情感的行动，理想主义',
            '王后': '情感成熟，直觉敏锐，滋养',
            '国王': '情感掌控，外交，宽容'
        },
        '宝剑': {
            '侍从': '新的想法，好奇心，消息',
            '骑士': '果断行动，追求真相，勇敢',
            '王后': '独立思考，清晰的判断，理性',
            '国王': '权威与真相，公正的判断，领导'
        },
        '星币': {
            '侍从': '新的机会，学习，实际的消息',
            '骑士': '稳步前进，努力工作，可靠',
            '王后': '实际与滋养，富足，务实',
            '国王': '财富与成功，商业头脑，稳定'
        }
    };
    return meanings[suit]?.[court] || '正位含义';
}

function getCourtReversed(suit, court) {
    const meanings = {
        '权杖': {
            '侍从': '缺乏方向，坏消息，失望',
            '骑士': '鲁莽与冲动，缺乏方向，挫折',
            '王后': '嫉妒与自私，缺乏自信',
            '国王': '专制与霸道，滥用权力'
        },
        '圣杯': {
            '侍从': '情感不成熟，坏消息，失望',
            '骑士': '情绪化，不切实际，失望',
            '王后': '情感依赖，不安全感，情绪化',
            '国王': '情感操控，逃避，冷漠'
        },
        '宝剑': {
            '侍从': '缺乏思考，消息延迟，困惑',
            '骑士': '鲁莽与冲动，缺乏思考，冲突',
            '王后': '过度理性，冷漠，刻薄',
            '国王': '滥用权力，不公正，操控'
        },
        '星币': {
            '侍从': '缺乏机会，懒惰，坏消息',
            '骑士': '懒惰与停滞，缺乏进展',
            '王后': '过度物质化，缺乏滋养',
            '国王': '贪婪与固执，物质至上'
        }
    };
    return meanings[suit]?.[court] || '逆位含义';
}

// ==================== 雷诺曼牌数据 ====================

const lenormandDeck = [
    { id: 1, name: '骑手', icon: 'fa-horse', keyword: '消息、到来、速度', meaning: '带来消息或新事物，事情即将发生，快速的变化' },
    { id: 2, name: '三叶草', icon: 'fa-clover', keyword: '幸运、机会、小确幸', meaning: '小幸运降临，机会出现，轻松愉快的事情' },
    { id: 3, name: '船', icon: 'fa-ship', keyword: '旅行、移动、远方', meaning: '旅行或移动，来自远方的事物，变化即将来临' },
    { id: 4, name: '房屋', icon: 'fa-house', keyword: '家庭、稳定、安全', meaning: '家庭事务，稳定的环境，安全感与归属' },
    { id: 5, name: '树', icon: 'fa-tree', keyword: '健康、成长、根基', meaning: '健康与生命力，长期的发展，稳固的基础' },
    { id: 6, name: '云', icon: 'fa-cloud', keyword: '困惑、不确定、阻碍', meaning: '困惑与迷茫，情况不明朗，需要等待澄清' },
    { id: 7, name: '蛇', icon: 'fa-worm', keyword: '复杂、诱惑、麻烦', meaning: '复杂的情况，需要小心处理，潜在的麻烦' },
    { id: 8, name: '棺材', icon: 'fa-box', keyword: '结束、转变、放下', meaning: '某事的结束，转变的契机，放下过去' },
    { id: 9, name: '花束', icon: 'fa-seedling', keyword: '喜悦、礼物、美好', meaning: '喜悦与幸福，美好的事物，礼物或惊喜' },
    { id: 10, name: '镰刀', icon: 'fa-scissors', keyword: '决断、危险、切断', meaning: '需要做出决定，潜在的危险，切断联系' },
    { id: 11, name: '鞭子', icon: 'fa-arrows-spin', keyword: '冲突、重复、争论', meaning: '冲突与争论，重复的事情，需要沟通' },
    { id: 12, name: '鸟', icon: 'fa-dove', keyword: '交流、对话、聚会', meaning: '交流与对话，社交活动，需要倾听' },
    { id: 13, name: '孩子', icon: 'fa-child', keyword: '新开始、天真、小', meaning: '新的开始，天真无邪，小规模的事物' },
    { id: 14, name: '狐狸', icon: 'fa-paw', keyword: '工作、机警、自我', meaning: '工作相关，需要机警应对，关注自我' },
    { id: 15, name: '熊', icon: 'fa-paw-claws', keyword: '力量、权威、财务', meaning: '力量与权威，财务相关，保护与支持' },
    { id: 16, name: '星星', icon: 'fa-star', keyword: '希望、指引、成功', meaning: '希望与灵感，宇宙的指引，成功在望' },
    { id: 17, name: '鹳鸟', icon: 'fa-feather', keyword: '变化、提升、搬迁', meaning: '积极的变化，地位提升，搬迁或转移' },
    { id: 18, name: '狗', icon: 'fa-dog', keyword: '忠诚、友谊、信任', meaning: '忠诚的朋友，可信赖的人，真诚的关系' },
    { id: 19, name: '塔', icon: 'fa-building', keyword: '机构、隔离、高度', meaning: '官方机构，孤独或隔离，高远的目标' },
    { id: 20, name: '花园', icon: 'fa-tree', keyword: '社交、公众、聚会', meaning: '社交活动，公众场合，人际网络' },
    { id: 21, name: '山', icon: 'fa-mountain', keyword: '阻碍、延迟、困难', meaning: '阻碍与困难，事情延迟，需要耐心' },
    { id: 22, name: '路口', icon: 'fa-code-branch', keyword: '选择、决定、分歧', meaning: '面临选择，需要做决定，不同的道路' },
    { id: 23, name: '老鼠', icon: 'fa-mouse', keyword: '损失、压力、消耗', meaning: '损失或消耗，持续的压力，需要警惕' },
    { id: 24, name: '心', icon: 'fa-heart', keyword: '爱情、感情、核心', meaning: '爱情与感情，内心的渴望，核心事物' },
    { id: 25, name: '戒指', icon: 'fa-ring', keyword: '承诺、契约、循环', meaning: '承诺与契约，婚姻或约定，循环往复' },
    { id: 26, name: '书', icon: 'fa-book', keyword: '知识、秘密、学习', meaning: '知识与学习，隐藏的秘密，需要研究' },
    { id: 27, name: '信', icon: 'fa-envelope', keyword: '消息、文件、沟通', meaning: '消息或文件，书面沟通，正式通知' },
    { id: 28, name: '男人', icon: 'fa-person', keyword: '男性、问卜者', meaning: '男性相关，问卜者本人（若为男），重要男性' },
    { id: 29, name: '女人', icon: 'fa-person-dress', keyword: '女性、问卜者', meaning: '女性相关，问卜者本人（若为女），重要女性' },
    { id: 30, name: '百合', icon: 'fa-spa', keyword: '纯洁、平静、成熟', meaning: '纯洁与平静，成熟稳重，美好的品质' },
    { id: 31, name: '太阳', icon: 'fa-sun', keyword: '成功、能量、快乐', meaning: '成功与快乐，充沛的能量，光明的前景' },
    { id: 32, name: '月亮', icon: 'fa-moon', keyword: '情感、直觉、荣誉', meaning: '情感与直觉，内心的感受，荣誉与认可' },
    { id: 33, name: '钥匙', icon: 'fa-key', keyword: '解决、重要、开启', meaning: '问题的解决，关键的事物，新的开启' },
    { id: 34, name: '鱼', icon: 'fa-fish', keyword: '财富、流动、独立', meaning: '财富与资源，流动的事物，独立自主' },
    { id: 35, name: '锚', icon: 'fa-anchor', keyword: '稳定、坚持、港湾', meaning: '稳定与坚持，安全港湾，长期承诺' },
    { id: 36, name: '十字架', icon: 'fa-cross', keyword: '命运、责任、结束', meaning: '命运与责任，某种结束，精神层面' }
];

// ==================== 自定义塔罗牌数据 ====================

let customTarotDeck = null; // 自定义塔罗牌组
let customTarotEnabled = false; // 是否使用自定义牌组

// ==================== 占卜状态 ====================

let lenormandCount = 1;
let tarotSpread = 'single';
let diviHistory = [];

// ==================== 标签切换 ====================

window.switchFLTab = function(tab) {
    const tabs = ['fortune', 'lenormand', 'tarot', 'divihistory'];
    tabs.forEach(t => {
        const tabBtn = document.getElementById(`fl-tab-${t}`);
        const panel = document.getElementById(`fl-panel-${t}`);
        if (tabBtn) tabBtn.classList.toggle('active', t === tab);
        if (panel) panel.classList.toggle('fl-panel-active', t === tab);
    });
};

// ==================== 每日运势 ====================

window.generateFortune = function() {
    const container = document.getElementById('fortune-content');
    if (!container) return;

    const fortunes = [
        { title: '大吉', desc: '今日运势极佳，诸事顺遂，心想事成', icon: 'fa-sun', color: '#FFD700' },
        { title: '中吉', desc: '运势良好，把握机会，稳步前进', icon: 'fa-star', color: '#4CAF50' },
        { title: '小吉', desc: '小有收获，保持平常心', icon: 'fa-cloud-sun', color: '#2196F3' },
        { title: '平', desc: '平淡安稳，适合休整', icon: 'fa-circle', color: '#9E9E9E' },
        { title: '小凶', desc: '略有阻碍，谨慎行事', icon: 'fa-cloud', color: '#FF9800' },
        { title: '中凶', desc: '运势欠佳，宜静不宜动', icon: 'fa-cloud-rain', color: '#F44336' }
    ];

    const today = new Date().toDateString();
    const seed = today.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const fortune = fortunes[seed % fortunes.length];

    container.innerHTML = `
        <div class="fortune-card tarot-style" style="text-align:center;padding:30px;">
            <div style="font-size:48px;color:${fortune.color};margin-bottom:16px;">
                <i class="fas ${fortune.icon}"></i>
            </div>
            <div style="font-size:24px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">${fortune.title}</div>
            <div style="font-size:14px;color:var(--text-secondary);">${fortune.desc}</div>
            <div style="margin-top:20px;font-size:12px;color:var(--text-secondary);opacity:0.6;">
                ${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </div>
        </div>
    `;
};

// ==================== 雷诺曼占卜 ====================

window.setLenormandCount = function(count) {
    lenormandCount = count;
    document.querySelectorAll('.lenormand-num-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.lenormand-num-btn').classList.add('active');
    
    const desc = document.getElementById('leno-num-desc');
    if (desc) {
        desc.textContent = count === 1 ? '单张牌 · 直达答案' : '三张牌 · 过去·现在·未来';
    }
};

window.startLenormandDraw = function() {
    const resultDiv = document.getElementById('lenormand-result');
    const setupDiv = document.getElementById('lenormand-setup');
    const resetBtn = document.getElementById('lenormand-reset-btn');
    const questionInput = document.getElementById('lenormand-question');
    
    if (!resultDiv) return;

    // 随机抽牌
    const shuffled = [...lenormandDeck].sort(() => Math.random() - 0.5);
    const drawn = shuffled.slice(0, lenormandCount);
    const question = questionInput?.value?.trim() || '';

    // 生成结果 HTML
    let html = '<div class="lenormand-cards-row">';
    const positions = lenormandCount === 3 ? ['过去', '现在', '未来'] : [''];
    
    drawn.forEach((card, i) => {
        html += `
            <div class="lenormand-card-item" style="animation-delay:${i * 0.15}s;">
                <div class="lenormand-card-icon"><i class="fas ${card.icon}"></i></div>
                <div class="lenormand-card-name">${card.name}</div>
                <div class="lenormand-card-num">№${card.id}</div>
                <div class="lenormand-card-keyword">${card.keyword}</div>
                ${lenormandCount === 3 ? `<div style="font-size:11px;color:var(--accent-color);margin-top:6px;">${positions[i]}</div>` : ''}
                <div class="lenormand-card-meaning">${card.meaning}</div>
            </div>
        `;
    });
    html += '</div>';
    
    if (question) {
        html += `<div class="lenormand-question-show">"${question}"</div>`;
    }

    resultDiv.innerHTML = html;
    resultDiv.style.display = 'block';
    if (setupDiv) setupDiv.style.display = 'none';
    if (resetBtn) resetBtn.style.display = 'inline-block';

    // 保存到历史
    saveDiviHistory('lenormand', question, drawn);
};

window.resetLenormand = function() {
    const resultDiv = document.getElementById('lenormand-result');
    const setupDiv = document.getElementById('lenormand-setup');
    const resetBtn = document.getElementById('lenormand-reset-btn');
    const questionInput = document.getElementById('lenormand-question');
    
    if (resultDiv) {
        resultDiv.style.display = 'none';
        resultDiv.innerHTML = '';
    }
    if (setupDiv) setupDiv.style.display = 'block';
    if (resetBtn) resetBtn.style.display = 'none';
    if (questionInput) questionInput.value = '';
};

// ==================== 塔罗占卜 ====================

// 牌阵选择
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tarot-spread-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tarot-spread-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            tarotSpread = this.dataset.spread;
            
            const desc = document.getElementById('tarot-spread-desc');
            if (desc) {
                desc.textContent = tarotSpread === 'single' ? '单张牌 · 直指当下' : '三张牌 · 过去·现在·未来';
            }
        });
    });
});

window.startTarotDraw = function() {
    const resultDiv = document.getElementById('tarot-result');
    const setupDiv = document.getElementById('tarot-setup');
    const resetBtn = document.getElementById('tarot-reset-btn');
    const questionInput = document.getElementById('tarot-question');
    
    if (!resultDiv) return;

    // 使用自定义牌组或标准牌组
    const deck = (customTarotEnabled && customTarotDeck) ? customTarotDeck : tarotDeck;
    
    // 随机抽牌
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    const count = tarotSpread === 'single' ? 1 : 3;
    const drawn = shuffled.slice(0, count).map(card => ({
        ...card,
        reversed: Math.random() < 0.3 // 30% 概率逆位
    }));
    const question = questionInput?.value?.trim() || '';

    // 生成结果 HTML
    let html = '<div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center;">';
    const positions = count === 3 ? ['过去', '现在', '未来'] : [''];
    
    drawn.forEach((card, i) => {
        const cardIcon = card.imageUrl 
            ? `<img src="${card.imageUrl}" alt="${card.name}" style="width:80px;height:120px;object-fit:contain;border-radius:8px;">`
            : `<i class="fas ${card.icon || 'fa-star'}" style="font-size:64px;opacity:0.8;"></i>`;
        
        html += `
            <div class="fortune-card tarot-style" style="animation-delay:${i * 0.15}s;max-width:280px;">
                <div class="tarot-header">${positions[i] || ''}</div>
                <div class="tarot-visual ${card.reversed ? 'reversed' : ''}">
                    ${cardIcon}
                </div>
                <div class="tarot-card-name">${card.name}</div>
                <div class="tarot-position-badge ${card.reversed ? 'reversed' : ''}">
                    ${card.reversed ? '逆位' : '正位'}
                </div>
                <div class="tarot-details">
                    <div style="font-size:13px;color:var(--text-primary);margin-bottom:8px;">
                        ${card.reversed ? card.reversed : card.upright}
                    </div>
                    <div style="font-size:11px;color:var(--text-secondary);">
                        关键词：${(card.keywords || []).join(' · ')}
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    if (question) {
        html = `<div class="lenormand-question-show" style="margin-bottom:16px;">"${question}"</div>` + html;
    }

    resultDiv.innerHTML = html;
    resultDiv.style.display = 'block';
    if (setupDiv) setupDiv.style.display = 'none';
    if (resetBtn) resetBtn.style.display = 'inline-block';

    // 保存到历史
    saveDiviHistory('tarot', question, drawn);
};

window.resetTarotDivination = function() {
    const resultDiv = document.getElementById('tarot-result');
    const setupDiv = document.getElementById('tarot-setup');
    const resetBtn = document.getElementById('tarot-reset-btn');
    const questionInput = document.getElementById('tarot-question');
    
    if (resultDiv) {
        resultDiv.style.display = 'none';
        resultDiv.innerHTML = '';
    }
    if (setupDiv) setupDiv.style.display = 'block';
    if (resetBtn) resetBtn.style.display = 'none';
    if (questionInput) questionInput.value = '';
};

// ==================== 占卜历史 ====================

function saveDiviHistory(type, question, cards) {
    if (!diviHistory) diviHistory = [];
    
    diviHistory.unshift({
        type,
        question,
        cards: cards.map(c => ({ name: c.name, reversed: c.reversed })),
        time: new Date().toISOString()
    });

    // 最多保存 50 条
    if (diviHistory.length > 50) {
        diviHistory = diviHistory.slice(0, 50);
    }

    // 保存到存储
    try {
        localforage.setItem('diviHistory', diviHistory).catch(() => {});
    } catch (e) {}

    // 刷新历史列表
    renderDiviHistory();
}

function renderDiviHistory() {
    const list = document.getElementById('divi-history-list');
    const empty = document.getElementById('divi-history-empty');
    
    if (!list) return;

    if (!diviHistory || diviHistory.length === 0) {
        list.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }

    if (empty) empty.style.display = 'none';

    list.innerHTML = diviHistory.map(item => {
        const typeLabel = item.type === 'tarot' ? '塔罗' : '雷诺曼';
        const timeStr = new Date(item.time).toLocaleString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="divi-history-item">
                <div class="divi-history-meta">
                    <span class="divi-history-type">${typeLabel}</span>
                    <span class="divi-history-time">${timeStr}</span>
                </div>
                ${item.question ? `<div class="divi-history-question">"${item.question}"</div>` : ''}
                <div class="divi-history-cards">
                    ${item.cards.map(c => `<span class="divi-history-card-tag">${c.name}${c.reversed ? ' (逆)' : ''}</span>`).join('')}
                </div>
            </div>
        `;
    }).join('');
}

window.clearDiviHistory = function() {
    diviHistory = [];
    try {
        localforage.setItem('diviHistory', []).catch(() => {});
    } catch (e) {}
    renderDiviHistory();
};

// 加载历史记录
async function loadDiviHistory() {
    try {
        const saved = await localforage.getItem('diviHistory');
        if (saved && Array.isArray(saved)) {
            diviHistory = saved;
        }
    } catch (e) {}
    renderDiviHistory();
}

// ==================== 自定义塔罗牌导入 ====================

// 打开自定义塔罗牌管理界面
window.openCustomTarotManager = function() {
    const modal = document.getElementById('custom-tarot-modal');
    if (modal) {
        if (typeof showModal === 'function') {
            showModal(modal);
        } else {
            modal.style.display = 'flex';
        }
        renderCustomTarotList();
    }
};

window.closeCustomTarotManager = function() {
    const modal = document.getElementById('custom-tarot-modal');
    if (modal) {
        if (typeof hideModal === 'function') {
            hideModal(modal);
        } else {
            modal.style.display = 'none';
        }
    }
};

// 渲染自定义塔罗牌列表
function renderCustomTarotList() {
    const list = document.getElementById('custom-tarot-list');
    if (!list) return;

    if (!customTarotDeck || customTarotDeck.length === 0) {
        list.innerHTML = `
            <div style="text-align:center;padding:40px;color:var(--text-secondary);">
                <i class="fas fa-cards" style="font-size:48px;opacity:0.3;display:block;margin-bottom:16px;"></i>
                <div>尚未导入自定义塔罗牌</div>
                <div style="font-size:12px;margin-top:8px;opacity:0.7;">点击下方按钮导入您的塔罗牌</div>
            </div>
        `;
        return;
    }

    list.innerHTML = customTarotDeck.map((card, i) => `
        <div class="custom-tarot-item" style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--secondary-bg);border-radius:12px;margin-bottom:8px;">
            ${card.imageUrl 
                ? `<img src="${card.imageUrl}" style="width:50px;height:70px;object-fit:contain;border-radius:6px;">`
                : `<div style="width:50px;height:70px;background:var(--primary-bg);border-radius:6px;display:flex;align-items:center;justify-content:center;"><i class="fas ${card.icon || 'fa-star'}" style="font-size:24px;opacity:0.5;"></i></div>`
            }
            <div style="flex:1;">
                <div style="font-weight:600;color:var(--text-primary);">${card.name}</div>
                <div style="font-size:11px;color:var(--text-secondary);">${card.en || ''}</div>
            </div>
            <button onclick="removeCustomTarotCard(${i})" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;padding:8px;">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// 导入自定义塔罗牌（JSON 格式）
window.importCustomTarot = function(jsonStr) {
    try {
        const data = JSON.parse(jsonStr);
        
        if (!Array.isArray(data)) {
            throw new Error('数据格式错误：应为数组');
        }

        // 验证并标准化数据
        customTarotDeck = data.map((card, i) => ({
            id: card.id || i,
            name: card.name || `牌${i + 1}`,
            en: card.en || card.name || '',
            icon: card.icon || 'fa-star',
            imageUrl: card.imageUrl || card.image || '',
            keywords: card.keywords || [],
            upright: card.upright || card.meaning || '正位含义',
            reversed: card.reversed || '逆位含义'
        }));

        // 保存到存储
        localforage.setItem('customTarotDeck', customTarotDeck).catch(() => {});
        
        showNotification('自定义塔罗牌导入成功！', 'success');
        renderCustomTarotList();
        
    } catch (e) {
        showNotification('导入失败：' + e.message, 'error');
    }
};

// 从文件导入
window.importCustomTarotFromFile = async function(file) {
    try {
        const text = await file.text();
        importCustomTarot(text);
    } catch (e) {
        showNotification('文件读取失败', 'error');
    }
};

// 删除单张自定义牌
window.removeCustomTarotCard = function(index) {
    if (!customTarotDeck) return;
    customTarotDeck.splice(index, 1);
    localforage.setItem('customTarotDeck', customTarotDeck).catch(() => {});
    renderCustomTarotList();
};

// 切换使用自定义牌组
window.toggleCustomTarot = function(enabled) {
    customTarotEnabled = enabled;
    localforage.setItem('customTarotEnabled', enabled).catch(() => {});
    
    const toggle = document.getElementById('custom-tarot-toggle');
    if (toggle) toggle.classList.toggle('active', enabled);
    
    showNotification(enabled ? '已切换到自定义塔罗牌' : '已切换到标准塔罗牌', 'success');
};

// 加载自定义塔罗牌数据
async function loadCustomTarotData() {
    try {
        const [deck, enabled] = await Promise.all([
            localforage.getItem('customTarotDeck'),
            localforage.getItem('customTarotEnabled')
        ]);
        
        if (deck && Array.isArray(deck)) {
            customTarotDeck = deck;
        }
        customTarotEnabled = !!enabled;
        
        // 更新 UI
        const toggle = document.getElementById('custom-tarot-toggle');
        if (toggle) toggle.classList.toggle('active', customTarotEnabled);
        
    } catch (e) {}
}

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([
        loadDiviHistory(),
        loadCustomTarotData()
    ]);
});

// 也立即尝试加载（如果 DOMContentLoaded 已经触发）
if (document.readyState !== 'loading') {
    loadDiviHistory();
    loadCustomTarotData();
}
