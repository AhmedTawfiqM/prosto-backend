'use strict';

const InvoiceStatus = Object.freeze({
  DRAFT: 'draft',
  ISSUED: 'issued',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
});

class Invoice {
  constructor({
    id,
    invoiceNumber,
    customerId,
    customer,
    issueDate,
    dueDate,
    currency,
    subtotal,
    taxAmount,
    discountAmount,
    totalAmount,
    status,
    notesEn,
    notesAr,
    items,
    metadata,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.invoiceNumber = invoiceNumber;
    this.customerId = customerId;
    this.customer = customer || null;
    this.issueDate = issueDate;
    this.dueDate = dueDate || null;
    this.currency = currency || 'EGP';
    this.subtotal = Number(subtotal) || 0;
    this.taxAmount = Number(taxAmount) || 0;
    this.discountAmount = Number(discountAmount) || 0;
    this.totalAmount = Number(totalAmount) || 0;
    this.status = status || InvoiceStatus.ISSUED;
    this.notesEn = notesEn || null;
    this.notesAr = notesAr || null;
    this.items = items || [];
    this.metadata = metadata || null;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

}

module.exports = Invoice;
module.exports.InvoiceStatus = InvoiceStatus;
