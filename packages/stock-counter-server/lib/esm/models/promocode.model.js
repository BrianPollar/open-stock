import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const promocodeSchema = new Schema({
    urId: { type: String, unique: true },
    code: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    items: [{ type: String, required: [true, 'cannot be empty.'] }],
    amount: { type: Number, required: [true, 'cannot be empty.'] },
    roomId: { type: String, required: [true, 'cannot be empty.'] },
    state: { type: String, default: 'virgin' },
    expireAt: { type: String }
}, { timestamps: true });
promocodeSchema.index({ expireAt: 1 }, { expireAfterSeconds: 3600 }); // after 1 hour
// Apply the uniqueValidator plugin to promocodeSchema.
promocodeSchema.plugin(uniqueValidator);
/** primary selection object
 * for promocode
 */
const promocodeselect = {
    urId: 1,
    code: 1,
    amount: 1,
    items: 1,
    roomId: 1,
    used: 1
};
/** main connection for promocodes Operations*/
export let promocodeMain;
/** lean connection for promocodes Operations*/
export let promocodeLean;
/** primary selection object
 * for promocode
 */
/** */
export const promocodeSelect = promocodeselect;
/** */
export const createPromocodeModel = async (dbUrl, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl);
    }
    if (main) {
        promocodeMain = mainConnection.model('promocode', promocodeSchema);
    }
    if (lean) {
        promocodeLean = mainConnectionLean.model('promocode', promocodeSchema);
    }
};
//# sourceMappingURL=promocode.model.js.map