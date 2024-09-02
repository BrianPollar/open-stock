import { IinvoicesReport } from '@open-stock/stock-universal';
import { createExpireDocIndex, preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj } from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../utils/database';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents a TinvoicesReport, which is a document that combines the properties of a Document and IinvoicesReport.
 */
export type TinvoicesReport = Document & IinvoicesReport;

/** Schema definition for invoicesReport */
const invoicesReportSchema: Schema<TinvoicesReport> = new Schema({
  ...withUrIdAndCompanySchemaObj,
  totalAmount: { type: Number },
  date: { type: Date },
  invoices: []
}, { timestamps: true, collection: 'invoicesreports' });

invoicesReportSchema.pre('updateOne', function(next) {
  return preUpdateDocExpire(this, next);
});

invoicesReportSchema.pre('updateMany', function(next) {
  return preUpdateDocExpire(this, next);
});


// Apply the uniqueValidator plugin to invoicesReportSchema.
invoicesReportSchema.plugin(uniqueValidator);

/** Primary selection object for invoicesReport */
const invoicesReportselect = {
  ...withUrIdAndCompanySelectObj,
  totalAmount: 1,
  date: 1,
  invoices: 1
};

/**
 * Represents the main invoice report.
 */
export let invoicesReportMain: Model<TinvoicesReport>;

/**
 * Represents the lean version of the invoices report model.
 */
export let invoicesReportLean: Model<TinvoicesReport>;

/**
 * Select statement for generating invoices report.
 */
export const invoicesReportSelect = invoicesReportselect;

/**
 * Creates a new invoices report model.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - Whether to create the main connection for invoicesReports Operations.
 * @param lean - Whether to create the lean connection for invoicesReports Operations.
 */
export const createInvoicesReportModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  createExpireDocIndex(invoicesReportSchema);
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl, dbOptions);
  }

  if (main) {
    invoicesReportMain = mainConnection.model<TinvoicesReport>('invoicesReport', invoicesReportSchema);
  }

  if (lean) {
    invoicesReportLean = mainConnectionLean.model<TinvoicesReport>('invoicesReport', invoicesReportSchema);
  }
};

