"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmailtokenModel = exports.emailtokenLean = exports.emailtoken = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../controllers/database.controller");
/** */
const uniqueValidator = require('mongoose-unique-validator');
const emailtokenSchema = new mongoose_1.Schema({
    userId: { type: String },
    token: { type: String, unique: true }
}, { timestamps: true });
// Apply the uniqueValidator plugin to emailtokenSchema.
emailtokenSchema.plugin(uniqueValidator);
/** */
const createEmailtokenModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isAuthDbConnected) {
        await (0, database_controller_1.connectAuthDatabase)(dbUrl);
    }
    if (main) {
        exports.emailtoken = database_controller_1.mainConnection.model('emailtoken', emailtokenSchema);
    }
    if (lean) {
        exports.emailtokenLean = database_controller_1.mainConnectionLean.model('emailtoken', emailtokenSchema);
    }
};
exports.createEmailtokenModel = createEmailtokenModel;
//# sourceMappingURL=emailtoken.model.js.map