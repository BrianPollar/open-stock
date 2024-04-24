/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
import { IinvoiceRelatedRef } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../controllers/database.controller';

/**
 * Represents a testimate, which is a document related to an invoice.
 */
export type Testimate = Document & IinvoiceRelatedRef;

const estimateSchema: Schema<Testimate> = new Schema({
  companyId: { type: String, required: [true, 'cannot be empty.'], index: true },
  invoiceRelated: { type: String }
}, { timestamps: true });

/** primary selection object
 * for estimate
 */
const estimateselect = {
  companyId: 1,
  invoiceRelated: 1
};

/**
 * Represents the main estimate model.
 */
export let estimateMain: Model<Testimate>;

/**
 * Represents an estimateLean model.
 */
export let estimateLean: Model<Testimate>;

/**
 * Represents the estimate select function.
 */
export const estimateSelect = estimateselect;

/**
 * Creates an Estimate model with the given database URL, main flag, and lean flag.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - A flag indicating whether to create the main connection model.
 * @param lean - A flag indicating whether to create the lean connection model.
 */
export const createEstimateModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl, dbOptions);
  }

  if (main) {
    estimateMain = mainConnection.model<Testimate>('Estimate', estimateSchema);
  }

  if (lean) {
    estimateLean = mainConnectionLean.model<Testimate>('Estimate', estimateSchema);
  }
};
