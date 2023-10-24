import { Schema } from 'mongoose';
import { connectNotifDatabase, isNotifDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const notifSettingSchema = new Schema({
    invoices: { type: Boolean, default: true },
    payments: { type: Boolean, default: true },
    orders: { type: Boolean, default: true },
    jobCards: { type: Boolean, default: true },
    users: { type: Boolean, default: true }
}, { timestamps: true });
/** primary selection object
 * for notification settings
 */
const notifSettingselect = {
    invoices: 1,
    payments: 1,
    orders: 1,
    jobCards: 1,
    users: 1
};
/** main connection for notifications setting Operations*/
export let notifSettingMain;
/** lean connection for notifications setting Operations*/
export let notifSettingLean;
/** primary selection object
 * for notification
 */
/** */
export const notifSettingSelect = notifSettingselect;
/** */
export const createNotifStnModel = async (dbUrl, main = true, lean = true) => {
    if (!isNotifDbConnected) {
        await connectNotifDatabase(dbUrl);
    }
    if (main) {
        notifSettingMain = mainConnection.model('NotifSetting', notifSettingSchema);
    }
    if (lean) {
        notifSettingLean = mainConnectionLean.model('NotifSetting', notifSettingSchema);
    }
};
//# sourceMappingURL=notifsetting.model.js.map