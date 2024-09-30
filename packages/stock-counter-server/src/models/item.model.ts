import { Iitem } from '@open-stock/stock-universal';
import {
  createExpireDocIndex, preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj
} from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../utils/database';
const uniqueValidator = require('mongoose-unique-validator');

export type TitemModel = Document & Iitem;

const itemSchema: Schema = new Schema({
  ...withUrIdAndCompanySchemaObj,
  numbersInstock: { type: Number, required: [true, 'cannot be empty.'], index: true },
  name: { type: String, required: [true, 'cannot be empty.'], index: true },
  category: { type: String },
  subCategory: { type: String },
  state: { type: String },
  photos: [],
  video: { type: String },
  colors: [],
  model: { type: String },
  origin: { type: String },
  anyKnownProblems: { type: String },
  costMeta: { },
  description: { type: String },
  numberBought: { type: Number, default: 0 },
  sponsored: [{ type: String }],
  buyerGuarantee: { type: String },
  reviewedBy: [],
  reviewCount: { type: Number, default: 0, index: true },
  reviewWeight: { type: Number, default: 0 },
  reviewRatingsTotal: { type: Number, default: 0, index: true },
  likes: [],
  likesCount: { type: Number, default: 0, index: true },
  timesViewed: { type: Number, default: 0, index: true },
  inventoryMeta: [],
  brand: { type: String },
  ecomerceCompat: { type: Boolean, default: false },
  soldCount: { type: Number, default: 0, index: true } // TODO update fields related to this

}, { timestamps: true, collection: 'items' });

itemSchema.index({ createdAt: -1 });

// Apply the uniqueValidator plugin to itemSchema.
itemSchema.plugin(uniqueValidator);

itemSchema.pre('updateOne', function(next) {
  return preUpdateDocExpire(this, next);
});

itemSchema.pre('updateMany', function(next) {
  return preUpdateDocExpire(this, next);
});


/** Primary selection object for item */
const itemselect = {
  ...withUrIdAndCompanySelectObj,
  numbersInstock: 1,
  name: 1,
  purchase: 1,
  subCategory: 1,
  category: 1,
  state: 1,
  photos: 1,
  colors: 1,
  model: 1,
  origin: 1,
  anyKnownProblems: 1,
  createdAt: 1,
  updatedAt: 1,
  costMeta: 1,
  description: 1,
  numberBought: 1,
  sponsored: 1,
  sizing: 1,
  buyerGuarantee: 1,
  reviewedBy: 1,
  reviewCount: 1,
  reviewWeight: 1,
  reviewRatingsTotal: 1,
  likes: 1,
  likesCount: 1,
  timesViewed: 1,
  brand: 1,
  inventoryMeta: 1,
  ecomerceCompat: 1,
  soldCount: 1
};

/**
 * Represents the main item model.
 */
export let itemMain: Model<Iitem>;

/**
 * Represents the lean version of the item model.
 */
export let itemLean: Model<Iitem>;

/**
 * Represents the item select function.
 */
export const itemSelect = itemselect;

/**
 * Creates the item model and connects to the database.
 * @param dbUrl - The URL of the database to connect to
 * @param main - Whether to create the main connection for item operations (default: true)
 * @param lean - Whether to create the lean connection for item operations (default: true)
 */
export const createItemModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  createExpireDocIndex(itemSchema);
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl, dbOptions);
  }

  if (main) {
    itemMain = mainConnection
      .model<Iitem>('Item', itemSchema);
  }

  if (lean) {
    itemLean = mainConnectionLean
      .model<Iitem>('Item', itemSchema);
  }
};
