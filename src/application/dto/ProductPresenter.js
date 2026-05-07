'use strict';

const AppConfig = require('../../config/AppConfig');

function unit(u, isAr) {
  if (!u) return null;
  return { id: u.id, externalId: u.externalId, name: isAr ? u.nameAr : u.nameEn, nameEn: u.nameEn, nameAr: u.nameAr };
}

function category(c, isAr) {
  if (!c) return null;
  return { id: c.id, externalId: c.externalId, name: isAr ? c.nameAr : c.nameEn, nameEn: c.nameEn, nameAr: c.nameAr };
}

function owner(o, isAr) {
  if (!o) return null;
  return {
    id: o.id,
    name: isAr ? o.nameAr : o.nameEn,
    nameEn: o.nameEn,
    nameAr: o.nameAr,
    email: o.email,
    phone: o.phone,
  };
}

/**
 * Turn a stored relative path like "/uploads/products/X.webp" into an
 * absolute URL the client can fetch directly. Pass-through for http(s).
 */
function absoluteImageUrl(value, req) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (!value.startsWith('/')) return value;
  if (req && req.protocol && req.get) {
    const host = req.get('host');
    return `${req.protocol}://${host}${value}`;
  }
  if (AppConfig && AppConfig.server && AppConfig.server.publicBaseUrl) {
    return `${AppConfig.server.publicBaseUrl.replace(/\/$/, '')}${value}`;
  }
  return value;
}

class ProductPresenter {
  static toJson(p, locale = 'en', req = null) {
    if (!p) return null;
    const isAr = locale === 'ar';
    return {
      id: p.id,
      ownerId: p.ownerId,
      owner: owner(p.owner, isAr),
      externalId: p.externalId,
      name: isAr ? p.nameAr : p.nameEn,
      nameEn: p.nameEn,
      nameAr: p.nameAr,
      barcode: p.barcode,
      notes: isAr ? p.notesAr : p.notesEn,
      notesEn: p.notesEn,
      notesAr: p.notesAr,
      date: p.date,
      quantity: p.quantity,
      purchasePrice: p.purchasePrice,
      salePrice: p.salePrice,
      wholeSalePrice: p.wholeSalePrice,
      averagePrice: p.averagePrice,
      alertLow: p.alertLow,
      categoryId: p.categoryId,
      category: category(p.category, isAr),
      imageUrl: absoluteImageUrl(p.imageUrl, req),
      imageUrlPath: p.imageUrl,
      unitType: p.unitType,
      lowestUnit: unit(p.lowestUnit, isAr),
      averageUnit: unit(p.averageUnit, isAr),
      largestUnit: unit(p.largestUnit, isAr),
      averageUnitQuantity: p.averageUnitQuantity,
      largestUnitQuantity: p.largestUnitQuantity,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  static toList(result, locale = 'en', req = null) {
    return {
      data: result.data.map(p => ProductPresenter.toJson(p, locale, req)),
      pagination: result.pagination,
    };
  }
}

module.exports = ProductPresenter;
