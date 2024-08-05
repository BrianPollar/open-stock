"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeliveryNoteModel = exports.deliveryNoteSelect = exports.deliveryNoteLean = exports.deliveryNoteMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const deliveryNoteSchema = new mongoose_1.Schema({
    trackEdit: { type: mongoose_1.Schema.ObjectId },
    trackView: { type: mongoose_1.Schema.ObjectId },
    urId: { type: String },
    companyId: { type: String, required: [true, 'cannot be empty.'], index: true },
    invoiceRelated: { type: String, unique: true }
}, { timestamps: true });
// Apply the uniqueValidator plugin to deliveryNoteSchema.
deliveryNoteSchema.plugin(uniqueValidator);
/** primary selection object
 * for deliveryNote
 */
const deliveryNoteselect = {
    trackEdit: 1,
    trackView: 1,
    urId: 1,
    companyId: 1,
    invoiceRelated: 1
};
/**
 * Selects the delivery note.
 */
exports.deliveryNoteSelect = deliveryNoteselect;
/**
 * Creates a delivery note model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection or not. Defaults to true.
 * @param lean Whether to create the lean connection or not. Defaults to true.
 */
const createDeliveryNoteModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl, dbOptions);
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