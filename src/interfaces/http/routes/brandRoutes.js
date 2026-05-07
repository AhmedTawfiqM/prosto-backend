'use strict';

const express = require('express');
const Joi = require('joi');
const validate = require('../../../middleware/validate');

const logoSchema = Joi.object({
  image: Joi.string().required(),
  name: Joi.string().max(80).optional(),
});

module.exports = function buildBrandRoutes({ brandController }) {
  const router = express.Router();
  router.post('/logo', validate(logoSchema, 'body'), brandController.uploadLogo);
  return router;
};
