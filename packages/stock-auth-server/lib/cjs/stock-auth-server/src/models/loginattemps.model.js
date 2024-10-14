"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLoginAtemptsModel = exports.loginAtemptsLean = exports.loginAtempts = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const loginAtempsSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, index: true },
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
    if (!stock_universal_server_1.isDbConnected) {
        await (0, stock_universal_server_1.connectDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.loginAtempts = stock_universal_server_1.mainConnection
            .model('loginAtempts', loginAtempsSchema);
    }
    if (lean) {
        exports.loginAtemptsLean = stock_universal_server_1.mainConnectionLean
            .model('loginAtempts', loginAtempsSchema);
    }
};
exports.createLoginAtemptsModel = createLoginAtemptsModel;
//# sourceMappingURL=loginattemps.model.js.map