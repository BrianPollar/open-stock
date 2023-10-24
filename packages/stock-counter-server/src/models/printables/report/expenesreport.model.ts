import { Document, Model, Schema } from 'mongoose';
import { IexpenseReport } from '@open-stock/stock-universal';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/** Interface for the expense report document. */
export interface TexpenseReport extends Document, IexpenseReport {}

/** Mongoose schema for the expense report document. */
const expenseReportSchema: Schema<TexpenseReport> = new Schema({
  urId: { type: String, unique: true },
  totalAmount: { type: Number },
  date: { type: Date },
  expenses: []
}, { timestamps: true });

// Apply the uniqueValidator plugin to expenseReportSchema.
expenseReportSchema.plugin(uniqueValidator);

/** Primary selection object for expense report document. */
const expenseReportselect = {
  urId: 1,
  totalAmount: 1,
  date: 1,
  expenses: 1
};

/** Main connection for expense report operations. */
export let expenseReportMain: Model<TexpenseReport>;

/** Lean connection for expense report operations. */
export let expenseReportLean: Model<TexpenseReport>;

/** Primary selection object for expense report document. */
export const expenseReportSelect = expenseReportselect;

/**
 * Creates a new expense report model.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - Whether to create a main connection for expense report operations.
 * @param lean - Whether to create a lean connection for expense report operations.
 */
export const createExpenseReportModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl);
  }

  if (main) {
    expenseReportMain = mainConnection.model<TexpenseReport>('expenseReport', expenseReportSchema);
  }

  if (lean) {
    expenseReportLean = mainConnectionLean.model<TexpenseReport>('expenseReport', expenseReportSchema);
  }
};
