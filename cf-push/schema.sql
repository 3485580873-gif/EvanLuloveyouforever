CREATE TABLE IF NOT EXISTS push_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS pending_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag TEXT UNIQUE NOT NULL,      -- 幂等标识，比如 "envelope_reply_env_1234"，重复调度会覆盖而不是重复插入
  fire_at INTEGER NOT NULL,      -- 触发时间，unix 毫秒
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT,                      -- 点击通知后要打开的页面，默认站点根路径
  sent INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pending_due ON pending_notifications (sent, fire_at);
