// 本地验证 webpush.js 里的 aes128gcm 加密实现是否符合 RFC8291/8188，
// 模拟"浏览器订阅者"生成一对密钥，用我们的 encryptPayload 加密，
// 再按标准手工解密回来，看明文是否一致。
import { encryptPayload, buildVapidHeader } from '../src/webpush.js';

function toBase64Url(buf) {
  const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return Buffer.from(bin, 'binary').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromBase64Url(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return new Uint8Array(Buffer.from(str, 'base64'));
}

async function hkdf(salt, ikm, info, length) {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, length * 8);
  return new Uint8Array(bits);
}

// 1. 模拟浏览器端的订阅密钥对
const uaKeyPair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
const uaPublicRaw = new Uint8Array(await crypto.subtle.exportKey('raw', uaKeyPair.publicKey));
const authSecret = crypto.getRandomValues(new Uint8Array(16));

const p256dhB64 = toBase64Url(uaPublicRaw);
const authB64 = toBase64Url(authSecret);

// 2. 用我们的实现加密一段文本
const plaintext = '{"title":"来信提醒","body":"测试消息 123"}';
const encrypted = await encryptPayload(plaintext, p256dhB64, authB64);

// 3. 手工按标准解密回来
const salt = encrypted.slice(0, 16);
const rs = new DataView(encrypted.buffer, encrypted.byteOffset + 16, 4).getUint32(0, false);
const idlen = encrypted[20];
const asPublicRaw = encrypted.slice(21, 21 + idlen);
const ciphertext = encrypted.slice(21 + idlen);

const asPublicKey = await crypto.subtle.importKey('raw', asPublicRaw, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
const sharedBits = await crypto.subtle.deriveBits({ name: 'ECDH', public: asPublicKey }, uaKeyPair.privateKey, 256);
const ecdhSecret = new Uint8Array(sharedBits);

const keyInfo = new Uint8Array([
  ...new TextEncoder().encode('WebPush: info\0'),
  ...uaPublicRaw,
  ...asPublicRaw
]);
const ikm = await hkdf(authSecret, ecdhSecret, keyInfo, 32);

const cekInfo = new TextEncoder().encode('Content-Encoding: aes128gcm\0');
const nonceInfo = new TextEncoder().encode('Content-Encoding: nonce\0');
const cekBytes = await hkdf(salt, ikm, cekInfo, 16);
const nonce = await hkdf(salt, ikm, nonceInfo, 12);

const cek = await crypto.subtle.importKey('raw', cekBytes, { name: 'AES-GCM' }, false, ['decrypt']);
const decryptedPadded = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce, tagLength: 128 }, cek, ciphertext));

// 去掉末尾的 0x02 分隔符（单记录模式）
let end = decryptedPadded.length;
while (end > 0 && decryptedPadded[end - 1] === 0) end--;
if (decryptedPadded[end - 1] !== 0x02) throw new Error('分隔符不对，padding 处理有问题');
const decrypted = new TextDecoder().decode(decryptedPadded.slice(0, end - 1));

console.log('record size in header:', rs);
console.log('原文:', plaintext);
console.log('解密结果:', decrypted);
console.log(decrypted === plaintext ? '✅ 加解密往返一致' : '❌ 不一致，加密实现有问题');

// 4. 顺便测一下 VAPID JWT 能不能正常生成（不校验签名，只看格式和是否抛错）
const vapidKeyPair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const jwk = await crypto.subtle.exportKey('jwk', vapidKeyPair.privateKey);
const header = await buildVapidHeader('https://fcm.googleapis.com/fcm/send/abc123', 'mailto:test@example.com', jwk);
console.log('VAPID header:', header.slice(0, 60) + '...');
console.log(header.startsWith('vapid t=') && header.includes(', k=') ? '✅ VAPID header 格式正常' : '❌ VAPID header 格式不对');
