'use strict';

const winston = require('winston');
const AppConfig = require('../config/AppConfig');

const Logger = winston.createLogger({
  level: AppConfig.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    AppConfig.isProd
      ? winston.format.json()
      : winston.format.printf(({ timestamp, level, message, stack }) =>
          `${timestamp} [${level}] ${stack || message}`,
        ),
  ),
  transports: [new winston.transports.Console()],
});

module.exports = Logger;
