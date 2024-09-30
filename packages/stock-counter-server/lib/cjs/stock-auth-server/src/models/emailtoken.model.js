"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmailtokenModel = exports.emailtokenLean = exports.emailtoken = void 0;
const mongoose_1 = require("mongoose");
const database_1 = require("../utils/database");
const uniqueValidator = require('mongoose-unique-validator');
const emailtokenSchema = new mongoose_1.Schema({
    userId: { type: String },
    token: { type: String, unique: true }
}, { timestamps: true, collection: 'emailtokens' });
// Apply the uniqueValidator plugin to emailtokenSchema.
emailtokenSchema.plugin(uniqueValidator);
/**
 * Creates an email token model with the given database URL, main flag, and lean flag.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main email token model.
 * @param lean Whether to create the lean email token model.
 */
const createEmailtokenModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!database_1.isAuthDbConnected) {
        await (0, database_1.connectAuthDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.emailtoken = database_1.mainConnection
            .model('emailtoken', emailtokenSchema);
    }
    if (lean) {
        exports.emailtokenLean = database_1.mainConnectionLean
            .model('emailtoken', emailtokenSchema);
    }
};
exports.createEmailtokenModel = createEmailtokenModel;
//# sourceMappingURL=emailtoken.model.js.map