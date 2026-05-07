'use strict';

/* eslint-disable no-unused-vars */
class IProductRepository {
  async upsertFromMobile(payload, opts) { throw new Error('not implemented'); }
  async bulkUpsertFromMobile(payloads, opts) { throw new Error('not implemented'); }
  async findById(id) { throw new Error('not implemented'); }
  async findByExternalId(externalId, opts) { throw new Error('not implemented'); }
  async findByBarcode(barcode, opts) { throw new Error('not implemented'); }
  async list({ page, pageSize, search, status, categoryId, ownerId, locale }) { throw new Error('not implemented'); }
  async delete(id) { throw new Error('not implemented'); }
}

module.exports = IProductRepository;
