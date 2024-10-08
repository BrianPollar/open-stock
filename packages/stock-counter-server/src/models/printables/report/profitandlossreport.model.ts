/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
import { IprofitAndLossReport } from '@open-stock/stock-universal';
import { createExpireDocIndex, preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj } from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../utils/database';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents the type for the profit and loss report.
 */
export type TprofitandlossReport = Document & IprofitAndLossReport;

const profitandlossReportSchema: Schema<TprofitandlossReport> = new Schema({
  ...withUrIdAndCompanySchemaObj,
  totalAmount: { type: Number },
  date: { type: Date },
  expenses: [],
  invoiceRelateds: [],
  currency: { type: String, default: 'USD' }
}, { timestamps: true, collection: 'profitandlossreports' });

// Apply the uniqueValidator plugin to profitandlossReportSchema.
profitandlossReportSchema.plugin(uniqueValidator);

profitandlossReportSchema.pre('updateOne', function(next) {
  return preUpdateDocExpire(this, next);
});

profitandlossReportSchema.pre('updateMany', function(next) {
  return preUpdateDocExpire(this, next);
});

/** primary selection object
 * for profitandlossReport
 */
const profitandlossReportselect = {
  ...withUrIdAndCompanySelectObj,
  totalAmount: 1,
  date: 1,
  expenses: 1,
  invoiceRelateds: 1,
  currency: 1
};

/**
 * Represents the main profit and loss report model.
 */
export let profitandlossReportMain: Model<TprofitandlossReport>;

/**
 * Represents the lean version of the profit and loss report model.
 */
export let profitandlossReportLean: Model<TprofitandlossReport>;

/**
 * Selects the profit and loss report.
 */
export const profitandlossReportSelect = profitandlossReportselect;


/**
 * Creates a Profit and Loss Report model.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - Whether to create the main connection model. Defaults to true.
 * @param lean - Whether to create the lean connection model. Defaults to true.
 */
export const createProfitandlossReportModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  createExpireDocIndex(profitandlossReportSchema);
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl, dbOptions);
  }

  if (main) {
    profitandlossReportMain = mainConnection.model<TprofitandlossReport>('profitandlossReport', profitandlossReportSchema);
  }

  if (lean) {
    profitandlossReportLean = mainConnectionLean.model<TprofitandlossReport>('profitandlossReport', profitandlossReportSchema);
  }
};

