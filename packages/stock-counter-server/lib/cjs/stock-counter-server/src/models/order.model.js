"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderModel = exports.orderSelect = exports.orderLean = exports.orderMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const orderSchema = new mongoose_1.Schema({
    companyId: { type: mongoose_1.Schema.Types.ObjectId, required: [true, 'cannot be empty.'], index: true },
    paymentRelated: { type: mongoose_1.Schema.Types.ObjectId, unique: true },
    invoiceRelated: { type: mongoose_1.Schema.Types.ObjectId, unique: true },
    deliveryDate: { type: Date, required: [true, 'cannot be empty.'], index: true }
}, { timestamps: true, collection: 'orders' });
// Apply the uniqueValidator plugin to orderSchema.
orderSchema.plugin(uniqueValidator);
orderSchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
orderSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
/** primary selection object
 * for order
 */
const orderselect = {
    companyId: 1,
    paymentRelated: 1,
    invoiceRelated: 1,
    deliveryDate: 1
};
/**
 * Represents the order select function.
 */
exports.orderSelect = orderselect;
/**
 * Creates an order model with the given database URL, main flag, and lean flag.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection model.
 * @param lean Whether to create the lean connection model.
 */
const createOrderModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(orderSchema);
    if (!stock_universal_server_1.isDbConnected) {
        await (0, stock_universal_server_1.connectDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.orderMain = stock_universal_server_1.mainConnection
            .model('Order', orderSchema);
    }
    if (lean) {
        exports.orderLean = stock_universal_server_1.mainConnectionLean
            .model('Order', orderSchema);
    }
};
exports.createOrderModel = createOrderModel;
//# sourceMappingURL=order.model.js.map