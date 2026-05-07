'use strict';

const { Op } = require('sequelize');
const ICustomerRepository = require('../../domain/repositories/ICustomerRepository');
const Customer = require('../../domain/entities/Customer');
const { CustomerModel } = require('../database/models');

function toEntity(row) {
  if (!row) return null;
  const d = row.toJSON ? row.toJSON() : row;
  return new Customer({
    id: d.id,
    nameEn: d.name_en,
    nameAr: d.name_ar,
    email: d.email,
    phone: d.phone,
    metadata: d.metadata,
    createdAt: d.createdAt || d.created_at,
    updatedAt: d.updatedAt || d.updated_at,
  });
}

class SequelizeCustomerRepository extends ICustomerRepository {
  async create({ nameEn, nameAr, email, phone, metadata }) {
    const row = await CustomerModel.create({
      name_en: nameEn, name_ar: nameAr, email, phone, metadata,
    });
    return toEntity(row);
  }

  async findById(id) {
    return toEntity(await CustomerModel.findByPk(id));
  }

  async findByEmail(email) {
    if (!email) return null;
    return toEntity(await CustomerModel.findOne({ where: { email } }));
  }

  async findByPhone(phone) {
    if (!phone) return null;
    return toEntity(await CustomerModel.findOne({ where: { phone } }));
  }

  async findOrCreate({ nameEn, nameAr, email, phone, metadata }) {
    if (email) {
      const byEmail = await this.findByEmail(email);
      if (byEmail) return byEmail;
    }
    if (phone) {
      const byPhone = await this.findByPhone(phone);
      if (byPhone) return byPhone;
    }
    return this.create({ nameEn, nameAr, email, phone, metadata });
  }

  async list({ page = 1, pageSize = 20, search, locale = 'en' } = {}) {
    const where = {};
    if (search) {
      const nameField = locale === 'ar' ? 'name_ar' : 'name_en';
      where[Op.or] = [
        { [nameField]: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }
    const offset = (page - 1) * pageSize;
    const { rows, count } = await CustomerModel.findAndCountAll({
      where, order: [['id', 'DESC']], limit: pageSize, offset,
    });
    return {
      data: rows.map(toEntity),
      pagination: { page, pageSize, total: count, totalPages: Math.ceil(count / pageSize) },
    };
  }

  async update(id, patch) {
    const row = await CustomerModel.findByPk(id);
    if (!row) return null;
    await row.update(patch);
    return toEntity(row);
  }
}

module.exports = SequelizeCustomerRepository;
