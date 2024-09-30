"use strict";
/**
 * @fileoverview This file contains the Mongoose schema and model for the main notification object.
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationsModel = exports.mainnotificationLean = exports.mainnotificationMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const database_1 = require("../utils/database");
/** Mongoose schema for the main notification object. */
const mainnotificationSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.globalSchemaObj,
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
    expireAt: { type: Number, required: [true, 'cannot be empty.'] },
    notifType: { type: String, required: [true, 'cannot be empty.'] },
    notifInvokerId: { type: String },
    active: { type: Boolean, default: true },
    viewed: [] // strings of ObjectId
}, { timestamps: true, collection: 'mainnotifications' });
mainnotificationSchema.index({ createdAt: -1 });
/** Index for the expiration time of the notification. */
mainnotificationSchema
    .index({ expireAt: 1 }, { expireAfterSeconds: 2628003 });
/** Primary selection object for the main notification object. */
const mainNotifselect = {
    actions: 1,
    userId: 1,
    title: 1,
    body: 1,
    icon: 1,
    notifType: 1,
    notifInvokerId: 1,
    viewed: 1,
    active: 1,
    createdAt: 1
};
/**
 * Creates the Mongoose models for the main notification object.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main Mongoose model or not.
 * @param lean Whether to create the lean Mongoose model or not.
 */
const createNotificationsModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(mainnotificationSchema);
    if (!database_1.isNotifDbConnected) {
        await (0, database_1.connectNotifDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.mainnotificationMain = database_1.mainConnection
            .model('Mainnotification', mainnotificationSchema);
    }
    if (lean) {
        exports.mainnotificationLean = database_1.mainConnectionLean
            .model('Mainnotification', mainnotificationSchema);
    }
};
exports.createNotificationsModel = createNotificationsModel;
//# sourceMappingURL=mainnotification.model.js.map