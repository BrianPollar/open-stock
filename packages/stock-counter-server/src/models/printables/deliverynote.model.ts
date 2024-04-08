/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
import { IinvoiceRelatedRef, IurId } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents a delivery note.
 * @typedef {Document & IurId & IinvoiceRelatedRef} TdeliveryNote
 */
export type TdeliveryNote = Document & IurId & IinvoiceRelatedRef;

const deliveryNoteSchema: Schema<TdeliveryNote> = new Schema({
  urId: { type: String, unique: true },
  companyId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
  invoiceRelated: { type: String, unique: true }
}, { timestamps: true });

// Apply the uniqueValidator plugin to deliveryNoteSchema.
deliveryNoteSchema.plugin(uniqueValidator);

/** primary selection object
 * for deliveryNote
 */
const deliveryNoteselect = {
  urId: 1,
  companyId: 1,
  invoiceRelated: 1
};

/**
 * Represents the main delivery note model.
 */
export let deliveryNoteMain: Model<TdeliveryNote>;

/**
 * Represents a lean delivery note model.
 */
export let deliveryNoteLean: Model<TdeliveryNote>;

/**
 * Selects the delivery note.
 */
export const deliveryNoteSelect = deliveryNoteselect;


/**
 * Creates a delivery note model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection or not. Defaults to true.
 * @param lean Whether to create the lean connection or not. Defaults to true.
 */
export const createDeliveryNoteModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl, dbOptions);
  }

  if (main) {
    deliveryNoteMain = mainConnection.model<TdeliveryNote>('DeliveryNote', deliveryNoteSchema);
  }

  if (lean) {
    deliveryNoteLean = mainConnectionLean.model<TdeliveryNote>('DeliveryNote', deliveryNoteSchema);
  }
};
