"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLoginAtemptsModel = exports.loginAtemptsLean = exports.loginAtempts = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../controllers/database.controller");
const loginAtempsSchema = new mongoose_1.Schema({
    userId: { type: String, index: true },
    ip: { type: String, index: true },
    successful: { type: Boolean, default: true }
}, { timestamps: true });
/** */
const createLoginAtemptsModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isAuthDbConnected) {
        await (0, database_controller_1.connectAuthDatabase)(dbUrl);
    }
    if (main) {
        exports.loginAtempts = database_controller_1.mainConnection.model('loginAtempts', loginAtempsSchema);
    }
    if (lean) {
        exports.loginAtemptsLean = database_controller_1.mainConnectionLean.model('loginAtempts', loginAtempsSchema);
    }
};
exports.createLoginAtemptsModel = createLoginAtemptsModel;
//# sourceMappingURL=loginattemps.model.js.map