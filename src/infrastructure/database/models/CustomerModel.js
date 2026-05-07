'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const CustomerModel = sequelize.define('Customer', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  name_en: { type: DataTypes.STRING(255), allowNull: false },
  name_ar: { type: DataTypes.STRING(255), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: true },
  phone: { type: DataTypes.STRING(64), allowNull: true },
  metadata: { type: DataTypes.JSON, allowNull: true },
}, {
  tableName: 'customers',
  timestamps: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['phone'] },
    { fields: ['name_en'] },
    { fields: ['name_ar'] },
  ],
});

module.exports = CustomerModel;
