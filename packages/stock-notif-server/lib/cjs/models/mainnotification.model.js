"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationsModel = exports.mainNotifSelect = exports.mainnotificationLean = exports.mainnotificationMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../controllers/database.controller");
const mainnotificationSchema = new mongoose_1.Schema({
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
/** primary selection object
 * for notification
 */
/** */
exports.mainNotifSelect = mainNotifselect;
/** */
const createNotificationsModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isNotifDbConnected) {
        await (0, database_controller_1.connectNotifDatabase)(dbUrl);
    }
    if (main) {
        exports.mainnotificationMain = database_controller_1.mainConnection.model('Mainnotification', mainnotificationSchema);
    }
    if (lean) {
        exports.mainnotificationLean = database_controller_1.mainConnectionLean.model('Mainnotification', mainnotificationSchema);
    }
};
exports.createNotificationsModel = createNotificationsModel;
//# sourceMappingURL=mainnotification.model.js.map