'use strict';

const Invoice = require('../../domain/entities/Invoice');
const InvoiceItem = require('../../domain/entities/InvoiceItem');
const AppError = require('../../core/AppError');

class InvoiceService {
  constructor({ invoiceRepository, customerRepository, productRepository }) {
    this.repo = invoiceRepository;
    this.customers = customerRepository;
    this.products = productRepository;
  }

  static computeTotals(items, discountAmount = 0) {
    let subtotal = 0;
    let taxAmount = 0;
    for (const it of items) {
      const net = it.quantity * it.unitPrice;
      subtotal += net;
      taxAmount += net * (it.taxRate / 100);
    }
    subtotal = +subtotal.toFixed(2);
    taxAmount = +taxAmount.toFixed(2);
    const totalAmount = +(subtotal + taxAmount - Number(discountAmount || 0)).toFixed(2);
    return { subtotal, taxAmount, totalAmount };
  }

  async resolveCustomer(payload) {
    const inline = payload.customer || {};
    const explicitId = payload.customerId ?? payload.customer_id ?? inline.id;
    if (explicitId) {
      const found = await this.customers.findById(explicitId);
      if (!found) throw AppError.notFound(`Customer ${explicitId} not found`);
      return found;
    }
    const nameEn = inline.nameEn ?? inline.name_en ?? payload.customerNameEn ?? payload.customer_name_en;
    const nameAr = inline.nameAr ?? inline.name_ar ?? payload.customerNameAr ?? payload.customer_name_ar;
    const email = inline.email ?? payload.customerEmail ?? payload.customer_email ?? null;
    const phone = inline.phone ?? payload.customerPhone ?? payload.customer_phone ?? null;
    if (!nameEn || !nameAr) {
      throw AppError.badRequest('Customer requires both nameEn and nameAr (or customerId)');
    }
    return this.customers.findOrCreate({ nameEn, nameAr, email, phone, metadata: inline.metadata ?? null });
  }

  /**
   * Build an InvoiceItem from a raw line. Accepts either:
   *  - `{ productId, quantity, ... }` — looks up the product and snapshots name/price
   *  - `{ productNameEn, productNameAr, unitPrice, ... }` — free-form line
   *  - `{ productExternalId, quantity }` — looks up by mobile id
   *  - `{ barcode, quantity }` — looks up by barcode
   */
  async buildItem(raw) {
    const quantity = Number(raw.quantity ?? raw.qty ?? 1);
    const taxRate = Number(raw.taxRate ?? raw.tax_rate ?? 0);

    let product = null;
    const pid = raw.productId ?? raw.product_id;
    const ext = raw.productExternalId ?? raw.product_external_id;
    const bc = raw.barcode;

    if (pid != null) product = await this.products.findById(pid);
    else if (ext != null) product = await this.products.findByExternalId(ext);
    else if (bc) product = await this.products.findByBarcode(bc);

    const productNameEn = raw.productNameEn ?? raw.product_name_en
      ?? (product ? product.nameEn : null)
      ?? raw.descriptionEn ?? raw.description_en ?? raw.description ?? null;
    const productNameAr = raw.productNameAr ?? raw.product_name_ar
      ?? (product ? product.nameAr : null)
      ?? raw.descriptionAr ?? raw.description_ar ?? raw.description ?? null;

    if (!productNameEn || !productNameAr) {
      throw AppError.badRequest('Each item needs productId/barcode or productNameEn+productNameAr');
    }

    const unitPriceRaw = raw.unitPrice ?? raw.unit_price ?? raw.price;
    const unitPrice = unitPriceRaw != null
      ? Number(unitPriceRaw)
      : (product ? Number(product.salePrice) : 0);

    const lineNet = quantity * unitPrice;
    const lineTotal = +(lineNet + lineNet * (taxRate / 100)).toFixed(2);

    return new InvoiceItem({
      productId: product ? product.id : null,
      unitId: raw.unitId ?? raw.unit_id ?? null,
      productNameEn,
      productNameAr,
      barcode: bc ?? (product ? product.barcode : null),
      quantity,
      unitPrice,
      taxRate,
      lineTotal,
    });
  }

  async create(payload) {
    const customer = await this.resolveCustomer(payload);

    const rawItems = payload.items || [];
    if (!rawItems.length) throw AppError.badRequest('Invoice requires at least one item');
    const items = await Promise.all(rawItems.map((r) => this.buildItem(r)));

    const discountAmount = Number(payload.discountAmount ?? payload.discount_amount ?? 0);
    const { subtotal, taxAmount, totalAmount } = InvoiceService.computeTotals(items, discountAmount);

    const invoiceNumber = payload.invoiceNumber ?? payload.invoice_number;
    if (!invoiceNumber) throw AppError.badRequest('invoiceNumber is required');
    const existing = await this.repo.findByNumber(invoiceNumber);
    if (existing) throw AppError.conflict(`Invoice ${invoiceNumber} already exists`);

    const invoice = new Invoice({
      invoiceNumber,
      customerId: customer.id,
      issueDate: payload.issueDate ?? payload.issue_date ?? new Date().toISOString().slice(0, 10),
      dueDate: payload.dueDate ?? payload.due_date,
      currency: payload.currency || 'EGP',
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      status: payload.status,
      notesEn: payload.notesEn ?? payload.notes_en,
      notesAr: payload.notesAr ?? payload.notes_ar,
      items,
      metadata: payload.metadata ?? null,
    });

    return this.repo.create(invoice);
  }

  async getById(id) {
    const found = await this.repo.findById(id);
    if (!found) throw AppError.notFound('Invoice not found');
    return found;
  }

  async getByNumber(invoiceNumber) {
    const found = await this.repo.findByNumber(invoiceNumber);
    if (!found) throw AppError.notFound('Invoice not found');
    return found;
  }

  async list(params) { return this.repo.list(params); }
  async listByCustomer(customerId, params) {
    const customer = await this.customers.findById(customerId);
    if (!customer) throw AppError.notFound('Customer not found');
    return this.repo.listByCustomer(customerId, params);
  }

  async update(id, patch) {
    const updated = await this.repo.update(id, patch);
    if (!updated) throw AppError.notFound('Invoice not found');
    return updated;
  }

  async delete(id) {
    const ok = await this.repo.delete(id);
    if (!ok) throw AppError.notFound('Invoice not found');
    return true;
  }

  async purgeOlderThan(cutoffDate) {
    return this.repo.deleteOlderThan(cutoffDate);
  }
}

module.exports = InvoiceService;
