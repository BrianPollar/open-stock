import { Document, Model, Schema } from 'mongoose';
import { Iexpense } from '@open-stock/stock-universal';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/** model type for expense by */
/** */
export type Texpense = Document & Iexpense;

const expenseSchema: Schema<Texpense> = new Schema({
  urId: { type: String, unique: true },
  name: { type: String, required: [true, 'cannot be empty.'], index: true },
  person: { type: String },
  cost: { type: Number, required: [true, 'cannot be empty.'], index: true },
  category: { type: String },
  items: []
}, { timestamps: true });

// Apply the uniqueValidator plugin to expenseSchema.
expenseSchema.plugin(uniqueValidator);

/** primary selection object
 * for expense
 */
const expenseselect = {
  urId: 1,
  name: 1,
  person: 1,
  cost: 1,
  category: 1,
  items: 1
};

/** main connection for expenses Operations*/
export let expenseMain: Model<Texpense>;
/** lean connection for expenses Operations*/
export let expenseLean: Model<Texpense>;
/** primary selection object
 * for expense
 */
/** */
export const expenseSelect = expenseselect;

/** */
/**
 * Creates an expense model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the model for the main connection.
 * @param lean Whether to create the model for the lean connection.
 */
export const createExpenseModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl);
  }

  if (main) {
    expenseMain = mainConnection.model<Texpense>('Expense', expenseSchema);
  }

  if (lean) {
    expenseLean = mainConnectionLean.model<Texpense>('Expense', expenseSchema);
  }
};
