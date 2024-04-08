/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
import { IprofitAndLossReport } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents the type for the profit and loss report.
 */
export type TprofitandlossReport = Document & IprofitAndLossReport;

const profitandlossReportSchema: Schema<TprofitandlossReport> = new Schema({
  urId: { type: String, unique: true },
  companyId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
  totalAmount: { type: Number },
  date: { type: Date },
  expenses: [],
  invoiceRelateds: []
}, { timestamps: true });

// Apply the uniqueValidator plugin to profitandlossReportSchema.
profitandlossReportSchema.plugin(uniqueValidator);

/** primary selection object
 * for profitandlossReport
 */
const profitandlossReportselect = {
  urId: 1,
  companyId: 1,
  totalAmount: 1,
  date: 1,
  expenses: 1,
  invoiceRelateds: 1
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

