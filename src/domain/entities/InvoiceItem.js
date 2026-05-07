'use strict';

class InvoiceItem {
  constructor({
    id,
    invoiceId,
    productId,
    unitId,
    productNameEn,
    productNameAr,
    barcode,
    quantity,
    unitPrice,
    taxRate,
    lineTotal,
    product,
    unit,
  }) {
    this.id = id;
    this.invoiceId = invoiceId;
    this.productId = productId ?? null;
    this.unitId = unitId ?? null;
    this.productNameEn = productNameEn;
    this.productNameAr = productNameAr;
    this.barcode = barcode ?? null;
    this.quantity = Number(quantity) || 0;
    this.unitPrice = Number(unitPrice) || 0;
    this.taxRate = Number(taxRate) || 0;
    this.lineTotal = Number(lineTotal) || 0;
    this.product = product ?? null;
    this.unit = unit ?? null;
  }
}

module.exports = InvoiceItem;
