'use strict';

class ProductUnit {
  constructor({ id, externalId, nameEn, nameAr }) {
    this.id = id;
    this.externalId = externalId ?? null;
    this.nameEn = nameEn;
    this.nameAr = nameAr;
  }
}

module.exports = ProductUnit;
