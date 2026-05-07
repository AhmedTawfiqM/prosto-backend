'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const CategoryModel = sequelize.define('Category', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  external_id: { type: DataTypes.INTEGER, allowNull: true, unique: true },
  name_en: { type: DataTypes.STRING(255), allowNull: false },
  name_ar: { type: DataTypes.STRING(255), allowNull: false },
}, {
  tableName: 'categories',
  timestamps: true,
  indexes: [{ fields: ['external_id'], unique: true }, { fields: ['name_en'] }, { fields: ['name_ar'] }],
});

module.exports = CategoryModel;
