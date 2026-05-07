'use strict';

const Joi = require('joi');
const { ProductStatus, UnitType } = require('../../../domain/entities/Product');

const unitSchema = Joi.object({
  id: Joi.number().integer().optional(),
  name: Joi.string().max(120).optional(),
  nameEn: Joi.string().max(120).optional(),
  name_en: Joi.string().max(120).optional(),
  nameAr: Joi.string().max(120).optional(),
  name_ar: Joi.string().max(120).optional(),
}).unknown(true);

const productSchema = Joi.object({
  id: Joi.number().integer().optional(),
  externalId: Joi.number().integer().optional(),
  email: Joi.string().email().optional(), // optional per-product email override

  name: Joi.string().max(255).optional(),
  nameEn: Joi.string().max(255).optional(),
  name_en: Joi.string().max(255).optional(),
  nameAr: Joi.string().max(255).optional(),
  name_ar: Joi.string().max(255).optional(),

  barcode: Joi.string().max(64).allow(null, '').optional(),
  notes: Joi.string().allow(null, '').optional(),
  notesEn: Joi.string().allow(null, '').optional(),
  notes_en: Joi.string().allow(null, '').optional(),
  notesAr: Joi.string().allow(null, '').optional(),
  notes_ar: Joi.string().allow(null, '').optional(),

  date: Joi.alternatives(Joi.date().iso(), Joi.string().allow(null, '')).optional(),
  createdAt: Joi.alternatives(Joi.date().iso(), Joi.string().allow(null, '')).optional(),

  quantity: Joi.number().min(0).optional(),
  purchasePrice: Joi.number().min(0).optional(),
  purchase_price: Joi.number().min(0).optional(),
  salePrice: Joi.number().min(0).optional(),
  sale_price: Joi.number().min(0).optional(),
  wholeSalePrice: Joi.number().min(0).optional(),
  whole_sale_price: Joi.number().min(0).optional(),
  averagePrice: Joi.number().min(0).optional(),
  average_price: Joi.number().min(0).optional(),
  alertLow: Joi.number().integer().min(0).optional(),
  alert_low: Joi.number().integer().min(0).optional(),

  categoryId: Joi.number().integer().allow(null).optional(),
  category_id: Joi.number().integer().allow(null).optional(),
  categoryName: Joi.string().max(255).allow(null, '').optional(),
  category: Joi.object().unknown(true).optional(),

  imageUrl: Joi.string().allow(null, '').optional(),
  image_url: Joi.string().allow(null, '').optional(),

  unitType: Joi.string().valid(...Object.values(UnitType)).optional(),
  unit_type: Joi.string().valid(...Object.values(UnitType)).optional(),

  lowestUnit: unitSchema.optional(),
  averageUnit: unitSchema.optional(),
  largestUnit: unitSchema.optional(),

  averageUnitQuantity: Joi.number().min(0).allow(null).optional(),
  average_unit_quantity: Joi.number().min(0).allow(null).optional(),
  largestUnitQuantity: Joi.number().min(0).allow(null).optional(),
  largest_unit_quantity: Joi.number().min(0).allow(null).optional(),

  status: Joi.string().valid(...Object.values(ProductStatus)).optional(),
  metadata: Joi.any().optional(),
}).unknown(true);

const bulkSchema = Joi.array().items(productSchema).min(1).max(500);

const ingestBatchSchema = Joi.object({
  email: Joi.string().email().required(),
  products: Joi.array().items(productSchema).min(1).max(500).required(),
});

const listSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().max(255).optional(),
  status: Joi.string().valid(...Object.values(ProductStatus)).optional(),
  categoryId: Joi.number().integer().optional(),
  ownerId: Joi.number().integer().optional(),
  email: Joi.string().email().optional(),
  locale: Joi.string().valid('en', 'ar').optional(),
});

module.exports = { productSchema, bulkSchema, ingestBatchSchema, listSchema };
