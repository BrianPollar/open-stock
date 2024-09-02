"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLoginAtemptsModel = exports.loginAtemptsLean = exports.loginAtempts = void 0;
const mongoose_1 = require("mongoose");
const database_1 = require("../utils/database");
const loginAtempsSchema = new mongoose_1.Schema({
    userId: { type: String, index: true },
    ip: { type: String, index: true },
    successful: { type: Boolean, default: true }
}, { timestamps: true, collection: 'loginatempts' });
/**
 * Creates a login attempts model with the given database URL.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection model.
 * @param lean Whether to create the lean connection model.
 */
const createLoginAtemptsModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!database_1.isAuthDbConnected) {
        await (0, database_1.connectAuthDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.loginAtempts = database_1.mainConnection.model('loginAtempts', loginAtempsSchema);
    }
    if (lean) {
        exports.loginAtemptsLean = database_1.mainConnectionLean.model('loginAtempts', loginAtempsSchema);
    }
};
exports.createLoginAtemptsModel = createLoginAtemptsModel;
//# sourceMappingURL=loginattemps.model.js.map