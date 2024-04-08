"use strict";
/**
 * @fileoverview This file contains the Mongoose schema and model for the main notification object.
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationsModel = exports.mainnotificationLean = exports.mainnotificationMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../controllers/database.controller");
/** Mongoose schema for the main notification object. */
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
    expireAt: { type: Number, required: [true, 'cannot be empty.'] },
    notifType: { type: String, required: [true, 'cannot be empty.'] },
    notifInvokerId: { type: String },
    active: { type: Boolean, default: true },
    viewed: [] // strings of ObjectId
}, { timestamps: true });
/** Index for the expiration time of the notification. */
mainnotificationSchema.index({ expireAt: 1 }, { expireAfterSeconds: 2628003 });
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
    if (!database_controller_1.isNotifDbConnected) {
        await (0, database_controller_1.connectNotifDatabase)(dbUrl, dbOptions);
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