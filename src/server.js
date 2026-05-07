'use strict';

const buildApp = require('./app');
const AppConfig = require('./config/AppConfig');
const Logger = require('./core/Logger');
const { sequelize } = require('./infrastructure/database/models');
const buildContainer = require('./container');

(async () => {
  try {
    await sequelize.authenticate();
    Logger.info('DB connection established');

    if (!AppConfig.isProd) {
      await sequelize.sync({ alter: true });
      Logger.info('DB schema synced');
    }

    const app = buildApp();

    const container = buildContainer();
    container.invoiceRetentionJob.start();

    app.listen(AppConfig.server.port, () => {
      Logger.info(`InstaMicroTech API running on :${AppConfig.server.port}${AppConfig.server.apiPrefix}`);
    });
  } catch (err) {
    Logger.error('Failed to start server');
    Logger.error(err);
    process.exit(1);
  }
})();

process.on('unhandledRejection', (reason) => Logger.error(`unhandledRejection: ${reason}`));
process.on('uncaughtException', (err) => { Logger.error(err); process.exit(1); });
