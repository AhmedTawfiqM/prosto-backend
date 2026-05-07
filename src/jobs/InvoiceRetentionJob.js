'use strict';

const cron = require('node-cron');
const Logger = require('../core/Logger');

/**
 * Monthly retention: delete invoices whose issue_date is older than RETENTION_DAYS.
 * Default: 30 days. Override with INVOICE_RETENTION_DAYS env var.
 *
 * Schedule: at 03:15 on the 1st of every month (server time).
 */
class InvoiceRetentionJob {
  constructor({ invoiceService }) {
    this.invoiceService = invoiceService;
    this.task = null;
    this.retentionDays = parseInt(process.env.INVOICE_RETENTION_DAYS, 10) || 30;
    this.cronExpr = process.env.INVOICE_RETENTION_CRON || '15 3 1 * *';
  }

  computeCutoffDate(now = new Date()) {
    const d = new Date(now);
    d.setDate(d.getDate() - this.retentionDays);
    return d.toISOString().slice(0, 10);
  }

  async runNow() {
    const cutoff = this.computeCutoffDate();
    Logger.info(`[InvoiceRetentionJob] purging invoices older than ${cutoff} (${this.retentionDays}d retention)`);
    try {
      const deleted = await this.invoiceService.purgeOlderThan(cutoff);
      Logger.info(`[InvoiceRetentionJob] deleted ${deleted} invoice(s)`);
      return deleted;
    } catch (err) {
      Logger.error('[InvoiceRetentionJob] failed');
      Logger.error(err);
      throw err;
    }
  }

  start() {
    if (this.task) return;
    if (!cron.validate(this.cronExpr)) {
      Logger.error(`[InvoiceRetentionJob] invalid cron expression: ${this.cronExpr}`);
      return;
    }
    this.task = cron.schedule(this.cronExpr, () => { void this.runNow(); }, {
      scheduled: true,
      timezone: process.env.TZ || 'Africa/Cairo',
    });
    Logger.info(`[InvoiceRetentionJob] scheduled (${this.cronExpr}, retention=${this.retentionDays}d)`);
  }

  stop() {
    if (this.task) { this.task.stop(); this.task = null; }
  }
}

module.exports = InvoiceRetentionJob;
