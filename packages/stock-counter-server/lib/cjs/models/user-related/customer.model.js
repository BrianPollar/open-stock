"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomerModel = exports.customerSelect = exports.customerLean = exports.customerMain = void 0;
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importStar(require("mongoose"));
const database_controller_1 = require("../../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const customerSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.default.Types.ObjectId, unique: true, required: [true, 'cannot be empty.'], index: true },
    startDate: { type: Date, required: [true, 'cannot be empty.'] },
    endDate: { type: Date, required: [true, 'cannot be empty.'] },
    occupation: { type: String },
    otherAddresses: []
}, { timestamps: true });
// Apply the uniqueValidator plugin to customerSchema.
customerSchema.plugin(uniqueValidator);
/** primary selection object
 * for customer
 */
const customerselect = {
    user: 1,
    salutation: 1,
    endDate: 1,
    occupation: 1,
    otherAddresses: 1
};
/** primary selection object
 * for customer
 */
/** */
exports.customerSelect = customerselect;
/** */
const createCustomerModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
    }
    if (main) {
        exports.customerMain = database_controller_1.mainConnection.model('Customer', customerSchema);
    }
    if (lean) {
        exports.customerLean = database_controller_1.mainConnectionLean.model('Customer', customerSchema);
    }
};
exports.createCustomerModel = createCustomerModel;
//# sourceMappingURL=customer.model.js.map