"use strict";
/**
 * @fileoverview This file contains the Mongoose schema and model for the main notification object.
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationsModel = exports.mainnotificationLean = exports.mainnotificationMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
/** Mongoose schema for the main notification object. */
const mainnotificationSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.globalSchemaObj,
    actions: [{
            action: { type: String },
            title: { type: String },
            operation: { type: String },
            url: { type: String }
        }],
    userId: { type: mongoose_1.Schema.Types.ObjectId, required: [true, 'cannot be empty.'], index: true },
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
/**
 * Creates the Mongoose models for the main notification object.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main Mongoose model or not.
 * @param lean Whether to create the lean Mongoose model or not.
 */
const createNotificationsModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(mainnotificationSchema);
    if (!stock_universal_server_1.isDbConnected) {
        await (0, stock_universal_server_1.connectDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.mainnotificationMain = stock_universal_server_1.mainConnection
            .model('Mainnotification', mainnotificationSchema);
    }
    if (lean) {
        exports.mainnotificationLean = stock_universal_server_1.mainConnectionLean
            .model('Mainnotification', mainnotificationSchema);
    }
};
exports.createNotificationsModel = createNotificationsModel;
//# sourceMappingURL=mainnotification.model.js.map