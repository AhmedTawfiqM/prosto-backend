'use strict';

const ProductStatus = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
});

const UnitType = Object.freeze({
  SINGLE: 'single',
  MULTI: 'multi',
});

class Product {
  constructor({
    id,
    ownerId,
    owner,
    externalId,
    name,
    nameEn,
    nameAr,
    barcode,
    notes,
    notesEn,
    notesAr,
    date,
    quantity,
    purchasePrice,
    salePrice,
    wholeSalePrice,
    averagePrice,
    alertLow,
    categoryId,
    category,
    imageUrl,
    unitType,
    lowestUnitId,
    averageUnitId,
    largestUnitId,
    lowestUnit,
    averageUnit,
    largestUnit,
    averageUnitQuantity,
    largestUnitQuantity,
    status,
    metadata,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.ownerId = ownerId ?? null;
    this.owner = owner ?? null;
    this.externalId = externalId ?? null;
    this.nameEn = nameEn ?? name ?? '';
    this.nameAr = nameAr ?? name ?? '';
    this.barcode = barcode ?? null;
    this.notesEn = notesEn ?? notes ?? null;
    this.notesAr = notesAr ?? notes ?? null;
    this.date = date ?? null;
    this.quantity = Number(quantity ?? 0);
    this.purchasePrice = Number(purchasePrice ?? 0);
    this.salePrice = Number(salePrice ?? 0);
    this.wholeSalePrice = Number(wholeSalePrice ?? 0);
    this.averagePrice = Number(averagePrice ?? 0);
    this.alertLow = Number.isFinite(Number(alertLow)) ? Number(alertLow) : 0;
    this.categoryId = categoryId ?? null;
    this.category = category ?? null;
    this.imageUrl = imageUrl ?? null;
    this.unitType = unitType ?? UnitType.SINGLE;
    this.lowestUnitId = lowestUnitId ?? null;
    this.averageUnitId = averageUnitId ?? null;
    this.largestUnitId = largestUnitId ?? null;
    this.lowestUnit = lowestUnit ?? null;
    this.averageUnit = averageUnit ?? null;
    this.largestUnit = largestUnit ?? null;
    this.averageUnitQuantity = averageUnitQuantity != null ? Number(averageUnitQuantity) : null;
    this.largestUnitQuantity = largestUnitQuantity != null ? Number(largestUnitQuantity) : null;
    this.status = status ?? ProductStatus.ACTIVE;
    this.metadata = metadata ?? null;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = Product;
module.exports.ProductStatus = ProductStatus;
module.exports.UnitType = UnitType;
