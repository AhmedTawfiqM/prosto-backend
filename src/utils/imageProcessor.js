'use strict';

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const Logger = require('../core/Logger');

const PUBLIC_DIR = path.resolve(__dirname, '../../public');
const UPLOADS_ROOT = path.join(PUBLIC_DIR, 'uploads');
const MAX_DIMENSION = 2000;
const WEBP_QUALITY = 82;

/**
 * Strip a "data:image/...;base64," prefix and return the raw buffer,
 * or return null if the input doesn't look like base64 image data.
 */
function decodeBase64(input) {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  let b64 = trimmed;
  const m = trimmed.match(/^data:([\w/+\-.]+);base64,(.*)$/i);
  if (m) b64 = m[2];

  // Heuristic: too short to be a real image
  if (b64.length < 64) return null;

  try {
    const buf = Buffer.from(b64, 'base64');
    if (buf.length < 32) return null;
    return buf;
  } catch {
    return null;
  }
}

function isHttpUrl(s) {
  return typeof s === 'string' && /^https?:\/\//i.test(s);
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Convert an image (base64 string OR raw buffer) to WebP and write it under
 * /public/uploads/<subdir>/<basename>.webp.
 *
 * Returns the public URL path "/uploads/<subdir>/<basename>.webp", or null
 * if the input isn't a usable image.
 */
async function toWebp({ input, subdir, basename }) {
  let buffer;
  if (Buffer.isBuffer(input)) {
    buffer = input;
  } else {
    buffer = decodeBase64(input);
    if (!buffer) return null;
  }

  const dir = path.join(UPLOADS_ROOT, subdir);
  await ensureDir(dir);

  const safeBase = String(basename).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) || 'img';
  const hash = crypto.createHash('sha1').update(buffer).digest('hex').slice(0, 10);
  const filename = `${safeBase}-${hash}.webp`;
  const fullPath = path.join(dir, filename);

  try {
    await sharp(buffer)
      .rotate() // honour EXIF
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toFile(fullPath);
  } catch (err) {
    Logger.warn(`[imageProcessor] failed to convert image: ${err.message}`);
    return null;
  }

  return `/uploads/${subdir}/${filename}`;
}

/**
 * Normalize an `imageUrl`-shaped field coming from the mobile payload.
 *  - If it's already an http(s) URL, return as-is.
 *  - If it's base64 (with or without data: prefix), convert to WebP and
 *    return the new public path.
 *  - Anything else => null.
 */
async function normalizeIncomingImage({ value, subdir, basename }) {
  if (!value) return null;
  if (isHttpUrl(value)) return value;
  return toWebp({ input: value, subdir, basename });
}

module.exports = {
  PUBLIC_DIR,
  UPLOADS_ROOT,
  toWebp,
  normalizeIncomingImage,
  isHttpUrl,
  decodeBase64,
};
