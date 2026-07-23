# evan-push-backend

给「evan」这个网页应用做的最小可用推送后端，跑在 Cloudflare Workers 上，免费额度内够用。

作用：网页在生成/更新一件"未来会发生的事"（比如寄出一封信、10~24小时后会有回信）的时候，
顺手告诉这个后端"到点了在 xx 时间提醒我"；Worker 每分钟自己醒一次，检查有没有到点的，
到点了就通过系统推送把通知发到你手机上——哪怕你这时候根本没打开这个网页。

## 前置条件

- 一个 Cloudflare 账号（免费即可）
- 本地装 Node.js（生成 VAPID 密钥要用）
- 装 wrangler：`npm install -g wrangler`，然后 `wrangler login`

## 部署步骤

### 1. 生成 VAPID 密钥

```bash
node scripts/generate-vapid-keys.mjs
```

会输出一个 PUBLIC KEY 和一段 PRIVATE KEY 的 JSON，先都复制保存好，下面要用。

### 2. 建 D1 数据库

```bash
wrangler d1 create evan-push-db
```

命令执行完会打印一个 `database_id`，把它填进 `wrangler.toml` 里 `database_id = "..."` 那一行。

然后建表：

```bash
wrangler d1 execute evan-push-db --remote --file=./schema.sql
```

### 3. 填公钥、设私钥和密钥

把第 1 步生成的 PUBLIC KEY 填进 `wrangler.toml` 的 `VAPID_PUBLIC_KEY = "..."`。

然后设置几个 Secret（不会明文存进代码里）：

```bash
wrangler secret put VAPID_PRIVATE_KEY_JWK
# 粘贴第1步输出的那一整段 JSON，回车

wrangler secret put VAPID_SUBJECT
# 输入 mailto:你的邮箱，比如 mailto:me@example.com

wrangler secret put APP_SECRET
# 自己随便定一串字符串，比如用密码生成器生成一段，
# 这个要和前端 push-client.js 里配的 APP_SECRET 保持一致
```

### 4. 部署

```bash
wrangler deploy
```

部署完会给你一个形如 `https://evan-push-backend.你的用户名.workers.dev` 的地址，
这个就是要填进前端「设置 → 推送通知」里的后端地址。

### 5. 自测

浏览器订阅推送成功后，可以手动调一次立即检查（不用等 cron）：

```bash
curl -X POST https://你的地址/api/notify/run-now \
  -H "X-App-Secret: 你设的APP_SECRET"
```

## 接口说明

| 方法 | 路径 | 用途 |
|---|---|---|
| GET | `/api/push/vapid-public-key` | 前端订阅推送时要用的公钥 |
| POST | `/api/push/subscribe` | 前端把浏览器的推送订阅信息存过来 |
| POST | `/api/push/unsubscribe` | 取消订阅 |
| POST | `/api/notify/schedule` | 登记一条"未来某个时间点提醒我"的通知，`tag` 相同会覆盖 |
| POST | `/api/notify/cancel` | 按 `tag` 取消一条还没发出的通知 |
| POST | `/api/notify/run-now` | 手动触发一次"检查并发送到期通知"，方便自测 |

## 目前只接了"寄信收到回信"这一个场景

代码里已经把「寄一封信 → 10~24小时后可能收到回信」这个场景接好了（客户端算出 `replyTime` 后，
会顺手调 `/api/notify/schedule` 登记一条通知）。

「随机来电」「梦角主动来信」这两个功能因为触发时机本身是"每次开app时按概率判断"，不是固定的
到期时间，要接进来的话思路是：把这个概率判断挪到 Worker 的定时任务里做（每次 cron 触发时也
做一次概率判断），逻辑可以参考 `js/features/call.js` 里的 `scheduleRandomCall()` 和
`js/features/envelope.js` 里的 `checkPartnerInitiatedLetter()`，照着搬一份到 `src/index.js`
的 `scheduled()` 里就行。

## iOS 上要注意的前提条件

- 系统版本 iOS 16.4 及以上
- 网页必须先"添加到主屏幕"、用主屏幕图标打开（独立模式），Safari 标签页里收不到系统推送
- 添加到主屏幕后，进「设置」里点一下"开启推送通知"按钮，走一次系统授权弹窗
