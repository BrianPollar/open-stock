/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
import { Document, Model, Schema } from 'mongoose';
import { IinvoiceRelatedRef } from '@open-stock/stock-universal';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../controllers/database.controller';

/** model type for estimate by */
/** */
export type Testimate = Document & IinvoiceRelatedRef;

const estimateSchema: Schema<Testimate> = new Schema({
  invoiceRelated: { type: String }
}, { timestamps: true });

/** primary selection object
 * for estimate
 */
const estimateselect = {
  invoiceRelated: 1
};

/** main connection for estimates Operations*/
export let estimateMain: Model<Testimate>;
/** lean connection for estimates Operations*/
export let estimateLean: Model<Testimate>;
/** primary selection object
 * for estimate
 */
/** */
export const estimateSelect = estimateselect;

/** */
/**
 * Creates an Estimate model with the given database URL, main flag, and lean flag.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - A flag indicating whether to create the main connection model.
 * @param lean - A flag indicating whether to create the lean connection model.
 */
export const createEstimateModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl);
  }

  if (main) {
    estimateMain = mainConnection.model<Testimate>('Estimate', estimateSchema);
  }

  if (lean) {
    estimateLean = mainConnectionLean.model<Testimate>('Estimate', estimateSchema);
  }
};
