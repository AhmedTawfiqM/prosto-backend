'use strict';

const AppError = require('../../core/AppError');

class CustomerService {
  constructor({ customerRepository }) {
    this.repo = customerRepository;
  }

  async create(payload) {
    const nameEn = payload.nameEn ?? payload.name_en;
    const nameAr = payload.nameAr ?? payload.name_ar;
    if (!nameEn || !nameAr) throw AppError.badRequest('nameEn and nameAr are required');
    return this.repo.findOrCreate({
      nameEn,
      nameAr,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      metadata: payload.metadata ?? null,
    });
  }

  async getById(id) {
    const c = await this.repo.findById(id);
    if (!c) throw AppError.notFound('Customer not found');
    return c;
  }

  async list(params) { return this.repo.list(params); }

  async update(id, patch) {
    const updated = await this.repo.update(id, patch);
    if (!updated) throw AppError.notFound('Customer not found');
    return updated;
  }
}

module.exports = CustomerService;
