"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotifStnModel = exports.notifSettingSelect = exports.notifSettingLean = exports.notifSettingMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../controllers/database.controller");
const notifSettingSchema = new mongoose_1.Schema({
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
/** primary selection object
 * for notification
 */
/** */
exports.notifSettingSelect = notifSettingselect;
/** */
const createNotifStnModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isNotifDbConnected) {
        await (0, database_controller_1.connectNotifDatabase)(dbUrl);
    }
    if (main) {
        exports.notifSettingMain = database_controller_1.mainConnection.model('NotifSetting', notifSettingSchema);
    }
    if (lean) {
        exports.notifSettingLean = database_controller_1.mainConnectionLean.model('NotifSetting', notifSettingSchema);
    }
};
exports.createNotifStnModel = createNotifStnModel;
//# sourceMappingURL=notifsetting.model.js.map