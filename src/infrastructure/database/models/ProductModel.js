'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const CategoryModel = require('./CategoryModel');
const ProductUnitModel = require('./ProductUnitModel');
const CustomerModel = require('./CustomerModel');
const { ProductStatus, UnitType } = require('../../../domain/entities/Product');

const ProductModel = sequelize.define('Product', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  owner_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  external_id: { type: DataTypes.INTEGER, allowNull: true },

  name_en: { type: DataTypes.STRING(255), allowNull: false },
  name_ar: { type: DataTypes.STRING(255), allowNull: false },
  barcode: { type: DataTypes.STRING(64), allowNull: true },
  notes_en: { type: DataTypes.TEXT, allowNull: true },
  notes_ar: { type: DataTypes.TEXT, allowNull: true },
  date: { type: DataTypes.DATEONLY, allowNull: true },

  quantity: { type: DataTypes.DECIMAL(14, 3), allowNull: false, defaultValue: 0 },
  purchase_price: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
  sale_price: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
  whole_sale_price: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
  average_price: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
  alert_low: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

  category_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  image_url: { type: DataTypes.TEXT, allowNull: true },

  unit_type: {
    type: DataTypes.ENUM(...Object.values(UnitType)),
    allowNull: false,
    defaultValue: UnitType.SINGLE,
  },
  lowest_unit_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  average_unit_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  largest_unit_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  average_unit_quantity: { type: DataTypes.DECIMAL(14, 3), allowNull: true },
  largest_unit_quantity: { type: DataTypes.DECIMAL(14, 3), allowNull: true },

  status: {
    type: DataTypes.ENUM(...Object.values(ProductStatus)),
    allowNull: false,
    defaultValue: ProductStatus.ACTIVE,
  },
  metadata: { type: DataTypes.JSON, allowNull: true },
}, {
  tableName: 'products',
  timestamps: true,
  indexes: [
    { fields: ['owner_id'] },
    { fields: ['owner_id', 'external_id'], unique: true, name: 'products_owner_external_unique' },
    { fields: ['owner_id', 'barcode'], name: 'products_owner_barcode' },
    { fields: ['category_id'] },
    { fields: ['status'] },
    { fields: ['name_en'] },
    { fields: ['name_ar'] },
  ],
});

CategoryModel.hasMany(ProductModel, { as: 'products', foreignKey: 'category_id' });
ProductModel.belongsTo(CategoryModel, { as: 'category', foreignKey: 'category_id' });

CustomerModel.hasMany(ProductModel, { as: 'products', foreignKey: 'owner_id' });
ProductModel.belongsTo(CustomerModel, { as: 'owner', foreignKey: 'owner_id' });

ProductModel.belongsTo(ProductUnitModel, { as: 'lowestUnit', foreignKey: 'lowest_unit_id' });
ProductModel.belongsTo(ProductUnitModel, { as: 'averageUnit', foreignKey: 'average_unit_id' });
ProductModel.belongsTo(ProductUnitModel, { as: 'largestUnit', foreignKey: 'largest_unit_id' });

module.exports = ProductModel;
