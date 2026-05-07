'use strict';

const CustomerPresenter = require('../../../application/dto/CustomerPresenter');
const InvoicePresenter = require('../../../application/dto/InvoicePresenter');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

class CustomerController {
  constructor({ customerService, invoiceService }) {
    this.service = customerService;
    this.invoiceService = invoiceService;
  }

  create = asyncHandler(async (req, res) => {
    const c = await this.service.create(req.body);
    res.status(201).json({ success: true, data: CustomerPresenter.toJson(c, req.locale) });
  });

  getById = asyncHandler(async (req, res) => {
    const c = await this.service.getById(req.params.id);
    res.json({ success: true, data: CustomerPresenter.toJson(c, req.locale) });
  });

  list = asyncHandler(async (req, res) => {
    const result = await this.service.list({ ...req.query, locale: req.locale });
    res.json({ success: true, ...CustomerPresenter.toList(result, req.locale) });
  });

  update = asyncHandler(async (req, res) => {
    const c = await this.service.update(req.params.id, req.body);
    res.json({ success: true, data: CustomerPresenter.toJson(c, req.locale) });
  });

  invoices = asyncHandler(async (req, res) => {
    const result = await this.invoiceService.listByCustomer(req.params.id, {
      ...req.query, locale: req.locale,
    });
    res.json({ success: true, ...InvoicePresenter.toList(result, req.locale) });
  });
}

module.exports = CustomerController;
