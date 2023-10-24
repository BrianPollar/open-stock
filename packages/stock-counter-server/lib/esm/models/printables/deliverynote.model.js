import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const deliveryNoteSchema = new Schema({
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
/** main connection for deliveryNotes Operations*/
export let deliveryNoteMain;
/** lean connection for deliveryNotes Operations*/
export let deliveryNoteLean;
/** primary selection object
 * for deliveryNote
 */
/** */
export const deliveryNoteSelect = deliveryNoteselect;
/** */
/**
 * Creates a delivery note model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the main connection or not. Defaults to true.
 * @param lean Whether to create the lean connection or not. Defaults to true.
 */
export const createDeliveryNoteModel = async (dbUrl, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl);
    }
    if (main) {
        deliveryNoteMain = mainConnection.model('DeliveryNote', deliveryNoteSchema);
    }
    if (lean) {
        deliveryNoteLean = mainConnectionLean.model('DeliveryNote', deliveryNoteSchema);
    }
};
//# sourceMappingURL=deliverynote.model.js.map