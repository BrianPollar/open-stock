/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
import { Document, Model, Schema } from 'mongoose';
import { IinvoiceRelatedRef } from '@open-stock/stock-universal';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../controllers/database.controller';

/** model type for invoice by */
/** */
export type Tinvoice = Document & IinvoiceRelatedRef & { dueDate: Date };

const invoiceSchema: Schema<Tinvoice> = new Schema({
  invoiceRelated: { type: String },
  dueDate: { type: Date }
}, { timestamps: true });

/** primary selection object
 * for invoice
 */
const invoiceselect = {
  invoiceRelated: 1,
  dueDate: 1
};

/** main connection for invoices Operations*/
export let invoiceMain: Model<Tinvoice>;
/** lean connection for invoices Operations*/
export let invoiceLean: Model<Tinvoice>;
/** primary selection object
 * for invoice
 */
/** */
export const invoiceSelect = invoiceselect;

/** */
/**
 * Creates an invoice model with the given database URL, main flag, and lean flag.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the main invoice model.
 * @param lean Whether to create the lean invoice model.
 */
export const createInvoiceModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl);
  }

  if (main) {
    invoiceMain = mainConnection.model<Tinvoice>('Invoice', invoiceSchema);
  }

  if (lean) {
    invoiceLean = mainConnectionLean.model<Tinvoice>('Invoice', invoiceSchema);
  }
};
