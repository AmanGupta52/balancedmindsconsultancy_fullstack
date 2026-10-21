const crypto = require("crypto");

/**
 * ZEGOCLOUD "Token04" generator (server-side). Keeps the server secret out of
 * the browser bundle. Format: "04" + base64(expire | iv | AES-CBC payload | mode).
 * Based on ZEGO's open-source server assistant; mode 0 = AES-CBC.
 */
function generateToken04(appId, userId, secret, ttlSeconds = 3600, payload = "") {
  if (!appId || !secret) throw new Error("ZEGO credentials are not configured");
  if (![16, 24, 32].includes(Buffer.byteLength(secret))) {
    throw new Error("ZEGO_SERVER_SECRET must be 16, 24 or 32 characters long");
  }

  const now = Math.floor(Date.now() / 1000);
  const body = JSON.stringify({
    app_id: appId,
    user_id: userId,
    nonce: crypto.randomInt(1, 2 ** 31 - 1),
    ctime: now,
    expire: now + ttlSeconds,
    payload,
  });

  const algorithm = `aes-${Buffer.byteLength(secret) * 8}-cbc`;
  const iv = crypto.randomBytes(8).toString("hex"); // 16 ASCII characters
  const cipher = crypto.createCipheriv(algorithm, secret, iv);
  const encrypted = Buffer.concat([cipher.update(body, "utf8"), cipher.final()]);

  const expireBuf = Buffer.alloc(8);
  expireBuf.writeBigInt64BE(BigInt(now + ttlSeconds));
  const ivLen = Buffer.alloc(2);
  ivLen.writeUInt16BE(iv.length);
  const dataLen = Buffer.alloc(2);
  dataLen.writeUInt16BE(encrypted.length);
  const mode = Buffer.from([0]);

  return "04" + Buffer.concat([expireBuf, ivLen, Buffer.from(iv), dataLen, encrypted, mode]).toString("base64");
}

module.exports = { generateToken04 };
