'use strict';

const { Op } = require('sequelize');
const IProductRepository = require('../../domain/repositories/IProductRepository');
const Product = require('../../domain/entities/Product');
const Category = require('../../domain/entities/Category');
const ProductUnit = require('../../domain/entities/ProductUnit');
const Customer = require('../../domain/entities/Customer');
const {
  sequelize, ProductModel, CategoryModel, ProductUnitModel, CustomerModel,
} = require('../database/models');
const { normalizeIncomingImage } = require('../../utils/imageProcessor');

function unitToEntity(u) {
  if (!u) return null;
  return new ProductUnit({
    id: u.id, externalId: u.external_id, nameEn: u.name_en, nameAr: u.name_ar,
  });
}
function categoryToEntity(c) {
  if (!c) return null;
  return new Category({
    id: c.id, externalId: c.external_id, nameEn: c.name_en, nameAr: c.name_ar,
    createdAt: c.createdAt || c.created_at, updatedAt: c.updatedAt || c.updated_at,
  });
}
function ownerToEntity(o) {
  if (!o) return null;
  return new Customer({
    id: o.id, nameEn: o.name_en, nameAr: o.name_ar,
    email: o.email, phone: o.phone, metadata: o.metadata,
    createdAt: o.createdAt || o.created_at, updatedAt: o.updatedAt || o.updated_at,
  });
}
function toEntity(row) {
  if (!row) return null;
  const d = row.toJSON ? row.toJSON() : row;
  return new Product({
    id: d.id,
    ownerId: d.owner_id,
    owner: ownerToEntity(d.owner),
    externalId: d.external_id,
    nameEn: d.name_en,
    nameAr: d.name_ar,
    barcode: d.barcode,
    notesEn: d.notes_en,
    notesAr: d.notes_ar,
    date: d.date,
    quantity: d.quantity,
    purchasePrice: d.purchase_price,
    salePrice: d.sale_price,
    wholeSalePrice: d.whole_sale_price,
    averagePrice: d.average_price,
    alertLow: d.alert_low,
    categoryId: d.category_id,
    category: categoryToEntity(d.category),
    imageUrl: d.image_url,
    unitType: d.unit_type,
    lowestUnitId: d.lowest_unit_id,
    averageUnitId: d.average_unit_id,
    largestUnitId: d.largest_unit_id,
    lowestUnit: unitToEntity(d.lowestUnit),
    averageUnit: unitToEntity(d.averageUnit),
    largestUnit: unitToEntity(d.largestUnit),
    averageUnitQuantity: d.average_unit_quantity,
    largestUnitQuantity: d.largest_unit_quantity,
    status: d.status,
    metadata: d.metadata,
    createdAt: d.createdAt || d.created_at,
    updatedAt: d.updatedAt || d.updated_at,
  });
}

const includes = [
  { model: CategoryModel, as: 'category' },
  { model: ProductUnitModel, as: 'lowestUnit' },
  { model: ProductUnitModel, as: 'averageUnit' },
  { model: ProductUnitModel, as: 'largestUnit' },
  { model: CustomerModel, as: 'owner' },
];

async function upsertCategory(t, raw) {
  if (!raw) return null;
  const externalId = raw.id ?? null;
  const nameEn = raw.nameEn ?? raw.name_en ?? raw.name ?? null;
  const nameAr = raw.nameAr ?? raw.name_ar ?? raw.name ?? null;
  if (!nameEn && externalId == null) return null;
  if (externalId != null) {
    const existing = await CategoryModel.findOne({ where: { external_id: externalId }, transaction: t });
    if (existing) {
      if (nameEn || nameAr) {
        await existing.update({
          name_en: nameEn ?? existing.name_en,
          name_ar: nameAr ?? existing.name_ar,
        }, { transaction: t });
      }
      return existing;
    }
  }
  return CategoryModel.create({
    external_id: externalId,
    name_en: nameEn ?? 'Unnamed',
    name_ar: nameAr ?? nameEn ?? 'بدون اسم',
  }, { transaction: t });
}

async function upsertUnit(t, raw) {
  if (!raw) return null;
  const externalId = raw.id ?? null;
  const nameEn = raw.nameEn ?? raw.name_en ?? raw.name ?? null;
  const nameAr = raw.nameAr ?? raw.name_ar ?? raw.name ?? null;
  if (!nameEn && externalId == null) return null;
  if (externalId != null) {
    const existing = await ProductUnitModel.findOne({ where: { external_id: externalId }, transaction: t });
    if (existing) {
      if (nameEn || nameAr) {
        await existing.update({
          name_en: nameEn ?? existing.name_en,
          name_ar: nameAr ?? existing.name_ar,
        }, { transaction: t });
      }
      return existing;
    }
  }
  return ProductUnitModel.create({
    external_id: externalId,
    name_en: nameEn ?? 'Unit',
    name_ar: nameAr ?? nameEn ?? 'وحدة',
  }, { transaction: t });
}

class SequelizeProductRepository extends IProductRepository {
  /**
   * Idempotent owner-scoped upsert. Match priority within an owner:
   *   1. external_id (mobile id)
   *   2. barcode
   *
   * Image: accepts http(s) URL OR base64. Base64 → WebP under
   * /uploads/products/ ; image_url is stored as a relative path.
   */
  async upsertFromMobile(payload, { ownerId } = {}) {
    return sequelize.transaction(async (t) => {
      const externalId = payload.id ?? payload.externalId ?? null;
      const barcode = payload.barcode ?? null;
      const name = payload.name ?? null;
      const nameEn = payload.nameEn ?? payload.name_en ?? name ?? '';
      const nameAr = payload.nameAr ?? payload.name_ar ?? name ?? '';
      const notes = payload.notes ?? null;

      const categoryRaw = payload.category
        ?? (payload.categoryId != null || payload.categoryName
          ? { id: payload.categoryId ?? null, name: payload.categoryName ?? null }
          : null);
      const category = await upsertCategory(t, categoryRaw);
      const lowestUnit = await upsertUnit(t, payload.lowestUnit);
      const averageUnit = await upsertUnit(t, payload.averageUnit);
      const largestUnit = await upsertUnit(t, payload.largestUnit);

      const incomingImage = payload.imageUrl ?? payload.image_url ?? null;
      const basename = barcode || (externalId != null ? `ext-${externalId}` : `prod-${Date.now()}`);
      const imageUrl = await normalizeIncomingImage({
        value: incomingImage, subdir: 'products', basename,
      });

      const data = {
        owner_id: ownerId ?? null,
        external_id: externalId,
        name_en: nameEn,
        name_ar: nameAr,
        barcode,
        notes_en: payload.notesEn ?? payload.notes_en ?? notes,
        notes_ar: payload.notesAr ?? payload.notes_ar ?? notes,
        date: payload.date ?? null,
        quantity: Number(payload.quantity ?? 0),
        purchase_price: Number(payload.purchasePrice ?? payload.purchase_price ?? 0),
        sale_price: Number(payload.salePrice ?? payload.sale_price ?? 0),
        whole_sale_price: Number(payload.wholeSalePrice ?? payload.whole_sale_price ?? 0),
        average_price: Number(payload.averagePrice ?? payload.average_price ?? 0),
        alert_low: Number(payload.alertLow ?? payload.alert_low ?? 0),
        category_id: category ? category.id : null,
        image_url: imageUrl,
        unit_type: payload.unitType ?? payload.unit_type ?? 'single',
        lowest_unit_id: lowestUnit ? lowestUnit.id : null,
        average_unit_id: averageUnit ? averageUnit.id : null,
        largest_unit_id: largestUnit ? largestUnit.id : null,
        average_unit_quantity: payload.averageUnitQuantity ?? payload.average_unit_quantity ?? null,
        largest_unit_quantity: payload.largestUnitQuantity ?? payload.largest_unit_quantity ?? null,
        status: payload.status ?? 'active',
        metadata: payload.metadata ?? null,
      };

      const ownerWhere = ownerId != null ? { owner_id: ownerId } : { owner_id: { [Op.is]: null } };

      let row = null;
      if (externalId != null) {
        row = await ProductModel.findOne({
          where: { ...ownerWhere, external_id: externalId },
          transaction: t,
        });
      }
      if (!row && barcode) {
        row = await ProductModel.findOne({
          where: { ...ownerWhere, barcode },
          transaction: t,
        });
      }

      if (row) {
        // If we couldn't decode the new image but had an old one, keep the old
        if (!data.image_url && row.image_url) data.image_url = row.image_url;
        await row.update(data, { transaction: t });
      } else {
        row = await ProductModel.create(data, { transaction: t });
      }

      const fresh = await ProductModel.findByPk(row.id, { include: includes, transaction: t });
      return toEntity(fresh);
    });
  }

  async bulkUpsertFromMobile(payloads, opts = {}) {
    const out = [];
    for (const p of payloads) out.push(await this.upsertFromMobile(p, opts));
    return out;
  }

  async findById(id) {
    return toEntity(await ProductModel.findByPk(id, { include: includes }));
  }

  async findByExternalId(externalId, { ownerId } = {}) {
    const where = { external_id: externalId };
    if (ownerId != null) where.owner_id = ownerId;
    return toEntity(await ProductModel.findOne({ where, include: includes }));
  }

  async findByBarcode(barcode, { ownerId } = {}) {
    const where = { barcode };
    if (ownerId != null) where.owner_id = ownerId;
    return toEntity(await ProductModel.findOne({ where, include: includes }));
  }

  async list({
    page = 1, pageSize = 20, search, status, categoryId, ownerId, locale = 'en',
  } = {}) {
    const where = {};
    if (status) where.status = status;
    if (categoryId) where.category_id = categoryId;
    if (ownerId != null) where.owner_id = ownerId;
    if (search) {
      const nameField = locale === 'ar' ? 'name_ar' : 'name_en';
      where[Op.or] = [
        { [nameField]: { [Op.like]: `%${search}%` } },
        { barcode: { [Op.like]: `%${search}%` } },
      ];
    }
    const offset = (page - 1) * pageSize;
    const { rows, count } = await ProductModel.findAndCountAll({
      where, include: includes, order: [['id', 'DESC']],
      limit: pageSize, offset, distinct: true,
    });
    return {
      data: rows.map(toEntity),
      pagination: { page, pageSize, total: count, totalPages: Math.ceil(count / pageSize) },
    };
  }

  async delete(id) {
    const n = await ProductModel.destroy({ where: { id } });
    return n > 0;
  }
}

module.exports = SequelizeProductRepository;
