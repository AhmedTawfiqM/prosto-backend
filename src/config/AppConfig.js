'use strict';

require('dotenv').config();

class AppConfig {
  static get env() { return process.env.NODE_ENV || 'development'; }
  static get isProd() { return this.env === 'production'; }

  static get server() {
    return Object.freeze({
      port: parseInt(process.env.PORT, 10) || 3011,
      apiPrefix: process.env.API_PREFIX || '/api/v1',
      publicBaseUrl: process.env.PUBLIC_BASE_URL || '',
    });
  }

  static get db() {
    return Object.freeze({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      name: process.env.DB_NAME || 'instamicro_db',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    });
  }

  static get cors() {
    const raw = process.env.ALLOWED_ORIGINS || '';
    return Object.freeze({
      allowedOrigins: raw.split(',').map(s => s.trim()).filter(Boolean),
    });
  }

  static get rateLimit() {
    return Object.freeze({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
      max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 120,
    });
  }

  static get logging() {
    return Object.freeze({
      level: process.env.LOG_LEVEL || 'info',
    });
  }

  static get i18n() {
    return Object.freeze({
      supported: ['en', 'ar'],
      default: 'en',
      rtl: ['ar'],
    });
  }
}

module.exports = AppConfig;
