'use strict';

/* eslint-disable no-unused-vars */
class ICustomerRepository {
  async create(customer) { throw new Error('not implemented'); }
  async findById(id) { throw new Error('not implemented'); }
  async findByEmail(email) { throw new Error('not implemented'); }
  async findByPhone(phone) { throw new Error('not implemented'); }
  async findOrCreate({ nameEn, nameAr, email, phone, metadata }) { throw new Error('not implemented'); }
  async list({ page, pageSize, search, locale }) { throw new Error('not implemented'); }
  async update(id, patch) { throw new Error('not implemented'); }
}

module.exports = ICustomerRepository;
