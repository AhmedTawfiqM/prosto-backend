'use strict';

const InvoicePresenter = require('../../../application/dto/InvoicePresenter');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

class InvoiceController {
  constructor({ invoiceService }) {
    this.service = invoiceService;
  }

  create = asyncHandler(async (req, res) => {
    const invoice = await this.service.create(req.body);
    res.status(201).json({ success: true, data: InvoicePresenter.toJson(invoice, req.locale) });
  });

  getById = asyncHandler(async (req, res) => {
    const invoice = await this.service.getById(req.params.id);
    res.json({ success: true, data: InvoicePresenter.toJson(invoice, req.locale) });
  });

  getByNumber = asyncHandler(async (req, res) => {
    const invoice = await this.service.getByNumber(req.params.number);
    res.json({ success: true, data: InvoicePresenter.toJson(invoice, req.locale) });
  });

  list = asyncHandler(async (req, res) => {
    const params = { ...req.query, locale: req.locale };
    const result = await this.service.list(params);
    res.json({ success: true, ...InvoicePresenter.toList(result, req.locale) });
  });

  update = asyncHandler(async (req, res) => {
    const invoice = await this.service.update(req.params.id, req.body);
    res.json({ success: true, data: InvoicePresenter.toJson(invoice, req.locale) });
  });

  delete = asyncHandler(async (req, res) => {
    await this.service.delete(req.params.id);
    res.json({ success: true });
  });
}

module.exports = InvoiceController;
