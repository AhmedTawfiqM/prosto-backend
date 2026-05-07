'use strict';

class Category {
  constructor({ id, externalId, nameEn, nameAr, createdAt, updatedAt }) {
    this.id = id;
    this.externalId = externalId ?? null;
    this.nameEn = nameEn;
    this.nameAr = nameAr;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = Category;
