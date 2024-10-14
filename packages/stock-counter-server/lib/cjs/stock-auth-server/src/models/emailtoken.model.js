"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmailtokenModel = exports.emailtokenLean = exports.emailtoken = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const emailtokenSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId },
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
    if (!stock_universal_server_1.isDbConnected) {
        await (0, stock_universal_server_1.connectDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.emailtoken = stock_universal_server_1.mainConnection
            .model('emailtoken', emailtokenSchema);
    }
    if (lean) {
        exports.emailtokenLean = stock_universal_server_1.mainConnectionLean
            .model('emailtoken', emailtokenSchema);
    }
};
exports.createEmailtokenModel = createEmailtokenModel;
//# sourceMappingURL=emailtoken.model.js.map