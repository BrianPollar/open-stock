"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderModel = exports.orderSelect = exports.orderLean = exports.orderMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const orderSchema = new mongoose_1.Schema({
    companyId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    paymentRelated: { type: String, unique: true },
    invoiceRelated: { type: String, unique: true },
    deliveryDate: { type: Date, required: [true, 'cannot be empty.'], index: true }
}, { timestamps: true });
// Apply the uniqueValidator plugin to orderSchema.
orderSchema.plugin(uniqueValidator);
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
 * @param main Whether to create the main connection model.
 * @param lean Whether to create the lean connection model.
 */
const createOrderModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
    }
    if (main) {
        exports.orderMain = database_controller_1.mainConnection.model('Order', orderSchema);
    }
    if (lean) {
        exports.orderLean = database_controller_1.mainConnectionLean.model('Order', orderSchema);
    }
};
exports.createOrderModel = createOrderModel;
//# sourceMappingURL=order.model.js.map