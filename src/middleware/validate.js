'use strict';

const AppError = require('../core/AppError');

const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
  if (error) {
    return next(AppError.validation('Validation failed', error.details.map(d => ({
      path: d.path.join('.'), message: d.message,
    }))));
  }
  req[source] = value;
  return next();
};

module.exports = validate;
