import { IinvoicesReport } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents a TinvoicesReport, which is a document that combines the properties of a Document and IinvoicesReport.
 */
export type TinvoicesReport = Document & IinvoicesReport;

/** Schema definition for invoicesReport */
const invoicesReportSchema: Schema<TinvoicesReport> = new Schema({
  trackEdit: { type: Schema.ObjectId },
  trackView: { type: Schema.ObjectId },
  urId: { type: String },
  companyId: { type: String, required: [true, 'cannot be empty.'], index: true },
  totalAmount: { type: Number },
  date: { type: Date },
  invoices: []
}, { timestamps: true });

// Apply the uniqueValidator plugin to invoicesReportSchema.
invoicesReportSchema.plugin(uniqueValidator);

/** Primary selection object for invoicesReport */
const invoicesReportselect = {
  trackEdit: 1,
  trackView: 1,
  urId: 1,
  companyId: 1,
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

