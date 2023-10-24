/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
import { Document, Model, Schema } from 'mongoose';
import { IsalesReport } from '@open-stock/stock-universal';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/** model interface for salesReport by */
/** */
export type TsalesReport = Document & IsalesReport;

const salesReportSchema: Schema<TsalesReport> = new Schema({
  urId: { type: String, unique: true },
  totalAmount: { type: Number },
  date: { type: Date },
  estimates: [],
  invoiceRelateds: []
}, { timestamps: true });

// Apply the uniqueValidator plugin to salesReportSchema.
salesReportSchema.plugin(uniqueValidator);

/** primary selection object
 * for salesReport
 */
const salesReportselect = {
  urId: 1,
  totalAmount: 1,
  date: 1,
  estimates: 1,
  invoiceRelateds: 1
};

/** main connection for salesReports Operations*/
export let salesReportMain: Model<TsalesReport>;
/** lean connection for salesReports Operations*/
export let salesReportLean: Model<TsalesReport>;
/** primary selection object
 * for salesReport
 */
/** */
export const salesReportSelect = salesReportselect;

/** */
/**
 * Creates a sales report model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create a main connection or not. Defaults to true.
 * @param lean Whether to create a lean connection or not. Defaults to true.
 */
export const createSalesReportModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl);
  }

  if (main) {
    salesReportMain = mainConnection.model<TsalesReport>('salesReport', salesReportSchema);
  }

  if (lean) {
    salesReportLean = mainConnectionLean.model<TsalesReport>('salesReport', salesReportSchema);
  }
};
