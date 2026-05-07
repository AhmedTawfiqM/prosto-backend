'use strict';

const AppConfig = require('../config/AppConfig');

module.exports = function locale(req, _res, next) {
  const supported = AppConfig.i18n.supported;
  const fromQuery = req.query?.lang;
  const fromHeader = (req.headers['accept-language'] || '').split(',')[0]?.split('-')[0];
  const candidate = (fromQuery || fromHeader || AppConfig.i18n.default).toLowerCase();
  req.locale = supported.includes(candidate) ? candidate : AppConfig.i18n.default;
  next();
};
