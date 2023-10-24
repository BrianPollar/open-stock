import { Schema } from 'mongoose';
import { connectNotifDatabase, isNotifDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const mainnotificationSchema = new Schema({
    actions: [{
            action: { type: String },
            title: { type: String },
            operation: { type: String },
            url: { type: String }
        }],
    userId: { type: String, required: [true, 'cannot be empty.'], index: true },
    title: { type: String, required: [true, 'cannot be empty.'] },
    body: { type: String, required: [true, 'cannot be empty.'] },
    icon: { type: String },
    // photo: { type: String, required: [true, 'cannot be empty.'] },
    expireAt: { type: Number, required: [true, 'cannot be empty.'] },
    notifType: { type: String, required: [true, 'cannot be empty.'] },
    notifInvokerId: { type: String },
    active: { type: Boolean, default: true },
    viewed: [] // strings of ObjectId
}, { timestamps: true });
mainnotificationSchema.index({ expireAt: 1 }, { expireAfterSeconds: 2628003 }); // TEST THIS
/** primary selection object
 * for notification
 */
const mainNotifselect = {
    actions: 1,
    userId: 1,
    title: 1,
    body: 1,
    icon: 1,
    // photo: 1,
    notifType: 1,
    notifInvokerId: 1,
    viewed: 1,
    active: 1,
    createdAt: 1
};
/** main connection for notifications Operations*/
export let mainnotificationMain;
/** lean connection for notifications Operations*/
export let mainnotificationLean;
/** primary selection object
 * for notification
 */
/** */
export const mainNotifSelect = mainNotifselect;
/** */
export const createNotificationsModel = async (dbUrl, main = true, lean = true) => {
    if (!isNotifDbConnected) {
        await connectNotifDatabase(dbUrl);
    }
    if (main) {
        mainnotificationMain = mainConnection.model('Mainnotification', mainnotificationSchema);
    }
    if (lean) {
        mainnotificationLean = mainConnectionLean.model('Mainnotification', mainnotificationSchema);
    }
};
//# sourceMappingURL=mainnotification.model.js.map