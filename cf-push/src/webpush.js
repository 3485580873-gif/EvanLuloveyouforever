// Web Push 协议的核心实现：VAPID JWT 签名 + RFC 8291 (aes128gcm) 消息体加密。
// 全部用 Cloudflare Workers 自带的 Web Crypto API 实现，不依赖 Node 专属的 `web-push` 包。

function toBase64Url(buf) {
  const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const bin = atob(str);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function concatBytes(...arrs) {
  const total = arrs.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const a of arrs) { out.set(a, off); off += a.length; }
  return out;
}

// ---------- VAPID JWT ----------
// header/payload 按 JOSE 规范 base64url 编码，ES256 签名用 Web Crypto 的 ECDSA(P-256, SHA-256)，
// Web Crypto 对 "ECDSA" 算法输出的签名本来就是 JOSE 要求的 raw r||s 格式，不用额外转换。
export async function buildVapidHeader(endpoint, subject, privateKeyJwk) {
  const url = new URL(endpoint);
  const aud = `${url.protocol}//${url.host}`;

  const privateKey = await crypto.subtle.importKey(
    'jwk', privateKeyJwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['sign']
  );

  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { aud, exp: now + 12 * 60 * 60, sub: subject };

  const encHeader = toBase64Url(new TextEncoder().encode(JSON.stringify(header)));
  const encPayload = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signingInput = `${encHeader}.${encPayload}`;

  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(signingInput)
  );

  const jwt = `${signingInput}.${toBase64Url(sig)}`;

  // 从 jwk 的 x/y 还原出未压缩点格式的公钥（0x04 || x || y），VAPID 头需要它
  const x = fromBase64Url(privateKeyJwk.x);
  const y = fromBase64Url(privateKeyJwk.y);
  const rawPublicKey = concatBytes(new Uint8Array([0x04]), x, y);

  return `vapid t=${jwt}, k=${toBase64Url(rawPublicKey)}`;
}

// ---------- RFC 8291 aes128gcm 消息体加密 ----------
async function hkdf(salt, ikm, info, length) {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info },
    key,
    length * 8
  );
  return new Uint8Array(bits);
}

export async function encryptPayload(payloadText, p256dhB64, authB64) {
  const uaPublicRaw = fromBase64Url(p256dhB64); // 订阅者的公钥，65字节未压缩点
  const authSecret = fromBase64Url(authB64);    // 16字节

  // 1. 生成一次性 ECDH 密钥对（本次推送专用）
  const asKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']
  );
  const asPublicRaw = new Uint8Array(await crypto.subtle.exportKey('raw', asKeyPair.publicKey));

  const uaPublicKey = await crypto.subtle.importKey(
    'raw', uaPublicRaw, { name: 'ECDH', namedCurve: 'P-256' }, false, []
  );
  const sharedSecretBits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: uaPublicKey }, asKeyPair.privateKey, 256
  );
  const ecdhSecret = new Uint8Array(sharedSecretBits);

  // 2. PRK = HKDF-Extract(salt=authSecret, ikm=ecdhSecret)，
  //    再展开出真正用于 RFC8188 的 IKM（这一步是 RFC8291 特有的，把 auth secret 混进去防止中间人）
  const keyInfo = concatBytes(
    new TextEncoder().encode('WebPush: info\0'),
    uaPublicRaw,
    asPublicRaw
  );
  const ikm = await hkdf(authSecret, ecdhSecret, keyInfo, 32);

  // 3. RFC8188 aes128gcm：用随机 salt 派生 CEK 和 nonce
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cekInfo = new TextEncoder().encode('Content-Encoding: aes128gcm\0');
  const nonceInfo = new TextEncoder().encode('Content-Encoding: nonce\0');
  const cekBytes = await hkdf(salt, ikm, cekInfo, 16);
  const nonce = await hkdf(salt, ikm, nonceInfo, 12);

  const cek = await crypto.subtle.importKey('raw', cekBytes, { name: 'AES-GCM' }, false, ['encrypt']);

  // 4. 明文末尾加 0x02 分隔符（单记录模式，不需要额外 padding）
  const plaintext = concatBytes(new TextEncoder().encode(payloadText), new Uint8Array([0x02]));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce, tagLength: 128 }, cek, plaintext)
  );

  // 5. 拼装 aes128gcm 消息头：salt(16) + record_size(4, big-endian) + keyid_len(1) + keyid(as公钥,65)
  const recordSize = new Uint8Array(4);
  new DataView(recordSize.buffer).setUint32(0, 4096, false);
  const header = concatBytes(
    salt,
    recordSize,
    new Uint8Array([asPublicRaw.length]),
    asPublicRaw
  );

  return concatBytes(header, ciphertext);
}

export async function sendWebPush(subscription, payloadObj, env) {
  const privateKeyJwk = JSON.parse(env.VAPID_PRIVATE_KEY_JWK);
  const auth = await buildVapidHeader(subscription.endpoint, env.VAPID_SUBJECT, privateKeyJwk);
  const body = await encryptPayload(JSON.stringify(payloadObj), subscription.p256dh, subscription.auth);

  const resp = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      Authorization: auth,
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      TTL: '86400'
    },
    body
  });
  return resp;
}
