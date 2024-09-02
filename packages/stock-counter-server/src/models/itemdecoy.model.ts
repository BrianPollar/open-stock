import { ItrackStamp } from '@open-stock/stock-universal';
import { createExpireDocIndex, preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj } from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../utils/database';
const uniqueValidator = require('mongoose-unique-validator');

/** model type for itemDecoy by */
/**
 * Represents an item decoy in the system.
 */
export interface IitemDecoy extends Document, ItrackStamp {
  expireDocAfterTime: Date;

  /**
   * The unique identifier of the user.
   */
  urId: string;

  /**
   * The user's company ID.
   */
  companyId: string;

  /**
   * The type of the item decoy.
   */
  type: string;

  /**
   * The list of items associated with the decoy.
   */
  items: string[];
}

const itemDecoySchema: Schema<IitemDecoy> = new Schema({
  ...withUrIdAndCompanySchemaObj,
  type: { type: String },
  items: []
}, { timestamps: true, collection: 'itemdecoys' });

// Apply the uniqueValidator plugin to userSchema.
itemDecoySchema.plugin(uniqueValidator);

itemDecoySchema.pre('updateOne', function(next) {
  return preUpdateDocExpire(this, next);
});

itemDecoySchema.pre('updateMany', function(next) {
  return preUpdateDocExpire(this, next);
});


/** primary selection object
 * for itemDecoy
 */
const itemDecoyselect = {
  ...withUrIdAndCompanySelectObj,
  type: 1,
  items: 1
};

/**
 * Represents the main item decoy model.
 */
export let itemDecoyMain: Model<IitemDecoy>;

/**
 * Represents the itemDecoyLean model.
 */
export let itemDecoyLean: Model<IitemDecoy>;

/**
 * Selects the item decoy.
 */
export const itemDecoySelect = itemDecoyselect;

/**
 * Creates an ItemDecoy model with the specified database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection or not. Defaults to true.
 * @param lean Whether to create the lean connection or not. Defaults to true.
 */
export const createItemDecoyModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  createExpireDocIndex(itemDecoySchema);
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl, dbOptions);
  }

  if (main) {
    itemDecoyMain = mainConnection.model<IitemDecoy>('ItemDecoy', itemDecoySchema);
  }

  if (lean) {
    itemDecoyLean = mainConnectionLean.model<IitemDecoy>('ItemDecoy', itemDecoySchema);
  }
};

