'use strict';

const Joi = require('joi');

const createSchema = Joi.object({
  nameEn: Joi.string().max(255).optional(),
  name_en: Joi.string().max(255).optional(),
  nameAr: Joi.string().max(255).optional(),
  name_ar: Joi.string().max(255).optional(),
  email: Joi.string().email().allow(null, '').optional(),
  phone: Joi.string().max(64).allow(null, '').optional(),
  metadata: Joi.any().optional(),
}).or('nameEn', 'name_en').or('nameAr', 'name_ar');

const updateSchema = Joi.object({
  name_en: Joi.string().max(255).optional(),
  name_ar: Joi.string().max(255).optional(),
  email: Joi.string().email().allow(null, '').optional(),
  phone: Joi.string().max(64).allow(null, '').optional(),
  metadata: Joi.any().optional(),
}).min(1);

const listSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().max(255).optional(),
  locale: Joi.string().valid('en', 'ar').optional(),
});

module.exports = { createSchema, updateSchema, listSchema };
