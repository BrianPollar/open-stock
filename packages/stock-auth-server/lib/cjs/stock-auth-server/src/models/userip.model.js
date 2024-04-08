"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUseripModel = exports.useripLean = exports.userip = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const useripSchema = new mongoose_1.Schema({
    userOrCompanayId: { type: String },
    greenIps: [],
    redIps: [],
    unverifiedIps: [],
    blocked: {}
}, { timestamps: true });
// Apply the uniqueValidator plugin to useripSchema.
useripSchema.plugin(uniqueValidator);
/**
 * Creates an email token model with the given database URL, main flag, and lean flag.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main email token model.
 * @param lean Whether to create the lean email token model.
 */
const createUseripModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!database_controller_1.isAuthDbConnected) {
        await (0, database_controller_1.connectAuthDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.userip = database_controller_1.mainConnection.model('userip', useripSchema);
    }
    if (lean) {
        exports.useripLean = database_controller_1.mainConnectionLean.model('userip', useripSchema);
    }
};
exports.createUseripModel = createUseripModel;
//# sourceMappingURL=userip.model.js.map