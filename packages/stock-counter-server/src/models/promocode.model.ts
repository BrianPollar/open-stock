import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents a promotional code.
 */
export interface Ipromocode
extends Document {
  /** The unique identifier of the user. */
  urId: string;
  /** The user's company ID. */
  companyId: string;
  /** The code of the promotional code. */
  code: string;
  /** The amount associated with the promotional code. */
  amount: number;
  /** The items associated with the promotional code. */
  items: string[];
  /** The room ID associated with the promotional code. */
  roomId: string;
  /** The state of the promotional code. */
  state: string;
  /** The expiration date of the promotional code. */
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
  urId: { type: String },
  companyId: { type: String, required: [true, 'cannot be empty.'], index: true },
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
  companyId: 1,
  code: 1,
  amount: 1,
  items: 1,
  roomId: 1,
  used: 1
};

/**
 * The main promocode model.
 */
export let promocodeMain: Model<Ipromocode>;

/**
 * Represents a lean version of the promocode model.
 */
export let promocodeLean: Model<Ipromocode>;

/**
 * Selects the promocode from the database.
 * @param promocodeselect - The promocode select query.
 * @returns The selected promocode.
 */
export const promocodeSelect = promocodeselect;

/**
 * Creates a promocode model with the specified database URL.
 * @param dbUrl The URL of the database.
 * @param main Optional parameter indicating whether to create the main promocode model. Default is true.
 * @param lean Optional parameter indicating whether to create the lean promocode model. Default is true.
 */
export const createPromocodeModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl, dbOptions);
  }

  if (main) {
    promocodeMain = mainConnection.model<Ipromocode>('promocode', promocodeSchema);
  }

  if (lean) {
    promocodeLean = mainConnectionLean.model<Ipromocode>('promocode', promocodeSchema);
  }
};

