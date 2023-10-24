import { Document, Model, Schema } from 'mongoose';
import { Ideliverycity } from '@open-stock/stock-universal';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/** model type for deliverycity*/
/** */
export type Tdeliverycity = Document & Ideliverycity;

const deliverycitySchema: Schema<Tdeliverycity> = new Schema({
  name: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
  shippingCost: { type: Number, required: [true, 'cannot be empty.'] },
  currency: { type: String, required: [true, 'cannot be empty.'] },
  deliversInDays: { type: Number, required: [true, 'cannot be empty.'] }
}, { timestamps: true });

// Apply the uniqueValidator plugin to deliverycitySchema.
deliverycitySchema.plugin(uniqueValidator);

/** primary selection object
 * for deliverycity
 */
const deliverycityselect = {
  name: 1,
  shippingCost: 1,
  currency: 1,
  deliversInDays: 1
};

/** main connection for deliverycitys Operations*/
export let deliverycityMain: Model<Tdeliverycity>;
/** lean connection for deliverycitys Operations*/
export let deliverycityLean: Model<Tdeliverycity>;
/** primary selection object
 * for deliverycity
 */
/** */
export const deliverycitySelect = deliverycityselect;

/** */
/**
 * Creates a delivery city model with the specified database URL, main connection and lean connection.
 * @param dbUrl The database URL to connect to.
 * @param main Whether to create a main connection or not.
 * @param lean Whether to create a lean connection or not.
 */
export const createDeliverycityModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl);
  }

  if (main) {
    deliverycityMain = mainConnection.model<Tdeliverycity>('Deliverycity', deliverycitySchema);
  }

  if (lean) {
    deliverycityLean = mainConnectionLean.model<Tdeliverycity>('Deliverycity', deliverycitySchema);
  }
};
