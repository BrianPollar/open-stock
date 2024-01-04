import { Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents an item offer.
 */
export interface IitemOffer
extends Document {
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
  urId: { type: String, unique: true },
  companyId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
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
  companyId: 1,
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
