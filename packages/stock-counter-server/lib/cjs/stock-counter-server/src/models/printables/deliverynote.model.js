"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeliveryNoteModel = exports.deliveryNoteSelect = exports.deliveryNoteLean = exports.deliveryNoteMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const deliveryNoteSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withUrIdAndCompanySchemaObj,
    invoiceRelated: { type: mongoose_1.Schema.Types.ObjectId, unique: true }
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
    if (!stock_universal_server_1.isDbConnected) {
        await (0, stock_universal_server_1.connectDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.deliveryNoteMain = stock_universal_server_1.mainConnection
            .model('DeliveryNote', deliveryNoteSchema);
    }
    if (lean) {
        exports.deliveryNoteLean = stock_universal_server_1.mainConnectionLean
            .model('DeliveryNote', deliveryNoteSchema);
    }
};
exports.createDeliveryNoteModel = createDeliveryNoteModel;
//# sourceMappingURL=deliverynote.model.js.map