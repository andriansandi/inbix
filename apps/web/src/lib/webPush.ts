export interface PushSubscriptionInfo {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface VapidConfig {
  publicKey: string;
  privateKey: string;
  subject: string;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  timestamp: number;
}

export interface SendPushResult {
  status: number;
  ok: boolean;
  endpoint: string;
  error?: string;
}

export interface SendPushOptions {
  subscription: PushSubscriptionInfo;
  payload: PushPayload;
  vapid: VapidConfig;
  ttl?: number;
}

function base64urlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64urlEncodeBytes(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlEncodeString(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hkdfExtract(salt: Uint8Array, ikm: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    salt as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const prk = await crypto.subtle.sign("HMAC", key, ikm as BufferSource);
  return new Uint8Array(prk);
}

async function hkdfExpand(
  prk: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    prk as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const output = new Uint8Array(length);
  let t = new Uint8Array(0);
  let offset = 0;
  let counter = 1;

  while (offset < length) {
    const input = new Uint8Array(t.length + info.length + 1);
    input.set(t);
    input.set(info, t.length);
    input[t.length + info.length] = counter;

    const signed = await crypto.subtle.sign("HMAC", key, input as BufferSource);
    t = new Uint8Array(signed);
    const copyLen = Math.min(t.length, length - offset);
    output.set(t.subarray(0, copyLen), offset);
    offset += copyLen;
    counter++;
  }

  return output;
}

function derToRawSignature(der: ArrayBuffer): Uint8Array {
  const bytes = new Uint8Array(der);
  if (bytes[0] !== 0x30) throw new Error("Invalid DER: expected SEQUENCE");

  let offset = 2;

  if (bytes[offset] !== 0x02) throw new Error("Invalid DER: expected INTEGER for r");
  offset++;
  const rLen = bytes[offset];
  offset++;
  const r = bytes.subarray(offset, offset + rLen);
  offset += rLen;

  if (bytes[offset] !== 0x02) throw new Error("Invalid DER: expected INTEGER for s");
  offset++;
  const sLen = bytes[offset];
  offset++;
  const s = bytes.subarray(offset, offset + sLen);

  const raw = new Uint8Array(64);

  const rBytes = rLen === 33 ? r.subarray(1) : r;
  const sBytes = sLen === 33 ? s.subarray(1) : s;

  raw.set(rBytes, 32 - rBytes.length);
  raw.set(sBytes, 64 - sBytes.length);

  return raw;
}

async function createVapidJwt(
  endpoint: string,
  vapid: VapidConfig
): Promise<string> {
  const url = new URL(endpoint);
  const aud = `${url.protocol}//${url.host}`;
  const exp = Math.floor(Date.now() / 1000) + 12 * 60 * 60;

  const header = { alg: "ES256", typ: "JWT" };
  const payload = { aud, exp, sub: vapid.subject };

  const headerB64 = base64urlEncodeString(JSON.stringify(header));
  const payloadB64 = base64urlEncodeString(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;

  const keyBytes = base64urlDecode(vapid.privateKey);
  const key = await crypto.subtle.importKey(
    "pkcs8",
    keyBytes as BufferSource,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(signingInput) as BufferSource
  );

  const rawSig = derToRawSignature(signature);
  const sigB64 = base64urlEncodeBytes(rawSig);

  return `${signingInput}.${sigB64}`;
}

async function encryptPayload(
  payload: Uint8Array,
  p256dh: string,
  auth: string
): Promise<Uint8Array> {
  const ephemeralKeyPair = (await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  )) as CryptoKeyPair;

  const uaPublicKeyBytes = base64urlDecode(p256dh);
  const uaPublicKey = await crypto.subtle.importKey(
    "raw",
    uaPublicKeyBytes as BufferSource,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "ECDH", public: uaPublicKey } as unknown as { name: "ECDH"; public: CryptoKey },
      ephemeralKeyPair.privateKey,
      256
    )
  );

  const ephemeralPublicKey = new Uint8Array(
    (await crypto.subtle.exportKey("raw", ephemeralKeyPair.publicKey)) as ArrayBuffer
  );

  const authSecret = base64urlDecode(auth);

  const prk1 = await hkdfExtract(authSecret, sharedSecret);

  const webPushInfo = new TextEncoder().encode("WebPush: info\0");
  const keyInfo = new Uint8Array(
    webPushInfo.length + uaPublicKeyBytes.length + ephemeralPublicKey.length
  );
  keyInfo.set(webPushInfo, 0);
  keyInfo.set(uaPublicKeyBytes, webPushInfo.length);
  keyInfo.set(ephemeralPublicKey, webPushInfo.length + uaPublicKeyBytes.length);

  const ikm2 = await hkdfExpand(prk1, keyInfo, 32);

  const salt = crypto.getRandomValues(new Uint8Array(16));

  const prk2 = await hkdfExtract(salt, ikm2);

  const cekInfo = new TextEncoder().encode("Content-Encoding: aes128gcm\0");
  const cek = await hkdfExpand(prk2, cekInfo, 16);

  const nonceInfo = new TextEncoder().encode("Content-Encoding: nonce\0");
  const nonce = await hkdfExpand(prk2, nonceInfo, 12);

  const plaintext = new Uint8Array(payload.length + 1);
  plaintext.set(payload);
  plaintext[payload.length] = 0x02;

  const cekKey = await crypto.subtle.importKey(
    "raw",
    cek as BufferSource,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: nonce as BufferSource, tagLength: 128 },
      cekKey,
      plaintext as BufferSource
    )
  );

  const recordSize = 4096;
  const header = new Uint8Array(16 + 4 + ephemeralPublicKey.length);
  header.set(salt, 0);
  const rsView = new DataView(header.buffer, 16, 4);
  rsView.setUint32(0, recordSize, false);
  header.set(ephemeralPublicKey, 20);

  const output = new Uint8Array(header.length + encrypted.length);
  output.set(header, 0);
  output.set(encrypted, header.length);

  return output;
}

export async function sendWebPush(options: SendPushOptions): Promise<SendPushResult> {
  const { subscription, payload, vapid, ttl = 86400 } = options;

  try {
    const jwt = await createVapidJwt(subscription.endpoint, vapid);

    const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
    const encryptedBody = await encryptPayload(
      payloadBytes,
      subscription.p256dh,
      subscription.auth
    );

    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        Authorization: `vapid t=${jwt},k=${vapid.publicKey}`,
        "Content-Encoding": "aes128gcm",
        "Content-Type": "application/octet-stream",
        TTL: String(ttl),
      },
      body: encryptedBody as BufferSource,
    });

    return {
      status: response.status,
      ok: response.ok,
      endpoint: subscription.endpoint,
    };
  } catch (err) {
    return {
      status: 0,
      ok: false,
      endpoint: subscription.endpoint,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function generateVapidKeys(): Promise<{
  publicKey: string;
  privateKey: string;
}> {
  const keyPair = (await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  )) as CryptoKeyPair;

  const publicKeyBytes = new Uint8Array(
    (await crypto.subtle.exportKey("raw", keyPair.publicKey)) as ArrayBuffer
  );

  const privateKeyBytes = new Uint8Array(
    (await crypto.subtle.exportKey("pkcs8", keyPair.privateKey)) as ArrayBuffer
  );

  return {
    publicKey: base64urlEncodeBytes(publicKeyBytes),
    privateKey: base64urlEncodeBytes(privateKeyBytes),
  };
}
