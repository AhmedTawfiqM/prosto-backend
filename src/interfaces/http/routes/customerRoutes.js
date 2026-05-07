'use strict';

const express = require('express');
const validate = require('../../../middleware/validate');
const { createSchema, updateSchema, listSchema } = require('../validators/customerValidator');
const { listSchema: invoiceListSchema } = require('../validators/invoiceValidator');

module.exports = function buildCustomerRoutes({ customerController }) {
  const router = express.Router();

  router.get('/', validate(listSchema, 'query'), customerController.list);
  router.post('/', validate(createSchema, 'body'), customerController.create);
  router.get('/:id', customerController.getById);
  router.patch('/:id', validate(updateSchema, 'body'), customerController.update);
  router.get('/:id/invoices', validate(invoiceListSchema, 'query'), customerController.invoices);

  return router;
};
