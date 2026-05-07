'use strict';

const express = require('express');
const validate = require('../../../middleware/validate');
const {
  productSchema, bulkSchema, ingestBatchSchema, listSchema,
} = require('../validators/productValidator');

module.exports = function buildProductRoutes({ productController }) {
  const router = express.Router();

  router.get('/', validate(listSchema, 'query'), productController.list);

  // NEW preferred endpoint for the mobile app: { email, products: [...] }
  router.post('/ingest', validate(ingestBatchSchema, 'body'), productController.ingestBatch);

  // Back-compat: single product / array
  router.post('/', validate(productSchema, 'body'), productController.ingestOne);
  router.post('/bulk', validate(bulkSchema, 'body'), productController.ingestMany);

  router.get('/by-barcode/:barcode', productController.getByBarcode);
  router.get('/:id', productController.getById);
  router.delete('/:id', productController.delete);

  return router;
};
