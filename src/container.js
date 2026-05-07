'use strict';

const SequelizeInvoiceRepository = require('./infrastructure/repositories/SequelizeInvoiceRepository');
const SequelizeCustomerRepository = require('./infrastructure/repositories/SequelizeCustomerRepository');
const SequelizeProductRepository = require('./infrastructure/repositories/SequelizeProductRepository');
const InvoiceService = require('./application/services/InvoiceService');
const CustomerService = require('./application/services/CustomerService');
const ProductService = require('./application/services/ProductService');
const InvoiceController = require('./interfaces/http/controllers/InvoiceController');
const CustomerController = require('./interfaces/http/controllers/CustomerController');
const ProductController = require('./interfaces/http/controllers/ProductController');
const BrandController = require('./interfaces/http/controllers/BrandController');
const InvoiceRetentionJob = require('./jobs/InvoiceRetentionJob');

function buildContainer() {
  const invoiceRepository = new SequelizeInvoiceRepository();
  const customerRepository = new SequelizeCustomerRepository();
  const productRepository = new SequelizeProductRepository();

  const invoiceService = new InvoiceService({
    invoiceRepository, customerRepository, productRepository,
  });
  const customerService = new CustomerService({ customerRepository });
  const productService = new ProductService({ productRepository, customerRepository });

  const invoiceController = new InvoiceController({ invoiceService });
  const customerController = new CustomerController({ customerService, invoiceService });
  const productController = new ProductController({ productService });
  const brandController = new BrandController();

  const invoiceRetentionJob = new InvoiceRetentionJob({ invoiceService });

  return {
    invoiceRepository, customerRepository, productRepository,
    invoiceService, customerService, productService,
    invoiceController, customerController, productController, brandController,
    invoiceRetentionJob,
  };
}

module.exports = buildContainer;
