'use strict';

const AppError = require('../core/AppError');
const Logger = require('../core/Logger');

function notFoundHandler(_req, _res, next) {
  next(AppError.notFound('Route not found'));
}

function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  if (err && err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      error: { code: 'CONFLICT', message: 'Duplicate value', details: err.errors?.map(e => e.message) },
    });
  }

  Logger.error(err);
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  });
}

module.exports = { notFoundHandler, errorHandler };
