/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
import { IsalesReport } from '@open-stock/stock-universal';
import { createExpireDocIndex, preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj } from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../utils/database';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents a sales report.
 * @typedef {Document & IsalesReport} TsalesReport
 */
export type TsalesReport = Document & IsalesReport;

const salesReportSchema: Schema<TsalesReport> = new Schema({
  ...withUrIdAndCompanySchemaObj,
  totalAmount: { type: Number },
  date: { type: Date },
  estimates: [],
  invoiceRelateds: [],
  currency: { type: String, default: 'USD' }
}, { timestamps: true, collection: 'salesreports' });

// Apply the uniqueValidator plugin to salesReportSchema.
salesReportSchema.plugin(uniqueValidator);

salesReportSchema.pre('updateOne', function(next) {
  return preUpdateDocExpire(this, next);
});

salesReportSchema.pre('updateMany', function(next) {
  return preUpdateDocExpire(this, next);
});

/** primary selection object
 * for salesReport
 */
const salesReportselect = {
  ...withUrIdAndCompanySelectObj,
  totalAmount: 1,
  date: 1,
  estimates: 1,
  invoiceRelateds: 1,
  currency: 1
};

/**
 * Represents the main sales report model.
 */
export let salesReportMain: Model<TsalesReport>;

/**
 * Represents a lean sales report model.
 */
export let salesReportLean: Model<TsalesReport>;

/**
 * Represents the sales report select statement.
 */
export const salesReportSelect = salesReportselect;

/**
 * Creates a sales report model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create a main connection or not. Defaults to true.
 * @param lean Whether to create a lean connection or not. Defaults to true.
 */
export const createSalesReportModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  createExpireDocIndex(salesReportSchema);
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl, dbOptions);
  }

  if (main) {
    salesReportMain = mainConnection.model<TsalesReport>('salesReport', salesReportSchema);
  }

  if (lean) {
    salesReportLean = mainConnectionLean.model<TsalesReport>('salesReport', salesReportSchema);
  }
};
