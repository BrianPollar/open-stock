import { connectDatabase, isDbConnected, mainConnection, mainConnectionLean } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');
const emailtokenSchema = new Schema({
    userId: { type: Schema.Types.ObjectId },
    token: { type: String, unique: true }
}, { timestamps: true, collection: 'emailtokens' });
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
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main email token model.
 * @param lean Whether to create the lean email token model.
 */
export const createEmailtokenModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!isDbConnected) {
        await connectDatabase(dbUrl, dbOptions);
    }
    if (main) {
        emailtoken = mainConnection
            .model('emailtoken', emailtokenSchema);
    }
    if (lean) {
        emailtokenLean = mainConnectionLean
            .model('emailtoken', emailtokenSchema);
    }
};
//# sourceMappingURL=emailtoken.model.js.map