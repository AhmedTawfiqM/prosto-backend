'use strict';

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const AppConfig = require('./config/AppConfig');
const Logger = require('./core/Logger');
const locale = require('./middleware/locale');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const buildContainer = require('./container');
const buildRoutes = require('./interfaces/http/routes');
const { PUBLIC_DIR } = require('./utils/imageProcessor');

function buildApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // Allow images served from /uploads/* to be embedded cross-origin (sub-domain web)
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  app.use(compression());

  app.use(cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (AppConfig.cors.allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }));

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  app.use(morgan(AppConfig.isProd ? 'combined' : 'dev', {
    stream: { write: (msg) => (Logger.http ? Logger.http(msg.trim()) : Logger.info(msg.trim())) },
  }));

  app.use(locale);

  // Static uploads — long cache, immutable filenames (we hash them)
  app.use('/uploads', express.static(path.join(PUBLIC_DIR, 'uploads'), {
    maxAge: '30d',
    immutable: true,
    fallthrough: true,
  }));

  app.use(rateLimit({
    windowMs: AppConfig.rateLimit.windowMs,
    max: AppConfig.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path.startsWith('/uploads/'),
  }));

  const container = buildContainer();
  app.use(AppConfig.server.apiPrefix, buildRoutes(container));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = buildApp;
