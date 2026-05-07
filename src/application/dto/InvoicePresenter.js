'use strict';

const CustomerPresenter = require('./CustomerPresenter');

function unit(u, isAr) {
  if (!u) return null;
  return { id: u.id, name: isAr ? u.nameAr : u.nameEn, nameEn: u.nameEn, nameAr: u.nameAr };
}

class InvoicePresenter {
  static toJson(invoice, locale = 'en') {
    if (!invoice) return null;
    const isAr = locale === 'ar';
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      customer: CustomerPresenter.toJson(invoice.customer, locale),
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      currency: invoice.currency,
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      discountAmount: invoice.discountAmount,
      totalAmount: invoice.totalAmount,
      status: invoice.status,
      notes: isAr ? invoice.notesAr : invoice.notesEn,
      notesEn: invoice.notesEn,
      notesAr: invoice.notesAr,
      items: (invoice.items || []).map(it => ({
        id: it.id,
        productId: it.productId,
        productName: isAr ? it.productNameAr : it.productNameEn,
        productNameEn: it.productNameEn,
        productNameAr: it.productNameAr,
        barcode: it.barcode,
        unit: unit(it.unit, isAr),
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        taxRate: it.taxRate,
        lineTotal: it.lineTotal,
      })),
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }

  static toList(result, locale = 'en') {
    return {
      data: result.data.map(inv => InvoicePresenter.toJson(inv, locale)),
      pagination: result.pagination,
    };
  }
}

module.exports = InvoicePresenter;
