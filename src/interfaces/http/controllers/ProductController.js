'use strict';

const ProductPresenter = require('../../../application/dto/ProductPresenter');
const CustomerPresenter = require('../../../application/dto/CustomerPresenter');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

class ProductController {
  constructor({ productService }) {
    this.service = productService;
  }

  // POST /products/ingest  body: { email, products: [...] }
  ingestBatch = asyncHandler(async (req, res) => {
    const { email, products } = req.body;
    const result = await this.service.ingestBatch({ email, products });
    res.status(201).json({
      success: true,
      data: {
        owner: CustomerPresenter.toJson(result.owner, req.locale),
        products: result.products.map(p => ProductPresenter.toJson(p, req.locale, req)),
      },
      count: result.products.length,
    });
  });

  ingestOne = asyncHandler(async (req, res) => {
    const p = await this.service.ingestOne(req.body);
    res.status(201).json({ success: true, data: ProductPresenter.toJson(p, req.locale, req) });
  });

  ingestMany = asyncHandler(async (req, res) => {
    const list = await this.service.ingestMany(req.body);
    res.status(201).json({
      success: true,
      data: list.map(p => ProductPresenter.toJson(p, req.locale, req)),
      count: list.length,
    });
  });

  getById = asyncHandler(async (req, res) => {
    const p = await this.service.getById(req.params.id);
    res.json({ success: true, data: ProductPresenter.toJson(p, req.locale, req) });
  });

  getByBarcode = asyncHandler(async (req, res) => {
    const p = await this.service.getByBarcode(req.params.barcode);
    res.json({ success: true, data: ProductPresenter.toJson(p, req.locale, req) });
  });

  list = asyncHandler(async (req, res) => {
    const params = { ...req.query, locale: req.locale };
    let result;
    if (params.email) {
      result = await this.service.listByOwnerEmail(params.email, params);
    } else {
      result = await this.service.list(params);
    }
    res.json({ success: true, ...ProductPresenter.toList(result, req.locale, req) });
  });

  delete = asyncHandler(async (req, res) => {
    await this.service.delete(req.params.id);
    res.json({ success: true });
  });
}

module.exports = ProductController;
