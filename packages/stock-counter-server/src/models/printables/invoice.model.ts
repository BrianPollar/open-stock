/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
import { IinvoiceRelatedRef } from '@open-stock/stock-universal';
import { createExpireDocIndex, preUpdateDocExpire, withCompanySchemaObj } from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../utils/database';

/**
 * Represents a printable invoice.
 * @typedef {Document & IinvoiceRelatedRef & { dueDate: Date }} Tinvoice
 */
export type Tinvoice = Document & IinvoiceRelatedRef & { dueDate: Date };

const invoiceSchema: Schema<Tinvoice> = new Schema({
  ...withCompanySchemaObj,
  invoiceRelated: { type: String },
  dueDate: { type: Date }
}, { timestamps: true, collection: 'invoices' });

invoiceSchema.pre('updateOne', function(next) {
  return preUpdateDocExpire(this, next);
});

invoiceSchema.pre('updateMany', function(next) {
  return preUpdateDocExpire(this, next);
});


/** primary selection object
 * for invoice
 */
const invoiceselect = {
  trackEdit: 1,
  trackView: 1,
  companyId: 1,
  invoiceRelated: 1,
  dueDate: 1
};

/**
 * Represents the main invoice model.
 */
export let invoiceMain: Model<Tinvoice>;

/**
 * Represents a lean invoice model.
 */
export let invoiceLean: Model<Tinvoice>;

/**
 * Represents the invoice select function.
 */
export const invoiceSelect = invoiceselect;

/**
 * Creates an invoice model with the given database URL, main flag, and lean flag.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main invoice model.
 * @param lean Whether to create the lean invoice model.
 */
export const createInvoiceModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  createExpireDocIndex(invoiceSchema);
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl, dbOptions);
  }

  if (main) {
    invoiceMain = mainConnection.model<Tinvoice>('Invoice', invoiceSchema);
  }

  if (lean) {
    invoiceLean = mainConnectionLean.model<Tinvoice>('Invoice', invoiceSchema);
  }
};

