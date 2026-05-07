'use strict';

const { Sequelize } = require('sequelize');
const AppConfig = require('../../config/AppConfig');
const Logger = require('../../core/Logger');

const sequelize = new Sequelize(
  AppConfig.db.name,
  AppConfig.db.user,
  AppConfig.db.password,
  {
    host: AppConfig.db.host,
    port: AppConfig.db.port,
    dialect: 'mysql',
    logging: AppConfig.isProd ? false : (msg) => Logger.debug(msg),
    pool: AppConfig.db.pool,
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      underscored: true,
    },
  },
);

module.exports = sequelize;
