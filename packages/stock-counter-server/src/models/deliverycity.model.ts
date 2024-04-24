import { Ideliverycity } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents a delivery city.
 * @typedef {Document & Ideliverycity} Tdeliverycity
 */
export type Tdeliverycity = Document & Ideliverycity;

const deliverycitySchema: Schema<Tdeliverycity> = new Schema({
  name: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
  companyId: { type: String, required: [true, 'cannot be empty.'], index: true },
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
  companyId: 1,
  name: 1,
  shippingCost: 1,
  currency: 1,
  deliversInDays: 1
};

/**
 * Represents the main delivery city model.
 */
export let deliverycityMain: Model<Tdeliverycity>;

/**
 * Represents a variable that holds a lean model of the delivery city.
 */
export let deliverycityLean: Model<Tdeliverycity>;

/**
 * Represents the selection of delivery cities.
 */
export const deliverycitySelect = deliverycityselect;

/**
 * Creates a delivery city model with the specified database URL, main connection and lean connection.
 * @param dbUrl The database URL to connect to.
 * @param main Whether to create a main connection or not.
 * @param lean Whether to create a lean connection or not.
 */
export const createDeliverycityModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl, dbOptions);
  }

  if (main) {
    deliverycityMain = mainConnection.model<Tdeliverycity>('Deliverycity', deliverycitySchema);
  }

  if (lean) {
    deliverycityLean = mainConnectionLean.model<Tdeliverycity>('Deliverycity', deliverycitySchema);
  }
};
