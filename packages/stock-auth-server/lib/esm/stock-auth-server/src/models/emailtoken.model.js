import { Schema } from 'mongoose';
import { connectAuthDatabase, isAuthDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const emailtokenSchema = new Schema({
    userId: { type: String },
    token: { type: String, unique: true }
}, { timestamps: true });
// Apply the uniqueValidator plugin to emailtokenSchema.
emailtokenSchema.plugin(uniqueValidator);
/**
 * Represents the email token model.
 */
export let emailtoken;
/**
 * Represents a lean version of the email token model.
 */
export let emailtokenLean;
/**
 * Creates an email token model with the given database URL, main flag, and lean flag.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the main email token model.
 * @param lean Whether to create the lean email token model.
 */
export const createEmailtokenModel = async (dbUrl, main = true, lean = true) => {
    if (!isAuthDbConnected) {
        await connectAuthDatabase(dbUrl);
    }
    if (main) {
        emailtoken = mainConnection.model('emailtoken', emailtokenSchema);
    }
    if (lean) {
        emailtokenLean = mainConnectionLean.model('emailtoken', emailtokenSchema);
    }
};
//# sourceMappingURL=emailtoken.model.js.map