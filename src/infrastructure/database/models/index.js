'use strict';

const sequelize = require('../sequelize');
const CustomerModel = require('./CustomerModel');
const CategoryModel = require('./CategoryModel');
const ProductUnitModel = require('./ProductUnitModel');
const ProductModel = require('./ProductModel');
const InvoiceModel = require('./InvoiceModel');
const InvoiceItemModel = require('./InvoiceItemModel');

module.exports = {
  sequelize,
  CustomerModel,
  CategoryModel,
  ProductUnitModel,
  ProductModel,
  InvoiceModel,
  InvoiceItemModel,
};
