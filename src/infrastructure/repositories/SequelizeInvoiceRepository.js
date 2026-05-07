'use strict';

const { Op } = require('sequelize');
const IInvoiceRepository = require('../../domain/repositories/IInvoiceRepository');
const Invoice = require('../../domain/entities/Invoice');
const InvoiceItem = require('../../domain/entities/InvoiceItem');
const Customer = require('../../domain/entities/Customer');
const Product = require('../../domain/entities/Product');
const ProductUnit = require('../../domain/entities/ProductUnit');
const {
  sequelize, InvoiceModel, InvoiceItemModel, CustomerModel,
  ProductModel, ProductUnitModel,
} = require('../database/models');

function customerToEntity(c) {
  if (!c) return null;
  return new Customer({
    id: c.id, nameEn: c.name_en, nameAr: c.name_ar,
    email: c.email, phone: c.phone, metadata: c.metadata,
    createdAt: c.createdAt || c.created_at,
    updatedAt: c.updatedAt || c.updated_at,
  });
}

function productToEntity(p) {
  if (!p) return null;
  return new Product({
    id: p.id, externalId: p.external_id,
    nameEn: p.name_en, nameAr: p.name_ar,
    barcode: p.barcode, salePrice: p.sale_price, status: p.status,
  });
}

function unitToEntity(u) {
  if (!u) return null;
  return new ProductUnit({ id: u.id, externalId: u.external_id, nameEn: u.name_en, nameAr: u.name_ar });
}

function toEntity(row) {
  if (!row) return null;
  const data = row.toJSON ? row.toJSON() : row;
  return new Invoice({
    id: data.id,
    invoiceNumber: data.invoice_number,
    customerId: data.customer_id,
    customer: customerToEntity(data.customer),
    issueDate: data.issue_date,
    dueDate: data.due_date,
    currency: data.currency,
    subtotal: data.subtotal,
    taxAmount: data.tax_amount,
    discountAmount: data.discount_amount,
    totalAmount: data.total_amount,
    status: data.status,
    notesEn: data.notes_en,
    notesAr: data.notes_ar,
    metadata: data.metadata,
    items: (data.items || []).map(it => new InvoiceItem({
      id: it.id,
      invoiceId: it.invoice_id,
      productId: it.product_id,
      unitId: it.unit_id,
      productNameEn: it.product_name_en,
      productNameAr: it.product_name_ar,
      barcode: it.barcode,
      quantity: it.quantity,
      unitPrice: it.unit_price,
      taxRate: it.tax_rate,
      lineTotal: it.line_total,
      product: productToEntity(it.product),
      unit: unitToEntity(it.unit),
    })),
    createdAt: data.createdAt || data.created_at,
    updatedAt: data.updatedAt || data.updated_at,
  });
}

const itemIncludes = [
  { model: ProductModel, as: 'product' },
  { model: ProductUnitModel, as: 'unit' },
];
const fullIncludes = [
  { model: InvoiceItemModel, as: 'items', include: itemIncludes },
  { model: CustomerModel, as: 'customer' },
];

class SequelizeInvoiceRepository extends IInvoiceRepository {
  async create(invoice) {
    return sequelize.transaction(async (t) => {
      const row = await InvoiceModel.create({
        invoice_number: invoice.invoiceNumber,
        customer_id: invoice.customerId,
        issue_date: invoice.issueDate,
        due_date: invoice.dueDate,
        currency: invoice.currency,
        subtotal: invoice.subtotal,
        tax_amount: invoice.taxAmount,
        discount_amount: invoice.discountAmount,
        total_amount: invoice.totalAmount,
        status: invoice.status,
        notes_en: invoice.notesEn,
        notes_ar: invoice.notesAr,
        metadata: invoice.metadata,
      }, { transaction: t });

      if (invoice.items && invoice.items.length) {
        await InvoiceItemModel.bulkCreate(
          invoice.items.map(it => ({
            invoice_id: row.id,
            product_id: it.productId,
            unit_id: it.unitId,
            product_name_en: it.productNameEn,
            product_name_ar: it.productNameAr,
            barcode: it.barcode,
            quantity: it.quantity,
            unit_price: it.unitPrice,
            tax_rate: it.taxRate,
            line_total: it.lineTotal,
          })),
          { transaction: t },
        );
      }

      const fresh = await InvoiceModel.findByPk(row.id, { include: fullIncludes, transaction: t });
      return toEntity(fresh);
    });
  }

  async findById(id) {
    return toEntity(await InvoiceModel.findByPk(id, { include: fullIncludes }));
  }

  async findByNumber(invoiceNumber) {
    return toEntity(await InvoiceModel.findOne({
      where: { invoice_number: invoiceNumber }, include: fullIncludes,
    }));
  }

  async list({ page = 1, pageSize = 20, status, search, locale = 'en', customerId } = {}) {
    const where = {};
    if (status) where.status = status;
    if (customerId) where.customer_id = customerId;

    const customerInclude = { model: CustomerModel, as: 'customer', required: false };
    if (search) {
      const nameField = locale === 'ar' ? 'name_ar' : 'name_en';
      customerInclude.where = {
        [Op.or]: [
          { [nameField]: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
        ],
      };
      customerInclude.required = false;
      where[Op.or] = [{ invoice_number: { [Op.like]: `%${search}%` } }];
    }

    const offset = (page - 1) * pageSize;
    const { rows, count } = await InvoiceModel.findAndCountAll({
      where,
      include: [
        { model: InvoiceItemModel, as: 'items', include: itemIncludes },
        customerInclude,
      ],
      order: [['issue_date', 'DESC'], ['id', 'DESC']],
      limit: pageSize,
      offset,
      distinct: true,
    });
    return {
      data: rows.map(toEntity),
      pagination: { page, pageSize, total: count, totalPages: Math.ceil(count / pageSize) },
    };
  }

  async listByCustomer(customerId, params = {}) {
    return this.list({ ...params, customerId });
  }

  async update(id, patch) {
    const row = await InvoiceModel.findByPk(id);
    if (!row) return null;
    await row.update(patch);
    return this.findById(id);
  }

  async delete(id) {
    const n = await InvoiceModel.destroy({ where: { id } });
    return n > 0;
  }

  /**
   * Bulk-delete invoices older than the given date.
   * Used by the monthly retention cron.
   */
  async deleteOlderThan(cutoffDate) {
    return InvoiceModel.destroy({
      where: { issue_date: { [Op.lt]: cutoffDate } },
    });
  }
}

module.exports = SequelizeInvoiceRepository;
