import { Schema } from 'mongoose';
import { connectAuthDatabase, isAuthDbConnected, mainConnection, mainConnectionLean } from '../utils/database';
const uniqueValidator = require('mongoose-unique-validator');
const useripSchema = new Schema({
    userOrCompanayId: { type: String },
    greenIps: [],
    redIps: [],
    unverifiedIps: [],
    blocked: {}
}, { timestamps: true, collection: 'userips' });
// Apply the uniqueValidator plugin to useripSchema.
useripSchema.plugin(uniqueValidator);
/**
 * Represents the userip variable.
 */
export let userip;
/**
 * Represents a lean user IP model.
 */
export let useripLean;
/**
 * Creates an email token model with the given database URL, main flag, and lean flag.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main email token model.
 * @param lean Whether to create the lean email token model.
 */
export const createUseripModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!isAuthDbConnected) {
        await connectAuthDatabase(dbUrl, dbOptions);
    }
    if (main) {
        userip = mainConnection.model('userip', useripSchema);
    }
    if (lean) {
        useripLean = mainConnectionLean.model('userip', useripSchema);
    }
};
//# sourceMappingURL=userip.model.js.map