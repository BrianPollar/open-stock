import mongoose, { Document, Model, Schema } from 'mongoose';
import { Istaff } from '@open-stock/stock-universal';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents a staff member.
 * @typedef {Document & Istaff} Tstaff
 */
export type Tstaff = Document & Istaff;

/** Defines the schema for the staff model. */
const staffSchema: Schema<Tstaff> = new Schema({
  companyId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
  user: { type: mongoose.Types.ObjectId, unique: true, required: [true, 'cannot be empty.'], index: true },
  startDate: { type: Date, required: [true, 'cannot be empty.'] },
  endDate: { type: Date, required: [true, 'cannot be empty.'] },
  occupation: { type: String },
  employmentType: { type: String },
  salary: { }
}, { timestamps: true });

// Apply the uniqueValidator plugin to staffSchema.
staffSchema.plugin(uniqueValidator);

/** Defines the primary selection object for staff. */
const staffselect = {
  companyId: 1,
  user: 1,
  startDate: 1,
  endDate: 1,
  occupation: 1,
  employmentType: 1,
  salary: 1
};

/**
 * The main staff model.
 */
export let staffMain: Model<Tstaff>;

/**
 * Represents a lean staff model.
 */
export let staffLean: Model<Tstaff>;

/** Defines the primary selection object for staff. */
/**
 * The staffSelect constant represents the selection of staff members.
 */
export const staffSelect = staffselect;

/**
 * Creates a new staff model with the given database URL.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the main connection for staff operations.
 * @param lean Whether to create the lean connection for staff operations.
 */
export const createStaffModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl);
  }

  if (main) {
    staffMain = mainConnection.model<Tstaff>('Staff', staffSchema);
  }

  if (lean) {
    staffLean = mainConnectionLean.model<Tstaff>('Staff', staffSchema);
  }
};


