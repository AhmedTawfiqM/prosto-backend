'use strict';

const AppError = require('../../core/AppError');

class ProductService {
  constructor({ productRepository, customerRepository }) {
    this.repo = productRepository;
    this.customers = customerRepository;
  }

  async resolveOwnerByEmail(email, fallback = {}) {
    if (!email) return null;
    const trimmed = String(email).trim().toLowerCase();
    if (!trimmed) return null;
    const existing = await this.customers.findByEmail(trimmed);
    if (existing) return existing;
    // Auto-create a minimal customer so we never silently drop the email.
    return this.customers.create({
      nameEn: fallback.nameEn ?? trimmed,
      nameAr: fallback.nameAr ?? trimmed,
      email: trimmed,
      phone: fallback.phone ?? null,
      metadata: { source: 'mobile-ingest' },
    });
  }

  /**
   * NEW BULK SHAPE from mobile:
   *   { email: "...", products: [ {...}, {...} ] }
   *
   * `email` identifies the owner customer (find-or-create).
   * Each product is upserted scoped to that owner.
   */
  async ingestBatch({ email, products }) {
    if (!Array.isArray(products) || products.length === 0) {
      throw AppError.badRequest('products[] is required and must be non-empty');
    }
    if (!email) {
      throw AppError.badRequest('email is required');
    }
    const owner = await this.resolveOwnerByEmail(email);
    const stored = await this.repo.bulkUpsertFromMobile(products, { ownerId: owner.id });
    return { owner, products: stored };
  }

  // --- Backward-compatible single-product endpoints ---

  async ingestOne(payload) {
    if (!payload || typeof payload !== 'object') throw AppError.badRequest('Invalid product payload');
    let ownerId = null;
    if (payload.email) {
      const owner = await this.resolveOwnerByEmail(payload.email);
      ownerId = owner?.id ?? null;
    }
    return this.repo.upsertFromMobile(payload, { ownerId });
  }

  async ingestMany(payloads) {
    if (!Array.isArray(payloads)) throw AppError.badRequest('Expected an array of products');
    return this.repo.bulkUpsertFromMobile(payloads);
  }

  async getById(id) {
    const p = await this.repo.findById(id);
    if (!p) throw AppError.notFound('Product not found');
    return p;
  }

  async getByBarcode(barcode, opts) {
    const p = await this.repo.findByBarcode(barcode, opts);
    if (!p) throw AppError.notFound('Product not found');
    return p;
  }

  async list(params) { return this.repo.list(params); }

  async listByOwnerEmail(email, params) {
    const owner = await this.customers.findByEmail(email);
    if (!owner) throw AppError.notFound('Customer not found');
    return this.repo.list({ ...params, ownerId: owner.id });
  }

  async delete(id) {
    const ok = await this.repo.delete(id);
    if (!ok) throw AppError.notFound('Product not found');
    return true;
  }
}

module.exports = ProductService;
