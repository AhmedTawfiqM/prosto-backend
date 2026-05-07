'use strict';

class CustomerPresenter {
  static toJson(c, locale = 'en') {
    if (!c) return null;
    const isAr = locale === 'ar';
    return {
      id: c.id,
      name: isAr ? c.nameAr : c.nameEn,
      nameEn: c.nameEn,
      nameAr: c.nameAr,
      email: c.email,
      phone: c.phone,
      metadata: c.metadata,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  static toList(result, locale = 'en') {
    return {
      data: result.data.map(c => CustomerPresenter.toJson(c, locale)),
      pagination: result.pagination,
    };
  }
}

module.exports = CustomerPresenter;
