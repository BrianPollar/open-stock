import { Schema } from 'mongoose';
import { connectAuthDatabase, isAuthDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
/** */
const uniqueValidator = require('mongoose-unique-validator');
const emailtokenSchema = new Schema({
    userId: { type: String },
    token: { type: String, unique: true }
}, { timestamps: true });
// Apply the uniqueValidator plugin to emailtokenSchema.
emailtokenSchema.plugin(uniqueValidator);
export let emailtoken;
export let emailtokenLean;
/** */
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