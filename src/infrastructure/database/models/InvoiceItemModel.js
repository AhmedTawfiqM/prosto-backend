'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const InvoiceModel = require('./InvoiceModel');
const ProductModel = require('./ProductModel');
const ProductUnitModel = require('./ProductUnitModel');

const InvoiceItemModel = sequelize.define('InvoiceItem', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  invoice_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  product_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  unit_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },

  product_name_en: { type: DataTypes.STRING(255), allowNull: false },
  product_name_ar: { type: DataTypes.STRING(255), allowNull: false },
  barcode: { type: DataTypes.STRING(64), allowNull: true },

  quantity: { type: DataTypes.DECIMAL(14, 3), allowNull: false, defaultValue: 1 },
  unit_price: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
  tax_rate: { type: DataTypes.DECIMAL(6, 3), allowNull: false, defaultValue: 0 },
  line_total: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
}, {
  tableName: 'invoice_items',
  timestamps: true,
  indexes: [{ fields: ['invoice_id'] }, { fields: ['product_id'] }],
});

InvoiceModel.hasMany(InvoiceItemModel, {
  as: 'items',
  foreignKey: 'invoice_id',
  onDelete: 'CASCADE',
});
InvoiceItemModel.belongsTo(InvoiceModel, { as: 'invoice', foreignKey: 'invoice_id' });
InvoiceItemModel.belongsTo(ProductModel, { as: 'product', foreignKey: 'product_id' });
InvoiceItemModel.belongsTo(ProductUnitModel, { as: 'unit', foreignKey: 'unit_id' });

module.exports = InvoiceItemModel;
