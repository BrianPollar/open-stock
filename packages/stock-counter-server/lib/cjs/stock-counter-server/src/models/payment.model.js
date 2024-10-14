"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentModel = exports.paymentSelect = exports.paymentLean = exports.paymentMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const paymentSchema = new mongoose_1.Schema({
    companyId: { type: mongoose_1.Schema.Types.ObjectId, required: [true, 'cannot be empty.'], index: true },
    paymentRelated: { type: mongoose_1.Schema.Types.ObjectId, unique: true },
    invoiceRelated: { type: mongoose_1.Schema.Types.ObjectId, unique: true },
    order: { type: String }
}, { timestamps: true, collection: 'payments' });
// Apply the uniqueValidator plugin to paymentSchema.
paymentSchema.plugin(uniqueValidator);
paymentSchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
paymentSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
/** primary selection object
 * for payment
 */
const paymentselect = {
    companyId: 1,
    paymentRelated: 1,
    invoiceRelated: 1,
    order: 1
};
/**
 * Represents a payment select function.
 */
exports.paymentSelect = paymentselect;
/**
 * Creates a payment model with the specified database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the payment model for the main connection.
 * @param lean Whether to create the payment model for the lean connection.
 */
const createPaymentModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(paymentSchema);
    if (!stock_universal_server_1.isDbConnected) {
        await (0, stock_universal_server_1.connectDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.paymentMain = stock_universal_server_1.mainConnection
            .model('Payment', paymentSchema);
    }
    if (lean) {
        exports.paymentLean = stock_universal_server_1.mainConnectionLean
            .model('Payment', paymentSchema);
    }
};
exports.createPaymentModel = createPaymentModel;
//# sourceMappingURL=payment.model.js.map