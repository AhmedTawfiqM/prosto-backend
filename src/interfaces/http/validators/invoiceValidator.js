'use strict';

const Joi = require('joi');
const { InvoiceStatus } = require('../../../domain/entities/Invoice');

const itemSchema = Joi.object({
  productId: Joi.number().integer().positive().optional(),
  product_id: Joi.number().integer().positive().optional(),
  productExternalId: Joi.number().integer().positive().optional(),
  product_external_id: Joi.number().integer().positive().optional(),
  barcode: Joi.string().max(64).optional(),

  productNameEn: Joi.string().max(255).optional(),
  product_name_en: Joi.string().max(255).optional(),
  productNameAr: Joi.string().max(255).optional(),
  product_name_ar: Joi.string().max(255).optional(),

  unitId: Joi.number().integer().positive().optional(),
  unit_id: Joi.number().integer().positive().optional(),

  quantity: Joi.number().positive().required(),
  unitPrice: Joi.number().min(0).optional(),
  unit_price: Joi.number().min(0).optional(),
  price: Joi.number().min(0).optional(),
  taxRate: Joi.number().min(0).max(100).optional(),
  tax_rate: Joi.number().min(0).max(100).optional(),
}).or('productId', 'product_id', 'productExternalId', 'product_external_id', 'barcode',
       'productNameEn', 'product_name_en');

const inlineCustomerSchema = Joi.object({
  id: Joi.number().integer().positive().optional(),
  nameEn: Joi.string().max(255).optional(),
  name_en: Joi.string().max(255).optional(),
  nameAr: Joi.string().max(255).optional(),
  name_ar: Joi.string().max(255).optional(),
  email: Joi.string().email().allow(null, '').optional(),
  phone: Joi.string().max(64).allow(null, '').optional(),
  metadata: Joi.any().optional(),
});

const createSchema = Joi.object({
  invoiceNumber: Joi.string().max(64).optional(),
  invoice_number: Joi.string().max(64).optional(),

  customerId: Joi.number().integer().positive().optional(),
  customer_id: Joi.number().integer().positive().optional(),
  customer: inlineCustomerSchema.optional(),

  customerNameEn: Joi.string().max(255).optional(),
  customer_name_en: Joi.string().max(255).optional(),
  customerNameAr: Joi.string().max(255).optional(),
  customer_name_ar: Joi.string().max(255).optional(),
  customerEmail: Joi.string().email().allow(null, '').optional(),
  customer_email: Joi.string().email().allow(null, '').optional(),
  customerPhone: Joi.string().max(64).allow(null, '').optional(),
  customer_phone: Joi.string().max(64).allow(null, '').optional(),

  issueDate: Joi.date().iso().optional(),
  issue_date: Joi.date().iso().optional(),
  dueDate: Joi.date().iso().allow(null).optional(),
  due_date: Joi.date().iso().allow(null).optional(),

  currency: Joi.string().length(3).uppercase().default('EGP'),

  discountAmount: Joi.number().min(0).optional(),
  discount_amount: Joi.number().min(0).optional(),

  status: Joi.string().valid(...Object.values(InvoiceStatus)).optional(),

  notesEn: Joi.string().allow(null, '').optional(),
  notes_en: Joi.string().allow(null, '').optional(),
  notesAr: Joi.string().allow(null, '').optional(),
  notes_ar: Joi.string().allow(null, '').optional(),

  items: Joi.array().items(itemSchema).min(1).required(),
  metadata: Joi.any().optional(),
}).or('invoiceNumber', 'invoice_number');

const updateSchema = Joi.object({
  status: Joi.string().valid(...Object.values(InvoiceStatus)).optional(),
  notes_en: Joi.string().allow(null, '').optional(),
  notes_ar: Joi.string().allow(null, '').optional(),
  due_date: Joi.date().iso().allow(null).optional(),
  metadata: Joi.any().optional(),
}).min(1);

const listSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid(...Object.values(InvoiceStatus)).optional(),
  search: Joi.string().max(255).optional(),
  locale: Joi.string().valid('en', 'ar').optional(),
  customerId: Joi.number().integer().positive().optional(),
});

module.exports = { createSchema, updateSchema, listSchema };
