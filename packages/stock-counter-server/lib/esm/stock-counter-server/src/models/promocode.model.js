import { connectDatabase, createExpireDocIndex, isDbConnected, mainConnection, mainConnectionLean, preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');
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
const promocodeSchema = new Schema({
    ...withUrIdAndCompanySchemaObj,
    code: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    items: [{ type: Schema.Types.ObjectId, required: [true, 'cannot be empty.'] }],
    amount: {
        type: Number,
        required: [true, 'cannot be empty.'],
        min: [0, 'cannot be negative.']
    },
    roomId: { type: String, required: [true, 'cannot be empty.'] },
    state: { type: String, default: 'virgin' },
    expireAt: { type: String },
    currency: { type: String, default: 'USD' }
}, { timestamps: true, collection: 'promocodes' });
promocodeSchema.index({ expireAt: 1 }, { expireAfterSeconds: 3600 }); // after 1 hour
// Apply the uniqueValidator plugin to promocodeSchema.
promocodeSchema.plugin(uniqueValidator);
promocodeSchema.pre('updateOne', function (next) {
    return preUpdateDocExpire(this, next);
});
promocodeSchema.pre('updateMany', function (next) {
    return preUpdateDocExpire(this, next);
});
/** primary selection object
 * for promocode
 */
const promocodeselect = {
    ...withUrIdAndCompanySelectObj,
    code: 1,
    amount: 1,
    items: 1,
    roomId: 1,
    used: 1,
    currency: 1
};
/**
 * The main promocode model.
 */
export let promocodeMain;
/**
 * Represents a lean version of the promocode model.
 */
export let promocodeLean;
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
export const createPromocodeModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    createExpireDocIndex(promocodeSchema);
    if (!isDbConnected) {
        await connectDatabase(dbUrl, dbOptions);
    }
    if (main) {
        promocodeMain = mainConnection
            .model('promocode', promocodeSchema);
    }
    if (lean) {
        promocodeLean = mainConnectionLean
            .model('promocode', promocodeSchema);
    }
};
//# sourceMappingURL=promocode.model.js.map