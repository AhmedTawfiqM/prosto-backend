'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const CustomerModel = require('./CustomerModel');
const { InvoiceStatus } = require('../../../domain/entities/Invoice');

const InvoiceModel = sequelize.define('Invoice', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  invoice_number: { type: DataTypes.STRING(64), allowNull: false, unique: true },
  customer_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  issue_date: { type: DataTypes.DATEONLY, allowNull: false },
  due_date: { type: DataTypes.DATEONLY, allowNull: true },
  currency: { type: DataTypes.STRING(8), allowNull: false, defaultValue: 'EGP' },
  subtotal: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
  tax_amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
  discount_amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
  total_amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
  status: {
    type: DataTypes.ENUM(...Object.values(InvoiceStatus)),
    allowNull: false,
    defaultValue: InvoiceStatus.ISSUED,
  },
  notes_en: { type: DataTypes.TEXT, allowNull: true },
  notes_ar: { type: DataTypes.TEXT, allowNull: true },
  metadata: { type: DataTypes.JSON, allowNull: true },
}, {
  tableName: 'invoices',
  timestamps: true,
  indexes: [
    { fields: ['invoice_number'], unique: true },
    { fields: ['customer_id'] },
    { fields: ['status'] },
    { fields: ['issue_date'] },
  ],
});

CustomerModel.hasMany(InvoiceModel, { as: 'invoices', foreignKey: 'customer_id' });
InvoiceModel.belongsTo(CustomerModel, { as: 'customer', foreignKey: 'customer_id' });

module.exports = InvoiceModel;
