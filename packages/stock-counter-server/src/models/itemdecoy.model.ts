import { Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/** model type for itemDecoy by */
/**
 * Represents an item decoy in the system.
 */
export interface IitemDecoy extends Document {
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
  urId: { type: String, unique: true },
  companyId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
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
  companyId: 1,
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

