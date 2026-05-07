'use strict';

const express = require('express');
const validate = require('../../../middleware/validate');
const { createSchema, updateSchema, listSchema } = require('../validators/invoiceValidator');

module.exports = function buildInvoiceRoutes({ invoiceController }) {
  const router = express.Router();

  router.get('/', validate(listSchema, 'query'), invoiceController.list);
  router.post('/', validate(createSchema, 'body'), invoiceController.create);
  router.get('/by-number/:number', invoiceController.getByNumber);
  router.get('/:id', invoiceController.getById);
  router.patch('/:id', validate(updateSchema, 'body'), invoiceController.update);
  router.delete('/:id', invoiceController.delete);

  return router;
};
