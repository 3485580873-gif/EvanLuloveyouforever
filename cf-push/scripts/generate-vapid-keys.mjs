// 生成 VAPID 密钥对。
// 用法：node scripts/generate-vapid-keys.mjs
// 输出的 PUBLIC_KEY 要填到 index.html 的 push-client.js 配置里，
// PRIVATE_KEY 要用 `wrangler secret put VAPID_PRIVATE_KEY` 存到 Worker，不要提交到代码仓库。

const { subtle } = globalThis.crypto;

function toBase64Url(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

const keyPair = await subtle.generateKey(
  { name: 'ECDSA', namedCurve: 'P-256' },
  true,
  ['sign', 'verify']
);

const rawPublic = await subtle.exportKey('raw', keyPair.publicKey);
const jwkPrivate = await subtle.exportKey('jwk', keyPair.privateKey);

// 私钥用 JWK 存（Worker 端用 importKey('jwk', ...) 读回来做签名，比裸 raw 更省事可靠）
const privateKeyJwkStr = JSON.stringify(jwkPrivate);

console.log('=== VAPID PUBLIC KEY (给前端 applicationServerKey / VAPID_PUBLIC_KEY) ===');
console.log(toBase64Url(rawPublic));
console.log('');
console.log('=== VAPID PRIVATE KEY JWK (给 Worker Secret: VAPID_PRIVATE_KEY_JWK) ===');
console.log(privateKeyJwkStr);
console.log('');
console.log('部署时执行：');
console.log('  wrangler secret put VAPID_PRIVATE_KEY_JWK   # 粘贴上面那行 JSON');
console.log('  wrangler secret put VAPID_SUBJECT           # 例如 mailto:you@example.com');
