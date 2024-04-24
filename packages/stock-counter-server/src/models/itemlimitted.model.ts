import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents an item with limited quantity.
 */
export interface IitemLimitted
extends Document {
  /** The unique identifier of the user. */
  urId: string;
  /** The user's company ID. */
  companyId: string;
  /** The name of the item. */
  name: string;
}

const itemLimittedSchema: Schema<IitemLimitted> = new Schema({
  urId: { type: String },
  companyId: { type: String, required: [true, 'cannot be empty.'], index: true },
  name: { type: String }
}, { timestamps: true });

// Apply the uniqueValidator plugin to userSchema.
itemLimittedSchema.plugin(uniqueValidator);

/** primary selection object
 * for itemLimitted
 */
const itemLimittedselect = {
  urId: 1,
  companyId: 1,
  name: 1
};

/**
 * Represents the main itemLimitted model.
 */
export let itemLimittedMain: Model<IitemLimitted>;

/**
 * Represents a variable that holds a lean model of an item with limited properties.
 */
export let itemLimittedLean: Model<IitemLimitted>;

/**
 * Represents the itemLimittedSelect function.
 */
export const itemLimittedSelect = itemLimittedselect;

/**
 * Creates an ItemLimitted model with the specified database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the model for the main connection.
 * @param lean Whether to create the model for the lean connection.
 */
export const createItemLimittedModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl, dbOptions);
  }

  if (main) {
    itemLimittedMain = mainConnection.model<IitemLimitted>('ItemLimitted', itemLimittedSchema);
  }

  if (lean) {
    itemLimittedLean = mainConnectionLean.model<IitemLimitted>('ItemLimitted', itemLimittedSchema);
  }
};

