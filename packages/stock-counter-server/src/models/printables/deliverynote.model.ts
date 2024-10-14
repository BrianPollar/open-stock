/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
import { IinvoiceRelatedRef } from '@open-stock/stock-universal';
import {
  IcompanyIdAsObjectId,
  connectDatabase,
  createExpireDocIndex,
  isDbConnected, mainConnection, mainConnectionLean,
  preUpdateDocExpire,
  withUrIdAndCompanySchemaObj,
  withUrIdAndCompanySelectObj
} from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents a delivery note.
 * @typedef {Document & IurId & IinvoiceRelatedRef} TdeliveryNote
 */
export type TdeliveryNote = Document & IinvoiceRelatedRef & IcompanyIdAsObjectId;

const deliveryNoteSchema: Schema<TdeliveryNote> = new Schema({
  ...withUrIdAndCompanySchemaObj,
  invoiceRelated: { type: Schema.Types.ObjectId, unique: true }
}, { timestamps: true, collection: 'deliverynotes' });

// Apply the uniqueValidator plugin to deliveryNoteSchema.
deliveryNoteSchema.plugin(uniqueValidator);

deliveryNoteSchema.pre('updateOne', function(next) {
  return preUpdateDocExpire(this, next);
});

deliveryNoteSchema.pre('updateMany', function(next) {
  return preUpdateDocExpire(this, next);
});


/** primary selection object
 * for deliveryNote
 */
const deliveryNoteselect = {
  ...withUrIdAndCompanySelectObj,
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
  createExpireDocIndex(deliveryNoteSchema);
  if (!isDbConnected) {
    await connectDatabase(dbUrl, dbOptions);
  }

  if (main) {
    deliveryNoteMain = mainConnection
      .model<TdeliveryNote>('DeliveryNote', deliveryNoteSchema);
  }

  if (lean) {
    deliveryNoteLean = mainConnectionLean
      .model<TdeliveryNote>('DeliveryNote', deliveryNoteSchema);
  }
};
