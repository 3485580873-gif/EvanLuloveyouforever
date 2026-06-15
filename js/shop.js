/**
 * 商城模块 - 购物、外卖、许愿、订单管理
 */
(function() {
    'use strict';

    const STORAGE_KEYS = {
        products: 'shop_products',
        cart: 'shop_cart',
        orders: 'shop_orders',
        balance: 'shop_balance',
        searchHistory: 'shop_search_history',
        giftCabinet: 'shop_gift_cabinet'
    };

    // 默认商品数据
    const DEFAULT_PRODUCTS = [
        // ===== 推荐 - 衣物 =====
        { id: 'p1', name: '纯棉白衬衫', price: 129, category: 'recommend', tags: '衣物,新品', icon: '👔', desc: '100%新疆长绒棉，亲肤透气，商务休闲两相宜', specs: [{name:'尺码',options:['S','M','L','XL']},{name:'颜色',options:['白色','黑色','浅蓝']}] },
        { id: 'p9', name: '连帽卫衣', price: 169, category: 'recommend', tags: '衣物,热销', icon: '🧥', desc: '加绒加厚，宽松版型，秋冬必备。情侣款可配对穿', specs: [{name:'尺码',options:['M','L','XL','2XL']},{name:'颜色',options:['灰色','黑色','卡其','雾霾蓝']}] },
        { id: 'p10', name: '真丝睡裙', price: 259, category: 'recommend', tags: '衣物,性感', icon: '👗', desc: '100%桑蚕丝，亲肤丝滑，蕾丝拼接设计', specs: [{name:'尺码',options:['S','M','L']},{name:'颜色',options:['酒红','黑色','香槟金']}] },
        { id: 'p11', name: '情侣拖鞋', price: 49, category: 'recommend', tags: '衣物,情侣', icon: '🩴', desc: 'EVA材质，防滑耐磨，可定制刺绣', specs: [{name:'尺码',options:['36-37','38-39','40-41','42-43']}] },
        { id: 'p35', name: '羊绒围巾', price: 139, category: 'recommend', tags: '衣物,秋冬', icon: '🧣', desc: '100%山羊绒，柔软亲肤，保暖不扎脖子', specs: [{name:'颜色',options:['驼色','灰色','酒红','黑色']}] },
        { id: 'p36', name: '毛绒袜子套装', price: 29, category: 'recommend', tags: '衣物,温馨', icon: '🧦', desc: '5双装，珊瑚绒内里，冬天踩在云朵上', specs: [{name:'颜色',options:['暖棕','灰粉','藏蓝']}] },
        // ===== 推荐 - 日用品 =====
        { id: 'p2', name: '香氛沐浴露', price: 59, category: 'recommend', tags: '日用品', icon: '🧴', desc: '持久留香72小时，温和不刺激，适合敏感肌', specs: [{name:'香型',options:['白茶','玫瑰','檀木','海洋']}] },
        { id: 'p12', name: '电动牙刷', price: 189, category: 'recommend', tags: '日用品,热销', icon: '🪥', desc: '声波震动，5种清洁模式，IPX7防水', specs: [{name:'颜色',options:['白色','粉色','黑色']}] },
        { id: 'p13', name: '香薰蜡烛', price: 68, category: 'recommend', tags: '日用品,氛围', icon: '🕯️', desc: '大豆蜡+精油，燃烧40小时，助眠安神', specs: [{name:'香型',options:['薰衣草','佛手柑','雪松','琥珀']}] },
        { id: 'p14', name: '护手霜礼盒', price: 79, category: 'recommend', tags: '日用品,礼盒', icon: '🧴', desc: '6支护手霜套装，滋润不油腻，精美礼盒装', specs: [] },
        { id: 'p37', name: '暖宝宝贴', price: 19, category: 'recommend', tags: '日用品,冬日', icon: '🔥', desc: '10片装，持续发热12小时，冬天贴心小温暖', specs: [{name:'规格',options:['10片装','20片装','50片装']}] },
        { id: 'p38', name: '蒸汽眼罩', price: 39, category: 'recommend', tags: '日用品,助眠', icon: '😴', desc: '30片装，40℃恒温，薰衣草香，缓解眼疲劳', specs: [{name:'香型',options:['薰衣草','洋甘菊','无香']}] },
        // ===== 推荐 - 数码 =====
        { id: 'p3', name: '降噪耳机', price: 899, category: 'recommend', tags: '数码,热销', icon: '🎧', desc: '主动降噪，40小时续航，Hi-Res音质认证', specs: [{name:'颜色',options:['黑色','白色','蓝色']}] },
        { id: 'p15', name: '桌面加湿器', price: 128, category: 'recommend', tags: '数码,小物', icon: '💨', desc: '超声波雾化，静音运行，RGB氛围灯', specs: [{name:'颜色',options:['白色','粉色','绿色']}] },
        { id: 'p16', name: '蓝牙音箱', price: 299, category: 'recommend', tags: '数码', icon: '🔊', desc: 'TWS串联，IPX7防水，20小时续航', specs: [{name:'颜色',options:['黑色','红色','军绿']}] },
        // ===== 推荐 - 计生用品 =====
        { id: 'p17', name: '超薄避孕套', price: 39, category: 'recommend', tags: '计生用品,热销', icon: '🛡️', desc: '0.01mm超薄，水润润滑，每盒12只装', specs: [{name:'规格',options:['12只装','24只装','36只装']}] },
        { id: 'p18', name: '延时安全套', price: 45, category: 'recommend', tags: '计生用品', icon: '⏱️', desc: '苯佐卡因延时配方，有效延长亲密时间', specs: [{name:'规格',options:['6只装','12只装']}] },
        { id: 'p19', name: '小型跳蛋', price: 89, category: 'recommend', tags: '计生用品,情趣', icon: '🪬', desc: '医用硅胶，10频震动，静音防水，USB充电', specs: [{name:'颜色',options:['粉色','紫色','白色']}] },
        { id: 'p20', name: '情趣润滑液', price: 35, category: 'recommend', tags: '计生用品,情趣', icon: '💧', desc: '水基配方，温和不刺激，100ml大瓶装', specs: [{name:'类型',options:['水润型','热感型','果味型']}] },
        { id: 'p21', name: '震动环', price: 69, category: 'recommend', tags: '计生用品,情趣', icon: '💍', desc: '医用硅胶，双重震动，可调节强度，USB充电', specs: [{name:'颜色',options:['黑色','透明','紫色']}] },
        // ===== 推荐 - 饰品 =====
        { id: 'p4', name: '情侣对戒', price: 199, category: 'recommend', tags: '饰品,定制', icon: '💍', desc: '925纯银，可调节尺寸，刻字服务', specs: [{name:'尺寸',options:['5号','6号','7号','8号']}] },
        { id: 'p22', name: '项链吊坠', price: 158, category: 'recommend', tags: '饰品,新品', icon: '📿', desc: 'S925银链+天然珍珠，简约优雅', specs: [{name:'材质',options:['银+珍珠','银+水晶','玫瑰金']}] },
        { id: 'p23', name: '手链', price: 89, category: 'recommend', tags: '饰品', icon: '✨', desc: '天然紫水晶+转运珠，手工编织', specs: [{name:'颜色',options:['紫水晶','粉水晶','黑曜石']}] },
        // ===== 推荐 - 居家 =====
        { id: 'p39', name: '法兰绒毛毯', price: 89, category: 'recommend', tags: '居家,温馨', icon: '🛋️', desc: '150x200cm，双面绒，柔软不掉毛，窝沙发必备', specs: [{name:'颜色',options:['奶白','灰色','粉色','驼色']}] },
        { id: 'p40', name: '情侣马克杯', price: 35, category: 'recommend', tags: '居家,情侣', icon: '☕', desc: '一对装，可定制刻字，400ml大容量', specs: [{name:'颜色',options:['白色','黑色','粉色']}] },
        { id: 'p41', name: '小夜灯', price: 28, category: 'recommend', tags: '居家,温馨', icon: '🌙', desc: '感应式，暖光不刺眼，起夜不摸黑', specs: [{name:'造型',options:['月亮','星星','小熊','云朵']}] },
        { id: 'p42', name: '抱枕', price: 45, category: 'recommend', tags: '居家', icon: '🛌', desc: '记忆棉填充，可拆洗，靠腰神器', specs: [{name:'颜色',options:['奶白','灰色','粉色','蓝色']}] },
        // ===== 推荐 - 美妆 =====
        { id: 'p43', name: '面膜礼盒', price: 69, category: 'recommend', tags: '美妆,礼盒', icon: '🧖', desc: '20片装，玻尿酸+烟酰胺，补水提亮', specs: [{name:'类型',options:['补水','美白','抗皱']}] },
        { id: 'p44', name: '润唇膏', price: 25, category: 'recommend', tags: '美妆', icon: '💋', desc: '天然蜂蜡，不粘腻，可当口红打底', specs: [{name:'色号',options:['透明','珊瑚红','樱花粉']}] },
        { id: 'p45', name: '身体乳', price: 49, category: 'recommend', tags: '美妆', icon: '🫧', desc: '乳木果油配方，滋润全身，留香持久', specs: [{name:'香型',options:['樱花','白茶','椰子']}] },
        // ===== 推荐 - 文具 =====
        { id: 'p46', name: '手账本套装', price: 58, category: 'recommend', tags: '文具,文艺', icon: '📓', desc: 'A5本子+贴纸+彩色笔，记录日常小确幸', specs: [{name:'封面',options:['星空','花卉','简约黑']}] },
        { id: 'p47', name: '明信片套装', price: 22, category: 'recommend', tags: '文具,文艺', icon: '📮', desc: '20张手绘风明信片，写给TA的悄悄话', specs: [] },
        { id: 'p48', name: '书签', price: 15, category: 'recommend', tags: '文具', icon: '🔖', desc: '黄铜材质，镂空叶片造型，精致小巧', specs: [{name:'造型',options:['银杏叶','枫叶','羽毛']}] },
        // ===== 推荐 - 书籍 =====
        { id: 'b1', name: '《傲慢与撒娇》', price: 35, category: 'recommend', tags: '书籍,甜宠', icon: '📖', desc: '高冷型就应该配小太阳啊！看似大冰山的人看到爱人的笑脸也会忍不住萌化吧。', specs: [{name:'版本',options:['平装','精装']}] },
        { id: 'b2', name: '《■■三十六式》', price: 42, category: 'recommend', tags: '书籍,成人', icon: '📕', desc: '如何让伴侣在■■时神魂颠倒。双人学习阅读此书，效果更佳。', specs: [{name:'版本',options:['平装','精装']}] },
        { id: 'b3', name: '《千年等一信息》', price: 30, category: 'recommend', tags: '书籍,浪漫', icon: '📗', desc: '忙碌的日子里，还有一个人在手机那端等待你的消息...', specs: [{name:'版本',options:['平装','精装']}] },
        { id: 'b4', name: '《反向驯化》', price: 38, category: 'recommend', tags: '书籍,心动', icon: '📘', desc: '高端的猎人往往以猎物的形态出现。意识到自己搭进去那天，ta终于承认——爱情才是最高端的狩猎。', specs: [{name:'版本',options:['平装','精装']}] },
        { id: 'b5', name: '《醋精的自我修养》', price: 32, category: 'recommend', tags: '书籍,甜宠', icon: '📙', desc: '爱人太有魅力我吃点醋怎么了。', specs: [{name:'版本',options:['平装','精装']}] },
        { id: 'b6', name: '《半糖去冰》', price: 28, category: 'recommend', tags: '书籍,日常', icon: '📓', desc: '我们的爱情，不过分甜，不假装淡。', specs: [{name:'版本',options:['平装','精装']}] },
        { id: 'b7', name: '《心动无期限》', price: 25, category: 'recommend', tags: '书籍,浪漫', icon: '📒', desc: '未完待续。', specs: [{name:'版本',options:['平装','精装']}] },
        // ===== 外卖 - 奶茶/饮品 =====
        { id: 'p5', name: '芋泥波波奶茶', price: 18, category: 'food', tags: '奶茶,人气', icon: '🧋', desc: '手工芋泥+黑糖珍珠，大杯700ml', specs: [{name:'甜度',options:['三分糖','五分糖','七分糖','全糖']},{name:'温度',options:['常温','去冰','少冰','正常冰']}] },
        { id: 'p24', name: '杨枝甘露', price: 22, category: 'food', tags: '奶茶,新品', icon: '🥭', desc: '新鲜芒果+西柚+椰浆，清爽解腻', specs: [{name:'甜度',options:['三分糖','五分糖','七分糖']},{name:'温度',options:['常温','去冰','少冰']}] },
        { id: 'p25', name: '生椰拿铁', price: 20, category: 'food', tags: '奶茶,热销', icon: '☕', desc: '现萃咖啡+厚椰乳，丝滑香浓', specs: [{name:'甜度',options:['无糖','三分糖','五分糖']},{name:'温度',options:['常温','去冰','少冰','热']}] },
        { id: 'p49', name: '百香果柠檬茶', price: 16, category: 'food', tags: '奶茶,清爽', icon: '🍋', desc: '新鲜百香果+手捣柠檬，酸甜开胃', specs: [{name:'甜度',options:['三分糖','五分糖','七分糖']},{name:'温度',options:['常温','去冰','少冰']}] },
        { id: 'p50', name: '蜜桃气泡水', price: 15, category: 'food', tags: '奶茶,饮品', icon: '🫧', desc: '白桃汁+苏打气泡，少女心满满', specs: [{name:'温度',options:['常温','去冰','少冰']}] },
        { id: 'p51', name: '鲜榨橙汁', price: 18, category: 'food', tags: '奶茶,饮品,健康', icon: '🍊', desc: '现榨新鲜橙子，不加水不加糖，500ml', specs: [{name:'温度',options:['常温','去冰']}] },
        // ===== 外卖 - 快餐 =====
        { id: 'p6', name: '双层牛肉堡套餐', price: 39, category: 'food', tags: '快餐', icon: '🍔', desc: '双层安格斯牛肉+薯条+可乐', specs: [{name:'套餐',options:['标准','加大']}] },
        { id: 'p26', name: '日式拉面', price: 32, category: 'food', tags: '快餐', icon: '🍜', desc: '豚骨浓汤+溏心蛋+叉烧，12小时慢熬', specs: [{name:'辣度',options:['不辣','微辣','中辣']}] },
        { id: 'p27', name: '炸鸡桶', price: 45, category: 'food', tags: '快餐,人气', icon: '🍗', desc: '6块黄金脆皮炸鸡+蜂蜜芥末酱', specs: [{name:'口味',options:['原味','香辣','蒜香']}] },
        { id: 'p52', name: '照烧鸡腿饭', price: 28, category: 'food', tags: '快餐', icon: '🍱', desc: '蜜汁照烧鸡腿+溏心蛋+蔬菜，米饭管够', specs: [] },
        // ===== 外卖 - 零食 =====
        { id: 'p28', name: '薯片大礼包', price: 25, category: 'food', tags: '零食', icon: '🥔', desc: '5种口味混合装，追剧必备', specs: [] },
        { id: 'p29', name: '坚果混合装', price: 38, category: 'food', tags: '零食,健康', icon: '🥜', desc: '每日坚果，7种坚果+果干，30包独立装', specs: [] },
        { id: 'p30', name: '巧克力礼盒', price: 68, category: 'food', tags: '零食,礼盒', icon: '🍫', desc: '比利时进口，12种口味，精美铁盒装', specs: [] },
        { id: 'p53', name: '海苔脆片', price: 12, category: 'food', tags: '零食', icon: '🟢', desc: '夹心海苔，芝麻/坚果夹心，香脆可口', specs: [{name:'口味',options:['芝麻','坚果','芥末']}] },
        { id: 'p54', name: '果冻礼盒', price: 18, category: 'food', tags: '零食,可爱', icon: '🍮', desc: '12个装，果汁果冻，Q弹爽滑', specs: [] },
        // ===== 外卖 - 水果 =====
        { id: 'p7', name: '丹东草莓礼盒', price: 88, category: 'food', tags: '水果,礼盒', icon: '🍓', desc: '精选大果，单果30g+，顺丰包邮', specs: [{name:'规格',options:['500g','1kg']}] },
        { id: 'p31', name: '榴莲', price: 128, category: 'food', tags: '水果', icon: '🍈', desc: '金枕头榴莲，4-5房肉，包出肉率', specs: [{name:'规格',options:['整果约3斤','整果约5斤','果肉500g']}] },
        { id: 'p32', name: '阳光玫瑰葡萄', price: 59, category: 'food', tags: '水果,新品', icon: '🍇', desc: '晴王品种，无籽脆甜，一串约500g', specs: [] },
        { id: 'p55', name: '车厘子', price: 69, category: 'food', tags: '水果', icon: '🍒', desc: '智利进口，JJ级大果，2斤装', specs: [{name:'规格',options:['2斤装','4斤装']}] },
        { id: 'p56', name: '蓝莓', price: 35, category: 'food', tags: '水果,健康', icon: '🫐', desc: '云南高原蓝莓，花青素满满，4盒装', specs: [] },
        // ===== 外卖 - 甜品 =====
        { id: 'p8', name: '提拉米苏蛋糕', price: 128, category: 'food', tags: '甜品', icon: '🍰', desc: '意式经典，马斯卡彭芝士，6寸', specs: [{name:'尺寸',options:['4寸','6寸','8寸']}] },
        { id: 'p33', name: '芒果千层', price: 98, category: 'food', tags: '甜品,人气', icon: '🥭', desc: '20层薄饼+新鲜芒果+淡奶油', specs: [{name:'尺寸',options:['6寸','8寸']}] },
        { id: 'p34', name: '舒芙蕾松饼', price: 36, category: 'food', tags: '甜品,新品', icon: '🧁', desc: '现做现烤，云朵般绵密，配冰淇淋', specs: [{name:'口味',options:['原味','抹茶','巧克力','草莓']}] },
        { id: 'p57', name: '双皮奶', price: 22, category: 'food', tags: '甜品', icon: '🍮', desc: '传统广式甜品，奶香浓郁，配红豆/芒果', specs: [{name:'配料',options:['原味','红豆','芒果','莲子']}] },
        // ===== 外卖 - 汤品 =====
        { id: 'p58', name: '冰糖银耳汤', price: 15, category: 'food', tags: '汤品,养生', icon: '🥣', desc: '古田银耳+红枣+枸杞，胶质满满', specs: [{name:'甜度',options:['无糖','三分糖','五分糖']},{name:'温度',options:['常温','热']}] },
        { id: 'p59', name: '椰子鸡汤', price: 42, category: 'food', tags: '汤品,养生', icon: '🥥', desc: '新鲜椰子水+走地鸡，清甜滋补', specs: [{name:'辣度',options:['不辣','微辣']}] },
        { id: 'p60', name: '红豆沙', price: 12, category: 'food', tags: '汤品,甜蜜', icon: '🫘', desc: '绵密红豆沙+小汤圆，暖胃暖心', specs: [{name:'温度',options:['常温','热']}] },
        // ===== 外卖 - 夜宵 =====
        { id: 'p61', name: '关东煮', price: 25, category: 'food', tags: '夜宵,温暖', icon: '🍢', desc: '8串拼盘，鱼丸+萝卜+海带+福袋，鲜汤打底', specs: [{name:'辣度',options:['不辣','微辣']}] },
        { id: 'p62', name: '烤串拼盘', price: 38, category: 'food', tags: '夜宵,人气', icon: '🍢', desc: '10串混合，羊肉+牛肉+鸡翅+玉米+韭菜', specs: [{name:'辣度',options:['不辣','微辣','中辣','变态辣']}] },
        { id: 'p63', name: '小龙虾', price: 59, category: 'food', tags: '夜宵,人气', icon: '🦞', desc: '麻辣小龙虾2斤，十三香/蒜蓉/麻辣可选', specs: [{name:'口味',options:['十三香','蒜蓉','麻辣','蛋黄']}] },
        { id: 'p64', name: '炒粉', price: 18, category: 'food', tags: '夜宵', icon: '🍜', desc: '广式炒河粉，牛肉+豆芽+鸡蛋，镬气十足', specs: [{name:'辣度',options:['不辣','微辣']}] }
    ];

    let state = {
        products: [],
        cart: [],
        orders: [],
        balance: 520,
        searchHistory: [],
        giftCabinet: [],
        currentNav: 'shop',
        currentTab: 'recommend',
        currentProduct: null,
        modalQty: 1,
        bookingMinutes: null,
        addTagTarget: 'recommend'
    };

    // ========== IndexedDB 数据存储 ==========
    const IDB_NAME = 'ShopDB';
    const IDB_VERSION = 2;
    let idbReady = null;

    function openIDB() {
        if (idbReady) return idbReady;
        idbReady = new Promise((resolve, reject) => {
            const req = indexedDB.open(IDB_NAME, IDB_VERSION);
            req.onupgradeneeded = function(e) {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('products')) {
                    db.createObjectStore('products', { keyPath: 'key' });
                }
                if (!db.objectStoreNames.contains('images')) {
                    db.createObjectStore('images', { keyPath: 'productId' });
                }
            };
            req.onsuccess = function(e) { resolve(e.target.result); };
            req.onerror = function(e) { reject(e.target.error); };
        });
        return idbReady;
    }

    async function idbSet(store, key, value) {
        try {
            const db = await openIDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(store, 'readwrite');
                tx.oncomplete = function() { resolve(); };
                tx.onerror = function() { reject(tx.error); };
                tx.objectStore(store).put({ key: key, value: value });
            });
        } catch(e) {
            console.error('[Shop] idbSet error:', e);
            throw e;
        }
    }

    async function idbGet(store, key) {
        try {
            const db = await openIDB();
            return new Promise((resolve) => {
                const tx = db.transaction(store, 'readonly');
                const req = tx.objectStore(store).get(key);
                req.onsuccess = function() { resolve(req.result ? req.result.value : undefined); };
                req.onerror = function() { resolve(undefined); };
            });
        } catch(e) { return undefined; }
    }

    async function saveImgToIDB(productId, imgData) {
        if (!imgData) return;
        try {
            const db = await openIDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction('images', 'readwrite');
                tx.oncomplete = function() { resolve(); };
                tx.onerror = function() { reject(tx.error); };
                tx.objectStore('images').put({ productId: productId, img: imgData });
            });
        } catch(e) {
            console.error('[Shop] saveImgToIDB error:', e);
            throw e;
        }
    }

    async function loadAllImagesFromIDB() {
        try {
            const db = await openIDB();
            return new Promise((resolve) => {
                const tx = db.transaction('images', 'readonly');
                const req = tx.objectStore('images').getAll();
                req.onsuccess = function() {
                    const map = {};
                    req.result.forEach(r => { map[r.productId] = r.img; });
                    resolve(map);
                };
                req.onerror = function() { resolve({}); };
            });
        } catch(e) { return {}; }
    }

    // ========== 数据持久化 ==========
    async function loadData() {
        let loadedProducts = null;
        try {
            // 大体积数据从 IndexedDB 读取
            const idbProducts = await idbGet('products', 'products');
            if (idbProducts && Array.isArray(idbProducts) && idbProducts.length > 0) {
                loadedProducts = idbProducts;
            }
            const idbCart = await idbGet('products', 'cart');
            state.cart = (idbCart && Array.isArray(idbCart)) ? idbCart : [];
            const idbOrders = await idbGet('products', 'orders');
            state.orders = (idbOrders && Array.isArray(idbOrders)) ? idbOrders : [];
            const idbGift = await idbGet('products', 'giftCabinet');
            state.giftCabinet = (idbGift && Array.isArray(idbGift)) ? idbGift : [];
            const idbMyGift = await idbGet('products', 'myGiftCabinet');
            state.myGiftCabinet = (idbMyGift && Array.isArray(idbMyGift)) ? idbMyGift : [];
            // 小数据从 localStorage 读取
            state.balance = parseFloat(localStorage.getItem(STORAGE_KEYS.balance) || '520');
            state.searchHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.searchHistory) || '[]');
        } catch(e) {
            console.error('[Shop] loadData error:', e);
        }

        // 合并预设商品和已保存的商品（以id去重，保留用户数据）
        const defaultMap = {};
        DEFAULT_PRODUCTS.forEach(p => { defaultMap[p.id] = p; });
        const merged = [...DEFAULT_PRODUCTS];
        if (loadedProducts) {
            loadedProducts.forEach(p => {
                const idx = merged.findIndex(m => m.id === p.id);
                if (idx >= 0) {
                    merged[idx] = p; // 用户修改过的商品覆盖默认
                } else {
                    merged.push(p); // 用户新增的商品
                }
            });
        }
        state.products = merged;

        // 从 IndexedDB 加载图片并合并
        const imgMap = await loadAllImagesFromIDB();
        state.products.forEach(p => {
            if (imgMap[p.id]) {
                p.img = imgMap[p.id];
            }
        });
    }

    async function saveData() {
        // 大体积数据存 IndexedDB
        const productsToSave = state.products.map(p => {
            const { img, ...rest } = p;
            return rest;
        });
        await idbSet('products', 'products', productsToSave);
        await idbSet('products', 'cart', state.cart);
        await idbSet('products', 'orders', state.orders);
        await idbSet('products', 'giftCabinet', state.giftCabinet);
        await idbSet('products', 'myGiftCabinet', state.myGiftCabinet || []);
        // 小数据存 localStorage（礼物柜同时存 localStorage 供 TA 的手机读取）
        localStorage.setItem(STORAGE_KEYS.balance, state.balance.toString());
        localStorage.setItem(STORAGE_KEYS.searchHistory, JSON.stringify(state.searchHistory));
        try {
            localStorage.setItem(STORAGE_KEYS.giftCabinet, JSON.stringify(state.giftCabinet));
        } catch (e) {
            // localStorage 溢出，清理非必要数据后重试
            console.warn('[Shop] localStorage quota exceeded, clearing non-essential data');
            // 清理搜索历史
            localStorage.removeItem(STORAGE_KEYS.searchHistory);
            try {
                localStorage.setItem(STORAGE_KEYS.giftCabinet, JSON.stringify(state.giftCabinet));
            } catch (e2) {
                // 仍然溢出，清理礼物柜中的图片数据后重试
                console.warn('[Shop] Still exceeded, stripping images from giftCabinet');
                var slimCabinet = (state.giftCabinet || []).map(function(item) {
                    var copy = Object.assign({}, item);
                    if (copy.img) delete copy.img;
                    return copy;
                });
                try {
                    localStorage.setItem(STORAGE_KEYS.giftCabinet, JSON.stringify(slimCabinet));
                } catch (e3) {
                    console.error('[Shop] Cannot save giftCabinet to localStorage, skipping');
                }
            }
        }
    }

    // ========== 页面显示/隐藏 ==========
    function showShop() {
        const container = document.getElementById('shop-container');
        if (!container) return;
        container.style.display = 'flex';
        renderProducts();
        updateBalanceDisplay();
        renderCart();
        renderOrders();
    }

    function hideShop() {
        const container = document.getElementById('shop-container');
        if (container) container.style.display = 'none';
    }

    // ========== 导航切换 ==========
    function switchNav(nav, el) {
        state.currentNav = nav;
        document.querySelectorAll('.shop-nav-item').forEach(item => item.classList.remove('active'));
        if (el) el.classList.add('active');

        document.getElementById('shop-recommend-panel').style.display = 'none';
        document.getElementById('shop-food-panel').style.display = 'none';
        document.getElementById('shop-cart-panel').style.display = 'none';
        document.getElementById('shop-order-panel').style.display = 'none';
        document.getElementById('shop-cart-footer').classList.remove('active');
        document.getElementById('shop-main-tabs').style.display = 'none';
        document.getElementById('shop-search-bar').style.display = 'none';

        if (nav === 'shop') {
            document.getElementById('shop-page-title').textContent = '商城';
            document.getElementById('shop-main-tabs').style.display = 'flex';
            document.getElementById('shop-search-bar').style.display = 'flex';
            document.getElementById('shop-recommend-panel').style.display = 'block';
            document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.shop-tab')[0].classList.add('active');
            state.currentTab = 'recommend';
        } else if (nav === 'cart') {
            document.getElementById('shop-page-title').textContent = '购物车';
            document.getElementById('shop-cart-panel').style.display = 'block';
            document.getElementById('shop-cart-footer').classList.add('active');
            renderCart();
        } else if (nav === 'order') {
            document.getElementById('shop-page-title').textContent = '我的订单';
            document.getElementById('shop-order-panel').style.display = 'block';
            renderOrders();
        }
    }

    function switchTab(tab) {
        state.currentTab = tab;
        document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
        event.target.classList.add('active');

        document.getElementById('shop-recommend-panel').style.display = 'none';
        document.getElementById('shop-food-panel').style.display = 'none';

        if (tab === 'recommend') {
            document.getElementById('shop-recommend-panel').style.display = 'block';
        } else if (tab === 'food') {
            document.getElementById('shop-food-panel').style.display = 'block';
        }
    }

    // ========== 商品渲染 ==========
    function renderProducts() {
        const recommendGrid = document.getElementById('shop-recommend-grid');
        const foodGrid = document.getElementById('shop-food-grid');
        if (!recommendGrid || !foodGrid) return;

        recommendGrid.innerHTML = state.products
            .filter(p => p.category === 'recommend')
            .map(p => createProductCard(p))
            .join('');

        foodGrid.innerHTML = state.products
            .filter(p => p.category === 'food')
            .map(p => createProductCard(p))
            .join('');

        bindProductLongPress();
    }

    function createProductCard(product) {
        const tags = product.tags.split(',').filter(t => t.trim()).map(t =>
            `<span class="product-tag">${t.trim()}</span>`
        ).join('');
        const imgHtml = product.img
            ? `<img src="${product.img}" style="width:100%;height:100%;object-fit:cover;">`
            : (product.icon || '📦');
        return `
            <div class="product-card" data-id="${product.id}" data-name="${product.name}" data-tags="${product.tags}" onclick="window.ShopApp.showProductDetail('${product.id}')">
                <div class="product-img">${imgHtml}</div>
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-desc">${product.desc}</div>
                    <div class="product-tags">${tags}</div>
                    <div class="product-price-row">
                        <div class="product-price">¥${product.price}</div>
                        <button class="add-cart-btn" onclick="event.stopPropagation(); window.ShopApp.addToCart('${product.id}')">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // 渲染后绑定长按事件
    function bindProductLongPress() {
        document.querySelectorAll('.product-card').forEach(card => {
            const productId = card.getAttribute('data-id');
            let timer = null;
            const startLongPress = (e) => {
                timer = setTimeout(() => {
                    e.preventDefault();
                    editProduct(productId);
                }, 600);
            };
            const cancelLongPress = () => {
                if (timer) { clearTimeout(timer); timer = null; }
            };
            card.addEventListener('touchstart', startLongPress, { passive: true });
            card.addEventListener('touchmove', cancelLongPress, { passive: true });
            card.addEventListener('touchend', cancelLongPress, { passive: true });
            card.addEventListener('touchcancel', cancelLongPress, { passive: true });
            card.addEventListener('mousedown', startLongPress);
            card.addEventListener('mousemove', cancelLongPress);
            card.addEventListener('mouseup', cancelLongPress);
            card.addEventListener('mouseleave', cancelLongPress);
        });
    }

    // ========== 商品编辑 ==========
    function editProduct(productId) {
        const product = state.products.find(p => p.id === productId);
        if (!product) return;

        // 标记编辑模式
        state._editingProductId = productId;

        // 填充表单
        const nameEl = document.getElementById('wish-name');
        const priceEl = document.getElementById('wish-price');
        const categoryEl = document.getElementById('wish-category');
        const tagsEl = document.getElementById('wish-tags');
        const iconEl = document.getElementById('wish-icon');
        const descEl = document.getElementById('wish-desc');

        if (nameEl) nameEl.value = product.name || '';
        if (priceEl) priceEl.value = product.price || '';
        if (categoryEl) categoryEl.value = product.category || 'recommend';
        if (tagsEl) tagsEl.value = product.tags || '';
        if (iconEl) iconEl.value = product.icon || '';
        if (descEl) descEl.value = product.desc || '';

        // 填充规格
        const specsContainer = document.getElementById('wish-specs');
        if (specsContainer) specsContainer.innerHTML = '';
        if (product.specs && product.specs.length > 0) {
            product.specs.forEach(spec => {
                addWishSpec(spec.name, spec.options);
            });
        }

        // 图片预览
        if (product.img) {
            wishImgData = product.img;
            const preview = document.getElementById('wish-img-preview');
            if (preview) {
                preview.innerHTML = `<img src="${product.img}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">`;
                preview.style.display = 'flex';
            }
        }

        // 修改弹窗标题和按钮
        const titleEl = document.querySelector('#shop-wish-modal .shop-modal-content > div');
        if (titleEl) titleEl.textContent = '✏️ 编辑商品';
        const submitBtn = document.querySelector('#shop-wish-modal .buy-btn.dream');
        if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-check"></i> 保存修改';

        // 添加删除按钮（如果不存在）
        if (!document.getElementById('wish-delete-btn')) {
            const btn = document.createElement('button');
            btn.id = 'wish-delete-btn';
            btn.style.cssText = 'width:100%;margin-top:8px;padding:12px;border:1.5px solid #ff4757;background:transparent;color:#ff4757;border-radius:10px;font-size:0.9rem;font-weight:600;cursor:pointer;font-family:var(--font-family);';
            btn.innerHTML = '<i class="fas fa-trash"></i> 删除此商品';
            btn.onclick = () => {
                if (confirm('确定删除此商品？')) {
                    state.products = state.products.filter(p => p.id !== productId);
                    saveData();
                    renderProducts();
                    closeWishModal();
                    if (typeof showNotification === 'function') showNotification('已删除', 'success');
                }
            };
            submitBtn.parentNode.insertBefore(btn, submitBtn.nextSibling);
        }

        // 打开弹窗
        document.getElementById('shop-wish-modal').classList.add('active');
    }

    // ========== 商品详情 ==========
    function showProductDetail(productId, mode) {
        const product = state.products.find(p => p.id === productId);
        if (!product) return;
        state.currentProduct = product;
        state.modalQty = 1;

        const modalImg = document.getElementById('shop-modal-img');
        if (product.img) {
            modalImg.innerHTML = `<img src="${product.img}" style="width:100%;height:100%;object-fit:cover;">`;
        } else {
            modalImg.textContent = product.icon || '📦';
        }
        document.getElementById('shop-modal-name').textContent = product.name;
        document.getElementById('shop-modal-desc').textContent = product.desc;
        document.getElementById('shop-modal-price').textContent = `¥${product.price}`;
        document.getElementById('shop-modal-qty').textContent = '1';
        document.getElementById('shop-modal-remark').value = '';

        // 渲染规格
        const specsContainer = document.getElementById('shop-modal-specs');
        if (product.specs && product.specs.length > 0) {
            specsContainer.innerHTML = product.specs.map((spec, idx) => `
                <div class="spec-section">
                    <div class="spec-title">${spec.name}</div>
                    <div class="spec-options">
                        ${spec.options.map((opt, i) => `
                            <div class="spec-option ${i === 0 ? 'active' : ''}" data-spec="${idx}">${opt}</div>
                        `).join('')}
                    </div>
                </div>
            `).join('');

            // 绑定规格点击
            specsContainer.querySelectorAll('.spec-option').forEach(opt => {
                opt.addEventListener('click', function() {
                    this.parentElement.querySelectorAll('.spec-option').forEach(o => o.classList.remove('active'));
                    this.classList.add('active');
                });
            });
        } else {
            specsContainer.innerHTML = '';
        }

        // 根据来源显示不同按钮
        const btnCart = document.getElementById('shop-modal-btn-cart');
        const btnSelf = document.getElementById('shop-modal-btn-self');
        const btnDream = document.getElementById('shop-modal-btn-dream');
        const btnBooking = document.getElementById('shop-modal-btn-booking');
        if (mode === 'cart') {
            // 点击加号：只显示"加入购物车"
            btnCart.style.display = '';
            btnSelf.style.display = 'none';
            btnDream.style.display = 'none';
            btnBooking.style.display = 'none';
        } else {
            // 点击商品：显示全部按钮
            btnCart.style.display = '';
            btnSelf.style.display = '';
            btnDream.style.display = '';
            btnBooking.style.display = '';
        }

        document.getElementById('shop-product-modal').classList.add('active');
    }

    function closeProductModal() {
        document.getElementById('shop-product-modal').classList.remove('active');
        state.currentProduct = null;
    }

    function changeQty(delta) {
        state.modalQty = Math.max(1, state.modalQty + delta);
        document.getElementById('shop-modal-qty').textContent = state.modalQty;
    }

    // ========== 购物车 ==========
    async function addToCart(productId) {
        showProductDetail(productId, 'cart');
    }

    async function addToCartFromModal() {
        const product = state.currentProduct;
        if (!product) return;

        // 收集选中的规格
        const selectedSpecs = [];
        const specsContainer = document.getElementById('shop-modal-specs');
        if (specsContainer) {
            specsContainer.querySelectorAll('.spec-section').forEach((section, idx) => {
                const activeOpt = section.querySelector('.spec-option.active');
                if (activeOpt && product.specs && product.specs[idx]) {
                    selectedSpecs.push({
                        name: product.specs[idx].name,
                        value: activeOpt.textContent
                    });
                }
            });
        }

        const remark = document.getElementById('shop-modal-remark')?.value || '';
        const qty = state.modalQty || 1;

        const existing = state.cart.find(item =>
            item.productId === product.id &&
            JSON.stringify(item.specs || []) === JSON.stringify(selectedSpecs)
        );

        if (existing) {
            existing.qty += qty;
        } else {
            state.cart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                icon: product.icon,
                img: product.img,
                qty: qty,
                selected: true,
                specs: selectedSpecs,
                remark: remark
            });
        }
        try {
            await saveData();
        } catch (e) {
            console.error('[Shop] addToCartFromModal saveData error:', e);
        }
        updateCartBadge();
        closeProductModal();
        showToast(`已加入购物车: ${product.name} x${qty}`);
    }

    function showToast(message) {
        let toast = document.getElementById('shop-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'shop-toast';
            toast.style.cssText = 'position:fixed;top:20%;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.7);color:#fff;padding:10px 20px;border-radius:20px;font-size:0.85rem;z-index:100002;pointer-events:none;opacity:0;transition:opacity 0.3s;';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.style.opacity = '1';
        setTimeout(() => { toast.style.opacity = '0'; }, 1500);
    }

    function renderCart() {
        const list = document.getElementById('shop-cart-list');
        if (!list) return;

        if (state.cart.length === 0) {
            list.innerHTML = '<div class="search-result-empty">购物车是空的</div>';
            document.getElementById('shop-cart-total').textContent = '¥0';
            return;
        }

        try {
            list.innerHTML = state.cart.map((item, idx) => {
                const hasImg = item.img && typeof item.img === 'string' && item.img.startsWith('data:');
                const imgHtml = hasImg
                    ? `<img src="${item.img}" style="width:100%;height:100%;object-fit:cover;">`
                    : (item.icon || '📦');
                const specText = item.specs && item.specs.length > 0
                    ? item.specs.map(s => `${s.name}:${s.value}`).join(' ')
                    : '';
                return `
                <div class="cart-item">
                    <input type="checkbox" class="cart-checkbox" ${item.selected ? 'checked' : ''} onchange="window.ShopApp.toggleCartItem(${idx})">
                    <div class="cart-item-img">${imgHtml}</div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name || '未命名商品'}</div>
                        <div class="cart-item-spec">${specText || ('¥' + (item.price || 0))}</div>
                        <div class="cart-item-bottom">
                            <div class="cart-item-price">¥${(item.price || 0) * (item.qty || 1)}</div>
                            <div class="quantity-control">
                                <button class="qty-btn" onclick="window.ShopApp.changeCartQty(${idx}, -1)">-</button>
                                <span class="qty-num">${item.qty || 1}</span>
                                <button class="qty-btn" onclick="window.ShopApp.changeCartQty(${idx}, 1)">+</button>
                            </div>
                        </div>
                    </div>
                </div>
                `;
            }).join('');
        } catch (err) {
            console.error('[Shop] renderCart error:', err);
            list.innerHTML = '<div class="search-result-empty">购物车加载失败</div>';
        }

        updateCartTotal();
    }

    async function toggleCartItem(idx) {
        state.cart[idx].selected = !state.cart[idx].selected;
        await saveData();
        updateCartTotal();
    }

    async function changeCartQty(idx, delta) {
        state.cart[idx].qty = Math.max(1, state.cart[idx].qty + delta);
        if (state.cart[idx].qty <= 0) {
            state.cart.splice(idx, 1);
        }
        await saveData();
        renderCart();
        updateCartBadge();
    }

    async function toggleSelectAll() {
        const checked = document.getElementById('shop-cart-selectall').checked;
        state.cart.forEach(item => item.selected = checked);
        await saveData();
        renderCart();
    }

    function updateCartTotal() {
        const total = state.cart
            .filter(item => item.selected)
            .reduce((sum, item) => sum + item.price * item.qty, 0);
        document.getElementById('shop-cart-total').textContent = `¥${total}`;
    }

    function updateCartBadge() {
        const total = state.cart.reduce((sum, item) => sum + item.qty, 0);
        // 可以在这里更新底部导航的购物车角标
    }

    // ========== 购买 ==========
    async function buy(target) {
        if (!state.currentProduct) return;
        const product = state.currentProduct;
        const remark = document.getElementById('shop-modal-remark').value.trim();
        const total = product.price * state.modalQty;

        if (state.balance < total) {
            alert('余额不足，请设置余额');
            return;
        }

        // 获取选中的规格
        const selectedSpecs = [];
        document.querySelectorAll('#shop-modal-specs .spec-section').forEach(section => {
            const title = section.querySelector('.spec-title').textContent;
            const active = section.querySelector('.spec-option.active');
            if (active) selectedSpecs.push(`${title}: ${active.textContent}`);
        });

        state.balance -= total;

        const order = {
            id: 'ORD' + Date.now(),
            productId: product.id,
            name: product.name,
            price: product.price,
            qty: state.modalQty,
            icon: product.icon,
            specs: selectedSpecs.join(' | '),
            remark: remark,
            target: target,
            status: 'completed',
            time: Date.now(),
            replies: generateReplies()
        };

        state.orders.unshift(order);

        // 给梦角买的放入TA的礼物柜
        if (target === 'dream') {
            state.giftCabinet.unshift({
                orderId: order.id,
                name: product.name,
                icon: product.icon,
                img: product.img,
                price: product.price,
                qty: state.modalQty,
                specs: selectedSpecs.join(' | '),
                remark: remark,
                time: Date.now(),
                replies: order.replies
            });
        }

        // 放入我的礼物柜（给梦角买的只进TA的礼物柜，不进我的礼物柜）
        if (target !== 'dream' && window.GiftCabinetApp) window.GiftCabinetApp.add(product, state.modalQty, '购买', order.id);

        try {
            await saveData();
        } catch (e) {
            console.error('[Shop] buy saveData error:', e);
        }
        updateBalanceDisplay();
        alert(target === 'dream' ? '已给梦角购买！' : '购买成功！');
        closeProductModal();
    }

    // ========== 预订 ==========
    function showBookingModal() {
        closeProductModal();
        document.getElementById('shop-booking-modal').classList.add('active');
    }

    function closeBookingModal() {
        document.getElementById('shop-booking-modal').classList.remove('active');
        state.bookingMinutes = null;
    }

    function selectBooking(el, minutes) {
        document.querySelectorAll('#shop-booking-modal .spec-option').forEach(o => o.classList.remove('active'));
        el.classList.add('active');
        state.bookingMinutes = minutes;
    }

    async function bookingBuy(target) {
        const customMinutes = document.getElementById('shop-booking-minutes').value;
        const minutes = state.bookingMinutes || parseInt(customMinutes) || 5;

        if (!state.currentProduct) return;
        const product = state.currentProduct;
        const remark = document.getElementById('shop-modal-remark').value.trim();
        const total = product.price * state.modalQty;

        if (state.balance < total) {
            alert('余额不足');
            return;
        }

        state.balance -= total;

        const order = {
            id: 'ORD' + Date.now(),
            productId: product.id,
            name: product.name,
            price: product.price,
            qty: state.modalQty,
            icon: product.icon,
            specs: '',
            remark: remark,
            target: target,
            status: 'pending',
            time: Date.now(),
            deliverTime: Date.now() + minutes * 60000,
            replies: []
        };

        state.orders.unshift(order);
        try {
            await saveData();
        } catch (e) {
            console.error('[Shop] bookingBuy saveData error:', e);
        }
        updateBalanceDisplay();
        alert(`已预订，将在 ${minutes} 分钟后送达`);
        closeBookingModal();
        setTimeout(async () => {
            order.status = 'completed';
            order.replies = generateReplies();
            if (target === 'dream') {
                state.giftCabinet.unshift({
                    orderId: order.id,
                    name: product.name,
                    icon: product.icon,
                    img: product.img,
                    price: product.price,
                    qty: state.modalQty,
                    specs: '',
                    remark: remark,
                    time: Date.now(),
                    replies: order.replies
                });
            }
            await saveData();
        }, minutes * 60000);

        alert(`已预订，将在 ${minutes} 分钟后送达`);
    }

    // ========== 购物车结算 ==========
    async function deleteSelected() {
        const selected = state.cart.filter(item => item.selected);
        if (selected.length === 0) {
            alert('请先勾选要删除的商品');
            return;
        }
        if (!confirm(`确定删除 ${selected.length} 件商品吗？`)) return;
        state.cart = state.cart.filter(item => !item.selected);
        await saveData();
        renderCart();
        updateCartBadge();
        showToast(`已删除 ${selected.length} 件商品`);
    }

    async function checkout() {
        const selected = state.cart.filter(item => item.selected);
        if (selected.length === 0) {
            alert('请选择商品');
            return;
        }

        const total = selected.reduce((sum, item) => sum + item.price * item.qty, 0);
        if (state.balance < total) {
            alert('余额不足');
            return;
        }

        state.balance -= total;

        selected.forEach(item => {
            const order = {
                id: 'ORD' + Date.now() + Math.random(),
                productId: item.productId,
                name: item.name,
                price: item.price,
                qty: item.qty,
                icon: item.icon,
                specs: '',
                remark: '',
                target: 'self',
                status: 'completed',
                time: Date.now(),
                replies: []
            };
            state.orders.unshift(order);

            // 放入我的礼物柜
            if (window.GiftCabinetApp) window.GiftCabinetApp.add(item, item.qty, '购物车购买', order.id);
        });

        state.cart = state.cart.filter(item => !item.selected);
        await saveData();
        renderCart();
        updateBalanceDisplay();
        alert('结算成功！');
    }

    // ========== 订单 ==========
    function renderOrders() {
        const list = document.getElementById('shop-order-list');
        if (!list) return;

        if (state.orders.length === 0) {
            list.innerHTML = '<div class="search-result-empty">暂无订单</div>';
            return;
        }

        list.innerHTML = state.orders.map(order => {
            const isPending = order.status === 'pending';
            const isCancelled = order.status === 'cancelled';
            const timeStr = formatTime(order.time);
            const deliverStr = order.deliverTime ? `预计 ${formatTime(order.deliverTime)} 送达` : timeStr;
            const statusText = isPending ? '待送达' : (isCancelled ? '已取消' : '已完成');
            const cancelBtnHtml = isCancelled ? '' : `<button class="order-btn danger" onclick="window.ShopApp.cancelOrder('${order.id}')">取消订单</button>`;
            return `
                <div class="order-item">
                    <div class="order-header">
                        <span style="font-size:0.75rem;color:var(--text-light);">订单号: ${order.id}</span>
                        <span class="order-status ${order.status}">${statusText}</span>
                    </div>
                    <div class="order-product">
                        <div class="order-product-img">${order.icon || '📦'}</div>
                        <div class="order-product-info">
                            <div class="order-product-name">${order.name}</div>
                            <div class="order-product-spec">${order.specs || '默认规格'}</div>
                            <div class="order-product-price">¥${order.price} x ${order.qty}</div>
                        </div>
                    </div>
                    <div class="order-footer">
                        <span class="order-time">${isPending ? deliverStr : timeStr}</span>
                        <div class="order-actions">
                            ${cancelBtnHtml}
                            ${order.replies && order.replies.length > 0 ? `<button class="order-btn" onclick="window.ShopApp.showReplyModal('${order.id}')">查看回复</button>` : ''}
                            ${!isCancelled ? `<button class="order-btn primary" onclick="window.ShopApp.rebuy('${order.productId}')">再次购买</button>` : ''}
                        </div>
                    </div>
                    ${order.remark ? `<div class="order-remark">${order.remark}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    function filterOrder(el, type) {
        document.querySelectorAll('.order-tab').forEach(t => t.classList.remove('active'));
        el.classList.add('active');

        const items = document.querySelectorAll('.order-item');
        items.forEach((item, idx) => {
            const order = state.orders[idx];
            if (!order) return;
            if (type === 'all') {
                item.style.display = 'block';
            } else if (type === 'pending') {
                item.style.display = order.status === 'pending' ? 'block' : 'none';
            } else if (type === 'completed') {
                item.style.display = order.status === 'completed' ? 'block' : 'none';
            } else if (type === 'cancelled') {
                item.style.display = order.status === 'cancelled' ? 'block' : 'none';
            }
        });
    }

    function rebuy(productId) {
        const product = state.products.find(p => p.id === productId);
        if (product) showProductDetail(productId);
    }

    // ========== 取消订单 ==========
    async function cancelOrder(orderId) {
        const orderIndex = state.orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;
        const order = state.orders[orderIndex];

        if (order.status === 'cancelled') {
            showToast('该订单已取消');
            return;
        }

        const refundAmount = order.price * order.qty;
        if (!confirm(`确定取消订单「${order.name}」？金额 ¥${refundAmount.toFixed(2)} 将退回余额。`)) return;

        // 1. 退回金额
        state.balance += refundAmount;

        // 2. 从 TA 的礼物柜删除（通过 orderId 匹配）
        state.giftCabinet = state.giftCabinet.filter(item => item.orderId !== orderId);

        // 3. 从我的礼物柜删除（通过 orderId 匹配）
        state.myGiftCabinet = (state.myGiftCabinet || []).filter(item => item.orderId !== orderId);

        // 4. 更新订单状态为 cancelled
        order.status = 'cancelled';

        // 5. 保存并刷新
        try { await saveData(); } catch (e) { console.error('[Shop] cancelOrder saveData error:', e); }
        updateBalanceDisplay();
        renderOrders();
        showToast('订单已取消，金额已退回');
    }

    // ========== 分享 & 代付 ==========
    function getProductThumbHtml(product, size) {
        const s = size || 60;
        if (product.img && typeof product.img === 'string' && product.img.startsWith('data:')) {
            return `<img src="${product.img}" style="width:${s}px;height:${s}px;object-fit:cover;border-radius:6px;">`;
        }
        return `<span style="font-size:${s * 0.5}px;">${product.icon || '📦'}</span>`;
    }

    // 统一分享卡片（宽度260px，与红包一致）
    function buildShareCard(product, tag, tagColor) {
        const thumbHtml = getProductThumbHtml(product, 52);
        const color = tagColor || '#ff4757';
        return `<div style="background:linear-gradient(135deg,#fff5f5,#fff);border:1px solid #ffe0e0;border-radius:8px;padding:4px 6px;display:flex;gap:5px;align-items:center;width:260px;">
            <div style="width:52px;height:52px;background:#f0f0f0;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;">${thumbHtml}</div>
            <div style="flex:1;min-width:0;line-height:1.15;">
                <div style="font-size:0.72rem;color:#666;">${product.name}</div>
                <div style="font-size:0.78rem;color:#ff4757;font-weight:700;">¥${product.price}</div>
                <span style="display:inline-block;background:${color};color:#fff;font-size:0.55rem;padding:0px 4px;border-radius:6px;margin-top:1px;">${tag}</span>
            </div>
        </div>`;
    }

    function getRandomReply() {
        const pool = (typeof customReplies !== 'undefined' && Array.isArray(customReplies))
            ? customReplies.map(r => String(r || '').trim()).filter(Boolean)
            : [];
        if (pool.length > 0) {
            return pool[Math.floor(Math.random() * pool.length)];
        }
        return '这个好适合你！';
    }

    function shareProduct() {
        const product = state.currentProduct;
        if (!product) return;
        closeProductModal();

        const shareHtml = buildShareCard(product, '好物分享', '#ff4757');

        if (typeof addMessage === 'function') {
            addMessage({
                id: 'share_' + Date.now(),
                sender: 'user',
                text: shareHtml,
                timestamp: new Date(),
                status: 'sent',
                type: 'share',
                shareData: { name: product.name, price: product.price, icon: product.icon, img: product.img }
            });
        }

        showToast('已分享到聊天');

        // TA 自动回复
        setTimeout(() => {
            if (typeof addMessage === 'function') {
                addMessage({
                    id: 'share_reply_' + Date.now(),
                    sender: 'ta',
                    text: getRandomReply(),
                    timestamp: new Date(),
                    status: 'received',
                    type: 'normal'
                });
            }
        }, 1500 + Math.random() * 2000);
    }

    async function askTAPay() {
        const product = state.currentProduct;
        if (!product) return;

        if (state.balance < product.price * state.modalQty) {
            alert('余额不足');
            return;
        }

        closeProductModal();

        // 扣余额下单
        const total = product.price * state.modalQty;
        state.balance -= total;

        // 创建订单
        const order = {
            id: 'ORD' + Date.now(),
            productId: product.id,
            name: product.name,
            price: product.price,
            qty: state.modalQty,
            icon: product.icon,
            specs: '',
            remark: '',
            target: 'self',
            status: 'completed',
            time: Date.now(),
            replies: generateReplies()
        };
        state.orders.unshift(order);

        // 放入我的礼物柜
        if (window.GiftCabinetApp) window.GiftCabinetApp.add(product, state.modalQty, '代付', order.id);

        try { await saveData(); } catch (e) { console.error('[Shop] askTAPay saveData error:', e); }
        updateBalanceDisplay();

        // 发送代付请求卡片（与分享卡片同结构）
        const thumbHtml = getProductThumbHtml(product, 52);
        const payHtml = `<div style="background:linear-gradient(135deg,#fff8f0,#fff);border:1px solid #ffd8b0;border-radius:8px;padding:4px 6px;display:flex;gap:5px;align-items:center;width:260px;">
            <div style="width:52px;height:52px;background:#f0f0f0;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;">${thumbHtml}</div>
            <div style="flex:1;min-width:0;line-height:1.2;">
                <div style="font-size:0.72rem;color:#666;">帮我买这个好不好~</div>
                <div style="font-size:0.72rem;font-weight:600;color:#333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${product.name}</div>
                <div style="font-size:0.78rem;color:#ff4757;font-weight:700;">¥${total}</div>
                <span style="display:inline-block;background:linear-gradient(135deg,#ff9a56,#ff6b35);color:#fff;font-size:0.55rem;padding:0px 4px;border-radius:6px;margin-top:1px;">💝 已帮TA付</span>
            </div>
        </div>`;

        if (typeof addMessage === 'function') {
            addMessage({
                id: 'pay_req_' + Date.now(),
                sender: 'user',
                text: payHtml,
                timestamp: new Date(),
                status: 'sent',
                type: 'pay-request',
                shareData: { name: product.name, price: product.price, icon: product.icon, img: product.img }
            });
        }

        showToast('已代付下单');

        // TA 自动回复 + 发送分享图
        setTimeout(() => {
            // TA 回复
            if (typeof addMessage === 'function') {
                addMessage({
                    id: 'pay_reply_' + Date.now(),
                    sender: 'ta',
                    text: getRandomReply(),
                    timestamp: new Date(),
                    status: 'received',
                    type: 'normal'
                });
            }
            // TA 发送分享图（已代付）
            setTimeout(() => {
                const shareHtml = buildShareCard(product, '已代付', '#ff9a56');
                if (typeof addMessage === 'function') {
                    addMessage({
                        id: 'pay_share_' + Date.now(),
                        sender: 'ta',
                        text: shareHtml,
                        timestamp: new Date(),
                        status: 'received',
                        type: 'share',
                        shareData: { name: product.name, price: product.price, icon: product.icon, img: product.img }
                    });
                }
            }, 800);
        }, 1500 + Math.random() * 2000);
    }

    // 30% 概率自动从购物车购买（整个会话期间随机触发）
    let autoBuyTimer = null;
    function startAutoBuyTimer() {
        if (autoBuyTimer) return;
        // 随机在 10~60 秒后检查一次
        const delay = 10000 + Math.random() * 50000;
        autoBuyTimer = setTimeout(async () => {
            autoBuyTimer = null;
            await tryAutoBuyFromCart();
            // 继续下一轮
            startAutoBuyTimer();
        }, delay);
    }
    function stopAutoBuyTimer() {
        if (autoBuyTimer) {
            clearTimeout(autoBuyTimer);
            autoBuyTimer = null;
        }
    }

    async function tryAutoBuyFromCart() {
        if (state.cart.length === 0) return;
        if (Math.random() > 0.3) return;

        const item = state.cart[Math.floor(Math.random() * state.cart.length)];
        const product = state.products.find(p => p.id === item.productId);
        if (!product) return;

        const total = item.price * item.qty;
        if (state.balance < total) return;

        // 扣余额
        state.balance -= total;

        // 创建订单
        const order = {
            id: 'ORD_AUTO_' + Date.now(),
            productId: product.id,
            name: product.name,
            price: product.price,
            qty: item.qty,
            icon: product.icon,
            specs: item.specs ? item.specs.map(s => `${s.name}:${s.value}`).join(' | ') : '',
            remark: item.remark || '',
            target: 'self',
            status: 'completed',
            time: Date.now(),
            replies: generateReplies()
        };
        state.orders.unshift(order);

        // 从购物车移除
        state.cart = state.cart.filter(c => c !== item);

        // 放入我的礼物柜
        if (window.GiftCabinetApp) window.GiftCabinetApp.add(product, item.qty, '自动购买', order.id);

        try { await saveData(); } catch (e) { console.error('[Shop] tryAutoBuyFromCart saveData error:', e); }
        updateBalanceDisplay();
        updateCartBadge();

        // TA 发送分享图（已自动下单）
        const shareHtml = buildShareCard(product, '已自动下单', '#ff9a56');
        if (typeof addMessage === 'function') {
            addMessage({
                id: 'auto_buy_' + Date.now(),
                sender: 'ta',
                text: shareHtml,
                timestamp: new Date(),
                status: 'received',
                type: 'share',
                shareData: { name: product.name, price: product.price, icon: product.icon, img: product.img }
            });
        }
    }

    // ========== 回复 ==========
    function generateReplies() {
        const replies = [];
        // 从自定义回复库中随机选取回复
        const pool = (typeof customReplies !== 'undefined' && Array.isArray(customReplies))
            ? customReplies.map(r => String(r || '').trim()).filter(Boolean)
            : [];

        if (pool.length > 0) {
            // 随机选 1~3 条不重复的回复
            const count = Math.min(pool.length, Math.random() < 0.6 ? 1 : (Math.random() < 0.85 ? 2 : 3));
            const shuffled = [...pool].sort(() => Math.random() - 0.5);
            for (let i = 0; i < count; i++) {
                const text = shuffled[i];
                // 检查是否是图片（base64 或图片 URL）
                const isImg = text.startsWith('data:image') || /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(text);
                replies.push({
                    text: isImg ? '' : text,
                    img: isImg ? text : undefined
                });
            }
        } else {
            // 兜底默认回复
            replies.push(
                { text: '谢谢你送我的礼物！我很喜欢~' },
                { text: '这个礼物太贴心了，你眼光真好！' },
                { text: '今天一直在用你送的东西，感觉你就在身边~' }
            );
        }
        return replies;
    }

    function showReplyModal(orderId) {
        const order = state.orders.find(o => o.id === orderId);
        if (!order || !order.replies) return;

        const list = document.getElementById('shop-reply-list');
        list.innerHTML = order.replies.map(r => `
            <div class="reply-bubble">
                <div class="reply-time">${r.time || ''}</div>
                <div class="reply-text">${r.text || ''}</div>
                ${r.img ? `<img src="${r.img}" style="max-width:100%;border-radius:8px;margin-top:6px;">` : ''}
            </div>
        `).join('');

        document.getElementById('shop-reply-modal').classList.add('active');
    }

    function closeReplyModal() {
        document.getElementById('shop-reply-modal').classList.remove('active');
    }

    // ========== 搜索 ==========
    function onSearchInput() {
        const val = document.getElementById('shop-search-input').value;
        const clearBtn = document.getElementById('shop-search-clear');
        clearBtn.classList.toggle('visible', val.length > 0);

        if (val.length > 0) {
            document.getElementById('shop-search-dropdown').classList.remove('active');
            searchProducts(val);
        } else {
            document.getElementById('shop-search-dropdown').classList.add('active');
            showAllProducts();
        }
    }

    function showSearchDropdown() {
        const val = document.getElementById('shop-search-input').value;
        if (val.length === 0) {
            renderSearchHistory();
            document.getElementById('shop-search-dropdown').classList.add('active');
        }
    }

    function quickSearch(keyword) {
        document.getElementById('shop-search-input').value = keyword;
        document.getElementById('shop-search-dropdown').classList.remove('active');
        document.getElementById('shop-search-clear').classList.add('visible');
        addSearchHistory(keyword);
        searchProducts(keyword);
    }

    function clearSearch() {
        document.getElementById('shop-search-input').value = '';
        document.getElementById('shop-search-clear').classList.remove('visible');
        document.getElementById('shop-search-dropdown').classList.add('active');
        showAllProducts();
    }

    function searchProducts(keyword) {
        keyword = keyword.toLowerCase();
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
            const name = (card.getAttribute('data-name') || '').toLowerCase();
            const tags = (card.getAttribute('data-tags') || '').toLowerCase();
            if (name.includes(keyword) || tags.includes(keyword)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    function showAllProducts() {
        document.querySelectorAll('.product-card').forEach(card => card.style.display = 'block');
    }

    async function addSearchHistory(keyword) {
        if (!keyword) return;
        state.searchHistory = state.searchHistory.filter(k => k !== keyword);
        state.searchHistory.unshift(keyword);
        if (state.searchHistory.length > 10) state.searchHistory.pop();
        await saveData();
    }

    function renderSearchHistory() {
        const container = document.getElementById('shop-search-history');
        if (!container) return;
        if (state.searchHistory.length === 0) {
            container.innerHTML = '<span style="font-size:0.7rem;color:var(--text-light);">暂无搜索历史</span>';
        } else {
            container.innerHTML = state.searchHistory.map(k =>
                `<div class="search-dropdown-tag" onclick="window.ShopApp.quickSearch('${k}')">${k}</div>`
            ).join('');
        }
    }

    async function clearSearchHistory() {
        state.searchHistory = [];
        await saveData();
        renderSearchHistory();
    }

    // ========== 小分类 ==========
    function toggleSubTags(toggleEl) {
        toggleEl.classList.toggle('expanded');
        const content = toggleEl.nextElementSibling;
        content.classList.toggle('expanded');
    }

    function filterSubTag(el) {
        const wrapper = el.closest('.sub-tags-content');
        wrapper.querySelectorAll('.sub-tag').forEach(t => t.classList.remove('active'));
        el.classList.add('active');

        const tag = el.textContent;
        const gridId = wrapper.id === 'shop-recommend-subtags' ? 'shop-recommend-grid' : 'shop-food-grid';
        const cards = document.querySelectorAll('#' + gridId + ' .product-card');

        cards.forEach(card => {
            if (tag === '全部') {
                card.style.display = 'block';
            } else {
                const tags = card.getAttribute('data-tags');
                card.style.display = tags && tags.includes(tag) ? 'block' : 'none';
            }
        });

        const toggle = wrapper.previousElementSibling;
        toggle.querySelector('span').textContent = tag;
    }

    // ========== 自定义分类 ==========
    function showAddTagModal(target) {
        state.addTagTarget = target;
        document.getElementById('shop-addtag-modal').classList.add('active');
        setTimeout(() => document.getElementById('shop-newtag-input').focus(), 100);
    }

    function closeAddTagModal() {
        document.getElementById('shop-addtag-modal').classList.remove('active');
    }

    function addCustomTag() {
        const input = document.getElementById('shop-newtag-input');
        const name = input.value.trim();
        if (!name) return;

        const targetId = state.addTagTarget === 'recommend' ? 'shop-recommend-subtags' : 'shop-food-subtags';
        const container = document.getElementById(targetId);
        const addBtn = container.querySelector('.sub-tag-add');

        const newTag = document.createElement('div');
        newTag.className = 'sub-tag';
        newTag.onclick = function() { filterSubTag(this); };
        newTag.textContent = name;
        container.insertBefore(newTag, addBtn);

        input.value = '';
        closeAddTagModal();
    }

    // ========== 许愿 ==========
    function showWishModal() {
        document.getElementById('shop-wish-modal').classList.add('active');
    }

    function closeWishModal() {
        document.getElementById('shop-wish-modal').classList.remove('active');
        // 重置编辑状态
        state._editingProductId = null;
        // 恢复弹窗标题和按钮
        const titleEl = document.querySelector('#shop-wish-modal .shop-modal-content > div');
        if (titleEl) titleEl.textContent = '✨ 许愿商品';
        const submitBtn = document.querySelector('#shop-wish-modal .buy-btn.dream');
        if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-magic"></i> 许愿上架';
        // 移除删除按钮
        const delBtn = document.getElementById('wish-delete-btn');
        if (delBtn) delBtn.remove();
    }

    function addWishSpec(specName, specOptions) {
        const container = document.getElementById('wish-specs');
        const div = document.createElement('div');
        const nameVal = specName || '';
        const opts = Array.isArray(specOptions) ? specOptions : [];
        const optInputs = opts.length > 0
            ? opts.map(o => `<input type="text" class="spec-input wish-spec-opt" placeholder="选项" value="${o}">`).join('')
            : `<input type="text" class="spec-input wish-spec-opt" placeholder="选项1">
               <input type="text" class="spec-input wish-spec-opt" placeholder="选项2">
               <input type="text" class="spec-input wish-spec-opt" placeholder="选项3">`;
        div.innerHTML = `
            <div class="spec-input-row">
                <input type="text" class="spec-input wish-spec-name" placeholder="规格名称" value="${nameVal}">
            </div>
            <div class="spec-input-row">
                ${optInputs}
            </div>
        `;
        container.appendChild(div);
    }

    // 许愿图片上传处理
    let wishImgData = null;
    function handleWishImgUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            alert('图片大小不能超过2MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            wishImgData = e.target.result;
            const preview = document.getElementById('wish-img-preview');
            preview.innerHTML = `<img src="${wishImgData}">`;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    async function submitWish() {
        try {
            const nameEl = document.getElementById('wish-name');
            const priceEl = document.getElementById('wish-price');
            const categoryEl = document.getElementById('wish-category');
            const tagsEl = document.getElementById('wish-tags');
            const iconEl = document.getElementById('wish-icon');
            const descEl = document.getElementById('wish-desc');

            if (!nameEl || !priceEl || !categoryEl) {
                alert('页面元素加载异常，请刷新重试');
                return;
            }

            const name = nameEl.value.trim();
            const price = parseFloat(priceEl.value) || 0;
            const category = categoryEl.value;
            const tags = tagsEl ? tagsEl.value.trim() : '';
            const icon = iconEl ? iconEl.value.trim() || '📦' : '📦';
            const desc = descEl ? descEl.value.trim() : '';

            if (!name) { alert('请输入商品名称'); return; }
            if (price <= 0) { alert('请输入有效价格'); return; }

            // 收集规格
            const specs = [];
            const specDivs = document.querySelectorAll('#wish-specs > div');
            specDivs.forEach(div => {
                const nameInput = div.querySelector('.wish-spec-name');
                const optInputs = div.querySelectorAll('.wish-spec-opt');
                const specName = nameInput ? nameInput.value.trim() : '';
                const opts = Array.from(optInputs).map(i => i.value.trim()).filter(v => v);
                if (specName && opts.length > 0) {
                    specs.push({ name: specName, options: opts });
                }
            });

            const productId = state._editingProductId || ('p' + Date.now());
            const isEditing = !!state._editingProductId;
            const product = {
                id: productId,
                name: name,
                price: price,
                category: category,
                tags: tags,
                icon: icon,
                desc: desc,
                specs: specs
            };
            if (wishImgData) {
                product.img = wishImgData;
            }

            if (isEditing) {
                // 编辑模式：更新已有商品
                const idx = state.products.findIndex(p => p.id === productId);
                if (idx >= 0) {
                    state.products[idx] = product;
                }
            } else {
                // 新增模式
                state.products.push(product);
            }
            state._editingProductId = null;
            await saveData(); // 文本数据存 localStorage

            // 图片存 IndexedDB（异步）
            if (wishImgData) {
                await saveImgToIDB(productId, wishImgData);
            }

            // 重新渲染当前分类的商品
            renderProducts();

            // 清空表单
            nameEl.value = '';
            priceEl.value = '';
            if (tagsEl) tagsEl.value = '';
            if (iconEl) iconEl.value = '';
            if (descEl) descEl.value = '';
            document.getElementById('wish-specs').innerHTML = '';
            wishImgData = null;
            const preview = document.getElementById('wish-img-preview');
            if (preview) {
                preview.innerHTML = '';
                preview.style.display = 'none';
            }

            closeWishModal();
            alert(isEditing ? '修改已保存' : '许愿成功！商品已上架');
        } catch (err) {
            console.error('[Shop] submitWish error:', err);
            alert('上架失败: ' + err.message);
        }
    }

    // ========== 余额 ==========
    function showBalanceModal() {
        document.getElementById('shop-balance-display').textContent = `¥${state.balance.toFixed(2)}`;
        document.getElementById('shop-balance-modal').classList.add('active');
    }

    function closeBalanceModal() {
        document.getElementById('shop-balance-modal').classList.remove('active');
    }

    async function saveBalance() {
        const val = parseFloat(document.getElementById('shop-balance-input').value);
        if (isNaN(val) || val < 0) { alert('请输入有效金额'); return; }
        state.balance = val;
        await saveData();
        updateBalanceDisplay();
        closeBalanceModal();
    }

    function updateBalanceDisplay() {
        const el = document.getElementById('shop-balance-display');
        if (el) el.textContent = `余额: ¥${state.balance.toFixed(2)}`;
    }

    // ========== 礼物柜（供TA的手机调用） ==========
    function getGiftCabinet() {
        return state.giftCabinet;
    }

    // ========== 工具函数 ==========
    function formatTime(timestamp) {
        const d = new Date(timestamp);
        const M = String(d.getMonth() + 1).padStart(2, '0');
        const D = String(d.getDate()).padStart(2, '0');
        const h = String(d.getHours()).padStart(2, '0');
        const m = String(d.getMinutes()).padStart(2, '0');
        return `${M}-${D} ${h}:${m}`;
    }

    // ========== 初始化 ==========
    async function init() {
        await loadData();
        renderProducts();
        renderSearchHistory();

        // 点击页面关闭搜索下拉
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.search-wrapper')) {
                const dropdown = document.getElementById('shop-search-dropdown');
                if (dropdown) dropdown.classList.remove('active');
            }
        });

        // 启动自动购物车购买定时器（整个会话期间随机触发，30%概率）
        startAutoBuyTimer();
    }

    // ========== 暴露到全局 ==========
    window.ShopApp = {
        init,
        showShop,
        hideShop,
        switchNav,
        switchTab,
        showProductDetail,
        closeProductModal,
        changeQty,
        addToCart,
        toggleCartItem,
        changeCartQty,
        toggleSelectAll,
        checkout,
        buy,
        showBookingModal,
        closeBookingModal,
        selectBooking,
        bookingBuy,
        filterOrder,
        rebuy,
        showReplyModal,
        closeReplyModal,
        onSearchInput,
        showSearchDropdown,
        quickSearch,
        clearSearch,
        clearSearchHistory,
        toggleSubTags,
        filterSubTag,
        showAddTagModal,
        closeAddTagModal,
        addCustomTag,
        showWishModal,
        closeWishModal,
        addWishSpec,
        submitWish,
        showBalanceModal,
        closeBalanceModal,
        saveBalance,
        getGiftCabinet,
        handleWishImgUpload,
        addToCartFromModal,
        deleteSelected,
        shareProduct,
        askTAPay,
        cancelOrder,
        startAutoBuyTimer,
        stopAutoBuyTimer,
        _getState: () => state,
        _saveData: saveData
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
