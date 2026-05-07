'use strict';

const { toWebp } = require('../../../utils/imageProcessor');
const AppError = require('../../../core/AppError');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function absolutize(req, p) {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;
  return `${req.protocol}://${req.get('host')}${p}`;
}

class BrandController {
  /**
   * POST /brand/logo  body: { image: "base64 or data:image/...;base64,..." , name?: "logo" }
   * Converts to WebP, stores under /uploads/brand/, returns the public URL.
   */
  uploadLogo = asyncHandler(async (req, res) => {
    const { image, name } = req.body || {};
    if (!image) throw AppError.badRequest('image (base64) is required');
    const path = await toWebp({
      input: image,
      subdir: 'brand',
      basename: name || 'logo',
    });
    if (!path) throw AppError.badRequest('Could not decode the image');
    res.status(201).json({ success: true, data: { imageUrl: absolutize(req, path), path } });
  });
}

module.exports = BrandController;
