"use strict";
/**
 * @fileoverview This file contains the definition of the notification settings model.
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotifStnModel = exports.notifSettingSelect = exports.notifSettingLean = exports.notifSettingMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
/** Schema definition for notification settings */
const notifSettingSchema = new mongoose_1.Schema({
    companyId: { type: mongoose_1.Schema.Types.ObjectId },
    invoices: { type: Boolean, default: true },
    payments: { type: Boolean, default: true },
    orders: { type: Boolean, default: true },
    jobCards: { type: Boolean, default: true },
    users: { type: Boolean, default: true }
}, { timestamps: true, collection: 'notifsettings' });
/** Primary selection object for notification settings */
const notifSettingselect = {
    companyId: 1,
    invoices: 1,
    payments: 1,
    orders: 1,
    jobCards: 1,
    users: 1
};
/**
 * Selects the notifSettingselect constant from the notifSetting model.
 */
exports.notifSettingSelect = notifSettingselect;
/**
 * Creates the notification settings model.
 * @async
 * @param {string} dbUrl - The database URL.
 * @param {boolean} [main=true] - Whether to create the main connection.
 * @param {boolean} [lean=true] - Whether to create the lean connection.
 */
const createNotifStnModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!stock_universal_server_1.isDbConnected) {
        await (0, stock_universal_server_1.connectDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.notifSettingMain = stock_universal_server_1.mainConnection
            .model('NotifSetting', notifSettingSchema);
    }
    if (lean) {
        exports.notifSettingLean = stock_universal_server_1.mainConnectionLean
            .model('NotifSetting', notifSettingSchema);
    }
};
exports.createNotifStnModel = createNotifStnModel;
//# sourceMappingURL=notifsetting.model.js.map