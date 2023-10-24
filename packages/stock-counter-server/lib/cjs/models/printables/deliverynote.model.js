"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeliveryNoteModel = exports.deliveryNoteSelect = exports.deliveryNoteLean = exports.deliveryNoteMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const deliveryNoteSchema = new mongoose_1.Schema({
    urId: { type: String, unique: true },
    invoiceRelated: { type: String, unique: true }
}, { timestamps: true });
// Apply the uniqueValidator plugin to deliveryNoteSchema.
deliveryNoteSchema.plugin(uniqueValidator);
/** primary selection object
 * for deliveryNote
 */
const deliveryNoteselect = {
    urId: 1,
    invoiceRelated: 1
};
/** primary selection object
 * for deliveryNote
 */
/** */
exports.deliveryNoteSelect = deliveryNoteselect;
/** */
/**
 * Creates a delivery note model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the main connection or not. Defaults to true.
 * @param lean Whether to create the lean connection or not. Defaults to true.
 */
const createDeliveryNoteModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
    }
    if (main) {
        exports.deliveryNoteMain = database_controller_1.mainConnection.model('DeliveryNote', deliveryNoteSchema);
    }
    if (lean) {
        exports.deliveryNoteLean = database_controller_1.mainConnectionLean.model('DeliveryNote', deliveryNoteSchema);
    }
};
exports.createDeliveryNoteModel = createDeliveryNoteModel;
//# sourceMappingURL=deliverynote.model.js.map