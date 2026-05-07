'use strict';

class Customer {
  constructor({ id, nameEn, nameAr, email, phone, metadata, createdAt, updatedAt }) {
    this.id = id;
    this.nameEn = nameEn;
    this.nameAr = nameAr;
    this.email = email || null;
    this.phone = phone || null;
    this.metadata = metadata || null;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = Customer;
