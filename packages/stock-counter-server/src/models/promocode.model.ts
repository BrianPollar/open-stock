import { Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/** model interface for promocode by*/
/** */
export interface Ipromocode extends Document {
  urId: string;
  code: string;
  amount: number;
  items: string[];
  roomId: string;
  state: string;
  expireAt: string;
}

/**
 * Defines the schema for the promocode model.
 * @param {string} urId - The unique identifier for the promocode.
 * @param {string} code - The unique code for the promocode.
 * @param {string[]} items - The items associated with the promocode.
 * @param {number} amount - The amount of the promocode.
 * @param {string} roomId - The room identifier for the promocode.
 * @param {string} state - The state of the promocode.
 * @param {string} expireAt - The expiration date of the promocode.
 * @param {boolean} timestamps - The timestamps for the promocode.
 */
const promocodeSchema: Schema<Ipromocode> = new Schema({
  urId: { type: String, unique: true },
  code: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
  items: [{ type: String, required: [true, 'cannot be empty.'] }],
  amount: { type: Number, required: [true, 'cannot be empty.'] },
  roomId: { type: String, required: [true, 'cannot be empty.'] },
  state: { type: String, default: 'virgin' },
  expireAt: { type: String }
}, { timestamps: true });

promocodeSchema.index({ expireAt: 1 },
  { expireAfterSeconds: 3600 }); // after 1 hour

// Apply the uniqueValidator plugin to promocodeSchema.
promocodeSchema.plugin(uniqueValidator);

/** primary selection object
 * for promocode
 */
const promocodeselect = {
  urId: 1,
  code: 1,
  amount: 1,
  items: 1,
  roomId: 1,
  used: 1
};

/** main connection for promocodes Operations*/
export let promocodeMain: Model<Ipromocode>;
/** lean connection for promocodes Operations*/
export let promocodeLean: Model<Ipromocode>;
/** primary selection object
 * for promocode
 */
/** */
export const promocodeSelect = promocodeselect;

/** */
export const createPromocodeModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl);
  }

  if (main) {
    promocodeMain = mainConnection.model<Ipromocode>('promocode', promocodeSchema);
  }

  if (lean) {
    promocodeLean = mainConnectionLean.model<Ipromocode>('promocode', promocodeSchema);
  }
};
