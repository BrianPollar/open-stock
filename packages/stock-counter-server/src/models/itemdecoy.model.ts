import { Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/** model type for itemDecoy by */
/** */
export interface IitemDecoy
extends Document {
  urId: string;
  type: string;
  items: string[];
}

const itemDecoySchema: Schema<IitemDecoy> = new Schema({
  urId: { type: String, unique: true },
  type: { type: String },
  items: []
}, { timestamps: true });

// Apply the uniqueValidator plugin to userSchema.
itemDecoySchema.plugin(uniqueValidator);

/** primary selection object
 * for itemDecoy
 */
const itemDecoyselect = {
  urId: 1,
  type: 1,
  items: 1
};

/** main connection for itemDecoys Operations*/
export let itemDecoyMain: Model<IitemDecoy>;
/** lean connection for itemDecoys Operations*/
export let itemDecoyLean: Model<IitemDecoy>;
/** primary selection object
 * for itemDecoy
 */
/** */
export const itemDecoySelect = itemDecoyselect;

/** */
/**
 * Creates an ItemDecoy model with the specified database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the main connection or not. Defaults to true.
 * @param lean Whether to create the lean connection or not. Defaults to true.
 */
export const createItemDecoyModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl);
  }

  if (main) {
    itemDecoyMain = mainConnection.model<IitemDecoy>('ItemDecoy', itemDecoySchema);
  }

  if (lean) {
    itemDecoyLean = mainConnectionLean.model<IitemDecoy>('ItemDecoy', itemDecoySchema);
  }
};
