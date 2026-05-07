'use strict';

/* eslint-disable no-unused-vars */
class IInvoiceRepository {
  async create(invoice) { throw new Error('not implemented'); }
  async findById(id) { throw new Error('not implemented'); }
  async findByNumber(invoiceNumber) { throw new Error('not implemented'); }
  async list({ page, pageSize, status, search, locale, customerId }) { throw new Error('not implemented'); }
  async listByCustomer(customerId, params) { throw new Error('not implemented'); }
  async update(id, patch) { throw new Error('not implemented'); }
  async delete(id) { throw new Error('not implemented'); }
  async deleteOlderThan(cutoffDate) { throw new Error('not implemented'); }
}

module.exports = IInvoiceRepository;
