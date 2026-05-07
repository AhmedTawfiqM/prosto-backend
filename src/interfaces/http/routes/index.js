'use strict';

const express = require('express');
const buildInvoiceRoutes = require('./invoiceRoutes');
const buildCustomerRoutes = require('./customerRoutes');
const buildProductRoutes = require('./productRoutes');
const buildBrandRoutes = require('./brandRoutes');

module.exports = function buildRoutes(deps) {
  const router = express.Router();

  router.get('/health', (_req, res) => res.json({ success: true, status: 'ok', service: 'instamicro-api' }));
  router.use('/invoices', buildInvoiceRoutes(deps));
  router.use('/customers', buildCustomerRoutes(deps));
  router.use('/products', buildProductRoutes(deps));
  router.use('/brand', buildBrandRoutes(deps));

  return router;
};
