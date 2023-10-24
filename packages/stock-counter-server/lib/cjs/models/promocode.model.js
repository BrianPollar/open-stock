"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPromocodeModel = exports.promocodeSelect = exports.promocodeLean = exports.promocodeMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const promocodeSchema = new mongoose_1.Schema({
    urId: { type: String, unique: true },
    code: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    items: [{ type: String, required: [true, 'cannot be empty.'] }],
    amount: { type: Number, required: [true, 'cannot be empty.'] },
    roomId: { type: String, required: [true, 'cannot be empty.'] },
    state: { type: String, default: 'virgin' },
    expireAt: { type: String }
}, { timestamps: true });
promocodeSchema.index({ expireAt: 1 }, { expireAfterSeconds: 3600 }); // after 1 hour
// Apply the uniqueValidator plugin to promocodeSchema.
promocodeSchema.plugin(uniqueValidator);
/** primary selection object
 * for promocode
 */
const promocodeselect = {
    urId: 1,
    code: 1,
    amount: 1,
    items: 1,
    roomId: 1,
    used: 1
};
/** primary selection object
 * for promocode
 */
/** */
exports.promocodeSelect = promocodeselect;
/** */
const createPromocodeModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
    }
    if (main) {
        exports.promocodeMain = database_controller_1.mainConnection.model('promocode', promocodeSchema);
    }
    if (lean) {
        exports.promocodeLean = database_controller_1.mainConnectionLean.model('promocode', promocodeSchema);
    }
};
exports.createPromocodeModel = createPromocodeModel;
//# sourceMappingURL=promocode.model.js.map