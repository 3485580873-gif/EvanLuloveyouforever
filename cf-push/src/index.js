import { sendWebPush } from './webpush.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-App-Secret'
  };
}

// 简单的共享密钥校验，防止别人拿着你的 Worker 地址乱调 API。
// 部署时用 `wrangler secret put APP_SECRET` 设置，前端 push-client.js 里配置同样的值。
function checkAuth(request, env) {
  if (!env.APP_SECRET) return true; // 没配置就不校验（本地调试方便，正式使用建议一定要配）
  return request.headers.get('X-App-Secret') === env.APP_SECRET;
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    const url = new URL(request.url);

    try {
      if (url.pathname === '/api/push/vapid-public-key' && request.method === 'GET') {
        return json({ publicKey: env.VAPID_PUBLIC_KEY });
      }

      if (url.pathname === '/api/push/subscribe' && request.method === 'POST') {
        if (!checkAuth(request, env)) return json({ error: 'unauthorized' }, 401);
        const { endpoint, keys } = await request.json();
        if (!endpoint || !keys?.p256dh || !keys?.auth) return json({ error: 'invalid subscription' }, 400);
        await env.DB.prepare(
          `INSERT INTO push_subscriptions (endpoint, p256dh, auth, created_at)
           VALUES (?1, ?2, ?3, ?4)
           ON CONFLICT(endpoint) DO UPDATE SET p256dh=excluded.p256dh, auth=excluded.auth`
        ).bind(endpoint, keys.p256dh, keys.auth, Date.now()).run();
        return json({ ok: true });
      }

      if (url.pathname === '/api/push/unsubscribe' && request.method === 'POST') {
        if (!checkAuth(request, env)) return json({ error: 'unauthorized' }, 401);
        const { endpoint } = await request.json();
        if (endpoint) {
          await env.DB.prepare(`DELETE FROM push_subscriptions WHERE endpoint = ?1`).bind(endpoint).run();
        }
        return json({ ok: true });
      }

      // 客户端算好"这件事该在什么时候提醒我"之后，调这个接口登记一下。
      // tag 相同会覆盖旧的（比如同一封信改了时间，或者已经在本地处理过想取消）。
      if (url.pathname === '/api/notify/schedule' && request.method === 'POST') {
        if (!checkAuth(request, env)) return json({ error: 'unauthorized' }, 401);
        const { tag, fireAt, title, body, url: linkUrl } = await request.json();
        if (!tag || !fireAt || !title || !body) return json({ error: 'missing fields' }, 400);
        await env.DB.prepare(
          `INSERT INTO pending_notifications (tag, fire_at, title, body, url, sent, created_at)
           VALUES (?1, ?2, ?3, ?4, ?5, 0, ?6)
           ON CONFLICT(tag) DO UPDATE SET fire_at=excluded.fire_at, title=excluded.title, body=excluded.body, url=excluded.url, sent=0`
        ).bind(tag, fireAt, title, body, linkUrl || '/', Date.now()).run();
        return json({ ok: true });
      }

      // 本地已经先处理过了（比如 App 一直开着，没等推送就自己弹出来了），取消掉避免重复通知
      if (url.pathname === '/api/notify/cancel' && request.method === 'POST') {
        if (!checkAuth(request, env)) return json({ error: 'unauthorized' }, 401);
        const { tag } = await request.json();
        if (tag) {
          await env.DB.prepare(`DELETE FROM pending_notifications WHERE tag = ?1`).bind(tag).run();
        }
        return json({ ok: true });
      }

      // 手动触发一次检查，方便部署后自测（正式跑靠下面的 cron）
      if (url.pathname === '/api/notify/run-now' && request.method === 'POST') {
        if (!checkAuth(request, env)) return json({ error: 'unauthorized' }, 401);
        const result = await deliverDueNotifications(env);
        return json(result);
      }

      return json({ error: 'not found' }, 404);
    } catch (err) {
      return json({ error: String(err && err.message || err) }, 500);
    }
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(deliverDueNotifications(env));
  }
};

async function deliverDueNotifications(env) {
  const now = Date.now();
  const due = await env.DB.prepare(
    `SELECT * FROM pending_notifications WHERE sent = 0 AND fire_at <= ?1 LIMIT 50`
  ).bind(now).all();

  if (!due.results || due.results.length === 0) return { sent: 0 };

  const subs = await env.DB.prepare(`SELECT * FROM push_subscriptions`).all();
  const subscriptions = subs.results || [];

  let sentCount = 0;
  for (const notif of due.results) {
    for (const sub of subscriptions) {
      try {
        const resp = await sendWebPush(sub, {
          title: notif.title,
          body: notif.body,
          url: notif.url || '/'
        }, env);

        // 410/404 说明这个订阅已经失效（用户卸载了/换设备了），顺手清掉
        if (resp.status === 404 || resp.status === 410) {
          await env.DB.prepare(`DELETE FROM push_subscriptions WHERE endpoint = ?1`).bind(sub.endpoint).run();
        }
      } catch (e) {
        // 单条订阅推送失败不影响其他订阅和其他通知
      }
    }
    await env.DB.prepare(`UPDATE pending_notifications SET sent = 1 WHERE id = ?1`).bind(notif.id).run();
    sentCount++;
  }
  return { sent: sentCount };
}
