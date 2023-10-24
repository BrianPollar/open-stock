"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderModel = exports.orderSelect = exports.orderLean = exports.orderMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const orderSchema = new mongoose_1.Schema({
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
    paymentRelated: 1,
    invoiceRelated: 1,
    deliveryDate: 1
};
/** primary selection object
 * for order
 */
/** */
exports.orderSelect = orderselect;
/** */
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