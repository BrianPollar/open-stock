/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
import { Document, Model, Schema } from 'mongoose';
import { ItaxReport } from '@open-stock/stock-universal';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/** model interface for taxReport by */
/** */
export type TtaxReport = Document & ItaxReport;

const taxReportSchema: Schema<TtaxReport> = new Schema({
  urId: { type: String, unique: true },
  totalAmount: { type: Number },
  date: { type: Date },
  estimates: [],
  invoiceRelateds: []
}, { timestamps: true });

// Apply the uniqueValidator plugin to taxReportSchema.
taxReportSchema.plugin(uniqueValidator);

/** primary selection object
 * for taxReport
 */
const taxReportselect = {
  urId: 1,
  totalAmount: 1,
  date: 1,
  estimates: 1,
  invoiceRelateds: 1
};

/** main connection for taxReports Operations*/
export let taxReportMain: Model<TtaxReport>;
/** lean connection for taxReports Operations*/
export let taxReportLean: Model<TtaxReport>;
/** primary selection object
 * for taxReport
 */
/** */
export const taxReportSelect = taxReportselect;

/** */
/**
 * Creates a tax report model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the main connection or not. Defaults to true.
 * @param lean Whether to create the lean connection or not. Defaults to true.
 */
export const createTaxReportModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl);
  }

  if (main) {
    taxReportMain = mainConnection.model<TtaxReport>('taxReport', taxReportSchema);
  }

  if (lean) {
    taxReportLean = mainConnectionLean.model<TtaxReport>('taxReport', taxReportSchema);
  }
};
