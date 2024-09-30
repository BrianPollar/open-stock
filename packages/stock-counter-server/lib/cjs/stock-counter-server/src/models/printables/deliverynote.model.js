"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeliveryNoteModel = exports.deliveryNoteSelect = exports.deliveryNoteLean = exports.deliveryNoteMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const database_1 = require("../../utils/database");
const uniqueValidator = require('mongoose-unique-validator');
const deliveryNoteSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withUrIdAndCompanySchemaObj,
    invoiceRelated: { type: String, unique: true }
}, { timestamps: true, collection: 'deliverynotes' });
// Apply the uniqueValidator plugin to deliveryNoteSchema.
deliveryNoteSchema.plugin(uniqueValidator);
deliveryNoteSchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
deliveryNoteSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
/** primary selection object
 * for deliveryNote
 */
const deliveryNoteselect = {
    ...stock_universal_server_1.withUrIdAndCompanySelectObj,
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
    (0, stock_universal_server_1.createExpireDocIndex)(deliveryNoteSchema);
    if (!database_1.isStockDbConnected) {
        await (0, database_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.deliveryNoteMain = database_1.mainConnection
            .model('DeliveryNote', deliveryNoteSchema);
    }
    if (lean) {
        exports.deliveryNoteLean = database_1.mainConnectionLean
            .model('DeliveryNote', deliveryNoteSchema);
    }
};
exports.createDeliveryNoteModel = createDeliveryNoteModel;
//# sourceMappingURL=deliverynote.model.js.map