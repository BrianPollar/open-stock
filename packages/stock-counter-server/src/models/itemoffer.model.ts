import { Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/** model type for itemOffer by */
/** */
export interface IitemOffer
extends Document {
  urId: string;
  items: string[];
  expireAt: Date;
  type: string;
  header: string;
  subHeader: string;
  ammount: number;
}

const itemOfferSchema: Schema<IitemOffer> = new Schema({
  urId: { type: String, unique: true },
  items: [],
  expireAt: { type: Date },
  type: { type: String },
  header: { type: String },
  subHeader: { type: String },
  ammount: { type: Number }
}, { timestamps: true });

itemOfferSchema.index({ expireAt: 1 },
  { expireAfterSeconds: 2628003 });

// Apply the uniqueValidator plugin to itemOfferSchema.
itemOfferSchema.plugin(uniqueValidator);

/** primary selection object
 * for itemOffer
 */
const itemOfferselect = {
  urId: 1,
  items: 1,
  expireAt: 1,
  type: 1,
  header: 1,
  subHeader: 1,
  ammount: 1
};

/** main connection for itemOffers Operations*/
export let itemOfferMain: Model<IitemOffer>;
/** lean connection for itemOffers Operations*/
export let itemOfferLean: Model<IitemOffer>;
/** primary selection object
 * for itemOffer
 */
/** */
export const itemOfferSelect = itemOfferselect;

/** */
/**
 * Creates an instance of the ItemOffer model with the specified database URL.
 * @param {string} dbUrl - The URL of the database to connect to.
 * @param {boolean} [main=true] - Whether to create the main connection model.
 * @param {boolean} [lean=true] - Whether to create the lean connection model.
 * @returns {Promise<void>} - A promise that resolves when the models have been created.
 */
export const createItemOfferModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl);
  }

  if (main) {
    itemOfferMain = mainConnection.model<IitemOffer>('ItemOffer', itemOfferSchema);
  }

  if (lean) {
    itemOfferLean = mainConnectionLean.model<IitemOffer>('ItemOffer', itemOfferSchema);
  }
};
