import { ItrackStamp } from '@open-stock/stock-universal';
import { createExpireDocIndex, preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj } from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../utils/database';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents an item offer.
 */
export interface IitemOffer
extends Document, ItrackStamp {

  /** The user's ID. */
  urId: string;

  /** The user's company ID. */
  companyId: string;

  /** The list of items in the offer. */
  items: string[];

  /** The expiration date of the offer. */
  expireAt: Date;

  /** The type of the offer. */
  type: string;

  /** The header of the offer. */
  header: string;

  /** The subheader of the offer. */
  subHeader: string;

  /** The amount of the offer. */
  ammount: number;
}

const itemOfferSchema: Schema<IitemOffer> = new Schema({
  ...withUrIdAndCompanySchemaObj,
  items: [],
  expireAt: { type: Date },
  type: { type: String },
  header: { type: String },
  subHeader: { type: String },
  ammount: { type: Number }
}, { timestamps: true, collection: 'itemoffers' });

itemOfferSchema.index(
  { expireAt: 1 },
  { expireAfterSeconds: 2628003 }
);

// Apply the uniqueValidator plugin to itemOfferSchema.
itemOfferSchema.plugin(uniqueValidator);

itemOfferSchema.pre('updateOne', function(next) {
  return preUpdateDocExpire(this, next);
});

itemOfferSchema.pre('updateMany', function(next) {
  return preUpdateDocExpire(this, next);
});


/** primary selection object
 * for itemOffer
 */
const itemOfferselect = {
  ...withUrIdAndCompanySelectObj,
  items: 1,
  expireAt: 1,
  type: 1,
  header: 1,
  subHeader: 1,
  ammount: 1
};

/**
 * Represents the main item offer model.
 */
export let itemOfferMain: Model<IitemOffer>;

/**
 * Represents a lean item offer model.
 */
export let itemOfferLean: Model<IitemOffer>;

/**
 * Represents the item offer select function.
 */
export const itemOfferSelect = itemOfferselect;

/**
 * Creates an instance of the ItemOffer model with the specified database URL.
 * @param {string} dbUrl - The URL of the database to connect to.
 * @param {boolean} [main=true] - Whether to create the main connection model.
 * @param {boolean} [lean=true] - Whether to create the lean connection model.
 * @returns {Promise<void>} - A promise that resolves when the models have been created.
 */
export const createItemOfferModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  createExpireDocIndex(itemOfferSchema);
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl, dbOptions);
  }

  if (main) {
    itemOfferMain = mainConnection.model<IitemOffer>('ItemOffer', itemOfferSchema);
  }

  if (lean) {
    itemOfferLean = mainConnectionLean.model<IitemOffer>('ItemOffer', itemOfferSchema);
  }
};
