import { Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/** model type for itemLimitted by */
/** */
export interface IitemLimitted
extends Document {
  urId: string;
  name: string;
}

const itemLimittedSchema: Schema<IitemLimitted> = new Schema({
  urId: { type: String, unique: true },
  name: { type: String }
}, { timestamps: true });

// Apply the uniqueValidator plugin to userSchema.
itemLimittedSchema.plugin(uniqueValidator);

/** primary selection object
 * for itemLimitted
 */
const itemLimittedselect = {
  urId: 1,
  name: 1
};

/** main connection for itemLimitteds Operations*/
export let itemLimittedMain: Model<IitemLimitted>;
/** lean connection for itemLimitteds Operations*/
export let itemLimittedLean: Model<IitemLimitted>;
/** primary selection object
 * for itemLimitted
 */
/** */
export const itemLimittedSelect = itemLimittedselect;

/** */
/**
 * Creates an ItemLimitted model with the specified database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the model for the main connection.
 * @param lean Whether to create the model for the lean connection.
 */
export const createItemLimittedModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl);
  }

  if (main) {
    itemLimittedMain = mainConnection.model<IitemLimitted>('ItemLimitted', itemLimittedSchema);
  }

  if (lean) {
    itemLimittedLean = mainConnectionLean.model<IitemLimitted>('ItemLimitted', itemLimittedSchema);
  }
};
