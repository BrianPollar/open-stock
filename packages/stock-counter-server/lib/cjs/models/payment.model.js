"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentModel = exports.paymentSelect = exports.paymentLean = exports.paymentMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const paymentSchema = new mongoose_1.Schema({
    paymentRelated: { type: String, unique: true },
    invoiceRelated: { type: String, unique: true },
    order: { type: String }
}, { timestamps: true });
// Apply the uniqueValidator plugin to paymentSchema.
paymentSchema.plugin(uniqueValidator);
/** primary selection object
 * for payment
 */
const paymentselect = {
    paymentRelated: 1,
    invoiceRelated: 1,
    order: 1
};
/** primary selection object
 * for payment
 */
/** */
exports.paymentSelect = paymentselect;
/** */
const createPaymentModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
    }
    if (main) {
        exports.paymentMain = database_controller_1.mainConnection.model('Payment', paymentSchema);
    }
    if (lean) {
        exports.paymentLean = database_controller_1.mainConnectionLean.model('Payment', paymentSchema);
    }
};
exports.createPaymentModel = createPaymentModel;
//# sourceMappingURL=payment.model.js.map